# Seasonal offer hero experiment

## Scope

- Primary target: `app/experiments/seasonal-offer-hero/page.tsx`
- Mode: Persuade, comparative experiment
- Audience: HRD, L&D and well-being leaders choosing a corporate financial-literacy program
- Job: understand the offer, see why it applies to a broad workforce, and move to a program discussion
- Primary action: `Обсудить программу` → `/companies/season-offer-2026#season-offer-lead`
- Constraint: temporary experiment only; `noindex, nofollow`, no production analytics, no public navigation

## Direction contract

- THESIS: one truthful offer proven four ways—through people, material support, typographic clarity, and a multi-palette synthesis—rather than a generic fintech glow hero.
- OWN-WORLD: rotating editorial portrait stage; full-bleed material support landscape; midnight typographic field; open campaign photography in three temperatures with authored type in the sky and one matte action surface rooted in the soil. All four share decisive push, match-cut and attention-bump motion.
- STORY: HR sees that the offer spans employee segments, recognizes financial well-being as a stable support layer, and can discuss the program.
- FIRST VIEWPORT: neutral experiment switcher followed by one complete hero with the real headline, lead, CTA and direction-specific proof.
- FORM: four user-pinned directions, revised seed `seasonal-offer-hero-four-up-v4`.

## Approved direction changes

- People: nine adult professionals in one consistent editorial world; desktop keeps six undistorted square squircle crops while three change per motion phase. Tablet and mobile expose all nine roles in a seamless auto-scrolling native overflow gallery with no carousel controls or portrait shadows; touch swipe and a static reduced-motion path remain available.
- Financial support: the earlier instrument/player metaphor is superseded by a full-screen image banner, color-authored headline and one bottom rail pairing a left CTA with a right matte-glass statistics surface.
- Typographic evolution: the image is the exact current home hero asset `/heroV2.webp`; its CTA and evidence band now use the same lower-rail placement as the financial-support direction.
- Multi-palette synthesis: the tree/home composition now has three manually selected responsive photo themes—cool blue-green, warm green-gold and blue-gold. Deep navy type and the production accent blue `#58A8E0` stay identical across themes; green is removed from the headline. Only the lower copy/action surface uses neutral matte glass. The centered CTA and absence of statistics remain.
- The visible `НЦФГ` pretitle is removed from every experimental hero.
- Klarna Motion remains the behavioral reference: simple block entrances, purposeful state change, one restrained playful beat, and a complete reduced-motion path.

A production winner has not been selected. The earlier machine comp is retained only as experiment history and is not an implementation target.

## Fidelity inventory

| Visible commitment | Implementation medium | Shipped result |
| --- | --- | --- |
| Nine adult professional portraits, including a stronger Eastern-European/Slavic cast | Generated 3×3 raster atlas + semantic CSS crops | `public/experiments/seasonal-offer-hero/people-atlas-v2.png` |
| Six simultaneous desktop portraits that change without visual thrash | Framer Motion phase rotation | Three of six fixed squircle slots replace every 3.6 seconds; reduced-motion stays static |
| Nine discoverable roles on tablet and mobile | Native horizontal overflow + timed auto-scroll | Three repeated visual cycles create a seamless loop while only one nine-item cycle remains semantic; swipe, keyboard focus and reduced-motion scroll-snap are preserved, with no carousel controls or shadows |
| Central unobstructed people-hero headline | Semantic HTML + responsive CSS | Three authored line breaks; portrait groups remain outside the copy measure |
| Tree, home, soil and coins as one stable foundation | Generated landscape plus art-directed portrait derivative | `wellbeing-landscape.png` and `wellbeing-portrait-v2.png` |
| Full-bleed financial-support campaign banner | Semantic HTML/CSS | Edge-to-edge scene, color accents and a shared lower rail with CTA left and one non-interactive matte-glass stats plane right |
| Current home hero object | Existing project raster | `/heroV2.webp`, rendered at hero scale with its transparent composition intact |
| Multi-palette house-and-tree synthesis | Three generated responsive photograph pairs + semantic CSS | Web-optimized `wellbeing-split-*-v3.jpg`, `wellbeing-warm-green-gold-*-v1.jpg` and `wellbeing-blue-gold-*-v1.jpg` pairs; open sky-backed type, one neutral matte-glass foundation/action surface and zero metrics remain consistent across themes |
| Three photo moods inside synthesis | Pressed-state button group | Three 44×44-minimum swatch controls switch only the responsive image pair with a restrained crossfade; full Russian labels remain available to assistive technology |
| Klarna-like push/match/bump motion | Framer Motion | Line pushes, panel match transition, portrait exchanges and image settling; reduced-motion respected |
| Real offer proof | Existing content model | `4 вебинара`, `1 семейная программа`, `1 годовая программа` |
| Experiment comparison controls | Semantic tablist | Click, ArrowLeft/ArrowRight, Home and End supported |

## Fidelity ledger

