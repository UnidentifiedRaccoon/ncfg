# Yandex Cloud Setup Guide

## Prerequisites

- Yandex Cloud account
- `yc` CLI installed and configured
- GitHub repository with Actions enabled

## 1. Create Yandex Cloud Resources

### 1.1 Container Registry

```bash
# Create registry
yc container registry create --name ncfg-registry

# Get registry ID (save for GitHub secrets)
yc container registry get --name ncfg-registry --format json | jq -r '.id'
```

### 1.2 Managed PostgreSQL

```bash
yc managed-postgresql cluster create \
  --name ncfg-db \
  --environment production \
  --postgresql-version 16 \
  --resource-preset s2.micro \
  --disk-size 10 \
  --host zone-id=ru-central1-a,subnet-id=<SUBNET_ID> \
  --database name=strapi,owner=strapi \
  --user name=strapi,password=<SECURE_PASSWORD>
```

### 1.3 Object Storage

```bash
# Create bucket for uploads
yc storage bucket create --name ncfg-uploads

# Create service account for S3 access
yc iam service-account create --name ncfg-s3-sa
yc iam access-key create --service-account-name ncfg-s3-sa

# Set bucket policy for public read
yc storage bucket update --name ncfg-uploads --public-read
```

### 1.4 Lockbox Secrets

```bash
# Create secret
yc lockbox secret create --name ncfg-secrets

# Add secret values
yc lockbox secret add-version --name ncfg-secrets \
  --payload '[
    {"key": "database_host", "text_value": "<DB_HOST>"},
    {"key": "database_port", "text_value": "6432"},
    {"key": "database_name", "text_value": "strapi"},
    {"key": "database_username", "text_value": "strapi"},
    {"key": "database_password", "text_value": "<DB_PASSWORD>"},
    {"key": "aws_access_key_id", "text_value": "<S3_ACCESS_KEY>"},
    {"key": "aws_secret_access_key", "text_value": "<S3_SECRET_KEY>"},
    {"key": "aws_bucket", "text_value": "ncfg-uploads"},
    {"key": "app_keys", "text_value": "<RANDOM_KEY1>,<RANDOM_KEY2>,<RANDOM_KEY3>,<RANDOM_KEY4>"},
    {"key": "api_token_salt", "text_value": "<RANDOM_SALT>"},
    {"key": "admin_jwt_secret", "text_value": "<RANDOM_SECRET>"},
    {"key": "jwt_secret", "text_value": "<RANDOM_SECRET>"},
    {"key": "transfer_token_salt", "text_value": "<RANDOM_SALT>"}
  ]'

# Get secret ID (save for GitHub secrets)
yc lockbox secret get --name ncfg-secrets --format json | jq -r '.id'
```

### 1.5 Service Account for CI/CD

```bash
# Create service account
yc iam service-account create --name ncfg-deployer

# Get folder ID
yc config get folder-id

# Assign roles
yc resource-manager folder add-access-binding <FOLDER_ID> \
  --role container-registry.images.pusher \
  --service-account-name ncfg-deployer

yc resource-manager folder add-access-binding <FOLDER_ID> \
  --role serverless-containers.admin \
  --service-account-name ncfg-deployer

yc resource-manager folder add-access-binding <FOLDER_ID> \
  --role lockbox.payloadViewer \
  --service-account-name ncfg-deployer

# Create JSON key (save securely)
yc iam key create --service-account-name ncfg-deployer --output deployer-key.json
```

### 1.6 Service Account for Containers (Runtime)

```bash
# Create service account for containers to access Lockbox
yc iam service-account create --name ncfg-container-sa

yc resource-manager folder add-access-binding <FOLDER_ID> \
  --role lockbox.payloadViewer \
  --service-account-name ncfg-container-sa

# Get SA ID (save for GitHub secrets)
yc iam service-account get --name ncfg-container-sa --format json | jq -r '.id'
```

### 1.7 Serverless Containers

