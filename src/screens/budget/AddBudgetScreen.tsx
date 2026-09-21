import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDB } from '../../db/DataLoader';
import { BudgetRepo } from '../../db/repositories';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, CurrencyInput, Button } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { getCategoriesByType } from '../../utils/categories';
import { palette } from '../../theme/colors';
import { generateId } from '../../utils/id';
import { nowISO } from '../../utils/date';
import type { Budget, BudgetPeriod } from '../../types';

const PERIODS: { id: BudgetPeriod; label: string }[] = [
  { id: 'weekly',  label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly',  label: 'Yearly' },
];

export default function AddBudgetScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const db = useDB();
  const upsertBudget = useAppStore((s) => s.upsertBudget);
  const budgets = useAppStore((s) => s.budgets);
  const { theme } = useTheme();
  const { colors } = theme;

  const editingId = route.params?.budgetId as string | undefined;
  const existing = budgets.find((b) => b.id === editingId);

  const expenseCategories = getCategoriesByType('expense');
  const [category, setCategory] = useState(existing?.category ?? expenseCategories[0]?.id ?? '');
  const [limit, setLimit] = useState(existing ? String(existing.limit) : '');
  const [period, setPeriod] = useState<BudgetPeriod>(existing?.period ?? 'monthly');
  const [alertAt, setAlertAt] = useState(existing?.alertAt ?? 80);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedCat = expenseCategories.find((c) => c.id === category);

  const handleSave = async () => {
    if (!limit || parseFloat(limit) <= 0) { setError('Enter a valid budget limit'); return; }
    setLoading(true);
    try {
      const budget: Budget = {
        id:        existing?.id ?? generateId(),
        category,
        limit:     parseFloat(limit),
        period,
        spent:     0,
        currency:  'NGN',
        alertAt,
        color:     selectedCat?.color ?? palette.accent[0],
        createdAt: existing?.createdAt ?? nowISO(),
      };
      await BudgetRepo.upsert(db, budget);
      upsertBudget(budget);
      navigation.goBack();
    } catch { setError('Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <ScreenLayout title={editingId ? 'Edit Budget' : 'New Budget'} showBack>
      <View style={{ gap: spacing[5] }}>
        {/* Category */}
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {expenseCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, backgroundColor: category === cat.id ? colors.primary : colors.surfaceSecondary }}
              >
                <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                <Text style={{ color: category === cat.id ? '#fff' : colors.textSecondary, fontSize: fontSize.xs, fontWeight: '500' }}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <CurrencyInput label="Spending Limit" value={limit} onChangeText={setLimit} placeholder="0.00" error={error} />

        {/* Period */}
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>Period</Text>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            {PERIODS.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => setPeriod(p.id)}
                style={{ flex: 1, paddingVertical: spacing[3], borderRadius: radius.lg, backgroundColor: period === p.id ? colors.primary : colors.surfaceSecondary, alignItems: 'center' }}
              >
                <Text style={{ color: period === p.id ? '#fff' : colors.textSecondary, fontWeight: '600', fontSize: fontSize.sm }}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Alert threshold */}
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>
            Alert me at {alertAt}% of budget
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            {[50, 70, 80, 90].map((pct) => (
              <TouchableOpacity key={pct} onPress={() => setAlertAt(pct)}
                style={{ flex: 1, paddingVertical: spacing[2], borderRadius: radius.lg, backgroundColor: alertAt === pct ? colors.primary : colors.surfaceSecondary, alignItems: 'center' }}
              >
                <Text style={{ color: alertAt === pct ? '#fff' : colors.textSecondary, fontWeight: '600', fontSize: fontSize.sm }}>{pct}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button label={editingId ? 'Save Changes' : 'Create Budget'} onPress={handleSave} loading={loading} fullWidth size="lg" />
      </View>
    </ScreenLayout>
  );
}
