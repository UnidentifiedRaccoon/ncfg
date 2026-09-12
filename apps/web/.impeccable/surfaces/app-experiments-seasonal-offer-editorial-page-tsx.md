---
version: 1
slug: "app-experiments-seasonal-offer-editorial-page-tsx"
primary_target: "app/experiments/seasonal-offer-editorial/page.tsx"
related_targets: ["route:/experiments/seasonal-offer-editorial", "widgets/SeasonOffer2026/ui/SeasonOfferHero.tsx", "widgets/SeasonOffer2026/ui/SeasonOfferPortraits.tsx", "widgets/SeasonOffer2026/ui/SeasonOfferPeopleCarousel.tsx", "widgets/SeasonOffer2026/ui/SeasonOfferPortraitImage.tsx", "widgets/SeasonOffer2026/model/portraits.ts", "widgets/SeasonOffer2026/ui/season-offer-hero.module.css"]
---

# Seasonal offer — editorial B (accepted)

**Current status — 2026-09-12:** the user approved applying this hero to `/companies/season-offer`. The implementation and portraits have moved into `widgets/SeasonOffer2026` and `public/services/season-offer/portraits`. This experiment is removed from the registry and its URL redirects to the main page. The [public surface brief](app-site-companies-season-offer-page-tsx.md) is the current authority. The sections below preserve the experimental decision and verification history; their earlier public-rollout restrictions have been superseded by this explicit approval.

## Scope and approval — 2026-09-12

Mode: Persuade. HR, L&D and well-being teams read the seasonal offer and follow `Обсудить программу` to `/companies/season-offer#season-offer-lead`.

B / Человеческий акцент is approved and implemented. The user delegated the softer background and subsequently requested profession labels on desktop and a compact People/Focus-style carousel on phones and tablets. That correction supersedes the stacked mobile portrait grid. The precise user-pinned `editorial-b-human-accent` composition is seed-exempt.

The latest user correction removes the remuneration note from B and asks to reconsider desktop motion. A whole-photo refocus transition is now implemented for visual review; its specific effect has not yet received user approval. The canonical public content model remains unchanged.

The dedicated `/experiments/seasonal-offer-editorial` route and the sixth/default `editorial` / `Редакционный` laboratory variant share this implementation. The other five variants remain available; `?variant=editorial` opens B. The route remains in the experiments registry, outside the public `(site)` layout, with `noindex, nofollow`, no public navigation and no production analytics.

[Approved comp](../../../../.impeccable/mocks/seasonal-offer-editorial-v3/b-human-accent.png) · [Approval and prompt](../../../../.impeccable/mocks/seasonal-offer-editorial-v3/b-human-accent.png.json) · [Implementation, assets and QA](../../docs/seasonal-offer-hero/editorial-b-implementation.md). `PRODUCT.md`, `DESIGN.md` and incumbent tokens remain the read-only project authority; this record applies only to the experimental surface.

## Direction contract

- THESIS: employee benefit and budget condition share one coherent visual rhythm.
- OWN-WORLD: blue-gray porcelain, navy Onest 420, matching blue PT Serif italic accents, and natural illustrative portraits.
- STORY: understand the six educational formats, then discuss a program.
- FIRST VIEWPORT: a two-line headline and CTA left, one tall and two square portraits right on desktop; centered copy and a compact horizontal employee strip below 1200px, with a three-line headline on phones.
- FORM: approved B with delegated background refinement and explicitly requested responsive carousel and profession captions.

## Implemented surface rules

