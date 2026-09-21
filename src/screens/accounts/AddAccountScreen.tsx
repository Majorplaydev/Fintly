import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDB } from '../../db/DataLoader';
import { AccountRepo } from '../../db/repositories';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Input, CurrencyInput, Button, Card } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { palette } from '../../theme/colors';
import { generateId } from '../../utils/id';
import { nowISO } from '../../utils/date';
import { ACCOUNT_TYPES } from '../../utils/categories';
import type { Account } from '../../types';

const ACCOUNT_COLORS = palette.accent;
const ACCOUNT_ICONS = ['🏦', '💳', '👛', '💵', '📱', '🐷', '🏧', '💎', '🌿', '⚡', '🎯', '🔮'];

export default function AddAccountScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const db = useDB();
  const upsertAccount = useAppStore((s) => s.upsertAccount);
  const existingAccounts = useAppStore((s) => s.accounts);
  const { theme } = useTheme();
  const { colors } = theme;

  const editingId = route.params?.accountId as string | undefined;
  const existing = existingAccounts.find((a) => a.id === editingId);

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState(existing?.type ?? 'bank');
  const [balance, setBalance] = useState(existing ? String(existing.balance) : '0');
  const [icon, setIcon] = useState(existing?.icon ?? '🏦');
  const [color, setColor] = useState(existing?.color ?? ACCOUNT_COLORS[0]);
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? existingAccounts.length === 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Account name is required'); return; }
    const parsedBalance = parseFloat(balance.replace(/,/g, '')) || 0;
    setLoading(true);
    try {
      const account: Account = {
        id:        existing?.id ?? generateId(),
        name:      name.trim(),
        type:      type as Account['type'],
        balance:   parsedBalance,
        currency:  'NGN',
        color,
        icon,
        isDefault,
        createdAt: existing?.createdAt ?? nowISO(),
        updatedAt: nowISO(),
      };
      await AccountRepo.upsert(db, account);
      upsertAccount(account);
      navigation.goBack();
    } catch (e) {
      setError('Failed to save account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title={editingId ? 'Edit Account' : 'New Account'} showBack>
      <View style={{ gap: spacing[5] }}>
        {/* Type selector */}
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>Account Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2] }}>
            {ACCOUNT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setType(t.id as Account['type'])}
                style={{
                  paddingHorizontal: spacing[3], paddingVertical: spacing[2],
                  borderRadius: radius.full,
                  backgroundColor: type === t.id ? colors.primary : colors.surfaceSecondary,
                  flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
                }}
              >
                <Text>{t.icon}</Text>
                <Text style={{ color: type === t.id ? '#fff' : colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500' }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Input label="Account Name" value={name} onChangeText={setName} placeholder="e.g. GTBank Savings" error={error} />
        <CurrencyInput label="Current Balance" value={balance} onChangeText={setBalance} placeholder="0.00" />

        {/* Icon picker */}
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>Icon</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {ACCOUNT_ICONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                onPress={() => setIcon(ic)}
                style={{
                  width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: icon === ic ? colors.primaryLight : colors.surfaceSecondary,
                  borderWidth: icon === ic ? 2 : 0, borderColor: colors.primary,
                }}
              >
                <Text style={{ fontSize: 22 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color picker */}
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>Color</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {ACCOUNT_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={{
                  width: 32, height: 32, borderRadius: 16, backgroundColor: c,
                  borderWidth: color === c ? 3 : 0, borderColor: colors.textPrimary,
                }}
              />
            ))}
          </View>
        </View>

        {/* Default toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '500' }}>Set as Default</Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Used for quick-add transactions</Text>
          </View>
          <Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ true: colors.primary }} />
        </View>

        <Button label={editingId ? 'Save Changes' : 'Create Account'} onPress={handleSave} loading={loading} fullWidth size="lg" />
      </View>
    </ScreenLayout>
  );
}
