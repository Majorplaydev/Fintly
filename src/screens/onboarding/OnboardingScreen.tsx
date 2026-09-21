import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { useDB } from '../../db/DataLoader';
import { SettingsRepo, AccountRepo, IncomeSourceRepo } from '../../db/repositories';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius, palette } from '../../theme';
import { generateId } from '../../utils/id';
import { nowISO } from '../../utils/date';
import type { Account, IncomeSource, AllocationSlice } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Slide definitions ────────────────────────────────────────────────────────

interface Slide {
  id: string;
  type: 'intro' | 'feature' | 'setup_account' | 'setup_income' | 'ready';
  emoji: string;
  title: string;
  subtitle: string;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    id: 'welcome',
    type: 'intro',
    emoji: '💚',
    title: 'Welcome to Fintly',
    subtitle: 'Your personal finance OS. Track every naira. Plan every move. Grow.',
    accent: palette.emerald500,
  },
  {
    id: 'track',
    type: 'feature',
    emoji: '📒',
    title: 'Log everything',
    subtitle: 'Income, expenses, transfers, giving, pass-throughs — every naira accounted for, every time.',
    accent: palette.accent[1],
  },
  {
    id: 'allocate',
    type: 'feature',
    emoji: '🧮',
    title: 'Split your income',
    subtitle: 'Define how each income type splits — tithe, savings, spending, investments — and which account each slice goes to.',
    accent: palette.accent[4],
  },
  {
    id: 'plan',
    type: 'feature',
    emoji: '🎯',
    title: 'Plan purchases',
    subtitle: 'Add items to your wish list. Fintly watches your balance and tells you the right time to buy.',
    accent: palette.accent[3],
  },
  {
    id: 'debt',
    type: 'feature',
    emoji: '🤝',
    title: 'Debt & owing',
    subtitle: "Track what you owe and what's owed to you. Set reminders. Never forget. Stay clean.",
    accent: palette.accent[6],
  },
  {
    id: 'setup_account',
    type: 'setup_account',
    emoji: '🏦',
    title: 'Add your first account',
    subtitle: 'This is where your money lives. You can add more later.',
    accent: palette.emerald500,
  },
  {
    id: 'setup_income',
    type: 'setup_income',
    emoji: '💰',
    title: 'How do you earn?',
    subtitle: "Name your first income source. We'll help you split it.",
    accent: palette.accent[0],
  },
  {
    id: 'ready',
    type: 'ready',
    emoji: '🚀',
    title: "You're set!",
    subtitle: 'Fintly is ready. Start logging, start knowing, start growing.',
    accent: palette.emerald500,
  },
];

// ─── Dot indicator ────────────────────────────────────────────────────────────

function Dots({ total, current, accent }: { total: number; current: number; accent: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 6,
            width: i === current ? 20 : 6,
            borderRadius: 3,
            backgroundColor: i === current ? accent : accent + '40',
          }}
        />
      ))}
    </View>
  );
}

// ─── Account setup step ───────────────────────────────────────────────────────

const ACCOUNT_TYPES = [
  { id: 'bank',    label: 'Bank',    emoji: '🏦' },
  { id: 'cash',    label: 'Cash',    emoji: '💵' },
  { id: 'wallet',  label: 'Wallet',  emoji: '📱' },
  { id: 'savings', label: 'Savings', emoji: '🐷' },
];

