#!/usr/bin/env python3
"""Preserve Yandex images as an OCI layout without a daemon or saved login."""
import argparse
import base64
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

PRODUCTION = {
    "crpu6bsbmduqldr05i7u/ncfg-web": "sha256:67767288187dea6585b1638e632dc468a9e13993de20988fe011e7424187ef7c",
    "crpu6bsbmduqldr05i7u/ncfg-cms": "sha256:ae5163282f851aafbb1e3ba97ba19f593b14e02a592e50f89b3b68b7738e76ec",
}
ACCEPT = ", ".join([
    "application/vnd.oci.image.manifest.v1+json", "application/vnd.oci.image.index.v1+json",
    "application/vnd.docker.distribution.manifest.v2+json", "application/vnd.docker.distribution.manifest.list.v2+json",
])


def digest_path(root, digest):
    if not re.fullmatch(r"sha256:[0-9a-f]{64}", digest):
        raise ValueError("Unsupported or invalid content digest")
    return root / "blobs" / "sha256" / digest.split(":")[1]


def verified(path, digest, size=None):
    if not path.is_file() or (size is not None and path.stat().st_size != size):
        return False
    sha = hashlib.sha256()
    with path.open("rb") as source:
        while chunk := source.read(1024 * 1024):
            sha.update(chunk)
    return "sha256:" + sha.hexdigest() == digest


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


