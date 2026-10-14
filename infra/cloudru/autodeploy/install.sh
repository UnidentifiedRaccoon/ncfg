#!/usr/bin/env bash
# Run as root on the provisioned Cloud.ru VM, from this directory.
set -euo pipefail
test "$(id -u)" = 0
test "$(hostname)" = ncfg-app-01
mountpoint -q /srv/ncfg
test -s /etc/ncfg/runtime/web.json
test -s /etc/ncfg/runtime/cms.json
umask 077
install -d -m 700 /usr/local/lib/ncfg-autodeploy /srv/ncfg/autodeploy /etc/ncfg/autodeploy-docker /srv/ncfg/buildkit-cache
export DOCKER_CONFIG=/etc/ncfg/autodeploy-docker
builder_volume=buildx_buildkit_ncfg-autodeploy0_state
if docker volume inspect "$builder_volume" >/dev/null 2>&1; then
  # Existing boot-disk caches require a stopped, verified migration first.
  test "$(docker volume inspect --format '{{index .Options "device"}}' "$builder_volume")" = /srv/ncfg/buildkit-cache
else
  docker volume create --driver local --opt type=none --opt o=bind \
    --opt device=/srv/ncfg/buildkit-cache "$builder_volume" >/dev/null
fi
install -m 600 deploy.py /usr/local/lib/ncfg-autodeploy/deploy.py
install -m 600 buildkitd.toml /usr/local/lib/ncfg-autodeploy/buildkitd.toml
if ! docker buildx inspect ncfg-autodeploy >/dev/null 2>&1; then
  docker buildx create --name ncfg-autodeploy --driver docker-container \
    --driver-opt image=moby/buildkit@sha256:de10faf919fc71ba4eb1dd7bd6449566d012b0c9436b1c61bfee21d621b009aa \
    --driver-opt memory=3g --driver-opt memory-swap=3g \
    --driver-opt cpu-period=100000 --driver-opt cpu-quota=150000 \
    --buildkitd-config /usr/local/lib/ncfg-autodeploy/buildkitd.toml
fi
docker buildx inspect ncfg-autodeploy --bootstrap
install -m 644 ncfg-autodeploy.service ncfg-autodeploy.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now ncfg-autodeploy.timer
echo 'Cloud.ru pull deployment service installed; SSH rules unchanged.'
