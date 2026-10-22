#!/usr/bin/env python3
"""Activate the verified release behind the existing loopback-only gateway.

Retain the stopped prior containers for rollback; leave the database intact.
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


def run(args, **kw):
    result = subprocess.run(['docker', *args], capture_output=True, timeout=180, **kw)
    assert result.returncode == 0, 'Docker operation failed; sensitive output suppressed'
    return result.stdout


def main():
    assert os.geteuid() == 0 and socket.gethostname() == 'ncfg-app-01'
    release = json.loads((ROOT / 'migration/release.json').read_text())
    assert json.loads((ROOT / 'migration/offsite-restore-test.json').read_text())['restoreFromOffsitePassed']
    assert time.time() - release['staticHistoryEpoch'] < 5 * 86400
    environments = {}
    for service in ['web', 'cms', 'gateway']:
        assert not run(['ps', '-aq', '--filter', 'name=^' + PREFIX + service + '-previous$']).strip()
        container = json.loads(run(['inspect', PREFIX + service]))[0]
        assert container['Config']['Labels']['io.ncfg.purpose'] == 'cloudru-private-recovery'
        environments[service] = dict(x.split('=', 1) for x in container['Config']['Env'])
        if service != 'gateway':
            assert run(['image', 'inspect', '--format', '{{.Id}}', 'ncfg-cloudru-' + service + ':20261014']).decode().strip() == release['images'][service]
    access = json.loads(Path('/etc/ncfg/storage/media.json').read_text())
    environments['cms'].update(AWS_BUCKET='ncfg-media', AWS_ENDPOINT='https://s3.cloud.ru',
        AWS_REGION='ru-central-1', AWS_PUBLIC_URL='https://global.s3.cloud.ru/ncfg-media-69340acf',
        AWS_STORAGE_CLASS='SINGLE', AWS_USE_BUCKET_POLICY='true',
        AWS_ACCESS_KEY_ID=access['tenantId'] + ':' + access['keyId'], AWS_SECRET_ACCESS_KEY=access['keySecret'])
    environments['web'].update(DEPLOY_ENV='production', STRAPI_WRITE_MODE='disabled', OUTBOUND_MODE='disabled')
    access = None
    spec = importlib.util.spec_from_file_location('stage', ROOT / 'migration/stage-restored-server.py')
    stage = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(stage)
    prior = []
    try:
        for service in ['gateway', 'web', 'cms']:
            run(['stop', '--time', '30', PREFIX + service])
            run(['rename', PREFIX + service, PREFIX + service + '-previous'])
            prior.append(service)
        for service, memory, endpoint in [('cms', '2g', '/_health'), ('web', '1536m', '/api/health')]:
            extra = ['--network', PREFIX + 'application', '--network-alias', service, '--cap-drop', 'ALL']
            if service == 'web':
                extra += ['--mount', 'type=bind,src=/srv/ncfg/next-cache,dst=/app/.next/cache']
            stage.container(service, release['images'][service], environments[service], extra,
                            memory, 'wget --quiet --spider http://127.0.0.1:8080' + endpoint)
            if service == 'cms':
                run(['network', 'connect', PREFIX + 'database', PREFIX + service])
            run(['network', 'connect', PREFIX + 'front', PREFIX + service])
        for attempt in range(60):
            if all(run(['inspect', '--format', '{{.State.Health.Status}}', PREFIX + service]).strip() == b'healthy'
                   for service in ['cms', 'web']):
                break
            time.sleep(2)
        else:
            raise RuntimeError('Application health checks did not pass')
        run(['run', '-d', '--name', PREFIX + 'gateway', '--restart', 'unless-stopped',
             '--label', 'io.ncfg.purpose=cloudru-private-recovery', '--memory', '256m',
             '--security-opt', 'no-new-privileges:true', '--cap-drop', 'ALL',
             '--health-cmd', 'wget --quiet --spider http://127.0.0.1:8080/api/health',
             '--health-interval', '10s', '--health-start-period', '20s',
             '--log-driver', 'local', '--log-opt', 'max-size=10m', '--log-opt', 'max-file=3',
             '--network', PREFIX + 'application', '--network-alias', 'gateway',
             '--publish', '127.0.0.1:8080:8080', '--publish', '127.0.0.1:8081:8081',
             '--mount', 'type=bind,src=/srv/ncfg/staging-media,dst=/rehearsal/media,readonly',
             '--mount', 'type=bind,src=/srv/ncfg/staging-proxy.mjs,dst=/rehearsal/proxy.mjs,readonly',
             '--entrypoint', 'node', release['images']['web'], '/rehearsal/proxy.mjs'])
        run(['network', 'connect', PREFIX + 'front', PREFIX + 'gateway'])
    except Exception:
        # Rename failed new containers, never delete data or overwrite the old config.
        for service in prior:
            if run(['ps', '-aq', '--filter', 'name=^' + PREFIX + service + '$']).strip():
                run(['stop', '--time', '10', PREFIX + service])
                run(['rename', PREFIX + service, PREFIX + service + '-failed-' + str(int(time.time()))])
            run(['rename', PREFIX + service + '-previous', PREFIX + service])
        for service in ['cms', 'web', 'gateway']:
            run(['start', PREFIX + service])
        raise
    print('New web and CMS images are healthy; private gateway active; prior containers retained.', flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        import traceback
        print(json.dumps({'error': type(error).__name__,
                          'line': traceback.extract_tb(error.__traceback__)[-1].lineno,
                          'details': 'sensitive output suppressed'}), file=sys.stderr)
        raise SystemExit(1)
