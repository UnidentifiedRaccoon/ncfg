#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${YC_REGISTRY_ID:-}" ]]; then
  echo "YC_REGISTRY_ID is required."
  exit 1
fi

KEEP_AUTOGEN_IMAGES="${KEEP_AUTOGEN_IMAGES:-20}"
DRY_RUN="${DRY_RUN:-true}"

cleanup_repository() {
  local repository_short="$1"
  local container_prefix="$2"
  local repository="${YC_REGISTRY_ID}/${repository_short}"
  local active_tags
  local protected_tags_json
  local deletions
  local deletion_count

  echo "== Repository: ${repository} =="

  active_tags="$(
    yc serverless container list --format json \
    | jq -r --arg prefix "$container_prefix" '.[] | select(.name | startswith($prefix)) | .name' \
    | while IFS= read -r container_name; do
        [[ -z "$container_name" ]] && continue
        yc serverless container revision list --container-name "$container_name" --format json \
        | jq -r 'sort_by(.created_at) | reverse | first(.[]?) | .image.image_url // empty' \
        | awk -F: '{print $NF}'
      done \
    | awk 'NF' \
    | sort -u
  )"

  protected_tags_json="$(
    {
      echo "latest"
      echo "$active_tags"
    } \
    | awk 'NF' \
    | sort -u \
    | jq -R . \
    | jq -s .
  )"

  deletions="$(
    yc container image list \
      --registry-id "$YC_REGISTRY_ID" \
      --repository-name "$repository" \
      --format json \
    | jq -r \
        --argjson keep "$KEEP_AUTOGEN_IMAGES" \
        --argjson protected_tags "$protected_tags_json" '
          def is_auto_tag:
            test("^[0-9a-f]{40}$")
            or test("^sha256:[0-9a-f]{64}$")
            or test("^pr-[0-9]+-[0-9a-f]{40}$");

          ($protected_tags | map({key: ., value: true}) | from_entries) as $protected_set |

          def has_protected_tag($tags):
            any($tags[]?; $protected_set[.] == true);

          [
            .[]
            | .tags = (.tags // [])
            | select((has_protected_tag(.tags)) | not)
            | select((.tags | length) == 0 or all(.tags[]; is_auto_tag))
            | { id, created_at, tags }
          ]
          | sort_by(.created_at) | reverse
          | .[$keep:]
          | .[]
          | [.id, .created_at, (.tags | join(","))]
          | @tsv
        '
  )"

  if [[ -z "$deletions" ]]; then
    echo "Nothing to delete."
    return
  fi

  deletion_count="$(printf '%s\n' "$deletions" | awk 'NF' | wc -l | tr -d ' ')"
  echo "Candidates to delete: $deletion_count"
  printf '%s\n' "$deletions"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "Dry-run mode enabled, skipping deletion."
    return
  fi

  while IFS=$'\t' read -r image_id _; do
    [[ -z "$image_id" ]] && continue
    echo "Deleting image: $image_id"
    yc container image delete "$image_id"
  done <<< "$deletions"
}

cleanup_repository "ncfg-web" "ncfg-web"
cleanup_repository "ncfg-cms" "ncfg-cms"
