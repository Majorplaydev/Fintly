import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenLayout, Card, Divider } from '../../components/ui';
import { spacing, fontSize, radius } from '../../theme';
import { useDB } from '../../db/DataLoader';
import { SettingsRepo } from '../../db/repositories';
import { CURRENCIES } from '../../utils/currency';

// ─── Row components ───────────────────────────────────────────────────────────
function SettingRow({
  icon,
  label,
  sublabel,
  right,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const { theme } = useTheme();
  const { colors } = theme;

  const Inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[3.5],
        gap: spacing[3],
      }}
    >
      <Text style={{ fontSize: 20, width: 28 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSize.base, color: danger ? colors.danger : colors.textPrimary, fontWeight: '500' }}>
          {label}
        </Text>
        {sublabel && (
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 }}>
            {sublabel}
          </Text>
        )}
      </View>
      {right ?? (onPress ? (
        <Text style={{ fontSize: fontSize.lg, color: colors.textTertiary }}>›</Text>
      ) : null)}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Inner}
      </TouchableOpacity>
    );
  }
  return Inner;
}

function SectionHeader({ title }: { title: string }) {
  const { theme } = useTheme();
  const { colors } = theme;
  return (
    <Text
      style={{
        fontSize: fontSize.xs,
        color: colors.textTertiary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: spacing[5],
        marginBottom: spacing[2],
      }}
    >
      {title}
    </Text>
  );
}

// ─── Currency picker sheet ────────────────────────────────────────────────────
function CurrencyPicker({
  current,
  onSelect,
  onClose,
}: {
  current: string;
  onSelect: (c: string) => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const allCurrencies = Object.entries(CURRENCIES);

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius['2xl'],
        borderTopRightRadius: radius['2xl'],
        padding: spacing[5],
        maxHeight: '70%',
      }}
    >
      <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing[4] }}>
        Base Currency
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {allCurrencies.map(([code, info]) => (
          <TouchableOpacity
            key={code}
            onPress={() => { onSelect(code); onClose(); }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[3],
              paddingVertical: spacing[3],
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.primary, width: 36 }}>
              {info.symbol}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '500' }}>{info.name}</Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>{code}</Text>
            </View>
            {current === code && (
              <Text style={{ fontSize: fontSize.base, color: colors.primary }}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={onClose} style={{ alignItems: 'center', marginTop: spacing[4], paddingVertical: spacing[3] }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.base, fontWeight: '600' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { colors } = theme;
  const { settings, updateSettings } = useAppStore();
  const db = useDB();
  const navigation = useNavigation<any>();

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const handleThemeChange = async (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    updateSettings({ theme: mode });
    await SettingsRepo.set(db, 'theme', mode);
  };

  const toggleSetting = async (
    key: 'notificationsEnabled' | 'budgetAlerts' | 'debtReminders',
    val: boolean,
  ) => {
    updateSettings({ [key]: val });
    await SettingsRepo.set(db, key, val);
  };

  const handleCurrencyChange = async (currency: string) => {
    updateSettings({ baseCurrency: currency });
    await SettingsRepo.set(db, 'baseCurrency', currency);
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will take you back to the welcome screen on next launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            updateSettings({ onboardingCompleted: false });
            await SettingsRepo.set(db, 'onboardingCompleted', false);
          },
        },
      ],
    );
  };

  const ThemeOption = ({ mode, label, emoji }: { mode: 'light' | 'dark' | 'system'; label: string; emoji: string }) => (
    <TouchableOpacity
      onPress={() => handleThemeChange(mode)}
      style={{
        flex: 1,
        paddingVertical: spacing[3],
        borderRadius: radius.lg,
        backgroundColor: themeMode === mode ? colors.primary : colors.surfaceSecondary,
        alignItems: 'center',
        gap: spacing[1],
      }}
    >
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: themeMode === mode ? '#fff' : colors.textSecondary }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenLayout title="Settings" showBack scrollable={false} noPadding>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[10] }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Appearance ─────────────────────────────────── */}
          <SectionHeader title="Appearance" />
          <Card variant="outlined">
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <ThemeOption mode="light"  label="Light"  emoji="☀️" />
              <ThemeOption mode="dark"   label="Dark"   emoji="🌙" />
              <ThemeOption mode="system" label="System" emoji="⚙️" />
            </View>
          </Card>

          {/* ── Currency ───────────────────────────────────── */}
          <SectionHeader title="Currency" />
          <Card variant="outlined">
            <SettingRow
              icon={CURRENCIES[settings.baseCurrency]?.symbol ?? '₦'}
              label="Base Currency"
              sublabel={CURRENCIES[settings.baseCurrency]?.name ?? settings.baseCurrency}
              onPress={() => setShowCurrencyPicker(true)}
              right={
                <Text style={{ fontSize: fontSize.base, fontWeight: '700', color: colors.primary }}>
                  {settings.baseCurrency}
                </Text>
              }
            />
          </Card>

          {/* ── Notifications ──────────────────────────────── */}
          <SectionHeader title="Notifications" />
          <Card variant="outlined">
            <SettingRow
              icon="🔔"
              label="Enable Notifications"
              sublabel="Reminders, alerts, and nudges"
              right={
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={(v) => toggleSetting('notificationsEnabled', v)}
                  trackColor={{ true: colors.primary }}
                  thumbColor="#fff"
                />
              }
            />
            <Divider />
            <SettingRow
              icon="📊"
              label="Budget Alerts"
              sublabel="Notify when approaching limit"
              right={
                <Switch
                  value={settings.budgetAlerts}
                  onValueChange={(v) => toggleSetting('budgetAlerts', v)}
                  trackColor={{ true: colors.primary }}
                  thumbColor="#fff"
                />
              }
            />
            <Divider />
            <SettingRow
              icon="🤝"
              label="Debt Reminders"
              sublabel="Remind before due dates"
              right={
                <Switch
                  value={settings.debtReminders}
                  onValueChange={(v) => toggleSetting('debtReminders', v)}
                  trackColor={{ true: colors.primary }}
                  thumbColor="#fff"
                />
              }
            />
          </Card>

          {/* ── Data ───────────────────────────────────────── */}
          <SectionHeader title="Data" />
          <Card variant="outlined">
            <SettingRow
              icon="📤"
              label="Export Data"
              sublabel="Download CSV or JSON backup"
              onPress={() => navigation.navigate('ExportData')}
            />
            <Divider />
            <SettingRow
              icon="🔄"
              label="Reset Onboarding"
              sublabel="See the welcome flow again"
              onPress={handleResetOnboarding}
            />
          </Card>

          {/* ── About ──────────────────────────────────────── */}
          <SectionHeader title="About" />
          <Card variant="outlined">
            <SettingRow icon="💚" label="Fintly" sublabel="v1.0.0 — Your money, your rules." />
            <Divider />
            <SettingRow icon="🔒" label="Privacy" sublabel="All data stays on your device. No cloud, no server." />
          </Card>

          {/* Version */}
          <View style={{ alignItems: 'center', paddingVertical: spacing[6] }}>
            <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>
              Made with 💚 for you
            </Text>
          </View>
        </ScrollView>
      </ScreenLayout>

      {/* Currency picker overlay */}
      {showCurrencyPicker && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setShowCurrencyPicker(false)}
          />
          <CurrencyPicker
            current={settings.baseCurrency}
            onSelect={handleCurrencyChange}
            onClose={() => setShowCurrencyPicker(false)}
          />
        </View>
      )}
    </View>
  );
}