- **Compact headline, matched accents.** The user requested a shorter formulation and at most three lines. The local H1 is now `Финансовое благополучие без роста ФОТ`; the audience moves into the lead. `Финансовое благополучие` forms the first phrase and `без роста ФОТ` the second. The first phrase can wrap naturally on phones. Onest 420 uses `clamp(42px, 3.7vw, 60px)`, line-height 1.1 and tracking −0.035em. Both `благополучие` and `без роста ФОТ` share blue PT Serif italic 400 at 1.11em, line-height 1.14 and tracking −0.035em. Below 1200px the headline uses `clamp(42px, 7.4vw, 60px)`; up to 480px it uses `clamp(32px, 10.25vw, 42px)` with line-height 1.06. The budget phrase has no separate smaller size or extra top margin.
- **Quiet local color and system CTA.** The flat hero and laboratory canvas use `#EEF3F6`; navy text retains the existing brand token and italic accents use `#2563EB`. The CTA now reuses `shared/ui/Button` in its primary, large variant: white text on `#5485D5`, 56px height, 18px semibold label, 12px corners, and the component's hover/active/focus states. The custom cyan/dark button and diagonal arrow are removed. The phone CTA remains full width. These changes do not alter shared button tokens or global design rules.
- **Offer copy.** The local lead reads `Шесть форматов обучения для сотрудников — от вебинара до годовой программы.` It retains the six formats, employee audience and webinar-to-yearly-program range without repeating the financial topic from the heading. The existing content model still supplies the action label. The remuneration note stays removed at the user's request; the canonical public copy is unchanged. The lead is 18–21px desktop, 18px compact and 17px phone. CTA spacing is 28px, or 24px on phones.
- **Desktop portraits, matching professions.** At 1200px and wider, a 1600px maximum layout gives the shortened title more room with 1.16:1 columns and a 32–64px gutter; the gallery is at most 680px wide and shrinks on short desktops. One tall portrait spans both rows beside two 0.96-aspect crops with 12px gutters/corners. A 14px, weight-500 profession caption sits 16px from each photo’s bottom-left in a porcelain surface. The caption belongs to the image ID, stays sharp, and changes with the opaque photo cut. Nine illustrative personas reuse the established People/Focus professions; they are not real staff or testimonials.
- **Desktop motion proposal.** The trio is immediately visible without an entrance stagger. A decoded next image enables a seven-second viewing hold, then one 600ms refocus replacement; order is upper-right → lower-right → tall. The outgoing photo defocuses to 7px with a 1.035 scale over 180ms. At that point an opaque incoming frame replaces it and resolves to sharp, original-size framing over 420ms. Opacity switches directly from 0 to 1: no translucent double face or mask bisecting faces. Only the photograph is filtered; labels remain sharp. The next hold starts after completion. Only the next replacement is predecoded; failed loads preserve the visible image and allow other candidates. Hover, keyboard focus on the portrait group, hidden tab, offscreen state and reduced motion suspend automatic change. Visible pause/resume and manual-change buttons are removed at the user’s request; the portrait group remains keyboard-focusable with a visible outline. Interrupting a running transition settles immediately on a sharp photo. Reduced motion keeps the desktop trio static. Filter work is bounded to one photo for 600ms and removed after completion.
- **Compact strip.** Below 1200px, the desktop grid is hidden and the nine employees form a native horizontal carousel. Three visual cycles expose only nine semantic list items. Square photos are 148–170px wide, or 132–156px on phones, with 12px gaps and labels below. Auto-scroll is 20px/s; touch/pointer, wheel, track focus, arrow keys and Home/End stop autoplay for the current mounted carousel. Native swipe and keyboard navigation remain available after autoplay stops. Hover, offscreen state, hidden tab and reduced motion suspend it; reduced motion retains manual keyboard/swipe navigation. The user requested removal of the pause/resume and arrow buttons, so the entire controls row and its spacing are removed. Below 1200px, the copy is a centered block up to 900px wide within an 1100px maximum compact layout, with centered headline, lead and CTA. The lead keeps its 28em maximum measure, auto inline margins and balanced line wrapping. Compact layout has no hero minimum height or vertical centering; the surrounding laboratory canvas fills the viewport in the same porcelain color.

## Finish evidence

Fresh finish review after the carousel/caption revision: **SHIP; material fixes: None**. TYPE, MATERIAL, topology and reading order match the approved direction and its requested adaptations. Eight tests pass (two carousel wrap/resize, four portrait-state and two autoplay-timer tests), targeted ESLint and `tsc --noEmit --incremental false` pass. The initial detector and one follow-up for new components returned `[]`.

Final browser checks at 1440×900, 1024×1366 and 390×844 found no document overflow or application errors; the exact single H1 and `noindex, nofollow` are preserved. All nine portraits were seen in the desktop cycle. Manual Home/next/pause/resume and actual compact auto-scroll movement were observed. The gallery measured 228.99px high on phone and 252.2px on tablet. The tablet capture intentionally shows keyboard focus. Earlier 1280×720 desktop checks also passed.

