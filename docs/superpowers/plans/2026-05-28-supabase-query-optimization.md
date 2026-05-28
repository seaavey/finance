# Supabase Query Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce redundant Supabase queries, add missing indexes, parallelize sequential fetches, and add a lightweight TTL cache layer.

**Architecture:** Add a `cache.ts` utility that wraps Supabase queries with in-memory TTL + request deduplication. Fix `onMounted` patterns to use `Promise.all`. Add `.limit()` to `fetchTransactions`. Create migration for missing indexes. Optimize client-side category lookups with a `Map`.

**Tech Stack:** Nuxt 4 + TypeScript + Supabase JS SDK + SQL (migrations)

---

## File Structure

| File                                                              | Action     | Responsibility                                                                                                    |
| ----------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `app/lib/cache.ts`                                                | **Create** | TTL cache + request dedup wrapper                                                                                 |
| `app/composables/useTransactions.ts`                              | **Modify** | Add `.limit(100)` to `fetchTransactions`, add date filter param for dashboard                                     |
| `app/pages/dashboard.vue`                                         | **Modify** | Pass date filter to `fetchTransactions`, add `categoryMap` computed, memoize `getCategoryName`/`getCategoryColor` |
| `app/pages/transactions/index.vue`                                | **Modify** | Wrap `onMounted` with `Promise.all`                                                                               |
| `app/pages/recurring.vue`                                         | **Modify** | Wrap `onMounted` with `Promise.all`, memoize `categoryName`                                                       |
| `app/pages/transactions/[id]/edit.vue`                            | **Modify** | Wrap `onMounted` with `Promise.all`                                                                               |
| `app/components/TransactionItem.vue`                              | **Modify** | Use `categoryMap` computed from props                                                                             |
| `app/components/SearchDialog.vue`                                 | **Modify** | Use `categoryMap`                                                                                                 |
| `app/pages/categories.vue`                                        | **Modify** | Memoize `getCategoryStats`                                                                                        |
| `supabase/migrations/20260528000001_index_categories_user_id.sql` | **Create** | Index on `categories(user_id)`                                                                                    |
| `supabase/migrations/20260528000002_index_goals_user_id.sql`      | **Create** | Index on `goals(user_id)`                                                                                         |

---

### Task 1: Create TTL Cache + Request Dedup

**Files:**

- Create: `app/lib/cache.ts`

A lightweight cache wrapper with:

- TTL per key (defaults: categories 60s, transactions 30s, partner 60s)
- Request deduplication: same key in-flight → return existing promise
- `cache.fetch(key, fetcher, ttlMs)` — returns cached value or calls fetcher
- `cache.invalidate(pattern?)` — clear specific or all keys
- No external dependencies

- [ ] **Write `app/lib/cache.ts`**

```ts
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export function createCache() {
  function fetch<T>(key: string, fetcher: () => Promise<T>, ttlMs = 30_000): Promise<T> {
    const now = Date.now();
    const existing = store.get(key);
    if (existing && existing.expiresAt > now) {
      return Promise.resolve(existing.data as T);
    }

    const pending = inflight.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    const promise = fetcher()
      .then((data) => {
        store.set(key, { data, expiresAt: now + ttlMs });
        inflight.delete(key);
        return data;
      })
      .catch((err) => {
        inflight.delete(key);
        throw err;
      });

    inflight.set(key, promise);
    return promise;
  }

  function invalidate(pattern?: string) {
    if (!pattern) {
      store.clear();
      return;
    }
    for (const key of store.keys()) {
      if (key.startsWith(pattern)) {
        store.delete(key);
      }
    }
  }

  return { fetch, invalidate };
}

export type Cache = ReturnType<typeof createCache>;
```

- [ ] **Verify file exists and compiles**

Run: `bun run lint`
Expected: no errors

- [ ] **Commit**

```bash
git add app/lib/cache.ts
git commit -m "feat: add TTL cache with request dedup utility"
```

