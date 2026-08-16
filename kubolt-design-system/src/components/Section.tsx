import './Section.css';
import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Extra vertical breathing room (--kb-space-16 mobile / --kb-space-32 desktop). */
  spacious?: boolean;
  /**
   * Band background: 'default' transparent (page shows --kb-background),
   * 'surface' white card tone, 'sunken' warm sand, 'navy' deep navy with
   * inverse text. Default 'default'.
   */
  background?: 'default' | 'surface' | 'sunken' | 'navy';
}

/**
 * Section — full-width page band that owns vertical rhythm.
 *
 * Encodes "whitespace = premium": generous padding-block (--kb-space-12
 * mobile, --kb-space-24 from 768px; more when spacious). Backgrounds stay
 * in the warm semantic palette; the navy band flips to inverse text for
 * story moments.
 */
export function Section({
  spacious = false,
  background = 'default',
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      className={cx(
        'kb-section',
        spacious && 'kb-section--spacious',
        background !== 'default' && `kb-section--${background}`,
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
