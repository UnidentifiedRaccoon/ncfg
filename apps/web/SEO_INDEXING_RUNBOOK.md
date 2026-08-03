# SEO indexing runbook (`ncfg.ru`)

## 1) Verify ownership via DNS

### Google Search Console
1. Add property as **Domain**: `ncfg.ru`.
2. Copy TXT record from GSC.
3. Add TXT record in DNS zone for `ncfg.ru`.
4. Click `Verify` in GSC.

### Yandex Webmaster
1. Add site `https://ncfg.ru`.
2. Choose DNS verification.
3. Add TXT record in DNS zone for `ncfg.ru`.
4. Confirm verification in Webmaster.

## 2) Submit technical endpoints

After deployment confirm:

```bash
cd apps/web
npm run seo:check -- https://ncfg.ru

# Add gateway mirror + blocked direct URL validation:
SEO_MIRROR_URLS="https://d5d1a3velg9e6hkj777c.i99u1wfk.apigw.yandexcloud.net" \
SEO_BLOCKED_URLS="https://bban3i4dgt9p00m87f90.containers.yandexcloud.net" \
  npm run seo:check -- https://ncfg.ru

# or basic spot-check:
curl -sL https://ncfg.ru/robots.txt
curl -sL https://ncfg.ru/sitemap.xml
```

Expected:
- `robots.txt` -> `200`
- `robots.txt` contains `Sitemap` and does not contain `Host`
- `sitemap.xml` -> `200`
- `sitemap.xml` contains `<lastmod>` for `/`, `/companies`, `/individuals`, `/about`, `/blog`
- default `seo:check` verifies `http://ncfg.ru`, `http://www.ncfg.ru`, and `https://www.ncfg.ru` as mirrors

Then submit `https://ncfg.ru/sitemap.xml` in:
- Google Search Console -> `Sitemaps`
- Yandex Webmaster -> `Индексирование -> Файлы Sitemap`

Production runtime requirement:
- `NEXT_PUBLIC_SITE_URL` must be exactly `https://ncfg.ru`

## 3) Verify canonical mirror

```bash
curl -I http://ncfg.ru/companies
curl -I http://www.ncfg.ru/companies
curl -I https://www.ncfg.ru/
curl -I https://www.ncfg.ru/news
curl -I https://www.ncfg.ru/robots.txt
curl -I https://www.ncfg.ru/sitemap.xml
curl -I https://d5d1a3velg9e6hkj777c.i99u1wfk.apigw.yandexcloud.net/
```

Expected:
- `https://ncfg.ru/` -> `200`
- `http://ncfg.ru/...` -> `301` to the same URL over HTTPS; legacy paths may then use one application `301` to their canonical path
- `http://www.ncfg.ru/...` -> `301` to the same `www` URL over HTTPS, then one application `301` to `https://ncfg.ru/...`
- every HTTPS public mirror -> `301` to `https://ncfg.ru/...`

Important:
- the API Gateway custom-domain edge performs the first HTTP-to-HTTPS redirect before Next.js;
- `seo:check` permits exactly that transport upgrade as an intermediate hop and still requires the next `301` to reach the expected canonical URL;
- HTTPS mirrors must reach the canonical URL in one hop, and no checked redirect chain may exceed two hops.

## 4) Verify blocked direct container

The production container URL is not an SEO mirror. It must be unavailable to anonymous traffic.

```bash
yc serverless container list-access-bindings --name ncfg-web --format json
curl -I https://bban3i4dgt9p00m87f90.containers.yandexcloud.net/
```

Expected:
- no `allUsers` binding with `serverless-containers.containerInvoker`
- direct container URL -> `401` or `403`
- preview containers remain public by design via `.github/workflows/preview.yml`

## 5) Trigger recrawl for key URLs

Priority URLs:
- `https://ncfg.ru/`
- `https://ncfg.ru/companies`
- `https://ncfg.ru/individuals`
- `https://ncfg.ru/about`
- `https://ncfg.ru/blog`

Use:
- GSC -> `URL Inspection` -> `Request indexing`
- Yandex Webmaster -> `Переобход страниц`

## 6) Verify legacy handling

```bash
# Should return 301
curl -I https://ncfg.ru/news

# Should return 410
curl -I https://ncfg.ru/wp-login.php
curl -I https://ncfg.ru/xmlrpc.php
curl -I https://ncfg.ru/feed

# Retired legacy URLs should return 404
curl -I https://ncfg.ru/privacy-policy
curl -I https://ncfg.ru/services/financial-diagnostics
curl -I https://ncfg.ru/articles/za-dengi
curl -I https://ncfg.ru/companies/integrated_program
```

## 7) Monitoring cadence (4-8 weeks)

Weekly checks:
- Index coverage in GSC and Yandex.
- Crawl errors and soft-404 trends.
- Share of old URLs still in index.
- Snippet refresh for title/description/favicon.
