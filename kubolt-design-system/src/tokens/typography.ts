/**
 * KUBOLT typography tokens.
 *
 * Display/headings + body/UI: DM Sans (Google Fonts, OFL) — a warm
 * geometric grotesque. The optional premium upgrade path (General Sans /
 * Söhne as heading font) swaps a single token: `fontFamily.display`.
 *
 * Never use serifs, script fonts, or heavily rounded fonts — KUBI carries
 * the playfulness, not the type.
 */

const sansStack =
  "'DM Sans', 'DM Sans Fallback', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const fontFamily = {
  /** Body / UI. */
  sans: sansStack,
  /**
   * Display / headings. Kept as its own token so the premium upgrade
   * (General Sans / Söhne) is a one-line swap.
   */
  display: sansStack,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  bold: 700,
} as const;

/** Type scale — base 16px = 1rem, ratio ~1.25. */
export const typeScale = {
  xs: { fontSize: '0.75rem', lineHeight: 1.4, use: 'Captions, labels' },
  sm: { fontSize: '0.875rem', lineHeight: 1.5, use: 'Secondary text' },
  base: { fontSize: '1rem', lineHeight: 1.6, use: 'Body text' },
  lg: { fontSize: '1.125rem', lineHeight: 1.5, use: 'Lead text' },
  xl: { fontSize: '1.25rem', lineHeight: 1.4, use: 'Sub-headings' },
  '2xl': { fontSize: '1.5rem', lineHeight: 1.3, use: 'H3' },
  '3xl': { fontSize: '2rem', lineHeight: 1.2, use: 'H2' },
  '4xl': { fontSize: '2.5rem', lineHeight: 1.15, use: 'H1 (sections)' },
  '5xl': { fontSize: '3.25rem', lineHeight: 1.05, use: 'Hero' },
  '6xl': { fontSize: '4rem', lineHeight: 1.0, use: 'Hero (large)' },
} as const;

export type TypeScaleStep = keyof typeof typeScale;

/**
 * Letter spacing: headings slightly negative, body neutral,
 * uppercase labels (`xs`) slightly positive.
 */
export const letterSpacing = {
  tight: '-0.01em',
  tighter: '-0.02em',
  normal: '0',
  caps: '0.04em',
} as const;

export const typography = {
  fontFamily,
  fontWeight,
  typeScale,
  letterSpacing,
} as const;

export type Typography = typeof typography;
