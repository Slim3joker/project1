import './Callout.css';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export type CalloutTone = 'accent' | 'success' | 'warning' | 'error';

export interface CalloutProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Tone colors the 4px left edge and the icon. Default: 'accent' (cobalt). */
  tone?: CalloutTone;
  /** Optional heading line (medium weight, primary text). */
  title?: ReactNode;
  /** Optional leading icon, colored to the tone. */
  icon?: ReactNode;
}

/**
 * Callout — hint/highlight note (role="note").
 * Encodes: quiet surface with a single 4px tone-colored left edge — the
 * accent stays a small moment, never a filled banner. Body is sm type on
 * secondary text.
 */
export function Callout({
  tone = 'accent',
  title,
  icon,
  children,
  className,
  ...rest
}: CalloutProps) {
  return (
    <div
      role="note"
      className={cx('kb-callout', `kb-callout--${tone}`, className)}
      {...rest}
    >
      {icon != null && (
        <span className="kb-callout__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="kb-callout__content">
        {title != null && <div className="kb-callout__title">{title}</div>}
        <div className="kb-callout__body">{children}</div>
      </div>
    </div>
  );
}
