import { Platform } from 'react-native';

export const palette = {
  light: {
    background: '#f8f5f0',
    surface: '#ffffff',
    surfaceMuted: '#efe9e1',
    text: '#242126',
    textMuted: '#6d666e',
    border: '#ddd4ca',
    brand: '#5d4f7c',
    brandStrong: '#473a65',
    accent: '#ba684f',
    success: '#2f745f',
    onBrand: '#ffffff',
  },
  dark: {
    background: '#171519',
    surface: '#211f24',
    surfaceMuted: '#2d2930',
    text: '#f7f2eb',
    textMuted: '#bbb2bb',
    border: '#403a42',
    brand: '#b8a5df',
    brandStrong: '#d1c1ef',
    accent: '#e6957c',
    success: '#78bda6',
    onBrand: '#21182d',
  },
} as const;

export type AppPalette = (typeof palette)[keyof typeof palette];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const typography = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', web: 'system-ui' }),
} as const;

export const maxContentWidth = 760;
