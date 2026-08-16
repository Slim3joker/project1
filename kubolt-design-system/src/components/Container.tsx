import './Container.css';
import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Max-width preset: 'sm' 720px, 'md' 960px, 'lg' 1200px. Default 'lg'. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Container — centers page content at a readable max-width.
 *
 * Encodes KUBOLT's layout rhythm: content sits centered on the warm cream
 * page with generous inline padding (--kb-space-6, tightening to
 * --kb-space-4 below 640px). Purely structural — no background, no border.
 */
export function Container({ size = 'lg', className, children, ...rest }: ContainerProps) {
  return (
    <div className={cx('kb-container', `kb-container--${size}`, className)} {...rest}>
      {children}
    </div>
  );
}
