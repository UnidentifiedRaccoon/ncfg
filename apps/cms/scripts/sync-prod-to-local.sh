#!/usr/bin/env bash
set -euo pipefail

# Sync production Strapi data into local Strapi database:
# 1) Optional local backup.
# 2) Export from production DB (credentials from Yandex Lockbox).
# 3) Import into local DB.
# 4) Lightweight verification.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CMS_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

LOCKBOX_SECRET_ID="${YC_LOCKBOX_SECRET_ID:-e6qdhpk7sa19oiqk8m6s}"
LOCKBOX_VERSION_ID="${YC_LOCKBOX_VERSION_ID:-}"
TMP_DIR="${SYNC_TMP_DIR:-/tmp}"

REMOTE_PUBLIC_URL="${REMOTE_PUBLIC_URL:-https://admin.ncfg.ru}"
REMOTE_ADMIN_URL="${REMOTE_ADMIN_URL:-/admin}"
REMOTE_AWS_REGION="${REMOTE_AWS_REGION:-ru-central1}"
REMOTE_AWS_ENDPOINT="${REMOTE_AWS_ENDPOINT:-https://storage.yandexcloud.net}"
REMOTE_DATABASE_SSL="${REMOTE_DATABASE_SSL:-true}"
REMOTE_DATABASE_SSL_REJECT_UNAUTHORIZED="${REMOTE_DATABASE_SSL_REJECT_UNAUTHORIZED:-false}"

SKIP_LOCAL_BACKUP=0
SKIP_VERIFY=0

usage() {
  cat <<'EOF'
Usage: sync-prod-to-local.sh [options]

Options:
  --skip-local-backup          Skip local backup before import
  --skip-verify                Skip post-import verification query
  --lockbox-secret-id <id>     Override Lockbox secret id
  --lockbox-version-id <id>    Optional Lockbox version id
  --tmp-dir <path>             Directory for export/import archives (default: /tmp)
  -h, --help                   Show help

Environment overrides:
  YC_LOCKBOX_SECRET_ID
  YC_LOCKBOX_VERSION_ID
  SYNC_TMP_DIR
  REMOTE_PUBLIC_URL
  REMOTE_ADMIN_URL
  REMOTE_AWS_REGION
  REMOTE_AWS_ENDPOINT
  REMOTE_DATABASE_SSL
  REMOTE_DATABASE_SSL_REJECT_UNAUTHORIZED
EOF
}

log() {
  echo "[sync-prod-to-local] $*"
}

fail() {
  echo "[sync-prod-to-local] ERROR: $*" >&2
  exit 1
}

require_cmd() {
  local cmd="$1"
  command -v "${cmd}" >/dev/null 2>&1 || fail "Missing required command: ${cmd}"
}

is_port_1337_busy() {
  lsof -nP -iTCP:1337 -sTCP:LISTEN >/dev/null 2>&1
}

