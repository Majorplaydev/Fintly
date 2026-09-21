import { palette } from '../theme';

export interface CategoryDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
}

export const CATEGORIES: CategoryDef[] = [
  // Expense categories
  { id: 'food',        label: 'Food & Drinks',    icon: '🍔', color: '#f97316', type: 'expense' },
  { id: 'transport',   label: 'Transport',         icon: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 'shopping',    label: 'Shopping',          icon: '🛍️', color: '#ec4899', type: 'expense' },
  { id: 'bills',       label: 'Bills & Utilities', icon: '⚡', color: '#f59e0b', type: 'expense' },
  { id: 'health',      label: 'Health',            icon: '🏥', color: '#ef4444', type: 'expense' },
  { id: 'education',   label: 'Education',         icon: '📚', color: '#8b5cf6', type: 'expense' },
  { id: 'entertainment', label: 'Entertainment',   icon: '🎬', color: '#06b6d4', type: 'expense' },
  { id: 'rent',        label: 'Rent & Housing',    icon: '🏠', color: '#64748b', type: 'expense' },
  { id: 'airtime',     label: 'Airtime & Data',    icon: '📱', color: '#10b981', type: 'expense' },
  { id: 'personal',    label: 'Personal Care',     icon: '💆', color: '#d946ef', type: 'expense' },
  { id: 'church',      label: 'Church / Tithe',    icon: '⛪', color: '#a78bfa', type: 'expense' },
  { id: 'charity',     label: 'Charity & Gifts',   icon: '🎁', color: '#fb923c', type: 'expense' },
  { id: 'business',    label: 'Business',          icon: '💼', color: '#0ea5e9', type: 'expense' },
  { id: 'misc_expense',label: 'Miscellaneous',     icon: '📦', color: '#94a3b8', type: 'expense' },

  // Income categories
  { id: 'salary',      label: 'Salary',            icon: '💰', color: '#10b981', type: 'income' },
  { id: 'freelance',   label: 'Freelance / Gigs',  icon: '💻', color: '#6366f1', type: 'income' },
  { id: 'gift_in',     label: 'Gift Received',     icon: '🎀', color: '#f43f5e', type: 'income' },
  { id: 'investment_return', label: 'Investment Return', icon: '📈', color: '#059669', type: 'income' },
  { id: 'refund',      label: 'Refund',            icon: '🔄', color: '#0284c7', type: 'income' },
  { id: 'misc_income', label: 'Other Income',      icon: '✨', color: '#84cc16', type: 'income' },

  // Both
  { id: 'savings',     label: 'Savings',           icon: '🏦', color: '#14b8a6', type: 'both' },
  { id: 'investment',  label: 'Investment',         icon: '📊', color: '#7c3aed', type: 'both' },
];

export function getCategoryById(id: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoriesByType(type: 'expense' | 'income'): CategoryDef[] {
  return CATEGORIES.filter((c) => c.type === type || c.type === 'both');
}

export const ACCOUNT_ICONS = ['🏦', '💳', '👛', '💵', '📱', '🐷', '🏧', '💎', '🌿', '⚡'];
export const ACCOUNT_TYPES = [
  { id: 'bank',       label: 'Bank Account', icon: '🏦' },
  { id: 'cash',       label: 'Cash',         icon: '💵' },
  { id: 'wallet',     label: 'Digital Wallet', icon: '📱' },
  { id: 'savings',    label: 'Savings',      icon: '🐷' },
  { id: 'investment', label: 'Investment',   icon: '📈' },
  { id: 'other',      label: 'Other',        icon: '💳' },
];
