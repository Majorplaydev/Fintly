import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore, selectMonthlyIncome, selectMonthlyExpenses } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius, palette } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { getCategoryById } from '../../utils/categories';
import {
  getMonthRange,
  getWeekRange,
  getLast6MonthsRange,
  formatDate,
  formatMonthYear,
} from '../../utils/date';
import {
  startOfMonth,
  subMonths,
  endOfMonth,
  eachMonthOfInterval,
  parseISO,
} from 'date-fns';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - spacing[5] * 2 - spacing[4] * 2; // inside card padding

// ─── Period selector ──────────────────────────────────────────────────────────
type Period = 'week' | 'month' | '3m' | '6m' | 'year';
const PERIODS: { id: Period; label: string }[] = [
  { id: 'week',  label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: '3m',    label: '3M' },
  { id: '6m',    label: '6M' },
  { id: 'year',  label: 'Year' },
];

function getPeriodRange(p: Period): { start: string; end: string } {
  const now = new Date();
  switch (p) {
    case 'week':  return getWeekRange(now);
    case 'month': return getMonthRange(now);
    case '3m':    return { start: subMonths(now, 3).toISOString(), end: now.toISOString() };
    case '6m':    return getLast6MonthsRange();
    case 'year':  return { start: subMonths(now, 12).toISOString(), end: now.toISOString() };
  }
}

