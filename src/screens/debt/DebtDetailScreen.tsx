import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDB } from '../../db/DataLoader';
import { DebtRepo } from '../../db/repositories';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Card, ProgressBar, CurrencyInput, Button } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { formatDate, nowISO } from '../../utils/date';
import { generateId } from '../../utils/id';
import type { DebtPayment } from '../../types';

export default function DebtDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const db = useDB();
  const { upsertDebt, debts } = useAppStore();
  const { theme } = useTheme();
  const { colors } = theme;

  const debtId = route.params?.debtId as string;
  const debt = debts.find((d) => d.id === debtId);

  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!debt) return <ScreenLayout title="Debt" showBack scrollable />;

  const remaining = debt.amount - debt.amountPaid;
  const progress = debt.amountPaid / debt.amount;

  const handlePayment = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    setLoading(true);
    try {
      const payment: DebtPayment = {
        id:     generateId(),
        debtId: debt.id,
        amount: Math.min(amt, remaining),
        date:   nowISO(),
        note:   payNote || undefined,
      };
      await DebtRepo.addPayment(db, payment);
      // Reload from DB
      const updated = { ...debt, amountPaid: debt.amountPaid + payment.amount, payments: [...debt.payments, payment], isSettled: debt.amountPaid + payment.amount >= debt.amount, updatedAt: nowISO() };
      upsertDebt(updated);
      setPayAmount('');
      setPayNote('');
    } catch { Alert.alert('Error', 'Failed to record payment'); }
    finally { setLoading(false); }
  };

  return (
    <ScreenLayout
      title={debt.personName}
      showBack
      rightAction={
        <TouchableOpacity onPress={() => navigation.navigate('AddDebt', { debtId: debt.id })}>
          <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' }}>Edit</Text>
        </TouchableOpacity>
      }
    >
      {/* Summary card */}
      <Card style={{ marginBottom: spacing[5], backgroundColor: debt.direction === 'owe' ? colors.danger : colors.income }}>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm }}>
          {debt.direction === 'owe' ? 'Amount you owe' : 'Amount owed to you'}
        </Text>
        <Text style={{ color: '#fff', fontSize: fontSize['3xl'], fontWeight: '700', letterSpacing: -1, marginVertical: spacing[1] }}>
          ₦{remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm }}>
          of ₦{debt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} total
        </Text>
        <View style={{ marginTop: spacing[3] }}>
          <ProgressBar progress={progress} color="rgba(255,255,255,0.4)" trackColor="rgba(255,255,255,0.2)" />
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fontSize.xs, marginTop: spacing[1] }}>
          {(progress * 100).toFixed(0)}% paid
        </Text>
      </Card>

      {/* Description */}
      {debt.description ? (
        <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing[5] }}>{debt.description}</Text>
      ) : null}

      {/* Pay/collect form */}
      {!debt.isSettled && (
        <Card variant="outlined" style={{ marginBottom: spacing[5] }}>
          <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing[3] }}>
            {debt.direction === 'owe' ? 'Record Payment' : 'Mark Amount Received'}
          </Text>
          <View style={{ gap: spacing[3] }}>
            <CurrencyInput
              label="Amount"
              value={payAmount}
              onChangeText={setPayAmount}
              placeholder={`Max: ₦${remaining.toLocaleString()}`}
            />
            <Button
              label={debt.direction === 'owe' ? 'Record Payment' : 'Mark Received'}
              onPress={handlePayment}
              loading={loading}
              fullWidth
            />
          </View>
        </Card>
      )}

      {/* Payment history */}
      {debt.payments.length > 0 && (
        <View>
          <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing[3] }}>
            Payment History
          </Text>
          <View style={{ gap: spacing[2] }}>
            {[...debt.payments].reverse().map((p) => (
              <View key={p.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                <View>
                  <Text style={{ fontSize: fontSize.base, color: colors.textPrimary }}>{formatCurrency(p.amount)}</Text>
                  {p.note && <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{p.note}</Text>}
                </View>
                <Text style={{ fontSize: fontSize.sm, color: colors.textTertiary }}>{formatDate(p.date)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {debt.isSettled && (
        <View style={{ alignItems: 'center', padding: spacing[6] }}>
          <Text style={{ fontSize: 40 }}>✅</Text>
          <Text style={{ fontSize: fontSize.lg, fontWeight: '600', color: colors.success, marginTop: spacing[2] }}>Fully Settled</Text>
        </View>
      )}
    </ScreenLayout>
  );
}
