# Financial games

The accepted «Голубое стекло» landing is published in the application at `/companies/financial-games`. The «Фото справа» block follows the existing CMS service categories on `/companies`; its audience links target `#employees` and `#children`. The page uses the public site layout, existing Footer and LeadForm, canonical metadata, an Open Graph image, breadcrumb structured data and a sitemap entry. The header navigation includes the service alongside the CMS catalog, including its fallback path, without duplicating an existing CMS link.

## Components and behavior

- `widgets/FinancialGames` contains the accepted landing and catalog block. There are no variant parameters or comparison controls.
- `features/financial-game` owns the fictional workshop episode, its state and budget calculations. The welcome screen and all five phases share an intrinsic frame on desktop. At widths up to 760px, each screen fits its current content without reserving space for hidden phases or messages. Inactive content remains inert and hidden from assistive technology.
- Player motivations and the concise instructions appear in the introduction. The two decision steps keep each player's name, number, priority and current proposal; the repeated sidebar has been removed on both desktop and mobile.
- The three middle phases each show one budget summary: total, spending and remainder. The introduction explains the 100 game units once, and the final phase shows only the outcome breakdown. Redundant phase/status captions, empty-choice prompts and the premature copy of the final outcome have been removed.
- Start, next, back and reset focus the active heading. Mobile transitions scroll to the active screen below the site header; desktop transitions scroll only when the new heading would otherwise be outside the visible area. Choosing an answer does not trigger this scroll. Reduced motion uses an immediate transition.
- All enquiry actions target the existing `#lead-form`. The temporary LeadForm demo mode has been removed. Consent and error references now use IDs derived from this unique form anchor, fixing a reproduced server/client ID mismatch on the companies page. The submission API and local-development write/outbound settings are unchanged.
- The financial-games experiment routes, entries, alternate styles, unused images and composition mocks have been removed. The permanent `/experiments` hub and unrelated experiments remain.

## Content and images

Publisher parameters were checked on 2026-09-07: [adult game](https://igrika.ru/index.php/games-2/01_dpo/ofigame/) and [children's game](https://igrika.ru/index.php/games-2/01_dpo/ofigame/small/). The agreement with Igrika and NCFG hosting by multiple consultants were supplied by the user. There are no new prices, client cases or quantified learning outcomes.

The workshop episode is an authored educational scenario with fictional people and game units. It does not reproduce the publisher's official rules or cards. The user requested the removal of its explanatory UI footnote; this provenance remains internal.

Four assets are retained under `public/services/financial-games/`:

| Asset | Provenance |
| --- | --- |
| `game-company.webp` | Accepted Imagegen illustration of six adults at a game table, native 1672×941, lossless WebP. It is not documentary evidence of an NCFG event. |
| `workshop-start.webp` | Accepted Imagegen background for the fictional workshop, native 1672×941, WebP quality 90. |
| `game-detail.jpg` | Unmodified [publisher product photograph](https://igrika.ru/wp-content/uploads/photo-gallery/IMG_8662_small.jpg). |
| `kids-board.jpg` | Unmodified [publisher game-board image](https://igrika.ru/wp-content/uploads/2020/12/2020.11.10_поле_q-01_small.jpg). |

The original encodings of the four accepted images are preserved. [image-provenance.json](./image-provenance.json) records the generated originals and exact prompts; historical input paths identify the earlier generation source. Rejected generative product-photo restorations and unused assets are not shipped.

## Verification

Checked locally on 2026-09-11:

- TypeScript, targeted ESLint, the scoped Impeccable type/layout detector and `git diff --check` pass.
- All nine plan/response outcomes preserve the 100-unit budget. Header enrichment preserves CMS categories, handles an empty result and does not duplicate an existing financial-games link.
- Browser review at desktop and 390px: the approved catalog photograph is right of the copy on desktop and above it on mobile, with no horizontal overflow. Existing CMS service categories remain intact. The catalog and desktop/mobile menus link to the public page and both audience sections.
- The compact game was reviewed at 1440px, 390px and 320px without horizontal overflow. Desktop retains the same frame across the welcome screen and all five phases; mobile height follows the active content. Plan selection, disabled progression before a choice, budget updates, reflection, back/reset and keyboard controls work. Inactive scenes remain inert and hidden from accessibility APIs.
- Mobile start/step/back/reset navigation places the active screen below the fixed header and focuses its heading. Desktop confirmation also brings an offscreen heading back into view. The final phase has one outcome breakdown and no duplicate general budget. The reduced-motion branch was checked in code; no physical-device or reduced-motion browser test was performed.
- The game CTA reaches the standard enquiry form. The reproduced consent-ID hydration warning is fixed and absent on confirmation. No lead was submitted.
- Both public pages respond with 200. The new page has its canonical metadata, Open Graph image and one sitemap entry. Both removed financial-games experiment routes return 404. `/experiments` remains 200 with `noindex, nofollow` and the unrelated seasonal experiment; it is absent from the sitemap.

The local Next.js dev cache was regenerated after the bundler stalled. Production Strapi intermittently returned connection timeouts/500 during review; the existing header fallback worked, and successful CMS-backed companies-page loads were also verified. No CMS or outbound integration settings were changed.
