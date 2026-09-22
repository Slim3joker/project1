import './FeatureRow.css';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface FeatureRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Icon node, rendered cobalt inside a quiet 40px round sunken well. */
  icon: ReactNode;
  /** Feature title (lg, medium weight, primary text). */
  title: ReactNode;
  /** Optional description below the title (base size, secondary text). */
  children?: ReactNode;
}

/**
 * FeatureRow — spec/benefit row for product facts.
 * Encodes: the icon is the sparing cobalt moment inside a quiet
 * surface-sunken circle; text stays calm (primary title, secondary
 * description). Flex row, top-aligned, space-4 gap.
 */
export function FeatureRow({
  icon,
  title,
  children,
  className,
  ...rest
}: FeatureRowProps) {
  return (
    <div className={cx('kb-feature-row', className)} {...rest}>
      <span className="kb-feature-row__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="kb-feature-row__content">
        <div className="kb-feature-row__title">{title}</div>
        {children != null && (
          <div className="kb-feature-row__description">{children}</div>
        )}
      </div>
    </div>
  );
}
