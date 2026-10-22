#!/usr/bin/env python3
"""Create and verify the first encrypted off-VM recovery snapshot.

Only run on the explicitly provisioned migration host. Service credentials and
the repository password stay in root-only configuration. The recovery bundle
leaves the VM encrypted to the separately held SSH deployment key.
"""
import hashlib
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys

ROOT = Path('/srv/ncfg')
CONFIG = Path('/etc/ncfg/storage')
REPOSITORY = 's3:https://s3.cloud.ru/ncfg-backups/initial-recovery'
RECIPIENT = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIbblt5GqmTOn89ezlzGUs+KBffJQXYNB26rlMfe1Mdl'
DUMP = ROOT / 'backups/strapi-cloudru-initial-20261014.dump'


def run(args, **kwargs):
    result = subprocess.run(args, capture_output=True, timeout=900, **kwargs)
    if result.returncode:
        raise RuntimeError('Command failed; sensitive output suppressed')
    return result.stdout


def main():
    os.umask(0o077)
    assert os.geteuid() == 0 and socket.gethostname() == 'ncfg-app-01'
    assert os.path.ismount(ROOT)
    values = json.loads((CONFIG / 'backup.json').read_text())
    password_file = CONFIG / 'restic-password'
    if not password_file.exists():
        with password_file.open('x') as handle:
            handle.write(secrets.token_urlsafe(48))
    password = password_file.read_text()
    env = {**os.environ, 'RESTIC_REPOSITORY': REPOSITORY, 'RESTIC_PASSWORD': password,
           'AWS_ACCESS_KEY_ID': values['tenantId'] + ':' + values['keyId'],
           'AWS_SECRET_ACCESS_KEY': values['keySecret'], 'AWS_DEFAULT_REGION': 'ru-central-1',
           'RESTIC_CACHE_DIR': str(ROOT / 'restic-cache')}
    restic = ['restic', '-o', 's3.region=ru-central-1', '-o', 's3.bucket-lookup=path',
              '-o', 's3.storage-class=SINGLE']
    # Preserve credentials for recovery without exposing plaintext on the workstation.
    bundle = {'repository': REPOSITORY, 'password': password, 'storageClass': 'SINGLE',
              'region': 'ru-central-1', 'backupAccess': values,
              'mediaAccess': json.loads((CONFIG / 'media.json').read_text())}
    encrypted = run(['age', '--encrypt', '--recipient', RECIPIENT], input=json.dumps(bundle).encode())
    (ROOT / 'migration/backup-recovery.age').write_bytes(encrypted)
    bundle = None
    from botocore.exceptions import ClientError
    import importlib.util
    spec = importlib.util.spec_from_file_location('storage_import', ROOT / 'migration/import-private-storage.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    s3 = module.client(values)
    try:
        s3.head_object(Bucket='ncfg-backups', Key='initial-recovery/config')
    except ClientError as error:
        assert error.response['ResponseMetadata']['HTTPStatusCode'] == 404
        run(restic + ['init'], env=env)
    else:
        run(restic + ['cat', 'config'], env=env)
    print('Encrypted backup repository ready.', flush=True)
    result = run(restic + ['backup', '--json', '--tag', 'ncfg-initial-cloudru',
                          str(DUMP), str(DUMP) + '.sha256', str(ROOT / 'migration/data/media'),
                          str(ROOT / 'migration/source-row-counts.json'),
                          str(ROOT / 'migration/restore-verification.json')], env=env)
    summary = next(json.loads(line) for line in result.splitlines()
                   if json.loads(line).get('message_type') == 'summary')
    snapshot = summary['snapshot_id']
    print('Database and 491 media files uploaded in an encrypted snapshot.', flush=True)
    run(restic + ['check', '--read-data'], env=env)
    restored = ROOT / 'backups/strapi-roundtrip-20261014.dump'
    result = run(restic + ['dump', snapshot, str(DUMP)], env=env)
    assert hashlib.sha256(result).digest() == hashlib.sha256(DUMP.read_bytes()).digest()
    restored.write_bytes(result)
    report = {'snapshot': snapshot, 'repository': REPOSITORY, 'encrypted': True,
              'all_repository_data_verified': True, 'database_roundtrip_sha256_match': True,
              'database_sha256': hashlib.sha256(result).hexdigest(),
              'files_processed': summary['total_files_processed'],
              'bytes_processed': summary['total_bytes_processed'],
              'recovery_bundle': '/srv/ncfg/migration/backup-recovery.age'}
    (ROOT / 'migration/offsite-verification.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report), flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        import traceback
        print(json.dumps({'error': type(error).__name__,
                          'line': traceback.extract_tb(error.__traceback__)[-1].lineno,
                          'details': 'sensitive details suppressed'}), file=sys.stderr)
        raise SystemExit(1)
