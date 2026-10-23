#!/usr/bin/env python3
"""Back up the running recovery stack and private media to encrypted S3.

Keep every remote snapshot. A failed backup preserves its local dump.
Runtime credentials stay on the VM and are not included in this snapshot.
"""
import datetime
import fcntl
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import socket
import subprocess
import sys

ROOT = Path('/srv/ncfg')
CONFIG = Path('/etc/ncfg/storage')
REPOSITORY = 's3:https://s3.cloud.ru/ncfg-backups/initial-recovery'


def run(args, **kwargs):
    result = subprocess.run(args, capture_output=True, timeout=1800, **kwargs)
    if result.returncode != 0:
        raise RuntimeError('Operation failed; sensitive output suppressed')
    return result.stdout


def main():
    os.umask(0o077)
    if os.geteuid() != 0 or socket.gethostname() != 'ncfg-app-01':
        raise RuntimeError('Backup requires root on ncfg-app-01')
    if not os.path.ismount(ROOT):
        raise RuntimeError('Backup data volume is not mounted')
    with (ROOT / 'backups/running-stack.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        backup_locked()


def backup_locked():
    """Run only while holding the exclusive running-stack lock."""
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    current = ROOT / 'backups/current'
    media = current / 'media'
    media.mkdir(mode=0o700, parents=True, exist_ok=True)
    # Copy current objects before pg_dump; keep prior local media to avoid losing
    # an object deleted between the listing and this transaction's snapshot.
    spec = importlib.util.spec_from_file_location('storage_import', ROOT / 'migration/import-private-storage.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    client = module.client(json.loads((CONFIG / 'media.json').read_text()))
    entries = []
    for page in client.get_paginator('list_objects_v2').paginate(Bucket='ncfg-media'):
        for item in page.get('Contents', []):
            key = item['Key']
            filename = hashlib.sha256(key.encode()).hexdigest()
            data = client.get_object(Bucket='ncfg-media', Key=key)['Body'].read()
            target = media / filename
            digest = hashlib.sha256(data).hexdigest()
            if not target.exists() or hashlib.sha256(target.read_bytes()).hexdigest() != digest:
                target.write_bytes(data)
            entries.append({'key': key, 'path': filename, 'bytes': len(data), 'sha256': digest})
    (media / 'manifest.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n')
    dump = ROOT / 'backups' / ('strapi-' + stamp + '.dump')
    with dump.open('xb') as output:
        result = subprocess.run(['docker', 'exec', '--user', 'postgres', 'ncfg-cloudru-postgres',
                                 'pg_dump', '-U', 'ncfg_admin', '-d', 'strapi', '-Fc', '--no-owner', '--no-acl'],
                                stdout=output, stderr=subprocess.PIPE, timeout=600)
    if result.returncode != 0:
        raise RuntimeError('Database export failed; details suppressed')
    digest = hashlib.sha256(dump.read_bytes()).hexdigest()
    checksum = dump.with_suffix('.dump.sha256')
    checksum.write_text(digest + '  ' + dump.name + '\n')
    access = json.loads((CONFIG / 'backup.json').read_text())
    env = {**os.environ, 'RESTIC_REPOSITORY': REPOSITORY,
           'RESTIC_PASSWORD_FILE': str(CONFIG / 'restic-password'),
           'AWS_ACCESS_KEY_ID': access['tenantId'] + ':' + access['keyId'],
           'AWS_SECRET_ACCESS_KEY': access['keySecret'], 'AWS_DEFAULT_REGION': 'ru-central-1',
           'RESTIC_CACHE_DIR': str(ROOT / 'restic-cache')}
    restic = ['restic', '-o', 's3.region=ru-central-1', '-o', 's3.bucket-lookup=path',
              '-o', 's3.storage-class=SINGLE']
    output = run(restic + ['backup', '--json', '--tag', 'ncfg-running-stack',
                          str(dump), str(checksum), str(media)], env=env)
    summary = next(json.loads(line) for line in output.splitlines()
                   if json.loads(line).get('message_type') == 'summary')
    snapshot = summary['snapshot_id']
    roundtrip = run(restic + ['dump', snapshot, str(dump)], env=env)
    if hashlib.sha256(roundtrip).hexdigest() != digest:
        raise RuntimeError('Database roundtrip checksum mismatch')
    run(restic + ['check'], env=env)
    report = {'completedAt': stamp, 'snapshot': snapshot, 'databaseSha256': digest,
              'databaseRoundtripPassed': True, 'mediaObjects': len(entries),
              'remotePruningEnabled': False, 'runtimeCredentialsIncluded': False}
    (ROOT / 'backups/last-offsite-success.json').write_text(json.dumps(report, indent=2) + '\n')
    # These two files were created by this run and are verified in remote storage.
    dump.unlink()
    checksum.unlink()
    print(json.dumps(report))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(json.dumps({'backupFailed': True, 'errorType': type(error).__name__,
                          'details': 'sensitive output suppressed'}), file=sys.stderr)
        raise SystemExit(1)
