import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDB } from '../../db/DataLoader';
import { WishlistRepo } from '../../db/repositories';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Input, CurrencyInput, Button } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { generateId } from '../../utils/id';
import { nowISO } from '../../utils/date';
import type { WishlistItem } from '../../types';

const PRIORITIES = ['low', 'medium', 'high'] as const;
const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#94a3b8' };

export default function AddWishlistItemScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const db = useDB();
  const upsertWishlistItem = useAppStore((s) => s.upsertWishlistItem);
  const wishlist = useAppStore((s) => s.wishlist);
  const { theme } = useTheme();
  const { colors } = theme;

  const editingId = route.params?.itemId as string | undefined;
  const existing = wishlist.find((w) => w.id === editingId);

  const [name, setName] = useState(existing?.name ?? '');
  const [cost, setCost] = useState(existing ? String(existing.estimatedCost) : '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(existing?.priority ?? 'medium');
  const [targetDate, setTargetDate] = useState(existing?.targetDate ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!cost || parseFloat(cost) <= 0) { setError('Enter estimated cost'); return; }
    setLoading(true);
    try {
      const item: WishlistItem = {
        id:            existing?.id ?? generateId(),
        name:          name.trim(),
        estimatedCost: parseFloat(cost),
        currency:      'NGN',
        priority,
        status:        existing?.status ?? 'pending',
        targetDate:    targetDate || undefined,
        note:          note || undefined,
        createdAt:     existing?.createdAt ?? nowISO(),
        updatedAt:     nowISO(),
      };
      await WishlistRepo.upsert(db, item);
      upsertWishlistItem(item);
      navigation.goBack();
    } catch { setError('Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <ScreenLayout title={editingId ? 'Edit Item' : 'Add to Wish List'} showBack>
      <View style={{ gap: spacing[5] }}>
        <Input label="What do you want?" value={name} onChangeText={setName} placeholder="e.g. New laptop, iPhone 15" error={error} />
        <CurrencyInput label="Estimated Cost" value={cost} onChangeText={setCost} placeholder="0.00" />

        {/* Priority */}
        <View>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>Priority</Text>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity key={p} onPress={() => setPriority(p)}
                style={{ flex: 1, paddingVertical: spacing[3], borderRadius: radius.lg, backgroundColor: priority === p ? PRIORITY_COLORS[p] : colors.surfaceSecondary, alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '600', fontSize: fontSize.sm, color: priority === p ? '#fff' : colors.textSecondary, textTransform: 'capitalize' }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Input label="Target Date (optional)" value={targetDate} onChangeText={setTargetDate} placeholder="YYYY-MM-DD" />
        <Input label="Notes (optional)" value={note} onChangeText={setNote} placeholder="Why do you want this?" multiline numberOfLines={2} />

        <Button label={editingId ? 'Save Changes' : 'Add to List'} onPress={handleSave} loading={loading} fullWidth size="lg" />
      </View>
    </ScreenLayout>
  );
}