```bash
# Create containers (they will be updated by CI/CD)
yc serverless container create --name ncfg-web
yc serverless container create --name ncfg-cms

# Make containers public
yc serverless container allow-unauthenticated-invoke --name ncfg-web
yc serverless container allow-unauthenticated-invoke --name ncfg-cms
```

## 2. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

| Secret | Value | Description |
|--------|-------|-------------|
| `YC_SA_JSON_CREDENTIALS` | Contents of `deployer-key.json` | Service account key for CI/CD |
| `YC_REGISTRY_ID` | Registry ID from step 1.1 | Container Registry ID |
| `YC_FOLDER_ID` | Your Yandex Cloud folder ID | Folder for resources |
| `YC_CONTAINER_SA_ID` | SA ID from step 1.6 | Runtime service account |
| `YC_LOCKBOX_SECRET_ID` | Secret ID from step 1.4 | Lockbox secret ID |
| `STRAPI_URL` | `https://<cms-container-id>.containers.yandexcloud.net` | CMS URL for Next.js |
| `STRAPI_API_TOKEN` | Strapi read-only Content API token | Token for web -> Strapi API |
| `NEXT_PUBLIC_SITE_URL` | `https://<web-container-id>.containers.yandexcloud.net` | Public site URL |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | `106842784` | Yandex.Metrika counter ID |
| `POSTBOX_API_KEY_ID` | `<postbox_api_key_id>` | Postbox SMTP auth user |
| `POSTBOX_API_KEY_SECRET` | `<postbox_api_key_secret>` | Postbox SMTP auth password |
| `POSTBOX_FROM_EMAIL` | `no-reply@ncfg.ru` | Verified sender email in Postbox |
| `LEADS_RECIPIENT_EMAILS` | `aedengina@ncfg.ru,yura.posledov@yandex.ru` | Intake recipients for lead/question forms |

Optional secrets for Postbox:

| Secret | Value | Description |
|--------|-------|-------------|
| `POSTBOX_SMTP_HOST` | default `postbox.cloud.yandex.net` | Postbox SMTP host |
| `POSTBOX_SMTP_PORT` | default `465` | Postbox SMTP port |
| `LEADS_RECIPIENT_EMAIL` | optional single email | Legacy recipient fallback when CSV list is empty |

Optional secrets for extended GetCourse mapping (fallback path):

| Secret | Value | Description |
|--------|-------|-------------|
| `GETCOURSE_BASE_URL` | `https://fgrm.ncfg.ru` | GetCourse account URL |
| `GETCOURSE_API_KEY` | API key from GetCourse | Lead/question order sync key |
| `GETCOURSE_SOURCE_VALUE` | e.g. `fgrm.ncfg.ru` | Source marker stored in GetCourse |
| `GETCOURSE_DEAL_PRODUCT_TITLE_LEAD` | default `Website Lead` | Product title for lead form orders |
| `GETCOURSE_DEAL_PRODUCT_TITLE_QUESTION` | default `Website Question` | Product title for question form orders |
| `GETCOURSE_DEAL_COST` | default `0` | Cost for imported orders |
| `GETCOURSE_DEAL_STATUS` | default `new` | Initial status for imported orders |
| `GETCOURSE_DEAL_FIELD_SOURCE` | code of deal custom field in GetCourse | Save source into deal custom field |
| `GETCOURSE_DEAL_FIELD_COMPANY` | code of deal custom field in GetCourse | Save company into deal custom field |
| `GETCOURSE_DEAL_FIELD_MESSAGE` | code of deal custom field in GetCourse | Save lead message into deal custom field |
| `GETCOURSE_DEAL_FIELD_QUESTION` | code of deal custom field in GetCourse | Save question text into deal custom field |
| `GETCOURSE_DEAL_FIELD_POST_TITLE` | code of deal custom field in GetCourse | Save post title into deal custom field |
| `GETCOURSE_DEAL_FIELD_REQUEST_ID` | code of deal custom field in GetCourse | Save request ID for tracing |
| `GETCOURSE_DEAL_FIELD_FORM_TYPE` | code of deal custom field in GetCourse | Save form type (`lead` / `question`) |

