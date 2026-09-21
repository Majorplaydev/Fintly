import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDB } from '../../db/DataLoader';
import { InvestmentRepo } from '../../db/repositories';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Card, CurrencyInput, Button, Input } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { formatDate, nowISO } from '../../utils/date';
import { generateId } from '../../utils/id';
import type { InvestmentUpdate } from '../../types';

export default function InvestmentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const db = useDB();
  const { investments, upsertInvestment } = useAppStore();
  const { theme } = useTheme();
  const { colors } = theme;

  const investmentId = route.params?.investmentId as string;
  const investment = investments.find((i) => i.id === investmentId);

  const [newValue, setNewValue] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!investment) return <ScreenLayout title="Investment" showBack scrollable />;

  const gain = investment.currentValue - investment.initialAmount;
  const gainPct = investment.initialAmount > 0 ? (gain / investment.initialAmount) * 100 : 0;

  const handleUpdate = async () => {
    const val = parseFloat(newValue);
    if (!val || val < 0) { Alert.alert('Error', 'Enter a valid value'); return; }
    setLoading(true);
    try {
      const update: InvestmentUpdate = { id: generateId(), investmentId: investment.id, value: val, date: nowISO(), note: note || undefined };
      await InvestmentRepo.addUpdate(db, update);
      const updated = { ...investment, currentValue: val, updates: [...investment.updates, update], updatedAt: nowISO() };
      upsertInvestment(updated);
      setNewValue(''); setNote('');
    } catch { Alert.alert('Error', 'Failed to update'); }
    finally { setLoading(false); }
  };

  return (
    <ScreenLayout title={investment.name} showBack rightAction={
      <TouchableOpacity onPress={() => navigation.navigate('AddInvestment', { investmentId: investment.id })}>
        <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' }}>Edit</Text>
      </TouchableOpacity>
    }>
      {/* Summary */}
      <Card style={{ marginBottom: spacing[5], backgroundColor: investment.color }}>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm }}>{investment.platform}</Text>
        <Text style={{ color: '#fff', fontSize: fontSize['2xl'], fontWeight: '700', letterSpacing: -0.5, marginVertical: spacing[1] }}>
          {formatCurrency(investment.currentValue)}
        </Text>
        <Text style={{ color: gain >= 0 ? 'rgba(255,255,255,0.9)' : '#fda4af', fontSize: fontSize.sm }}>
          {gain >= 0 ? '▲' : '▼'} {Math.abs(gainPct).toFixed(1)}% ({gain >= 0 ? '+' : ''}{formatCurrency(gain)})
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: fontSize.xs, marginTop: spacing[1] }}>
          Invested: {formatCurrency(investment.initialAmount)}
        </Text>
      </Card>

      {/* Update value */}
      <Card variant="outlined" style={{ marginBottom: spacing[5] }}>
        <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing[3] }}>Update Current Value</Text>
        <View style={{ gap: spacing[3] }}>
          <CurrencyInput label="New Value" value={newValue} onChangeText={setNewValue} placeholder={`Current: ${formatCurrency(investment.currentValue)}`} />
          <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. quarterly review" />
          <Button label="Record Update" onPress={handleUpdate} loading={loading} fullWidth />
        </View>
      </Card>

      {/* Update history */}
      {investment.updates.length > 0 && (
        <View>
          <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing[3] }}>Value History</Text>
          <View style={{ gap: spacing[2] }}>
            {[...investment.updates].reverse().map((u) => (
              <View key={u.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                <View>
                  <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>{formatCurrency(u.value)}</Text>
                  {u.note && <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{u.note}</Text>}
                </View>
                <Text style={{ fontSize: fontSize.sm, color: colors.textTertiary }}>{formatDate(u.date)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScreenLayout>
  );
}
