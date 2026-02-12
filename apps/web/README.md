# NCFG Web (Next.js)

This app renders mostly static marketing pages, but **news/blog**, **people**, and **services** are fetched from Strapi.

Important: there is **no silent JSON fallback** for Strapi-backed sections. If Strapi is unavailable or env vars are missing, the app fails fast with a clear error.

## Local Development

1. Install deps:

```bash
cd apps/web
npm ci
```

2. Set required env vars (example: `apps/web/.env.local.example`):

```bash
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=... # required (read-only token)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Run:

```bash
npm run dev
```

## Strapi Token

Create a Content API token in Strapi:
- `Settings` -> `API Tokens` -> `Create new API Token`
- Type: `Read-only` (or `Custom` with read access to required content types)
- Put the value into `STRAPI_API_TOKEN`

## Production (Yandex Cloud)

Deployment is done via GitHub Actions to YC Serverless Containers.

Required GitHub Actions secrets:
- `STRAPI_URL` = `https://admin.ncfg.ru`
- `STRAPI_API_TOKEN` = your read-only token
- `NEXT_PUBLIC_SITE_URL` = public site URL (used for health-checks and metadata)
