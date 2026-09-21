import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { textStyles, type fontFamily } from '../../theme';

type Variant = keyof typeof textStyles;
type Color = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'onPrimary' |
             'income' | 'expense' | 'transfer' | 'giving' | 'danger' | 'success' | 'warning';

interface FintlyTextProps extends TextProps {
  variant?: Variant;
  color?: Color;
  align?: TextStyle['textAlign'];
  opacity?: number;
}

export function FText({
  variant = 'body',
  color = 'primary',
  align,
  opacity,
  style,
  children,
  ...props
}: FintlyTextProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const colorMap: Record<Color, string> = {
    primary:   colors.textPrimary,
    secondary: colors.textSecondary,
    tertiary:  colors.textTertiary,
    inverse:   colors.textInverse,
    onPrimary: colors.textOnPrimary,
    income:    colors.income,
    expense:   colors.expense,
    transfer:  colors.transfer,
    giving:    colors.giving,
    danger:    colors.danger,
    success:   colors.success,
    warning:   colors.warning,
  };

  const baseStyle = textStyles[variant] as TextStyle;

  return (
    <RNText
      style={[
        baseStyle,
        { color: colorMap[color] },
        align ? { textAlign: align } : undefined,
        opacity !== undefined ? { opacity } : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
