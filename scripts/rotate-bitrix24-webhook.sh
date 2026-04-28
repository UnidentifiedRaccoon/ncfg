#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/apps/web/.env.local"
LOCKBOX_SECRET_NAME="ncfg-secrets"
GITHUB_REPO="UnidentifiedRaccoon/ncfg"
GITHUB_PRODUCTION_ENV="production"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

restore_tty() {
  stty echo 2>/dev/null || true
}

trap restore_tty EXIT

require_command curl
require_command gh
require_command jq
require_command node
require_command yc

printf 'Paste new BITRIX24_WEBHOOK_URL (input hidden): '
stty -echo
IFS= read -r BITRIX24_WEBHOOK_URL
stty echo
printf '\n'

if [ -z "$BITRIX24_WEBHOOK_URL" ]; then
  printf 'No value entered; nothing changed.\n' >&2
  exit 1
fi

case "$BITRIX24_WEBHOOK_URL" in
  https://*/rest/*/*/|https://*/rest/*/*) ;;
  *)
    printf 'Value does not look like a Bitrix24 incoming webhook URL. Nothing changed.\n' >&2
    exit 1
    ;;
esac

tmp_file="$(mktemp)"
if [ -f "$ENV_FILE" ]; then
  grep -v -E '^(BITRIX24_WEBHOOK_URL|BITRIX24_LEAD_ENABLED|BITRIX24_LEAD_SOURCE_ID|BITRIX24_LEAD_STAGE_ID|BITRIX24_LEAD_TITLE|BITRIX24_LEAD_ORIGINATOR_ID|BITRIX24_LEAD_ASSIGNED_BY_ID)=' "$ENV_FILE" > "$tmp_file" || true
else
  : > "$tmp_file"
fi

{
  printf '\n# Bitrix24 lead fan-out (local)\n'
  printf 'BITRIX24_WEBHOOK_URL=%s\n' "$BITRIX24_WEBHOOK_URL"
  printf 'BITRIX24_LEAD_ENABLED=true\n'
  printf 'BITRIX24_LEAD_SOURCE_ID=WEB\n'
  printf 'BITRIX24_LEAD_STAGE_ID=10\n'
  printf 'BITRIX24_LEAD_TITLE=Заявка с сайта NCFG\n'
  printf 'BITRIX24_LEAD_ORIGINATOR_ID=ncfg-website\n'
  printf 'BITRIX24_LEAD_ASSIGNED_BY_ID=\n'
} >> "$tmp_file"

mv "$tmp_file" "$ENV_FILE"
chmod 600 "$ENV_FILE"
printf 'Local env updated.\n'

webhook_base="${BITRIX24_WEBHOOK_URL%/}/"

profile_json="$(curl -sS -X POST "${webhook_base}profile")"
scope_json="$(curl -sS -X POST "${webhook_base}scope")"
mode_json="$(curl -sS -X POST "${webhook_base}crm.settings.mode.get")"

profile_id="$(printf '%s' "$profile_json" | jq -r '.result.ID // empty')"
profile_admin="$(printf '%s' "$profile_json" | jq -r '.result.ADMIN // empty')"
scope_has_crm="$(printf '%s' "$scope_json" | jq -r '(.result // []) | index("crm") != null')"
mode_result="$(printf '%s' "$mode_json" | jq -r '.result // empty')"

if [ -z "$profile_id" ] || [ "$scope_has_crm" != "true" ] || [ -z "$mode_result" ]; then
  printf 'Webhook validation failed; Lockbox was not changed.\n' >&2
  printf 'profile_id=%s scope_has_crm=%s mode=%s\n' "${profile_id:-missing}" "$scope_has_crm" "${mode_result:-missing}" >&2
  exit 1
fi

printf 'Webhook validated: user_id=%s admin=%s crm_scope=true crm_mode=%s.\n' "$profile_id" "$profile_admin" "$mode_result"

payload="$(jq -nc --arg url "$BITRIX24_WEBHOOK_URL" '[{"key":"BITRIX24_WEBHOOK_URL","text_value":$url}]')"
response="$(yc lockbox secret add-version \
  --name "$LOCKBOX_SECRET_NAME" \
  --description "Rotate Bitrix24 webhook for web lead fan-out" \
  --payload "$payload" \
  --format json)"
new_version_id="$(printf '%s' "$response" | jq -r '.id // .version_id // .version.id // empty')"

if [ -z "$new_version_id" ]; then
  printf 'Failed to parse new Lockbox version id.\n' >&2
  exit 1
fi

printf 'Lockbox version created: %s\n' "$new_version_id"

gh secret set YC_LOCKBOX_VERSION_ID --repo "$GITHUB_REPO" --body "$new_version_id" >/dev/null
gh secret set YC_LOCKBOX_VERSION_ID --repo "$GITHUB_REPO" --env "$GITHUB_PRODUCTION_ENV" --body "$new_version_id" >/dev/null
printf 'GitHub YC_LOCKBOX_VERSION_ID updated for repository and %s environment.\n' "$GITHUB_PRODUCTION_ENV"

export BITRIX24_WEBHOOK_URL
export REQUEST_ID="codex-rotated-webhook-$(date -u +%Y%m%d%H%M%S)"

lead_id="$(node --input-type=module <<'NODE'
const webhookUrl = process.env.BITRIX24_WEBHOOK_URL.replace(/\/?$/, '/');
const requestId = process.env.REQUEST_ID;
const payload = {
  entityTypeId: 1,
  fields: {
    title: '[TEST] NCFG rotated webhook smoke',
    name: 'Тестовый лид Codex',
    companyTitle: 'NCFG тест',
    sourceId: 'WEB',
    stageId: '10',
    opened: 'Y',
    comments: [
      'Форма: Заявка с сайта',
      'Имя: Тестовый лид Codex',
      'Email: codex-rotated-smoke@example.com',
      'Телефон: +79990000000',
      'Компания: NCFG тест',
      'Сообщение: Smoke test for rotated Bitrix24 webhook',
      'Страница: https://ncfg.ru/#lead-form',
      `Request ID: ${requestId}`,
      'IP: 127.0.0.1',
      'User-Agent: Codex rotated webhook smoke test',
    ].join('\n'),
    originatorId: 'ncfg-website',
    originId: requestId,
    ufCrmFormname: 'lead',
    ufCrmTranid: requestId,
    fm: [
      { typeId: 'EMAIL', valueType: 'WORK', value: 'codex-rotated-smoke@example.com' },
      { typeId: 'PHONE', valueType: 'WORK', value: '+79990000000' },
    ],
  },
};
const res = await fetch(`${webhookUrl}crm.item.add`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const json = await res.json();
if (!res.ok || json.error) {
  throw new Error(json.error_description || json.error || `HTTP ${res.status}`);
}
console.log(json.result?.item?.id ?? 'unknown');
NODE
)"

printf 'Smoke lead created: %s\n' "$lead_id"
printf 'Done. You can close this terminal window.\n'
