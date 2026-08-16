import './Card.css';
import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../lib/cx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Clickable/linked cards lift on hover (translateY(-2px) + shadow-md)
   * and get the cobalt focus treatment when made focusable.
   */
  interactive?: boolean;
}

/**
 * Card — base surface for product and content cards.
 * Encodes: surface on warm cream, 1px border, defined-soft radius (lg),
 * soft navy-tinted shadow that deepens on hover; overflow hidden so media
 * clips to the radius. Compose with CardMedia / CardBody / CardTitle /
 * CardFooter.
 */
export function Card({ interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cx('kb-card', interactive && 'kb-card--interactive', className)}
      {...rest}
    />
  );
}

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  /** CSS aspect-ratio for the media box, e.g. '4/3' or '16/9'. */
  aspectRatio?: string;
}

/**
 * CardMedia — full-bleed top area for an image/illustration.
 * No padding; direct img/video children fill and cover the box, and the
 * parent Card's overflow clips them to the radius.
 */
export function CardMedia({
  aspectRatio,
  className,
  style,
  ...rest
}: CardMediaProps) {
  const mergedStyle: CSSProperties | undefined = aspectRatio
    ? { aspectRatio, ...style }
    : style;
  return (
    <div className={cx('kb-card__media', className)} style={mergedStyle} {...rest} />
  );
}

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

/**
 * CardTitle — display-face heading inside CardBody.
 * Encodes: display font, xl size, bold, tight tracking, primary text color.
 */
export function CardTitle({ className, ...rest }: CardTitleProps) {
  return <h3 className={cx('kb-card__title', className)} {...rest} />;
}

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;

/**
 * CardBody — padded content area (space-6), base type on primary text.
 * CardTitle is expected to live inside it.
 */
export function CardBody({ className, ...rest }: CardBodyProps) {
  return <div className={cx('kb-card__body', className)} {...rest} />;
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

/**
 * CardFooter — quiet meta strip: hairline top border, sm type on
 * secondary text.
 */
export function CardFooter({ className, ...rest }: CardFooterProps) {
  return <div className={cx('kb-card__footer', className)} {...rest} />;
}
