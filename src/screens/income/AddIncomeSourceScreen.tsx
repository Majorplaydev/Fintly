import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDB } from '../../db/DataLoader';
import { IncomeSourceRepo } from '../../db/repositories';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Input, Button, Card } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { palette } from '../../theme/colors';
import { generateId } from '../../utils/id';
import { nowISO } from '../../utils/date';
import type { IncomeSource, AllocationSlice } from '../../types';

const ICONS = ['💰', '🎯', '💼', '🎁', '🤝', '📦', '🌟', '🔧', '🎨', '✍️', '📱', '🛒'];
const COLORS = palette.accent;

export default function AddIncomeSourceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const db = useDB();
  const upsertIncomeSource = useAppStore((s) => s.upsertIncomeSource);
  const incomeSources = useAppStore((s) => s.incomeSources);
  const accounts = useAppStore((s) => s.accounts);
  const { theme } = useTheme();
  const { colors } = theme;

  const editingId = route.params?.sourceId as string | undefined;
  const existing = incomeSources.find((s) => s.id === editingId);

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? '💰');
  const [color, setColor] = useState(existing?.color ?? COLORS[0]);
  const [allocations, setAllocations] = useState<AllocationSlice[]>(
    existing?.allocations ?? []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPct = allocations.reduce((s, a) => s + a.percentage, 0);

  const addSlice = () => {
    const newSlice: AllocationSlice = {
      id:             generateId(),
      incomeSourceId: editingId ?? '',
      label:          '',
      percentage:     0,
      accountId:      accounts[0]?.id ?? null,
      color:          COLORS[allocations.length % COLORS.length],
    };
    setAllocations((prev) => [...prev, newSlice]);
  };

  const updateSlice = (id: string, updates: Partial<AllocationSlice>) => {
    setAllocations((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSlice = (id: string) => {
    setAllocations((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (allocations.length > 0 && Math.abs(totalPct - 100) > 0.5) {
      setError(`Percentages must add up to 100% (currently ${totalPct.toFixed(1)}%)`);
      return;
    }
    setLoading(true);
    try {
      const source: IncomeSource = {
        id:          existing?.id ?? generateId(),
        name:        name.trim(),
        icon,
        color,
        createdAt:   existing?.createdAt ?? nowISO(),
        allocations: allocations.map((a) => ({ ...a, incomeSourceId: existing?.id ?? generateId() })),
      };
      await IncomeSourceRepo.upsert(db, source);
      upsertIncomeSource(source);
      navigation.goBack();
    } catch (e) {
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title={editingId ? 'Edit Source' : 'New Income Source'} showBack>
      <View style={{ gap: spacing[5] }}>
        <Input label="Source Name" value={name} onChangeText={setName} placeholder="e.g. Gigs, Gifts, Salary" error={error} />

        {/* Icon row */}
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>Icon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2] }}>
            {ICONS.map((ic) => (
              <TouchableOpacity key={ic} onPress={() => setIcon(ic)}
                style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: icon === ic ? colors.primaryLight : colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center', borderWidth: icon === ic ? 2 : 0, borderColor: colors.primary }}
              >
                <Text style={{ fontSize: 22 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Allocation slices */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] }}>
            <View>
              <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>Allocation Rules</Text>
              <Text style={{ fontSize: fontSize.sm, color: allocations.length > 0 && Math.abs(totalPct - 100) > 0.5 ? colors.danger : colors.textSecondary }}>
                {allocations.length > 0 ? `${totalPct.toFixed(0)}% of 100%` : 'Optional — how to split this income'}
              </Text>
            </View>
            <TouchableOpacity onPress={addSlice}
              style={{ backgroundColor: colors.primaryLight, borderRadius: radius.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[1.5] }}
            >
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: fontSize.sm }}>+ Add Slice</Text>
            </TouchableOpacity>
          </View>

          {allocations.map((slice) => (
            <Card key={slice.id} variant="outlined" style={{ marginBottom: spacing[3] }}>
              <View style={{ gap: spacing[3] }}>
                <View style={{ flexDirection: 'row', gap: spacing[2], alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Label"
                      value={slice.label}
                      onChangeText={(v) => updateSlice(slice.id, { label: v })}
                      placeholder="e.g. Tithe, Savings"
                    />
                  </View>
                  <View style={{ width: 80 }}>
                    <Input
                      label="Percent %"
                      value={slice.percentage > 0 ? String(slice.percentage) : ''}
                      onChangeText={(v) => updateSlice(slice.id, { percentage: parseFloat(v) || 0 })}
                      keyboardType="decimal-pad"
                      placeholder="10"
                    />
                  </View>
                </View>

                {/* Account selector */}
                <View>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing[1.5] }}>Goes to Account</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2] }}>
                    <TouchableOpacity
                      onPress={() => updateSlice(slice.id, { accountId: null })}
                      style={{ paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], borderRadius: radius.full, backgroundColor: !slice.accountId ? colors.primary : colors.surfaceSecondary }}
                    >
                      <Text style={{ color: !slice.accountId ? '#fff' : colors.textSecondary, fontSize: fontSize.xs, fontWeight: '500' }}>None</Text>
                    </TouchableOpacity>
                    {accounts.map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => updateSlice(slice.id, { accountId: acc.id })}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], borderRadius: radius.full, backgroundColor: slice.accountId === acc.id ? colors.primary : colors.surfaceSecondary }}
                      >
                        <Text style={{ fontSize: 14 }}>{acc.icon}</Text>
                        <Text style={{ color: slice.accountId === acc.id ? '#fff' : colors.textSecondary, fontSize: fontSize.xs, fontWeight: '500' }}>{acc.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <TouchableOpacity onPress={() => removeSlice(slice.id)}>
                  <Text style={{ color: colors.danger, fontSize: fontSize.sm, fontWeight: '500' }}>Remove slice</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        <Button label={editingId ? 'Save Changes' : 'Create Source'} onPress={handleSave} loading={loading} fullWidth size="lg" />
      </View>
    </ScreenLayout>
  );
}
