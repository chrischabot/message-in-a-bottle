export const tokens = {
  colors: {
    // Brand
    primary: '#0088CC',
    primaryDark: '#006699',
    accent: '#FF6B00',

    // UI
    background: '#FFFFFF',
    surface: '#F5F5F5',
    border: '#E0E0E0',

    // Text
    text: '#000000',
    textSecondary: '#757575',
    textInverse: '#FFFFFF',

    // Message bubbles
    bubbleSent: '#DCF8C6',
    bubbleReceived: '#FFFFFF',

    // Status
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',

    // Dark mode
    dark: {
      background: '#0E1621',
      surface: '#1C2733',
      border: '#2E3A47',
      text: '#FFFFFF',
      textSecondary: '#8B96A5',
      bubbleSent: '#0B5F3E',
      bubbleReceived: '#1C2733',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },

  typography: {
    fontFamily: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      semiBold: 'Inter-SemiBold',
      bold: 'Inter-Bold',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 36,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  },
} as const;

export type Tokens = typeof tokens;
