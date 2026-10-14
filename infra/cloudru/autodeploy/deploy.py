#!/usr/bin/env python3
"""Pull an approved main commit; build locally and preserve containers on failure.

Installed outside the checkout: repository commits cannot replace this supervisor.
No GitHub credential, inbound webhook or self-hosted Actions runner is required.
"""
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import sys
import tarfile
import time
import urllib.request

ROOT = Path('/srv/ncfg/autodeploy')
RUNTIME = Path('/etc/ncfg/runtime')
REPOSITORY = 'https://github.com/UnidentifiedRaccoon/ncfg.git'
PREFIX = 'ncfg-cloudru-'
BUILDER = 'ncfg-autodeploy'
GIT_ENV = {**os.environ, 'GIT_TERMINAL_PROMPT': '0', 'GIT_CONFIG_GLOBAL': '/dev/null',
           'GIT_CONFIG_SYSTEM': '/dev/null'}


def run(args, **kwargs):
    result = subprocess.run(args, capture_output=True, timeout=kwargs.pop('timeout', 180), **kwargs)
    if result.returncode:
        raise RuntimeError('Command failed: ' + args[0] + ' (output suppressed)')
    return result.stdout


def docker(*args, **kwargs):
    return run(['docker', *args], **kwargs)


def write_json(path, value):
    temporary = path.with_suffix('.pending')
    temporary.write_text(json.dumps(value, indent=2) + '\n')
    temporary.chmod(0o600)
    temporary.replace(path)


def approved_revision(output):
    refs = dict(line.split()[::-1] for line in output.splitlines() if line.strip())
    main = refs.get('refs/heads/main')
    requested = refs.get('refs/heads/cloudru-production')
    if requested != main or not re.fullmatch('[0-9a-f]{40}', requested or ''):
        return None
    return requested


def desired():
    return approved_revision(run(['git', 'ls-remote', REPOSITORY,
                                 'refs/heads/main', 'refs/heads/cloudru-production'],
                                env=GIT_ENV).decode())


def extract_source(archive, destination):
    with tarfile.open(archive) as bundle:
        members = bundle.getmembers()
        if sum(m.size for m in members) > 400 * 1024 * 1024:
            raise RuntimeError('Source archive exceeds size limit')
        for member in members:
            parts = Path(member.name).parts
            if Path(member.name).is_absolute() or '..' in parts or not (member.isfile() or member.isdir()):
                raise RuntimeError('Unsafe source archive member')
        bundle.extractall(destination, filter='data')
    for directory, _, _ in os.walk(destination):
        os.chmod(directory, 0o755)


def checkout(revision):
    git = ROOT / 'git'
    if not git.exists():
        run(['git', 'init', '--bare', str(git)], env=GIT_ENV)
    run(['git', '-C', str(git), 'fetch', '--depth=1', REPOSITORY, revision], env=GIT_ENV)
    actual = run(['git', '-C', str(git), 'rev-parse', 'FETCH_HEAD'], env=GIT_ENV).decode().strip()
    if actual != revision:
        raise RuntimeError('Fetched revision does not match request')
    source = ROOT / 'releases' / revision
    if source.exists():
        source.rename(source.with_name(revision + '-retry-' + str(time.time_ns())))
    source.mkdir(parents=True, exist_ok=False)
    archive = source / 'source.tar'
    run(['git', '-C', str(git), 'archive', '--format=tar', '--output=' + str(archive), revision], env=GIT_ENV)
    extract_source(archive, source)
    archive.unlink()
    cms_tree = run(['git', '-C', str(git), 'ls-tree', revision, 'apps/cms', 'docker/cms'], env=GIT_ENV)
    return source, hashlib.sha256(cms_tree).hexdigest()


