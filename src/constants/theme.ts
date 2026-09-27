import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111111',
    background: '#F7F7F5',
    backgroundElement: '#ECECE8',
    backgroundSelected: '#E0E0DA',
    textSecondary: '#5C5C56',
    accent: '#1F7A4D',
    danger: '#A33B2B',
    detected: '#2F5D8C',
    userEntered: '#8A5A2B',
    estimated: '#5C5C56',
  },
  dark: {
    text: '#F7F7F5',
    background: '#111111',
    backgroundElement: '#1C1C1C',
    backgroundSelected: '#2A2A2A',
    textSecondary: '#A8A8A2',
    accent: '#3DDB8A',
    danger: '#E07A6C',
    detected: '#8CB4E0',
    userEntered: '#E0B27A',
    estimated: '#A8A8A2',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ColorScheme = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
