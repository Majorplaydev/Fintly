import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../components/ui';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize, radius } from '../../theme';

const MENU_ITEMS = [
  { label: 'Accounts',       icon: '🏦', screen: 'Accounts' },
  { label: 'Income Sources', icon: '💰', screen: 'IncomeSources' },
  { label: 'Budgets',        icon: '📊', screen: 'Budgets' },
  { label: 'Debts',          icon: '🔴', screen: 'Debts' },
  { label: 'Wish List',      icon: '✨', screen: 'Wishlist' },
  { label: 'Investments',    icon: '📈', screen: 'Investments' },
  { label: 'Settings',       icon: '⚙️', screen: 'Settings' },
  { label: 'Export Data',    icon: '📤', screen: 'ExportData' },
];

export default function MoreMenuScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <ScreenLayout title="More">
      <View style={{ gap: spacing[2], paddingTop: spacing[2] }}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.screen}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: spacing[4],
              gap: spacing[3],
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 22 }}>{item.icon}</Text>
            <Text style={{ flex: 1, fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '500' }}>
              {item.label}
            </Text>
            <Text style={{ fontSize: fontSize.md, color: colors.textTertiary }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenLayout>
  );
}
