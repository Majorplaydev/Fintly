import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppStore } from '../store/useAppStore';
import { MainNavigator } from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import type { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const onboardingCompleted = useAppStore((s) => s.settings.onboardingCompleted);

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
