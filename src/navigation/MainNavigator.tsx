import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { layout, radius, spacing } from '../theme';
import type { MainTabParamList, DashboardStackParamList, TransactionStackParamList, MoreStackParamList } from '../types';

// ── Screen imports ────────────────────────────────────────────────────────────
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AccountDetailScreen from '../screens/accounts/AccountDetailScreen';
import NetWorthHistoryScreen from '../screens/dashboard/NetWorthHistoryScreen';

import TransactionListScreen from '../screens/transactions/TransactionListScreen';
import TransactionDetailScreen from '../screens/transactions/TransactionDetailScreen';
import AddTransactionScreen from '../screens/transactions/AddTransactionScreen';

import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';

import MoreMenuScreen from '../screens/settings/MoreMenuScreen';
import AccountsScreen from '../screens/accounts/AccountsScreen';
import AddAccountScreen from '../screens/accounts/AddAccountScreen';
import IncomeSourcesScreen from '../screens/income/IncomeSourcesScreen';
import AddIncomeSourceScreen from '../screens/income/AddIncomeSourceScreen';
import BudgetsScreen from '../screens/budget/BudgetsScreen';
import AddBudgetScreen from '../screens/budget/AddBudgetScreen';
import DebtsScreen from '../screens/debt/DebtsScreen';
import AddDebtScreen from '../screens/debt/AddDebtScreen';
import DebtDetailScreen from '../screens/debt/DebtDetailScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import AddWishlistItemScreen from '../screens/wishlist/AddWishlistItemScreen';
import InvestmentsScreen from '../screens/investments/InvestmentsScreen';
import AddInvestmentScreen from '../screens/investments/AddInvestmentScreen';
import InvestmentDetailScreen from '../screens/investments/InvestmentDetailScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ExportDataScreen from '../screens/settings/ExportDataScreen';

// ── Add Transaction FAB placeholder screen ────────────────────────────────────
// The center tab is a FAB — we use a modal-style screen opened from it.

const Tab = createBottomTabNavigator<MainTabParamList>();
const DashboardStack = createStackNavigator<DashboardStackParamList>();
const TransactionStack = createStackNavigator<TransactionStackParamList>();
const MoreStack = createStackNavigator<MoreStackParamList>();

// ─── Sub-navigators ───────────────────────────────────────────────────────────

function DashboardStackNav() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome"     component={DashboardScreen} />
      <DashboardStack.Screen name="AccountDetail"     component={AccountDetailScreen} />
      <DashboardStack.Screen name="NetWorthHistory"   component={NetWorthHistoryScreen} />
    </DashboardStack.Navigator>
  );
}

function TransactionStackNav() {
  return (
    <TransactionStack.Navigator screenOptions={{ headerShown: false }}>
      <TransactionStack.Screen name="TransactionList"   component={TransactionListScreen} />
      <TransactionStack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <TransactionStack.Screen name="AddTransaction"    component={AddTransactionScreen} />
    </TransactionStack.Navigator>
  );
}

function MoreStackNav() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu"          component={MoreMenuScreen} />
      <MoreStack.Screen name="Accounts"          component={AccountsScreen} />
      <MoreStack.Screen name="AddAccount"        component={AddAccountScreen} />
      <MoreStack.Screen name="IncomeSources"     component={IncomeSourcesScreen} />
      <MoreStack.Screen name="AddIncomeSource"   component={AddIncomeSourceScreen} />
      <MoreStack.Screen name="Budgets"           component={BudgetsScreen} />
      <MoreStack.Screen name="AddBudget"         component={AddBudgetScreen} />
      <MoreStack.Screen name="Debts"             component={DebtsScreen} />
      <MoreStack.Screen name="AddDebt"           component={AddDebtScreen} />
      <MoreStack.Screen name="DebtDetail"        component={DebtDetailScreen} />
      <MoreStack.Screen name="Wishlist"          component={WishlistScreen} />
      <MoreStack.Screen name="AddWishlistItem"   component={AddWishlistItemScreen} />
      <MoreStack.Screen name="Investments"       component={InvestmentsScreen} />
      <MoreStack.Screen name="AddInvestment"     component={AddInvestmentScreen} />
      <MoreStack.Screen name="InvestmentDetail"  component={InvestmentDetailScreen} />
      <MoreStack.Screen name="Settings"          component={SettingsScreen} />
      <MoreStack.Screen name="ExportData"        component={ExportDataScreen} />
    </MoreStack.Navigator>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

function FintlyTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { colors } = theme;

  // Tab config: index, label, icon (emoji for now — easy to swap with vector icons)
  const tabs = [
    { key: 'Dashboard',    icon: '◎',  label: 'Home' },
    { key: 'Transactions', icon: '≡',  label: 'Log' },
    { key: 'Add',          icon: '+',  label: '',    isFab: true },
    { key: 'Analytics',    icon: '⌁',  label: 'Stats' },
    { key: 'More',         icon: '⊞',  label: 'More' },
  ];

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + 4,
          height: layout.tabBarHeight + insets.bottom,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const tab = tabs[index];
        const isFocused = state.index === index;
        const isFab = tab?.isFab;

        const onPress = () => {
          if (isFab) {
            // Navigate to AddTransaction modal
            navigation.navigate('Transactions', {
              screen: 'AddTransaction',
              params: {},
            });
            return;
          }
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isFab) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.fabWrapper}
              activeOpacity={0.85}
            >
              <View style={[styles.fab, { backgroundColor: colors.primary }]}>
                <View style={styles.fabInner}>
                  {/* Plus icon */}
                  <View style={[styles.fabLine, styles.fabLineH, { backgroundColor: colors.textOnPrimary }]} />
                  <View style={[styles.fabLine, styles.fabLineV, { backgroundColor: colors.textOnPrimary }]} />
                </View>
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={[
              styles.tabIconContainer,
              isFocused && { backgroundColor: colors.primaryLight },
            ]}>
              <TabIcon name={tab?.key ?? ''} focused={isFocused} color={isFocused ? colors.tabBarActive : colors.tabBarInactive} />
            </View>
            {tab?.label ? (
              <View style={{ marginTop: 2 }}>
                {/* label text as native Text inside the tab */}
                <TabLabel label={tab.label} focused={isFocused} color={isFocused ? colors.tabBarActive : colors.tabBarInactive} />
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Simple icon/label components to avoid importing Text outside RN context
import { Text } from 'react-native';

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    Dashboard: '⊙',
    Transactions: '☰',
    Analytics: '⌁',
    More: '⊞',
  };
  return (
    <Text style={{ fontSize: 20, color, lineHeight: 24 }}>
      {icons[name] ?? '•'}
    </Text>
  );
}

function TabLabel({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  return (
    <Text style={{ fontSize: 10, color, fontWeight: focused ? '600' : '400', letterSpacing: 0.3 }}>
      {label}
    </Text>
  );
}

// ─── Main Tab Navigator ───────────────────────────────────────────────────────

export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FintlyTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard"    component={DashboardStackNav} />
      <Tab.Screen name="Transactions" component={TransactionStackNav} />
      <Tab.Screen name="Add"          component={AddTransactionScreen} />
      <Tab.Screen name="Analytics"    component={AnalyticsScreen} />
      <Tab.Screen name="More"         component={MoreStackNav} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconContainer: {
    padding: 6,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabInner: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLine: {
    position: 'absolute',
    borderRadius: 2,
  },
  fabLineH: {
    width: 18,
    height: 2,
  },
  fabLineV: {
    width: 2,
    height: 18,
  },
});
