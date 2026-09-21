import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { useDB } from '../../db/DataLoader';
import { AccountRepo } from '../../db/repositories';
import { ScreenLayout, Card, AmountDisplay, Divider } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius, palette } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDate, getMonthRange } from '../../utils/date';
import { getCategoryById } from '../../utils/categories';

const TYPE_COLOR: Record<string, string> = {
  income: palette.income,
  expense: palette.expense,
  transfer: palette.transfer,
  giving: palette.giving,
  passthrough: palette.passthrough,
};

export default function AccountDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { colors } = theme;
  const db = useDB();

  const accountId = route.params?.accountId as string;
  const accounts = useAppStore((s) => s.accounts);
  const transactions = useAppStore((s) => s.transactions);
  const { deleteAccount } = useAppStore();

  const account = accounts.find((a) => a.id === accountId);
  if (!account) return <ScreenLayout title="Account" showBack />;

  const accountTx = transactions
    .filter((t) => t.accountId === accountId || t.toAccountId === accountId)
    .slice(0, 50);

  const { start, end } = getMonthRange();
  const monthTx = accountTx.filter((t) => t.date >= start && t.date <= end);
  const monthIn = monthTx
    .filter((t) => t.type === 'income' || t.toAccountId === accountId)
    .reduce((s, t) => s + t.amount, 0);
  const monthOut = monthTx
    .filter((t) => (t.type === 'expense' || t.type === 'giving' || t.type === 'transfer') && t.accountId === accountId)
    .reduce((s, t) => s + t.amount, 0);

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      `Delete "${account.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AccountRepo.delete(db, accountId);
            deleteAccount(accountId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ScreenLayout
      title={account.name}
      showBack
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.navigate('AddAccount', { accountId })}
          style={{
            backgroundColor: colors.primaryLight,
            borderRadius: radius.lg,
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[2],
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: fontSize.sm }}>
            Edit
          </Text>
        </TouchableOpacity>
      }
    >
      {/* Hero balance card */}
      <View
        style={{
          backgroundColor: account.color,
          borderRadius: radius['2xl'],
          padding: spacing[5],
          marginBottom: spacing[5],
          gap: spacing[2],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
          <Text style={{ fontSize: 22 }}>{account.icon}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, fontWeight: '500', textTransform: 'capitalize' }}>
            {account.type}
          </Text>
        </View>
        <Text style={{ color: '#fff', fontSize: fontSize['3xl'], fontWeight: '800', letterSpacing: -1, marginTop: spacing[1] }}>
          {formatCurrency(account.balance, account.currency)}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: spacing[3],
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.2)',
            marginTop: spacing[2],
          }}
        >
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: fontSize.xs, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              In this month
            </Text>
            <Text style={{ color: '#a7f3d0', fontSize: fontSize.base, fontWeight: '700' }}>
              +{formatCurrency(monthIn, 'NGN', true)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: fontSize.xs, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Out this month
            </Text>
            <Text style={{ color: '#fda4af', fontSize: fontSize.base, fontWeight: '700' }}>
              -{formatCurrency(monthOut, 'NGN', true)}
            </Text>
          </View>
        </View>
      </View>

      {/* Transactions */}
      {accountTx.length === 0 ? (
        <View style={{ alignItems: 'center', padding: spacing[8] }}>
          <Text style={{ fontSize: 36 }}>📭</Text>
          <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing[3], textAlign: 'center' }}>
            No transactions for this account yet.
          </Text>
        </View>
      ) : (
        <View>
          <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing[3] }}>
            Transactions
          </Text>
          <Card variant="outlined">
            {accountTx.map((tx, i) => {
              const cat = getCategoryById(tx.category);
              const isCredit = tx.type === 'income' || tx.toAccountId === accountId;
              const color = TYPE_COLOR[tx.type] ?? colors.textSecondary;
              return (
                <View key={tx.id}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Transactions', {
                        screen: 'TransactionDetail',
                        params: { transactionId: tx.id },
                      })
                    }
                    activeOpacity={0.7}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3] }}
                  >
                    <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: color + '18', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16 }}>{cat?.icon ?? '•'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                        {tx.description || tx.type}
                      </Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                        {formatRelativeDate(tx.date)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: isCredit ? colors.income : colors.expense }}>
                      {isCredit ? '+' : '-'}{formatCurrency(tx.amount, tx.currency, true)}
                    </Text>
                  </TouchableOpacity>
                  {i < accountTx.length - 1 && <Divider />}
                </View>
              );
            })}
          </Card>
        </View>
      )}

      {/* Delete */}
      <TouchableOpacity
        onPress={handleDelete}
        style={{ alignItems: 'center', marginTop: spacing[8], paddingVertical: spacing[3] }}
      >
        <Text style={{ color: colors.danger, fontSize: fontSize.sm, fontWeight: '600' }}>
          Delete Account
        </Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
}
