// Fintly SQLite Schema — v3
// Uses expo-sqlite v57 API (openDatabaseAsync, SQLiteProvider, useSQLiteContext)

export const DB_NAME = 'fintly.db';
export const DB_VERSION = 3;

export const CREATE_TABLES_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ── Accounts ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id           TEXT PRIMARY KEY NOT NULL,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'bank',
  balance      REAL NOT NULL DEFAULT 0,
  currency     TEXT NOT NULL DEFAULT 'NGN',
  color        TEXT NOT NULL DEFAULT '#10b981',
  icon         TEXT NOT NULL DEFAULT '🏦',
  is_default   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

-- ── Income Sources ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS income_sources (
  id           TEXT PRIMARY KEY NOT NULL,
  name         TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT '💰',
  color        TEXT NOT NULL DEFAULT '#10b981',
  created_at   TEXT NOT NULL
);

-- ── Allocation Slices (belong to income sources) ──────────────────────────────
CREATE TABLE IF NOT EXISTS allocation_slices (
  id               TEXT PRIMARY KEY NOT NULL,
  income_source_id TEXT NOT NULL REFERENCES income_sources(id) ON DELETE CASCADE,
  label            TEXT NOT NULL,
  percentage       REAL NOT NULL,
  account_id       TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  color            TEXT NOT NULL DEFAULT '#6366f1',
  sort_order       INTEGER NOT NULL DEFAULT 0
);

-- ── Transactions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id                  TEXT PRIMARY KEY NOT NULL,
  type                TEXT NOT NULL,
  amount              REAL NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'NGN',
  description         TEXT NOT NULL DEFAULT '',
  category            TEXT NOT NULL DEFAULT 'misc_expense',
  tags                TEXT NOT NULL DEFAULT '[]',
  account_id          TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id       TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  income_source_id    TEXT REFERENCES income_sources(id) ON DELETE SET NULL,
  date                TEXT NOT NULL,
  note                TEXT,
  is_recurring        INTEGER NOT NULL DEFAULT 0,
  recurring_interval  TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_date       ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type       ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);

-- ── Budgets ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id           TEXT PRIMARY KEY NOT NULL,
  category     TEXT NOT NULL,
  limit_amount REAL NOT NULL,
  period       TEXT NOT NULL DEFAULT 'monthly',
  currency     TEXT NOT NULL DEFAULT 'NGN',
  alert_at     REAL NOT NULL DEFAULT 80,
  color        TEXT NOT NULL DEFAULT '#6366f1',
  created_at   TEXT NOT NULL
);

-- ── Debts ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debts (
  id                TEXT PRIMARY KEY NOT NULL,
  direction         TEXT NOT NULL,
  person_name       TEXT NOT NULL,
  amount            REAL NOT NULL,
  amount_paid       REAL NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'NGN',
  description       TEXT NOT NULL DEFAULT '',
  due_date          TEXT,
  reminder_enabled  INTEGER NOT NULL DEFAULT 0,
  reminder_days     INTEGER NOT NULL DEFAULT 3,
  is_settled        INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

-- ── Debt Payments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debt_payments (
  id         TEXT PRIMARY KEY NOT NULL,
  debt_id    TEXT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount     REAL NOT NULL,
  date       TEXT NOT NULL,
  note       TEXT
);

-- ── Wishlist ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id                TEXT PRIMARY KEY NOT NULL,
  name              TEXT NOT NULL,
  estimated_cost    REAL NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'NGN',
  priority          TEXT NOT NULL DEFAULT 'medium',
  status            TEXT NOT NULL DEFAULT 'pending',
  target_date       TEXT,
  note              TEXT,
  image_url         TEXT,
  linked_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

-- ── Investments ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investments (
  id             TEXT PRIMARY KEY NOT NULL,
  name           TEXT NOT NULL,
  platform       TEXT NOT NULL DEFAULT '',
  initial_amount REAL NOT NULL,
  current_value  REAL NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'NGN',
  start_date     TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'active',
  icon           TEXT NOT NULL DEFAULT '📈',
  color          TEXT NOT NULL DEFAULT '#7c3aed',
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

-- ── Investment Updates ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investment_updates (
  id            TEXT PRIMARY KEY NOT NULL,
  investment_id TEXT NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  value         REAL NOT NULL,
  date          TEXT NOT NULL,
  note          TEXT
);

-- ── Net Worth Snapshots ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id                TEXT PRIMARY KEY NOT NULL,
  date              TEXT NOT NULL,
  total_assets      REAL NOT NULL,
  total_liabilities REAL NOT NULL,
  net_worth         REAL NOT NULL
);

-- ── Settings (single row KV store) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;
