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
