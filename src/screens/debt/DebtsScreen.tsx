import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Card, ProgressBar, EmptyState, Badge } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { formatDate, daysUntil, isOverdue } from '../../utils/date';
import type { DebtDirection } from '../../types';

export default function DebtsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { colors } = theme;
  const debts = useAppStore((s) => s.debts);
  const [tab, setTab] = useState<DebtDirection>('owe');

  const filtered = debts.filter((d) => d.direction === tab && !d.isSettled);
  const settled = debts.filter((d) => d.direction === tab && d.isSettled);

  const totalOwed = filtered.reduce((s, d) => s + (d.amount - d.amountPaid), 0);

  return (
    <ScreenLayout
      title="Debts"
      showBack
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.navigate('AddDebt', {})}
          style={{ backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[2] }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: fontSize.sm }}>+ Add</Text>
        </TouchableOpacity>
      }
    >
      {/* Tab */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceSecondary, borderRadius: radius.xl, padding: 4, marginBottom: spacing[5] }}>
        {([['owe', '🔴 I Owe'], ['owed_to_me', '🟢 Owed to Me']] as [DebtDirection, string][]).map(([key, label]) => (
          <TouchableOpacity key={key} onPress={() => setTab(key)} style={{ flex: 1, paddingVertical: spacing[2], borderRadius: radius.lg, backgroundColor: tab === key ? colors.surface : 'transparent', alignItems: 'center' }}>
            <Text style={{ fontWeight: '600', fontSize: fontSize.sm, color: tab === key ? colors.textPrimary : colors.textSecondary }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      {filtered.length > 0 && (
        <View style={{ backgroundColor: tab === 'owe' ? colors.danger + '15' : colors.income + '15', borderRadius: radius.xl, padding: spacing[4], marginBottom: spacing[4] }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
            {tab === 'owe' ? 'Total you owe' : 'Total owed to you'}
          </Text>
          <Text style={{ fontSize: fontSize['2xl'], fontWeight: '700', color: tab === 'owe' ? colors.danger : colors.income, letterSpacing: -0.5 }}>
            {formatCurrency(totalOwed)}
          </Text>
        </View>
      )}

      {filtered.length === 0 && settled.length === 0 ? (
        <EmptyState emoji={tab === 'owe' ? '🟢' : '🤝'} title={tab === 'owe' ? "You're debt free!" : "No one owes you"} description="Add a debt to track repayments and set reminders." actionLabel="Add Debt" onAction={() => navigation.navigate('AddDebt', {})} />
      ) : (
        <View style={{ gap: spacing[3] }}>
          {filtered.map((debt) => {
            const remaining = debt.amount - debt.amountPaid;
            const progress = debt.amountPaid / debt.amount;
            const overdue = isOverdue(debt.dueDate);
            const days = debt.dueDate ? daysUntil(debt.dueDate) : null;

            return (
              <TouchableOpacity key={debt.id} onPress={() => navigation.navigate('DebtDetail', { debtId: debt.id })} activeOpacity={0.7}>
                <Card variant="outlined">
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[3] }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: (tab === 'owe' ? colors.danger : colors.income) + '20', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 18 }}>{tab === 'owe' ? '😰' : '🤝'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>{debt.personName}</Text>
                      {debt.description ? <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }} numberOfLines={1}>{debt.description}</Text> : null}
                      {debt.dueDate && (
                        <Text style={{ fontSize: fontSize.xs, color: overdue ? colors.danger : colors.textTertiary, marginTop: 2 }}>
                          {overdue ? '⚠ Overdue' : `Due in ${days} days`}
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: tab === 'owe' ? colors.danger : colors.income }}>
                        {formatCurrency(remaining)}
                      </Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>of {formatCurrency(debt.amount)}</Text>
                    </View>
                  </View>
                  <ProgressBar progress={progress} color={tab === 'owe' ? colors.danger : colors.income} />
                  <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing[1] }}>
                    {(progress * 100).toFixed(0)}% paid
                  </Text>
                </Card>
              </TouchableOpacity>
            );
          })}

          {settled.length > 0 && (
            <Text style={{ fontSize: fontSize.sm, color: colors.textTertiary, fontWeight: '500', marginTop: spacing[2] }}>
              ✓ {settled.length} settled
            </Text>
          )}
        </View>
      )}
    </ScreenLayout>
  );
}
