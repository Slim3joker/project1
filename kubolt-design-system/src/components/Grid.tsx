import './Grid.css';
import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Column count at >=960px. Below that: 2 cols from 640px (capped at cols), 1 col on mobile. Default 3. */
  cols?: 2 | 3 | 4;
  /** Gap preset: 'sm' --kb-space-4, 'md' --kb-space-6, 'lg' --kb-space-12. Default 'md'. */
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * Grid — responsive equal-column layout.
 *
 * Encodes the system's breakpoints: 1 column below 640px, 2 columns
 * between 640-960px (never exceeding cols), and the requested cols from
 * 960px. Gaps come from the --kb-space-* scale only.
 */
export function Grid({ cols = 3, gap = 'md', className, children, ...rest }: GridProps) {
  return (
    <div
      className={cx('kb-grid', `kb-grid--cols-${cols}`, `kb-grid--gap-${gap}`, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
