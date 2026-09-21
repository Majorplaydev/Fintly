import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Card, ProgressBar, EmptyState } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { getCategoryById } from '../../utils/categories';
import { getMonthRange } from '../../utils/date';

export default function BudgetsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { colors } = theme;
  const budgets = useAppStore((s) => s.budgets);
  const transactions = useAppStore((s) => s.transactions);

  const { start, end } = getMonthRange();

  // Compute spent per budget category this month
  const getSpent = (category: string) =>
    transactions
      .filter((t) => t.type === 'expense' && t.category === category && t.date >= start && t.date <= end)
      .reduce((s, t) => s + t.amount, 0);

  return (
    <ScreenLayout
      title="Budgets"
      showBack
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.navigate('AddBudget', {})}
          style={{ backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[2] }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: fontSize.sm }}>+ Add</Text>
        </TouchableOpacity>
      }
    >
      {budgets.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="No budgets yet"
          description="Set spending limits per category to stay on track."
          actionLabel="Create Budget"
          onAction={() => navigation.navigate('AddBudget', {})}
        />
      ) : (
        <View style={{ gap: spacing[3] }}>
          {budgets.map((budget) => {
            const spent = getSpent(budget.category);
            const progress = budget.limit > 0 ? spent / budget.limit : 0;
            const catDef = getCategoryById(budget.category);
            const isOverBudget = progress > 1;

            return (
              <TouchableOpacity
                key={budget.id}
                onPress={() => navigation.navigate('AddBudget', { budgetId: budget.id })}
                activeOpacity={0.7}
              >
                <Card variant="outlined">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] }}>
                    <Text style={{ fontSize: 22 }}>{catDef?.icon ?? '📦'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>{catDef?.label ?? budget.category}</Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, textTransform: 'capitalize' }}>{budget.period}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: isOverBudget ? colors.danger : colors.textPrimary }}>
                        {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                      </Text>
                      <Text style={{ fontSize: fontSize.xs, color: isOverBudget ? colors.danger : colors.textSecondary }}>
                        {isOverBudget ? 'Over budget!' : `${(progress * 100).toFixed(0)}% used`}
                      </Text>
                    </View>
                  </View>
                  <ProgressBar progress={progress} color={budget.color} />
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScreenLayout>
  );
}
