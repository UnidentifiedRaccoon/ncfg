#!/usr/bin/env bash

set -euo pipefail

# Measure warm/cold request latency for Yandex Serverless Containers.
# Usage examples:
#   ./scripts/measure-serverless-coldstart.sh \
#     --target web=https://example.containers.yandexcloud.net/api/health \
#     --target cms=https://example.containers.yandexcloud.net/_health
#
# Optional:
#   --warm-count 8
#   --warm-interval 2
#   --idle-seq 30,60,120,300
#   --out reports/coldstart-$(date +%Y%m%d-%H%M%S).csv

WARM_COUNT=8
WARM_INTERVAL=2
IDLE_SEQ="30,60,120,300"
OUT_FILE=""
declare -a TARGETS=()

usage() {
  cat <<'EOF'
Usage:
  measure-serverless-coldstart.sh --target name=url [--target name=url ...] [options]

Required:
  --target name=url         Probe target. Repeat flag for multiple targets.

Options:
  --warm-count N            Number of warm baseline requests per target (default: 8)
  --warm-interval SEC       Sleep between warm baseline requests (default: 2)
  --idle-seq A,B,C          Idle pauses in seconds before first-hit probe (default: 30,60,120,300)
  --out FILE                Write CSV report to FILE (default: reports/coldstart-<timestamp>.csv)
  -h, --help                Show this help
EOF
}

while (($# > 0)); do
  case "$1" in
    --target)
      if (($# < 2)); then
        echo "Missing value after --target" >&2
        exit 1
      fi
      TARGETS+=("$2")
      shift 2
      ;;
    --warm-count)
      WARM_COUNT="$2"
      shift 2
      ;;
    --warm-interval)
      WARM_INTERVAL="$2"
      shift 2
      ;;
    --idle-seq)
      IDLE_SEQ="$2"
      shift 2
      ;;
    --out)
      OUT_FILE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ((${#TARGETS[@]} == 0)); then
  echo "At least one --target is required" >&2
  usage >&2
  exit 1
fi

if [[ -z "$OUT_FILE" ]]; then
  mkdir -p reports
  OUT_FILE="reports/coldstart-$(date +%Y%m%d-%H%M%S).csv"
else
  mkdir -p "$(dirname "$OUT_FILE")"
fi

IFS=',' read -r -a IDLE_STEPS <<< "$IDLE_SEQ"

# CSV header
echo "ts,target,phase,idle_sec,attempt,http_code,time_namelookup,time_connect,time_appconnect,time_pretransfer,time_starttransfer,time_total,remote_ip,remote_port,url" > "$OUT_FILE"

probe_once() {
  local target_name="$1"
  local phase="$2"
  local idle_sec="$3"
  local attempt="$4"
  local url="$5"

  local raw
  raw="$(curl -sS -o /dev/null \
    --max-time 180 \
    --connect-timeout 10 \
    -w '%{http_code},%{time_namelookup},%{time_connect},%{time_appconnect},%{time_pretransfer},%{time_starttransfer},%{time_total},%{remote_ip},%{remote_port}' \
    "$url" || echo '000,0,0,0,0,0,0,,')"

  local ts
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf '%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n' \
    "$ts" "$target_name" "$phase" "$idle_sec" "$attempt" "$raw" "$url" >> "$OUT_FILE"

  IFS=',' read -r code _nl _co _ac _pre _st total rip rport <<< "$raw"
  printf '[%s] target=%s phase=%s idle=%ss attempt=%s code=%s total=%ss starttransfer=%ss ip=%s:%s\n' \
    "$ts" "$target_name" "$phase" "$idle_sec" "$attempt" "$code" "$total" "$_st" "$rip" "$rport"
}

for item in "${TARGETS[@]}"; do
  name="${item%%=*}"
  url="${item#*=}"

  if [[ -z "$name" || -z "$url" || "$name" == "$url" ]]; then
    echo "Invalid --target format: $item (expected name=url)" >&2
    exit 1
  fi

  echo
  echo "=== Target: $name ($url) ==="
  echo "Warm baseline: $WARM_COUNT requests, interval ${WARM_INTERVAL}s"

  for ((i=1; i<=WARM_COUNT; i++)); do
    probe_once "$name" "warm_baseline" "0" "$i" "$url"
    if ((i < WARM_COUNT)); then
      sleep "$WARM_INTERVAL"
    fi
  done

  for idle in "${IDLE_STEPS[@]}"; do
    idle_trimmed="${idle// /}"
    echo
    echo "Idle ${idle_trimmed}s ..."
    sleep "$idle_trimmed"
    probe_once "$name" "after_idle_first" "$idle_trimmed" "1" "$url"
    probe_once "$name" "after_idle_followup" "$idle_trimmed" "2" "$url"
  done
done

echo
echo "Report saved: $OUT_FILE"

