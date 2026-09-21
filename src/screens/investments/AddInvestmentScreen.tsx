import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDB } from '../../db/DataLoader';
import { InvestmentRepo } from '../../db/repositories';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Input, CurrencyInput, Button } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { palette } from '../../theme/colors';
import { generateId } from '../../utils/id';
import { nowISO } from '../../utils/date';
import type { Investment } from '../../types';

const ICONS = ['📈', '💹', '🏠', '🌾', '💰', '🔮', '⚡', '🌐', '🏆', '💎'];
const PLATFORMS = ['PiggyVest', 'Cowrywise', 'Bamboo', 'Chaka', 'GTB', 'Crypto', 'Real Estate', 'Stocks', 'Other'];

export default function AddInvestmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const db = useDB();
  const upsertInvestment = useAppStore((s) => s.upsertInvestment);
  const investments = useAppStore((s) => s.investments);
  const { theme } = useTheme();
  const { colors } = theme;

  const editingId = route.params?.investmentId as string | undefined;
  const existing = investments.find((i) => i.id === editingId);

  const [name, setName] = useState(existing?.name ?? '');
  const [platform, setPlatform] = useState(existing?.platform ?? '');
  const [initialAmount, setInitialAmount] = useState(existing ? String(existing.initialAmount) : '');
  const [currentValue, setCurrentValue] = useState(existing ? String(existing.currentValue) : '');
  const [icon, setIcon] = useState(existing?.icon ?? '📈');
  const [color, setColor] = useState(existing?.color ?? palette.accent[7]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Name required'); return; }
    if (!initialAmount || parseFloat(initialAmount) < 0) { setError('Enter initial amount'); return; }
    setLoading(true);
    try {
      const initial = parseFloat(initialAmount);
      const current = parseFloat(currentValue) || initial;
      const inv: Investment = {
        id:            existing?.id ?? generateId(),
        name:          name.trim(),
        platform:      platform.trim(),
        initialAmount: initial,
        currentValue:  current,
        currency:      'NGN',
        startDate:     existing?.startDate ?? nowISO(),
        status:        'active',
        icon,
        color,
        updates:       existing?.updates ?? [],
        createdAt:     existing?.createdAt ?? nowISO(),
        updatedAt:     nowISO(),
      };
      await InvestmentRepo.upsert(db, inv);
      upsertInvestment(inv);
      navigation.goBack();
    } catch { setError('Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <ScreenLayout title={editingId ? 'Edit Investment' : 'New Investment'} showBack>
      <View style={{ gap: spacing[5] }}>
        <Input label="Investment Name" value={name} onChangeText={setName} placeholder="e.g. PiggyVest Savings" error={error} />

        {/* Platform */}
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>Platform</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2] }}>
            {PLATFORMS.map((p) => (
              <TouchableOpacity key={p} onPress={() => setPlatform(p)}
                style={{ paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, backgroundColor: platform === p ? colors.primary : colors.surfaceSecondary }}
              >
                <Text style={{ color: platform === p ? '#fff' : colors.textSecondary, fontWeight: '500', fontSize: fontSize.sm }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Input value={platform} onChangeText={setPlatform} placeholder="Or type custom platform" containerStyle={{ marginTop: spacing[2] }} />
        </View>

        <CurrencyInput label="Initial Amount Invested" value={initialAmount} onChangeText={setInitialAmount} placeholder="0.00" />
        <CurrencyInput label="Current Value" value={currentValue} onChangeText={setCurrentValue} placeholder="Same as initial if unknown" />

        {/* Icon */}
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>Icon</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {ICONS.map((ic) => (
              <TouchableOpacity key={ic} onPress={() => setIcon(ic)}
                style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: icon === ic ? colors.primaryLight : colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center', borderWidth: icon === ic ? 2 : 0, borderColor: colors.primary }}
              >
                <Text style={{ fontSize: 22 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button label={editingId ? 'Save Changes' : 'Add Investment'} onPress={handleSave} loading={loading} fullWidth size="lg" />
      </View>
    </ScreenLayout>
  );
}
