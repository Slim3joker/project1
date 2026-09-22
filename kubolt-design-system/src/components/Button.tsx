import './Button.css';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. 'primary' is the cobalt CTA — its hover glow is the brand's signature moment. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Control size. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to the full width of the container. */
  fullWidth?: boolean;
  /** Decorative icon before the label (hidden from assistive tech). */
  leftIcon?: ReactNode;
  /** Decorative icon after the label (hidden from assistive tech). */
  rightIcon?: ReactNode;
}

/**
 * Button — the CTA of the KUBOLT system.
 *
 * Encodes the brand's defined-soft geometry (--kb-radius-md) and its single
 * saturated accent: only the primary variant carries cobalt, and only on
 * hover/focus does it glow (--kb-glow-cobalt) — the one moment where
 * something glows, used nowhere else by default. Secondary and ghost stay
 * calm in navy on the warm pastel base. All labels come via children;
 * icons are decorative and passed as props.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cx(
          'kb-button',
          `kb-button--${variant}`,
          `kb-button--${size}`,
          fullWidth && 'kb-button--full',
          className,
        )}
        {...rest}
      >
        {leftIcon != null && (
          <span className="kb-button__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon != null && (
          <span className="kb-button__icon" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);
