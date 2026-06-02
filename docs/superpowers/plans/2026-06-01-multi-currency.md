# Multi-Currency Support — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken multi-currency skeleton with a working exchange rate sync and automatic balance conversion.

**Architecture:** FX rates fetched from Frankfurter API every 6h via Supabase Edge Function, stored in an `exchange_rates` table, consumed by TanStack Vue Query in the frontend. Account balances are converted to the user's `defaultCurrency` before summation in dashboard and net worth.

**Tech Stack:** Supabase Edge Function (Deno), Frankfurter API, TanStack Vue Query, Supabase JS client

---

## File Structure

| File                                                    | Action | Responsibility                                                     |
| ------------------------------------------------------- | ------ | ------------------------------------------------------------------ |
| `supabase/migrations/20260601000000_exchange_rates.sql` | Create | Migration: `exchange_rates` table + RLS                            |
| `supabase/functions/sync-rates/index.ts`                | Create | Edge function: fetch rates from Frankfurter, upsert to DB          |
| `supabase/config.toml`                                  | Edit   | Add cron schedule for `sync-rates`                                 |
| `src/composables/useCurrency.ts`                        | Edit   | Replace fetchRates with TanStack Query; update convertTo signature |
| `src/composables/useAccounts.ts`                        | Edit   | Add `getConvertedBalances()` method                                |
| `src/composables/useNetWorth.ts`                        | Edit   | Use converted balances for accurate history                        |
| `src/components/DashboardSummary.vue`                   | Edit   | Update convertTo calls with fromCurrency param                     |
| `src/pages/accounts/index.vue`                          | Edit   | Fix `totalBalance` computation with currency conversion            |

---

### Task 1: Create Database Migration

**Files:**

- Create: `supabase/migrations/20260601000000_exchange_rates.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260601000000_exchange_rates.sql

create table if not exists exchange_rates (
  id bigint generated always as identity primary key,
  base_currency text not null,
  target_currency text not null,
  rate numeric not null,
  updated_at timestamptz not null default now(),
  unique (base_currency, target_currency)
);

alter table exchange_rates enable row level security;

create policy "Anyone can read exchange rates"
  on exchange_rates for select
  using (true);
```

- [ ] **Step 2: Apply the migration**

Run: `supabase migration up`
Expected: Migration applied, `exchange_rates` table created.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260601000000_exchange_rates.sql
git commit -m "feat: add exchange_rates table"
```

---

### Task 2: Create Edge Function `sync-rates`

**Files:**

- Create: `supabase/functions/sync-rates/index.ts`

- [ ] **Step 1: Write the edge function**

```ts
// supabase/functions/sync-rates/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

