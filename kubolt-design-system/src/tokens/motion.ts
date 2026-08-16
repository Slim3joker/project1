/**
 * KUBOLT motion tokens — subtle by design.
 *
 * One orchestrated moment beats scattered effects; no perpetual
 * animation. `prefers-reduced-motion` is respected globally in theme.css.
 */
export const motion = {
  duration: '180ms',
  easing: 'ease-out',
  /** Standard hover/focus transition value. */
  transition: '180ms ease-out',
} as const;
