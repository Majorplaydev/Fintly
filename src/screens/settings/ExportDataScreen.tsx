import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAppStore } from '../../store/useAppStore';
import { ScreenLayout, Card } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';
import { formatDate, nowISO } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';

// ─── CSV helpers ──────────────────────────────────────────────────────────────
function escapeCSV(val: unknown): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSVRow(fields: unknown[]): string {
  return fields.map(escapeCSV).join(',');
}

// ─── Export formats ───────────────────────────────────────────────────────────
type ExportFormat = 'csv_transactions' | 'csv_full' | 'json';

const EXPORT_OPTIONS: {
  id: ExportFormat;
  icon: string;
  label: string;
  sublabel: string;
}[] = [
  {
    id:       'csv_transactions',
    icon:     '📋',
    label:    'Transactions CSV',
    sublabel: 'All transactions in a spreadsheet-ready format',
  },
  {
    id:       'csv_full',
    icon:     '📊',
    label:    'Full Report CSV',
    sublabel: 'Transactions + accounts + budgets in one file',
  },
  {
    id:       'json',
    icon:     '💾',
    label:    'Full Backup (JSON)',
    sublabel: 'Complete data export for backup or migration',
  },
];

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ExportDataScreen() {
  const { theme } = useTheme();
  const { colors } = theme;

  const transactions = useAppStore((s) => s.transactions);
  const accounts     = useAppStore((s) => s.accounts);
  const budgets      = useAppStore((s) => s.budgets);
  const debts        = useAppStore((s) => s.debts);
  const investments  = useAppStore((s) => s.investments);
  const wishlist     = useAppStore((s) => s.wishlist);
  const incomeSources = useAppStore((s) => s.incomeSources);

  const [loading, setLoading] = useState<ExportFormat | null>(null);

  const buildTransactionCSV = (): string => {
    const header = toCSVRow([
      'Date', 'Type', 'Amount', 'Currency', 'Description',
      'Category', 'Account', 'Note', 'Tags',
    ]);
    const rows = transactions.map((t) => {
      const acc = accounts.find((a) => a.id === t.accountId);
      return toCSVRow([
        formatDate(t.date, 'yyyy-MM-dd HH:mm'),
        t.type,
        t.amount,
        t.currency,
        t.description,
        t.category,
        acc?.name ?? t.accountId,
        t.note ?? '',
        t.tags.join(';'),
      ]);
    });
    return [header, ...rows].join('\n');
  };

  const buildFullCSV = (): string => {
    const sections: string[] = [];

    // Transactions
    sections.push('=== TRANSACTIONS ===');
    sections.push(buildTransactionCSV());

    // Accounts
    sections.push('\n=== ACCOUNTS ===');
    sections.push(toCSVRow(['Name', 'Type', 'Balance', 'Currency']));
    accounts.forEach((a) => {
      sections.push(toCSVRow([a.name, a.type, a.balance, a.currency]));
    });

    // Budgets
    sections.push('\n=== BUDGETS ===');
    sections.push(toCSVRow(['Category', 'Limit', 'Period', 'Currency']));
    budgets.forEach((b) => {
      sections.push(toCSVRow([b.category, b.limit, b.period, b.currency]));
    });

    // Debts
    sections.push('\n=== DEBTS ===');
    sections.push(toCSVRow(['Person', 'Direction', 'Amount', 'Paid', 'Remaining', 'Due Date', 'Settled']));
    debts.forEach((d) => {
      sections.push(toCSVRow([
        d.personName, d.direction, d.amount, d.amountPaid,
        d.amount - d.amountPaid, d.dueDate ?? '', d.isSettled ? 'Yes' : 'No',
      ]));
    });

    // Investments
    sections.push('\n=== INVESTMENTS ===');
    sections.push(toCSVRow(['Name', 'Platform', 'Initial', 'Current', 'Gain/Loss']));
    investments.forEach((i) => {
      sections.push(toCSVRow([
        i.name, i.platform, i.initialAmount, i.currentValue,
        i.currentValue - i.initialAmount,
      ]));
    });

    return sections.join('\n');
  };

  const buildJSON = (): string => {
    return JSON.stringify(
      {
        exportedAt: nowISO(),
        version:    1,
        accounts,
        incomeSources,
        transactions,
        budgets,
        debts,
        investments,
        wishlist,
      },
      null,
      2,
    );
  };

  const handleExport = async (format: ExportFormat) => {
    setLoading(format);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      let content = '';
      let filename = '';
      let mimeType = 'text/plain';

      switch (format) {
        case 'csv_transactions':
          content  = buildTransactionCSV();
          filename = `fintly-transactions-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        case 'csv_full':
          content  = buildFullCSV();
          filename = `fintly-full-report-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content  = buildJSON();
          filename = `fintly-backup-${timestamp}.json`;
          mimeType = 'application/json';
          break;
      }

      // expo-file-system v57 uses the new File + Paths API
      const file = new File(Paths.cache, filename);
      file.write(content);

      const fileUri = file.uri;
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Export ${filename}`,
          UTI: mimeType,
        });
      } else {
        Alert.alert('Saved', `File ready at: ${fileUri}`);
      }
    } catch (e) {
      Alert.alert('Export Failed', 'Something went wrong. Please try again.');
      console.error('[Fintly] Export error:', e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScreenLayout title="Export Data" showBack>
      <View style={{ gap: spacing[5] }}>
        {/* Summary */}
        <View
          style={{
            backgroundColor: colors.primaryLight,
            borderRadius: radius.xl,
            padding: spacing[4],
            gap: spacing[2],
          }}
        >
          <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.primary }}>
            Your data
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] }}>
            {[
              { label: 'Transactions', count: transactions.length },
              { label: 'Accounts',     count: accounts.length },
              { label: 'Debts',        count: debts.length },
              { label: 'Investments',  count: investments.length },
              { label: 'Wish List',    count: wishlist.length },
            ].map(({ label, count }) => (
              <View key={label}>
                <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.primary }}>
                  {count}
                </Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.primary + 'CC' }}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Export options */}
        <View style={{ gap: spacing[3] }}>
          {EXPORT_OPTIONS.map((opt) => {
            const isLoading = loading === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => handleExport(opt.id)}
                disabled={loading !== null}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[4],
                  backgroundColor: colors.surface,
                  borderRadius: radius.xl,
                  padding: spacing[4],
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: loading !== null && !isLoading ? 0.5 : 1,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.primaryLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={{ fontSize: 22 }}>{opt.icon}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary }}>
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
                    {opt.sublabel}
                  </Text>
                </View>
                <Text style={{ fontSize: fontSize.xl, color: colors.textTertiary }}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info */}
        <View
          style={{
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.lg,
            padding: spacing[4],
            gap: spacing[2],
          }}
        >
          <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary }}>
            🔒 Privacy note
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textTertiary, lineHeight: 20 }}>
            All your data is stored locally on your device. Exports are generated on-device and only shared when you explicitly choose to.
          </Text>
        </View>
      </View>
    </ScreenLayout>
  );
}
