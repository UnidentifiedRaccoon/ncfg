#!/usr/bin/env bash
set -euo pipefail

image="${1:?Previous production image is required}"
destination="${2:?History directory is required}"

# No container is started and no application environment/secrets are read.
# A failed pull must fail the build instead of silently losing the history.
docker pull "$image"
container="$(docker create "$image")"
trap 'docker rm "$container" >/dev/null' EXIT
mkdir -p "$destination/static"
docker cp "$container:/app/.next/static/." "$destination/static/"

# Pre-migration images have no history manifest: all their files are current.
# Treat only a missing file as optional; other Docker errors still fail.
if docker cp "$container:/app/.next/static-history.json" "$destination/manifest.json" 2>"$destination/manifest-copy-error.log"; then
  rm "$destination/manifest-copy-error.log"
elif grep -q 'Could not find the file' "$destination/manifest-copy-error.log"; then
  rm "$destination/manifest-copy-error.log"
else
  cat "$destination/manifest-copy-error.log" >&2
  exit 1
fi
