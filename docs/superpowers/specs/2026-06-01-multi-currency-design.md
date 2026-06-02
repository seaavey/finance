# Multi-Currency Support — Design Spec

> Date: 2026-06-01
> Status: Draft
> Supersedes: skeleton `useCurrency.ts` (existing formatting-only implementation)

## Problem

The app stores `currency` per account and per user profile, but all financial arithmetic treats amounts as if they were in the same currency:

- `getAccountBalances()` in `useAccounts.ts` sums `income`/`expense` amounts across accounts without conversion, producing meaningless totals when accounts have different currencies.
- `fetchRates()` in `useCurrency.ts` calls a non-existent `/api/v1/rates` endpoint, always failing silently.
- `convertTo()` always returns `null` because rates are never loaded.

The result: multi-currency accounts (e.g., SGD bank account while base currency is IDR) break the dashboard net worth calculation.

## Solution Overview

Three-part approach:

1. **DB layer** — new `exchange_rates` table to cache FX rates
2. **Sync layer** — Supabase Edge Function that fetches rates from a free API every 6 hours
3. **Frontend layer** — update `useCurrency.ts` and `useAccounts.ts` to consume rates and convert all balances to the user's base currency

## 1. Database Migration

```sql
-- supabase/migrations/20260601000000_exchange_rates.sql

create table if not exists exchange_rates (
  id bigint generated always as identity primary key,
  base_currency text not null,      -- 'IDR'
  target_currency text not null,    -- 'USD', 'SGD', etc.
  rate numeric not null,            -- e.g. 1 IDR = 0.000062 USD
  updated_at timestamptz not null default now(),
  unique (base_currency, target_currency)
);

-- Everyone reads the same rates; public read-only
alter table exchange_rates enable row level security;

create policy "Anyone can read exchange rates"
  on exchange_rates for select
  using (true);
```

**Design notes:**

- `base_currency` is always `IDR` to match the Frankfurter API's base (and the most common Indonesian finance app use case). If needed later, multiple base currencies can be stored.
- `numeric` type with no scale limit to preserve API precision.
- `unique` constraint allows idempotent `upsert` in the sync function.

## 2. Edge Function: `sync-rates`

**File:** `supabase/functions/sync-rates/index.ts`

