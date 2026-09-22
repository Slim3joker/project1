/**
 * KUBOLT spacing tokens — 4px base scale.
 *
 * Section padding is generous (whitespace = premium): desktop uses
 * space-24/space-32 vertically, mobile space-12/space-16.
 */
export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

export type SpacingStep = keyof typeof spacing;
