import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Card, EmptyState } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';

export default function IncomeSourcesScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { colors } = theme;
  const incomeSources = useAppStore((s) => s.incomeSources);

  return (
    <ScreenLayout
      title="Income Sources"
      showBack
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.navigate('AddIncomeSource', {})}
          style={{ backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[2] }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: fontSize.sm }}>+ Add</Text>
        </TouchableOpacity>
      }
    >
      {incomeSources.length === 0 ? (
        <EmptyState
          emoji="💰"
          title="No income sources"
          description="Define where your money comes from and how to split it."
          actionLabel="Add Source"
          onAction={() => navigation.navigate('AddIncomeSource', {})}
        />
      ) : (
        <View style={{ gap: spacing[3] }}>
          {incomeSources.map((source) => (
            <TouchableOpacity
              key={source.id}
              onPress={() => navigation.navigate('AddIncomeSource', { sourceId: source.id })}
              activeOpacity={0.7}
            >
              <Card variant="outlined">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: source.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22 }}>{source.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>{source.name}</Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                      {source.allocations.length} allocation{source.allocations.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  {/* Mini allocation preview */}
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {source.allocations.slice(0, 4).map((sl) => (
                      <View key={sl.id} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sl.color }} />
                    ))}
                  </View>
                </View>
                {/* Allocation chips */}
                {source.allocations.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1.5], marginTop: spacing[3] }}>
                    {source.allocations.map((sl) => (
                      <View key={sl.id} style={{ backgroundColor: sl.color + '20', borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: spacing[0.5] }}>
                        <Text style={{ fontSize: fontSize.xs, color: sl.color, fontWeight: '600' }}>
                          {sl.label} {sl.percentage}%
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScreenLayout>
  );
}
