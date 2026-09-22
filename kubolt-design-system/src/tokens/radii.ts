/**
 * KUBOLT radii — defined-soft, mirroring the cube's slightly rounded
 * edges. Not cartoon-round.
 */
export const radii = {
  /** Inputs, small chips. */
  sm: '6px',
  /** Buttons, default. */
  md: '10px',
  /** Cards. */
  lg: '16px',
  /** Large panels, hero image frames. */
  xl: '24px',
  /** Feature blocks. */
  '2xl': '32px',
  /** Pills, avatars, icon buttons. */
  full: '9999px',
} as const;

export type RadiusStep = keyof typeof radii;