class Registry:
    def __init__(self):
        result = subprocess.run(["yc", "--profile", "default", "--no-browser", "--retry", "0", "iam", "create-token"],
                                capture_output=True, text=True, timeout=30)
        if result.returncode:
            raise RuntimeError("IAM authentication failed; command output omitted")
        self.authorization = "Basic " + base64.b64encode(("iam:" + result.stdout.strip()).encode()).decode()

    def open(self, repo, kind, digest):
        if repo not in PRODUCTION:
            raise ValueError("Repository is outside ncfg export scope")
        url = "https://cr.yandex/v2/" + repo + "/" + kind + "/" + digest
        headers = {"Authorization": self.authorization, "Accept": ACCEPT}
        # Never forward registry credentials to an object-storage redirect.
        for _ in range(5):
            try:
                return urllib.request.build_opener(NoRedirect()).open(urllib.request.Request(url, headers=headers), timeout=45)
            except urllib.error.HTTPError as exc:
                if exc.code not in (301, 302, 303, 307, 308):
                    raise
                url = urllib.parse.urljoin(url, exc.headers["Location"])
                parsed = urllib.parse.urlsplit(url)
                if parsed.scheme != "https" or parsed.username or parsed.password or not (
                    parsed.hostname == "cr.yandex" or parsed.hostname.endswith(".yandexcloud.net")
                    or parsed.hostname.endswith(".yandex.net")
                ):
                    raise RuntimeError("Unexpected registry redirect destination") from None
                headers = {"Accept": ACCEPT}
        raise RuntimeError("Too many registry redirects")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("inventory", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--all-images", action="store_true")
    args = parser.parse_args()
    os.umask(0o077)
    root = args.output.resolve()
    (root / "blobs" / "sha256").mkdir(parents=True, exist_ok=True)
    images = [item for item in json.loads(args.inventory.read_text()) if item["name"] in PRODUCTION
              and (args.all_images or item["digest"] == PRODUCTION[item["name"]])]
    if not all(any(item["name"] == repo and item["digest"] == digest for item in images) for repo, digest in PRODUCTION.items()):
        raise RuntimeError("Production digest missing from source inventory")
    registry = Registry()
    manifests, blobs, descriptors, errors = {}, {}, {}, []

    def manifest(repo, digest):
        path = digest_path(root, digest)
        if verified(path, digest):
            data = path.read_bytes()
        else:
            with registry.open(repo, "manifests", digest) as response:
                data = response.read(8 * 1024 * 1024)
            if "sha256:" + hashlib.sha256(data).hexdigest() != digest:
                raise RuntimeError("Manifest digest mismatch")
            path.write_bytes(data)
        doc = json.loads(data)
        return repo, digest, doc, len(data)

    pending = {(item["name"], item["digest"]) for item in images}
    while pending:
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            jobs = {pool.submit(manifest, *item): item for item in pending}
            pending = set()
            for job in concurrent.futures.as_completed(jobs):
                repo, digest = jobs[job]
                try:
                    _, _, doc, size = job.result()
                    if doc.get("schemaVersion") != 2 or not doc.get("mediaType"):
                        raise RuntimeError("Unsupported manifest")
                    manifests[digest] = doc
                    descriptors[digest] = {"mediaType": doc["mediaType"], "digest": digest, "size": size}
                    for child in doc.get("manifests", []):
                        if child["digest"] not in manifests:
                            pending.add((repo, child["digest"]))
                    for blob in ([doc["config"]] if "config" in doc else []) + doc.get("layers", []) + doc.get("blobs", []):
                        digest_path(root, blob["digest"])
                        blobs.setdefault(blob["digest"], {**blob, "repository": repo})
                except Exception as exc:
                    errors.append({"repository": repo, "digest": digest, "stage": "manifest", "error_type": type(exc).__name__,
                                   "http_status": getattr(exc, "code", None)})
    needed = sum(item["size"] for digest, item in blobs.items() if not verified(digest_path(root, digest), digest, item["size"]))
    print(json.dumps({"event": "image_graph", "roots": len(images), "manifests": len(manifests), "blobs": len(blobs),
                      "bytes_to_download": needed, "manifest_errors": len(errors)}), flush=True)
    if shutil.disk_usage(root).free < needed + 8 * 1024**3:
        raise RuntimeError("Insufficient disk space to export with 8 GiB reserve")

    def download(item):
        digest, info = item
        path = digest_path(root, digest)
        if verified(path, digest, info["size"]):
            return None
        partial = path.with_suffix(".partial")
        for attempt in range(3):
            try:
                with registry.open(info["repository"], "blobs", digest) as response, partial.open("wb") as output:
                    total = 0
                    while chunk := response.read(1024 * 1024):
                        total += len(chunk)
                        if total > info["size"]:
                            raise RuntimeError("Blob exceeds expected size")
                        output.write(chunk)
                if not verified(partial, digest, info["size"]):
                    raise RuntimeError("Blob size or SHA256 mismatch")
                os.replace(partial, path)
                return None
            except Exception as exc:
                if attempt == 2:
                    return {"digest": digest, "stage": "blob", "error_type": type(exc).__name__, "http_status": getattr(exc, "code", None)}
                time.sleep(attempt + 1)

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for completed, error in enumerate(pool.map(download, blobs.items()), 1):
            if error:
                errors.append(error)
            if completed % 25 == 0:
                print(json.dumps({"event": "image_blobs", "completed": completed, "total": len(blobs), "errors": len(errors)}), flush=True)

    def complete(digest, seen=None):
        seen = set() if seen is None else seen
        if digest in seen:
            return True
        doc = manifests.get(digest)
        if not doc or not verified(digest_path(root, digest), digest):
            return False
        for item in ([doc["config"]] if "config" in doc else []) + doc.get("layers", []) + doc.get("blobs", []):
            if not verified(digest_path(root, item["digest"]), item["digest"], item["size"]):
                return False
        if not all(complete(item["digest"], seen) for item in doc.get("manifests", [])):
            return False
        seen.add(digest)
        return True

    index = {"schemaVersion": 2, "mediaType": "application/vnd.oci.image.index.v1+json", "manifests": []}
    verified_digests = set()
    for item in images:
        digest = item["digest"]
        if not complete(digest, verified_digests):
            errors.append({"digest": digest, "stage": "verify", "error_type": "IncompleteImage"})
            continue
        descriptor = {**descriptors[digest], "annotations": {
            "org.opencontainers.image.ref.name": item["name"].split("/")[-1] + "-" + digest.split(":")[1],
            "io.ncfg.source": "cr.yandex/" + item["name"] + "@" + digest,
            "io.ncfg.original.tags": json.dumps(item.get("tags", [])),
            "io.ncfg.production": str(digest == PRODUCTION[item["name"]]).lower(),
        }}
        index["manifests"].append(descriptor)
    # Keep any previously verified production roots if a broader export is incomplete.
    prior = root / "index.json"
    if prior.exists():
        current = {item["digest"] for item in index["manifests"]}
        index["manifests"].extend(item for item in json.loads(prior.read_text())["manifests"]
                                  if item["digest"] not in current and complete(item["digest"], verified_digests))
    (root / "oci-layout").write_text('{"imageLayoutVersion":"1.0.0"}\n')
    (root / "index.json").write_text(json.dumps(index, indent=2) + "\n")
    report = {"exported_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "requested_roots": len(images),
              "verified_roots": len(index["manifests"]), "complete": not errors, "errors": errors,
              "production": PRODUCTION}
    (root / "export-report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"event": "images_verified", **{k:v for k,v in report.items() if k not in ("errors", "production")}, "errors": len(errors)}), flush=True)
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        # Network exception strings can contain signed URLs; never print them.
        print(json.dumps({"event": "export_failed", "error_type": type(error).__name__}), flush=True)
        raise SystemExit(1)
