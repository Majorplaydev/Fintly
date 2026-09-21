import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing } from '../../theme';

interface CardProps extends ViewProps {
  padding?: number;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'flat';
  children: React.ReactNode;
}

export function Card({ padding = spacing[4], style, variant = 'default', children, ...props }: CardProps) {
  const { theme } = useTheme();
  const { colors, shadow } = theme;

  const variantStyle: ViewStyle =
    variant === 'outlined'
      ? {
          backgroundColor: colors.cardBackground,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        }
      : variant === 'flat'
      ? {
          backgroundColor: colors.surfaceSecondary,
        }
      : {
          backgroundColor: colors.cardBackground,
          ...shadow.sm,
          shadowColor: colors.shadowColor,
        };

  return (
    <View
      style={[
        {
          borderRadius: radius.xl,
          padding,
          overflow: 'hidden',
        },
        variantStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
