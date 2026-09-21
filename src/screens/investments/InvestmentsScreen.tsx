import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Card, EmptyState, Badge } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { formatCurrency } from '../../utils/currency';

export default function InvestmentsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { colors } = theme;
  const investments = useAppStore((s) => s.investments);

  const totalValue = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalInvested = investments.reduce((s, i) => s + i.initialAmount, 0);
  const totalGain = totalValue - totalInvested;
  const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return (
    <ScreenLayout
      title="Investments"
      showBack
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.navigate('AddInvestment', {})}
          style={{ backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[2] }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: fontSize.sm }}>+ Add</Text>
        </TouchableOpacity>
      }
    >
      {investments.length > 0 && (
        <Card style={{ marginBottom: spacing[5], backgroundColor: colors.primary }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm }}>Portfolio Value</Text>
          <Text style={{ color: '#fff', fontSize: fontSize['2xl'], fontWeight: '700', letterSpacing: -0.5, marginVertical: spacing[1] }}>
            {formatCurrency(totalValue)}
          </Text>
          <Text style={{ color: gainPct >= 0 ? '#a7f3d0' : '#fda4af', fontSize: fontSize.sm }}>
            {gainPct >= 0 ? '▲' : '▼'} {Math.abs(gainPct).toFixed(1)}% ({gainPct >= 0 ? '+' : ''}{formatCurrency(totalGain)})
          </Text>
        </Card>
      )}

      {investments.length === 0 ? (
        <EmptyState emoji="📈" title="No investments tracked" description="Log your investments and manually update their values over time." actionLabel="Add Investment" onAction={() => navigation.navigate('AddInvestment', {})} />
      ) : (
        <View style={{ gap: spacing[3] }}>
          {investments.map((inv) => {
            const gain = inv.currentValue - inv.initialAmount;
            const gainPct = inv.initialAmount > 0 ? (gain / inv.initialAmount) * 100 : 0;
            return (
              <TouchableOpacity key={inv.id} onPress={() => navigation.navigate('InvestmentDetail', { investmentId: inv.id })} activeOpacity={0.7}>
                <Card variant="outlined">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: inv.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 22 }}>{inv.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>{inv.name}</Text>
                      <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{inv.platform}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary }}>{formatCurrency(inv.currentValue)}</Text>
                      <Text style={{ fontSize: fontSize.xs, color: gain >= 0 ? colors.success : colors.danger }}>
                        {gain >= 0 ? '▲' : '▼'} {Math.abs(gainPct).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScreenLayout>
  );
}
