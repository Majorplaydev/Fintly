import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Card, AmountDisplay, EmptyState } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { formatCurrency } from '../../utils/currency';

export default function AccountsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { colors } = theme;
  const accounts = useAppStore((s) => s.accounts);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <ScreenLayout
      title="Accounts"
      showBack
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.navigate('AddAccount', {})}
          style={{ backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[2] }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: fontSize.sm }}>+ Add</Text>
        </TouchableOpacity>
      }
    >
      {/* Total */}
      <Card style={{ marginBottom: spacing[5], backgroundColor: colors.primary }}>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm, marginBottom: spacing[1] }}>Total Balance</Text>
        <AmountDisplay amount={totalBalance} currency="NGN" size="large" style={{ color: '#fff' }} />
      </Card>

      {accounts.length === 0 ? (
        <EmptyState
          emoji="🏦"
          title="No accounts yet"
          description="Add your bank accounts, wallets, and cash to start tracking."
          actionLabel="Add Account"
          onAction={() => navigation.navigate('AddAccount', {})}
        />
      ) : (
        <View style={{ gap: spacing[3] }}>
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() => navigation.navigate('AccountDetail', { accountId: account.id })}
              activeOpacity={0.7}
            >
              <Card variant="outlined">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: account.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22 }}>{account.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>{account.name}</Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textTransform: 'capitalize' }}>{account.type}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AmountDisplay amount={account.balance} currency={account.currency} size="small" />
                    {account.isDefault && (
                      <Text style={{ fontSize: fontSize.xs, color: colors.primary, marginTop: 2 }}>Default</Text>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScreenLayout>
  );
}
