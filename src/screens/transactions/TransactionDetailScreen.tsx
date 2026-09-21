import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { useDB } from '../../db/DataLoader';
import { TransactionRepo, AccountRepo } from '../../db/repositories';
import { ScreenLayout, Card, Badge } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius, palette } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { getCategoryById } from '../../utils/categories';
import { nowISO } from '../../utils/date';

const TYPE_COLOR: Record<string, string> = {
  income: palette.income,
  expense: palette.expense,
  transfer: palette.transfer,
  giving: palette.giving,
  passthrough: palette.passthrough,
};
const TYPE_LABEL: Record<string, string> = {
  income: 'Income', expense: 'Expense', transfer: 'Transfer',
  giving: 'Giving', passthrough: 'Pass-through',
};

export default function TransactionDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { colors } = theme;
  const db = useDB();

  const txId = route.params?.transactionId as string;
  const transactions = useAppStore((s) => s.transactions);
  const accounts = useAppStore((s) => s.accounts);
  const { deleteTransaction, upsertAccount } = useAppStore();

  const tx = transactions.find((t) => t.id === txId);
  if (!tx) return <ScreenLayout title="Transaction" showBack />;

  const cat = getCategoryById(tx.category);
  const color = TYPE_COLOR[tx.type] ?? colors.textSecondary;
  const account = accounts.find((a) => a.id === tx.accountId);
  const toAccount = tx.toAccountId ? accounts.find((a) => a.id === tx.toAccountId) : undefined;
  const isDebit = tx.type === 'expense' || tx.type === 'giving';
  const isCredit = tx.type === 'income';

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'This will remove the transaction and reverse the balance change.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // Reverse balance
          if (account) {
            const reversal = isDebit ? tx.amount : isCredit ? -tx.amount : tx.type === 'transfer' ? tx.amount : 0;
            const newBal = account.balance + reversal;
            await AccountRepo.updateBalance(db, account.id, newBal);
            upsertAccount({ ...account, balance: newBal, updatedAt: nowISO() });
          }
          await TransactionRepo.delete(db, txId);
          deleteTransaction(txId);
          navigation.goBack();
        },
      },
    ]);
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.divider }}>
      <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' }}>{label}</Text>
      <Text style={{ fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '600', flex: 1, textAlign: 'right' }} numberOfLines={2}>{value}</Text>
    </View>
  );

  return (
    <ScreenLayout title="Transaction" showBack>
      {/* Amount hero */}
      <View
        style={{
          alignItems: 'center',
          backgroundColor: color + '12',
          borderRadius: radius['2xl'],
          padding: spacing[6],
          marginBottom: spacing[5],
          gap: spacing[2],
        }}
      >
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: color + '25', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 30 }}>{cat?.icon ?? '💳'}</Text>
        </View>
        <Text style={{ fontSize: fontSize['3xl'], fontWeight: '800', color, letterSpacing: -1 }}>
          {isDebit ? '-' : isCredit ? '+' : ''}{formatCurrency(tx.amount, tx.currency)}
        </Text>
        <Text style={{ fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '600' }}>
          {tx.description || TYPE_LABEL[tx.type]}
        </Text>
        <Badge
          label={TYPE_LABEL[tx.type]}
          color={color + '20'}
          textColor={color}
        />
      </View>

      {/* Details */}
      <Card variant="outlined" style={{ marginBottom: spacing[5] }}>
        <DetailRow label="Date" value={formatDate(tx.date, 'MMM d, yyyy  h:mm a')} />
        <DetailRow label="Category" value={`${cat?.icon ?? ''} ${cat?.label ?? tx.category}`} />
        {account && <DetailRow label="Account" value={`${account.icon} ${account.name}`} />}
        {toAccount && <DetailRow label="To Account" value={`${toAccount.icon} ${toAccount.name}`} />}
        {tx.note && <DetailRow label="Note" value={tx.note} />}
        {tx.tags.length > 0 && <DetailRow label="Tags" value={tx.tags.join(', ')} />}
        {tx.isRecurring && (
          <DetailRow label="Recurring" value={tx.recurringInterval ?? 'Yes'} />
        )}
      </Card>

      {/* Delete */}
      <TouchableOpacity
        onPress={handleDelete}
        style={{
          alignItems: 'center',
          paddingVertical: spacing[4],
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.danger + '40',
        }}
      >
        <Text style={{ color: colors.danger, fontSize: fontSize.base, fontWeight: '600' }}>
          🗑 Delete Transaction
        </Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
}
