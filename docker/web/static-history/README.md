Production CI restores the active `ncfg-web` revision's `.next/static`
into `static/` and its optional `.next/static-history.json` into `manifest.json`.
Generated files are ignored by Git, but included in the Docker build context.
The source image is pinned by digest, not by the mutable `latest` tag.

Keep this file so the directory is present in local and preview build contexts.
Do not put credentials, CMS exports, or application configuration here.
