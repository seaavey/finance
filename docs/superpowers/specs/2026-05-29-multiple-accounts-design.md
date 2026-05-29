# Multiple Accounts

## Overview

Add multiple account support (bank, e-wallet, cash) with per-account balance tracking. Each transaction is associated with an account. Balance is computed from initial_balance + transaction totals.

## Database

### New table: `accounts`

| Column          | Type        | Notes                                         |
| --------------- | ----------- | --------------------------------------------- |
| id              | uuid        | PK, default uuid_generate_v4()                |
| user_id         | uuid        | FK → profiles.id, NOT NULL                    |
| name            | text        | NOT NULL                                      |
| type            | text        | NOT NULL, CHECK IN ('bank', 'e-wallet', 'cash') |
| currency        | text        | DEFAULT 'IDR'                                 |
| color           | text        | DEFAULT '#3b82f6'                             |
| icon            | text        | DEFAULT 'hugeicons:bank'                      |
| initial_balance | numeric     | DEFAULT 0                                     |
| created_at      | timestamptz | DEFAULT now()                                  |
| updated_at      | timestamptz | DEFAULT now()                                  |

Index: `idx_accounts_user_id` ON accounts(user_id).

Trigger: `on_accounts_updated` → `updated_at = now()`.

### RLS

4 policies (select/insert/update/delete) with `auth.uid() = user_id` for own accounts, plus `is_my_partner()` for partner SELECT.

### Transaction changes

Add `account_id uuid REFERENCES accounts(id) ON DELETE SET NULL` to `transactions` table (nullable, SET NULL so deleting an account doesn't destroy transaction history).

## Balance Computation

Balance = `initial_balance + sum(income transactions) - sum(expense transactions)` for the given account.

Helper `getAccountBalance(accountId)` in composable queries the `transactions` table filtered by account_id. Not cached by default — computed on demand.

For dashboard display, a `getAccountBalances()` function returns balance for all accounts at once.

## Composable: `useAccounts`

Pattern identical to `useCategories`, `useBudgets`:

- `fetchAccounts()` — with `createCache` TTL 30s
- `addAccount(data)` — insert → invalidate → toast
- `updateAccount(id, updates)` — partial update → invalidate → toast
- `deleteAccount(id)` — delete → invalidate → toast
- `getAccountBalance(accountId)` — computed balance from transactions
- `getAccountBalances()` — all accounts with computed balances
- Computed: `bankAccounts`, `ewalletAccounts`, `cashAccounts`

State: `accounts` (ref Account[]), `loading` (ref boolean).

## UI

### `/accounts` page

Full page under sidebar+topbar layout. Similar to categories page:

- Header: "Akun" title + "Tambah Akun" button (pink gradient CTA)
- Loading: 3 skeleton cards
- Empty state: icon + "Belum ada akun" + tombol tambah
- Grid: `md:grid-cols-2 xl:grid-cols-3` of account cards
- Account card: color dot, name, type badge, formatted balance, edit/delete actions
- Form dialog (shadcn `Dialog`): name input, type selector (bank/e-wallet/cash), currency selector, color picker (12 swatches), initial balance (locale-aware input), icon picker (simplified: default icon per type)
- Delete: `ConfirmDialog` like elsewhere

### TransactionForm changes

Add account selector below category picker:

- `Select` component with list of user's accounts
- Label: "Dari Akun"
- Optional: user can leave unselected (account_id = null for backward compat)
- Selected account shown on TransactionItem (color dot tooltip?)

### Dashboard changes

Add "Akun" section below budget summary:

- Horizontal scroll or grid of compact account cards
- Each card: account name, formatted balance, type icon
- Only show if accounts.length > 0

### Sidebar

- Nav link: `/accounts`
- Icon: `hugeicons:bank`
- Label: `sidebar.accounts`

## Migration

Single file: `supabase/migrations/20260530000000_accounts.sql`

Contents:
1. CREATE TABLE accounts
2. CREATE INDEX idx_accounts_user_id
3. CREATE TRIGGER on_accounts_updated
4. ALTER TABLE transactions ADD COLUMN account_id
5. RLS policies (select/insert/update/delete)
6. Enable RLS on accounts table

## i18n Keys

New namespace `accounts`:
```
accounts.title, accounts.subtitle, accounts.add, accounts.edit, accounts.delete,
accounts.name, accounts.type, accounts.bank, accounts.e-wallet, accounts.cash,
accounts.currency, accounts.color, accounts.initial_balance,
accounts.empty, accounts.empty_desc, accounts.balance,
accounts.delete_title, accounts.delete_confirm, accounts.delete_confirm_suffix,
accounts.saved, accounts.save_error, accounts.deleted, accounts.delete_error
```

Plus:
- `sidebar.accounts` — nav label
- `transaction_form.select_account` — account picker label
- `dashboard.accounts_title` — dashboard section header

All keys in both id.json and en.json.

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/20260530000000_accounts.sql` | New — accounts table + RLS + alter transactions |
| `app/composables/useAccounts.ts` | New — accounts CRUD composable |
| `app/pages/accounts.vue` | New — accounts management page |
| `app/components/AccountForm.vue` | New — add/edit account dialog |
| `app/components/AccountCard.vue` | New — account display card |
| `app/components/DashboardSummary.vue` | Modified — add account balances section |
| `app/components/TransactionForm.vue` | Modified — add account selector |
| `app/components/AppSidebar.vue` | Modified — add /accounts link |
| `i18n/locales/id.json` | Modified — add accounts keys |
| `i18n/locales/en.json` | Modified — add accounts keys |

## Out of Scope

- Transfer between accounts (future feature)
- Account-level budgeting
- Import OFX/CSV (deferred)
