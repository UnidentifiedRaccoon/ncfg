---
version: 1
slug: "app-site-companies-season-offer-page-tsx"
primary_target: "app/(site)/companies/season-offer/page.tsx"
related_targets: ["route:/companies/season-offer", "widgets/SeasonOffer2026/ui/SeasonOfferHero.tsx", "widgets/SeasonOffer2026/ui/SeasonOfferPortraits.tsx", "widgets/SeasonOffer2026/ui/SeasonOfferPeopleCarousel.tsx", "widgets/SeasonOffer2026/ui/SeasonOfferPortraitImage.tsx", "widgets/SeasonOffer2026/model/portraits.ts", "widgets/SeasonOffer2026/model/content.ts", "widgets/SeasonOffer2026/ui/season-offer-hero.module.css"]
---

# Seasonal offer — accepted editorial hero

## Approval and purpose

On 2026-09-12 the user explicitly requested applying the completed editorial B hero to the seasonal-offer page. Mode: Persuade. HR, L&D and well-being teams should understand the employee benefit and discuss a corporate education program. The approved hero replaces the earlier illustration, badge, metrics and trust strip; the remaining page sections, program catalogue, metadata, structured data and lead form retain their existing contracts.

## Current implementation

- `SeasonOfferHero` is a server component in the existing `SeasonOffer2026` widget. Its typed copy lives in `model/content.ts`; only portrait rotation and the compact carousel require client components. The public page imports the widget's public API and has no experiment imports or assets.
- H1: `Финансовое благополучие без роста ФОТ`. The model stores topic, benefit and budget phrases. Both emphasized phrases share PT Serif Italic 400, `#2563EB`, 1.11em and 1.14 line-height; the remaining text uses navy Onest 420. Desktop type is `clamp(42px, 3.7vw, 60px)` with tracking −0.035em. Compact and phone scales preserve the approved two/three-line composition.
- Lead: `Шесть форматов обучения для сотрудников — от вебинара до годовой программы.` CTA: the shared primary `Button`, size `lg`, linking to `#season-offer-lead`, with `data-ym-goal="cta_click"` and `data-ym-cta-location="hero"`. No new analytics event or submission behavior is introduced.
- The flat `#EEF3F6` hero extends behind the existing navigation. A scoped 64px header offset becomes 80px at 1024px. The header uses its existing surface theme in SSR and on the client. The page keeps `HeroMotionScene` with `variant="editorial"` and `sentinel={false}` so the following sections retain their scroll behavior without switching the light navigation to a dark theme.
- At 1200px and above, the layout uses 1.16:1 columns in a maximum 1600px container; the right column contains one tall portrait and two square portraits. Below 1200px, the copy is centered at up to 900px within an 1100px layout, followed by a compact employee carousel. Phone CTA is full width. Desktop hero covers the first viewport; compact height follows content.
- Nine generated illustrative employee personas and their profession labels retain the approved crops and timing. The prepared 800px WebPs now live in `public/services/season-offer/portraits` (769,862 bytes total). The [asset manifest](../../docs/seasonal-offer-hero/portrait-assets-v3.json) records source provenance and current paths.
- Desktop holds for seven seconds, then changes one decoded photo through a 600ms whole-photo refocus with an opaque cut; captions stay sharp. Compact auto-scroll is 20px/s with native manual swipe and keyboard navigation. Existing focus, hover, visibility, viewport, failure and reduced-motion behavior is preserved. Visible pause/paging controls remain absent.

## Experiment retirement

The accepted editorial entry is removed from `/experiments`. `/experiments/seasonal-offer-editorial` and the legacy `?variant=editorial` lab link redirect to `/companies/season-offer`. The old editorial implementation has been moved, not duplicated. The five unselected directions remain in their separate laboratory, defaulting to Focus and using a frozen local comparison fixture. The experiments hub and its `noindex, nofollow` policy remain intact.

## Validation

TypeScript, targeted ESLint and eight portrait/autoplay tests pass. The moved portrait tests are included in the standard web test command. Browser checks at 320, 390, 768, 1024, 1200 and 1440px show one H1, three phone lines and two lines on the other checked widths, matched italic accents, the correct desktop/carousel breakpoint, nine semantic professions and no horizontal overflow. The native CTA reaches the existing corporate form below the sticky header; the covered desktop hero becomes inert through the existing scene. No form was submitted. The dedicated experiment redirect was followed successfully.

Temporary captures and measurements: `/private/tmp/ncfg-season-offer-rollout-qa/`. The implementation is applied to the main route in the working tree; no external deployment is implied. The [experiment history](../../docs/seasonal-offer-hero/editorial-b-implementation.md) records the earlier design iterations.