serve(async () => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  try {
    // Frankfurter API — free, no API key, allows custom base
    const res = await fetch('https://api.frankfurter.dev/latest?base=IDR')

    if (!res.ok) {
      console.error(`Frankfurter API returned ${res.status}`)
      return new Response('Failed to fetch rates', { status: 502 })
    }

    const data = await res.json()
    const rows = Object.entries(data.rates).map(([target, rate]) => ({
      base_currency: 'IDR',
      target_currency: target,
      rate: rate as number,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('exchange_rates')
      .upsert(rows, { onConflict: 'base_currency, target_currency' })

    if (error) {
      console.error('Upsert error:', error.message)
      return new Response('Failed to persist rates', { status: 500 })
    }

    console.log(`Synced ${rows.length} exchange rates`)
    return new Response(JSON.stringify({ ok: true, count: rows.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
```

- [ ] **Step 2: Verify edge function syntax**

Run: `deno check supabase/functions/sync-rates/index.ts`
Expected: No syntax errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/sync-rates/index.ts
git commit -m "feat: add sync-rates edge function"
```

---

### Task 3: Add Cron Config

**Files:**

- Modify: `supabase/config.toml`

- [ ] **Step 1: Add sync-rates function config and cron schedule**

Edit `supabase/config.toml` to add at the end of the file:

```toml
[functions.sync-rates]
cron = "0 */6 * * *"
verify_jwt = false
```

- [ ] **Step 2: Commit**

```bash
git add supabase/config.toml
git commit -m "feat: schedule sync-rates edge function every 6 hours"
```

---

### Task 4: Update `useCurrency.ts`

**Files:**

- Modify: `src/composables/useCurrency.ts`

This task replaces the broken `fetchRates()` (which hits non-existent `/api/v1/rates`) with a TanStack Vue Query from Supabase, and updates `convertTo()` signature to accept `fromCurrency` and `toCurrency` parameters.

- [ ] **Step 1: Rewrite `useCurrency.ts`**

Key changes:

- Remove module-level `exchangeRates` ref and `isRatesLoading`
- Remove `fetchRates` function entirely
- Add `useQuery` for fetching rates from Supabase `exchange_rates` table
- Make `exchangeRates` a computed from query data
- Change `convertTo(amount, targetCurrency)` → `convertTo(amount, fromCurrency, toCurrency)`

Full file content after changes:

```ts
import { ref, computed } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/vue-query'
import { user } from './useAuth'

const defaultCurrency = ref<string>('IDR')

export const loadCurrency = async () => {
  const supabase = useSupabase()
  if (!user.value) {
    return
  }
  const { data } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user.value.id)
    .single()
  if (data?.currency) {
    defaultCurrency.value = data.currency
  }
}

export const useCurrency = () => {
  // --- Exchange rates from Supabase (synced via Edge Function) ---
  const { data: ratesData } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const supabase = useSupabase()
      const { data, error } = await supabase.from('exchange_rates').select('target_currency, rate')
      if (error) throw error
      const map: Record<string, number> = {}
      for (const row of data || []) {
        map[row.target_currency] = Number(row.rate)
      }
      return map
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  const exchangeRates = computed(() => ratesData.value || null)

  const convertTo = (amount: number, fromCurrency: string, toCurrency: string): number | null => {
    if (!exchangeRates.value || amount === 0) return null
    if (fromCurrency === toCurrency) return amount

    const baseCurrency = defaultCurrency.value

    // All stored rates are: 1 baseCurrency = X targetCurrency
    const rateFrom = exchangeRates.value[fromCurrency]
    const rateTo = exchangeRates.value[toCurrency]

    if (!rateFrom || !rateTo) return null

    // Convert fromCurrency → baseCurrency first, then → toCurrency
    const inBase = fromCurrency === baseCurrency ? amount : amount / rateFrom
    return toCurrency === baseCurrency ? inBase : inBase * rateTo
  }

  // --- Rest of file unchanged below ---

  const noDecimalCurrencies = ['IDR', 'JPY', 'KRW', 'VND', 'KHR', 'LAK', 'MMK']

  const hasDecimals = (currency?: string) => {
    return !noDecimalCurrencies.includes(currency || defaultCurrency.value)
  }

  const formatCurrency = (amount: number, currency?: string) => {
    const cur = currency || defaultCurrency.value
    return new Intl.NumberFormat(getLocale(cur), {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: hasDecimals(cur) ? 2 : 0,
      maximumFractionDigits: hasDecimals(cur) ? 2 : 0,
    }).format(amount)
  }

  const getLocale = (currency: string) => {
    const localeMap: Record<string, string> = {
      IDR: 'id-ID',
      MYR: 'ms-MY',
      SGD: 'en-SG',
      THB: 'th-TH',
      PHP: 'en-PH',
      VND: 'vi-VN',
      MMK: 'my-MM',
      KHR: 'km-KH',
      LAK: 'lo-LA',
      BND: 'ms-BN',
      JPY: 'ja-JP',
      KRW: 'ko-KR',
      CNY: 'zh-CN',
      TWD: 'zh-TW',
      HKD: 'zh-HK',
      INR: 'en-IN',
      BDT: 'bn-BD',
      PKR: 'en-PK',
      LKR: 'si-LK',
      NPR: 'ne-NP',
    }
    return localeMap[currency] ?? 'en-US'
  }

  const currencyGroups = [
    {
      label: 'Asia Tenggara',
      currencies: [
        { value: 'IDR', label: 'IDR - Rupiah Indonesia' },
        { value: 'MYR', label: 'MYR - Ringgit Malaysia' },
        { value: 'SGD', label: 'SGD - Dollar Singapura' },
        { value: 'THB', label: 'THB - Baht Thailand' },
        { value: 'PHP', label: 'PHP - Peso Filipina' },
        { value: 'VND', label: 'VND - Dong Vietnam' },
        { value: 'MMK', label: 'MMK - Kyat Myanmar' },
        { value: 'KHR', label: 'KHR - Riel Kamboja' },
        { value: 'LAK', label: 'LAK - Kip Laos' },
        { value: 'BND', label: 'BND - Dollar Brunei' },
      ],
    },
    {
      label: 'Asia Timur',
      currencies: [
        { value: 'JPY', label: 'JPY - Yen Jepang' },
        { value: 'KRW', label: 'KRW - Won Korea' },
        { value: 'CNY', label: 'CNY - Yuan Tiongkok' },
        { value: 'TWD', label: 'TWD - Dollar Taiwan' },
        { value: 'HKD', label: 'HKD - Dollar Hong Kong' },
      ],
    },
    {
      label: 'Asia Selatan',
      currencies: [
        { value: 'INR', label: 'INR - Rupee India' },
        { value: 'BDT', label: 'BDT - Taka Bangladesh' },
        { value: 'PKR', label: 'PKR - Rupee Pakistan' },
        { value: 'LKR', label: 'LKR - Rupee Sri Lanka' },
        { value: 'NPR', label: 'NPR - Rupee Nepal' },
      ],
    },
  ]

  const currencies = currencyGroups.flatMap((g) => g.currencies)

  const formatNumberOnly = (amount: number, currency?: string) => {
    const cur = currency || defaultCurrency.value
    return new Intl.NumberFormat(getLocale(cur), {
      minimumFractionDigits: hasDecimals(cur) ? 2 : 0,
      maximumFractionDigits: hasDecimals(cur) ? 2 : 0,
    }).format(amount)
  }

  const parseLocalizedNumber = (str: string, currency?: string): number => {
    const cur = currency || defaultCurrency.value
    const digits = str.replace(/\D/g, '')
    if (!digits) {
      return 0
    }
    const num = Number(digits)
    if (hasDecimals(cur)) {
      return num / 100
    }
    return num
  }

  return {
    formatCurrency,
    formatNumberOnly,
    parseLocalizedNumber,
    hasDecimals,
    currencies,
    currencyGroups,
    defaultCurrency,
    exchangeRates,
    convertTo,
  }
}
```

- [ ] **Step 2: Verify module-level `user` import exists**

Check that `src/composables/useAuth.ts` exports `user` at module level (needed for the `import { user } from './useAuth'` on line 4).

Run: `grep -n 'export const user' src/composables/useAuth.ts`
Expected: Shows `export const user = ref<User | null>(null)` or similar.

- [ ] **Step 3: Commit**

```bash
git add src/composables/useCurrency.ts
git commit -m "feat: use TanStack Query for exchange rates, update convertTo signature"
```

---

### Task 5: Fix `DashboardSummary.vue` — Update `convertTo` Calls

**Files:**

- Modify: `src/components/DashboardSummary.vue`

The component calls `convertTo(amount, 'USD')` with the old 2-arg signature. The new signature is `convertTo(amount, fromCurrency, toCurrency)`.

- [ ] **Step 1: Update the three `convertTo` calls**

Edit lines 45-47:

```ts
const { formatCurrency, convertTo, defaultCurrency } = useCurrency()

const convertedIncome = computed(() =>
  convertTo(props.summary.income, defaultCurrency.value, 'USD'),
)
const convertedExpense = computed(() =>
  convertTo(props.summary.expense, defaultCurrency.value, 'USD'),
)
const convertedBalance = computed(() =>
  convertTo(props.summary.balance, defaultCurrency.value, 'USD'),
)
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DashboardSummary.vue
git commit -m "fix: update convertTo calls to use new signature"
```

---

### Task 6: Add `getConvertedBalances()` to `useAccounts.ts`

**Files:**

- Modify: `src/composables/useAccounts.ts`

Add a new `getConvertedBalances()` method that converts each account's balance to `defaultCurrency`, and a `totalConvertedBalance` computed. Keep the original `getAccountBalances()` intact for per-account displays.

- [ ] **Step 1: Add `getConvertedBalances()` method**

After the existing `getAccountBalances()` method (after line 151), add:

```ts
const getConvertedBalances = async (): Promise<AccountWithBalance[]> => {
  if (!user.value) {
    return []
  }
  const accts = accounts.value
  if (accts.length === 0) {
    return []
  }

  const { data } = await supabase
    .from('transactions')
    .select('account_id, type, amount')
    .eq('user_id', user.value.id)
    .in(
      'account_id',
      accts.map((a) => a.id),
    )
    .not('account_id', 'is', null)

  const netMap = new Map<string, number>()
  for (const tx of (data || []) as { account_id: string; type: string; amount: number }[]) {
    const current = netMap.get(tx.account_id) || 0
    netMap.set(
      tx.account_id,
      tx.type === 'income' ? current + Number(tx.amount) : current - Number(tx.amount),
    )
  }

  const { defaultCurrency, convertTo } = useCurrency()

  return accts.map((a) => {
    const net = netMap.get(a.id) || 0
    const rawBalance = Number(a.initial_balance) + net

    let convertedBalance = rawBalance
    if (a.currency !== defaultCurrency.value) {
      const converted = convertTo(rawBalance, a.currency, defaultCurrency.value)
      if (converted !== null) {
        convertedBalance = converted
      }
    }

    return { ...a, balance: convertedBalance }
  })
}
```

- [ ] **Step 2: Export the new method**

Add to the return object:

```ts
return {
  accounts,
  loading,
  fetchAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  getAccountBalance,
  getAccountBalances,
  getConvertedBalances, // <-- add this
  bankAccounts,
  ewalletAccounts,
  cashAccounts,
  investmentAccounts,
  liabilityAccounts,
}
```

- [ ] **Step 3: Commit**

```bash
git add src/composables/useAccounts.ts
git commit -m "feat: add getConvertedBalances method for multi-currency totals"
```

---

### Task 7: Update `useNetWorth.ts` — Use Converted Balances

**Files:**

- Modify: `src/composables/useNetWorth.ts`

- [ ] **Step 1: Update the net worth calculation to use `getConvertedBalances`**

The existing code fetches raw accounts + transactions and sums them without conversion. Replace the account balance accumulation with converted values.

```ts
import { useSupabase } from '@/lib/supabase'
import { useAccounts } from './useAccounts'

export interface NetWorthData {
  label: string
  assets: number
  debts: number
  netWorth: number
  date: string
}

export const useNetWorth = () => {
  const supabase = useSupabase()
  const { user } = useAuth()
  const { locale } = useI18n()
  const { getConvertedBalances } = useAccounts()

  const history = ref<NetWorthData[]>([])
  const loading = ref(false)

  const fetchNetWorthHistory = async (months: number = 6) => {
    if (!user.value) {
      return
    }
    loading.value = true

    try {
      // 1. Fetch all accounts
      const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.value.id)

      if (accError) throw accError
      if (!accounts?.length) {
        history.value = []
        return
      }

      // 2. Fetch all transactions (no limit for historical accuracy)
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('account_id, type, amount, date, currency')
        .eq('user_id', user.value.id)
        .order('date', { ascending: true })

      if (txError) throw txError

      // 3. Fetch exchange rates for conversion
      const { data: ratesData } = await supabase
        .from('exchange_rates')
        .select('target_currency, rate')

      const rates: Record<string, number> = {}
      for (const row of ratesData || []) {
        rates[row.target_currency] = Number(row.rate)
      }

      const getConvertedAmount = (
        amount: number,
        fromCurrency: string,
        toCurrency: string,
      ): number => {
        if (fromCurrency === toCurrency || !rates[fromCurrency] || !rates[toCurrency]) {
          return amount
        }
        // rates are 1 IDR = X target
        const inBase = fromCurrency === 'IDR' ? amount : amount / rates[fromCurrency]
        return toCurrency === 'IDR' ? inBase : inBase * rates[toCurrency]
      }

      const result: NetWorthData[] = []
      const now = new Date()
      const baseCurrency = 'IDR' // all amounts converted to IDR for history

      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0) // Last day of month
        const dateStr = d.toISOString().split('T')[0]
        const label = d.toLocaleDateString(locale.value, { month: 'short' })

        let totalAssets = 0
        let totalDebts = 0

        for (const acc of accounts) {
          const accCreatedAt = new Date(acc.created_at)
          let balance = accCreatedAt <= d ? Number(acc.initial_balance) : 0

          const accTxs = (transactions || []).filter(
            (tx: { account_id: string; date: string }) =>
              tx.account_id === acc.id && new Date(tx.date) <= d,
          )

          for (const tx of accTxs as { type: string; amount: number; currency?: string }[]) {
            const txAmount = tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount)
            balance += txAmount
          }

          // Convert balance to base currency
          const convertedBalance = getConvertedAmount(balance, acc.currency || 'IDR', baseCurrency)

          if (acc.type === 'liability') {
            totalDebts += convertedBalance
          } else {
            totalAssets += convertedBalance
          }
        }

        result.push({
          label,
          assets: totalAssets,
          debts: totalDebts,
          netWorth: totalAssets - totalDebts,
          date: dateStr || '',
        })
      }

      history.value = result
    } catch (error) {
      console.error('Failed to fetch net worth history:', error)
    } finally {
      loading.value = false
    }
  }

  const currentNetWorth = computed(() => {
    if (history.value.length === 0) {
      return null
    }
    return history.value[history.value.length - 1]
  })

  return {
    history,
    loading,
    fetchNetWorthHistory,
    currentNetWorth,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useNetWorth.ts
git commit -m "feat: convert account balances to base currency in net worth history"
```

---

### Task 8: Fix Accounts List Total Balance

**Files:**

- Modify: `src/pages/accounts/index.vue`

The `totalBalance` computed on line 59-61 sums raw balances across currencies. Add conversion so the total is meaningful.

- [ ] **Step 1: Update the import/pull convertTo + defaultCurrency**

Add to the destructured `useCurrency()` call on line 13:

```ts
const { formatCurrency, convertTo, defaultCurrency } = useCurrency()
```

- [ ] **Step 2: Replace the `totalBalance` computed**

Replace lines 59-61:

```ts
const totalBalance = computed(() => accountList.value.reduce((s, a) => s + a.balance, 0))
```

With:

```ts
const totalBalance = computed(() => {
  let total = 0
  for (const a of accountList.value) {
    const converted = convertTo(a.balance, a.currency, defaultCurrency.value)
    total += converted ?? a.balance // fallback to raw if conversion fails
  }
  return total
})
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/accounts/index.vue
git commit -m "fix: convert account balances to base currency in total balance"
```

---

## Self-Review

**Spec coverage check:**

- ✅ Migration: `exchange_rates` table + RLS → Task 1
- ✅ Edge function: `sync-rates` → Task 2
- ✅ Cron schedule → Task 3
- ✅ `useCurrency.ts`: rates via TanStack Query, `convertTo` with from/to → Task 4
- ✅ `DashboardSummary.vue`: updated `convertTo` calls → Task 5
- ✅ `useAccounts.ts`: `getConvertedBalances()` → Task 6
- ✅ `useNetWorth.ts`: converted balance history → Task 7

**Placeholder scan:** No TODOs, TBDs, or incomplete code blocks. All steps contain complete, runnable code.

**Type consistency:** `convertTo(amount, fromCurrency, toCurrency)` returns `number | null` consistently across all files. `getConvertedBalances()` returns `Promise<AccountWithBalance[]>` matching existing interface.

**Gaps from spec:** The spec mentioned a `totalNetWorth` computed — that's implemented inside `useNetWorth.ts` via `currentNetWorth` already existing. Accounts list page `totalBalance` fix wasn't in the spec but is required to prevent broken totals.
