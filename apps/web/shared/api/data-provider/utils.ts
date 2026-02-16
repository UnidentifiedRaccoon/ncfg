export function stripEllipsis(text: string): string {
  return text.replace(/\.{2,}$/, '');
}

export function withLeadingSlash(path: string): string {
  if (!path) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

export function isIndividualsProductIconKey(
  value: unknown
): value is 'graduation-cap' | 'trending-up' | 'zap' {
  return value === 'graduation-cap' || value === 'trending-up' || value === 'zap';
}

