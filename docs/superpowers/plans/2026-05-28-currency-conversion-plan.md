# Real-time Global Currency Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement a contextual currency conversion feature that displays the equivalent value of financial data in USD across the dashboard, with hourly updates and server-side caching.

**Architecture:** A server-side API route `/api/v1/rates` will fetch and cache exchange rates from `FreeExchangeRateApi`. The `useCurrency` composable will fetch these rates on app mount and provide a `convertTo` utility for reactive UI updates.

**Tech Stack:** Nuxt 3, Nitro (Server API), Supabase (User Settings), Tailwind CSS (UI).

---

### Task 1: Server-Side API Proxy with Caching

**Files:**

- Create: `server/api/v1/rates.get.ts`
- Test: `tests/server/api/v1/rates.test.ts` (Conceptual, as we'll use manual verification if test runner isn't setup for server routes)

- [x] **Step 1: Create the cached API handler**

```typescript
// server/api/v1/rates.get.ts
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    try {
      const data = await $fetch('https://api.exchangerate.fun/latest?base=IDR');

      // Transform to slim format
      return {
        base: data.base || 'IDR',
        rates: data.rates,
        updated_at: Date.now(),
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch exchange rates',
      });
    }
  },
  {
    maxAge: 3600, // 1 hour
    name: 'exchange-rates',
    getKey: () => 'latest',
  },
);
```

- [x] **Step 2: Verify the endpoint manually**

Run: `curl http://localhost:3000/api/v1/rates`
Expected: A JSON object with `base`, `rates` (containing USD), and `updated_at`.

- [x] **Step 3: Commit**

```bash
git add server/api/v1/rates.get.ts
git commit -m "feat(api): add cached exchange rates proxy"
```

---

### Task 2: Extend useCurrency Composable

**Files:**

- Modify: `app/composables/useCurrency.ts`

- [x] **Step 1: Add state and fetch logic**

```typescript
// Add these to useCurrency.ts
const exchangeRates = useState<Record<string, number> | null>('exchange-rates', () => null);
const isRatesLoading = ref(false);

const fetchRates = async () => {
  if (exchangeRates.value) return;
  isRatesLoading.value = true;
  try {
    const data = await $fetch('/api/v1/rates');
    exchangeRates.value = data.rates;
  } catch (error) {
    console.error('Failed to fetch rates:', error);
  } finally {
    isRatesLoading.value = false;
  }
};

const convertTo = (amount: number, targetCurrency: string = 'USD') => {
  if (!exchangeRates.value || !exchangeRates.value[targetCurrency]) {
    return null;
  }
  // Base is assumed to be IDR as per API config,
  // but we can make it more robust if defaultCurrency changes
  const rate = exchangeRates.value[targetCurrency];
  return amount * rate;
};
```

- [x] **Step 2: Export new members**

Update the return object of `useCurrency`:

```typescript
return {
  // ... existing
  exchangeRates,
  fetchRates,
  convertTo,
  isRatesLoading,
};
```

- [x] **Step 3: Commit**

```bash
git add app/composables/useCurrency.ts
git commit -m "feat(composables): add conversion logic to useCurrency"
```

---

### Task 3: Global Initialization in App Plugin

**Files:**

- Modify: `app/plugins/auth.client.ts` or create new `app/plugins/init.client.ts`

- [x] **Step 1: Fetch rates on app startup**

```typescript
// app/plugins/currency.client.ts (New file)
export default defineNuxtPlugin(() => {
  const { fetchRates } = useCurrency();

  // Fetch rates in background
  onNuxtReady(() => {
    fetchRates();
  });
});
```

- [x] **Step 2: Commit**

```bash
git add app/plugins/currency.client.ts
git commit -m "feat(plugins): fetch exchange rates on app ready"
```

---

### Task 4: UI Update in Dashboard Summary

**Files:**

- Modify: `app/components/DashboardSummary.vue`

- [x] **Step 1: Implement conversion display**

```vue
<!-- app/components/DashboardSummary.vue -->
<script setup>
const { convertTo, formatCurrency } = useCurrency();
// ... existing props/data
const convertedBalance = computed(() => convertTo(props.balance, 'USD'));
</script>

<template>
  <!-- ... existing balance display -->
  <div v-if="convertedBalance !== null" class="text-sm text-muted-foreground mt-1">
    ≈ {{ formatCurrency(convertedBalance, 'USD') }}
  </div>
</template>
```

- [x] **Step 2: Verify in browser**
      Check if the balance in Dashboard shows the USD equivalent.

- [x] **Step 3: Commit**

```bash
git add app/components/DashboardSummary.vue
git commit -m "feat(ui): display converted balance in dashboard summary"
```
