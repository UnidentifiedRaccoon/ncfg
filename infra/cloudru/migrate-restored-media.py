#!/usr/bin/env python3
"""Rewrite media origins only inside the verified, restored Cloud.ru database."""
import json
import os
from pathlib import Path
import socket
import subprocess
import sys

OLD = 'https://storage.yandexcloud.net/ncfg-uploads-1770291983'
NEW = 'https://global.s3.cloud.ru/ncfg-media-69340acf'


def main():
    assert os.geteuid() == 0 and socket.gethostname() == 'ncfg-app-01'
    root = Path('/srv/ncfg/migration')
    assert json.loads((root / 's3-verification.json').read_text())['sha256_verified']
    assert json.loads((root / 'offsite-verification.json').read_text())['database_roundtrip_sha256_match']
    query = """
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '120s';
CREATE TEMP TABLE media_url_changes(table_name text, column_name text, rows_changed integer) ON COMMIT DROP;
DO $migration$
DECLARE r record; n integer; old_origin text;
BEGIN
  FOREACH old_origin IN ARRAY ARRAY['https://storage.yandexcloud.net/ncfg-uploads-1770291983',
                                    'https://ncfg-uploads-1770291983.storage.yandexcloud.net'] LOOP
    FOR r IN SELECT table_name, column_name, udt_name FROM information_schema.columns
             WHERE table_schema='public' AND udt_name IN ('text','varchar','json','jsonb')
             AND is_generated='NEVER' LOOP
      EXECUTE format('UPDATE public.%I SET %I=replace(%I::text,$1,$2)::%s WHERE position($1 in %I::text)>0',
                     r.table_name,r.column_name,r.column_name,r.udt_name,r.column_name)
              USING old_origin, 'https://global.s3.cloud.ru/ncfg-media-69340acf';
      GET DIAGNOSTICS n = ROW_COUNT;
      IF n>0 THEN INSERT INTO media_url_changes VALUES(r.table_name,r.column_name,n); END IF;
    END LOOP;
  END LOOP;
END $migration$;
SELECT coalesce(json_agg(media_url_changes),'[]') FROM media_url_changes;
COMMIT;
"""
    result = subprocess.run(['docker', 'exec', '-i', '--user', 'postgres', 'ncfg-cloudru-postgres',
                             'psql', '-X', '-qAt', '-U', 'ncfg_admin', '-d', 'strapi',
                             '-v', 'ON_ERROR_STOP=1'], input=query.encode(), capture_output=True, timeout=240)
    assert result.returncode == 0, 'Database migration failed; output suppressed'
    changes = json.loads(result.stdout)
    report = {'oldOrigin': OLD, 'newOrigin': NEW, 'changes': changes, 'sourceDatabaseModified': False}
    (root / 'media-url-migration.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report), flush=True)
    # Keep the private preview working after the database URL migration.
    proxy = Path('/srv/ncfg/staging-proxy.mjs')
    text = proxy.read_text()
    if NEW not in text:
        text = text.replace("[oldOrigin + '/', mediaOrigin + '/',", "['" + NEW + "/', oldOrigin + '/', mediaOrigin + '/',")
        text = text.replace('return text.replaceAll(oldOrigin, mediaOrigin)',
                            "return text.replaceAll('" + NEW + "', mediaOrigin).replaceAll(oldOrigin, mediaOrigin)")
        proxy.write_text(text)
        assert subprocess.run(['docker', 'restart', 'ncfg-cloudru-gateway'], capture_output=True).returncode == 0


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(type(error).__name__ + ': media URL migration failed; details suppressed', file=sys.stderr)
        raise SystemExit(1)
