# Financial games — public service page

Mode: Persuade. Corporate HR and event organizers choose a financial-game format for employees or their children and contact NCFG through the standard enquiry form.

The user accepted the light-blue glass landing, the workshop welcome screen and the «Фото справа» catalog block, then explicitly requested application integration and experiment cleanup. These approved compositions, Inter, NCFG tokens and shared site components remain authoritative; no new design selection is needed.

## Surface contract

- Route: `/companies/financial-games`, using the public layout and light site header. The catalog block lives in `/companies#services-financial-games`.
- Preserve the photographic blue-glass hero, exercise, audience descriptions and game parameters. Keep the full-width game frame stable across desktop phases; on mobile, fit its height to the active content as accepted in the subsequent user review.
- Explain player motivations and the rules once in the introduction. Retain named player proposals at decision points and one budget summary per relevant phase; show the final breakdown once. Remove the repeated sidebar, status captions and empty-choice instructions on both desktop and mobile.
- On mobile, start, next, back and reset scroll to the active screen below the fixed header. On desktop, scroll only if the new heading would otherwise be out of view. Focus the heading, respect reduced motion, and keep answer selection independent from transition scrolling.
- Keep only the accepted catalog composition: copy and formats at left, photograph at right; photograph above on mobile.
- Native audience links, enquiry anchors and the shared live LeadForm complete the user journey. The local development safety profile is unchanged.
- Use canonical metadata, Open Graph, breadcrumbs and sitemap. Add the service to both CMS-backed and fallback company navigation.
- Remove only financial-games experiments, their controls, alternate styles and unused assets. Preserve the experiments hub and unrelated work.
- Keep image provenance and the authored-scenario boundary in `docs/financial-games`.

## Verification

The bounded production integration pass is complete (2026-09-11): desktop/mobile catalog composition, named players and budget, hidden inactive scenes, back/reset and heading focus, navigation, audience anchors and enquiry CTA. TypeScript, targeted ESLint and scoped type/layout checks pass. Canonical/OG metadata, sitemap inclusion and experiment-route removal were verified.

The subsequent compact-game pass covered all five phases at 1440px and 390px, with a narrow-width check at 320px. It confirmed a stable desktop frame, content-sized mobile screens, disabled progression before a choice, budget updates, reflection, keyboard selection and no horizontal overflow. A single fix batch added conditional desktop scrolling for offscreen headings and removed a duplicate divider. Final confirmation verified desktop and mobile transitions. Reduced-motion behavior was reviewed in code, without browser media emulation.

One reproduced integration defect was fixed: the shared LeadForm consent/error IDs now follow its unique section anchor, avoiding a server/client ID mismatch. Confirmation found no hydration error. No form submission was made. Local Strapi intermittently failed during review; the existing navigation fallback and successful CMS-backed page loads were both observed.
