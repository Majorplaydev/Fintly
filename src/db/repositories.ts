// Fintly data access layer — all DB reads/writes go through here.
// Uses expo-sqlite v57 async API.

import type { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '../utils/id';
import { nowISO } from '../utils/date';
import type {
  Account,
  Transaction,
  IncomeSource,
  AllocationSlice,
  Budget,
  Debt,
  DebtPayment,
  WishlistItem,
  Investment,
  InvestmentUpdate,
  NetWorthSnapshot,
  AppSettings,
} from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseJSON<T>(str: string, fallback: T): T {
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const AccountRepo = {
  async getAll(db: SQLiteDatabase): Promise<Account[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM accounts ORDER BY is_default DESC, name ASC');
    return rows.map(rowToAccount);
  },

  async upsert(db: SQLiteDatabase, account: Account): Promise<void> {
    await db.runAsync(
      `INSERT INTO accounts (id, name, type, balance, currency, color, icon, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name, type=excluded.type, balance=excluded.balance,
         currency=excluded.currency, color=excluded.color, icon=excluded.icon,
         is_default=excluded.is_default, updated_at=excluded.updated_at`,
      account.id, account.name, account.type, account.balance, account.currency,
      account.color, account.icon, account.isDefault ? 1 : 0,
      account.createdAt, account.updatedAt
    );
  },

  async updateBalance(db: SQLiteDatabase, id: string, newBalance: number): Promise<void> {
    await db.runAsync(
      'UPDATE accounts SET balance=?, updated_at=? WHERE id=?',
      newBalance, nowISO(), id
    );
  },

  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM accounts WHERE id=?', id);
  },
};

function rowToAccount(row: any): Account {
  return {
    id:        row.id,
    name:      row.name,
    type:      row.type,
    balance:   row.balance,
    currency:  row.currency,
    color:     row.color,
    icon:      row.icon,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Income Sources ───────────────────────────────────────────────────────────

export const IncomeSourceRepo = {
  async getAll(db: SQLiteDatabase): Promise<IncomeSource[]> {
    const sources = await db.getAllAsync<any>('SELECT * FROM income_sources ORDER BY created_at ASC');
    const allSlices = await db.getAllAsync<any>('SELECT * FROM allocation_slices ORDER BY sort_order ASC');

    return sources.map((s: any) => ({
      id:          s.id,
      name:        s.name,
      icon:        s.icon,
      color:       s.color,
      createdAt:   s.created_at,
      allocations: allSlices
        .filter((sl: any) => sl.income_source_id === s.id)
        .map(rowToSlice),
    }));
  },

  async upsert(db: SQLiteDatabase, source: IncomeSource): Promise<void> {
    await db.runAsync(
      `INSERT INTO income_sources (id, name, icon, color, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, icon=excluded.icon, color=excluded.color`,
      source.id, source.name, source.icon, source.color, source.createdAt
    );

    // Replace all slices for this source
    await db.runAsync('DELETE FROM allocation_slices WHERE income_source_id=?', source.id);
    for (let i = 0; i < source.allocations.length; i++) {
      const sl = source.allocations[i];
      await db.runAsync(
        `INSERT INTO allocation_slices (id, income_source_id, label, percentage, account_id, color, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        sl.id, source.id, sl.label, sl.percentage, sl.accountId ?? null, sl.color, i
      );
    }
  },

  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM income_sources WHERE id=?', id);
  },
};

function rowToSlice(row: any): AllocationSlice {
  return {
    id:             row.id,
    incomeSourceId: row.income_source_id,
    label:          row.label,
    percentage:     row.percentage,
    accountId:      row.account_id,
    color:          row.color,
  };
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export const TransactionRepo = {
  async getAll(db: SQLiteDatabase, limit = 500): Promise<Transaction[]> {
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM transactions ORDER BY date DESC LIMIT ?', limit
    );
    return rows.map(rowToTransaction);
  },

  async getByDateRange(db: SQLiteDatabase, start: string, end: string): Promise<Transaction[]> {
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC',
      start, end
    );
    return rows.map(rowToTransaction);
  },

  async upsert(db: SQLiteDatabase, tx: Transaction): Promise<void> {
    await db.runAsync(
      `INSERT INTO transactions
         (id, type, amount, currency, description, category, tags, account_id,
          to_account_id, income_source_id, date, note, is_recurring, recurring_interval,
          created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         type=excluded.type, amount=excluded.amount, currency=excluded.currency,
         description=excluded.description, category=excluded.category, tags=excluded.tags,
         account_id=excluded.account_id, to_account_id=excluded.to_account_id,
         income_source_id=excluded.income_source_id, date=excluded.date, note=excluded.note,
         is_recurring=excluded.is_recurring, recurring_interval=excluded.recurring_interval,
         updated_at=excluded.updated_at`,
      tx.id, tx.type, tx.amount, tx.currency, tx.description, tx.category,
      JSON.stringify(tx.tags), tx.accountId, tx.toAccountId ?? null,
      tx.incomeSourceId ?? null, tx.date, tx.note ?? null,
      tx.isRecurring ? 1 : 0, tx.recurringInterval ?? null,
      tx.createdAt, tx.updatedAt
    );
  },

  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM transactions WHERE id=?', id);
  },
};

function rowToTransaction(row: any): Transaction {
  return {
    id:                row.id,
    type:              row.type,
    amount:            row.amount,
    currency:          row.currency,
    description:       row.description,
    category:          row.category,
    tags:              parseJSON(row.tags, []),
    accountId:         row.account_id,
    toAccountId:       row.to_account_id ?? undefined,
    incomeSourceId:    row.income_source_id ?? undefined,
    date:              row.date,
    note:              row.note ?? undefined,
    isRecurring:       row.is_recurring === 1,
    recurringInterval: row.recurring_interval ?? undefined,
    createdAt:         row.created_at,
    updatedAt:         row.updated_at,
  };
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export const BudgetRepo = {
  async getAll(db: SQLiteDatabase): Promise<Budget[]> {
    const rows = await db.getAllAsync<any>('SELECT * FROM budgets ORDER BY category ASC');
    return rows.map(rowToBudget);
  },

  async upsert(db: SQLiteDatabase, budget: Budget): Promise<void> {
    await db.runAsync(
      `INSERT INTO budgets (id, category, limit_amount, period, currency, alert_at, color, created_at)
       VALUES (?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         category=excluded.category, limit_amount=excluded.limit_amount,
         period=excluded.period, alert_at=excluded.alert_at, color=excluded.color`,
      budget.id, budget.category, budget.limit, budget.period,
      budget.currency, budget.alertAt, budget.color, budget.createdAt
    );
  },

  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM budgets WHERE id=?', id);
  },
};

function rowToBudget(row: any): Budget {
  return {
    id:         row.id,
    category:   row.category,
    limit:      row.limit_amount,
    period:     row.period,
    spent:      0,   // computed in-memory from transactions
    currency:   row.currency,
    alertAt:    row.alert_at,
    color:      row.color,
    createdAt:  row.created_at,
  };
}

// ─── Debts ────────────────────────────────────────────────────────────────────

export const DebtRepo = {
  async getAll(db: SQLiteDatabase): Promise<Debt[]> {
    const debts = await db.getAllAsync<any>('SELECT * FROM debts ORDER BY created_at DESC');
    const allPayments = await db.getAllAsync<any>('SELECT * FROM debt_payments ORDER BY date ASC');

    return debts.map((d: any) => ({
      id:              d.id,
      direction:       d.direction,
      personName:      d.person_name,
      amount:          d.amount,
      amountPaid:      d.amount_paid,
      currency:        d.currency,
      description:     d.description,
      dueDate:         d.due_date ?? undefined,
      reminderEnabled: d.reminder_enabled === 1,
      reminderDays:    d.reminder_days,
      isSettled:       d.is_settled === 1,
      payments:        allPayments
                        .filter((p: any) => p.debt_id === d.id)
                        .map((p: any) => ({
                          id:     p.id,
                          debtId: p.debt_id,
                          amount: p.amount,
                          date:   p.date,
                          note:   p.note ?? undefined,
                        })),
      createdAt:  d.created_at,
      updatedAt:  d.updated_at,
    }));
  },

  async upsert(db: SQLiteDatabase, debt: Debt): Promise<void> {
    await db.runAsync(
      `INSERT INTO debts
         (id, direction, person_name, amount, amount_paid, currency, description,
          due_date, reminder_enabled, reminder_days, is_settled, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         direction=excluded.direction, person_name=excluded.person_name,
         amount=excluded.amount, amount_paid=excluded.amount_paid,
         description=excluded.description, due_date=excluded.due_date,
         reminder_enabled=excluded.reminder_enabled, reminder_days=excluded.reminder_days,
         is_settled=excluded.is_settled, updated_at=excluded.updated_at`,
      debt.id, debt.direction, debt.personName, debt.amount, debt.amountPaid,
      debt.currency, debt.description, debt.dueDate ?? null,
      debt.reminderEnabled ? 1 : 0, debt.reminderDays, debt.isSettled ? 1 : 0,
      debt.createdAt, debt.updatedAt
    );
  },

  async addPayment(db: SQLiteDatabase, payment: DebtPayment): Promise<void> {
    await db.runAsync(
      'INSERT INTO debt_payments (id, debt_id, amount, date, note) VALUES (?,?,?,?,?)',
      payment.id, payment.debtId, payment.amount, payment.date, payment.note ?? null
    );
    // Update amount_paid on the debt
    await db.runAsync(
      `UPDATE debts SET
         amount_paid = (SELECT COALESCE(SUM(amount),0) FROM debt_payments WHERE debt_id=?),
         updated_at = ?
       WHERE id=?`,
      payment.debtId, nowISO(), payment.debtId
    );
    // Auto-settle if fully paid
    await db.runAsync(
      `UPDATE debts SET is_settled=1, updated_at=? WHERE id=? AND amount_paid >= amount`,
      nowISO(), payment.debtId
    );
  },

  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM debts WHERE id=?', id);
  },
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const WishlistRepo = {
  async getAll(db: SQLiteDatabase): Promise<WishlistItem[]> {
    const rows = await db.getAllAsync<any>(
      "SELECT * FROM wishlist ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at DESC"
    );
    return rows.map((r: any) => ({
      id:              r.id,
      name:            r.name,
      estimatedCost:   r.estimated_cost,
      currency:        r.currency,
      priority:        r.priority,
      status:          r.status,
      targetDate:      r.target_date ?? undefined,
      note:            r.note ?? undefined,
      imageUrl:        r.image_url ?? undefined,
      linkedAccountId: r.linked_account_id ?? undefined,
      createdAt:       r.created_at,
      updatedAt:       r.updated_at,
    }));
  },

  async upsert(db: SQLiteDatabase, item: WishlistItem): Promise<void> {
    await db.runAsync(
      `INSERT INTO wishlist
         (id, name, estimated_cost, currency, priority, status, target_date, note,
          image_url, linked_account_id, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name, estimated_cost=excluded.estimated_cost,
         priority=excluded.priority, status=excluded.status,
         target_date=excluded.target_date, note=excluded.note,
         image_url=excluded.image_url, linked_account_id=excluded.linked_account_id,
         updated_at=excluded.updated_at`,
      item.id, item.name, item.estimatedCost, item.currency, item.priority,
      item.status, item.targetDate ?? null, item.note ?? null,
      item.imageUrl ?? null, item.linkedAccountId ?? null,
      item.createdAt, item.updatedAt
    );
  },

  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM wishlist WHERE id=?', id);
  },
};

// ─── Investments ──────────────────────────────────────────────────────────────

export const InvestmentRepo = {
  async getAll(db: SQLiteDatabase): Promise<Investment[]> {
    const investments = await db.getAllAsync<any>('SELECT * FROM investments ORDER BY created_at DESC');
    const allUpdates = await db.getAllAsync<any>('SELECT * FROM investment_updates ORDER BY date ASC');

    return investments.map((inv: any) => ({
      id:            inv.id,
      name:          inv.name,
      platform:      inv.platform,
      initialAmount: inv.initial_amount,
      currentValue:  inv.current_value,
      currency:      inv.currency,
      startDate:     inv.start_date,
      status:        inv.status,
      icon:          inv.icon,
      color:         inv.color,
      createdAt:     inv.created_at,
      updatedAt:     inv.updated_at,
      updates:       allUpdates
                      .filter((u: any) => u.investment_id === inv.id)
                      .map((u: any) => ({
                        id:           u.id,
                        investmentId: u.investment_id,
                        value:        u.value,
                        date:         u.date,
                        note:         u.note ?? undefined,
                      })),
    }));
  },

  async upsert(db: SQLiteDatabase, inv: Investment): Promise<void> {
    await db.runAsync(
      `INSERT INTO investments
         (id, name, platform, initial_amount, current_value, currency,
          start_date, status, icon, color, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name, platform=excluded.platform,
         current_value=excluded.current_value, status=excluded.status,
         icon=excluded.icon, color=excluded.color, updated_at=excluded.updated_at`,
      inv.id, inv.name, inv.platform, inv.initialAmount, inv.currentValue,
      inv.currency, inv.startDate, inv.status, inv.icon, inv.color,
      inv.createdAt, inv.updatedAt
    );
  },

  async addUpdate(db: SQLiteDatabase, update: InvestmentUpdate): Promise<void> {
    await db.runAsync(
      'INSERT INTO investment_updates (id, investment_id, value, date, note) VALUES (?,?,?,?,?)',
      update.id, update.investmentId, update.value, update.date, update.note ?? null
    );
    // Update current_value on the investment
    await db.runAsync(
      'UPDATE investments SET current_value=?, updated_at=? WHERE id=?',
      update.value, nowISO(), update.investmentId
    );
  },

  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM investments WHERE id=?', id);
  },
};

// ─── Net Worth Snapshots ──────────────────────────────────────────────────────

export const NetWorthRepo = {
  async getAll(db: SQLiteDatabase): Promise<NetWorthSnapshot[]> {
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM net_worth_snapshots ORDER BY date ASC'
    );
    return rows.map((r: any) => ({
      id:               r.id,
      date:             r.date,
      totalAssets:      r.total_assets,
      totalLiabilities: r.total_liabilities,
      netWorth:         r.net_worth,
    }));
  },

  async add(db: SQLiteDatabase, snapshot: NetWorthSnapshot): Promise<void> {
    await db.runAsync(
      'INSERT INTO net_worth_snapshots (id, date, total_assets, total_liabilities, net_worth) VALUES (?,?,?,?,?)',
      snapshot.id, snapshot.date, snapshot.totalAssets, snapshot.totalLiabilities, snapshot.netWorth
    );
  },
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const SettingsRepo = {
  async get(db: SQLiteDatabase): Promise<Partial<AppSettings>> {
    const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT * FROM settings');
    const result: Record<string, any> = {};
    for (const row of rows) {
      try { result[row.key] = JSON.parse(row.value); }
      catch { result[row.key] = row.value; }
    }
    return result as Partial<AppSettings>;
  },

  async set(db: SQLiteDatabase, key: keyof AppSettings, value: any): Promise<void> {
    await db.runAsync(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
      key, JSON.stringify(value)
    );
  },

  async setAll(db: SQLiteDatabase, settings: Partial<AppSettings>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await SettingsRepo.set(db, key as keyof AppSettings, value);
    }
  },
};