To route every form submission into GetCourse tasks (`/pl/tasks/resp`) with full text, set at least:
- `GETCOURSE_DEAL_FIELD_MESSAGE`
- `GETCOURSE_DEAL_FIELD_QUESTION`
- `GETCOURSE_DEAL_FIELD_REQUEST_ID`
- `GETCOURSE_DEAL_FIELD_FORM_TYPE`

### 2.1 GetCourse task flow (manual setup in GetCourse UI)

Detailed checklist: `infra/getcourse-orders-intake.md`

1. Create **deal custom fields** in GetCourse and use their codes in `GETCOURSE_DEAL_FIELD_*` secrets.
2. Configure process on object **Orders** (`Заказы`) with launch type **Periodic check** (`Периодическая проверка`).
3. Add process filters:
   - `request_id` is set
   - `deal_status` is `new` (or value from `GETCOURSE_DEAL_STATUS`)
4. Add `Create task` action and include message/question/source/request_id in the task body.
5. Add 2 branches by `form_type`:
   - `lead`: focus on `message`
   - `question`: focus on `question` + `post_title`

### 2.2 Postbox runbook (email-first temporary intake)

1. Open Yandex Cloud Postbox and verify sender/domain for `POSTBOX_FROM_EMAIL` (recommended `no-reply@ncfg.ru`).
2. Create an API key with Postbox send permissions and save it as:
   - `POSTBOX_API_KEY_ID`
   - `POSTBOX_API_KEY_SECRET`
3. Add required and optional Postbox secrets in GitHub repository settings.
4. Deploy web (`main`) and send two smoke submissions:
   - `POST /api/lead`
   - `POST /api/question`
5. Confirm delivery to:
   - `aedengina@ncfg.ru`
   - `yura.posledov@yandex.ru`

### 2.3 Repository variables for no-coldstart profile

Add these **Repository Variables** (not Secrets) in GitHub repository settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `WEB_PROVISIONED` | `1` | Minimum warm instances for production `ncfg-web` |
| `CMS_PROVISIONED` | `1` | Minimum warm instances for production `ncfg-cms` |

Deploy workflow resolution order:
1. `workflow_dispatch` input (`web_provisioned` / `cms_provisioned`)
2. Repository variable (`WEB_PROVISIONED` / `CMS_PROVISIONED`)
3. Fallback default `1`

## 3. Get Container URLs

After first deployment:

```bash
# Get web container URL
yc serverless container get --name ncfg-web --format json | jq -r '.url'

# Get CMS container URL
yc serverless container get --name ncfg-cms --format json | jq -r '.url'
```

## 4. Local Development with Docker

```bash
cd docker
docker-compose up -d

# Services:
# - Next.js: http://localhost:3000
# - Strapi: http://localhost:1337
# - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
# - PostgreSQL: localhost:5432

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

## 5. Verify Deployment

```bash
# Check web health
curl https://<web-url>/api/health

# Check CMS health
curl https://<cms-url>/_health

# Check Strapi API
curl https://<cms-url>/api/articles
```

### 5.1 No-coldstart profile verification (production)

Target profile:
- `ncfg-web`: `provisioned=1`
- `ncfg-cms`: `provisioned=1`

Manual deploy values (`workflow_dispatch`):
- `deploy_web=true`
- `deploy_cms=true`
- `web_provisioned=1`
- `cms_provisioned=1`

Check active revision provision policy:

```bash
yc serverless container revision list --container-name ncfg-web --format json \
  | jq '[.[] | select(.status == "ACTIVE")][0] | {id, provision_policy}'

yc serverless container revision list --container-name ncfg-cms --format json \
  | jq '[.[] | select(.status == "ACTIVE")][0] | {id, provision_policy}'
