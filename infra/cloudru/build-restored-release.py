#!/usr/bin/env python3
"""Build the isolated migration release on the provisioned VM, using a read token in memory."""
import hashlib
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tarfile
import time

ROOT = Path('/srv/ncfg/migration')


def run(args):
    result = subprocess.run(args, capture_output=True, timeout=120)
    assert result.returncode == 0, 'Command failed; details suppressed'
    return result.stdout


def main():
    os.umask(0o077)
    assert os.geteuid() == 0 and socket.gethostname() == 'ncfg-app-01'
    provenance = json.loads((ROOT / 'build-provenance.json').read_text())
    archive = ROOT / 'cloudru-build-context.tar.gz'
    assert hashlib.sha256(archive.read_bytes()).hexdigest() == provenance['contextSha256']
    source = ROOT / 'production-source'
    source.mkdir(exist_ok=True)
    with tarfile.open(archive) as tar:
        tar.extractall(source, filter='data')
    # Python's data filter intentionally ignores archive directory modes. This
    # source contains no secrets and must remain readable by non-root image users.
    for directory, _, _ in os.walk(source):
        os.chmod(directory, 0o755)
    for name, digest in provenance['migrationFiles'].items():
        assert hashlib.sha256((source / name).read_bytes()).hexdigest() == digest
    original = json.loads((ROOT / 'images/blobs/sha256' / provenance['cmsBaseImage'].split(':')[1]).read_bytes())
    imported = json.loads(run(['docker', 'image', 'inspect', 'ncfg-recovery-cms:20261014']))[0]
    # Docker's containerd store reports a manifest ID; the source records a config digest.
    assert imported['RootFS']['Layers'] == original['rootfs']['diff_ids']
    assert imported['Config'] == original['config']
    imported = original = None
    history = source / 'docker/web/static-history'
    (history / 'static').mkdir(parents=True, exist_ok=True)
    run(['docker', 'cp', 'ncfg-cloudru-web:/app/.next/static/.', str(history / 'static')])
    previous = subprocess.run(['docker', 'cp', 'ncfg-cloudru-web:/app/.next/static-history.json', str(history / 'manifest.json')], capture_output=True)
    assert previous.returncode == 0 or b'Could not find the file' in previous.stderr
    inherited = json.loads(run(['docker', 'inspect', '--format', '{{json .Config.Env}}', 'ncfg-cloudru-web']))
    token = next(x.split('=', 1)[1] for x in inherited if x.startswith('STRAPI_API_TOKEN='))
    inherited = None
    network = json.loads(run(['docker', 'inspect', '--format', '{{json .NetworkSettings.Networks}}', 'ncfg-cloudru-cms']))
    host = network['ncfg-cloudru-application']['IPAddress']
    epoch = str(int(time.time()))
    env = {**os.environ, 'STRAPI_API_TOKEN': token, 'DOCKER_BUILDKIT': '1'}
    web = ['docker', 'build', '--network', 'host', '--progress', 'plain',
           '--secret', 'id=STRAPI_API_TOKEN,env=STRAPI_API_TOKEN',
           '--build-arg', 'STRAPI_URL=http://' + host + ':8080',
           '--build-arg', 'NEXT_PUBLIC_SITE_URL=https://ncfg.ru',
           '--build-arg', 'NEXT_PUBLIC_YANDEX_METRIKA_ID=108387180',
           '--build-arg', 'NEXT_PUBLIC_RELEASE_ID=cloudru-20261014-' + provenance['sourceCommit'][:12],
           '--build-arg', 'DEPLOY_ENV=production', '--build-arg', 'STATIC_HISTORY_EPOCH=' + epoch,
           '-t', 'ncfg-cloudru-web:20261014', '-f', 'docker/web/Dockerfile', '.']
    cms = ['docker', 'build', '--progress', 'plain', '-t', 'ncfg-cloudru-cms:20261014',
           '-f', 'docker/cms/Dockerfile.cloudru', '.']
    for service, args in [('web', web), ('cms', cms)]:
        print('Building ' + service + ' from production commit ' + provenance['sourceCommit'] + '.', flush=True)
        with (ROOT / ('build-' + service + '.log')).open('w') as log:
            child = subprocess.Popen(args, cwd=source, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            for line in child.stdout:
                log.write(line.replace(token, '[REDACTED]'))
                log.flush()
            assert child.wait() == 0, service + ' build failed; see redacted build log'
        print(service + ' image built.', flush=True)
    report = {'sourceCommit': provenance['sourceCommit'], 'staticHistoryEpoch': int(epoch),
              'publicCutover': False, 'images': {service: run(['docker', 'image', 'inspect', '--format', '{{.Id}}',
                  'ncfg-cloudru-' + service + ':20261014']).decode().strip() for service in ['web', 'cms']}}
    (ROOT / 'release.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report), flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        import traceback
        print(json.dumps({'error': type(error).__name__, 'line': traceback.extract_tb(error.__traceback__)[-1].lineno,
                          'details': 'build stopped; sensitive output suppressed'}), file=sys.stderr)
        raise SystemExit(1)
