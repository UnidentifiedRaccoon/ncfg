#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${YC_REGISTRY_ID:-}" ]]; then
  echo "YC_REGISTRY_ID is required."
  exit 1
fi

KEEP_AUTOGEN_IMAGES="${KEEP_AUTOGEN_IMAGES:-20}"
DRY_RUN="${DRY_RUN:-true}"

is_not_found_error() {
  local message="$1"
  [[ "$message" == *"ERROR: rpc error: code = NotFound"* ]]
}

is_used_by_image_lists_error() {
  local message="$1"
  [[ "$message" == *"are used by image lists"* ]]
}

extract_image_list_ids_from_error() {
  local message="$1"
  printf '%s\n' "$message" \
    | sed -n 's/.*image lists //p' \
    | tr ', ' '\n' \
    | awk '/^crp[a-z0-9]+$/'
}

image_has_protected_tag() {
  local image_id="$1"
  local protected_tags_file="$2"
  local tags

  tags="$(
    yc container image get "$image_id" --format json 2>/dev/null \
      | jq -r '.tags[]?' \
      || true
  )"

  if [[ -z "$tags" ]]; then
    return 1
  fi

  while IFS= read -r tag; do
    if grep -Fxq "$tag" "$protected_tags_file"; then
      return 0
    fi
  done <<< "$tags"

  return 1
}

delete_image_with_dependencies() {
  local image_id="$1"
  local protected_tags_file="$2"
  local output
  local image_list_ids
  local deleted_linked_list=false

  if output="$(yc container image delete "$image_id" 2>&1)"; then
    [[ -n "$output" ]] && printf '%s\n' "$output"
    return 0
  fi

  if is_not_found_error "$output"; then
    echo "Skipping image $image_id: already deleted."
    return 2
  fi

  if ! is_used_by_image_lists_error "$output"; then
    printf '%s\n' "$output" >&2
    return 1
  fi

  image_list_ids="$(extract_image_list_ids_from_error "$output" | sort -u)"
  if [[ -z "$image_list_ids" ]]; then
    echo "Skipping image $image_id: referenced by image lists, but ids are not parseable."
    return 2
  fi

  while IFS= read -r image_list_id; do
    [[ -z "$image_list_id" ]] && continue

    if image_has_protected_tag "$image_list_id" "$protected_tags_file"; then
      echo "Skipping linked image list $image_list_id: protected by active tag."
      continue
    fi

    echo "Deleting linked image list: $image_list_id"
    if output="$(yc container image delete "$image_list_id" 2>&1)"; then
      [[ -n "$output" ]] && printf '%s\n' "$output"
      deleted_linked_list=true
      continue
    fi

    if is_not_found_error "$output"; then
      echo "Linked image list $image_list_id is already deleted."
      deleted_linked_list=true
      continue
    fi

    echo "Failed to delete linked image list $image_list_id:"
    printf '%s\n' "$output"
  done <<< "$image_list_ids"

  if [[ "$deleted_linked_list" == true ]]; then
    echo "Retrying image delete after linked image list cleanup: $image_id"
    if output="$(yc container image delete "$image_id" 2>&1)"; then
      [[ -n "$output" ]] && printf '%s\n' "$output"
      return 0
    fi

    if is_not_found_error "$output"; then
      echo "Image $image_id is already deleted after retry."
      return 2
    fi

    echo "Failed to delete image $image_id after retry:"
    printf '%s\n' "$output"
    return 2
  fi

  echo "Skipping image $image_id: linked image lists are protected or unavailable."
  return 2
}

cleanup_repository() {
  local repository_short="$1"
  local container_prefix="$2"
  local repository="${YC_REGISTRY_ID}/${repository_short}"
  local active_tags
  local protected_tags_file
  local protected_tags_json
  local deletions
  local deletion_count
  local deleted_count=0
  local skipped_count=0
  local failed_count=0
  local rc=0

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

  protected_tags_file="$(mktemp)"
  printf '%s\n' "$protected_tags_json" | jq -r '.[]' > "$protected_tags_file"

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
    rm -f "$protected_tags_file"
    return
  fi

  deletion_count="$(printf '%s\n' "$deletions" | awk 'NF' | wc -l | tr -d ' ')"
  echo "Candidates to delete: $deletion_count"
  printf '%s\n' "$deletions"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "Dry-run mode enabled, skipping deletion."
    rm -f "$protected_tags_file"
    return
  fi

  while IFS=$'\t' read -r image_id _; do
    [[ -z "$image_id" ]] && continue
    echo "Deleting image: $image_id"
    if delete_image_with_dependencies "$image_id" "$protected_tags_file"; then
      ((deleted_count += 1))
      continue
    fi

    rc=$?
    if [[ "$rc" -eq 2 ]]; then
      ((skipped_count += 1))
      continue
    fi

    ((failed_count += 1))
  done <<< "$deletions"

  rm -f "$protected_tags_file"

  echo "Deletion summary: deleted=$deleted_count skipped=$skipped_count failed=$failed_count"
  if [[ "$failed_count" -gt 0 ]]; then
    echo "Retention cleanup completed with failures."
    return 1
  fi
}

cleanup_repository "ncfg-web" "ncfg-web"
cleanup_repository "ncfg-cms" "ncfg-cms"
