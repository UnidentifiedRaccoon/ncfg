#!/usr/bin/env python3
"""Save public rendered pages through the existing private web container."""
import argparse
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = "https://bban3i4dgt9p00m87f90.containers.yandexcloud.net"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    os.umask(0o077)
    root = args.output.resolve()
    root.mkdir(parents=True, exist_ok=True)
    process = subprocess.run(["yc", "--profile", "default", "--no-browser", "--retry", "0", "iam", "create-token"],
                             capture_output=True, text=True, timeout=30)
    if process.returncode:
        raise RuntimeError("IAM token unavailable")
    headers = {"Authorization": "Bearer " + process.stdout.strip(), "X-Forwarded-Host": "ncfg.ru", "X-Forwarded-Proto": "https"}

    def fetch(path):
        item = {"path": path}
        try:
            request = urllib.request.Request(ROOT + path, headers=headers)
            with urllib.request.build_opener(NoRedirect()).open(request, timeout=40) as response:
                body = response.read(8 * 1024 * 1024 + 1)
                if len(body) > 8 * 1024 * 1024:
                    raise ValueError("Page exceeds export limit")
                item.update(http_status=response.status, content_type=response.headers.get("Content-Type"))
            filename = hashlib.sha256(path.encode()).hexdigest() + (".xml" if path.endswith(".xml") else ".html")
            (root / filename).write_bytes(body)
            item.update(file=filename, bytes=len(body), sha256=hashlib.sha256(body).hexdigest())
        except urllib.error.HTTPError as exc:
            item["http_status"] = exc.code
        except Exception as exc:
            item["error_type"] = type(exc).__name__
        return item

    initial = [fetch("/"), fetch("/sitemap.xml"), fetch("/robots.txt")]
    paths = set()
    sitemap = initial[1]
    if sitemap.get("file"):
        document = ET.fromstring((root / sitemap["file"]).read_bytes())
        for entry in document.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
            parsed = urllib.parse.urlsplit(entry.text)
            if parsed.scheme == "https" and parsed.hostname == "ncfg.ru" and not parsed.query and not parsed.fragment:
                if not parsed.path.startswith(("/api/", "/admin", "/experiments", "/storybook")):
                    paths.add(parsed.path or "/")
    paths.difference_update(item["path"] for item in initial)
    if len(paths) > 500:
        raise ValueError("Unexpected sitemap size; inspect before extending scope")
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        pages = initial + list(pool.map(fetch, sorted(paths)))
    report = {"exported_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "kind": "public-page-snapshot-not-database",
              "attempted": len(pages), "saved": sum("file" in item for item in pages),
              "complete": all("file" in item and item.get("http_status") == 200 for item in pages), "pages": pages}
    (root / "manifest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({key: value for key, value in report.items() if key != "pages"}), flush=True)
    if not report["complete"]:
        raise SystemExit(1)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"event": "page_export_failed", "error_type": type(error).__name__}), flush=True)
        raise SystemExit(1)