// ─── Simple bar chart ─────────────────────────────────────────────────────────
function BarChart({
  data,
  color,
  height = 140,
}: {
  data: { label: string; value: number }[];
  color: string;
  height?: number;
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.floor((CHART_W - (data.length - 1) * 6) / data.length);

  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
      {data.map((d, i) => {
        const barH = Math.max((d.value / max) * (height - 28), d.value > 0 ? 4 : 0);
        return (
          <View key={i} style={{ width: barW, alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: barW,
                height: barH,
                borderRadius: 4,
                backgroundColor: color,
                opacity: 0.85,
              }}
            />
            <Text
              style={{
                fontSize: 9,
                color: colors.textTertiary,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Monthly trend (income vs expense grouped bars) ────────────────────────
function MonthlyTrendChart() {
  const { theme } = useTheme();
  const { colors } = theme;
  const transactions = useAppStore((s) => s.transactions);

  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end:   new Date(),
  });

  const data = months.map((m) => {
    const start = startOfMonth(m).toISOString();
    const end   = endOfMonth(m).toISOString();
    const inc   = transactions
      .filter((t) => t.type === 'income' && t.date >= start && t.date <= end)
      .reduce((s, t) => s + t.amount, 0);
    const exp   = transactions
      .filter((t) => t.type === 'expense' && t.date >= start && t.date <= end)
      .reduce((s, t) => s + t.amount, 0);
    return {
      label: formatDate(m.toISOString(), 'MMM'),
      income: inc,
      expense: exp,
    };
  });

  const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const chartH = 120;
  const groupW = Math.floor(CHART_W / data.length);
  const barW   = Math.floor((groupW - 10) / 2);

  return (
    <View>
      <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing[3] }}>
        Income vs Expenses (6 months)
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartH + 20 }}>
        {data.map((d, i) => (
          <View key={i} style={{ width: groupW, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: chartH }}>
              {/* Income bar */}
              <View style={{ width: barW, height: Math.max((d.income / max) * chartH, d.income > 0 ? 4 : 0), borderRadius: 3, backgroundColor: colors.income, opacity: 0.9 }} />
              {/* Expense bar */}
              <View style={{ width: barW, height: Math.max((d.expense / max) * chartH, d.expense > 0 ? 4 : 0), borderRadius: 3, backgroundColor: colors.expense, opacity: 0.9 }} />
            </View>
            <Text style={{ fontSize: 9, color: colors.textTertiary, marginTop: 4 }}>{d.label}</Text>
          </View>
        ))}
      </View>
      {/* Legend */}
      <View style={{ flexDirection: 'row', gap: spacing[4], marginTop: spacing[2] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.income }} />
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Income</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.expense }} />
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Expenses</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Donut-style ring (pure RN, no SVG dep) ───────────────────────────────────
function SpendingRing({ slices }: { slices: { color: string; pct: number; label: string; amount: number }[] }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const total = slices.reduce((s, sl) => s + sl.amount, 0);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[4] }}>
      {/* Stacked bar as ring substitute */}
      <View style={{ flex: 1 }}>
        <View style={{ height: 16, borderRadius: 8, flexDirection: 'row', overflow: 'hidden', backgroundColor: colors.surfaceTertiary }}>
          {slices.map((sl, i) => (
            <View
              key={i}
              style={{ width: `${sl.pct}%`, backgroundColor: sl.color }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Category breakdown list ──────────────────────────────────────────────────
function CategoryBreakdown({ transactions: txList, type }: { transactions: any[]; type: 'expense' | 'income' }) {
  const { theme } = useTheme();
  const { colors } = theme;

  const byCategory = txList
    .filter((t) => t.type === type)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const sorted = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;

  if (!sorted.length) {
    return (
      <View style={{ padding: spacing[4], alignItems: 'center' }}>
        <Text style={{ color: colors.textTertiary, fontSize: fontSize.sm }}>
          No {type} transactions in this period
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing[3] }}>
      {sorted.map(([catId, amount], i) => {
        const cat = getCategoryById(catId);
        const pct = amount / total;
        return (
          <View key={catId}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[1] }}>
              <Text style={{ fontSize: 18, width: 28 }}>{cat?.icon ?? '📦'}</Text>
              <Text style={{ flex: 1, fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: '500' }}>
                {cat?.label ?? catId}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: type === 'expense' ? colors.expense : colors.income }}>
                  {formatCurrency(amount, 'NGN', true)}
                </Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>
                  {(pct * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.surfaceTertiary, overflow: 'hidden' }}>
              <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 3, backgroundColor: cat?.color ?? colors.primary }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  const { colors } = theme;
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[4], borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing[4] }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors } = theme;
  const transactions = useAppStore((s) => s.transactions);
  const budgets      = useAppStore((s) => s.budgets);
  const debts        = useAppStore((s) => s.debts);
  const investments  = useAppStore((s) => s.investments);

  const [period, setPeriod] = useState<Period>('month');
  const [tab, setTab]       = useState<'spending' | 'income'>('spending');

  const { start, end } = useMemo(() => getPeriodRange(period), [period]);

  const periodTx = useMemo(
    () => transactions.filter((t) => t.date >= start && t.date <= end),
    [transactions, start, end],
  );

  const totalIncome   = periodTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = periodTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalGiving   = periodTx.filter((t) => t.type === 'giving').reduce((s, t) => s + t.amount, 0);
  const totalPassthru = periodTx.filter((t) => t.type === 'passthrough').reduce((s, t) => s + t.amount, 0);
  const netCash       = totalIncome - totalExpenses - totalGiving;
  const savingsRate   = totalIncome > 0 ? Math.max(0, (netCash / totalIncome) * 100) : 0;

  // Budget overview
  const { start: mStart, end: mEnd } = getMonthRange();
  const budgetAlerts = budgets.filter((b) => {
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category === b.category && t.date >= mStart && t.date <= mEnd)
      .reduce((s, t) => s + t.amount, 0);
    return spent > 0;
  });

  // Total portfolio
  const portfolioValue = investments.reduce((s, i) => s + i.currentValue, 0);
  const portfolioGain  = investments.reduce((s, i) => s + (i.currentValue - i.initialAmount), 0);

  // Debt summary
  const totalOwed    = debts.filter((d) => d.direction === 'owe'         && !d.isSettled).reduce((s, d) => s + (d.amount - d.amountPaid), 0);
  const totalOwedToMe = debts.filter((d) => d.direction === 'owed_to_me' && !d.isSettled).reduce((s, d) => s + (d.amount - d.amountPaid), 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing[4],
        paddingHorizontal: spacing[5],
        paddingBottom: insets.bottom + spacing[10],
        gap: spacing[5],
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 }}>
        Analytics
      </Text>

      {/* Period selector */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceSecondary, borderRadius: radius.xl, padding: 4 }}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setPeriod(p.id)}
            style={{
              flex: 1,
              paddingVertical: spacing[2],
              borderRadius: radius.lg,
              backgroundColor: period === p.id ? colors.surface : 'transparent',
              alignItems: 'center',
              shadowColor: period === p.id ? colors.shadowColor : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 2,
              elevation: period === p.id ? 1 : 0,
            }}
          >
            <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: period === p.id ? colors.textPrimary : colors.textSecondary }}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary cards */}
      <View style={{ flexDirection: 'row', gap: spacing[3] }}>
        <View style={{ flex: 1, backgroundColor: colors.income + '15', borderRadius: radius.xl, padding: spacing[4] }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.income, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Income</Text>
          <Text style={{ fontSize: fontSize.lg, fontWeight: '800', color: colors.income, marginTop: spacing[1], letterSpacing: -0.5 }}>
            {formatCurrency(totalIncome, 'NGN', true)}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.expense + '15', borderRadius: radius.xl, padding: spacing[4] }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.expense, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Spent</Text>
          <Text style={{ fontSize: fontSize.lg, fontWeight: '800', color: colors.expense, marginTop: spacing[1], letterSpacing: -0.5 }}>
            {formatCurrency(totalExpenses, 'NGN', true)}
          </Text>
        </View>
      </View>

      {/* Savings rate */}
      {totalIncome > 0 && (
        <View style={{ backgroundColor: colors.primary + '12', borderRadius: radius.xl, padding: spacing[4], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' }}>Savings Rate</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
              {formatCurrency(netCash, 'NGN', true)} saved
            </Text>
          </View>
          <Text style={{ fontSize: fontSize['2xl'], fontWeight: '800', color: colors.primary, letterSpacing: -1 }}>
            {savingsRate.toFixed(0)}%
          </Text>
        </View>
      )}

      {/* Other types */}
      {(totalGiving > 0 || totalPassthru > 0) && (
        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          {totalGiving > 0 && (
            <View style={{ flex: 1, backgroundColor: colors.giving + '15', borderRadius: radius.xl, padding: spacing[3] }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.giving, fontWeight: '700', textTransform: 'uppercase' }}>Giving</Text>
              <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.giving }}>{formatCurrency(totalGiving, 'NGN', true)}</Text>
            </View>
          )}
          {totalPassthru > 0 && (
            <View style={{ flex: 1, backgroundColor: colors.passthrough + '15', borderRadius: radius.xl, padding: spacing[3] }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.passthrough, fontWeight: '700', textTransform: 'uppercase' }}>Pass-thru</Text>
              <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.passthrough }}>{formatCurrency(totalPassthru, 'NGN', true)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Monthly trend chart */}
      <SectionCard title="Monthly Trend">
        <MonthlyTrendChart />
      </SectionCard>

      {/* Category breakdown */}
      <SectionCard title="Breakdown">
        {/* Tab */}
        <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: 3, marginBottom: spacing[4] }}>
          {(['spending', 'income'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{ flex: 1, paddingVertical: spacing[2], borderRadius: radius.md, backgroundColor: tab === t ? colors.surface : 'transparent', alignItems: 'center' }}
            >
              <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: tab === t ? colors.textPrimary : colors.textSecondary, textTransform: 'capitalize' }}>
                {t === 'spending' ? 'Spending' : 'Income'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <CategoryBreakdown
          transactions={periodTx}
          type={tab === 'spending' ? 'expense' : 'income'}
        />
      </SectionCard>

      {/* Budget summary */}
      {budgets.length > 0 && (
        <SectionCard title="Budgets this month">
          <View style={{ gap: spacing[3] }}>
            {budgets.slice(0, 5).map((b) => {
              const spent = transactions
                .filter((t) => t.type === 'expense' && t.category === b.category && t.date >= mStart && t.date <= mEnd)
                .reduce((s, t) => s + t.amount, 0);
              const pct = b.limit > 0 ? spent / b.limit : 0;
              const cat = getCategoryById(b.category);
              const isOver = pct > 1;
              return (
                <View key={b.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[1] }}>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: '500' }}>
                      {cat?.icon} {cat?.label ?? b.category}
                    </Text>
                    <Text style={{ fontSize: fontSize.xs, color: isOver ? colors.danger : colors.textSecondary }}>
                      {formatCurrency(spent, 'NGN', true)} / {formatCurrency(b.limit, 'NGN', true)}
                    </Text>
                  </View>
                  <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.surfaceTertiary, overflow: 'hidden' }}>
                    <View style={{ width: `${Math.min(pct, 1) * 100}%`, height: '100%', borderRadius: 3, backgroundColor: isOver ? colors.danger : b.color }} />
                  </View>
                </View>
              );
            })}
          </View>
        </SectionCard>
      )}

      {/* Debt & investments snapshot */}
      <View style={{ flexDirection: 'row', gap: spacing[3] }}>
        {/* Debt net */}
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[4], borderWidth: 1, borderColor: colors.border, gap: spacing[2] }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Debts</Text>
          <View>
            <Text style={{ fontSize: fontSize.xs, color: colors.expense }}>You owe</Text>
            <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.expense }}>{formatCurrency(totalOwed, 'NGN', true)}</Text>
          </View>
          <View>
            <Text style={{ fontSize: fontSize.xs, color: colors.income }}>Owed to you</Text>
            <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.income }}>{formatCurrency(totalOwedToMe, 'NGN', true)}</Text>
          </View>
        </View>

        {/* Investments */}
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing[4], borderWidth: 1, borderColor: colors.border, gap: spacing[2] }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Investments</Text>
          <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary }}>{formatCurrency(portfolioValue, 'NGN', true)}</Text>
          <Text style={{ fontSize: fontSize.xs, color: portfolioGain >= 0 ? colors.income : colors.expense }}>
            {portfolioGain >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(portfolioGain), 'NGN', true)} gain
          </Text>
        </View>
      </View>

      {/* Transaction count */}
      <View style={{ backgroundColor: colors.surfaceSecondary, borderRadius: radius.xl, padding: spacing[4], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500' }}>
          {periodTx.length} transaction{periodTx.length !== 1 ? 's' : ''} in this period
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' }}>
          Avg {formatCurrency(totalExpenses / Math.max(periodTx.filter(t => t.type === 'expense').length, 1), 'NGN', true)}/expense
        </Text>
      </View>
    </ScrollView>
  );
}
