import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme';

interface ProgressBarProps {
  progress: number;   // 0–1
  height?: number;
  color?: string;
  trackColor?: string;
  animate?: boolean;
}

export function ProgressBar({
  progress,
  height = 6,
  color,
  trackColor,
}: ProgressBarProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const barColor = color ?? (
    clampedProgress > 0.9 ? colors.danger :
    clampedProgress > 0.7 ? colors.warning :
    colors.primary
  );

  return (
    <View
      style={{
        height,
        borderRadius: radius.full,
        backgroundColor: trackColor ?? colors.surfaceTertiary,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clampedProgress * 100}%`,
          height: '100%',
          borderRadius: radius.full,
          backgroundColor: barColor,
        }}
      />
    </View>
  );
}
