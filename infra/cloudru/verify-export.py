#!/usr/bin/env python3
"""Independently verify stored bytes and complete OCI reference graphs."""
import argparse
import hashlib
import json
from pathlib import Path
import re


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def verify_oci(root):
    root = root.resolve()
    checked = {}
    traversed = set()
    if json.loads((root / "oci-layout").read_text()) != {"imageLayoutVersion": "1.0.0"}:
        raise ValueError("Unsupported OCI layout")

    def check_descriptor(descriptor):
        digest, size = descriptor["digest"], descriptor["size"]
        if not re.fullmatch(r"sha256:[0-9a-f]{64}", digest):
            raise ValueError("Invalid OCI digest")
        path = root / "blobs" / "sha256" / digest[7:]
        if not path.resolve().is_relative_to(root) or not path.is_file() or path.stat().st_size != size:
            raise ValueError("Missing or wrong-sized OCI object")
        if digest not in checked:
            if sha256(path) != digest[7:]:
                raise ValueError("Corrupt OCI object")
            checked[digest] = size
        return path

    def walk(descriptor):
        path = check_descriptor(descriptor)
        digest = descriptor["digest"]
        if digest in traversed:
            return
        doc = json.loads(path.read_bytes())
        if doc.get("schemaVersion") != 2 or doc.get("mediaType") != descriptor["mediaType"]:
            raise ValueError("Invalid OCI manifest")
        for child in doc.get("manifests", []):
            walk(child)
        for blob in ([doc["config"]] if "config" in doc else []) + doc.get("layers", []) + doc.get("blobs", []):
            check_descriptor(blob)
        traversed.add(digest)

    index = json.loads((root / "index.json").read_text())
    for descriptor in index["manifests"]:
        walk(descriptor)
    return {"image_roots": len(index["manifests"]), "unique_objects": len(checked), "bytes": sum(checked.values())}


def verify_media(root):
    root = root.resolve()
    manifest = json.loads((root / "manifest.json").read_text())
    if manifest.get("complete") is not True:
        raise ValueError("Source media snapshot was incomplete")
    keys = set()
    for entry in manifest["objects"]:
        path = (root / entry["path"]).resolve()
        if not path.is_relative_to(root) or entry["key"] in keys:
            raise ValueError("Invalid object mapping")
        keys.add(entry["key"])
        if path.stat().st_size != entry["size"] or sha256(path) != entry["sha256"]:
            raise ValueError("Corrupt media file")
    return {"objects": len(keys), "bytes": sum(entry["size"] for entry in manifest["objects"])}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    args = parser.parse_args()
    print(json.dumps({"media": verify_media(args.directory / "media"), "images": verify_oci(args.directory / "images")}, indent=2))


if __name__ == "__main__":
    main()
