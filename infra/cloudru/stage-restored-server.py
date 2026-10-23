#!/usr/bin/env python3
"""One-time private recovery on the explicitly provisioned Cloud.ru VM.

Receive only the six approved runtime values as JSON on stdin. Never log them
or save them to an environment file. Docker retains its root-only configuration.
This is a staging deployment: public cutover and S3 uploads are separate steps.
"""
import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
import shutil
import socket
import subprocess
import sys
import time

ROOT = Path('/srv/ncfg')
MIGRATION = ROOT / 'migration'
PREFIX = 'ncfg-cloudru-'
KEYS = {'APP_KEYS', 'API_TOKEN_SALT', 'ADMIN_JWT_SECRET', 'JWT_SECRET',
        'TRANSFER_TOKEN_SALT', 'STRAPI_API_TOKEN'}
PG_IMAGE = 'postgres:16-alpine@sha256:721873c34ceb9f8d8fc265984940dc982404c105f19ad51be9fdc5970a6080ea'
DUMP_SHA = 'd51063cfffe6e5715886da22b3959dad8ae92ce96f679e3b20f2206c3aa27b4a'
COUNTS_SQL = "SELECT json_agg(json_build_object('table',tablename,'rows',(xpath('/row/n/text()',query_to_xml(format('SELECT count(*) AS n FROM %I.%I',schemaname,tablename),false,true,'')))[1]::text::bigint) ORDER BY tablename) FROM pg_tables WHERE schemaname='public'"


def run(args, **kwargs):
    result = subprocess.run(args, capture_output=True, timeout=240, **kwargs)
    if result.returncode:
        raise RuntimeError('Operation failed; sensitive command output suppressed')
    return result.stdout


def docker(args, **kwargs):
    return run(['docker', *args], **kwargs)


def sql(query, database='strapi'):
    return docker(['exec', '-i', '--user', 'postgres', PREFIX + 'postgres',
                   'psql', '-X', '-U', 'ncfg_admin', '-d', database,
                   '-v', 'ON_ERROR_STOP=1', '-At'], input=query.encode())


def container(name, image, env, extra, memory, health):
    args = ['run', '-d', '--name', PREFIX + name, '--restart', 'unless-stopped',
            '--label', 'io.ncfg.purpose=cloudru-private-recovery', '--memory', memory,
            '--security-opt', 'no-new-privileges:true', '--log-driver', 'local',
            '--log-opt', 'max-size=10m', '--log-opt', 'max-file=3',
            '--health-cmd', health, '--health-interval', '10s',
            '--health-start-period', '90s', '--health-retries', '8']
    for key in env:
        args += ['--env', key]
    docker(args + extra + [image], env={**os.environ, **env})