def build_image(source, service, revision, values, epoch):
    tag = 'ncfg-autodeploy-' + service + ':' + revision
    args = ['docker', 'buildx', 'build', '--builder', BUILDER, '--load', '--progress', 'plain',
            '--tag', tag, '--label', 'io.ncfg.autodeploy=true',
            '--label', 'org.opencontainers.image.revision=' + revision,
            '-f', 'docker/' + service + '/Dockerfile']
    environment = {**os.environ, 'DOCKER_BUILDKIT': '1'}
    masked = []
    if service == 'web':
        environment['STRAPI_API_TOKEN'] = values['STRAPI_API_TOKEN']
        masked.append(values['STRAPI_API_TOKEN'])
        args += ['--secret', 'id=STRAPI_API_TOKEN,env=STRAPI_API_TOKEN']
        build_values = {'STRAPI_URL': 'https://admin.ncfg.ru',
                        'NEXT_PUBLIC_SITE_URL': 'https://ncfg.ru',
                        'NEXT_PUBLIC_YANDEX_METRIKA_ID': '108387180',
                        'NEXT_PUBLIC_RELEASE_ID': revision, 'DEPLOY_ENV': 'production',
                        'STATIC_HISTORY_EPOCH': str(epoch),
                        'PORTFOLIO_PRESENTATION_URL': values.get('PORTFOLIO_PRESENTATION_URL', '')}
        for key, value in build_values.items():
            args += ['--build-arg', key + '=' + value]
    else:
        # Strapi validates config while building; these are nonfunctional placeholders.
        placeholders = {'DATABASE_HOST': '127.0.0.1', 'DATABASE_PORT': '5432',
                        'DATABASE_NAME': 'strapi', 'DATABASE_USERNAME': 'strapi',
                        'DATABASE_PASSWORD': 'build-only', 'APP_KEYS': 'build-only-a,build-only-b',
                        'AWS_BUCKET': 'build-only', 'AWS_REGION': 'ru-central-1',
                        'AWS_ENDPOINT': 'https://s3.invalid'}
        for key in ['API_TOKEN_SALT', 'ADMIN_JWT_SECRET', 'JWT_SECRET', 'TRANSFER_TOKEN_SALT',
                    'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']:
            placeholders[key] = 'build-only-not-a-runtime-secret'
        environment.update(placeholders)
        for key in placeholders:
            args += ['--secret', 'id=' + key + ',env=' + key]
    args.append('.')
    log_path = ROOT / (service + '-build.log')
    with log_path.open('w') as log:
        process = subprocess.Popen(args, cwd=source, env=environment,
                                   stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        for line in process.stdout:
            for secret in masked:
                line = line.replace(secret, '[REDACTED]')
            log.write(line)
            log.flush()
        if process.wait():
            raise RuntimeError(service + ' build failed; previous release remains active')
    return docker('image', 'inspect', '--format', '{{.Id}}', tag).decode().strip()


def start_container(service, name, image, values):
    args = ['run', '-d', '--name', name, '--restart', 'unless-stopped',
            '--label', 'io.ncfg.autodeploy=true', '--memory', '2g' if service == 'cms' else '1536m',
            '--security-opt', 'no-new-privileges:true', '--cap-drop', 'ALL',
            '--log-driver', 'local', '--log-opt', 'max-size=10m', '--log-opt', 'max-file=3',
            '--network', PREFIX + 'application', '--network-alias', service,
            '--health-cmd', 'wget --quiet --spider http://127.0.0.1:8080' +
            ('/_health' if service == 'cms' else '/api/health'),
            '--health-interval', '5s', '--health-start-period', '60s', '--health-retries', '12']
    if service == 'web':
        args += ['--mount', 'type=bind,src=/srv/ncfg/next-cache,dst=/app/.next/cache']
    for key in values:
        args += ['--env', key]
    # Docker receives values in its process environment, never in command arguments.
    docker(*args, image, env={**os.environ, **values})
    docker('network', 'connect', PREFIX + 'front', name)
    if service == 'cms':
        docker('network', 'connect', PREFIX + 'database', name)


def healthy(name):
    for _ in range(60):
        if docker('inspect', '--format', '{{.State.Health.Status}}', name).strip() == b'healthy':
            return
        time.sleep(3)
    raise RuntimeError('Container readiness failed')


def restore_container(service, backup):
    name = PREFIX + service
    backup_exists = docker('ps', '-aq', '--filter', 'name=^' + backup + '$').strip()
    if not backup_exists:
        # A crash before rename left the original container in place.
        docker('start', name)
        healthy(name)
        return
    if docker('ps', '-aq', '--filter', 'name=^' + name + '$').strip():
        docker('stop', '--time', '20', name)
        docker('rename', name, name + '-failed-' + str(time.time_ns()))
    docker('rename', backup, name)
    docker('start', name)
    healthy(name)


def recover_transaction():
    journal = ROOT / 'transaction.json'
    if not journal.exists():
        return
    transaction = json.loads(journal.read_text())
    active = ROOT / 'active.json'
    if active.exists() and json.loads(active.read_text()).get('revision') == transaction.get('revision'):
        journal.unlink()  # Public checks and the atomic commit completed before a crash.
        return
    for service, backup in reversed(list(transaction['previous'].items())):
        restore_container(service, backup)
    journal.unlink()
    print('Interrupted deployment rolled back to prior containers', flush=True)


def public_check(revision):
    for _ in range(20):
        try:
            request = urllib.request.Request('https://ncfg.ru/deployment.json?t=' + str(time.time_ns()),
                                             headers={'Cache-Control': 'no-cache'})
            with urllib.request.urlopen(request, timeout=15) as response:
                if json.load(response)['revision'] != revision:
                    raise RuntimeError('Wrong public release')
            for url in ['https://ncfg.ru/api/health', 'https://ncfg.ru/', 'https://admin.ncfg.ru/_health']:
                with urllib.request.urlopen(url, timeout=15) as response:
                    if response.status not in (200, 204):
                        raise RuntimeError('Public readiness failed')
            return
        except Exception:
            time.sleep(3)
    raise RuntimeError('Public release check failed')


def activate(revision, images, environments):
    transaction = {'revision': revision, 'previous': {}}
    write_json(ROOT / 'transaction.json', transaction)
    try:
        for service in ['cms', 'web']:
            if service not in images:
                continue
            name = PREFIX + service
            backup = name + '-release-' + str(time.time_ns())
            transaction['previous'][service] = backup
            write_json(ROOT / 'transaction.json', transaction)
            docker('stop', '--time', '30', name)
            docker('rename', name, backup)
            start_container(service, name, images[service], environments[service])
            healthy(name)
        public_check(revision)
        return transaction
    except Exception:
        recover_transaction()
        raise


def deploy(revision, active):
    source, cms_tree = checkout(revision)
    environments = {service: json.loads((RUNTIME / (service + '.json')).read_text()) for service in ['web', 'cms']}
    epoch = int(time.time())
    history = source / 'docker/web/static-history'
    (history / 'static').mkdir(parents=True, exist_ok=True)
    docker('cp', PREFIX + 'web:/app/.next/static/.', str(history / 'static'))
    docker('cp', PREFIX + 'web:/app/.next/static-history.json', str(history / 'manifest.json'))
    # Public release identity lets the hosted GitHub job verify actual deployment.
    public = source / 'apps/web/public/deployment.json'
    public.write_text(json.dumps({'revision': revision, 'provider': 'cloudru', 'builtAt': epoch}) + '\n')
    public.chmod(0o644)
    images = {}
    if active.get('cmsTree') != cms_tree:
        print('Building CMS', flush=True)
        images['cms'] = build_image(source, 'cms', revision, {}, epoch)
    print('Building website', flush=True)
    images['web'] = build_image(source, 'web', revision, environments['web'], epoch)
    if desired() != revision:
        print('Newer main detected; built release will not be activated', flush=True)
        return
    if 'cms' in images:
        run(['systemctl', 'start', 'ncfg-running-backup.service'], timeout=1200)
        backup = json.loads(Path('/srv/ncfg/backups/last-offsite-success.json').read_text())
        if not backup['databaseRoundtripPassed']:
            raise RuntimeError('Pre-deployment backup not verified')
    transaction = activate(revision, images, environments)
    next_state = {'revision': revision, 'cmsTree': cms_tree, 'images': {**active.get('images', {}), **images},
                  'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  'previousContainers': transaction['previous']}
    write_json(ROOT / 'active.json', next_state)
    (ROOT / 'transaction.json').unlink()
    print('Deployed ' + revision, flush=True)


def main():
    os.umask(0o077)
    if os.geteuid() != 0 or socket.gethostname() != 'ncfg-app-01' or not os.path.ismount('/srv/ncfg'):
        raise RuntimeError('Unexpected deployment host')
    ROOT.mkdir(mode=0o700, exist_ok=True)
    with (ROOT / 'deploy.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        recover_transaction()
        revision = desired()
        active_file = ROOT / 'active.json'
        active = json.loads(active_file.read_text()) if active_file.exists() else {}
        if not revision or revision == active.get('revision'):
            return
        failure = ROOT / 'failed.json'
        if failure.exists() and json.loads(failure.read_text()).get('revision') == revision:
            return  # Retry only after an operator clears this recorded failure.
        if shutil.disk_usage('/var/lib/docker').free < 4 * 1024**3:
            raise RuntimeError('Less than 4 GiB free for Docker; refusing deployment')
        try:
            deploy(revision, active)
        except Exception as error:
            write_json(failure, {'revision': revision, 'error': type(error).__name__,
                                'failedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()})
            raise


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Do not expose command output, credentials, private CMS data or config.
        print('Autodeploy failed: ' + type(error).__name__ + '; see root-only state/build logs', file=sys.stderr)
        raise SystemExit(1)
