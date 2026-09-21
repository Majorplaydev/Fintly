import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface DividerProps { marginV?: number }

export function Divider({ marginV = 0 }: DividerProps) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.colors.divider,
        marginVertical: marginV,
      }}
    />
  );
}
