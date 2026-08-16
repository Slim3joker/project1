import './SectionHeader.css';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface SectionHeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /**
   * Small caps line above the title. Rendered ONLY when provided — and it
   * must carry real information (category, product family, audience);
   * decorative numbering ("01", "02") is forbidden by the brand brief.
   */
  eyebrow?: ReactNode;
  /** Section title. Required — all copy comes via props. */
  title: ReactNode;
  /** Optional lead paragraph below the title, capped at a readable 65ch. */
  lead?: ReactNode;
  /** Heading level: 2 (display, --kb-text-3xl) or 3 (--kb-text-2xl). Defaults to 2. */
  level?: 2 | 3;
  /** Text alignment; 'center' also auto-centers the lead. Defaults to 'start'. */
  align?: 'start' | 'center';
}

/**
 * SectionHeader — eyebrow + title + optional lead introducing a page section.
 *
 * Encodes the KUBOLT type voice: display face with slightly negative
 * tracking on titles (tighter at 3xl, tight at 2xl), a quiet caps eyebrow
 * in --kb-text-secondary, and a lead capped at 65ch for calm measure. No
 * accent color and no glow — the cobalt moment belongs to CTAs and focus,
 * not headings. Renders a <header>; not interactive, so no focus styles.
 */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  level = 2,
  align = 'start',
  className,
  ...rest
}: SectionHeaderProps) {
  const TitleTag = level === 3 ? 'h3' : 'h2';
  return (
    <header
      {...rest}
      className={cx(
        'kb-section-header',
        align === 'center' && 'kb-section-header--center',
        className,
      )}
    >
      {eyebrow != null && (
        <p className="kb-section-header__eyebrow">{eyebrow}</p>
      )}
      <TitleTag
        className={cx(
          'kb-section-header__title',
          level === 3
            ? 'kb-section-header__title--level-3'
            : 'kb-section-header__title--level-2',
        )}
      >
        {title}
      </TitleTag>
      {lead != null && <p className="kb-section-header__lead">{lead}</p>}
    </header>
  );
}