```

Expected result:
- `provision_policy` is not empty
- policy value for min/provisioned instances is `1`

Daily regression guard:
- workflow `.github/workflows/coldstart-smoke.yml` runs once per day
- it fails if first-hit latency after `idle=300` is above:
  - web: `2.5s`
  - cms: `4.0s`
- if the smoke workflow fails 3 runs in a row, treat it as infrastructure incident

Rollback to scale-to-zero:

1. Set `WEB_PROVISIONED=0` and/or `CMS_PROVISIONED=0` in Repository Variables.
2. Trigger production deploy for the affected service.
3. Re-check active revision policy and verify it is empty/zero again.

## Troubleshooting

### Container logs

```bash
yc serverless container revision list --container-name ncfg-web
yc serverless container revision logs <REVISION_ID>
```

### Database connection

Ensure the PostgreSQL cluster allows connections from Serverless Containers:
- Check security groups
- Verify SSL settings
- Test with `psql` from a Cloud Function

### S3 uploads not working

- Check bucket permissions
- Verify access keys in Lockbox
- Ensure `forcePathStyle: true` in Strapi config

### Strapi crop fails with `Tainted canvases may not be exported`

If Strapi admin (`https://admin.ncfg.ru`) loads images from
`https://storage.yandexcloud.net/...`, Object Storage must return CORS headers
for this origin. Without bucket CORS, canvas export in Media Library crop fails.

Apply CORS policy:

```bash
yc storage bucket update ncfg-uploads-1770291983 \
  --cors 'id=strapi-admin-crop,allowed-origins=https://admin.ncfg.ru,allowed-methods=METHOD_GET,allowed-methods=METHOD_HEAD,allowed-headers=*,expose-headers=ETag,expose-headers=Content-Type,expose-headers=Content-Length,max-age-seconds=3000'
```

Validation:

```bash
curl -s -D - -o /dev/null \
  -H 'Origin: https://admin.ncfg.ru' \
  'https://storage.yandexcloud.net/ncfg-uploads-1770291983/Sycheva_6bbd51293b.jpg'
```

Expected headers include:
- `Access-Control-Allow-Origin: https://admin.ncfg.ru`
- `Access-Control-Allow-Methods: GET, HEAD`

## 6. Admin domain cutover plan (safe partial migration)

Use this section when you need to move only Strapi admin to `admin.ncfg.ru` and keep `ncfg.ru` / `www.ncfg.ru` on the old site.

### 6.1 Current resources in this project

- CMS container: `bbaousfesom46c65itc1` (`ncfg-cms`)
- Web container: `bban3i4dgt9p00m87f90` (`ncfg-web`)
- Service account for gateways: `ajeff6to2i9k3qapc6mo` (`ncfg-gateway-sa`)
- CMS gateway: `d5dldgvqcrea64k57ge9` (`ncfg-cms-gw`)
- Web gateway: `d5d1a3velg9e6hkj777c` (`ncfg-web-gw`)
- CMS gateway default domain: `d5dldgvqcrea64k57ge9.aqkd4clz.apigw.yandexcloud.net`
- Web gateway default domain: `d5d1a3velg9e6hkj777c.i99u1wfk.apigw.yandexcloud.net`
- Managed cert for admin: `fpqr5tupn4j7u3appq2g` (`ncfg-admin-le`)

### 6.2 What is already implemented in code/runtime

- Strapi proxy/domain config:
  - `apps/cms/config/server.js`
  - `apps/cms/config/admin.js`
  - `apps/cms/config/middlewares.js`
- Gateway specs committed:
  - `infra/apigw/cms-gw.yaml`
  - `infra/apigw/web-gw.yaml`
- CMS deploy env now includes:
  - `PUBLIC_URL=https://admin.ncfg.ru`
  - `ADMIN_URL=/admin`

### 6.3 Manual DNS actions in Yandex 360 (required)

