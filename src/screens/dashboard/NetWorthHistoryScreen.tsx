import React, { useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import {
  useAppStore,
  selectNetWorth,
  selectTotalAssets,
  selectTotalLiabilities,
} from '../../store/useAppStore';
import { NetWorthRepo } from '../../db/repositories';
import { useDB } from '../../db/DataLoader';
import { ScreenLayout, Card, Divider } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { formatDate, nowISO } from '../../utils/date';
import { generateId } from '../../utils/id';
import type { NetWorthSnapshot } from '../../types';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - spacing[5] * 2 - spacing[4] * 2;

// ─── Simple line chart (pure RN) ──────────────────────────────────────────────
function NetWorthLineChart({ snapshots }: { snapshots: NetWorthSnapshot[] }) {
  const { theme } = useTheme();
  const { colors } = theme;

  if (snapshots.length < 2) {
    return (
      <View style={{ height: 100, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textTertiary, fontSize: fontSize.sm }}>
          Log more months to see your growth chart
        </Text>
      </View>
    );
  }

  const values = snapshots.map((s) => s.netWorth);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const chartH = 120;
  const barW = Math.floor((CHART_W - (snapshots.length - 1) * 4) / snapshots.length);

  return (
    <View>
      {/* Bar representation */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartH + 24, gap: 4 }}>
        {snapshots.map((snap, i) => {
          const normalised = (snap.netWorth - min) / range;
          const barH = Math.max(normalised * chartH, 4);
          const isPositive = snap.netWorth >= 0;
          const isLatest = i === snapshots.length - 1;

          return (
            <View key={snap.id} style={{ width: barW, alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: barW,
                  height: barH,
                  borderRadius: 3,
                  backgroundColor: isLatest
                    ? colors.primary
                    : isPositive
                    ? colors.income + 'CC'
                    : colors.expense + 'CC',
                }}
              />
              <Text style={{ fontSize: 8, color: colors.textTertiary, textAlign: 'center' }} numberOfLines={1}>
                {formatDate(snap.date, 'MMM')}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Y-axis labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[1] }}>
        <Text style={{ fontSize: 9, color: colors.textTertiary }}>
          {formatCurrency(min, 'NGN', true)}
        </Text>
        <Text style={{ fontSize: 9, color: colors.textTertiary }}>
          {formatCurrency(max, 'NGN', true)}
        </Text>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function NetWorthHistoryScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const db = useDB();

  const netWorth    = useAppStore(selectNetWorth);
  const assets      = useAppStore(selectTotalAssets);
  const liabilities = useAppStore(selectTotalLiabilities);
  const snapshots   = useAppStore((s) => s.netWorthSnapshots);
  const accounts    = useAppStore((s) => s.accounts);
  const investments = useAppStore((s) => s.investments);
  const debts       = useAppStore((s) => s.debts);
  const { addNetWorthSnapshot } = useAppStore();

  // Auto-snapshot current net worth when screen opens
  useEffect(() => {
    const takeSnapshot = async () => {
      const today = new Date().toISOString().slice(0, 7); // YYYY-MM
      const alreadySnapped = snapshots.some((s) => s.date.slice(0, 7) === today);
      if (!alreadySnapped && (assets > 0 || liabilities > 0)) {
        const snap: NetWorthSnapshot = {
          id:               generateId(),
          date:             nowISO(),
          totalAssets:      assets,
          totalLiabilities: liabilities,
          netWorth,
        };
        await NetWorthRepo.add(db, snap);
        addNetWorthSnapshot(snap);
      }
    };
    takeSnapshot();
  }, []);

  const sortedSnaps = [...snapshots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Growth calculation
  const oldestSnap = sortedSnaps[0];
  const growth = oldestSnap
    ? netWorth - oldestSnap.netWorth
    : 0;
  const growthPct = oldestSnap && oldestSnap.netWorth !== 0
    ? (growth / Math.abs(oldestSnap.netWorth)) * 100
    : 0;

  // Outstanding debts
  const activeDebts = debts.filter((d) => !d.isSettled);
  const debtOwed    = activeDebts.filter((d) => d.direction === 'owe').reduce((s, d) => s + (d.amount - d.amountPaid), 0);
  const debtOwedToMe = activeDebts.filter((d) => d.direction === 'owed_to_me').reduce((s, d) => s + (d.amount - d.amountPaid), 0);

  return (
    <ScreenLayout title="Net Worth" showBack>

      {/* Hero */}
      <View
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius['2xl'],
          padding: spacing[5],
          marginBottom: spacing[5],
          gap: spacing[3],
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Net Worth
        </Text>
        <Text style={{ color: '#fff', fontSize: fontSize['3xl'], fontWeight: '800', letterSpacing: -1 }}>
          {formatCurrency(netWorth)}
        </Text>

        {/* Growth badge */}
        {oldestSnap && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            <View style={{ backgroundColor: growth >= 0 ? 'rgba(167,243,208,0.25)' : 'rgba(253,164,175,0.25)', borderRadius: radius.full, paddingHorizontal: spacing[2.5], paddingVertical: spacing[0.5] }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: growth >= 0 ? '#a7f3d0' : '#fda4af' }}>
                {growth >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(growth), 'NGN', true)} ({Math.abs(growthPct).toFixed(1)}%)
              </Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: fontSize.xs }}>all time</Text>
          </View>
        )}

        {/* Assets / Liabilities */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: fontSize.xs, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Assets</Text>
            <Text style={{ color: '#a7f3d0', fontSize: fontSize.base, fontWeight: '700' }}>{formatCurrency(assets, 'NGN', true)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: fontSize.xs, textTransform: 'uppercase', letterSpacing: 0.5 }}>Liabilities</Text>
            <Text style={{ color: '#fda4af', fontSize: fontSize.base, fontWeight: '700' }}>{formatCurrency(liabilities, 'NGN', true)}</Text>
          </View>
        </View>
      </View>

      {/* Chart */}
      {sortedSnaps.length > 0 && (
        <Card variant="outlined" style={{ marginBottom: spacing[5] }}>
          <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing[3] }}>
            Net Worth Over Time
          </Text>
          <NetWorthLineChart snapshots={sortedSnaps} />
        </Card>
      )}

      {/* Asset breakdown */}
      <View style={{ marginBottom: spacing[5] }}>
        <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing[3] }}>
          Assets
        </Text>
        <Card variant="outlined">
          {accounts.length === 0 && investments.length === 0 ? (
            <Text style={{ color: colors.textTertiary, fontSize: fontSize.sm, padding: spacing[2] }}>
              No assets yet. Add accounts or investments.
            </Text>
          ) : (
            <>
              {accounts.map((acc, i) => (
                <View key={acc.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3] }}>
                    <Text style={{ fontSize: 20 }}>{acc.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>{acc.name}</Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, textTransform: 'capitalize' }}>{acc.type}</Text>
                    </View>
                    <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary }}>
                      {formatCurrency(acc.balance, acc.currency, true)}
                    </Text>
                  </View>
                  {(i < accounts.length - 1 || investments.length > 0) && <Divider />}
                </View>
              ))}
              {investments.map((inv, i) => (
                <View key={inv.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3] }}>
                    <Text style={{ fontSize: 20 }}>{inv.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>{inv.name}</Text>
                      <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{inv.platform}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary }}>
                        {formatCurrency(inv.currentValue, inv.currency, true)}
                      </Text>
                      <Text style={{ fontSize: fontSize.xs, color: inv.currentValue >= inv.initialAmount ? colors.income : colors.expense }}>
                        {inv.currentValue >= inv.initialAmount ? '▲' : '▼'}
                        {Math.abs(((inv.currentValue - inv.initialAmount) / Math.max(inv.initialAmount, 1)) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  {i < investments.length - 1 && <Divider />}
                </View>
              ))}
            </>
          )}
        </Card>
      </View>

      {/* Liabilities */}
      {activeDebts.length > 0 && (
        <View style={{ marginBottom: spacing[5] }}>
          <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing[3] }}>
            Liabilities
          </Text>
          <Card variant="outlined">
            {debtOwed > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                <Text style={{ fontSize: fontSize.base, color: colors.textPrimary }}>🔴 I owe others</Text>
                <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.expense }}>
                  -{formatCurrency(debtOwed, 'NGN', true)}
                </Text>
              </View>
            )}
            {debtOwedToMe > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[3] }}>
                <Text style={{ fontSize: fontSize.base, color: colors.textPrimary }}>🟢 Owed to me</Text>
                <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.income }}>
                  +{formatCurrency(debtOwedToMe, 'NGN', true)}
                </Text>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Snapshot history */}
      {sortedSnaps.length > 1 && (
        <View>
          <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing[3] }}>
            Monthly Snapshots
          </Text>
          <Card variant="outlined">
            {[...sortedSnaps].reverse().slice(0, 12).map((snap, i, arr) => {
              const prev = arr[i + 1];
              const delta = prev ? snap.netWorth - prev.netWorth : 0;
              return (
                <View
                  key={snap.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: spacing[3],
                    borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                    {formatDate(snap.date, 'MMM d, yyyy')}
                  </Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: snap.netWorth >= 0 ? colors.textPrimary : colors.expense }}>
                      {formatCurrency(snap.netWorth, 'NGN', true)}
                    </Text>
                    {prev && (
                      <Text style={{ fontSize: fontSize.xs, color: delta >= 0 ? colors.income : colors.expense }}>
                        {delta >= 0 ? '+' : ''}{formatCurrency(delta, 'NGN', true)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </Card>
        </View>
      )}
    </ScreenLayout>
  );
}
