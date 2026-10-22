#!/usr/bin/env python3
"""Install one public deployment-status file route without restarting Caddy.

This is an operator installer for the known production configuration. It never
reads runtime credentials, enables the admin API or changes network access.
"""
import datetime
import fcntl
import json
import os
from pathlib import Path
import re
import socket
import stat
import subprocess
import tempfile
import time

ROOT = Path('/srv/ncfg')
AUTODEPLOY = ROOT / 'autodeploy'
CONFIG = ROOT / 'migration/Caddyfile'
CADDY_CONFIG = ROOT / 'caddy-config'
PUBLIC_DIRECTORY = CADDY_CONFIG / 'ncfg-public-status'
STATUS = PUBLIC_DIRECTORY / 'deployment-status.json'
CONTAINER = 'ncfg-cloudru-https'

ORIGINAL_CONFIG = '''{
\tadmin off
\temail {$NCFG_ACME_EMAIL}
}

{$NCFG_SITE_HOST} {
\tencode zstd gzip
\treverse_proxy web:8080
}

www.{$NCFG_SITE_HOST} {
\tredir https://{$NCFG_SITE_HOST}{uri} permanent
}

{$NCFG_CMS_HOST} {
\theader X-Robots-Tag "noindex, nofollow"
\tencode zstd gzip
\treverse_proxy cms:8080
}
'''
ORIGINAL_SITE = '''{$NCFG_SITE_HOST} {
\tencode zstd gzip
\treverse_proxy web:8080
}'''
STATUS_SITE = '''{$NCFG_SITE_HOST} {
\tencode zstd gzip
\thandle /deployment-status.json {
\t\troot * /config/ncfg-public-status
\t\theader Cache-Control "no-store"
\t\theader X-Robots-Tag "noindex, nofollow"
\t\tfile_server
\t}
\thandle {
\t\treverse_proxy web:8080
\t}
}'''
INSTALLED_CONFIG = ORIGINAL_CONFIG.replace(ORIGINAL_SITE, STATUS_SITE)


def run(args):
    result = subprocess.run(args, capture_output=True, timeout=30)
    if result.returncode:
        raise RuntimeError('Status installer command failed: ' + args[0] + ' (output suppressed)')
    return result.stdout


def regular_file(path):
    value = path.lstat()
    if not stat.S_ISREG(value.st_mode):
        raise RuntimeError('Expected a regular non-symlink file')
    return value


def directory(path, mode=None, root_owned=True):
    value = path.lstat()
    if not stat.S_ISDIR(value.st_mode) or (root_owned and value.st_uid != 0) or value.st_mode & 0o022:
        raise RuntimeError('Expected a root-owned non-symlink directory')
    if mode is not None:
        path.chmod(mode)


def candidate_config(original):
    # Accept whitespace differences only, never unknown directives/comments.
    if original.split() == INSTALLED_CONFIG.split():
        return original
    if original.split() != ORIGINAL_CONFIG.split():
        raise RuntimeError('Unknown production Caddy configuration; refusing to rewrite it')
    return INSTALLED_CONFIG


def guards():
    if os.geteuid() != 0 or socket.gethostname() != 'ncfg-app-01' or not os.path.ismount(ROOT):
        raise RuntimeError('Unexpected status installation host')
    directory(CADDY_CONFIG)
    directory(AUTODEPLOY)
    directory(CONFIG.parent, root_owned=False)
    regular_file(CONFIG)
    mounts = json.loads(run(['docker', 'inspect', '--format', '{{json .Mounts}}', CONTAINER]))
    expected = {str(CONFIG): ('/etc/caddy/Caddyfile', False), str(CADDY_CONFIG): ('/config', True)}
    for source, (destination, writable) in expected.items():
        matches = [item for item in mounts if item.get('Destination') == destination]
        if len(matches) != 1 or matches[0].get('Type') != 'bind' or matches[0].get('Source') != source or matches[0].get('RW') is not writable:
            raise RuntimeError('Unexpected Caddy bind mount')
    if any(item.get('Destination', '').startswith('/config/') for item in mounts):
        raise RuntimeError('Unexpected nested Caddy config mount')
    command = json.loads(run(['docker', 'inspect', '--format', '{{json .Config.Cmd}}', CONTAINER]))
    if command != ['caddy', 'run', '--config', '/etc/caddy/Caddyfile', '--adapter', 'caddyfile']:
        raise RuntimeError('Caddy must use the known file configuration without --resume')
    version = run(['docker', 'exec', CONTAINER, 'caddy', 'version']).decode()
    match = re.match(r'v2\.(\d+)\.', version)
    if not match or int(match[1]) < 11:
        raise RuntimeError('Caddy 2.11 or newer is required for graceful SIGUSR1 reload')


