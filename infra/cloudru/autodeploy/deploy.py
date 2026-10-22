#!/usr/bin/env python3
"""Pull an approved main commit; build locally and preserve containers on failure.

Installed outside the checkout: repository commits cannot replace this supervisor.
No GitHub credential, inbound webhook or self-hosted Actions runner is required.
"""
import datetime
import fcntl
import hashlib
import ipaddress
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

ROOT = Path('/srv/ncfg/autodeploy')
RUNTIME = Path('/etc/ncfg/runtime')
REPOSITORY = 'https://github.com/UnidentifiedRaccoon/ncfg.git'
PREFIX = 'ncfg-cloudru-'
BUILDER = 'ncfg-autodeploy'
PUBLIC_STATUS = Path('/srv/ncfg/caddy-config/ncfg-public-status/deployment-status.json')
MIN_DOCKER_FREE_BYTES = 4 * 1024**3
STAGES = {'preflight', 'cleanup', 'checkout', 'build_cms', 'build_web', 'backup',
          'activate', 'verify', 'complete', 'recovery'}
ERROR_CODES = {'insufficient_disk', 'cache_cleanup_failed', 'retention_cleanup_failed', 'deployment_failed'}
ROLLBACK_VERSIONS = 2
UNUSED_IMAGE_GRACE_SECONDS = 24 * 60 * 60
GIT_ENV = {**os.environ, 'GIT_TERMINAL_PROMPT': '0', 'GIT_CONFIG_GLOBAL': '/dev/null',
           'GIT_CONFIG_SYSTEM': '/dev/null'}


def run(args, **kwargs):
    result = subprocess.run(args, capture_output=True, timeout=kwargs.pop('timeout', 180), **kwargs)
    if result.returncode:
        raise RuntimeError('Command failed: ' + args[0] + ' (output suppressed)')
    return result.stdout


def docker(*args, **kwargs):
    return run(['docker', *args], **kwargs)


def write_json(path, value, mode=0o600):
    temporary = path.with_suffix('.pending')
    temporary.write_text(json.dumps(value, indent=2) + '\n')
    temporary.chmod(mode)
    temporary.replace(path)


class DeploymentFailure(RuntimeError):
    def __init__(self, code, **details):
        super().__init__(code)
        self.code = code
        self.details = details


def retention_inventory():
    # Project only safe metadata: never load container environments or image config.
    container_ids = docker('ps', '-aq', '--no-trunc').decode().split()
    container_format = ('{"id":{{json .Id}},"name":{{json .Name}},"image":{{json .Image}},'
                        '"status":{{json .State.Status}},"finished":{{json .State.FinishedAt}},'
                        '"health":{{with index .State "Health"}}{{json .Status}}{{else}}null{{end}},'
                        '"managed":{{json (index .Config.Labels "io.ncfg.autodeploy")}}}')
    containers = [json.loads(line) for line in docker(
        'inspect', '--format', container_format, *container_ids).decode().splitlines()] if container_ids else []
    image_ids = sorted(set(docker('image', 'ls', '-aq', '--no-trunc', '--filter',
                                 'label=io.ncfg.autodeploy=true').decode().split()))
    image_format = ('{"id":{{json .Id}},"tags":{{json .RepoTags}},"created":{{json .Created}},'
                    '"managed":{{json (index .Config.Labels "io.ncfg.autodeploy")}},'
                    '"revision":{{json (index .Config.Labels "org.opencontainers.image.revision")}}}')
    images = [json.loads(line) for line in docker(
        'image', 'inspect', '--format', image_format, *image_ids).decode().splitlines()] if image_ids else []
    return containers, images


def retention_timestamp(value):
    parsed = datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))
    if parsed.tzinfo is None:
        raise ValueError('Retention timestamp must have a timezone')
    return parsed.timestamp()


