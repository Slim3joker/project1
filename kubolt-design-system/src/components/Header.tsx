import './Header.css';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Brand lockup slot (consumer supplies the link wrapper). */
  logo: ReactNode;
  /** Optional call-to-action slot on the far right (e.g. a primary Button). */
  cta?: ReactNode;
  /** Surface behind the header. 'cream' = var(--kb-background). Default 'cream'. */
  background?: 'transparent' | 'cream';
  /**
   * Stick to the top of the viewport. Forces the cream background and adds a
   * hairline border-bottom so page content never shows through.
   */
  sticky?: boolean;
  /** Accessible label passed to the <nav> element. */
  navLabel?: string;
}

/**
 * Site header / primary navigation.
 *
 * Role: top-of-page banner with the KUBOLT lockup left, nav links in the
 * middle/right, and an optional CTA slot on the far right.
 *
 * Design rules encoded:
 * - Warm cream surface by default; sticky mode forces the cream background
 *   plus a 1px hairline so content never bleeds through.
 * - Nav links are quiet navy text; cobalt appears only on hover (accent text)
 *   and on the focus-visible glow — never as a permanent color.
 * - Dependency-free: no JS mobile menu. On narrow screens the nav simply
 *   wraps (flex-wrap) instead of collapsing behind a toggle.
 */
export function Header({
  logo,
  cta,
  background = 'cream',
  sticky = false,
  navLabel,
  className,
  children,
  ...rest
}: HeaderProps) {
  return (
    <header
      className={cx(
        'kb-header',
        background === 'transparent' && 'kb-header--transparent',
        sticky && 'kb-header--sticky',
        className,
      )}
      {...rest}
    >
      <div className="kb-header__logo">{logo}</div>
      <nav className="kb-header__nav" aria-label={navLabel}>
        {children}
      </nav>
      {cta != null ? <div className="kb-header__cta">{cta}</div> : null}
    </header>
  );
}
