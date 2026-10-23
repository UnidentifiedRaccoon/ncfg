#!/usr/bin/env python3
"""Copy public ncfg S3 objects, preserving metadata and verifying every file."""
import argparse
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

BUCKET = "ncfg-uploads-1770291983"
BASE = "https://storage.yandexcloud.net/" + BUCKET
NS = {"s3": "http://s3.amazonaws.com/doc/2006-03-01/"}


def inventory():
    objects, token = [], None
    while True:
        query = {"list-type": "2", "max-keys": "1000", "encoding-type": "url"}
        if token:
            query["continuation-token"] = token
        with urllib.request.urlopen(BASE + "?" + urllib.parse.urlencode(query), timeout=30) as response:
            root = ET.fromstring(response.read())
        for obj in root.findall("s3:Contents", NS):
            objects.append({
                "key": urllib.parse.unquote(obj.findtext("s3:Key", namespaces=NS)),
                "size": int(obj.findtext("s3:Size", namespaces=NS)),
                "etag": obj.findtext("s3:ETag", namespaces=NS),
                "last_modified": obj.findtext("s3:LastModified", namespaces=NS),
            })
        if root.findtext("s3:IsTruncated", namespaces=NS) != "true":
            return sorted(objects, key=lambda item: item["key"])
        token = root.findtext("s3:NextContinuationToken", namespaces=NS)
        if not token:
            raise RuntimeError("Truncated listing without continuation token")


def export_one(obj, root):
    key_id = hashlib.sha256(obj["key"].encode()).hexdigest()
    target = root / "objects" / key_id
    partial = target.with_suffix(".partial")
    for attempt in range(3):
        try:
            request = urllib.request.Request(
                BASE + "/" + urllib.parse.quote(obj["key"], safe="/"),
                headers={"If-Match": obj["etag"]},
            )
            sha, md5, size = hashlib.sha256(), hashlib.md5(), 0
            with urllib.request.urlopen(request, timeout=30) as response, partial.open("wb") as output:
                headers = {k.lower(): v for k, v in response.headers.items()}
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
                    sha.update(chunk)
                    md5.update(chunk)
                    size += len(chunk)
            if size != obj["size"] or headers.get("etag") != obj["etag"]:
                raise RuntimeError("Object size or ETag changed")
            etag = obj["etag"].strip('"')
            md5_checked = bool(re.fullmatch(r"[0-9a-f]{32}", etag)) and not headers.get("x-amz-server-side-encryption")
            if md5_checked and md5.hexdigest() != etag:
                raise RuntimeError("Object MD5 does not match ETag")
            os.replace(partial, target)
            return {
                **obj, "path": str(target.relative_to(root)), "sha256": sha.hexdigest(),
                "etag_md5_verified": md5_checked,
                "headers": {key: value for key, value in headers.items() if key in (
                    "content-type", "content-encoding", "content-disposition", "cache-control", "expires"
                ) or key.startswith("x-amz-meta-")},
            }
        except Exception as exc:
            if attempt == 2:
                return {**obj, "error_type": type(exc).__name__}
            time.sleep(attempt + 1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    os.umask(0o077)
    root = args.output.resolve()
    (root / "objects").mkdir(parents=True, exist_ok=True)
    initial = inventory()
    print(json.dumps({"event": "media_started", "objects": len(initial), "bytes": sum(o["size"] for o in initial)}), flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        entries = list(pool.map(lambda obj: export_one(obj, root), initial))
    final = inventory()
    failures = sum("error_type" in obj for obj in entries)
    stable = initial == final
    manifest = {"bucket": BUCKET, "source": BASE, "exported_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "complete": failures == 0 and stable, "listing_stable": stable, "failures": failures, "objects": entries}
    (root / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    # Verify the actual files again, independently from the download stream.
    for obj in entries:
        if "error_type" not in obj:
            path = root / obj["path"]
            if path.stat().st_size != obj["size"] or hashlib.sha256(path.read_bytes()).hexdigest() != obj["sha256"]:
                raise RuntimeError("Local file verification failed")
    print(json.dumps({"event": "media_verified", "complete": manifest["complete"], "objects": len(entries),
                      "failures": failures, "bytes": sum(o["size"] for o in entries if "error_type" not in o)}), flush=True)
    if not manifest["complete"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
