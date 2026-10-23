#!/usr/bin/env python3
"""Read-only export of an isolated ncfg recovery clone. Secrets stay in memory."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import socket
import struct
import subprocess
import time
import urllib.request

SOURCE_CLUSTER = "c9qp6nrho3p4h4ta3n6i"
SECRET = "e6q6g2jl4shdteckf56e"
SECRET_VERSION = "e6qhhfn201ha6d0vs6ld"
YC = ["yc", "--profile", "default", "--folder-id", "b1gmjvv108csipq1tqu2", "--no-browser", "--retry", "0", "--format", "json"]
ROW_COUNTS_SQL = "SELECT json_agg(json_build_object('table',tablename,'rows',(xpath('/row/n/text()',query_to_xml(format('SELECT count(*) AS n FROM %I.%I',schemaname,tablename),false,true,'')))[1]::text::bigint) ORDER BY tablename) FROM pg_tables WHERE schemaname='public'"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def command(args, env=None, timeout=45):
    result = subprocess.run(args, env=env, capture_output=True, timeout=timeout)
    if result.returncode:
        # Do not print raw SQL/client output, which could contain private data.
        raise RuntimeError("Command failed; output suppressed")
    return result.stdout


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("cluster_id")
    parser.add_argument("output", type=Path)
    parser.add_argument("--client-bin", type=Path, default=Path("/opt/homebrew/opt/libpq@16/bin"))
    parser.add_argument("--tunnel-port", type=int, help="Port of an already verified SSH forward on 127.0.0.1")
    args = parser.parse_args()
    os.umask(0o077)
    if args.cluster_id == SOURCE_CLUSTER:
        raise ValueError("This workflow is authorized for a separate recovery clone only")
    cluster = json.loads(command(YC + ["managed-postgresql", "cluster", "get", args.cluster_id]))
    if not cluster["name"].startswith("ncfg-db-rescue-") or cluster["status"] != "RUNNING":
        raise ValueError("Recovery clone is not ready")
    if str(cluster["config"]["version"]) != "16":
        raise ValueError("Expected PostgreSQL 16")
    hosts = json.loads(command(YC + ["managed-postgresql", "hosts", "list", "--cluster-id", args.cluster_id]))
    if len(hosts) != 1 or not hosts[0]["name"].endswith(".mdb.yandexcloud.net"):
        raise ValueError("Unexpected recovery host topology")
    hostname = hosts[0]["name"]
    if args.tunnel_port is not None and not 1024 <= args.tunnel_port <= 65535:
        raise ValueError("Invalid local tunnel port")
    connection_host = "127.0.0.1" if args.tunnel_port else hostname
    connection_port = args.tunnel_port or 6432
    # Check reachability before obtaining the approved database credential.
    with socket.create_connection((connection_host, connection_port), timeout=10) as connection:
        connection.sendall(struct.pack("!II", 8, 80877103))
        if connection.recv(1) != b"S":
            raise ValueError("PostgreSQL did not offer TLS")
    for tool in ("pg_dump", "pg_restore", "psql"):
        if b" 16." not in command([str(args.client_bin / tool), "--version"]):
            raise ValueError("Use PostgreSQL 16 clients")
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    partial = output.with_suffix(output.suffix + ".partial")
    if any(path.exists() for path in (output, partial, Path(str(output) + ".sha256"), Path(str(output) + ".json"),
                                      output.parent / "source-row-counts.json", output.parent / "row-counts.sql")):
        raise FileExistsError("Refusing to overwrite a previous export")
    certificate = output.parent / "yandex-postgresql-root.crt"
    with urllib.request.urlopen("https://storage.yandexcloud.net/cloud-certs/RootCA.pem", timeout=30) as response:
        ca = response.read(1024 * 1024)
    if b"-----BEGIN CERTIFICATE-----" not in ca or b"PRIVATE KEY" in ca:
        raise ValueError("Unexpected public CA content")
    certificate.write_bytes(ca)
    iam = command(["yc", "--profile", "default", "--no-browser", "--retry", "0", "iam", "create-token"]).decode().strip()
    request = urllib.request.Request(
        "https://payload.lockbox.api.cloud.yandex.net/lockbox/v1/secrets/" + SECRET + "/payload?versionId=" + SECRET_VERSION,
        headers={"Authorization": "Bearer " + iam},
    )
    with urllib.request.build_opener(NoRedirect()).open(request, timeout=30) as response:
        payload = json.load(response)
    passwords = [entry["textValue"] for entry in payload["entries"] if entry["key"] == "postgresql_password"]
    if len(passwords) != 1 or not passwords[0]:
        raise ValueError("Expected one connection password")
    # Avoid inherited libpq options, service files and password-file credentials.
    env = {key: value for key, value in os.environ.items() if not key.startswith("PG")}
    env.update(PGHOST=hostname, PGPORT=str(connection_port), PGDATABASE="strapi", PGUSER="strapi", PGPASSWORD=passwords[0],
               PGSSLMODE="verify-full", PGSSLROOTCERT=str(certificate), PGCONNECT_TIMEOUT="10", PGPASSFILE="/dev/null",
               PGAPPNAME="ncfg-rescue-export", PGOPTIONS="-c default_transaction_read_only=on")
    if args.tunnel_port:
        # TLS hostname verification still uses the real database hostname.
        env["PGHOSTADDR"] = "127.0.0.1"
    del passwords, payload, iam, request
    sql = "SELECT json_build_object('database',current_database(),'server_version',current_setting('server_version'),'read_only',current_setting('transaction_read_only'),'user_tables',(SELECT count(*) FROM pg_tables WHERE schemaname='public'))"
    info = json.loads(command([str(args.client_bin / "psql"), "-X", "--no-password", "-Atqc", sql], env))
    if info["read_only"] != "on" or not info["user_tables"]:
        raise ValueError("Read-only database preflight failed")
    # The recovery clone has no application writers. Preserve counts for a real restore check.
    rows = json.loads(command([str(args.client_bin / "psql"), "-X", "--no-password", "-Atqc", ROW_COUNTS_SQL], env, timeout=60))
    with partial.open("xb") as target:
        result = subprocess.run([str(args.client_bin / "pg_dump"), "--no-password", "--format=custom", "--no-owner", "--no-acl",
                                 "--lock-wait-timeout=15000"], env=env, stdin=subprocess.DEVNULL,
                                stdout=target, stderr=subprocess.PIPE, timeout=900)
    env.pop("PGPASSWORD", None)
    if result.returncode:
        raise RuntimeError("pg_dump failed; incomplete archive retained with .partial suffix")
    toc = command([str(args.client_bin / "pg_restore"), "--list", str(partial)]).decode()
    # Decode all archive entries without executing the generated SQL.
    command([str(args.client_bin / "pg_restore"), "--no-owner", "--no-acl", "--file=/dev/null", str(partial)], timeout=300)
    table_data = sum(" TABLE DATA " in line for line in toc.splitlines() if not line.startswith(";"))
    if not table_data:
        raise ValueError("Archive contains no table data entries")
    sha = hashlib.sha256()
    with partial.open("rb") as source:
        while chunk := source.read(1024 * 1024):
            sha.update(chunk)
    os.rename(partial, output)
    Path(str(output) + ".sha256").write_text(sha.hexdigest() + "\n")
    (output.parent / "source-row-counts.json").write_text(json.dumps(rows, indent=2) + "\n")
    (output.parent / "row-counts.sql").write_text(ROW_COUNTS_SQL + ";\n")
    report = {"exported_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "cluster_id": args.cluster_id,
              "database": info, "bytes": output.stat().st_size, "sha256": sha.hexdigest(), "table_data_entries": table_data,
              "archive_fully_decoded": True, "restored_into_postgres": False, "source_modified": False}
    Path(str(output) + ".json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report), flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"event": "database_export_failed", "error_type": type(error).__name__, "details_suppressed": True}), flush=True)
        raise SystemExit(1)
