# Fintly 💚

> Your personal finance OS. Track every money. Plan every move. Grow.

Fintly is a fully offline, manual-first personal finance app built for people with dynamic, irregular income who want total clarity over their money. No bank connections, no subscriptions, no cloud — just your data, on your device.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Building an APK](#building-an-apk)
- [Architecture](#architecture)
- [Screen Reference](#screen-reference)
- [Database Schema](#database-schema)
- [Currency Support](#currency-support)
- [Contributing / Extending](#contributing--extending)

---

## Features

### Transaction Logging
Log every movement of money across 5 types:
- **Expense** — money spent
- **Income** — money received
- **Transfer** — between your own accounts
- **Giving** — tithe, charity, gifts out
- **Pass-through** — money that passed through your account but isn't yours (e.g. sent on behalf of someone)

Each transaction supports: description, category, tags, note, account assignment, and recurring flag.

### Income Sources & Allocation
Define where your income comes from (Gigs, Salary, Gifts, Freelance, etc.) and set custom split rules per source. Each slice of the split is assigned a label (Tithe, Savings, Spending) and linked to a specific account. When you log income and pick a source, Fintly shows you exactly how much goes where before you confirm.

### Accounts
Track all your money containers: bank accounts, cash, digital wallets, savings, investment accounts. Each account has a name, type, icon, color, and running balance. Every transaction updates the balance automatically. You can view per-account history and monthly in/out summaries.

### Budgets
Set spending limits per category with configurable periods (weekly, monthly, yearly). Set an alert threshold (e.g. warn at 80%) and Fintly will surface a warning on the dashboard when you're close. The budget screen shows live progress bars with actual spend vs limit.

### Debt Tracker
Two directions: money you owe and money owed to you. Each debt tracks:
- Total amount and how much has been paid
- Due date with overdue detection
- Payment history with notes
- Reminder toggle (notifies before due date)
- Auto-settles when fully paid

### Wish List
Add items you want to buy with an estimated cost and priority (low/medium/high). Fintly compares the item cost against your total asset value in real time and tells you whether you can currently afford it. Set target dates and the app tells you how many days away it is.

### Investments
Manually track investment portfolios across any platform (PiggyVest, Bamboo, crypto, real estate, etc.). Log the initial amount, then update the current value over time. Track gain/loss percentage and total portfolio value.

### Analytics
Detailed reports with period selector (week, month, 3m, 6m, year):
- Income vs Expenses grouped bar chart (6-month view)
- Spending breakdown by category with percentage bars
- Income breakdown by category
- Savings rate calculation
- Budget progress strip
- Debt and investment snapshot

### Net Worth
Assets (account balances + investments) minus liabilities (outstanding debts). Auto-snapshots your net worth monthly so you can see your growth over time. History bar chart, delta vs previous month, full asset and liability breakdown.

### Export
Export your data at any time:
- **Transactions CSV** — spreadsheet-ready, all fields
- **Full Report CSV** — transactions + accounts + budgets + debts + investments
- **Full Backup JSON** — complete structured export for backup or migration

### Settings
- Light / Dark / System theme
- Base currency (9 currencies supported, converts for display)
- Notification toggles (budget alerts, debt reminders)
- Export data
- Reset onboarding

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | React Native + Expo | SDK 57, RN 0.86 |
| Language | TypeScript | 6.0 |
| Navigation | React Navigation | v7 |
| Database | expo-sqlite | 57.0.3 |
| State | Zustand | 5.0 |
| Animations | react-native-reanimated | 4.5.1 |
| Gestures | react-native-gesture-handler | 3.3 |
| File I/O | expo-file-system | 57 |
| Sharing | expo-sharing | 57 |
| Notifications | expo-notifications | 57 |
| Date utils | date-fns | 4.4 |

No external API calls. No analytics. No tracking. Everything runs on-device.

---

## Project Structure

```
Fintly/
├── App.tsx                        # Root component — providers stack
├── app.json                       # Expo config (plugins, android package, etc.)
├── index.ts                       # Entry point
├── src/
│   ├── types/
│   │   └── index.ts               # All TypeScript interfaces (Account, Transaction, Debt, etc.)
│   │
│   ├── theme/
│   │   ├── colors.ts              # Light + dark color tokens
│   │   ├── typography.ts          # Font families, sizes, text style presets
│   │   ├── spacing.ts             # Spacing scale, border radius, shadows, layout constants
│   │   ├── index.ts               # Theme interface, lightTheme, darkTheme exports
│   │   └── ThemeContext.tsx       # useTheme hook, ThemeProvider
│   │
│   ├── store/
│   │   └── useAppStore.ts         # Zustand store — all app state + selectors
│   │
│   ├── db/
│   │   ├── schema.ts              # CREATE TABLE statements, DB_VERSION
│   │   ├── migrations.ts          # Version-based migration runner
│   │   ├── repositories.ts        # Data access layer — all DB reads/writes
│   │   └── DataLoader.tsx         # SQLiteProvider wrapper + initial data load
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx      # Onboarding vs Main routing
│   │   ├── OnboardingNavigator.tsx
│   │   └── MainNavigator.tsx      # Bottom tab bar + all stack navigators
│   │
│   ├── utils/
│   │   ├── currency.ts            # formatCurrency, convertCurrency, CURRENCIES map
│   │   ├── date.ts                # formatDate, getMonthRange, daysUntil, etc.
│   │   ├── categories.ts          # CATEGORIES list with icons + colors
│   │   └── id.ts                  # generateId()
│   │
│   ├── components/
│   │   └── ui/
│   │       ├── index.ts           # Barrel export
│   │       ├── Text.tsx           # FText with variant + color props
│   │       ├── Card.tsx           # Card with default/outlined/flat variants
│   │       ├── Button.tsx         # Button with 5 variants + loading state
│   │       ├── Input.tsx          # Input + CurrencyInput
│   │       ├── ScreenLayout.tsx   # Scrollable/static screen wrapper with header
│   │       ├── AmountDisplay.tsx  # Styled currency amount with hero/large/medium/small sizes
│   │       ├── ProgressBar.tsx    # Auto-colors at 70%/90%
│   │       ├── Badge.tsx          # Colored pill label
│   │       ├── Divider.tsx        # Horizontal rule
│   │       └── EmptyState.tsx     # Empty state with emoji, title, CTA
│   │
│   └── screens/
│       ├── onboarding/
│       │   └── OnboardingScreen.tsx       # 8-slide animated welcome flow
│       ├── dashboard/
│       │   ├── DashboardScreen.tsx        # Home — net worth hero, quick actions, recent tx
│       │   └── NetWorthHistoryScreen.tsx  # NW chart, asset breakdown, snapshot history
│       ├── transactions/
│       │   ├── TransactionListScreen.tsx  # Filtered, searchable transaction log
│       │   ├── TransactionDetailScreen.tsx
│       │   └── AddTransactionScreen.tsx   # Custom numpad, 2-step, allocation preview
│       ├── accounts/
│       │   ├── AccountsScreen.tsx
│       │   ├── AddAccountScreen.tsx
│       │   └── AccountDetailScreen.tsx
│       ├── income/
│       │   ├── IncomeSourcesScreen.tsx
│       │   └── AddIncomeSourceScreen.tsx  # Dynamic allocation slices
│       ├── budget/
│       │   ├── BudgetsScreen.tsx
│       │   └── AddBudgetScreen.tsx
│       ├── debt/
│       │   ├── DebtsScreen.tsx
│       │   ├── AddDebtScreen.tsx
│       │   └── DebtDetailScreen.tsx       # Payment recording + history
│       ├── wishlist/
│       │   ├── WishlistScreen.tsx         # Affordability tracking
│       │   └── AddWishlistItemScreen.tsx
│       ├── investments/
│       │   ├── InvestmentsScreen.tsx
│       │   ├── AddInvestmentScreen.tsx
│       │   └── InvestmentDetailScreen.tsx # Value update history
│       ├── analytics/
│       │   └── AnalyticsScreen.tsx        # Charts, breakdowns, period selector
│       └── settings/
│           ├── MoreMenuScreen.tsx
│           ├── SettingsScreen.tsx
│           └── ExportDataScreen.tsx       # CSV + JSON export
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo Go](https://expo.dev/go) installed on your Android device (Redmi Note 14 or any Android)

### Install and run

```bash
# Clone or open the project
cd "C:\Users\Administrator\Desktop\Startups\Fintly"

# Install dependencies
npm install --legacy-peer-deps

# Start the dev server (clears Metro cache)
npx expo start --clear
```

Scan the QR code that appears in the terminal with Expo Go on your phone.

### If you get module errors on startup

Some packages can have corrupted installs on Windows due to network timeouts. The fix is always:

```bash
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
npx expo start --clear
```

---

## Building an APK

To build a standalone APK you can sideload on your Redmi Note 14 or share with friends:

### Option A — Local build (requires Android SDK / Android Studio)

```bash
npx expo run:android
```

The APK will be in `android/app/build/outputs/apk/debug/`.

### Option B — EAS Build (cloud, no Android SDK needed)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account (free)
eas login

# Configure the project
eas build:configure

# Build a preview APK
eas build --platform android --profile preview
```

EAS will give you a download link for the APK when done. Share it directly.

### eas.json for preview builds

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## Architecture

### Data flow

```
User action
    │
    ▼
Screen component
    │
    ├── Writes to SQLite via Repository (repositories.ts)
    │       AccountRepo.upsert(db, account)
    │       TransactionRepo.upsert(db, tx)
    │       etc.
    │
    └── Updates Zustand store
            useAppStore.upsertAccount(account)
            useAppStore.addTransaction(tx)
```

The SQLite database is the source of truth. Zustand is a fast in-memory mirror loaded on app start by `DataLoader.tsx`. On every write, both are updated together. There is no separate sync step.

### State management

Zustand store (`useAppStore`) holds:
- `accounts`, `transactions`, `incomeSources`, `budgets`, `debts`, `wishlist`, `investments`, `netWorthSnapshots`
- `settings` (theme, currency, notification prefs, onboarding flag)
- `isLoading`, `isDbReady` flags

Selectors like `selectNetWorth`, `selectMonthlyIncome`, `selectMonthlyExpenses` are pure functions derived from store state — no extra re-renders.

### Database

expo-sqlite v57 with `SQLiteProvider` + `useSQLiteContext`. The schema is versioned via `PRAGMA user_version`. Migrations in `migrations.ts` run on every app start and are idempotent (all tables use `CREATE TABLE IF NOT EXISTS`). Foreign keys are enabled. WAL journal mode is on for performance.

### Theme

Two complete color schemes (`lightColors`, `darkColors`) with ~30 semantic tokens each. `ThemeContext` reads system preference by default, persists the user's override to `expo-sqlite/kv-store`. Every component accesses colors through `useTheme().theme.colors` — no hardcoded hex values in component files.

---

## Screen Reference

| Screen | Path | Notes |
|---|---|---|
| Onboarding | `screens/onboarding` | 8 slides, account + income setup |
| Dashboard | `screens/dashboard/DashboardScreen` | Pull-to-refresh, alerts |
| Net Worth History | `screens/dashboard/NetWorthHistoryScreen` | Auto-snapshots monthly |
| Transaction List | `screens/transactions/TransactionListScreen` | Search, type+period filters |
| Add Transaction | `screens/transactions/AddTransactionScreen` | Custom numpad, 2 steps |
| Transaction Detail | `screens/transactions/TransactionDetailScreen` | View + delete |
| Accounts | `screens/accounts` | Balance updates on tx |
| Income Sources | `screens/income` | Allocation slices with % |
| Budgets | `screens/budget` | Live spend tracking |
| Debts | `screens/debt` | Payment history, auto-settle |
| Wish List | `screens/wishlist` | Live affordability check |
| Investments | `screens/investments` | Manual value updates |
| Analytics | `screens/analytics` | Charts, period selector |
| Settings | `screens/settings/SettingsScreen` | Theme, currency, notifications |
| Export | `screens/settings/ExportDataScreen` | CSV + JSON |

---

## Database Schema

```sql
accounts          — id, name, type, balance, currency, color, icon, is_default
income_sources    — id, name, icon, color
allocation_slices — id, income_source_id, label, percentage, account_id, color, sort_order
transactions      — id, type, amount, currency, description, category, tags (JSON),
                    account_id, to_account_id, income_source_id, date, note,
                    is_recurring, recurring_interval
budgets           — id, category, limit_amount, period, currency, alert_at, color
debts             — id, direction, person_name, amount, amount_paid, currency,
                    description, due_date, reminder_enabled, reminder_days, is_settled
debt_payments     — id, debt_id, amount, date, note
wishlist          — id, name, estimated_cost, currency, priority, status,
                    target_date, note, linked_account_id
investments       — id, name, platform, initial_amount, current_value, currency,
                    start_date, status, icon, color
investment_updates — id, investment_id, value, date, note
net_worth_snapshots — id, date, total_assets, total_liabilities, net_worth
settings          — key, value (JSON KV store)
```

All tables have `created_at` / `updated_at` timestamps. Cascade deletes are set on child tables.

---

## Currency Support

Base currency defaults to **NGN (₦)**. Supported display currencies:

| Code | Symbol | Name |
|---|---|---|
| NGN | ₦ | Nigerian Naira |
| USD | $ | US Dollar |
| GBP | £ | British Pound |
| EUR | € | Euro |
| GHS | GH₵ | Ghanaian Cedi |
| KES | KSh | Kenyan Shilling |
| ZAR | R | South African Rand |
| CAD | CA$ | Canadian Dollar |
| AUD | A$ | Australian Dollar |

Conversion uses fallback rates (not live). The base currency setting changes how all amounts are displayed throughout the app.

---

## Contributing / Extending

### Adding a new transaction category

Edit `src/utils/categories.ts` and add an entry to `CATEGORIES`:

```typescript
{ id: 'my_category', label: 'My Category', icon: '🎯', color: '#your-color', type: 'expense' }
```

### Adding a new currency

Edit `src/utils/currency.ts` — add to `CURRENCIES` and `FALLBACK_RATES_FROM_NGN`.

### Adding a new screen

1. Create the screen file in `src/screens/<module>/`
2. Add it to the appropriate stack in `src/navigation/MainNavigator.tsx`
3. Add the route to the relevant param list in `src/types/index.ts`

### Running TypeScript check

```bash
npx tsc --noEmit
```

Should always return 0 errors.

---

## Notes

- All data is stored **locally on your device**. Uninstalling the app deletes all data.
- Export regularly using the Export screen to keep backups.
- The app works fully offline — no internet connection needed after install.
- Built for Android (Redmi Note 14). iOS works but is untested.

---

*Fintly — your money, your rules.*
