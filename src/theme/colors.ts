// Fintly Design System — Color Tokens
// Philosophy: Clean, minimal, with purposeful accent colors.
// Not a generic fintech blue — we use a rich emerald-to-teal primary with
// warm neutrals and distinct semantic colors.

export const palette = {
  // Brand
  emerald50:  '#ecfdf5',
  emerald100: '#d1fae5',
  emerald200: '#a7f3d0',
  emerald300: '#6ee7b7',
  emerald400: '#34d399',
  emerald500: '#10b981',  // primary
  emerald600: '#059669',
  emerald700: '#047857',
  emerald800: '#065f46',
  emerald900: '#064e3b',

  // Teal accent
  teal400: '#2dd4bf',
  teal500: '#14b8a6',

  // Warm neutrals (not pure grey — slightly warm)
  neutral50:  '#fafaf9',
  neutral100: '#f5f5f4',
  neutral200: '#e7e5e4',
  neutral300: '#d6d3d1',
  neutral400: '#a8a29e',
  neutral500: '#78716c',
  neutral600: '#57534e',
  neutral700: '#44403c',
  neutral800: '#292524',
  neutral900: '#1c1917',
  neutral950: '#0c0a09',

  // Semantic
  income:  '#10b981',  // emerald
  expense: '#f43f5e',  // rose
  transfer:'#6366f1',  // indigo
  giving:  '#f59e0b',  // amber
  passthrough: '#94a3b8', // slate

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  danger:  '#ef4444',
  info:    '#3b82f6',

  // Category accent palette (for budgets, income sources etc.)
  accent: [
    '#10b981', // emerald
    '#6366f1', // indigo
    '#f59e0b', // amber
    '#ec4899', // pink
    '#3b82f6', // blue
    '#14b8a6', // teal
    '#f43f5e', // rose
    '#8b5cf6', // violet
    '#84cc16', // lime
    '#f97316', // orange
  ],

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const lightColors = {
  // Backgrounds
  background:       palette.neutral50,
  backgroundSecondary: palette.neutral100,
  surface:          palette.white,
  surfaceSecondary: palette.neutral100,
  surfaceTertiary:  palette.neutral200,

  // Text
  textPrimary:      palette.neutral900,
  textSecondary:    palette.neutral600,
  textTertiary:     palette.neutral400,
  textInverse:      palette.white,
  textOnPrimary:    palette.white,

  // Brand
  primary:          palette.emerald500,
  primaryLight:     palette.emerald100,
  primaryDark:      palette.emerald700,
  accent:           palette.teal500,

  // Semantic
  income:           palette.income,
  expense:          palette.expense,
  transfer:         palette.transfer,
  giving:           palette.giving,
  passthrough:      palette.passthrough,

  // Status
  success:          palette.success,
  warning:          palette.warning,
  danger:           palette.danger,
  info:             palette.info,

  // Borders & dividers
  border:           palette.neutral200,
  borderStrong:     palette.neutral300,
  divider:          palette.neutral100,

  // Shadows
  shadowColor:      palette.neutral900,

  // Tab bar
  tabBarBackground: palette.white,
  tabBarActive:     palette.emerald500,
  tabBarInactive:   palette.neutral400,

  // Cards
  cardBackground:   palette.white,
  cardBorder:       palette.neutral200,

  // Input
  inputBackground:  palette.neutral100,
  inputBorder:      palette.neutral200,
  inputFocusBorder: palette.emerald500,
  placeholder:      palette.neutral400,
} as const;

export const darkColors = {
  // Backgrounds
  background:       palette.neutral950,
  backgroundSecondary: palette.neutral900,
  surface:          palette.neutral900,
  surfaceSecondary: palette.neutral800,
  surfaceTertiary:  palette.neutral700,

  // Text
  textPrimary:      palette.neutral50,
  textSecondary:    palette.neutral400,
  textTertiary:     palette.neutral600,
  textInverse:      palette.neutral900,
  textOnPrimary:    palette.white,

  // Brand
  primary:          palette.emerald400,
  primaryLight:     palette.emerald900,
  primaryDark:      palette.emerald300,
  accent:           palette.teal400,

  // Semantic
  income:           palette.emerald400,
  expense:          '#fb7185',   // lighter rose for dark
  transfer:         '#818cf8',   // lighter indigo for dark
  giving:           '#fbbf24',   // lighter amber for dark
  passthrough:      '#94a3b8',

  // Status
  success:          '#4ade80',
  warning:          '#fbbf24',
  danger:           '#f87171',
  info:             '#60a5fa',

  // Borders & dividers
  border:           palette.neutral800,
  borderStrong:     palette.neutral700,
  divider:          palette.neutral800,

  // Shadows
  shadowColor:      palette.black,

  // Tab bar
  tabBarBackground: palette.neutral900,
  tabBarActive:     palette.emerald400,
  tabBarInactive:   palette.neutral600,

  // Cards
  cardBackground:   palette.neutral900,
  cardBorder:       palette.neutral800,

  // Input
  inputBackground:  palette.neutral800,
  inputBorder:      palette.neutral700,
  inputFocusBorder: palette.emerald400,
  placeholder:      palette.neutral600,
} as const;

export type ColorScheme = typeof lightColors;