function AccountSetupStep({
  onDone,
}: {
  onDone: (name: string, type: string, balance: string) => void;
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');

  return (
    <View style={{ gap: spacing[4] }}>
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        {ACCOUNT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setType(t.id)}
            style={{
              flex: 1,
              paddingVertical: spacing[3],
              borderRadius: radius.lg,
              backgroundColor: type === t.id ? colors.primary + '20' : colors.surfaceSecondary,
              borderWidth: type === t.id ? 1.5 : 0,
              borderColor: colors.primary,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
            <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: type === t.id ? colors.primary : colors.textSecondary }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground, paddingHorizontal: spacing[3], height: 48, justifyContent: 'center' }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Account name (e.g. GTBank)"
          placeholderTextColor={colors.placeholder}
          style={{ color: colors.textPrimary, fontSize: fontSize.base }}
        />
      </View>

      <View style={{ borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[3], height: 48 }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.base, fontWeight: '600', marginRight: spacing[2] }}>₦</Text>
        <TextInput
          value={balance}
          onChangeText={setBalance}
          placeholder="Current balance (optional)"
          placeholderTextColor={colors.placeholder}
          keyboardType="decimal-pad"
          style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.base }}
        />
      </View>

      <TouchableOpacity
        onPress={() => onDone(name, type, balance)}
        style={{
          backgroundColor: name.trim() ? colors.primary : colors.surfaceTertiary,
          borderRadius: radius.xl,
          height: 52,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        disabled={!name.trim()}
      >
        <Text style={{ color: name.trim() ? '#fff' : colors.textTertiary, fontWeight: '700', fontSize: fontSize.base }}>
          Continue →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Income source setup step ─────────────────────────────────────────────────

const INCOME_SUGGESTIONS = ['Gigs', 'Salary', 'Gifts', 'Freelance', 'Business', 'Allowance'];
const PRESET_SPLITS = [
  { label: '10-20-70', slices: [{ label: 'Tithe', pct: 10 }, { label: 'Savings', pct: 20 }, { label: 'Spending', pct: 70 }] },
  { label: '50-30-20', slices: [{ label: 'Needs', pct: 50 }, { label: 'Wants', pct: 30 }, { label: 'Savings', pct: 20 }] },
  { label: 'Custom',   slices: [] },
];

function IncomeSetupStep({ onDone, onSkip }: { onDone: (name: string) => void; onSkip: () => void }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [name, setName] = useState('');

  return (
    <View style={{ gap: spacing[4] }}>
      {/* Quick suggestions */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
        {INCOME_SUGGESTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setName(s)}
            style={{
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
              borderRadius: radius.full,
              backgroundColor: name === s ? colors.primary : colors.surfaceSecondary,
            }}
          >
            <Text style={{ fontSize: fontSize.sm, fontWeight: '500', color: name === s ? '#fff' : colors.textSecondary }}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.inputBorder, backgroundColor: colors.inputBackground, paddingHorizontal: spacing[3], height: 48, justifyContent: 'center' }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Or type a custom name"
          placeholderTextColor={colors.placeholder}
          style={{ color: colors.textPrimary, fontSize: fontSize.base }}
        />
      </View>

      <TouchableOpacity
        onPress={() => onDone(name)}
        style={{
          backgroundColor: name.trim() ? colors.primary : colors.surfaceTertiary,
          borderRadius: radius.xl,
          height: 52,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        disabled={!name.trim()}
      >
        <Text style={{ color: name.trim() ? '#fff' : colors.textTertiary, fontWeight: '700', fontSize: fontSize.base }}>
          Save & Continue →
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSkip}>
        <Text style={{ color: colors.textTertiary, fontSize: fontSize.sm, textAlign: 'center' }}>
          Skip for now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main onboarding screen ───────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors } = theme;
  const db = useDB();
  const { updateSettings, upsertAccount, upsertIncomeSource } = useAppStore();

  const [step, setStep] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const current = SLIDES[step];

  const goNext = () => {
    if (step < SLIDES.length - 1) {
      const next = step + 1;
      setStep(next);
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
    }
  };

  const goBack = () => {
    if (step > 0) {
      const prev = step - 1;
      setStep(prev);
      scrollRef.current?.scrollTo({ x: prev * SCREEN_WIDTH, animated: true });
    }
  };

  const handleAccountSetup = async (name: string, type: string, balance: string) => {
    if (!name.trim()) { goNext(); return; }
    const account: Account = {
      id:        generateId(),
      name:      name.trim(),
      type:      type as Account['type'],
      balance:   parseFloat(balance.replace(/,/g, '')) || 0,
      currency:  'NGN',
      color:     palette.emerald500,
      icon:      ACCOUNT_TYPES.find((t) => t.id === type)?.emoji ?? '🏦',
      isDefault: true,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await AccountRepo.upsert(db, account);
    upsertAccount(account);
    goNext();
  };

  const handleIncomeSetup = async (name: string) => {
    if (!name.trim()) { goNext(); return; }
    const source: IncomeSource = {
      id:          generateId(),
      name:        name.trim(),
      icon:        '💰',
      color:       palette.emerald500,
      createdAt:   nowISO(),
      allocations: [],
    };
    await IncomeSourceRepo.upsert(db, source);
    upsertIncomeSource(source);
    goNext();
  };

  const handleFinish = async () => {
    await SettingsRepo.set(db, 'onboardingCompleted', true);
    updateSettings({ onboardingCompleted: true });
  };

  const isSetupSlide = current.type === 'setup_account' || current.type === 'setup_income';
  const isReady = current.type === 'ready';
  const isIntroOrFeature = current.type === 'intro' || current.type === 'feature';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{ flex: 1 }}>
        {/* Slides */}
        <Animated.ScrollView
          ref={scrollRef as any}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          style={{ flex: 1 }}
        >
          {SLIDES.map((slide, index) => (
            <View key={slide.id} style={{ width: SCREEN_WIDTH, flex: 1 }}>
              <SlideContent
                slide={slide}
                isActive={step === index}
                onAccountDone={handleAccountSetup}
                onIncomeDone={handleIncomeSetup}
                onSkipIncome={goNext}
              />
            </View>
          ))}
        </Animated.ScrollView>

        {/* Bottom controls */}
        <View
          style={{
            paddingHorizontal: spacing[6],
            paddingBottom: insets.bottom + spacing[5],
            paddingTop: spacing[4],
            gap: spacing[4],
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Back */}
            <TouchableOpacity
              onPress={goBack}
              style={{
                opacity: step > 0 ? 1 : 0,
                paddingVertical: spacing[2],
                paddingHorizontal: spacing[3],
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.base }}>← Back</Text>
            </TouchableOpacity>

            {/* Dots */}
            <Dots total={SLIDES.length} current={step} accent={current.accent} />

            {/* Next / Skip (only for non-setup slides) */}
            {isIntroOrFeature && (
              <TouchableOpacity
                onPress={goNext}
                style={{
                  paddingVertical: spacing[2],
                  paddingHorizontal: spacing[3],
                }}
              >
                <Text style={{ color: current.accent, fontSize: fontSize.base, fontWeight: '700' }}>
                  Next →
                </Text>
              </TouchableOpacity>
            )}

            {/* Spacer for setup/ready slides so dots stay centered */}
            {(isSetupSlide || isReady) && <View style={{ width: 60 }} />}
          </View>

          {/* CTA for ready slide */}
          {isReady && (
            <TouchableOpacity
              onPress={handleFinish}
              activeOpacity={0.85}
              style={{
                backgroundColor: current.accent,
                borderRadius: radius.xl,
                height: 56,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: current.accent,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text style={{ color: '#fff', fontSize: fontSize.md, fontWeight: '800', letterSpacing: 0.5 }}>
                Open Fintly 💚
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Individual slide content ─────────────────────────────────────────────────

function SlideContent({
  slide,
  isActive,
  onAccountDone,
  onIncomeDone,
  onSkipIncome,
}: {
  slide: Slide;
  isActive: boolean;
  onAccountDone: (name: string, type: string, balance: string) => void;
  onIncomeDone:  (name: string) => void;
  onSkipIncome:  () => void;
}) {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: spacing[6],
        paddingTop: spacing[12],
        paddingBottom: spacing[4],
        gap: spacing[6],
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Emoji */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: slide.accent + '18',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 48, lineHeight: 56 }}>{slide.emoji}</Text>
      </View>

      {/* Text */}
      <View style={{ gap: spacing[3] }}>
        <Text
          style={{
            fontSize: fontSize['2xl'],
            fontWeight: '800',
            color: colors.textPrimary,
            letterSpacing: -0.8,
            lineHeight: fontSize['2xl'] * 1.25,
          }}
        >
          {slide.title}
        </Text>
        <Text
          style={{
            fontSize: fontSize.md,
            color: colors.textSecondary,
            lineHeight: fontSize.md * 1.6,
          }}
        >
          {slide.subtitle}
        </Text>
      </View>

      {/* Setup forms */}
      {slide.type === 'setup_account' && isActive && (
        <AccountSetupStep onDone={onAccountDone} />
      )}

      {slide.type === 'setup_income' && isActive && (
        <IncomeSetupStep onDone={onIncomeDone} onSkip={onSkipIncome} />
      )}

      {/* Feature highlight pills */}
      {slide.type === 'feature' && <FeatureHighlight id={slide.id} accent={slide.accent} />}
    </ScrollView>
  );
}

// ─── Feature highlight pills ──────────────────────────────────────────────────

const FEATURE_DETAILS: Record<string, { icon: string; text: string }[]> = {
  track: [
    { icon: '↓', text: 'Income from any source' },
    { icon: '↑', text: 'Expenses by category' },
    { icon: '⇄', text: 'Account transfers' },
    { icon: '♥', text: 'Giving & support' },
    { icon: '→', text: 'Pass-through money' },
  ],
  allocate: [
    { icon: '🙏', text: 'Tithe / giving' },
    { icon: '🐷', text: 'Savings account' },
    { icon: '🛒', text: 'Free spending' },
    { icon: '📈', text: 'Investments' },
  ],
  plan: [
    { icon: '✅', text: 'Track affordability live' },
    { icon: '📅', text: 'Set target dates' },
    { icon: '⭐', text: 'Priority ordering' },
  ],
  debt: [
    { icon: '📤', text: 'Money you owe' },
    { icon: '📥', text: 'Money owed to you' },
    { icon: '🔔', text: 'Due date reminders' },
    { icon: '📊', text: 'Payment tracking' },
  ],
};

function FeatureHighlight({ id, accent }: { id: string; accent: string }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const details = FEATURE_DETAILS[id] ?? [];

  if (!details.length) return null;

  return (
    <View style={{ gap: spacing[2] }}>
      {details.map((d, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[3],
            padding: spacing[3],
            borderRadius: radius.lg,
            backgroundColor: colors.surfaceSecondary,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.md,
              backgroundColor: accent + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 15, color: accent }}>{d.icon}</Text>
          </View>
          <Text style={{ fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '500' }}>
            {d.text}
          </Text>
        </View>
      ))}
    </View>
  );
}
