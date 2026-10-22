#!/usr/bin/env python3
"""Import approved bucket credentials and verify private migration objects.

Run only on the new host. Input credential files are RSA-OAEP encrypted; plaintext
is held in memory and in root-only server configuration, never printed.
"""
import hashlib
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import traceback
import urllib.error
import urllib.request

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

ROOT = Path('/srv/ncfg/migration')
CONFIG = Path('/etc/ncfg/storage')
TENANT = 'e46a5401-75e0-4149-91c9-3c83cf17c200'


def client(values):
    return boto3.client('s3', endpoint_url='https://s3.cloud.ru', region_name='ru-central-1',
                        aws_access_key_id=TENANT + ':' + values['keyId'],
                        aws_secret_access_key=values['keySecret'],
                        config=Config(signature_version='s3v4', s3={'addressing_style': 'path'},
                                      connect_timeout=10, read_timeout=30,
                                      retries={'max_attempts': 3}))


def import_credentials(name, bucket):
    target = CONFIG / (name + '.json')
    if target.exists():
        assert target.stat().st_uid == 0 and target.stat().st_mode & 0o777 == 0o600
        values = json.loads(target.read_bytes())
    else:
        result = subprocess.run(['openssl', 'pkeyutl', '-decrypt', '-inkey',
                                 '/root/ncfg-key-transfer/transport.key',
                                 '-pkeyopt', 'rsa_padding_mode:oaep',
                                 '-pkeyopt', 'rsa_oaep_md:sha256'],
                                input=(ROOT / (name + '-key.encrypted')).read_bytes(),
                                capture_output=True, timeout=20)
        assert result.returncode == 0
        values = json.loads(result.stdout)
        assert values['tenantId'] == TENANT and values['bucket'] == bucket
        assert len(values['keyId']) == 32 and len(values['keySecret']) == 32
        with target.open('xb') as handle:
            handle.write(json.dumps(values).encode())
    return client(values)


def deny_other_bucket(s3, other):
    try:
        s3.list_objects_v2(Bucket=other, MaxKeys=1)
    except ClientError as error:
        assert error.response['ResponseMetadata']['HTTPStatusCode'] == 403
        return
    raise RuntimeError('Bucket isolation check failed')


def main():
    os.umask(0o077)
    assert os.geteuid() == 0 and socket.gethostname() == 'ncfg-app-01'
    CONFIG.mkdir(mode=0o700, parents=True, exist_ok=True)
    media = import_credentials('media', 'ncfg-media')
    backup = import_credentials('backup', 'ncfg-backups')
    media.list_objects_v2(Bucket='ncfg-media', MaxKeys=1)
    backup.list_objects_v2(Bucket='ncfg-backups', MaxKeys=1)
    deny_other_bucket(media, 'ncfg-backups')
    deny_other_bucket(backup, 'ncfg-media')
    print('Both S3 credentials work; cross-bucket reads are denied.', flush=True)
    source = ROOT / 'data/media'
    manifest = json.loads((source / 'manifest.json').read_text())
    assert manifest['complete'] and len(manifest['objects']) == 491
    total = 0
    for i, item in enumerate(manifest['objects'], 1):
        data = (source / item['path']).read_bytes()
        assert hashlib.sha256(data).hexdigest() == item['sha256']
        try:
            existing = media.get_object(Bucket='ncfg-media', Key=item['key'])
        except ClientError as error:
            assert error.response['ResponseMetadata']['HTTPStatusCode'] == 404
            existing = None
        if existing is not None:
            assert hashlib.sha256(existing['Body'].read()).hexdigest() == item['sha256']
        else:
            media.put_object(Bucket='ncfg-media', Key=item['key'], Body=data,
                             ContentType=item['headers'].get('content-type', 'application/octet-stream'),
                             CacheControl='public, max-age=31536000, immutable',
                             StorageClass='SINGLE', Metadata={'sha256': item['sha256']})
            response = media.get_object(Bucket='ncfg-media', Key=item['key'])
            assert hashlib.sha256(response['Body'].read()).hexdigest() == item['sha256']
            assert response.get('StorageClass') == 'SINGLE'
        total += len(data)
        if i % 100 == 0:
            print(f'Uploaded and checksum-verified {i}/491 media objects.', flush=True)
    request = urllib.request.Request('https://global.s3.cloud.ru/ncfg-media-69340acf/' + manifest['objects'][0]['key'])
    try:
        urllib.request.urlopen(request, timeout=20)
    except urllib.error.HTTPError as error:
        assert error.code in (401, 403)
    else:
        raise RuntimeError('Anonymous media access was unexpectedly allowed')
    report = {'objects': len(manifest['objects']), 'bytes': total, 'sha256_verified': True,
              'bucket_isolation_verified': True, 'anonymous_access_denied': True,
              'storage_class': 'SINGLE'}
    (ROOT / 's3-verification.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report), flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        line = traceback.extract_tb(error.__traceback__)[-1].lineno
        status = error.response['ResponseMetadata']['HTTPStatusCode'] if isinstance(error, ClientError) else None
        print(json.dumps({'error': type(error).__name__, 'line': line, 'http_status': status,
                          'details': 'sensitive details suppressed'}), file=sys.stderr)
        raise SystemExit(1)
