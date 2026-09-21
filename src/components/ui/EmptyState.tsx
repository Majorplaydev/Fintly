import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize } from '../../theme';
import { Button } from './Button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji = '📭', title, description, actionLabel, onAction }: EmptyStateProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={{ alignItems: 'center', padding: spacing[8], gap: spacing[3] }}>
      <Text style={{ fontSize: 48, lineHeight: 56 }}>{emoji}</Text>
      <Text style={{ fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' }}>
        {title}
      </Text>
      {description ? (
        <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={{ marginTop: spacing[2] }} />
      ) : null}
    </View>
  );
}
