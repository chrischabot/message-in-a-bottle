import { tokens } from '../tokens';

export const lightTheme = {
  ...tokens,
  colors: {
    ...tokens.colors,
    // Light theme uses the default colors
  },
};

export const darkTheme = {
  ...tokens,
  colors: {
    background: tokens.colors.dark.background,
    surface: tokens.colors.dark.surface,
    border: tokens.colors.dark.border,
    text: tokens.colors.dark.text,
    textSecondary: tokens.colors.dark.textSecondary,
    bubbleSent: tokens.colors.dark.bubbleSent,
    bubbleReceived: tokens.colors.dark.bubbleReceived,
    // Keep brand colors the same
    primary: tokens.colors.primary,
    primaryDark: tokens.colors.primaryDark,
    accent: tokens.colors.accent,
    textInverse: tokens.colors.textInverse,
    // Status colors remain the same
    success: tokens.colors.success,
    error: tokens.colors.error,
    warning: tokens.colors.warning,
    info: tokens.colors.info,
  },
};

export type Theme = typeof lightTheme;
