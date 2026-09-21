import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  type ViewStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, fontSize } from '../../theme';

interface ScreenLayoutProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
  scrollable?: boolean;
  noPadding?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  headerTransparent?: boolean;
}

export function ScreenLayout({
  title,
  subtitle,
  showBack = false,
  rightAction,
  children,
  scrollable = true,
  noPadding = false,
  style,
  contentStyle,
  headerTransparent = false,
}: ScreenLayoutProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const headerBg = headerTransparent ? 'transparent' : colors.background;

  const Header = title ? (
    <View
      style={{
        paddingTop: insets.top + spacing[2],
        paddingBottom: spacing[3],
        paddingHorizontal: spacing[5],
        backgroundColor: headerBg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
      }}
    >
      {showBack && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18, color: colors.textPrimary, lineHeight: 22 }}>←</Text>
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: '700',
            color: colors.textPrimary,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightAction}
    </View>
  ) : null;

  const contentPadding = noPadding ? {} : { paddingHorizontal: spacing[5] };

  if (scrollable) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        {Header}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            contentPadding,
            { paddingBottom: insets.bottom + spacing[8] },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {Header}
      <View
        style={[
          { flex: 1 },
          contentPadding,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
