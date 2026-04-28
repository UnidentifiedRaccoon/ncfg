# NCFG Web (Next.js)

This app renders mostly static marketing pages, but **news/blog**, **people**, and **services** are fetched from Strapi.

Important: there is **no silent JSON fallback** for Strapi-backed sections. If Strapi is unavailable or env vars are missing, the app fails fast with a clear error.

## SEO operations

- Indexing and recrawl runbook: [SEO_INDEXING_RUNBOOK.md](./SEO_INDEXING_RUNBOOK.md)

## About page data contract

- Route `/about` requires at least one `person` in Strapi with `teamGroup != null`.
- If Strapi returns people but none of them belong to `teamGroup`, rendering `/about` fails with an explicit error.
- This is intentional fail-fast behavior: the "Наша команда" section is mandatory for `/about`.

## Local Development

1. Install deps:

```bash
cd apps/web
npm ci
```

2. Set env vars (example: `apps/web/.env.local.example`):

```bash
# local source (used by npm run dev / npm run dev:local)
STRAPI_LOCAL_URL=http://localhost:1337
STRAPI_LOCAL_API_TOKEN=... # required (read token)
STRAPI_LOCAL_WRITE_API_TOKEN=... # required for diagnostic preview/submit save flow

# prod source (used by npm run dev:prod)
STRAPI_PROD_URL=https://admin.ncfg.ru
STRAPI_PROD_API_TOKEN=... # read token
STRAPI_PROD_WRITE_API_TOKEN=... # write token for /api/diagnostic-submissions/intake

NEXT_PUBLIC_SITE_URL=http://localhost:3000
PORTFOLIO_PRESENTATION_URL=https://storage.yandexcloud.net/<bucket>/docs/ncfg-portfolio-2021.pdf
NEXT_PUBLIC_YANDEX_METRIKA_ID=108387180 # optional local parity; prod is sourced from Lockbox
```

3. Run:

```bash
npm run dev:local
npm run dev:prod
```

## Strapi Tokens

Create two Content API tokens in Strapi:
- `Settings` -> `API Tokens` -> `Create new API Token`
- Read token: `Read-only` (or `Custom` with read access to required content types)
- Write token: `Custom` with access required by `POST /api/diagnostic-submissions/intake`
- Put the value into:
  - `STRAPI_LOCAL_API_TOKEN` / `STRAPI_LOCAL_WRITE_API_TOKEN` for `npm run dev:local`
  - `STRAPI_PROD_API_TOKEN` / `STRAPI_PROD_WRITE_API_TOKEN` for `npm run dev:prod`

## Production (Yandex Cloud)

Deployment is done via GitHub Actions to YC Serverless Containers.

Required GitHub Actions secrets:
- `YC_LOCKBOX_SECRET_ID` = Lockbox secret with runtime tokens and CMS credentials
- `YC_LOCKBOX_VERSION_ID` = active Lockbox version used by build/deploy workflows; keep repository and `production` environment secrets in sync
- `STRAPI_URL` = `https://admin.ncfg.ru`
- `NEXT_PUBLIC_SITE_URL` = exact canonical public site URL `https://ncfg.ru` (used for metadata, mirror redirects, and health-checks)
- `POSTBOX_API_KEY_ID` = Postbox API key ID
- `POSTBOX_API_KEY_SECRET` = Postbox API key secret
- `POSTBOX_FROM_EMAIL` = verified sender email (recommended: `no-reply@ncfg.ru`)
- `LEADS_RECIPIENT_EMAILS` = `aedengina@ncfg.ru,yura.posledov@yandex.ru,Zvs@ncfg.ru`

Required Lockbox keys:
- `STRAPI_API_TOKEN` = read-only token for web -> Strapi content fetches
- `STRAPI_WRITE_API_TOKEN` = write token used by `POST /api/diagnostic-submissions/intake`
- `NEXT_PUBLIC_YANDEX_METRIKA_ID` = production Yandex Metrika counter ID (`108387180`)
- `BITRIX24_WEBHOOK_URL` = incoming webhook URL for website lead fan-out to Bitrix24

GitHub Secrets are no longer the canonical source for Strapi tokens or the production Metrika counter ID. Production web deployments resolve them from the same Lockbox secret version, while preview deployments intentionally ship without Metrika enabled.

Optional GitHub Actions secrets (Postbox):
- `POSTBOX_SMTP_HOST` (default: `postbox.cloud.yandex.net`)
- `POSTBOX_SMTP_PORT` (default: `465`)
- `LEADS_RECIPIENT_EMAIL` (legacy single-recipient fallback)
- `PORTFOLIO_PRESENTATION_URL` (absolute Object Storage URL for `/portfolio` presentation PDF)