**Source API:** [Frankfurter API](https://www.frankfurter.dev/) — free, no API key, allows `base=IDR`.

**Schedule:** Every 6 hours via Supabase cron (`supabase/config.toml`).

**Flow:**

1. `fetch("https://api.frankfurter.dev/latest?base=IDR")`
2. Map response `rates` object to rows `{ base_currency: 'IDR', target_currency, rate, updated_at }`
3. `upsert` into `exchange_rates` using the unique constraint on `(base_currency, target_currency)`
4. Return success count

**Error handling:** Log error, return 500. The 6-hour retry window is forgiving enough that transient failures self-heal.

**Config:**

```toml
# supabase/config.toml
[functions.sync-rates]
cron = "0 */6 * * *"
verify_jwt = false
```

## 3. Frontend — `useCurrency.ts` Changes

### Remove

- `fetchRates()` — the old function that hits `/api/v1/rates`
- `isRatesLoading` — no longer needed as a manual ref

### Add (using TanStack Vue Query)

```ts
import { useQuery } from '@tanstack/vue-query'
import { useSupabase } from '@/lib/supabase'

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
```

### Update `convertTo()`

```ts
const exchangeRates = computed(() => ratesData.value || null)

const convertTo = (amount: number, fromCurrency: string, toCurrency: string): number | null => {
  if (!exchangeRates.value || amount === 0) return null
  if (fromCurrency === toCurrency) return amount

  const baseCurrency = defaultCurrency.value // always 'IDR'

  // If fromCurrency is base (IDR): amount * rate_to_target
  // If toCurrency is base (IDR): amount / rate_from_base
  // If neither is base: amount * (rate_to_target / rate_from_base)

  const rateFrom = exchangeRates.value[fromCurrency]
  const rateTo = exchangeRates.value[toCurrency]

  if (!rateFrom || !rateTo) return null

  // All stored rates are 1 baseCurrency = X targetCurrency
  // Convert fromCurrency → baseCurrency first, then → targetCurrency
  const inBase = fromCurrency === baseCurrency ? amount : amount / rateFrom
  return toCurrency === baseCurrency ? inBase : inBase * rateTo
}
```

### Keep

- `formatCurrency`, `formatNumberOnly`, `parseLocalizedNumber` — all work fine
- `currencyGroups`, `currencies` — already complete
- `defaultCurrency` — still loaded from user profile
- `hasDecimals`, `getLocale` — all fine

## 4. Frontend — `useAccounts.ts` Changes

### Update `getAccountBalances()`

The critical change: convert each account's balance to the user's `defaultCurrency` before summing.

```ts
const getConvertedBalances = async (): Promise<AccountWithBalance[]> => {
  // ...existing query logic...
  return accts.map((a) => {
    const txs = txMap.get(a.id) || []
    const net = txs.reduce(
      (sum, tx) => (tx.type === 'income' ? sum + Number(tx.amount) : sum - Number(tx.amount)),
      0,
    )
    const rawBalance = Number(a.initial_balance) + net

    let convertedBalance = rawBalance
    if (a.currency !== defaultCurrency.value) {
      const converted = convertTo(rawBalance, a.currency, defaultCurrency.value)
      if (converted !== null) convertedBalance = converted
    }

    return { ...a, balance: convertedBalance }
  })
}
```

### Add a new computed for the dashboard

```ts
const totalNetWorth = computed(() => {
  // This will sum converted balances across all accounts
  // Implementation detail — called by useNetWorth or dashboard directly
})
```

**Note:** `getAccountBalance()` (singular) is used less frequently; keep its current behavior but add a note that it returns raw (unconverted) balance. The converted version is `getConvertedBalances()`.

## 5. Integration Points

| Component/Composable   | What changes                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `useCurrency.ts`       | Rates source → Supabase query; `convertTo` now works           |
| `useAccounts.ts`       | `getAccountBalances` → `getConvertedBalances`                  |
| `useNetWorth.ts`       | May need to use `getConvertedBalances` instead of raw accounts |
| `DashboardSummary.vue` | Should automatically reflect correct totals via composable     |

## 6. Error & Edge Cases

- **Rates not loaded yet:** `convertTo` returns `null`. Callers should fall back gracefully (show `-` or raw amount).
- **Unknown currency pair:** Same, returns `null`.
- **API down for extended period:** Rates stale > 6h is fine — FX rates don't move fast enough to matter for a personal finance app. Show a subtle "rates may be stale" indicator if `updated_at` > 24h.
- **New currency added in app but not in rates:** Only affects accounts with that currency, and only `convertTo` calls for it. Graceful null.
- **Edge function deployment:** Must be deployed after migration. The frontend handles missing rates gracefully, so order doesn't break anything.

## 7. Out of Scope (for this iteration)

- **Historical rates per transaction:** Every transaction stores the rate at time of booking. Useful for accounting-accurate reports. Deferred.
- **User-selectable base currency for display:** Currently tied to profile currency. Future enhancement.
- **Rate alerts** (notify when USD-IDR crosses threshold): Nice-to-have, not now.
- **Manual rate override:** Power-user feature. Not needed yet.

## Files Changed

| #   | Action     | File                                                    |
| --- | ---------- | ------------------------------------------------------- |
| 1   | **Create** | `supabase/migrations/20260601000000_exchange_rates.sql` |
| 2   | **Create** | `supabase/functions/sync-rates/index.ts`                |
| 3   | **Edit**   | `supabase/config.toml` (add cron)                       |
| 4   | **Edit**   | `src/composables/useCurrency.ts`                        |
| 5   | **Edit**   | `src/composables/useAccounts.ts`                        |
