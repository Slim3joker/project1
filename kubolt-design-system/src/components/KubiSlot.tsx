import './KubiSlot.css';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

interface KubiSlotBaseProps extends HTMLAttributes<HTMLElement> {
  /** CSS aspect-ratio of the reserved stage. Default '1 / 1'. */
  aspectRatio?: string;
  /** 'panel' wraps the slot in a sunken, xl-rounded surface. Default 'none'. */
  frame?: 'none' | 'panel';
  /** Adds the ring-gemstone cobalt glow environment behind the content. */
  glow?: boolean;
  /** Optional <figcaption> content below the stage. */
  caption?: ReactNode;
}

export interface KubiSlotImageProps extends KubiSlotBaseProps {
  /** Mascot render source. */
  src: string;
  /**
   * Required alongside src — pass '' explicitly for decorative renders so the
   * decision is always deliberate.
   */
  alt: string;
  children?: never;
}

export interface KubiSlotChildrenProps extends KubiSlotBaseProps {
  src?: never;
  alt?: never;
  /** Placeholder or illustration node shown instead of an image. */
  children?: ReactNode;
}

export type KubiSlotProps = KubiSlotImageProps | KubiSlotChildrenProps;

/**
 * KubiSlot — reserved placement for KUBI mascot renders.
 *
 * Renders come from the brand's saved mascot character reference; this
 * component only reserves the placement, frame and glow. It never draws KUBI.
 *
 * Design rules encoded:
 * - Fixed aspect-ratio stage with centered contents; images are lazy-loaded
 *   and contained, never cropped.
 * - Optional sunken panel frame (surface-sunken, radius-xl) and the opt-in
 *   cobalt glow circle — the one glowing moment, used sparingly.
 * - `alt` is type-required whenever `src` is set ('' allowed for decorative).
 */
export function KubiSlot(props: KubiSlotProps) {
  const {
    aspectRatio = '1 / 1',
    frame = 'none',
    glow = false,
    caption,
    src,
    alt,
    children,
    className,
    ...rest
  } = props;

  return (
    <figure
      {...rest}
      className={cx(
        'kb-kubi-slot',
        frame === 'panel' && 'kb-kubi-slot--panel',
        glow && 'kb-kubi-slot--glow',
        className,
      )}
    >
      <div
        className="kb-kubi-slot__stage"
        style={{ '--kb-kubi-slot-aspect': aspectRatio } as CSSProperties}
      >
        {src != null ? (
          <img
            className="kb-kubi-slot__img"
            src={src}
            alt={alt}
            loading="lazy"
          />
        ) : (
          children
        )}
      </div>
      {caption != null && (
        <figcaption className="kb-kubi-slot__caption">{caption}</figcaption>
      )}
    </figure>
  );
}
