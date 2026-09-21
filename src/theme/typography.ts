// Fintly Typography System
// Uses Inter (clean, modern, highly legible)

export const fontFamily = {
  regular:    'Inter_400Regular',
  medium:     'Inter_500Medium',
  semiBold:   'Inter_600SemiBold',
  bold:       'Inter_700Bold',
  extraBold:  'Inter_800ExtraBold',
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const lineHeight = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.75,
} as const;

export const letterSpacing = {
  tight:  -0.5,
  normal: 0,
  wide:   0.5,
  wider:  1,
} as const;

// Pre-built text style presets
export const textStyles = {
  // Display
  heroNumber: {
    fontSize: fontSize['4xl'],
    fontFamily: fontFamily.bold,
    letterSpacing: letterSpacing.tight,
  },
  display: {
    fontSize: fontSize['3xl'],
    fontFamily: fontFamily.bold,
    letterSpacing: letterSpacing.tight,
  },
  // Headings
  h1: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.bold,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.semiBold,
  },
  h3: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semiBold,
  },
  h4: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semiBold,
  },
  // Body
  bodyLarge: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    lineHeight: fontSize.md * 1.5,
  },
  body: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.regular,
    lineHeight: fontSize.base * 1.5,
  },
  bodyMedium: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.medium,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    lineHeight: fontSize.sm * 1.5,
  },
  // Labels & captions
  label: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    letterSpacing: letterSpacing.wide,
  },
  labelSmall: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
  },
  // Currency amounts
  amountLarge: {
    fontSize: fontSize['3xl'],
    fontFamily: fontFamily.bold,
    letterSpacing: letterSpacing.tight,
  },
  amountMedium: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.semiBold,
    letterSpacing: letterSpacing.tight,
  },
  amount: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semiBold,
  },
  // Buttons
  buttonLarge: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semiBold,
    letterSpacing: letterSpacing.wide,
  },
  button: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.semiBold,
    letterSpacing: letterSpacing.wide,
  },
  buttonSmall: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
  },
} as const;