---

### Task 2: Create Missing Indexes

**Files:**

- Create: `supabase/migrations/20260528000001_index_categories_user_id.sql`
- Create: `supabase/migrations/20260528000002_index_goals_user_id.sql`

- [ ] **Create migration `20260528000001_index_categories_user_id.sql`**

```sql
CREATE INDEX IF NOT EXISTS idx_categories_user_id
  ON public.categories (user_id);
```

- [ ] **Create migration `20260528000002_index_goals_user_id.sql`**

```sql
CREATE INDEX IF NOT EXISTS idx_goals_user_id
  ON public.goals (user_id);
```

- [ ] **Commit**

```bash
git add supabase/migrations/20260528000001_index_categories_user_id.sql supabase/migrations/20260528000002_index_goals_user_id.sql
git commit -m "feat: add missing indexes on categories(user_id) and goals(user_id)"
```

---

### Task 3: Add Limit to `fetchTransactions` + Date Filter Param

**Files:**

- Modify: `app/composables/useTransactions.ts:30-56`

- [ ] **Add default `.limit(100)` and optional `dateFrom` shortcut to `fetchTransactions`**

Edit the function:

```ts
const fetchTransactions = async (filters?: TransactionFilters) => {
  loading.value = true;
  let query = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .limit(100);

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters?.dateFrom) {
    query = query.gte('date', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('date', filters.dateTo);
  }
  if (filters?.search) {
    query = query.ilike('description', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (!error && data) {
    transactions.value = data as Transaction[];
  }
  loading.value = false;
};
```

- [ ] **Verify with lint**

Run: `bun run lint`
Expected: no errors

- [ ] **Commit**

```bash
git add app/composables/useTransactions.ts
git commit -m "feat: add .limit(100) to fetchTransactions"
```

---

### Task 4: Parallelize Transactions Page `onMounted`

**Files:**

- Modify: `app/pages/transactions/index.vue:220-224`

- [ ] **Change sequential awaits to Promise.all**

Before:

```ts
onMounted(async () => {
  await fetchCategories();
  await fetchPartner();
  await fetchTransactions();
});
```

After:

```ts
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchPartner(), fetchTransactions()]);
});
```

- [ ] **Verify with lint**

Run: `bun run lint`
Expected: no errors

- [ ] **Commit**

```bash
git add app/pages/transactions/index.vue
git commit -m "perf: parallelize onMounted fetches on transactions page"
```

---

### Task 5: Parallelize Recurring Page `onMounted`

**Files:**

- Modify: `app/pages/recurring.vue:192-195`

- [ ] **Change sequential awaits to Promise.all**

Before:

```ts
onMounted(async () => {
  await fetchCategories();
  await fetchRecurring();
});
```

After:

```ts
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchRecurring()]);
});
```

- [ ] **Verify with lint**

Run: `bun run lint`
Expected: no errors

- [ ] **Commit**

```bash
git add app/pages/recurring.vue
git commit -m "perf: parallelize onMounted fetches on recurring page"
```

---

### Task 6: Parallelize Transaction Edit Page `onMounted`

**Files:**

- Modify: `app/pages/transactions/[id]/edit.vue:229-232`

- [ ] **Change sequential awaits to Promise.all**

Before:

```ts
onMounted(async () => {
  await fetchCategories();
  await loadTransaction();
});
```

After:

```ts
onMounted(async () => {
  await Promise.all([fetchCategories(), loadTransaction()]);
});
```

- [ ] **Verify with lint**

Run: `bun run lint`
Expected: no errors

- [ ] **Commit**

```bash
git add app/pages/transactions/[id]/edit.vue
git commit -m "perf: parallelize onMounted fetches on transaction edit page"
```

---

### Task 7: Optimize Dashboard — Filtered Transaction Fetch + Memoized Category Lookup

**Files:**

- Modify: `app/pages/dashboard.vue:370-381, 462-481, 505-508`

