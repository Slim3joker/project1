import './Footer.css';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /**
   * Brand slot in the top area. On this dark navy surface, use the reduced
   * single-color wordmark (light on dark), not the full-color lockup.
   */
  logo?: ReactNode;
  /** Bottom-bar content (copyright, legal links). */
  legal?: ReactNode;
}

/**
 * Site footer on the dark navy surface.
 *
 * Role: closing band with brand slot, consumer-supplied link columns
 * (children), and a legal bottom bar.
 *
 * Design rules encoded:
 * - The ONE cobalt moment here is the glowing 2px top hairline
 *   (accent + --kb-glow-cobalt) — decorative only.
 * - Cobalt on navy is ~2:1 contrast: NEVER used for text or links. Links are
 *   translucent inverse text that resolve to full inverse + underline on
 *   hover; the focus-visible ring stays cobalt (outline reads fine against
 *   the glow edge).
 * - Column headings: consumers apply the .kb-footer__heading class to their
 *   own heading elements inside the link columns (caps, xs, 60% inverse).
 */
export function Footer({ logo, legal, className, children, ...rest }: FooterProps) {
  return (
    <footer className={cx('kb-footer', className)} {...rest}>
      <div className="kb-footer__top">
        {logo != null ? <div className="kb-footer__logo">{logo}</div> : null}
        <div className="kb-footer__columns">{children}</div>
      </div>
      {legal != null ? <div className="kb-footer__bottom">{legal}</div> : null}
    </footer>
  );
}