Optional GitHub Actions secrets (GetCourse fallback/enrichment):
- `GETCOURSE_BASE_URL` = `https://fgrm.ncfg.ru`
- `GETCOURSE_API_KEY` = API key from GetCourse account
- `GETCOURSE_SOURCE_VALUE` (example: `fgrm.ncfg.ru`)
- `GETCOURSE_DEAL_PRODUCT_TITLE_LEAD` (default: `Website Lead`)
- `GETCOURSE_DEAL_PRODUCT_TITLE_QUESTION` (default: `Website Question`)
- `GETCOURSE_DEAL_PRODUCT_TITLE_VACANCY_APPLICATION` (default: `Website Vacancy Application`)
- `GETCOURSE_DEAL_COST` (default: `0`)
- `GETCOURSE_DEAL_STATUS` (default: `new`)
- `GETCOURSE_DEAL_FIELD_SOURCE`
- `GETCOURSE_DEAL_FIELD_COMPANY`
- `GETCOURSE_DEAL_FIELD_MESSAGE`
- `GETCOURSE_DEAL_FIELD_QUESTION`
- `GETCOURSE_DEAL_FIELD_POST_TITLE`
- `GETCOURSE_DEAL_FIELD_REQUEST_ID`
- `GETCOURSE_DEAL_FIELD_FORM_TYPE`

### Cache and revalidation

All Strapi-backed content must rely on one freshness source only: the 60-second Data Cache window in `shared/lib/strapi.ts`.
- `DEFAULT_REVALIDATE = 60` in `shared/lib/strapi.ts` remains the canonical freshness policy for every `fetchAPI` call.
- CMS-driven routes set `export const revalidate = 0` so page output does not outlive the Strapi fetch cache.
- CMS-driven internal navigation must go through `isCmsDrivenPath` and `CmsAwareLink` (or `Button`) so the App Router client cache is bypassed for:
  `/`, `/about`, `/blog`, `/blog/*`, `/companies`, `/companies/*`, `/rekomendacii`, `/vacancies`, `/vacancies/*`, `/diagnostika/*`.
- CMS-driven pages also reload after BFCache restores (`pageshow.persisted`) to avoid serving stale browser snapshots.
- No webhook-driven invalidation is used in this repo: after a Strapi edit, updates appear on the next request once the 60-second window has elapsed.

When adding a new Strapi-backed route:
- set `export const revalidate = 0` on the page or route segment,
- add the route family to `shared/lib/cms-routes.ts`,
- use `CmsAwareLink` or `Button` for internal links that navigate to it.

### Postbox runbook (temporary lead intake)

1. In Yandex Cloud Postbox, verify sender/domain for `POSTBOX_FROM_EMAIL` (for example `no-reply@ncfg.ru`).
2. Create API key with permission to send Postbox emails and save:
   - `POSTBOX_API_KEY_ID`
   - `POSTBOX_API_KEY_SECRET`
3. Add/update GitHub Actions secrets listed above.
4. Deploy `main` and submit:
   - one `lead` form (`/api/lead`)
   - one `question` form (`/api/question`)
5. Confirm emails are delivered to:
   - `aedengina@ncfg.ru`
   - `yura.posledov@yandex.ru`
   - `Zvs@ncfg.ru`

For task-oriented intake in GetCourse (`/pl/tasks/resp`), configure at least:
- `GETCOURSE_DEAL_FIELD_MESSAGE`
- `GETCOURSE_DEAL_FIELD_QUESTION`
- `GETCOURSE_DEAL_FIELD_REQUEST_ID`
- `GETCOURSE_DEAL_FIELD_FORM_TYPE`

Every submit is sent to GetCourse as a separate order (`/pl/api/deals`), so repeated submits from the same email still create independent tasks.
Detailed setup guide: `../../infra/getcourse-orders-intake.md`

### GetCourse task flow (manual setup in GetCourse UI)

1. Create **deal custom fields** in GetCourse and map their codes in `GETCOURSE_DEAL_FIELD_*` secrets.
2. Create a GetCourse process on object **Orders** (`Заказы`) with launch type **Periodic check** (`Периодическая проверка`).
3. Add process filters:
   - `request_id` is set
   - `deal_status` is `new` (or your configured status from `GETCOURSE_DEAL_STATUS`)
4. Add action `Create task` and include message/question/source/request_id in the task body.
5. Add two branches by `form_type`:
    - `lead` -> focus on `message`
    - `question` -> focus on `question` + `post_title`
    - `vacancy-application` -> focus on `vacancy`, `resume`, `message`
