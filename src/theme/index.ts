import { lightColors, darkColors, type ColorScheme, palette } from './colors';
import { fontFamily, fontSize, textStyles, letterSpacing, lineHeight } from './typography';
import { spacing, radius, shadow, layout } from './spacing';

export interface Theme {
  colors: Record<string, string>;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  textStyles: typeof textStyles;
  letterSpacing: typeof letterSpacing;
  lineHeight: typeof lineHeight;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
  layout: typeof layout;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: lightColors,
  fontFamily,
  fontSize,
  textStyles,
  letterSpacing,
  lineHeight,
  spacing,
  radius,
  shadow,
  layout,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  fontFamily,
  fontSize,
  textStyles,
  letterSpacing,
  lineHeight,
  spacing,
  radius,
  shadow,
  layout,
  isDark: true,
};

export { palette, lightColors, darkColors };
export type { ColorScheme };
export * from './colors';
export * from './typography';
export * from './spacing';
