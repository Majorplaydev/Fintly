import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, EmptyState, Card } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius, palette } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDate, getMonthRange, getWeekRange } from '../../utils/date';
import { getCategoryById } from '../../utils/categories';
import type { Transaction, TransactionType } from '../../types';

const TYPE_COLOR: Record<string, string> = {
  income: palette.income,
  expense: palette.expense,
  transfer: palette.transfer,
  giving: palette.giving,
  passthrough: palette.passthrough,
};
const TYPE_ICON: Record<string, string> = {
  income: '↓', expense: '↑', transfer: '⇄', giving: '♥', passthrough: '→',
};
const TYPE_LABELS: { id: string; label: string }[] = [
  { id: 'all',         label: 'All' },
  { id: 'expense',     label: 'Expenses' },
  { id: 'income',      label: 'Income' },
  { id: 'transfer',    label: 'Transfers' },
  { id: 'giving',      label: 'Giving' },
  { id: 'passthrough', label: 'Pass-thru' },
];
const PERIOD_LABELS = [
  { id: 'all',   label: 'All time' },
  { id: 'week',  label: 'This week' },
  { id: 'month', label: 'This month' },
];

function TxItem({ tx, onPress }: { tx: Transaction; onPress: () => void }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const cat = getCategoryById(tx.category);
  const color = TYPE_COLOR[tx.type] ?? colors.textSecondary;
  const isCredit = tx.type === 'income';
  const isDebit = tx.type === 'expense' || tx.type === 'giving';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[4],
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: color + '18',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18 }}>{cat?.icon ?? TYPE_ICON[tx.type] ?? '•'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}
          numberOfLines={1}
        >
          {tx.description || tx.type}
        </Text>
        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
          {cat?.label ?? tx.category} · {formatRelativeDate(tx.date)}
        </Text>
      </View>
      <Text
        style={{
          fontSize: fontSize.base,
          fontWeight: '700',
          color: isCredit ? colors.income : isDebit ? colors.expense : colors.textSecondary,
        }}
      >
        {isDebit ? '-' : isCredit ? '+' : ''}
        {formatCurrency(tx.amount, tx.currency, true)}
      </Text>
    </TouchableOpacity>
  );
}

export default function TransactionListScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { colors } = theme;
  const transactions = useAppStore((s) => s.transactions);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('month');

  const filtered = useMemo(() => {
    let result = transactions;

    // Period
    if (periodFilter === 'month') {
      const { start, end } = getMonthRange();
      result = result.filter((t) => t.date >= start && t.date <= end);
    } else if (periodFilter === 'week') {
      const { start, end } = getWeekRange();
      result = result.filter((t) => t.date >= start && t.date <= end);
    }

    // Type
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.note?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [transactions, search, typeFilter, periodFilter]);

  // Summary for filtered set
  const totalIn = filtered
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered
    .filter((t) => t.type === 'expense' || t.type === 'giving')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: spacing[5],
          paddingTop: spacing[6],
          paddingBottom: spacing[3],
          gap: spacing[4],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 }}>
            Transactions
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddTransaction', {})}
            style={{
              backgroundColor: colors.primary,
              borderRadius: radius.lg,
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSize.sm }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[2],
            backgroundColor: colors.inputBackground,
            borderRadius: radius.xl,
            paddingHorizontal: spacing[3],
            height: 44,
            borderWidth: 1,
            borderColor: colors.inputBorder,
          }}
        >
          <Text style={{ fontSize: 16, color: colors.textTertiary }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search transactions…"
            placeholderTextColor={colors.placeholder}
            style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.base }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ fontSize: 16, color: colors.textTertiary }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Period filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2] }}>
          {PERIOD_LABELS.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setPeriodFilter(p.id)}
              style={{
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[1.5],
                borderRadius: radius.full,
                backgroundColor: periodFilter === p.id ? colors.primary : colors.surfaceSecondary,
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: '600',
                  color: periodFilter === p.id ? '#fff' : colors.textSecondary,
                }}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Type filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2] }}>
          {TYPE_LABELS.map((t) => {
            const col = TYPE_COLOR[t.id];
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTypeFilter(t.id)}
                style={{
                  paddingHorizontal: spacing[3],
                  paddingVertical: spacing[1.5],
                  borderRadius: radius.full,
                  backgroundColor:
                    typeFilter === t.id
                      ? col ?? colors.primary
                      : colors.surfaceSecondary,
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: '600',
                    color: typeFilter === t.id ? '#fff' : colors.textSecondary,
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Summary strip */}
        {filtered.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              gap: spacing[3],
            }}
          >
            <View
              style={{
                flex: 1,
                padding: spacing[3],
                borderRadius: radius.lg,
                backgroundColor: colors.income + '15',
              }}
            >
              <Text style={{ fontSize: fontSize.xs, color: colors.income, fontWeight: '600', textTransform: 'uppercase' }}>In</Text>
              <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.income }}>
                {formatCurrency(totalIn, 'NGN', true)}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                padding: spacing[3],
                borderRadius: radius.lg,
                backgroundColor: colors.expense + '15',
              }}
            >
              <Text style={{ fontSize: fontSize.xs, color: colors.expense, fontWeight: '600', textTransform: 'uppercase' }}>Out</Text>
              <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.expense }}>
                {formatCurrency(totalOut, 'NGN', true)}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                padding: spacing[3],
                borderRadius: radius.lg,
                backgroundColor: colors.primary + '15',
              }}
            >
              <Text style={{ fontSize: fontSize.xs, color: colors.primary, fontWeight: '600', textTransform: 'uppercase' }}>Net</Text>
              <Text
                style={{
                  fontSize: fontSize.base,
                  fontWeight: '700',
                  color: totalIn - totalOut >= 0 ? colors.income : colors.expense,
                }}
              >
                {formatCurrency(totalIn - totalOut, 'NGN', true)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="📒"
          title={search ? 'No results' : 'No transactions yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Tap + to log your first transaction.'
          }
          actionLabel={search ? undefined : 'Add Transaction'}
          onAction={search ? undefined : () => navigation.navigate('AddTransaction', {})}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          renderItem={({ item, index }) => (
            <View>
              <TxItem
                tx={item}
                onPress={() =>
                  navigation.navigate('TransactionDetail', { transactionId: item.id })
                }
              />
              {index < filtered.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.divider,
                    marginLeft: spacing[4] + 42 + spacing[3],
                  }}
                />
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: spacing[10] }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
