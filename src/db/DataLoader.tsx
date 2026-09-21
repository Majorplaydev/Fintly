// Loads all data from SQLite into Zustand store after DB is ready.
// Wraps the app with SQLiteProvider and triggers initial data load.

import React, { useEffect } from 'react';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useAppStore } from '../store/useAppStore';
import { migrateDatabase } from './migrations';
import {
  AccountRepo,
  IncomeSourceRepo,
  TransactionRepo,
  BudgetRepo,
  DebtRepo,
  WishlistRepo,
  InvestmentRepo,
  NetWorthRepo,
  SettingsRepo,
} from './repositories';
import { DB_NAME } from './schema';

// ─── Inner component: runs after SQLiteProvider is ready ──────────────────────

function DataBootstrapper({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const {
    setAccounts,
    setTransactions,
    setIncomeSources,
    setBudgets,
    setDebts,
    setWishlist,
    setInvestments,
    setNetWorthSnapshots,
    updateSettings,
    setLoading,
    setDbReady,
  } = useAppStore();

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);

      const [
        accounts,
        transactions,
        incomeSources,
        budgets,
        debts,
        wishlist,
        investments,
        netWorthSnapshots,
        savedSettings,
      ] = await Promise.all([
        AccountRepo.getAll(db),
        TransactionRepo.getAll(db),
        IncomeSourceRepo.getAll(db),
        BudgetRepo.getAll(db),
        DebtRepo.getAll(db),
        WishlistRepo.getAll(db),
        InvestmentRepo.getAll(db),
        NetWorthRepo.getAll(db),
        SettingsRepo.get(db),
      ]);

      setAccounts(accounts);
      setTransactions(transactions);
      setIncomeSources(incomeSources);
      setBudgets(budgets);
      setDebts(debts);
      setWishlist(wishlist);
      setInvestments(investments);
      setNetWorthSnapshots(netWorthSnapshots);

      if (Object.keys(savedSettings).length > 0) {
        updateSettings(savedSettings);
      }

      setDbReady(true);
    } catch (error) {
      console.error('[Fintly] Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  return <>{children}</>;
}

// ─── Public wrapper ───────────────────────────────────────────────────────────

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <SQLiteProvider
      databaseName={DB_NAME}
      onInit={migrateDatabase}
      useSuspense={false}
    >
      <DataBootstrapper>{children}</DataBootstrapper>
    </SQLiteProvider>
  );
}

// ─── Hook for direct DB access in screens ────────────────────────────────────

export { useSQLiteContext as useDB };
