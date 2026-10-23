#!/usr/bin/env python3
"""Restore a saved dump into a temporary, socket-only PostgreSQL instance."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import tempfile
import time


ROW_COUNTS_SQL = "SELECT json_agg(json_build_object('table',tablename,'rows',(xpath('/row/n/text()',query_to_xml(format('SELECT count(*) AS n FROM %I.%I',schemaname,tablename),false,true,'')))[1]::text::bigint) ORDER BY tablename) FROM pg_tables WHERE schemaname='public'"


def verified_row_counts_sql(path):
    sql = path.read_text().strip()
    if sql.removesuffix(";").strip() != ROW_COUNTS_SQL:
        raise ValueError("Unexpected row-count SQL; refusing to execute archive-supplied commands")
    return ROW_COUNTS_SQL


def run(args, env, timeout=60):
    result = subprocess.run(args, env=env, capture_output=True, timeout=timeout)
    if result.returncode:
        raise RuntimeError("Verification command failed; database output suppressed")
    return result.stdout


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dump", type=Path)
    parser.add_argument("--server-bin", type=Path, default=Path("/opt/homebrew/opt/postgresql@16/bin"))
    args = parser.parse_args()
    os.umask(0o077)
    archive = args.dump.resolve()
    expected = Path(str(archive) + ".sha256").read_text().strip()
    sha = hashlib.sha256()
    with archive.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            sha.update(chunk)
    digest = sha.hexdigest()
    if digest != expected:
        raise ValueError("Dump checksum mismatch")
    source = json.loads((archive.parent / "source-row-counts.json").read_text())
    sql = verified_row_counts_sql(archive.parent / "row-counts.sql")
    env = {key: value for key, value in os.environ.items() if not key.startswith("PG")}
    env.update(PGDATABASE="postgres", PGPASSFILE="/dev/null", PGCONNECT_TIMEOUT="3")
    if b" 16." not in run([str(args.server_bin / "postgres"), "--version"], env):
        raise ValueError("Use PostgreSQL 16")
    with tempfile.TemporaryDirectory(prefix="ncfg-restore-", dir="/private/tmp") as directory:
        root = Path(directory)
        env.update(PGHOST=str(root), PGPORT="55436")
        run([str(args.server_bin / "initdb"), "-D", str(root / "data"), "--auth-local=peer",
             "--auth-host=reject", "--no-locale", "--encoding=UTF8", "--data-checksums"], env)
        server = subprocess.Popen(
            [str(args.server_bin / "postgres"), "-D", str(root / "data"), "-h", "", "-k", str(root), "-p", "55436",
             "-c", "unix_socket_permissions=0700", "-c", "shared_buffers=64MB", "-c", "max_connections=10",
             "-c", "log_statement=none", "-c", "log_min_error_statement=panic"],
            env=env, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        psql = [str(args.server_bin / "psql"), "-X", "--no-password", "--set", "ON_ERROR_STOP=1", "-Atqc"]
        try:
            for attempt in range(20):
                if server.poll() is not None:
                    raise RuntimeError("Temporary PostgreSQL exited")
                try:
                    run(psql + ["SELECT 1"], env, timeout=5)
                    break
                except RuntimeError:
                    time.sleep(0.5)
            else:
                raise RuntimeError("Temporary PostgreSQL did not become ready")
            run(psql + ["CREATE ROLE strapi NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE"], env)
            run(psql + ["CREATE DATABASE strapi OWNER strapi TEMPLATE template0 LC_COLLATE 'C' LC_CTYPE 'C'"], env)
            run([str(args.server_bin / "pg_restore"), "--no-password", "--exit-on-error", "--single-transaction",
                 "--no-owner", "--no-acl", "--role=strapi", "--dbname=strapi", str(archive)], env, timeout=300)
            env["PGDATABASE"] = "strapi"
            restored = json.loads(run(psql + [sql], env))
            if restored != source:
                raise ValueError("Restored table row counts differ from the source clone")
            report = {"verified_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                      "dump_sha256": digest, "restored_into_postgres": True, "tables": len(restored),
                      "rows": sum(item["rows"] for item in restored), "all_table_row_counts_match": True,
                      "postgres_major": 16, "tcp_listeners": False, "restored_as_superuser": False}
        finally:
            if server.poll() is None:
                server.send_signal(signal.SIGINT)
                server.wait(timeout=30)
    report["temporary_database_removed"] = True
    (archive.parent / "restore-verification.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report), flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"event": "restore_verification_failed", "error_type": type(error).__name__,
                          "details_suppressed": True}), flush=True)
        raise SystemExit(1)
