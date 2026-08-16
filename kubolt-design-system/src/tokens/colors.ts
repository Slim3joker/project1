/**
 * KUBOLT color tokens.
 *
 * Rule: soft warm pastels as the base + cobalt blue as the ONE signature
 * accent. No loud primaries, no terracotta, no yellow in the digital system
 * (the yellow bolt exists only as an alternate Amazon thumbnail logo asset).
 */

/** Brand core palette. */
export const brand = {
  /** Primary brand color: wordmark, text on light, dark surfaces. */
  navy: '#16294D',
  /** Signature accent (glowing): fills, icons, CTA, glow. */
  cobalt: '#1E50E6',
  /** Cobalt for text on light backgrounds (AA contrast, 8.4:1 on white). */
  cobaltDeep: '#0047AB',
  /** Pastel base: surfaces, sections, badges. */
  sage: '#9CAF9A',
  /** Pastel secondary accent. */
  rose: '#D2A6A1',
  /** Warm cream background / surface. */
  sand: '#EFE7D6',
} as const;

/**
 * Product colorways for swatches, variant pickers, packaging mockups.
 * Each has a pastel `base` + an `ink` (darker tone of the same family).
 *
 * Contrast note: ink on its own base is only ~3:1 — use that pairing for
 * large/display type and packaging only. Body text on a pastel surface
 * uses navy instead.
 */
export const colorways = {
  sageGreen: { base: '#9CAF9A', ink: '#2C5C46' },
  dustyRose: { base: '#D2A6A1', ink: '#8C4A4A' },
  doveBlue: { base: '#7FA8BA', ink: '#2C4E5C' },
  sandCream: { base: '#D4C5A9', ink: '#6B5A3C' },
} as const;

export type ColorwayName = keyof typeof colorways;

/** Warm-tinted neutrals (leaning cream) — the UI must never feel cold. */
export const neutrals = {
  white: '#FFFFFF',
  cream50: '#FAF8F3',
  sand100: '#EFE7D6',
  line200: '#E5E0D3',
  warm300: '#D6CFBF',
  warm400: '#B7B0A1',
  warm500: '#8C877B',
  warm600: '#635F56',
  ink800: '#2B2A26',
  navy900: '#16294D',
} as const;

/** Muted status colors, tuned to sit inside the warm set. */
export const status = {
  success: '#5B8C6E',
  warning: '#C99A3B',
  error: '#B5544C',
} as const;

/**
 * Semantic layer — the only color tokens components reference.
 *
 * WCAG (checked 2026-08-16):
 * - textPrimary (navy) on light surfaces: 11–14:1
 * - textSecondary (warm-600) on light surfaces: ~6:1
 * - accent (cobalt) on white: 6.28:1 — AA for normal text; white button
 *   text on a cobalt fill likewise 6.28:1
 * - navy text on pastel badges (sage/rose/sand): 6–12:1
 */
export const semantic = {
  background: neutrals.cream50,
  surface: neutrals.white,
  surfaceSunken: neutrals.sand100,
  textPrimary: neutrals.navy900,
  textSecondary: neutrals.warm600,
  textInverse: neutrals.cream50,
  border: neutrals.line200,
  borderStrong: neutrals.warm400,
  accent: brand.cobalt,
  accentHover: brand.cobaltDeep,
  accentText: brand.cobaltDeep,
  focusRing: brand.cobalt,
} as const;

export const colors = {
  brand,
  colorways,
  neutrals,
  status,
  semantic,
} as const;

export type Colors = typeof colors;