`admin.ncfg.ru` is still not configured in DNS. Add records in Yandex 360 zone (`dns1.yandex.net` / `dns2.yandex.net`):

1. ACME challenge for certificate validation:
   - Add only one validation record type. Recommended: `CNAME`.
   - `_acme-challenge.admin.ncfg.ru` `CNAME` `fpqr5tupn4j7u3appq2g.cm.yandexcloud.net.`
   - Do not add `TXT` for the same host while `CNAME` exists.
2. Keep `ncfg.ru` and `www.ncfg.ru` unchanged for this phase.

After cert status becomes `ISSUED`, add:

3. `admin.ncfg.ru` `CNAME` `d5dldgvqcrea64k57ge9.aqkd4clz.apigw.yandexcloud.net.`

Recommended TTL: `300`.

### 6.4 Finalize domain binding in YC (after cert is issued)

```bash
# 1) check certificate status
yc certificate-manager certificate get fpqr5tupn4j7u3appq2g --full

# 2) bind custom domain to CMS gateway
yc serverless api-gateway add-domain \
  --name ncfg-cms-gw \
  --domain admin.ncfg.ru \
  --certificate-id fpqr5tupn4j7u3appq2g
```

### 6.5 Smoke checks

```bash
# gateway default domain (already should be OK)
curl -i https://d5dldgvqcrea64k57ge9.aqkd4clz.apigw.yandexcloud.net/admin/init
curl -i -H 'Authorization: Bearer test' https://d5dldgvqcrea64k57ge9.aqkd4clz.apigw.yandexcloud.net/admin/init

# custom domain (after DNS + add-domain)
curl -i https://admin.ncfg.ru/admin/init
```

Expected result for `/admin/init`: HTTP `200`, JSON payload from Strapi, no edge `403 Forbidden: Not authorized`.

### 6.6 Lock down direct CMS invoke (only after 6.5 is green)

```bash
yc serverless container deny-unauthenticated-invoke --name ncfg-cms
```

At this moment:
- direct public URL `https://bbaousfesom46c65itc1.containers.yandexcloud.net` should stop serving unauthenticated public traffic;
- `https://admin.ncfg.ru` should continue to work via API Gateway.

### 6.7 Why DNS is still changed in Yandex 360 first

Short answer: because right now the authoritative DNS for `ncfg.ru` is still Yandex 360 (`dns1.yandex.net`, `dns2.yandex.net`).

What it means in practice:

1. Any new records (`admin`, `_acme-challenge`, etc.) must be added in Yandex 360 now.
2. If you create the same records in Cloud DNS before NS switch, they are ignored by the Internet.
3. Migration to Cloud DNS becomes active only after NS delegation is changed at the registrar to:
   - `ns1.yandexcloud.net.`
   - `ns2.yandexcloud.net.`

Safe migration flow:

1. Keep NS in Yandex 360 for now.
2. Move only `admin.ncfg.ru` by adding CNAME in current Yandex 360 zone.
3. Later clone the full zone into Cloud DNS (including MX/TXT/SPF/DKIM/DMARC/service records).
4. Only then switch NS at registrar.

### 6.8 Apex (`ncfg.ru`) cutover preparation (2026-03-02)

This subsection captures the root-domain migration preparation for web gateway.

Created resources:

- Managed cert for root domain: `fpqhl7cmsr3826g2vfs8` (`ncfg-root-le`, domain `ncfg.ru`, challenge `dns`)
- Public Cloud DNS zone: `dnse7nf9d3nan3b96a4n` (`ncfg-ru-public`, zone `ncfg.ru.`)
- Cloud DNS NS for registrar delegation:
  - `ns1.yandexcloud.net.`
  - `ns2.yandexcloud.net.`

Prepared Cloud DNS records (TTL `300`):

