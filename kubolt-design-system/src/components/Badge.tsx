import './Badge.css';
import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Colorway pastel used as the pill background. Defaults to 'sage'. */
  tone?: 'sage' | 'rose' | 'dove' | 'sand';
  /**
   * Text color pairing. 'ink' (default) uses the colorway's own ink;
   * 'navy' switches to navy for higher contrast. Defaults to 'ink'.
   */
  textTone?: 'ink' | 'navy';
}

/**
 * Badge — pill label for colorway tags, the "Klub der Kubis" badge, and
 * story badges.
 *
 * Encodes the colorway pairing rules: each tone paints the pill with its
 * pastel -base and its family -ink text. Ink on its own base sits at only
 * ~3:1 contrast, so the default 'ink' pairing is meant for short display
 * labels only — never body-length text. textTone='navy' swaps the text to
 * navy (--kb-color-navy-900), the higher-contrast pairing (~6-12:1) that
 * is safe for small text. Caps styling (uppercase + --kb-tracking-caps)
 * is baked in; content always comes via children.
 */
export function Badge({
  tone = 'sage',
  textTone = 'ink',
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(
        'kb-badge',
        `kb-badge--${tone}`,
        textTone === 'navy' && 'kb-badge--text-navy',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
