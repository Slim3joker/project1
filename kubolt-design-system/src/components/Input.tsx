import './Input.css';
import { forwardRef, useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { cx } from '../lib/cx';

interface FieldExtraProps {
  /** Field label, associated with the control via htmlFor. */
  label?: ReactNode;
  /** Helper line below the field, wired via aria-describedby. */
  helperText?: ReactNode;
  /** Error message — replaces helperText, sets aria-invalid and error styles. */
  error?: ReactNode;
  /**
   * Class for the outer field-group wrapper. `className` (and `style`) go to
   * the control element itself, matching the input-attribute type contract.
   */
  wrapperClassName?: string;
}

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    FieldExtraProps {}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    FieldExtraProps {}

interface FieldWiring {
  fieldId: string;
  helperId: string;
  helperContent: ReactNode;
  hasHelper: boolean;
  isError: boolean;
  describedBy: string | undefined;
}

/** Shared id / helper / aria wiring for Input and Textarea. */
function useFieldWiring(
  id: string | undefined,
  helperText: ReactNode,
  error: ReactNode,
  ariaDescribedBy: string | undefined,
): FieldWiring {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const helperId = `${fieldId}-helper`;
  // false and '' render as nothing in React, so they must not count as an
  // error/helper (supports the idiomatic error={touched && message}).
  const isError = error != null && error !== false && error !== '';
  const helperContent = isError ? error : helperText;
  const hasHelper =
    helperContent != null && helperContent !== false && helperContent !== '';
  return {
    fieldId,
    helperId,
    helperContent,
    hasHelper,
    isError,
    describedBy: cx(ariaDescribedBy, hasHelper && helperId) || undefined,
  };
}

/**
 * Input — single-line text field of the KUBOLT system.
 *
 * Encodes the calm warm surface (--kb-surface on a 1px --kb-border,
 * defined-soft --kb-radius-sm) and reserves the signature cobalt moment for
 * focus: the ring + glow (--kb-focus-shadow, --kb-glow-cobalt) replace the
 * outline. Errors switch border and helper line to --kb-error and are
 * announced via aria-invalid + aria-describedby. Label and helper copy come
 * via props — no hardcoded text.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      helperText,
      error,
      id,
      className,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    ref,
  ) {
    const wiring = useFieldWiring(id, helperText, error, ariaDescribedBy);
    return (
      <div className={cx('kb-field-group', wrapperClassName)}>
        {label != null && label !== false && (
          <label className="kb-field-label" htmlFor={wiring.fieldId}>
            {label}
          </label>
        )}
        <input
          {...rest}
          ref={ref}
          id={wiring.fieldId}
          className={cx(
            'kb-field',
            wiring.isError && 'kb-field--error',
            className,
          )}
          aria-invalid={wiring.isError ? true : ariaInvalid}
          aria-describedby={wiring.describedBy}
        />
        {wiring.hasHelper && (
          <p
            id={wiring.helperId}
            className={cx(
              'kb-field-helper',
              wiring.isError && 'kb-field-helper--error',
            )}
          >
            {wiring.helperContent}
          </p>
        )}
      </div>
    );
  },
);

/**
 * Textarea — multi-line sibling of Input, sharing the same .kb-field styles:
 * warm surface, defined-soft radius, cobalt ring + glow reserved for focus,
 * --kb-error treatment wired via aria-invalid + aria-describedby. Resizes
 * vertically only and starts at roughly three rows.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      helperText,
      error,
      id,
      className,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...rest
    },
    ref,
  ) {
    const wiring = useFieldWiring(id, helperText, error, ariaDescribedBy);
    return (
      <div className={cx('kb-field-group', wrapperClassName)}>
        {label != null && label !== false && (
          <label className="kb-field-label" htmlFor={wiring.fieldId}>
            {label}
          </label>
        )}
        <textarea
          {...rest}
          ref={ref}
          id={wiring.fieldId}
          className={cx(
            'kb-field',
            'kb-field--textarea',
            wiring.isError && 'kb-field--error',
            className,
          )}
          aria-invalid={wiring.isError ? true : ariaInvalid}
          aria-describedby={wiring.describedBy}
        />
        {wiring.hasHelper && (
          <p
            id={wiring.helperId}
            className={cx(
              'kb-field-helper',
              wiring.isError && 'kb-field-helper--error',
            )}
          >
            {wiring.helperContent}
          </p>
        )}
      </div>
    );
  },
);
