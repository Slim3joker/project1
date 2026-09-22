/**
 * KUBOLT design system — public API.
 *
 * Import 'kubolt-design-system/styles.css' once in the host app for the
 * theme tokens and all component styles.
 */

// Design tokens (also available via 'kubolt-design-system/tokens')
export * from './tokens';

// Components
export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';

export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Callout } from './components/Callout';
export type { CalloutProps, CalloutTone } from './components/Callout';

export {
  Card,
  CardBody,
  CardFooter,
  CardMedia,
  CardTitle,
} from './components/Card';
export type {
  CardBodyProps,
  CardFooterProps,
  CardMediaProps,
  CardProps,
  CardTitleProps,
} from './components/Card';

export { COLORWAY_IDS, ColorwaySwatch } from './components/ColorwaySwatch';
export type {
  ColorwayId,
  ColorwaySwatchProps,
} from './components/ColorwaySwatch';

export { Container } from './components/Container';
export type { ContainerProps } from './components/Container';

export { FeatureRow } from './components/FeatureRow';
export type { FeatureRowProps } from './components/FeatureRow';

export { Footer } from './components/Footer';
export type { FooterProps } from './components/Footer';

export { Grid } from './components/Grid';
export type { GridProps } from './components/Grid';

export { Header } from './components/Header';
export type { HeaderProps } from './components/Header';

export { Input, Textarea } from './components/Input';
export type { InputProps, TextareaProps } from './components/Input';

export { KubiSlot } from './components/KubiSlot';
export type {
  KubiSlotChildrenProps,
  KubiSlotImageProps,
  KubiSlotProps,
} from './components/KubiSlot';

export { Section } from './components/Section';
export type { SectionProps } from './components/Section';

export { SectionHeader } from './components/SectionHeader';
export type { SectionHeaderProps } from './components/SectionHeader';

export { StoryBlock } from './components/StoryBlock';
export type { StoryBlockProps } from './components/StoryBlock';