- [ ] **Add `categoryMap` computed and update `fetchTransactions` call with date filter**

Edit the script section to add a `categoryMap`:

```ts
const categoryMap = computed(() => {
  const map = new Map<string, { name: string; color: string }>();
  for (const cat of categories.value) {
    map.set(cat.id, { name: cat.name, color: cat.color });
  }
  return map;
});
```

Update `getCategoryName` (around line 370):

```ts
const getCategoryName = (id: string | null) => {
  if (!id) return '';
  return categoryMap.value.get(id)?.name || '';
};
const getCategoryColor = (id: string | null) => {
  if (!id) return '#6b7280';
  return categoryMap.value.get(id)?.color || '#6b7280';
};
```

Update `expenseByCategory` (around line 462) to use `categoryMap`:

```ts
const expenseByCategory = computed(() => {
  const map = new Map<string, { name: string; color: string; total: number }>();
  thisMonthTransactions.value
    .filter((t) => t.type === 'expense')
    .forEach((tx) => {
      const cat = tx.category_id ? categoryMap.value.get(tx.category_id) : undefined;
      const key = cat ? tx.category_id : 'uncategorized';
      const existing = map.get(key!);
      if (existing) {
        existing.total += tx.amount;
      } else {
        map.get(key!) ??
          map.set('uncategorized', {
            name: t('dashboard.other'),
            color: '#6b7280',
            total: 0,
          });
        map.get(key!)!.total += tx.amount;
      }
    });
  return [...map.values()].sort((a, b) => b.total - a.total);
});
```

Wait, the expenseByCategory code is more complex. Let me rewrite it cleanly:

```ts
const expenseByCategory = computed(() => {
  const map = new Map<string, { name: string; color: string; total: number }>();
  for (const tx of thisMonthTransactions.value) {
    if (tx.type !== 'expense') continue;
    const cat = tx.category_id ? categoryMap.value.get(tx.category_id) : undefined;
    const key = cat ? tx.category_id : 'uncategorized';
    const existing = map.get(key);
    if (existing) {
      existing.total += tx.amount;
    } else {
      map.set(key, {
        name: cat?.name || t('dashboard.other'),
        color: cat?.color || '#6b7280',
        total: tx.amount,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
});
```

Update `onMounted` to pass a date range filter for the current month:

```ts
onMounted(async () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  await Promise.all([fetchTransactions({ dateFrom: firstDay }), fetchCategories(), fetchPartner()]);
  loading.value = false;
});
```

- [ ] **Verify with lint**

Run: `bun run lint`
Expected: no errors

