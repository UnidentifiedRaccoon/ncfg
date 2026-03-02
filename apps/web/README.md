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
STRAPI_LOCAL_API_TOKEN=... # required (read-only token)

# prod source (used by npm run dev:prod)
STRAPI_PROD_URL=https://admin.ncfg.ru
STRAPI_PROD_API_TOKEN=...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
PORTFOLIO_PRESENTATION_URL=https://storage.yandexcloud.net/<bucket>/docs/ncfg-portfolio-2021.pdf
```

3. Run:

```bash
npm run dev:local
npm run dev:prod
```

## Strapi Token

Create a Content API token in Strapi:
- `Settings` -> `API Tokens` -> `Create new API Token`
- Type: `Read-only` (or `Custom` with read access to required content types)
- Put the value into:
  - `STRAPI_LOCAL_API_TOKEN` for `npm run dev:local`
  - `STRAPI_PROD_API_TOKEN` for `npm run dev:prod`

## Production (Yandex Cloud)

Deployment is done via GitHub Actions to YC Serverless Containers.

Required GitHub Actions secrets:
- `STRAPI_URL` = `https://admin.ncfg.ru`
- `STRAPI_API_TOKEN` = your read-only token
- `REVALIDATE_TOKEN` = shared secret for Strapi webhook -> `POST /api/revalidate/strapi`
- `NEXT_PUBLIC_SITE_URL` = public site URL (used for health-checks and metadata)
- `POSTBOX_API_KEY_ID` = Postbox API key ID
- `POSTBOX_API_KEY_SECRET` = Postbox API key secret
- `POSTBOX_FROM_EMAIL` = verified sender email (recommended: `no-reply@ncfg.ru`)
- `LEADS_RECIPIENT_EMAILS` = `aedengina@ncfg.ru,yura.posledov@yandex.ru`

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
- `GETCOURSE_DEAL_COST` (default: `0`)
- `GETCOURSE_DEAL_STATUS` (default: `new`)
- `GETCOURSE_DEAL_FIELD_SOURCE`
- `GETCOURSE_DEAL_FIELD_COMPANY`
- `GETCOURSE_DEAL_FIELD_MESSAGE`
- `GETCOURSE_DEAL_FIELD_QUESTION`
- `GETCOURSE_DEAL_FIELD_POST_TITLE`
- `GETCOURSE_DEAL_FIELD_REQUEST_ID`
- `GETCOURSE_DEAL_FIELD_FORM_TYPE`

### Blog cache revalidation (Strapi webhook)

Blog routes use ISR with a fixed interval of `60` seconds:
- `/blog` -> `revalidate = 60`
- `/blog/[slug]` -> `revalidate = 60`
- Strapi fetch default -> `DEFAULT_REVALIDATE = 60`

To invalidate faster on content edits, use webhook-driven revalidation.

Strapi setup:
- `Settings -> Webhooks -> Create webhook`
- URL: `https://ncfg.ru/api/revalidate/strapi`
- Method: `POST`
- Header: `x-revalidate-token: <REVALIDATE_TOKEN>`
- Events (`Entry`): `create`, `update`, `delete`, `publish`, `unpublish`
- Model: `News Article` (`api::news-article.news-article`)

Smoke test with `curl`:

```bash
curl -i -X POST "https://ncfg.ru/api/revalidate/strapi" \
  -H "content-type: application/json" \
  -H "x-revalidate-token: ${REVALIDATE_TOKEN}" \
  -d '{"event":"entry.publish","model":"api::news-article.news-article","entry":{"slug":"test-slug"}}'
```

Expected responses:
- `200` + `{"ok":true,"revalidated":[...]}` -> cache invalidated.
- `200` + `{"ok":true,"revalidated":[],"reason":"no-op: ..."}` -> event/model payload does not match filter.
- `401` -> missing or invalid token; check `REVALIDATE_TOKEN` in webhook header and web runtime env.

Propagation expectations:
- With webhook: usually visible on next request shortly after `entry.create|update|delete|publish|unpublish`.
- Without webhook fallback: updates appear within about `60` seconds due to ISR.

### Postbox runbook (temporary lead intake)

1. In Yandex Cloud Postbox, verify sender/domain for `POSTBOX_FROM_EMAIL` (for example `no-reply@ncfg.ru`).
2. Create API key with permission to send Postbox emails and save:
   - `POSTBOX_API_KEY_ID`
   - `POSTBOX_API_KEY_SECRET`
3. Add/update GitHub Actions secrets listed above.
4. Deploy `main` and submit:
   - one `lead` form (`/api/lead`)
   - one `question` form (`/api/question`)
5. Confirm both emails are delivered to:
   - `aedengina@ncfg.ru`
   - `yura.posledov@yandex.ru`

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
