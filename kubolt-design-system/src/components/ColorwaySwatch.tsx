import './ColorwaySwatch.css';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../lib/cx';

/** Product colorway families defined in theme.css (--kb-colorway-*). */
export const COLORWAY_IDS = [
  'sage-green',
  'dusty-rose',
  'dove-blue',
  'sand-cream',
] as const;

export type ColorwayId = (typeof COLORWAY_IDS)[number];

export interface ColorwaySwatchProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Which colorway family the swatch shows. */
  colorway: ColorwayId;
  /** Label under the disc. Defaults to the prettified colorway name. */
  label?: string;
  /** Whether this variant is the current selection (rendered as aria-pressed). */
  selected?: boolean;
  /** 'circle' (default) or 'square' — the square mirrors the cube's edges. */
  shape?: 'circle' | 'square';
  /** Disc size: sm 28px, md 36px (default), lg 48px. */
  size?: 'sm' | 'md' | 'lg';
  /** Show the label below the disc. Default true. */
  showLabel?: boolean;
}

function prettifyColorway(id: ColorwayId): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * ColorwaySwatch — selectable product-colorway choice for the variant picker.
 *
 * Design rules encoded:
 * - Disc uses ONLY the colorway tokens: family base fill + 2px family ink border.
 * - Selection is marked by the single cobalt accent (surface gap + cobalt ring);
 *   hover on unselected swatches is a subtle scale, no color noise.
 * - Renders a real <button type="button"> with aria-pressed for the pressed state.
 */
export const ColorwaySwatch = forwardRef<HTMLButtonElement, ColorwaySwatchProps>(
  function ColorwaySwatch(
    {
      colorway,
      label,
      selected = false,
      shape = 'circle',
      size = 'md',
      showLabel = true,
      className,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) {
    const accessibleName = label ?? prettifyColorway(colorway);
    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        aria-pressed={selected}
        aria-label={ariaLabel ?? (showLabel ? undefined : accessibleName)}
        className={cx(
          'kb-colorway-swatch',
          selected && 'kb-colorway-swatch--selected',
          className,
        )}
      >
        <span
          className={cx(
            'kb-colorway-swatch__disc',
            `kb-colorway-swatch__disc--${colorway}`,
            `kb-colorway-swatch__disc--${shape}`,
            `kb-colorway-swatch__disc--${size}`,
          )}
        />
        {showLabel && (
          <span className="kb-colorway-swatch__label">{accessibleName}</span>
        )}
      </button>
    );
  },
);
