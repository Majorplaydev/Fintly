import { create } from 'zustand';
import type {
  Account,
  Transaction,
  IncomeSource,
  Budget,
  Debt,
  WishlistItem,
  Investment,
  NetWorthSnapshot,
  AppSettings,
} from '../types';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AppState {
  // Data
  accounts: Account[];
  transactions: Transaction[];
  incomeSources: IncomeSource[];
  budgets: Budget[];
  debts: Debt[];
  wishlist: WishlistItem[];
  investments: Investment[];
  netWorthSnapshots: NetWorthSnapshot[];
  settings: AppSettings;

  // UI state
  isLoading: boolean;
  isDbReady: boolean;

  // Actions — Accounts
  setAccounts: (accounts: Account[]) => void;
  upsertAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;

  // Actions — Transactions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;

  // Actions — Income Sources
  setIncomeSources: (sources: IncomeSource[]) => void;
  upsertIncomeSource: (source: IncomeSource) => void;
  deleteIncomeSource: (id: string) => void;

  // Actions — Budgets
  setBudgets: (budgets: Budget[]) => void;
  upsertBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;

  // Actions — Debts
  setDebts: (debts: Debt[]) => void;
  upsertDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;

  // Actions — Wishlist
  setWishlist: (items: WishlistItem[]) => void;
  upsertWishlistItem: (item: WishlistItem) => void;
  deleteWishlistItem: (id: string) => void;

  // Actions — Investments
  setInvestments: (investments: Investment[]) => void;
  upsertInvestment: (investment: Investment) => void;
  deleteInvestment: (id: string) => void;

  // Actions — Net Worth
  setNetWorthSnapshots: (snapshots: NetWorthSnapshot[]) => void;
  addNetWorthSnapshot: (snapshot: NetWorthSnapshot) => void;

  // Actions — Settings
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Actions — UI
  setLoading: (loading: boolean) => void;
  setDbReady: (ready: boolean) => void;
}

// ─── Default Settings ─────────────────────────────────────────────────────────

const defaultSettings: AppSettings = {
  baseCurrency: 'NGN',
  displayCurrencies: ['NGN', 'USD', 'GBP'],
  theme: 'system',
  notificationsEnabled: true,
  budgetAlerts: true,
  debtReminders: true,
  onboardingCompleted: false,
  pinEnabled: false,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  // Initial data
  accounts: [],
  transactions: [],
  incomeSources: [],
  budgets: [],
  debts: [],
  wishlist: [],
  investments: [],
  netWorthSnapshots: [],
  settings: defaultSettings,
  isLoading: true,
  isDbReady: false,

  // Accounts
  setAccounts: (accounts) => set({ accounts }),
  upsertAccount: (account) =>
    set((state) => {
      const exists = state.accounts.find((a) => a.id === account.id);
      return {
        accounts: exists
          ? state.accounts.map((a) => (a.id === account.id ? account : a))
          : [...state.accounts, account],
      };
    }),
  deleteAccount: (id) =>
    set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) })),

  // Transactions
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  updateTransaction: (transaction) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === transaction.id ? transaction : t
      ),
    })),
  deleteTransaction: (id) =>
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),

  // Income Sources
  setIncomeSources: (incomeSources) => set({ incomeSources }),
  upsertIncomeSource: (source) =>
    set((state) => {
      const exists = state.incomeSources.find((s) => s.id === source.id);
      return {
        incomeSources: exists
          ? state.incomeSources.map((s) => (s.id === source.id ? source : s))
          : [...state.incomeSources, source],
      };
    }),
  deleteIncomeSource: (id) =>
    set((state) => ({
      incomeSources: state.incomeSources.filter((s) => s.id !== id),
    })),

  // Budgets
  setBudgets: (budgets) => set({ budgets }),
  upsertBudget: (budget) =>
    set((state) => {
      const exists = state.budgets.find((b) => b.id === budget.id);
      return {
        budgets: exists
          ? state.budgets.map((b) => (b.id === budget.id ? budget : b))
          : [...state.budgets, budget],
      };
    }),
  deleteBudget: (id) =>
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),

  // Debts
  setDebts: (debts) => set({ debts }),
  upsertDebt: (debt) =>
    set((state) => {
      const exists = state.debts.find((d) => d.id === debt.id);
      return {
        debts: exists
          ? state.debts.map((d) => (d.id === debt.id ? debt : d))
          : [...state.debts, debt],
      };
    }),
  deleteDebt: (id) =>
    set((state) => ({ debts: state.debts.filter((d) => d.id !== id) })),

  // Wishlist
  setWishlist: (wishlist) => set({ wishlist }),
  upsertWishlistItem: (item) =>
    set((state) => {
      const exists = state.wishlist.find((w) => w.id === item.id);
      return {
        wishlist: exists
          ? state.wishlist.map((w) => (w.id === item.id ? item : w))
          : [...state.wishlist, item],
      };
    }),
  deleteWishlistItem: (id) =>
    set((state) => ({ wishlist: state.wishlist.filter((w) => w.id !== id) })),

  // Investments
  setInvestments: (investments) => set({ investments }),
  upsertInvestment: (investment) =>
    set((state) => {
      const exists = state.investments.find((i) => i.id === investment.id);
      return {
        investments: exists
          ? state.investments.map((i) => (i.id === investment.id ? investment : i))
          : [...state.investments, investment],
      };
    }),
  deleteInvestment: (id) =>
    set((state) => ({
      investments: state.investments.filter((i) => i.id !== id),
    })),

  // Net Worth
  setNetWorthSnapshots: (snapshots) => set({ netWorthSnapshots: snapshots }),
  addNetWorthSnapshot: (snapshot) =>
    set((state) => ({
      netWorthSnapshots: [...state.netWorthSnapshots, snapshot],
    })),

  // Settings
  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),

  // UI
  setLoading: (isLoading) => set({ isLoading }),
  setDbReady: (isDbReady) => set({ isDbReady }),
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectTotalAssets = (state: AppState) =>
  state.accounts.reduce((sum, a) => sum + a.balance, 0) +
  state.investments.reduce((sum, i) => sum + i.currentValue, 0);

export const selectTotalLiabilities = (state: AppState) =>
  state.debts
    .filter((d) => d.direction === 'owe' && !d.isSettled)
    .reduce((sum, d) => sum + (d.amount - d.amountPaid), 0);

export const selectNetWorth = (state: AppState) =>
  selectTotalAssets(state) - selectTotalLiabilities(state);

export const selectMonthlyIncome = (state: AppState) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return state.transactions
    .filter((t) => t.type === 'income' && t.date >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const selectMonthlyExpenses = (state: AppState) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return state.transactions
    .filter((t) => t.type === 'expense' && t.date >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);
};
