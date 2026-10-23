#!/usr/bin/env python3
"""Prepare the final runtime privately; enable form effects only at cutover.

Preserve prior containers for rollback and keep all runtime settings on the VM.
"""
import importlib.util
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import time

ROOT = Path('/srv/ncfg')
PREFIX = 'ncfg-cloudru-'
CONFIG = Path('/etc/ncfg/runtime')
CADDY = 'caddy@sha256:d8542f48d34a9cf4e4c11a478865229840e87e4c96ea3f439101f31a5d35f75f'


def run(args, **kwargs):
    result = subprocess.run(['docker', *args], capture_output=True, timeout=180, **kwargs)
    if result.returncode != 0:
        raise RuntimeError('Docker operation failed; sensitive output suppressed')
    return result.stdout


def replace_service(stage, service, image, values, suffix):
    name = PREFIX + service
    old = name + suffix
    if run(['ps', '-aq', '--filter', 'name=^' + old + '$']).strip():
        raise RuntimeError('Rollback container already exists')
    original = run(['inspect', '--format', '{{.Id}}', name]).strip().decode()
    try:
        run(['stop', '--time', '30', name])
        run(['rename', name, old])
        extra = ['--network', PREFIX + 'application', '--network-alias', service, '--cap-drop', 'ALL']
        if service == 'web':
            extra += ['--mount', 'type=bind,src=/srv/ncfg/next-cache,dst=/app/.next/cache']
        stage.container(service, image, values, extra, '2g' if service == 'cms' else '1536m',
                        'wget --quiet --spider http://127.0.0.1:8080' + ('/_health' if service == 'cms' else '/api/health'))
        if service == 'cms':
            run(['network', 'connect', PREFIX + 'database', name])
        run(['network', 'connect', PREFIX + 'front', name])
        for attempt in range(60):
            if run(['inspect', '--format', '{{.State.Health.Status}}', name]).strip() == b'healthy':
                return old
            time.sleep(2)
        raise RuntimeError('Runtime health check failed')
    except Exception:
        # Docker may finish a rename even if the client times out. Inspect the
        # preserved identity before moving anything; never quarantine the original.
        preserved = run(['ps', '-aq', '--no-trunc', '--filter', 'name=^' + old + '$']).strip().decode()
        if preserved == original:
            if run(['ps', '-aq', '--filter', 'name=^' + name + '$']).strip():
                run(['stop', '--time', '10', name])
                run(['rename', name, name + '-failed-' + str(int(time.time()))])
            run(['rename', old, name])
        run(['start', original])
        raise


def main():
    os.umask(0o077)
    assert os.geteuid() == 0 and socket.gethostname() == 'ncfg-app-01'
    assert sys.argv[1:] in [['--prepare'], ['--enable-forms']]
    enable = sys.argv[1] == '--enable-forms'
    forms_report = json.loads((ROOT / 'migration/form-settings-verification.json').read_text())
    assert forms_report['writeTokenMatchesRestoredDatabase'] and forms_report['smtpTlsAuthentication']
    assert json.loads((ROOT / 'backups/last-offsite-success.json').read_text())['databaseRoundtripPassed']
    release = json.loads((ROOT / 'migration/release.json').read_text())
    forms = json.loads((CONFIG / 'forms.json').read_text())
    spec = importlib.util.spec_from_file_location('stage', ROOT / 'migration/stage-restored-server.py')
    stage = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(stage)
    prior = {}
    environments = {}
    for service in (['web'] if enable else ['cms', 'web']):
        values = dict(item.split('=', 1) for item in json.loads(run([
            'inspect', '--format', '{{json .Config.Env}}', PREFIX + service])))
        if service == 'cms':
            values.update(PUBLIC_URL='https://admin.ncfg.ru', ADMIN_URL='/admin', IS_PROXIED='true')
            values.pop('CSP_MEDIA_SRC', None)
        else:
            values.update(forms)
            values.update(NEXT_PUBLIC_SITE_URL='https://ncfg.ru', DEPLOY_ENV='production',
                          STRAPI_WRITE_MODE='enabled' if enable else 'disabled',
                          OUTBOUND_MODE='enabled' if enable else 'disabled')
            old_media = 'https://storage.yandexcloud.net/ncfg-uploads-1770291983'
            values['PORTFOLIO_PRESENTATION_URL'] = values['PORTFOLIO_PRESENTATION_URL'].replace(
                old_media, 'https://global.s3.cloud.ru/ncfg-media-69340acf')
        environments[service] = values
    suffix = '-before-runtime-' + str(int(time.time()))
    try:
        for service, values in environments.items():
            prior[service] = replace_service(stage, service, release['images'][service], values, suffix)
    except Exception:
        for service, old in prior.items():
            run(['stop', '--time', '10', PREFIX + service])
            run(['rename', PREFIX + service, PREFIX + service + '-reverted-' + str(int(time.time()))])
            run(['rename', old, PREFIX + service])
            run(['start', PREFIX + service])
        raise
    for service, values in environments.items():
        path = CONFIG / (service + '.json')
        path.write_text(json.dumps(values))
        os.chmod(path, 0o600)
    if not enable:
        for name in ['caddy-data', 'caddy-config']:
            (ROOT / name).mkdir(mode=0o700, exist_ok=True)
        caddy_env = {'NCFG_SITE_HOST': 'ncfg.ru', 'NCFG_CMS_HOST': 'admin.ncfg.ru',
                     'NCFG_ACME_EMAIL': 'yura.posledov@yandex.ru'}
        env_args = [item for key in caddy_env for item in ['--env', key]]
        mounts = ['--mount', 'type=bind,src=/srv/ncfg/migration/Caddyfile,dst=/etc/caddy/Caddyfile,readonly',
                  '--mount', 'type=bind,src=/srv/ncfg/caddy-data,dst=/data',
                  '--mount', 'type=bind,src=/srv/ncfg/caddy-config,dst=/config']
        run(['run', '--rm', *env_args, *mounts, CADDY, 'caddy', 'validate',
             '--config', '/etc/caddy/Caddyfile'], env={**os.environ, **caddy_env})
        assert not run(['ps', '-aq', '--filter', 'name=^' + PREFIX + 'https$']).strip()
        run(['create', '--name', PREFIX + 'https', '--restart', 'unless-stopped',
             '--label', 'io.ncfg.purpose=cloudru-public-gateway', '--memory', '256m',
             '--security-opt', 'no-new-privileges:true', '--cap-drop', 'ALL', '--cap-add', 'NET_BIND_SERVICE',
             '--log-driver', 'local', '--log-opt', 'max-size=10m', '--log-opt', 'max-file=3',
             '--network', PREFIX + 'application', '--publish', '80:80', '--publish', '443:443',
             *env_args, *mounts, CADDY], env={**os.environ, **caddy_env})
        run(['network', 'connect', PREFIX + 'front', PREFIX + 'https'])
    report = {'productionRuntimePrepared': True, 'formsEnabled': enable,
              'httpsGatewayStarted': False, 'publicDnsChanged': False,
              'previousContainers': prior, 'caddyImage': CADDY}
    (ROOT / 'migration/production-runtime-verification.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        import traceback
        print(json.dumps({'error': type(error).__name__,
                          'line': traceback.extract_tb(error.__traceback__)[-1].lineno,
                          'details': 'sensitive output suppressed'}), file=sys.stderr)
        raise SystemExit(1)
