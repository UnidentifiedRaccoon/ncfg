export const motionTokens = {
  ease: [0.16, 1, 0.3, 1],
  feedback: 0.15,
  content: 0.24,
  step: 0.36,
  stepDistance: 24,
  compactStepDistance: 12,
  disclosure: 0.3,
  exit: 0.18,
  reveal: 0.4,
  cardReveal: 0.56,
  cardDistance: 40,
  compactCardDistance: 16,
  cardScale: 0.97,
  revealInset: 0.26,
  compactRevealInset: 0.16,
  logoReveal: 0.36,
  logoDistance: 12,
  logoStagger: 0.024,
  count: 0.8,
  distance: 16,
  compactDistance: 8,
  stagger: 0.05,
  maxStagger: 0.2,
  heroOffset: 24,
  heroScale: 1.03,
  partnerInterval: 5000,
} as const;

export function contentTransition(reduced: boolean) {
  return { duration: reduced ? 0 : motionTokens.content, ease: motionTokens.ease };
}