def retention_plan(active, containers, images, now, transaction_exists=False):
    """Pure deletion plan; unknown state and unhealthy services forbid cleanup."""
    plan = {'containers': [], 'images': [], 'keepPreviousContainers': [], 'skipped': None}
    if transaction_exists:
        plan['skipped'] = 'unfinished_transaction'
        return plan
    if (not isinstance(active, dict) or not isinstance(active.get('images'), dict)
            or not re.fullmatch('[0-9a-f]{40}', str(active.get('revision', '')))
            or any(not re.fullmatch('sha256:[0-9a-f]{64}', str(active['images'].get(service, '')))
                   for service in ('web', 'cms'))):
        plan['skipped'] = 'unknown_active_state'
        return plan
    for service in ('web', 'cms'):
        current = [item for item in containers if item['name'] == '/' + PREFIX + service]
        if len(current) != 1 or current[0]['image'] != active['images'][service]:
            plan['skipped'] = 'active_image_mismatch'
            return plan
        if current[0]['status'] != 'running' or current[0]['health'] != 'healthy':
            plan['skipped'] = 'active_service_unhealthy'
            return plan
    previous = active.get('previousContainers', {})
    if not isinstance(previous, dict) or not all(isinstance(name, str) for name in previous.values()):
        plan['skipped'] = 'unknown_previous_state'
        return plan
    protected_names = set(previous.values())
    for service in ('web', 'cms'):
        prior = [item for item in containers if item['status'] == 'exited'
                 and re.fullmatch('/' + PREFIX + service + '-release-[0-9]+', item['name'])]
        prior.sort(key=lambda item: retention_timestamp(item['finished']), reverse=True)
        protected_names.update(item['name'].lstrip('/') for item in prior[:ROLLBACK_VERSIONS])
    plan['keepPreviousContainers'] = sorted(protected_names)
    cutoff = now - UNUSED_IMAGE_GRACE_SECONDS
    for item in containers:
        if (item['managed'] != 'true' or item['status'] != 'exited'
                or item['name'].lstrip('/') in protected_names):
            continue
        is_release = re.fullmatch('/' + PREFIX + '(web|cms)-release-[0-9]+', item['name'])
        is_failed = re.fullmatch('/' + PREFIX + '(web|cms)-failed-[0-9]+', item['name'])
        if is_release or (is_failed and retention_timestamp(item['finished']) <= cutoff):
            plan['containers'].append(item['id'])
    removed = set(plan['containers'])
    protected_images = set(active['images'].values()) | {
        item['image'] for item in containers if item['id'] not in removed}
    for item in images:
        tags, revision = item['tags'], item['revision']
        if (item.get('managed') != 'true' or item['id'] in protected_images or not tags or not isinstance(revision, str)
                or not re.fullmatch('[0-9a-f]{40}', revision)):
            continue
        if not all(re.fullmatch('ncfg-autodeploy-(web|cms):' + revision, tag) for tag in tags):
            continue  # An extra operator tag makes this image ineligible.
        if retention_timestamp(item['created']) <= cutoff:
            plan['images'].append(item['id'])
    return plan


def current_retention_plan():
    active_file = ROOT / 'active.json'
    active = json.loads(active_file.read_text()) if active_file.exists() else {}
    containers, images = retention_inventory()
    return retention_plan(active, containers, images, time.time(), (ROOT / 'transaction.json').exists())


def cleanup_old_releases():
    # Call only while holding deploy.lock. Replan before every removal to protect
    # changes made by operators outside the supervisor. Docker's own non-force
    # deletion also rejects running containers and images with container references.
    planned = current_retention_plan()
    removed = {'containers': 0, 'images': 0, 'skipped': planned['skipped']}
    if planned['skipped']:
        print('Release retention skipped: ' + planned['skipped'], flush=True)
        return removed
    for kind, command in (('containers', ('container', 'rm')), ('images', ('image', 'rm'))):
        for identifier in planned[kind]:
            fresh = current_retention_plan()
            if fresh['skipped']:
                removed['skipped'] = fresh['skipped']
                return removed
            if identifier not in fresh[kind]:
                continue
            if kind == 'images':
                actual_containers, _ = retention_inventory()
                if any(item['image'] == identifier for item in actual_containers):
                    continue  # A newly planned container may not have been removed.
            docker(*command, identifier)  # Never --force, --volumes or a global prune.
            removed[kind] += 1
    if removed['containers'] or removed['images']:
        print('Release retention removed ' + json.dumps(removed, sort_keys=True), flush=True)
    return removed


def maintain_release_retention():
    try:
        cleanup_old_releases()
    except Exception:
        # The verified release stays successful. The idle timer retries, and a
        # subsequent release reports a preflight retention failure to Actions.
        print('Release retention maintenance failed; will retry on the next timer tick', flush=True)


