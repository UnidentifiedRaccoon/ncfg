# Cloud.ru Secret Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the remaining NCFG Yandex Lockbox dependency with Cloud.ru Secret Management and establish evidence for retiring legacy database and image resources.

**Architecture:** Store current Cloud.ru runtime settings separately from the development read token. Retrieve secrets through the documented IAM and Secret Management APIs; keep secret values in memory locally, with a root-only validated runtime cache on the VM. Pin versions during rollout, keep the working service running on a failed retrieval, and retain encrypted recovery archives independently of the service.

**Tech Stack:** Node.js 22, Python 3 standard library, Cloud.ru Evolution IAM and Secret Management v2 API, PostgreSQL 16, age, Restic.

**Spec:** User request in this chat on 2026-11-03: audit a fresh Cloud.ru snapshot, decide whether to retain the two old databases, migrate Lockbox, and assess obsolete containers/278 Registry images. Original migration constraints are in the user attachment `Pasted text.txt` and the private audit checkpoint `.local-backups/cloudru-audit-20261103/NEXT-STEPS.md`.

## Global Constraints

- Never print or commit secret values, credentials, database records, or raw API error bodies.
- Do not start stopped paid Yandex databases or pay debt without separate authorization.
- Do not overwrite the production database with a restoration.
- Keep Postbox; do not send test mail or submit production forms.
- Do not delete databases, secrets, images, or preview resources merely because they appear unused; prepare the exact list and remaining recovery risks first.
- Preserve shared Yandex network/subnet resources used by FinPulse and VRK.
- Do not switch or pull the user's working branch. Implement code in an isolated worktree if development begins.
- Existing files under `/etc/ncfg/runtime` remain the rollback path until remote retrieval is verified.

## Review Focus

- Expired credentials, HTTP 403, redirects, or unavailable Secret Management: reject safely without printing bodies or disrupting the running service.
- Empty/malformed payload, disabled version, wrong project or secret path: reject before changing runtime files.
- Development receives only the production read token, never production write, mail, CRM, CMS signing, or Cloud.ru bootstrap credentials in the child environment.
- A newer secret version must not silently alter a deployment using a pinned version.
- Database comparison must account for media URL migration and Strapi component ID replacement, while preserving evidence of actual record changes.

### Task 1: Verify recoverability and compare database contents

**Files:** Private `.local-backups/cloudru-consolidation-20261103/{audit-databases.py,database-content-audit.json,offsite-backup-verification.json,registry-current-check.json}`.

**Interfaces:** Reads verified PostgreSQL dumps and archive metadata; produces aggregate reports without record values.

- [x] Download the latest existing Restic snapshot, verify all repository data and restored files.
- [x] Restore historical and current dumps as a non-superuser into isolated PostgreSQL with no TCP listeners.
- [x] Compare all public tables, normalize the two historical media origins, and compare diagnostic answers under their parent/order.
- [x] Compare current Registry digests with the verified OCI archive.
- [ ] Capture a new on-demand live snapshot after SSH access is available; repeat the same checks against it.
- [ ] Record a retention recommendation separately for original and rescue clusters, including the uninspected post-October-11 source-disk interval.

### Task 2: Provision and verify the secret destination

**Files:** Private migration manifest and encrypted recovery package under `.local-backups/cloudru-consolidation-20261103/`.

**Interfaces:** Uses authenticated Cloud.ru IAM identity and the actual current runtime files. Produces verified secret paths/version identifiers and access scopes, not plaintext payload files.

- [ ] Obtain a current authenticated Cloud.ru session; inspect existing Secret Management resources and IAM scopes.
- [ ] Create separate development and production access identities with the narrowest supported scopes; do not grant development access to production write credentials.
- [ ] Stage `ncfg/development` containing only `STRAPI_PROD_API_TOKEN` from the active development secret; verify read-only CMS access.
- [ ] Stage `ncfg/production-web` and `ncfg/production-cms` from current Cloud.ru runtime settings, not historical Yandex database/storage configuration.
- [ ] Read back exact versions and compare payloads in memory, writing only IDs, key names and equality results to the manifest.
- [ ] Verify the development identity cannot read production payloads before using it in local development.

### Task 3: Integrate and verify consumers

**Files:** Proposed `scripts/cloudru-secrets.mjs`, `scripts/cloudru-secrets.test.mjs`, `scripts/dev.mjs`, `scripts/dev-lib.mjs`, `scripts/dev.test.mjs`, `DEVELOPMENT.md`, and a small Cloud.ru runtime synchronization module with tests under `infra/cloudru/`.

**Interfaces:** `readCloudruSecret({projectId, path, version, credentials}, {fetchImpl})` returns parsed JSON in memory. IAM endpoint is `https://iam.api.cloud.ru/api/v1/auth/token`; payload endpoint is `https://secretmanager.api.cloud.ru/v2/version/{path}` with `projectId` and explicit `version` query parameters. Responses encode the JSON payload as base64.

- [ ] Write failing tests for valid pinned retrieval, denied access, timeout/redirect rejection, malformed/empty payload, and no sensitive error output; implement the minimal client and run them.
- [ ] Test development token extraction and removal of Cloud.ru bootstrap credentials from all spawned web/CMS environments; implement the launcher integration.
- [ ] Stage runtime synchronization with validation and atomic replacement of the existing protected cache; test retrieval failure leaves the cache unchanged.
- [ ] Verify real retrieval and exact current runtime equality before switching consumers; keep running containers and outbound integrations unchanged during this check.
- [ ] Run focused launcher and infrastructure tests; perform the read-only CMS readiness check and a deployment dry run without submitting forms.
- [ ] Update documentation with authentication, pinned versions, failure behavior, and rollback. Do not claim deployment or cloud provisioning from local tests alone.

### Task 4: Prepare retirement decisions

**Files:** Private audit report and cleanup proposal.

**Interfaces:** Consumes successful recovery, runtime retrieval, access-denial, and dependency checks.

- [ ] Verify current production and developer workflows no longer need Yandex Lockbox or Registry.
- [ ] List the four obsolete preview containers and all 278 archived image digests as explicit cleanup candidates; retain the two already-completed production-container deletion records.
- [ ] Present exact old-secret/database retirement consequences and unresolved data intervals for the user's decision before irreversible deletion.

## Execution checkpoint

2026-11-03: Task 1 existing-backup verification completed. Cloud.ru console session expired; user login requested. No new live SSH snapshot, Secret Management provisioning, consumer switch, or deletion has been performed in this phase. Implementation is gated by verifying the actual Cloud.ru identities and their supported access scopes; do not switch a working launcher to an unprovisioned destination.
