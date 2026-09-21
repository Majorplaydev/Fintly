import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator as createStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';
import { MainNavigator } from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import type { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

function SplashScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <Text style={{ fontSize: 64, lineHeight: 72 }}>💚</Text>
      <Text
        style={{
          fontSize: 28,
          fontWeight: '800',
          color: colors.textPrimary,
          letterSpacing: -0.5,
        }}
      >
        Fintly
      </Text>
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

export function RootNavigator() {
  const isDbReady  = useAppStore((s) => s.isDbReady);
  const isLoading  = useAppStore((s) => s.isLoading);
  const onboardingCompleted = useAppStore((s) => s.settings.onboardingCompleted);

  // Show Fintly splash while DB is initialising
  if (!isDbReady || isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!onboardingCompleted ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
