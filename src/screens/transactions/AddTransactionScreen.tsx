import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDB } from '../../db/DataLoader';
import { TransactionRepo, AccountRepo } from '../../db/repositories';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius, palette } from '../../theme';
import { getCategoriesByType } from '../../utils/categories';
import { generateId } from '../../utils/id';
import { nowISO } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import type { Transaction, TransactionType } from '../../types';

// ─── Type config ──────────────────────────────────────────────────────────────
const TX_TYPES: { id: TransactionType; label: string; emoji: string; color: string }[] = [
  { id: 'expense',     label: 'Expense',      emoji: '↑', color: palette.expense },
  { id: 'income',      label: 'Income',       emoji: '↓', color: palette.income },
  { id: 'transfer',    label: 'Transfer',     emoji: '⇄', color: palette.transfer },
  { id: 'giving',      label: 'Giving',       emoji: '♥', color: palette.giving },
  { id: 'passthrough', label: 'Pass-through', emoji: '→', color: palette.passthrough },
];

// ─── Amount pad ───────────────────────────────────────────────────────────────
function AmountPad({
  value,
  onChange,
  color,
  currency = '₦',
}: {
  value: string;
  onChange: (v: string) => void;
  color: string;
  currency?: string;
}) {
  const { theme } = useTheme();
  const { colors } = theme;

  const press = (key: string) => {
    if (key === '⌫') {
      onChange(value.slice(0, -1) || '0');
      return;
    }
    if (key === '.' && value.includes('.')) return;
    if (value === '0' && key !== '.') { onChange(key); return; }
    if (value.split('.')[1]?.length >= 2) return; // max 2 decimal places
    onChange(value + key);
  };

  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

  return (
    <View style={{ gap: spacing[1] }}>
      {/* Display */}
      <View style={{ alignItems: 'center', paddingVertical: spacing[4] }}>
        <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginBottom: spacing[1] }}>
          {currency}
        </Text>
        <Text
          style={{
            fontSize: value.length > 9 ? fontSize['2xl'] : fontSize['4xl'],
            fontWeight: '800',
            color,
            letterSpacing: -2,
          }}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {parseFloat(value || '0').toLocaleString('en-US', {
            minimumFractionDigits: value.includes('.') ? (value.split('.')[1]?.length ?? 0) : 0,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* Pad grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1.5] }}>
        {keys.map((k) => (
          <TouchableOpacity
            key={k}
            onPress={() => press(k)}
            activeOpacity={0.6}
            style={{
              width: '31%',
              height: 56,
              borderRadius: radius.xl,
              backgroundColor: k === '⌫' ? color + '18' : colors.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: k === '⌫' ? fontSize.lg : fontSize.xl,
                fontWeight: k === '⌫' ? '400' : '500',
                color: k === '⌫' ? color : colors.textPrimary,
              }}
            >
              {k}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Allocation preview (for income type) ────────────────────────────────────
function AllocationPreview({
  amount,
  sourceId,
}: {
  amount: number;
  sourceId: string;
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const incomeSources = useAppStore((s) => s.incomeSources);
  const accounts = useAppStore((s) => s.accounts);

  const source = incomeSources.find((s) => s.id === sourceId);
  if (!source || source.allocations.length === 0 || !amount) return null;

  return (
    <Card variant="flat" style={{ gap: spacing[2] }}>
      <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary }}>
        Allocation breakdown
      </Text>
      {source.allocations.map((sl) => {
        const sliceAmt = (sl.percentage / 100) * amount;
        const acc = accounts.find((a) => a.id === sl.accountId);
        return (
          <View
            key={sl.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: sl.color }} />
              <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: '500' }}>
                {sl.label} ({sl.percentage}%)
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: sl.color }}>
                {formatCurrency(sliceAmt, 'NGN', true)}
              </Text>
              {acc && (
                <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>
                  → {acc.icon} {acc.name}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </Card>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AddTransactionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors } = theme;
  const db = useDB();
  const { addTransaction, upsertAccount, accounts, incomeSources } = useAppStore();

  const defaultType = (route.params?.type as TransactionType) ?? 'expense';
  const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(
    defaultType === 'income' ? 'misc_income' : 'misc_expense',
  );
  const [accountId, setAccountId] = useState(defaultAccount?.id ?? '');
  const [toAccountId, setToAccountId] = useState('');
  const [incomeSourceId, setIncomeSourceId] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'amount' | 'details'>('amount');
  const [loading, setLoading] = useState(false);

  const typeConfig = TX_TYPES.find((t) => t.id === type)!;
  const categories = getCategoriesByType(
    type === 'income' ? 'income' : 'expense',
  );
  const numAmount = parseFloat(amount) || 0;

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    setCategory(t === 'income' ? 'misc_income' : 'misc_expense');
    setStep('amount');
  };

  const handleSave = async () => {
    if (numAmount <= 0) {
      Alert.alert('Enter an amount');
      return;
    }
    if (!accountId) {
      Alert.alert('Select an account');
      return;
    }
    setLoading(true);
    try {
      const tx: Transaction = {
        id:             generateId(),
        type,
        amount:         numAmount,
        currency:       'NGN',
        description:    description.trim() || typeConfig.label,
        category,
        tags:           [],
        accountId,
        toAccountId:    type === 'transfer' && toAccountId ? toAccountId : undefined,
        incomeSourceId: type === 'income' && incomeSourceId ? incomeSourceId : undefined,
        date:           nowISO(),
        note:           note.trim() || undefined,
        isRecurring:    false,
        createdAt:      nowISO(),
        updatedAt:      nowISO(),
      };

      await TransactionRepo.upsert(db, tx);

      // Update account balances
      const fromAcc = accounts.find((a) => a.id === accountId);
      if (fromAcc) {
        const delta =
          type === 'income'
            ? numAmount
            : type === 'expense' || type === 'giving' || type === 'passthrough'
            ? -numAmount
            : -numAmount; // transfer out
        const newBal = fromAcc.balance + delta;
        await AccountRepo.updateBalance(db, accountId, newBal);
        upsertAccount({ ...fromAcc, balance: newBal, updatedAt: nowISO() });
      }

      if (type === 'transfer' && toAccountId) {
        const toAcc = accounts.find((a) => a.id === toAccountId);
        if (toAcc) {
          const newBal = toAcc.balance + numAmount;
          await AccountRepo.updateBalance(db, toAccountId, newBal);
          upsertAccount({ ...toAcc, balance: newBal, updatedAt: nowISO() });
        }
      }

      addTransaction(tx);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + spacing[3],
          paddingHorizontal: spacing[5],
          paddingBottom: spacing[3],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, fontWeight: '500' }}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary }}>
          New Transaction
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={loading || numAmount <= 0}>
          <Text
            style={{
              fontSize: fontSize.base,
              fontWeight: '700',
              color: numAmount > 0 ? typeConfig.color : colors.textTertiary,
            }}
          >
            {loading ? '…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing[5],
          paddingBottom: insets.bottom + spacing[6],
          gap: spacing[4],
        }}
      >
        {/* Type selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing[2] }}
        >
          {TX_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => handleTypeChange(t.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing[1.5],
                paddingHorizontal: spacing[4],
                paddingVertical: spacing[2.5],
                borderRadius: radius.full,
                backgroundColor: type === t.id ? t.color : colors.surfaceSecondary,
              }}
            >
              <Text
                style={{ fontSize: 15, color: type === t.id ? '#fff' : colors.textTertiary }}
              >
                {t.emoji}
              </Text>
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: fontSize.sm,
                  color: type === t.id ? '#fff' : colors.textSecondary,
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Amount pad */}
        {step === 'amount' && (
          <>
            <AmountPad
              value={amount}
              onChange={setAmount}
              color={typeConfig.color}
            />
            <TouchableOpacity
              onPress={() => setStep('details')}
              disabled={numAmount <= 0}
              style={{
                backgroundColor: numAmount > 0 ? typeConfig.color : colors.surfaceTertiary,
                borderRadius: radius.xl,
                height: 52,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: numAmount > 0 ? '#fff' : colors.textTertiary,
                  fontWeight: '700',
                  fontSize: fontSize.base,
                }}
              >
                Continue →
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Details step */}
        {step === 'details' && (
          <>
            {/* Amount display (readonly) */}
            <TouchableOpacity
              onPress={() => setStep('amount')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: typeConfig.color + '12',
                borderRadius: radius.xl,
                padding: spacing[4],
              }}
            >
              <Text style={{ fontSize: fontSize.sm, color: typeConfig.color, fontWeight: '600' }}>
                Amount
              </Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: typeConfig.color, letterSpacing: -0.5 }}>
                {formatCurrency(numAmount)}  ✏️
              </Text>
            </TouchableOpacity>

            {/* Description */}
            <View
              style={{
                borderRadius: radius.lg,
                borderWidth: 1.5,
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBackground,
                paddingHorizontal: spacing[3],
                height: 48,
                justifyContent: 'center',
              }}
            >
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description (what's this for?)"
                placeholderTextColor={colors.placeholder}
                style={{ color: colors.textPrimary, fontSize: fontSize.base }}
              />
            </View>

            {/* Category */}
            {(type === 'expense' || type === 'income' || type === 'giving') && (
              <View>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>
                  Category
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                  {categories.slice(0, 12).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategory(cat.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingHorizontal: spacing[2.5],
                        paddingVertical: spacing[1.5],
                        borderRadius: radius.full,
                        backgroundColor:
                          category === cat.id ? cat.color : colors.surfaceSecondary,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>{cat.icon}</Text>
                      <Text
                        style={{
                          fontSize: fontSize.xs,
                          fontWeight: '500',
                          color: category === cat.id ? '#fff' : colors.textSecondary,
                        }}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Account */}
            {accounts.length > 0 && (
              <View>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>
                  {type === 'transfer' ? 'From Account' : 'Account'}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                  {accounts.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      onPress={() => setAccountId(acc.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing[1.5],
                        paddingHorizontal: spacing[3],
                        paddingVertical: spacing[2],
                        borderRadius: radius.full,
                        backgroundColor:
                          accountId === acc.id ? colors.primary : colors.surfaceSecondary,
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>{acc.icon}</Text>
                      <Text
                        style={{
                          fontSize: fontSize.sm,
                          fontWeight: '500',
                          color: accountId === acc.id ? '#fff' : colors.textSecondary,
                        }}
                      >
                        {acc.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* To account (transfer) */}
            {type === 'transfer' && (
              <View>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>
                  To Account
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => setToAccountId(acc.id)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing[1.5],
                          paddingHorizontal: spacing[3],
                          paddingVertical: spacing[2],
                          borderRadius: radius.full,
                          backgroundColor:
                            toAccountId === acc.id ? colors.transfer : colors.surfaceSecondary,
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>{acc.icon}</Text>
                        <Text
                          style={{
                            fontSize: fontSize.sm,
                            fontWeight: '500',
                            color: toAccountId === acc.id ? '#fff' : colors.textSecondary,
                          }}
                        >
                          {acc.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}

            {/* Income source */}
            {type === 'income' && incomeSources.length > 0 && (
              <View>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing[2] }}>
                  Income Source
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                  {incomeSources.map((src) => (
                    <TouchableOpacity
                      key={src.id}
                      onPress={() =>
                        setIncomeSourceId(incomeSourceId === src.id ? '' : src.id)
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing[1.5],
                        paddingHorizontal: spacing[3],
                        paddingVertical: spacing[2],
                        borderRadius: radius.full,
                        backgroundColor:
                          incomeSourceId === src.id
                            ? colors.income
                            : colors.surfaceSecondary,
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>{src.icon}</Text>
                      <Text
                        style={{
                          fontSize: fontSize.sm,
                          fontWeight: '500',
                          color:
                            incomeSourceId === src.id ? '#fff' : colors.textSecondary,
                        }}
                      >
                        {src.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Allocation preview */}
            {type === 'income' && incomeSourceId && numAmount > 0 && (
              <AllocationPreview amount={numAmount} sourceId={incomeSourceId} />
            )}

            {/* Note */}
            <View
              style={{
                borderRadius: radius.lg,
                borderWidth: 1.5,
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBackground,
                paddingHorizontal: spacing[3],
                minHeight: 48,
                justifyContent: 'center',
              }}
            >
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add a note (optional)"
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={2}
                style={{ color: colors.textPrimary, fontSize: fontSize.base, paddingVertical: spacing[3] }}
              />
            </View>

            {/* No account warning */}
            {accounts.length === 0 && (
              <View
                style={{
                  padding: spacing[4],
                  borderRadius: radius.lg,
                  backgroundColor: colors.warning + '15',
                  borderWidth: 1,
                  borderColor: colors.warning + '40',
                }}
              >
                <Text style={{ color: colors.warning, fontWeight: '600', fontSize: fontSize.sm }}>
                  ⚠ Add an account first from More → Accounts
                </Text>
              </View>
            )}

            {/* Save */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading || accounts.length === 0}
              style={{
                backgroundColor:
                  loading || accounts.length === 0
                    ? colors.surfaceTertiary
                    : typeConfig.color,
                borderRadius: radius.xl,
                height: 56,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: typeConfig.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text
                style={{
                  color: loading || accounts.length === 0 ? colors.textTertiary : '#fff',
                  fontWeight: '700',
                  fontSize: fontSize.md,
                }}
              >
                {loading ? 'Saving…' : `Save ${typeConfig.label}`}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