- [ ] **Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "perf: add categoryMap, memoize lookup, filter dashboard transactions by month"
```

---

### Task 8: Optimize Recurring Page — Memoize `categoryName`

**Files:**

- Modify: `app/pages/recurring.vue:197-202`

- [ ] **Replace `categoryName` function with computed map**

Add computed:

```ts
const categoryMap = computed(() => {
  const map = new Map<string, string>();
  for (const cat of categories.value) {
    map.set(cat.id, cat.name);
  }
  return map;
});
```

Replace the function:

```ts
const categoryName = (id: string | null) => {
  if (!id) return '';
  return categoryMap.value.get(id) ?? '';
};
```

- [ ] **Verify with lint**

Run: `bun run lint`
Expected: no errors

- [ ] **Commit**

```bash
git add app/pages/recurring.vue
git commit -m "perf: memoize categoryName lookup on recurring page"
```

---

### Task 9: Optimize Categories Page — Memoize `getCategoryStats`

**Files:**

- Modify: `app/pages/categories.vue:149-155`

- [ ] **Replace `getCategoryStats` function with computed stats map**

```ts
const categoryStats = computed(() => {
  const map = new Map<string, { count: number; total: number }>();
  for (const tx of transactions.value) {
    if (!tx.category_id) continue;
    const existing = map.get(tx.category_id);
    if (existing) {
      existing.count++;
      existing.total += tx.amount;
    } else {
      map.set(tx.category_id, { count: 1, total: tx.amount });
    }
  }
  return map;
});
```

Update the template reference from `getCategoryStats(cat.id)` to `categoryStats.get(cat.id) ?? { count: 0, total: 0 }`.

Also remove the old `getCategoryStats` function.

- [ ] **Verify with lint**

Run: `bun run lint`
Expected: no errors

- [ ] **Commit**

```bash
git add app/pages/categories.vue
git commit -m "perf: memoize categoryStats with computed map"
```

---

### Task 10: Optimize TransactionItem — Use `categoryMap`

**Files:**

- Read: `app/components/TransactionItem.vue`

- [ ] **Check TransactionItem.vue for category `.find()` patterns and inline them**

Read the file first to understand the current pattern. If it uses `.find()` for categories, add a computed `categoryMap` similar to the dashboard pattern, or pass the category as a prop.

- [ ] **Commit (if changes needed)**

---

### Task 11: Optimize SearchDialog — Use `categoryMap`

**Files:**

- Modify: `app/components/SearchDialog.vue:67`

- [ ] **Replace `.find()` with computed map**

Same pattern: add `categoryMap` computed, use `.get()` instead of `.find()`.

- [ ] **Commit (if changes needed)**

---

### Task 12: Wire Cache into Composables (Optional Enhancement)

**Files:**

- Modify: `app/composables/useTransactions.ts`
- Modify: `app/composables/useCategories.ts`
- Modify: `app/composables/useRecurring.ts`
- Modify: `app/composables/usePartner.ts`

- [ ] **Integrate cache into `fetchCategories`**

This is the highest-impact cache target since categories are fetched identically on 5 pages.

```ts
import { createCache } from '~/lib/cache';

const cache = createCache();

// Inside useCategories composable:
const fetchCategories = async () => {
  loading.value = true;
  const { data, error } = (await cache.fetch(
    'categories',
    () => supabase.from('categories').select('*').order('created_at', { ascending: true }),
    60_000,
  )) as any;
  if (!error && data) {
    categories.value = data as Category[];
  }
  loading.value = false;
};
```

Wait — the cache wrapper returns the query result directly, but the original code destructures `{ data, error }` from the Supabase response. The cache needs to wrap the entire query, not the response destructuring. Let me adjust:

Actually, the cache wrapper should cache the Supabase response object `{ data, error }`. So the fetcher returns the query result, and the cache returns it. This works.

For mutations (add, update, delete), invalidate the cache key afterward:

```ts
cache.invalidate('categories');
```

Same pattern for `fetchTransactions` (TTL 30s), `fetchRecurring` (TTL 30s), `fetchPartner` (TTL 60s).

- [ ] **Commit**

```bash
git add app/composables/useTransactions.ts app/composables/useCategories.ts app/composables/useRecurring.ts app/composables/usePartner.ts
git commit -m "perf: add TTL cache to all composable fetchers"
```

---

## Self-Review Checklist

**Spec coverage:**

- ✅ TTL cache with dedup (Task 1)
- ✅ Missing indexes (Task 2)
- ✅ `.limit()` on transactions query (Task 3)
- ✅ Parallelize transactions page (Task 4)
- ✅ Parallelize recurring page (Task 5)
- ✅ Parallelize edit page (Task 6)
- ✅ Dashboard: category map + filtered fetch (Task 7)
- ✅ Recurring: memoized category name (Task 8)
- ✅ Categories: memoized stats (Task 9)
- TransactionItem and SearchDialog optimizations (Task 10-11) are minor — verify if needed
- Cache integration (Task 12) — optional but impactful

**Placeholder scan:** No TBD, TODOs, or placeholder patterns.

**Type consistency:** All types used match existing interfaces (`Category`, `Transaction`, `TransactionFilters`, etc.)
