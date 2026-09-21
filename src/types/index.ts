// ─── Core Domain Types ────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense' | 'transfer' | 'passthrough' | 'giving';

export type DebtDirection = 'owe' | 'owed_to_me';

export type InvestmentStatus = 'active' | 'closed';

export type WishlistStatus = 'pending' | 'affordable' | 'purchased';

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

// ─── Account ─────────────────────────────────────────────────────────────────

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'wallet' | 'savings' | 'investment' | 'other';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Income Source ────────────────────────────────────────────────────────────

export interface AllocationSlice {
  id: string;
  incomeSourceId: string;
  label: string;           // e.g. "Tithe", "Savings", "Free Spending"
  percentage: number;      // 0–100
  accountId: string | null; // which account this slice goes to
  color: string;
}

export interface IncomeSource {
  id: string;
  name: string;            // e.g. "Gigs", "Gifts", "Allowance"
  icon: string;
  color: string;
  allocations: AllocationSlice[];
  createdAt: string;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  category: string;
  tags: string[];           // stored as JSON string in DB
  accountId: string;
  toAccountId?: string;     // for transfers
  incomeSourceId?: string;  // for income transactions
  date: string;             // ISO string
  note?: string;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: BudgetPeriod;
  spent: number;            // computed
  currency: string;
  alertAt: number;          // percentage (e.g. 80 = alert at 80% spent)
  color: string;
  createdAt: string;
}

// ─── Debt ────────────────────────────────────────────────────────────────────

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  direction: DebtDirection;
  personName: string;
  amount: number;
  amountPaid: number;
  currency: string;
  description: string;
  dueDate?: string;
  reminderEnabled: boolean;
  reminderDays: number;     // days before due date
  isSettled: boolean;
  payments: DebtPayment[];
  createdAt: string;
  updatedAt: string;
}

// ─── Wishlist ────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  name: string;
  estimatedCost: number;
  currency: string;
  priority: 'low' | 'medium' | 'high';
  status: WishlistStatus;
  targetDate?: string;
  note?: string;
  imageUrl?: string;
  linkedAccountId?: string; // track savings toward this
  createdAt: string;
  updatedAt: string;
}

// ─── Investment ──────────────────────────────────────────────────────────────

export interface InvestmentUpdate {
  id: string;
  investmentId: string;
  value: number;
  date: string;
  note?: string;
}

export interface Investment {
  id: string;
  name: string;
  platform: string;         // e.g. "Piggyvest", "Stocks", "Crypto"
  initialAmount: number;
  currentValue: number;
  currency: string;
  startDate: string;
  status: InvestmentStatus;
  icon: string;
  color: string;
  updates: InvestmentUpdate[];
  createdAt: string;
  updatedAt: string;
}

// ─── Net Worth Snapshot ───────────────────────────────────────────────────────

export interface NetWorthSnapshot {
  id: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  baseCurrency: string;
  displayCurrencies: string[];
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  budgetAlerts: boolean;
  debtReminders: boolean;
  onboardingCompleted: boolean;
  pinEnabled: boolean;
  lastBackup?: string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Add: undefined;
  Analytics: undefined;
  More: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  AccountDetail: { accountId: string };
  NetWorthHistory: undefined;
};

export type TransactionStackParamList = {
  TransactionList: undefined;
  TransactionDetail: { transactionId: string };
  AddTransaction: { type?: TransactionType };
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Accounts: undefined;
  AddAccount: { accountId?: string };
  IncomeSources: undefined;
  AddIncomeSource: { sourceId?: string };
  Budgets: undefined;
  AddBudget: { budgetId?: string };
  Debts: undefined;
  AddDebt: { debtId?: string };
  DebtDetail: { debtId: string };
  Wishlist: undefined;
  AddWishlistItem: { itemId?: string };
  Investments: undefined;
  AddInvestment: { investmentId?: string };
  InvestmentDetail: { investmentId: string };
  Settings: undefined;
  ExportData: undefined;
};
