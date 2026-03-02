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

# or basic spot-check:
curl -I https://ncfg.ru/robots.txt
curl -I https://ncfg.ru/sitemap.xml
```

Expected:
- `robots.txt` -> `200`
- `sitemap.xml` -> `200`

Then submit `https://ncfg.ru/sitemap.xml` in:
- Google Search Console -> `Sitemaps`
- Yandex Webmaster -> `Индексирование -> Файлы Sitemap`

## 3) Trigger recrawl for key URLs

Priority URLs:
- `https://ncfg.ru/`
- `https://ncfg.ru/companies`
- `https://ncfg.ru/individuals`
- `https://ncfg.ru/blog`

Use:
- GSC -> `URL Inspection` -> `Request indexing`
- Yandex Webmaster -> `Переобход страниц`

## 4) Verify legacy redirects and gone URLs

```bash
# Should return 301
curl -I https://ncfg.ru/klienty-partnery
curl -I https://ncfg.ru/news
curl -I https://ncfg.ru/privacy-policy

# Should return 410
curl -I https://ncfg.ru/wp-login.php
curl -I https://ncfg.ru/xmlrpc.php
```

## 5) Monitoring cadence (4-8 weeks)

Weekly checks:
- Index coverage in GSC and Yandex.
- Crawl errors and soft-404 trends.
- Share of old URLs still in index.
- Snippet refresh for title/description/favicon.
