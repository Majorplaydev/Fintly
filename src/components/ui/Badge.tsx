import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, spacing, fontSize } from '../../theme';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, textColor, size = 'md' }: BadgeProps) {
  const { theme } = useTheme();
  const bg = color ?? theme.colors.primaryLight;
  const fg = textColor ?? theme.colors.primary;

  return (
    <View
      style={{
        borderRadius: radius.full,
        paddingHorizontal: size === 'sm' ? spacing[1.5] : spacing[2.5],
        paddingVertical: size === 'sm' ? 2 : 4,
        backgroundColor: bg,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontSize: size === 'sm' ? fontSize.xs : fontSize.sm,
          color: fg,
          fontWeight: '600',
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
