/**
 * KUBOLT shadows — soft, navy-tinted (never black), matching the diffuse
 * "soft from top-left" photo lighting.
 *
 * `glowCobalt` is THE signature detail: ring gemstone, bolt, CTA hover,
 * focus ring, story accents. Use sparingly — it is the one moment where
 * something glows, not everywhere.
 */
export const shadows = {
  xs: '0 1px 2px rgba(22, 41, 77, 0.06)',
  sm: '0 2px 8px rgba(22, 41, 77, 0.08)',
  md: '0 8px 24px rgba(22, 41, 77, 0.10)',
  lg: '0 16px 48px rgba(22, 41, 77, 0.12)',
  glowCobalt: '0 0 24px rgba(30, 80, 230, 0.35)',
} as const;

export type ShadowStep = keyof typeof shadows;