def main():
    os.umask(0o077)
    assert os.geteuid() == 0 and socket.gethostname() == 'ncfg-app-01'
    assert os.path.ismount(ROOT)
    assert run(['findmnt', '-nro', 'UUID', str(ROOT)]).strip() == b'0af0198a-2a85-4a0c-b0f5-6f8af71f61ea'
    if sys.argv[1:] == ['--applications-only']:
        values = json.load(sys.stdin)
        assert set(values) == KEYS and all(isinstance(v, str) and v for v in values.values())
        report = json.loads((MIGRATION / 'restore-verification.json').read_text())
        assert report['all_table_row_counts_match'] and report['dump_sha256'] == DUMP_SHA
        assert json.loads(sql(COUNTS_SQL)) == json.loads((MIGRATION / 'source-row-counts.json').read_text())
        inherited = json.loads(docker(['inspect', '--format', '{{json .Config.Env}}', PREFIX + 'postgres']))
        password = next(x.split('=', 1)[1] for x in inherited if x.startswith('STRAPI_DB_PASSWORD='))
        del inherited
        start_apps(values, password)
        return
    assert not any((ROOT / 'postgres').iterdir()), 'Refusing to overwrite a database'
    assert not docker(['ps', '-aq', '--filter', 'name=^' + PREFIX]).strip()
    database_only = sys.argv[1:] == ['--database-only']
    assert database_only or not sys.argv[1:]
    values = {} if database_only else json.load(sys.stdin)
    if not database_only:
        assert set(values) == KEYS and all(isinstance(v, str) and v for v in values.values())
    dump = MIGRATION / 'data/database/strapi-restored-20261011.dump'
    assert hashlib.sha256(dump.read_bytes()).hexdigest() == DUMP_SHA
    media = MIGRATION / 'data/media'
    manifest = json.loads((media / 'manifest.json').read_text())
    assert manifest['complete'] and len(manifest['objects']) == 491
    for item in manifest['objects']:
        source = (media / item['path']).resolve()
        assert source.is_relative_to(media.resolve())
        assert source.stat().st_size == item['size']
        assert hashlib.sha256(source.read_bytes()).hexdigest() == item['sha256']
    media_target = ROOT / 'staging-media'
    shutil.copytree(media, media_target)
    for folder, dirs, files in os.walk(media_target):
        os.chmod(folder, 0o755)
        for name in files:
            os.chmod(Path(folder) / name, 0o644)
    proxy = ROOT / 'staging-proxy.mjs'
    proxy.write_text((MIGRATION / 'rehearsal-proxy.mjs').read_text().replace('18080', '28080').replace('18081', '28081'))
    proxy.chmod(0o644)
    for name in ['database', 'application']:
        docker(['network', 'create', '--internal', PREFIX + name])
    docker(['network', 'create', PREFIX + 'front'])
    password = secrets.token_hex(32)
    container('postgres', PG_IMAGE,
              {'POSTGRES_DB': 'postgres', 'POSTGRES_USER': 'ncfg_admin',
               'POSTGRES_PASSWORD': secrets.token_hex(32), 'STRAPI_DB_PASSWORD': password,
               'POSTGRES_INITDB_ARGS': '--data-checksums'},
              ['--network', PREFIX + 'database', '--network-alias', 'postgres',
               '--shm-size', '256m', '--mount', f'type=bind,src={ROOT}/postgres,dst=/var/lib/postgresql/data',
               '--mount', f'type=bind,src={MIGRATION}/init-postgres.sh,dst=/docker-entrypoint-initdb.d/10-strapi.sh,readonly'],
              '1536m', 'pg_isready -U ncfg_admin -d strapi')
    for attempt in range(60):
        if docker(['inspect', '--format', '{{.State.Health.Status}}', PREFIX + 'postgres']).strip() == b'healthy':
            break
        time.sleep(2)
    else:
        raise RuntimeError('PostgreSQL did not become healthy')
    assert sql("SELECT count(*) FROM pg_tables WHERE schemaname='public';").strip() == b'0'
    with dump.open('rb') as stream:
        docker(['exec', '-i', '--user', 'postgres', PREFIX + 'postgres', 'pg_restore',
                '-U', 'ncfg_admin', '-d', 'strapi', '--role=strapi', '--no-owner',
                '--no-acl', '--exit-on-error', '--single-transaction'], stdin=stream)
    rows = json.loads(sql(COUNTS_SQL))
    assert rows == json.loads((MIGRATION / 'source-row-counts.json').read_text())
    report = {'tables': len(rows), 'rows': sum(x['rows'] for x in rows), 'all_table_row_counts_match': True,
              'media_objects': len(manifest['objects']), 'all_media_checksums_match': True,
              'dump_sha256': DUMP_SHA, 'source_restore_point': '2026-10-11T00:08:31.414625Z',
              'public_cutover': False, 's3_uploads_enabled': False}
    (MIGRATION / 'restore-verification.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report), flush=True)
    if database_only:
        print('Database restored and verified. Applications have not been started.', flush=True)
        return
    start_apps(values, password)


def start_apps(values, password):
    for name in ['cms', 'web', 'gateway']:
        assert not docker(['ps', '-aq', '--filter', 'name=^' + PREFIX + name + '$']).strip()
    media_target = ROOT / 'staging-media'
    proxy = ROOT / 'staging-proxy.mjs'
    token_hash = hmac.new(values['API_TOKEN_SALT'].encode(), values['STRAPI_API_TOKEN'].encode(), hashlib.sha512).hexdigest()
    assert sql(f"SELECT count(*) FROM strapi_api_tokens WHERE access_key='{token_hash}' AND (expires_at IS NULL OR expires_at>now());").strip() == b'1'
    common = {'NODE_ENV': 'production', 'HOST': '0.0.0.0', 'PORT': '8080',
              'STRAPI_TELEMETRY_DISABLED': 'true', 'AWS_EC2_METADATA_DISABLED': 'true'}
    cms = {**common, **{k: v for k, v in values.items() if k != 'STRAPI_API_TOKEN'},
           'PUBLIC_URL': 'http://localhost:28081', 'ADMIN_URL': '/admin', 'IS_PROXIED': 'true',
           'DATABASE_CLIENT': 'postgres', 'DATABASE_HOST': 'postgres', 'DATABASE_PORT': '5432',
           'DATABASE_NAME': 'strapi', 'DATABASE_USERNAME': 'strapi', 'DATABASE_PASSWORD': password,
           'DATABASE_SSL': 'false', 'DATABASE_POOL_MIN': '0', 'DATABASE_POOL_MAX': '5',
           'AWS_BUCKET': 'ncfg-private-staging', 'AWS_ENDPOINT': 'http://gateway:8080/media',
           'AWS_REGION': 'us-east-1', 'AWS_ACCESS_KEY_ID': 'staging-uploads-disabled',
           'AWS_SECRET_ACCESS_KEY': secrets.token_hex(32), 'CSP_MEDIA_SRC': 'http://localhost:28080'}
    web = {**common, 'HOSTNAME': '0.0.0.0', 'DEPLOY_ENV': 'preview', 'STRAPI_SOURCE': 'default',
           'STRAPI_URL': 'http://cms:8080', 'STRAPI_API_TOKEN': values['STRAPI_API_TOKEN'],
           'STRAPI_WRITE_MODE': 'disabled', 'OUTBOUND_MODE': 'disabled',
           'NEXT_PUBLIC_SITE_URL': 'http://localhost:28080', 'NEXT_TELEMETRY_DISABLED': '1'}
    for name, image, env, memory, health in [
        ('cms', 'ncfg-recovery-cms:20261014', cms, '2g', '/_health'),
        ('web', 'ncfg-recovery-web:20261014', web, '1536m', '/api/health')]:
        extra = ['--network', PREFIX + 'application', '--network-alias', name, '--cap-drop', 'ALL']
        if name == 'web':
            extra += ['--mount', f'type=bind,src={ROOT}/next-cache,dst=/app/.next/cache']
        container(name, image, env, extra, memory, 'wget --quiet --spider http://127.0.0.1:8080' + health)
        if name == 'cms':
            docker(['network', 'connect', PREFIX + 'database', PREFIX + 'cms'])
    # The gateway is the only container attached to a routable network; host ports bind to loopback.
    docker(['run', '-d', '--name', PREFIX + 'gateway', '--restart', 'unless-stopped',
            '--label', 'io.ncfg.purpose=cloudru-private-recovery', '--memory', '256m',
            '--security-opt', 'no-new-privileges:true', '--cap-drop', 'ALL',
            '--health-cmd', 'wget --quiet --spider http://127.0.0.1:8080/api/health',
            '--log-driver', 'local', '--log-opt', 'max-size=10m', '--log-opt', 'max-file=3',
            '--network', PREFIX + 'application', '--network-alias', 'gateway',
            '--publish', '127.0.0.1:8080:8080', '--publish', '127.0.0.1:8081:8081',
            '--mount', f'type=bind,src={media_target},dst=/rehearsal/media,readonly',
            '--mount', f'type=bind,src={proxy},dst=/rehearsal/proxy.mjs,readonly',
            '--entrypoint', 'node', 'ncfg-recovery-web:20261014', '/rehearsal/proxy.mjs'])
    docker(['network', 'connect', PREFIX + 'front', PREFIX + 'gateway'])
    print('Private recovery started. Verify readiness before using the SSH tunnel.', flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(type(error).__name__ + ': private recovery stopped; sensitive output suppressed', file=sys.stderr)
        raise SystemExit(1)