def publish_status(revision, state, stage, **details):
    """Public data is deliberately constructed, never copied from exceptions/state."""
    if not re.fullmatch('[0-9a-f]{40}', revision) or stage not in STAGES:
        raise ValueError('Invalid deployment status identity')
    if state not in {'running', 'failed', 'succeeded', 'superseded'}:
        raise ValueError('Invalid deployment status state')
    value = {'schema': 1, 'revision': revision, 'state': state, 'stage': stage,
             'updatedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    if details.get('code') in ERROR_CODES:
        value['code'] = details['code']
    for field in ('freeBytes', 'requiredBytes', 'freeBeforeBytes'):
        if type(details.get(field)) is int and details[field] >= 0:
            value[field] = details[field]
    write_json(PUBLIC_STATUS, value, mode=0o644)


def prepare_disk(revision):
    before = shutil.disk_usage('/var/lib/docker').free
    publish_status(revision, 'running', 'cleanup', freeBeforeBytes=before,
                   requiredBytes=MIN_DOCKER_FREE_BYTES)
    try:
        # Explicitly target the legacy/default cache, never the named builder,
        # release images, stopped rollback containers, volumes or application data.
        docker('buildx', 'prune', '--builder', 'default', '--filter', 'until=24h',
               '--reserved-space', '1GB', '--force', timeout=600)
    except Exception as error:
        raise DeploymentFailure('cache_cleanup_failed') from error
    free = shutil.disk_usage('/var/lib/docker').free
    print(f'Docker disk after old cache cleanup: {free} bytes free; '
          f'{MIN_DOCKER_FREE_BYTES} required', flush=True)
    if free < MIN_DOCKER_FREE_BYTES:
        raise DeploymentFailure('insufficient_disk', freeBytes=free,
                                requiredBytes=MIN_DOCKER_FREE_BYTES, freeBeforeBytes=before)
    publish_status(revision, 'running', 'preflight', freeBytes=free,
                   requiredBytes=MIN_DOCKER_FREE_BYTES, freeBeforeBytes=before)


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


def build_cms_url():
    networks = json.loads(docker('inspect', '--format', '{{json .NetworkSettings.Networks}}', PREFIX + 'cms'))
    address = ipaddress.ip_address(networks[PREFIX + 'application']['IPAddress'])
    if address.version != 4 or not address.is_private:
        raise RuntimeError('CMS must have a private application-network address')
    return 'http://' + str(address) + ':8080'


def build_image(source, service, revision, values, epoch):
    # Cloud.ru does not route this VM back through its own public IP. BuildKit's
    # RUN namespace also cannot resolve Docker aliases, so use the current IP.
    builder_container = 'buildx_buildkit_' + BUILDER + '0'
    networks = json.loads(docker('inspect', '--format', '{{json .NetworkSettings.Networks}}', builder_container))
    if PREFIX + 'application' not in networks:
        docker('network', 'connect', PREFIX + 'application', builder_container)
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
        build_values = {'STRAPI_URL': build_cms_url(),
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


def gateway_request(domain, path):
    # Keep normal hostname/certificate validation, but avoid public-IP hairpin
    # routing. GitHub Actions separately checks the real public DNS route.
    response = run(['curl', '--fail', '--silent', '--show-error', '--max-time', '15',
                    '--resolve', domain + ':443:127.0.0.1', '--write-out', '\n%{http_code}',
                    'https://' + domain + path])
    body, status = response.rsplit(b'\n', 1)
    if status not in (b'200', b'204'):
        raise RuntimeError('HTTPS gateway readiness failed')
    return body


def public_check(revision):
    for _ in range(20):
        try:
            current = json.loads(gateway_request('ncfg.ru', '/deployment.json?t=' + str(time.time_ns())))
            if current['revision'] != revision:
                raise RuntimeError('Wrong public release')
            for domain, path in [('ncfg.ru', '/api/health'), ('ncfg.ru', '/'), ('admin.ncfg.ru', '/_health')]:
                gateway_request(domain, path)
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
        publish_status(revision, 'running', 'verify')
        public_check(revision)
        return transaction
    except Exception:
        recover_transaction()
        raise


def deploy(revision, active):
    publish_status(revision, 'running', 'checkout')
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
        publish_status(revision, 'running', 'build_cms')
        print('Building CMS', flush=True)
        images['cms'] = build_image(source, 'cms', revision, {}, epoch)
    print('Building website', flush=True)
    publish_status(revision, 'running', 'build_web')
    images['web'] = build_image(source, 'web', revision, environments['web'], epoch)
    if desired() != revision:
        publish_status(revision, 'superseded', 'build_web')
        print('Newer main detected; built release will not be activated', flush=True)
        return
    if 'cms' in images:
        publish_status(revision, 'running', 'backup')
        run(['systemctl', 'start', 'ncfg-running-backup.service'], timeout=1200)
        backup = json.loads(Path('/srv/ncfg/backups/last-offsite-success.json').read_text())
        if not backup['databaseRoundtripPassed']:
            raise RuntimeError('Pre-deployment backup not verified')
    publish_status(revision, 'running', 'activate')
    transaction = activate(revision, images, environments)
    next_state = {'revision': revision, 'cmsTree': cms_tree, 'images': {**active.get('images', {}), **images},
                  'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  'previousContainers': {**active.get('previousContainers', {}), **transaction['previous']}}
    write_json(ROOT / 'active.json', next_state)
    (ROOT / 'transaction.json').unlink()
    publish_status(revision, 'succeeded', 'complete')
    print('Deployed ' + revision, flush=True)


def main(retention_mode=None):
    os.umask(0o077)
    if os.geteuid() != 0 or socket.gethostname() != 'ncfg-app-01' or not os.path.ismount('/srv/ncfg'):
        raise RuntimeError('Unexpected deployment host')
    ROOT.mkdir(mode=0o700, exist_ok=True)
    with (ROOT / 'deploy.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if retention_mode:
            result = current_retention_plan() if retention_mode == 'plan' else cleanup_old_releases()
            print(json.dumps(result, indent=2), flush=True)
            return
        recover_transaction()
        revision = desired()
        active_file = ROOT / 'active.json'
        active = json.loads(active_file.read_text()) if active_file.exists() else {}
        if not revision:
            return
        if revision == active.get('revision'):
            maintain_release_retention()
            publish_status(revision, 'succeeded', 'complete')
            return
        failure = ROOT / 'failed.json'
        if failure.exists() and json.loads(failure.read_text()).get('revision') == revision:
            recorded = json.loads(failure.read_text())
            publish_status(revision, 'failed', recorded.get('stage', 'preflight'),
                           **recorded.get('details', {}), code=recorded.get('code', 'deployment_failed'))
            return  # Retry only after an operator clears this recorded failure.
        try:
            publish_status(revision, 'running', 'preflight')
            try:
                cleanup_old_releases()
            except Exception as error:
                raise DeploymentFailure('retention_cleanup_failed') from error
            prepare_disk(revision)
            deploy(revision, active)
            maintain_release_retention()
        except Exception as error:
            stage = 'preflight'
            try:
                status = json.loads(PUBLIC_STATUS.read_text())
                if (isinstance(status, dict) and status.get('revision') == revision
                        and isinstance(status.get('stage'), str) and status['stage'] in STAGES):
                    stage = status['stage']
            except (OSError, ValueError):
                pass  # A damaged status file must not hide the original failure.
            code = error.code if isinstance(error, DeploymentFailure) else 'deployment_failed'
            details = error.details if isinstance(error, DeploymentFailure) else {}
            write_json(failure, {'revision': revision, 'error': type(error).__name__,
                                'stage': stage, 'code': code, 'details': details,
                                'failedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()})
            publish_status(revision, 'failed', stage, code=code, **details)
            print(f'Deployment failed at {stage}: {code}', flush=True)
            raise


if __name__ == '__main__':
    try:
        if sys.argv[1:] not in ([], ['--retention-plan'], ['--retention-apply']):
            raise ValueError('Use --retention-plan or --retention-apply')
        main(sys.argv[1].removeprefix('--retention-') if len(sys.argv) == 2 else None)
    except Exception as error:
        # Do not expose command output, credentials, private CMS data or config.
        print('Autodeploy failed: ' + type(error).__name__ + '; see root-only state/build logs', file=sys.stderr)
        raise SystemExit(1)
