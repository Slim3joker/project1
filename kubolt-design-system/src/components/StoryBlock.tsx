import './StoryBlock.css';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface StoryBlockProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Media side of the module (image, video, illustration node). */
  media: ReactNode;
  /** Headline of the story beat. */
  title: ReactNode;
  /** Small caps kicker above the title. */
  eyebrow?: ReactNode;
  /** Place media on the right instead of the left (desktop only). */
  reverse?: boolean;
  /** Give the media wrapper the quiet cobalt glow — the story's one accent. */
  glow?: boolean;
}

/**
 * StoryBlock — text-image module for the Kobalt brand story
 * (miners' legend → cobalt → power).
 *
 * Design rules encoded:
 * - Two-column media | text grid, centered; stacks to one column (media first)
 *   below 768px, even when reversed.
 * - Body copy is capped at 60ch and set in text-secondary; the title uses the
 *   display face with tighter tracking.
 * - The cobalt glow is opt-in (`glow`) and only ever on the media wrapper —
 *   used sparingly as the story's signature moment.
 */
export function StoryBlock({
  media,
  title,
  eyebrow,
  reverse = false,
  glow = false,
  children,
  className,
  ...rest
}: StoryBlockProps) {
  return (
    <section
      {...rest}
      className={cx(
        'kb-story-block',
        reverse && 'kb-story-block--reverse',
        className,
      )}
    >
      <div
        className={cx(
          'kb-story-block__media',
          glow && 'kb-story-block__media--glow',
        )}
      >
        {media}
      </div>
      <div className="kb-story-block__text">
        {eyebrow != null && (
          <p className="kb-story-block__eyebrow">{eyebrow}</p>
        )}
        <h2 className="kb-story-block__title">{title}</h2>
        <div className="kb-story-block__body">{children}</div>
      </div>
    </section>
  );
}
