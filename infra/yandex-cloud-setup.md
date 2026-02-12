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
| `NEXT_PUBLIC_SITE_URL` | `https://<web-container-id>.containers.yandexcloud.net` | Public site URL |

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
