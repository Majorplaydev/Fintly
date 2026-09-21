import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDB } from '../../db/DataLoader';
import { DebtRepo } from '../../db/repositories';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Input, CurrencyInput, Button } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { generateId } from '../../utils/id';
import { nowISO } from '../../utils/date';
import type { Debt, DebtDirection } from '../../types';

export default function AddDebtScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const db = useDB();
  const upsertDebt = useAppStore((s) => s.upsertDebt);
  const debts = useAppStore((s) => s.debts);
  const { theme } = useTheme();
  const { colors } = theme;

  const editingId = route.params?.debtId as string | undefined;
  const existing = debts.find((d) => d.id === editingId);

  const [direction, setDirection] = useState<DebtDirection>(existing?.direction ?? 'owe');
  const [personName, setPersonName] = useState(existing?.personName ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? '');
  const [reminderEnabled, setReminderEnabled] = useState(existing?.reminderEnabled ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!personName.trim()) { setError('Person name required'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return; }
    setLoading(true);
    try {
      const debt: Debt = {
        id:              existing?.id ?? generateId(),
        direction,
        personName:      personName.trim(),
        amount:          parseFloat(amount),
        amountPaid:      existing?.amountPaid ?? 0,
        currency:        'NGN',
        description:     description.trim(),
        dueDate:         dueDate || undefined,
        reminderEnabled,
        reminderDays:    3,
        isSettled:       existing?.isSettled ?? false,
        payments:        existing?.payments ?? [],
        createdAt:       existing?.createdAt ?? nowISO(),
        updatedAt:       nowISO(),
      };
      await DebtRepo.upsert(db, debt);
      upsertDebt(debt);
      navigation.goBack();
    } catch { setError('Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <ScreenLayout title={editingId ? 'Edit Debt' : 'New Debt'} showBack>
      <View style={{ gap: spacing[5] }}>
        {/* Direction toggle */}
        <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceSecondary, borderRadius: radius.xl, padding: 4 }}>
          {([['owe', '🔴 I Owe'], ['owed_to_me', '🟢 They Owe Me']] as [DebtDirection, string][]).map(([key, label]) => (
            <TouchableOpacity key={key} onPress={() => setDirection(key)} style={{ flex: 1, paddingVertical: spacing[3], borderRadius: radius.lg, backgroundColor: direction === key ? colors.surface : 'transparent', alignItems: 'center' }}>
              <Text style={{ fontWeight: '600', fontSize: fontSize.sm, color: direction === key ? colors.textPrimary : colors.textSecondary }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label={direction === 'owe' ? "Who do you owe?" : "Who owes you?"} value={personName} onChangeText={setPersonName} placeholder="Person or company name" error={error} />
        <CurrencyInput label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" />
        <Input label="Description (optional)" value={description} onChangeText={setDescription} placeholder="What's it for?" multiline numberOfLines={2} />
        <Input label="Due Date (optional)" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '500' }}>Payment Reminder</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Get notified 3 days before due date</Text>
          </View>
          <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ true: colors.primary }} />
        </View>

        <Button label={editingId ? 'Save Changes' : 'Add Debt'} onPress={handleSave} loading={loading} fullWidth size="lg" />
      </View>
    </ScreenLayout>
  );
}
