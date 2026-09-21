import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import {
  useAppStore,
  selectNetWorth,
  selectTotalAssets,
  selectTotalLiabilities,
  selectMonthlyIncome,
  selectMonthlyExpenses,
} from '../../store/useAppStore';
import {
  AccountRepo,
  TransactionRepo,
  InvestmentRepo,
  NetWorthRepo,
} from '../../db/repositories';
import { useDB } from '../../db/DataLoader';
import { spacing, fontSize, radius, palette } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { formatRelativeDate, getMonthRange, nowISO } from '../../utils/date';
import { getCategoryById } from '../../utils/categories';
import { generateId } from '../../utils/id';
import type { Transaction } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Quick action button ──────────────────────────────────────────────────────
function QuickAction({
  emoji,
  label,
  onPress,
  color,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
  color: string;
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ alignItems: 'center', gap: spacing[1.5] }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: color + '18',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <Text
        style={{
          fontSize: fontSize.xs,
          color: colors.textSecondary,
          fontWeight: '500',
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Account chip ─────────────────────────────────────────────────────────────
function AccountChip({ account, onPress }: { account: any; onPress: () => void }) {
  const { theme } = useTheme();
  const { colors } = theme;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        minWidth: 140,
        padding: spacing[4],
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[2],
        marginRight: spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: account.color + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16 }}>{account.icon}</Text>
        </View>
        <Text
          style={{
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            fontWeight: '500',
            flex: 1,
          }}
          numberOfLines={1}
        >
          {account.name}
        </Text>
      </View>
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: '700',
          color: colors.textPrimary,
          letterSpacing: -0.5,
        }}
      >
        {formatCurrency(account.balance, account.currency, true)}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  income: palette.income,
  expense: palette.expense,
  transfer: palette.transfer,
  giving: palette.giving,
  passthrough: palette.passthrough,
};
const TYPE_ICON: Record<string, string> = {
  income: '↓',
  expense: '↑',
  transfer: '⇄',
  giving: '♥',
  passthrough: '→',
};