1. People topology keeps the Bitrix reference's peripheral human proof while replacing its stock-cutout treatment with one consistent editorial cast.
2. The revised people atlas uses the supplied ensemble reference for mature casting, studio tone and tactile wardrobe; no referenced individual is reproduced.
3. Portrait cards use square, non-shrinking crops with squircle geometry and a high-radius fallback. Atlas proportions remain intrinsic rather than stretched. Desktop rotation is decorative to assistive technology; on tablet/mobile the nine professions form one accessible list inside a three-cycle native overflow loop. Auto-scroll pauses during pointer, wheel or keyboard focus and is disabled entirely for reduced motion; the carousel presents no playback or paging controls.
4. The support variant removes every player, program selector, status strip, mono utility label and control-like element from the previous direction.
5. The well-being scene keeps the supplied tree/home/soil/coin metaphor but treats the coins as structural ground, not promised financial returns.
6. Its green and coral headline accents are sampled conceptually from growth and action; the matte glass exists only where it improves metric legibility over the photographic base. CTA and stats share one lower visual axis on desktop and reflow vertically on narrow screens.
7. The typographic variant now uses the same `/heroV2.webp` that the current main page resolves through the default `Hero` image source, while CTA and metrics occupy the same lower rail pattern as variant two.
8. The fourth direction combines variant two's truthful house/tree world with variant three's familiar blue system and now separates layout from photographic temperature. The title remains unenclosed: high-contrast navy plus one production-blue accent sit directly in each calm sky. A single wider neutral-glass lower surface reads as the financial foundation. Center alignment and the absence of statistics keep it distinct from both source variants.
9. On mobile, the synthesis headline is approximately 30% larger than the prior revision (about 51 px at 390 px), while the lead increases from 12 px to 14 px. Both accent phrases use a clean flat `#58A8E0` fill with no stroke or shadow; the generated skies provide their contrast without a dirty edge.
10. The removed `НЦФГ` pretitle is not replaced with another eyebrow, badge, or filler label.
11. Motion follows Klarna's simple/purposeful/playful principles: authored entrances, discrete desktop portrait replacement and one short user-triggered photo crossfade, with no decorative WebGL or scroll-jacking and a clear reduced-motion path.

## Above-fold copy diff

| Element | Production source | Experiment |
| --- | --- | --- |
| Headline | `Финансовое благополучие сотрудников — без роста ФОТ` | Unchanged in all variants |
| Lead | Existing six-format seasonal-offer lead | Unchanged in all variants |
| Primary CTA | `Обсудить программу` | Label unchanged; href made absolute to the real production form |
| Metrics | `4 / 1 / 1` program-format counts | Unchanged; rendered on glass or as a typographic evidence band |
| Removed pretitle | `НЦФГ` was previously repeated in the experiment | Removed from all four hero surfaces |
| Added explanatory UI | None | Four variant names and nine concrete job labels: руководитель, L&D-менеджер, маркетолог, HR-менеджер, аналитик, бухгалтер, инженер, продавец and консультант |

## Core interaction path

1. Switch among the four heroes with pointer or keyboard.
2. On desktop, observe the people direction cycle through all nine roles with six portraits visible and three replaced per phase.
3. On tablet or mobile, observe the nine-role gallery auto-scroll or take over with a native swipe; no carousel controls compete with the portraits.
4. Inside `Синтез`, compare the three photo temperatures with the compact swatch group; the current photograph remains visible until its replacement has loaded.
5. Activate `Обсудить программу` to reach the real seasonal-offer lead form.

## Finish evidence

- Prior v2 reference evidence remains under `.impeccable/screenshots/seasonal-offer-hero-v2/` for comparison history; it is not claimed as the current render.
- Current Browser QA was performed at 1440×900, 768×1024 and 390×844. All viewports have one `h1`, four working tabs, no visible `НЦФГ`, no document-level horizontal overflow, and no console warnings/errors.
- Desktop people keeps exactly six visible squircle figures. Tablet/mobile gallery renders one semantic nine-item list across three visual cycles, advances about 19 px in 1.2 seconds at both tested narrow viewports, exposes zero carousel controls, and computes `box-shadow: none` on portrait crops.
- Typographic CTA and metrics share one lower visual axis at desktop and stack without overlap at tablet/mobile, matching the placement model of the support direction.
- Blue-green synthesis renders zero `dl` metric surfaces, a fully transparent headline container and one translucent neutral lower surface. At 390×844 the headline starts about 90 px lower than the previous revision, bringing it closer to the tree/house scene without overlap; the portrait image remains selected on narrow screens and the landscape image on desktop.
- The final synthesis pass was checked at 1440×900 and 390×844: one `h1`, no document-level horizontal overflow, no framework error overlay, and no console errors. At 390 px the title computes to 51.09 px, the lead to 14 px, and all three theme controls to 44×44 px. Both highlighted phrases compute to `rgb(88, 168, 224)` with no text shadow or stroke; the lower action surface uses a 76–84% navy material layer and 28 px backdrop blur.
- Warm and blue-gold photos were generated as independent responsive compositions; all three responsive pairs now use 406–504 KB web JPEGs. Their rendered `src` stays unoptimized so the interaction preload and displayed request are identical in production: the old background remains mounted until the exact replacement file is ready. Direct experiment links accept validated `variant` and `theme` search parameters and server-render the requested state; the initial LCP pair is preloaded.
- The 1440×900 live render was inspected side-by-side with the supplied split-layout concept; the implementation keeps its three-layer hierarchy while replacing incidental hard rectangles and image noise with related squircle modules, stronger gutters and a newly art-directed photo. Temporary QA captures were intentionally not added to the repository.

## Unresolved decision

Choose one direction or a named combination after reviewing the four live variants. Do not write any of these temporary visual worlds into global `DESIGN.md` until that choice is made.