def validate_public_status(value):
    required = {'schema', 'revision', 'state', 'stage', 'updatedAt'}
    optional = {'code', 'freeBytes', 'requiredBytes', 'freeBeforeBytes'}
    stages = {'preflight', 'cleanup', 'checkout', 'build_cms', 'build_web', 'backup',
              'activate', 'verify', 'complete', 'recovery'}
    if not isinstance(value, dict) or not required <= value.keys() or value.keys() - required - optional:
        raise RuntimeError('Public status has unknown fields')
    if type(value['schema']) is not int or value['schema'] != 1 or not isinstance(value['revision'], str) or not re.fullmatch('[0-9a-f]{40}', value['revision']):
        raise RuntimeError('Invalid public status identity')
    if value['state'] not in {'running', 'failed', 'succeeded', 'superseded'} or value['stage'] not in stages:
        raise RuntimeError('Invalid public status stage')
    if not isinstance(value['updatedAt'], str) or datetime.datetime.fromisoformat(value['updatedAt']).tzinfo is None:
        raise RuntimeError('Invalid public status timestamp')
    if 'code' in value and value['code'] not in {'insufficient_disk', 'cache_cleanup_failed', 'retention_cleanup_failed', 'deployment_failed'}:
        raise RuntimeError('Invalid public status error code')
    for field in optional - {'code'}:
        if field in value and (type(value[field]) is not int or value[field] < 0):
            raise RuntimeError('Invalid public status disk number')


def initialize_status():
    if not PUBLIC_DIRECTORY.exists():
        PUBLIC_DIRECTORY.mkdir(mode=0o755)
    directory(PUBLIC_DIRECTORY, 0o755)
    if STATUS.exists() or STATUS.is_symlink():
        existing = regular_file(STATUS)
        if existing.st_uid != 0 or existing.st_mode & 0o022:
            raise RuntimeError('Existing public status must be root-owned and not writable by others')
        validate_public_status(json.loads(STATUS.read_text()))
        return  # Never overwrite progress/failure published by the supervisor.
    active = json.loads((AUTODEPLOY / 'active.json').read_text())
    revision = active.get('revision')
    if not isinstance(revision, str) or not re.fullmatch('[0-9a-f]{40}', revision):
        raise RuntimeError('Cannot initialize status without a verified active revision')
    payload = {'schema': 1, 'revision': revision, 'state': 'succeeded', 'stage': 'complete',
               'updatedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    descriptor, name = tempfile.mkstemp(prefix='.status-', dir=PUBLIC_DIRECTORY)
    temporary = Path(name)
    try:
        with os.fdopen(descriptor, 'w') as output:
            json.dump(payload, output)
            output.write('\n')
            output.flush()
            os.fsync(output.fileno())
            os.fchmod(output.fileno(), 0o644)
        temporary.replace(STATUS)
    finally:
        temporary.unlink(missing_ok=True)


def replace_in_place(content, identity):
    descriptor = os.open(CONFIG, os.O_WRONLY | os.O_NOFOLLOW)
    with os.fdopen(descriptor, 'w') as output:
        current = os.fstat(output.fileno())
        if (current.st_dev, current.st_ino) != identity:
            raise RuntimeError('Caddyfile inode changed during installation')
        output.write(content)
        output.truncate()
        output.flush()
        os.fsync(output.fileno())


def validate(path):
    run(['docker', 'exec', CONTAINER, 'caddy', 'validate', '--config', str(path), '--adapter', 'caddyfile'])


def reload_caddy():
    # The admin API remains disabled. This signal gracefully reloads file config.
    run(['docker', 'kill', '--signal=USR1', CONTAINER])


def verify_status():
    for attempt in range(10):
        try:
            response = run(['curl', '--fail', '--silent', '--show-error', '--max-time', '5',
                            '--resolve', 'ncfg.ru:443:127.0.0.1',
                            'https://ncfg.ru/deployment-status.json?t=' + str(time.time_ns())])
            if json.loads(response) == json.loads(STATUS.read_text()):
                return
        except (RuntimeError, ValueError):
            pass
        if attempt < 9:
            time.sleep(0.3)
    raise RuntimeError('Public deployment status verification failed')


def install():
    guards()
    # Share the supervisor lock: no publication can race status initialization.
    lock_path = AUTODEPLOY / 'deploy.lock'
    descriptor = os.open(lock_path, os.O_CREAT | os.O_WRONLY | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        original = CONFIG.read_text()
        candidate = candidate_config(original)
        value = regular_file(CONFIG)
        identity = (value.st_dev, value.st_ino)
        initialize_status()
        if candidate == original:
            verify_status()
            return
        descriptor, name = tempfile.mkstemp(prefix='.ncfg-status-', suffix='.Caddyfile', dir=CADDY_CONFIG)
        temporary = Path(name)
        changed = False
        try:
            with os.fdopen(descriptor, 'w') as output:
                output.write(candidate)
            validate('/config/' + temporary.name)
            backup = AUTODEPLOY / ('caddy-before-status-' + str(time.time_ns()) + '.Caddyfile')
            descriptor = os.open(backup, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600)
            with os.fdopen(descriptor, 'w') as output:
                output.write(original)
                output.flush()
                os.fsync(output.fileno())
            changed = True
            replace_in_place(candidate, identity)
            validate('/etc/caddy/Caddyfile')
            reload_caddy()
            verify_status()
        except Exception:
            if changed:
                try:
                    replace_in_place(original, identity)
                    validate('/etc/caddy/Caddyfile')
                    reload_caddy()
                except Exception:
                    raise RuntimeError('Status installation failed; Caddy configuration restoration requires operator attention') from None
            raise
        finally:
            temporary.unlink(missing_ok=True)


if __name__ == '__main__':
    try:
        install()
        print('Exact deployment status route installed; Caddy was not restarted and SSH rules are unchanged.')
    except Exception:
        raise SystemExit('Deployment status installation failed (details suppressed); inspect known configuration and safe operator state.')
