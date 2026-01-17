---
paths:
  - "**/strapi/**"
  - "**/cms/**"
  - "**/content-types/**"
  - "**/components/**"
---

# Strapi rules (content modeling)

## Content model principles
- Page-like types must have: title, slug, optional lead, blocks/sections, SEO fields.
- Prefer reusable components for repeated patterns (hero, bento grid, FAQ, stats, timeline).
- Keep slugs stable: lowercase, hyphens, no random renames.

## SEO fields (minimum)
- metaTitle, metaDescription
- ogImage (or shared social image)
- canonical (optional), noindex (optional)

## API contract
- Treat Strapi schemas as API contracts: changes must be backward compatible or coordinated with frontend.
- Document expected query shape (populate strategy) in the frontend data layer.
