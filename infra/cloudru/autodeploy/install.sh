#!/usr/bin/env bash
# Run as root on the provisioned Cloud.ru VM, from this directory.
set -euo pipefail
test "$(id -u)" = 0
test "$(hostname)" = ncfg-app-01
mountpoint -q /srv/ncfg
test -s /etc/ncfg/runtime/web.json
test -s /etc/ncfg/runtime/cms.json
umask 077
install -d -m 700 /usr/local/lib/ncfg-autodeploy /srv/ncfg/autodeploy
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