OS reduced-motion and hidden-tab emulation were not performed; their live gating was reviewed in code. Real-device touch was not simulated. Temporary captures and machine QA are linked in the implementation record, not treated as permanent repository assets.

The later copy/refocus revision passed the same eight tests, targeted ESLint and TypeScript. Browser checks at 1440×900, 1024×1366 and 390×844 confirmed note removal and no document overflow. Runtime samples showed only 0/1 incoming opacity, successive photo replacements, and no retained filter/transform after completion. Pausing during a replacement settled to a sharp frame; the paused trio stayed unchanged and resume restored the control state. Compact captions and carousel geometry were preserved. This evidence verifies behavior; the earlier SHIP verdict does not constitute approval of the new motion proposal.

## History and boundary

The [v2 comp](../../docs/seasonal-offer-hero/focus-portraits-v2-preview.png) and [v2 asset record](../../docs/seasonal-offer-hero/focus-portraits-v2.md) preserve the earlier white-field, Roboto Condensed 800, static-trio version. B replaced its type, material and portrait behavior; the subsequent user correction replaced B’s initial stacked mobile grid with the compact carousel. [A and C](../../docs/seasonal-offer-hero/editorial-v3-directions.md) remain archived proposals.

No public production rollout is approved. This experiment’s type pairing, background, captions, composition and timing are not canonized into global `DESIGN.md` or its sidecar.

## Latest headline and controls correction

The user explicitly requested matching blue italic styling and size for `без роста ФОТ` and `благополучие`, and removal of pause and paging buttons. Both changes are implemented using existing fonts and shared accent styling. The typography assessment identified the old budget scale and margin as the source of the mismatch; the initial type detector returned `[]`. Targeted ESLint and TypeScript pass. Browser verification was unavailable during that revision because CUA timed out; the subsequent server recovery and checks below resolve that limitation. Earlier screenshots and browser verdicts above predate this revision.

## Compact alignment and server recovery

The user reported a frozen local site and left-heavy compact copy. The hung orphaned Next.js/Webpack process was verified against this workspace and restarted through the canonical launcher using the existing `default` Yandex Cloud profile. The launcher reached READY; no persistent profile or runtime configuration was changed. This restores the local session without claiming the underlying cause of the long-running server hang is diagnosed.

The responsive alignment correction is confined to the existing below-1200px breakpoint. Browser checks at 320×740, 390×844 and 1024×1366 show the copy and lead centered exactly at x=160, 195 and 512 respectively, with no horizontal overflow. At 1440×900, desktop retains its left-aligned two-column composition. Both italic headline lines have equal computed sizes at every checked width; the hero has no gallery buttons and keeps nine semantic carousel roles. No browser errors were logged. TypeScript passes. Temporary evidence: `/private/tmp/ncfg-editorial-centered-qa/validation.json` and matching viewport captures.

## Short headline and shared CTA validation

The user requested at most three headline lines, preferably two, and a button aligned with the existing design system. Browser checks at widths 320, 390, 600, 768, 1024, 1200, 1440 and 1600px confirm three headline lines on the two phone widths and two lines on all other checked widths. After shortening the lead, final checks at 320, 390, 1024 and 1440px preserve those counts, matched italic sizes/colors, nine semantic professions, no gallery buttons, no horizontal overflow and `noindex, nofollow`. The CTA is the shared primary large button, 56px high, with its original destination. Keyboard navigation reaches it and displays the shared focus outline. TypeScript and targeted ESLint passed after the component/CSS changes; the subsequent text-only lead edit does not alter types or behavior. No new unit tests were added for this copy/layout adjustment.

Temporary evidence: [validation](/private/tmp/ncfg-editorial-short-title-qa/validation.json), [phone](/private/tmp/ncfg-editorial-short-title-qa/final-mobile-390.png), [narrow phone](/private/tmp/ncfg-editorial-short-title-qa/final-mobile-320.png), [tablet](/private/tmp/ncfg-editorial-short-title-qa/final-tablet-1024.png), [desktop](/private/tmp/ncfg-editorial-short-title-qa/final-desktop-1440.png). The earlier finish verdicts and captures above describe earlier revisions; this correction is available in the experiment for user review.
