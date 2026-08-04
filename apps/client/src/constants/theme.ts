import { Platform } from 'react-native';

export { palette } from '@/constants/color-tokens';
export type { AppPalette, ThemeName } from '@/constants/color-tokens';

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const typography = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', web: 'system-ui' }),
  size: {
    caption: 12,
    bodySmall: 14,
    body: 16,
    titleSmall: 20,
    title: 28,
    display: 44,
  },
  lineHeight: {
    caption: 18,
    bodySmall: 21,
    body: 25,
    titleSmall: 26,
    title: 34,
    display: 50,
  },
} as const;

export const layout = {
  maxContentWidth: 1120,
  maxReadingWidth: 680,
  minTouchTarget: 48,
  compactBreakpoint: 640,
  wideBreakpoint: 900,
} as const;

export const motion = {
  fast: 120,
  regular: 220,
  slow: 360,
} as const;

export const maxContentWidth = layout.maxReadingWidth;