- `ncfg.ru` `ANAME` `d5d1a3velg9e6hkj777c.i99u1wfk.apigw.yandexcloud.net.`
- `www.ncfg.ru` `CNAME` `d5d1a3velg9e6hkj777c.i99u1wfk.apigw.yandexcloud.net.`
- `admin.ncfg.ru` `CNAME` `d5dldgvqcrea64k57ge9.aqkd4clz.apigw.yandexcloud.net.`
- Mail and service records (`MX`, SPF, DKIM, DMARC, GetCourse and A-record subdomains) copied.
- Legacy TXT validation records (`globalsign`, `tci`) intentionally skipped.

Current state (`2026-03-02 08:44 UTC`):

- `_acme-challenge.ncfg.ru` CNAME is present in Yandex 360 and Cloud DNS.
- Root cert `fpqhl7cmsr3826g2vfs8` transitioned to `ISSUED`.
- Root domain `ncfg.ru` is attached to web gateway `ncfg-web-gw`.

Commands used:

```bash
yc serverless api-gateway add-domain \
  --name ncfg-web-gw \
  --domain ncfg.ru \
  --certificate-id fpqhl7cmsr3826g2vfs8
```

Remaining propagation note:

- Registry WHOIS already shows `ns1.yandexcloud.net.` / `ns2.yandexcloud.net.`
- DNS trace from `.ru` may still temporarily return old delegation (`dns1.yandex.net` / `dns2.yandex.net`) until zone propagation completes.

## 7. Deployment incident log (2026-02-12)

This section captures real issues seen during Strapi admin cutover and how they were resolved.

### 7.1 Edge `403 Forbidden` on direct container URL with `Authorization` header

Symptom:

- `https://bbaousfesom46c65itc1.containers.yandexcloud.net/admin/init` returned edge `403` when request had `Authorization: Bearer ...`.
- Example response: `{"errorCode":403,"errorMessage":"Forbidden: Not authorized","errorType":"ClientError"}`.

Cause:

- Direct invoke endpoint handled auth at edge and rejected request before Strapi logic.

Resolution:

1. Introduced API Gateway in front of CMS (`ncfg-cms-gw`) with service account integration.
2. Routed admin/API traffic through gateway domain (and planned custom domain `admin.ncfg.ru`).

Verification:

- Gateway endpoint `...apigw.yandexcloud.net/admin/init` returns `200` even with `Authorization: Bearer test` / `Bearer null`.

### 7.2 `exec format error` after custom CMS image deploy

Symptom:

- Gateway returned `502` with message:
  - `fork/exec /usr/local/bin/docker-entrypoint.sh: exec format error`

Cause:

- Image was built for incompatible architecture on local machine.

Resolution:

1. Rebuilt CMS image explicitly for `linux/amd64`:
   - `docker buildx build --platform linux/amd64 ... --push`
2. Redeployed `ncfg-cms` with the new amd64 tag.

Verification:

- CMS revision became `ACTIVE`.
- `/admin/init` and `/_health` via gateway returned normal Strapi responses.

### 7.3 Build/push failure: missing Docker credential helper in temporary config

Symptom:

- Buildx push failed with:
  - `error getting credentials - exec: "docker-credential-yc": executable file not found`

Cause:

- Temporary `DOCKER_CONFIG` had credentials settings but was missing buildx plugin wiring.

Resolution:

1. Added `docker-buildx` plugin path into temporary Docker config.
2. Re-ran build/push with that config.

Verification:

- Image manifest was pushed to `cr.yandex` and deploy succeeded.

### 7.4 Certificate could not be attached to gateway

Symptom:

- `yc serverless api-gateway add-domain ...` failed:
  - `Certificate ... is not valid for domain admin.ncfg.ru`

Cause:

- Managed certificate status was `VALIDATING` because DNS challenge records were not yet present in authoritative DNS.

Resolution:

1. Add challenge records in Yandex 360 zone:
   - Add one record type only (recommended CNAME for automatic renewals).
   - `_acme-challenge.admin.ncfg.ru` CNAME
2. Wait for cert status `ISSUED`.
3. Retry `add-domain` and then add `admin` CNAME to gateway default domain.