get_lockbox_value() {
  local key="$1"
  if [[ -n "${LOCKBOX_VERSION_ID}" ]]; then
    yc lockbox payload get \
      --id "${LOCKBOX_SECRET_ID}" \
      --version-id "${LOCKBOX_VERSION_ID}" \
      --key "${key}"
  else
    yc lockbox payload get \
      --id "${LOCKBOX_SECRET_ID}" \
      --key "${key}"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-local-backup)
      SKIP_LOCAL_BACKUP=1
      ;;
    --skip-verify)
      SKIP_VERIFY=1
      ;;
    --lockbox-secret-id)
      [[ $# -gt 1 ]] || fail "Missing value for --lockbox-secret-id"
      LOCKBOX_SECRET_ID="$2"
      shift
      ;;
    --lockbox-version-id)
      [[ $# -gt 1 ]] || fail "Missing value for --lockbox-version-id"
      LOCKBOX_VERSION_ID="$2"
      shift
      ;;
    --tmp-dir)
      [[ $# -gt 1 ]] || fail "Missing value for --tmp-dir"
      TMP_DIR="$2"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown option: $1"
      ;;
  esac
  shift
done

require_cmd npm
require_cmd yc
require_cmd lsof

[[ -d "${TMP_DIR}" ]] || fail "TMP directory does not exist: ${TMP_DIR}"

if is_port_1337_busy; then
  fail "Port 1337 is busy. Stop local Strapi before sync (to avoid import conflicts)."
fi

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
LOCAL_BACKUP_BASE="${TMP_DIR%/}/ncfg_local_backup_before_sync_${TIMESTAMP}"
REMOTE_EXPORT_BASE="${TMP_DIR%/}/ncfg_remote_from_prod_${TIMESTAMP}"
REMOTE_ARCHIVE="${REMOTE_EXPORT_BASE}.tar.gz"

cd "${CMS_DIR}"

if [[ "${SKIP_LOCAL_BACKUP}" -eq 0 ]]; then
  log "Creating local backup archive: ${LOCAL_BACKUP_BASE}.tar.gz"
  npm run strapi -- export --no-encrypt --file "${LOCAL_BACKUP_BASE}" --only content,files
fi

log "Reading production credentials from Lockbox: ${LOCKBOX_SECRET_ID}"
REMOTE_DATABASE_HOST="$(get_lockbox_value DATABASE_HOST)"
REMOTE_DATABASE_PORT="$(get_lockbox_value DATABASE_PORT)"
REMOTE_DATABASE_NAME="$(get_lockbox_value DATABASE_NAME)"
REMOTE_DATABASE_USERNAME="$(get_lockbox_value DATABASE_USERNAME)"
REMOTE_DATABASE_PASSWORD="$(get_lockbox_value DATABASE_PASSWORD)"
REMOTE_APP_KEYS="$(get_lockbox_value APP_KEYS)"
REMOTE_API_TOKEN_SALT="$(get_lockbox_value API_TOKEN_SALT)"
REMOTE_ADMIN_JWT_SECRET="$(get_lockbox_value ADMIN_JWT_SECRET)"
REMOTE_TRANSFER_TOKEN_SALT="$(get_lockbox_value TRANSFER_TOKEN_SALT)"
REMOTE_JWT_SECRET="$(get_lockbox_value JWT_SECRET)"
REMOTE_AWS_BUCKET="$(get_lockbox_value AWS_BUCKET)"
REMOTE_AWS_ACCESS_KEY_ID="$(get_lockbox_value AWS_ACCESS_KEY_ID)"
REMOTE_AWS_SECRET_ACCESS_KEY="$(get_lockbox_value AWS_SECRET_ACCESS_KEY)"

log "Exporting production content to archive: ${REMOTE_ARCHIVE}"
DATABASE_CLIENT=postgres \
DATABASE_HOST="${REMOTE_DATABASE_HOST}" \
DATABASE_PORT="${REMOTE_DATABASE_PORT}" \
DATABASE_NAME="${REMOTE_DATABASE_NAME}" \
DATABASE_USERNAME="${REMOTE_DATABASE_USERNAME}" \
DATABASE_PASSWORD="${REMOTE_DATABASE_PASSWORD}" \
DATABASE_SSL="${REMOTE_DATABASE_SSL}" \
DATABASE_SSL_REJECT_UNAUTHORIZED="${REMOTE_DATABASE_SSL_REJECT_UNAUTHORIZED}" \
APP_KEYS="${REMOTE_APP_KEYS}" \
API_TOKEN_SALT="${REMOTE_API_TOKEN_SALT}" \
ADMIN_JWT_SECRET="${REMOTE_ADMIN_JWT_SECRET}" \
TRANSFER_TOKEN_SALT="${REMOTE_TRANSFER_TOKEN_SALT}" \
JWT_SECRET="${REMOTE_JWT_SECRET}" \
AWS_BUCKET="${REMOTE_AWS_BUCKET}" \
AWS_ACCESS_KEY_ID="${REMOTE_AWS_ACCESS_KEY_ID}" \
AWS_SECRET_ACCESS_KEY="${REMOTE_AWS_SECRET_ACCESS_KEY}" \
AWS_REGION="${REMOTE_AWS_REGION}" \
AWS_ENDPOINT="${REMOTE_AWS_ENDPOINT}" \
PUBLIC_URL="${REMOTE_PUBLIC_URL}" \
ADMIN_URL="${REMOTE_ADMIN_URL}" \
npm run strapi -- export --no-encrypt --file "${REMOTE_EXPORT_BASE}" --only content,files

[[ -f "${REMOTE_ARCHIVE}" ]] || fail "Remote export archive not found: ${REMOTE_ARCHIVE}"

log "Importing archive into local database"
npm run strapi -- import --file "${REMOTE_ARCHIVE}" --force --only content,files

if [[ "${SKIP_VERIFY}" -eq 0 ]]; then
  log "Running post-import verification"
  node - <<'NODE'
const { createStrapi } = require('@strapi/strapi');

(async () => {
  const app = await createStrapi({ distDir: './dist' }).load();
  const news = await app.documents('api::news-article.news-article').findMany({
    status: 'published',
    sort: ['publishedDate:desc', 'createdAt:desc'],
    pagination: { page: 1, pageSize: 5 },
  });

  console.log(`[sync-prod-to-local] published news count (top page): ${news.length}`);
  if (news[0]) {
    console.log(`[sync-prod-to-local] latest slug: ${news[0].slug}`);
    console.log(
      `[sync-prod-to-local] latest published date: ${news[0].publishedDate || news[0].createdAt}`
    );
  }

  await app.destroy();
})();
NODE
fi

log "Sync completed successfully"
log "Remote export archive: ${REMOTE_ARCHIVE}"
if [[ "${SKIP_LOCAL_BACKUP}" -eq 0 ]]; then
  log "Local backup archive: ${LOCAL_BACKUP_BASE}.tar.gz"
fi