function TxRow({
  tx,
  onPress,
}: {
  tx: Transaction;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const cat = getCategoryById(tx.category);
  const color = TYPE_COLOR[tx.type] ?? colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        paddingVertical: spacing[3],
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
        <Text style={{ fontSize: 18 }}>{cat?.icon ?? TYPE_ICON[tx.type]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: fontSize.base,
            fontWeight: '600',
            color: colors.textPrimary,
          }}
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
          color:
            tx.type === 'income'
              ? colors.income
              : tx.type === 'expense'
              ? colors.expense
              : colors.textSecondary,
        }}
      >
        {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
        {formatCurrency(tx.amount, tx.currency, true)}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Net worth mini chart (bar-based) ─────────────────────────────────────────
function MiniNetWorthBar({
  assets,
  liabilities,
}: {
  assets: number;
  liabilities: number;
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const total = assets + liabilities || 1;
  const assetPct = (assets / total) * 100;
  const liabPct = (liabilities / total) * 100;

  return (
    <View style={{ gap: spacing[2] }}>
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.surfaceTertiary,
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${assetPct}%`,
            backgroundColor: colors.income,
            borderRadius: 4,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.income }}
          />
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
            Assets {formatCurrency(assets, 'NGN', true)}
          </Text>
        </View>
        {liabilities > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View
              style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.expense }}
            />
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
              Debts {formatCurrency(liabilities, 'NGN', true)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Budget summary strip ─────────────────────────────────────────────────────
function BudgetStrip() {
  const { theme } = useTheme();
  const { colors } = theme;
  const budgets = useAppStore((s) => s.budgets);
  const transactions = useAppStore((s) => s.transactions);
  const navigation = useNavigation<any>();
  const { start, end } = getMonthRange();

  if (budgets.length === 0) return null;

  const overBudget = budgets.filter((b) => {
    const spent = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category === b.category &&
          t.date >= start &&
          t.date <= end,
      )
      .reduce((s, t) => s + t.amount, 0);
    return spent >= b.limit * (b.alertAt / 100);
  });

  if (overBudget.length === 0) return null;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('More', { screen: 'Budgets' })}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        padding: spacing[3],
        borderRadius: radius.lg,
        backgroundColor: colors.warning + '15',
        borderWidth: 1,
        borderColor: colors.warning + '40',
      }}
    >
      <Text style={{ fontSize: 18 }}>⚠️</Text>
      <Text
        style={{ flex: 1, fontSize: fontSize.sm, color: colors.warning, fontWeight: '600' }}
      >
        {overBudget.length} budget{overBudget.length > 1 ? 's' : ''} near limit
      </Text>
      <Text style={{ fontSize: fontSize.sm, color: colors.warning }}>View →</Text>
    </TouchableOpacity>
  );
}

// ─── Debt alert strip ─────────────────────────────────────────────────────────
function DebtAlertStrip() {
  const { theme } = useTheme();
  const { colors } = theme;
  const debts = useAppStore((s) => s.debts);
  const navigation = useNavigation<any>();

  const overdueDebts = debts.filter(
    (d) => !d.isSettled && d.dueDate && new Date(d.dueDate) < new Date(),
  );

  if (overdueDebts.length === 0) return null;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('More', { screen: 'Debts' })}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        padding: spacing[3],
        borderRadius: radius.lg,
        backgroundColor: colors.danger + '15',
        borderWidth: 1,
        borderColor: colors.danger + '40',
      }}
    >
      <Text style={{ fontSize: 18 }}>🔴</Text>
      <Text
        style={{ flex: 1, fontSize: fontSize.sm, color: colors.danger, fontWeight: '600' }}
      >
        {overdueDebts.length} overdue debt{overdueDebts.length > 1 ? 's' : ''}
      </Text>
      <Text style={{ fontSize: fontSize.sm, color: colors.danger }}>View →</Text>
    </TouchableOpacity>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { colors } = theme;
  const db = useDB();

  const netWorth = useAppStore(selectNetWorth);
  const totalAssets = useAppStore(selectTotalAssets);
  const totalLiabilities = useAppStore(selectTotalLiabilities);
  const monthIncome = useAppStore(selectMonthlyIncome);
  const monthExpenses = useAppStore(selectMonthlyExpenses);
  const accounts = useAppStore((s) => s.accounts);
  const transactions = useAppStore((s) => s.transactions);
  const settings = useAppStore((s) => s.settings);
  const { setAccounts, setTransactions } = useAppStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const recentTx = transactions.slice(0, 8);
  const savings = monthIncome - monthExpenses;
  const savingsRate = monthIncome > 0 ? (savings / monthIncome) * 100 : 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [accs, txs] = await Promise.all([
        AccountRepo.getAll(db),
        TransactionRepo.getAll(db),
      ]);
      setAccounts(accs);
      setTransactions(txs);
    } finally {
      setRefreshing(false);
    }
  }, [db]);

  const navigateToAdd = (type: string) =>
    navigation.navigate('Transactions', {
      screen: 'AddTransaction',
      params: { type },
    });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + spacing[10],
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <View
        style={{
          paddingTop: insets.top + spacing[4],
          paddingHorizontal: spacing[5],
          paddingBottom: spacing[2],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text
            style={{
              fontSize: fontSize.xl,
              fontWeight: '800',
              color: colors.textPrimary,
              letterSpacing: -0.5,
            }}
          >
            Fintly
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
            {new Date().toLocaleDateString('en-NG', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('More', { screen: 'Settings' })}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: spacing[5], paddingHorizontal: spacing[5] }}>
        {/* ── Net Worth Hero Card ─────────────────────────────── */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Dashboard', { screen: 'NetWorthHistory' })
          }
          activeOpacity={0.92}
          style={{
            backgroundColor: colors.primary,
            borderRadius: radius['2xl'],
            padding: spacing[5],
            gap: spacing[4],
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <View>
            <Text
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: fontSize.sm,
                fontWeight: '500',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Net Worth
            </Text>
            <Text
              style={{
                color: '#fff',
                fontSize: fontSize['4xl'],
                fontWeight: '800',
                letterSpacing: -1.5,
                marginTop: spacing[1],
              }}
            >
              {formatCurrency(netWorth, settings.baseCurrency)}
            </Text>
          </View>

          <MiniNetWorthBar assets={totalAssets} liabilities={totalLiabilities} />

          {/* Monthly snapshot */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: spacing[3],
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <View>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: fontSize.xs,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Income
              </Text>
              <Text
                style={{
                  color: '#a7f3d0',
                  fontSize: fontSize.base,
                  fontWeight: '700',
                }}
              >
                {formatCurrency(monthIncome, 'NGN', true)}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: fontSize.xs,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Saved
              </Text>
              <Text
                style={{
                  color: savingsRate >= 0 ? '#a7f3d0' : '#fda4af',
                  fontSize: fontSize.base,
                  fontWeight: '700',
                }}
              >
                {savingsRate.toFixed(0)}%
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: fontSize.xs,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Spent
              </Text>
              <Text
                style={{
                  color: '#fda4af',
                  fontSize: fontSize.base,
                  fontWeight: '700',
                }}
              >
                {formatCurrency(monthExpenses, 'NGN', true)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Alerts ─────────────────────────────────────────── */}
        <BudgetStrip />
        <DebtAlertStrip />

        {/* ── Quick Actions ───────────────────────────────────── */}
        <View>
          <Text
            style={{
              fontSize: fontSize.sm,
              fontWeight: '600',
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: spacing[3],
            }}
          >
            Quick Add
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radius.xl,
              padding: spacing[4],
            }}
          >
            <QuickAction
              emoji="↑"
              label="Expense"
              onPress={() => navigateToAdd('expense')}
              color={palette.expense}
            />
            <QuickAction
              emoji="↓"
              label="Income"
              onPress={() => navigateToAdd('income')}
              color={palette.income}
            />
            <QuickAction
              emoji="⇄"
              label="Transfer"
              onPress={() => navigateToAdd('transfer')}
              color={palette.transfer}
            />
            <QuickAction
              emoji="♥"
              label="Giving"
              onPress={() => navigateToAdd('giving')}
              color={palette.giving}
            />
            <QuickAction
              emoji="→"
              label="Pass-thru"
              onPress={() => navigateToAdd('passthrough')}
              color={palette.passthrough}
            />
          </View>
        </View>

        {/* ── Accounts ────────────────────────────────────────── */}
        {accounts.length > 0 && (
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing[3],
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Accounts
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('More', { screen: 'Accounts' })
                }
              >
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.primary,
                    fontWeight: '600',
                  }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: spacing[5] }}
            >
              {accounts.map((acc) => (
                <AccountChip
                  key={acc.id}
                  account={acc}
                  onPress={() =>
                    navigation.navigate('Dashboard', {
                      screen: 'AccountDetail',
                      params: { accountId: acc.id },
                    })
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Recent Transactions ─────────────────────────────── */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[2],
            }}
          >
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: '600',
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Recent
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Transactions', {
                  screen: 'TransactionList',
                })
              }
            >
              <Text
                style={{
                  fontSize: fontSize.sm,
                  color: colors.primary,
                  fontWeight: '600',
                }}
              >
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {recentTx.length === 0 ? (
            <View
              style={{
                padding: spacing[6],
                alignItems: 'center',
                backgroundColor: colors.surfaceSecondary,
                borderRadius: radius.xl,
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: spacing[2] }}>📒</Text>
              <Text
                style={{
                  fontSize: fontSize.sm,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                No transactions yet.{'\n'}Tap + to log your first one.
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                paddingHorizontal: spacing[4],
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {recentTx.map((tx, i) => (
                <View key={tx.id}>
                  <TxRow
                    tx={tx}
                    onPress={() =>
                      navigation.navigate('Transactions', {
                        screen: 'TransactionDetail',
                        params: { transactionId: tx.id },
                      })
                    }
                  />
                  {i < recentTx.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: colors.divider,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
