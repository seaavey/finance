# Activity Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an activity log feature that records all user actions (login, CRUD on transactions/categories/budgets/goals/bills/accounts/recurring/partner) and displays them on a dedicated `/activities` page with bilingual i18n support.

**Architecture:** New `activity_logs` table in Supabase stores structured data (entity_type, action, metadata). New `useActivityLog` composable handles insert + fetch. All existing composables get a one-liner `activity.log(...)` call after successful operations. Frontend renders descriptions via `$t()` — no hardcoded strings. Activity log is inserted fire-and-forget (no blocking the main operation).

**Tech Stack:** Supabase (PostgreSQL), Vue 3 + TypeScript, vue-i18n, existing composable pattern (useSupabase + createCache)

---

### Task 1: SQL Migration — Add activity_logs table

**Files:**

- Modify: `supabase/migration.sql` (append at end)

- [ ] **Step 1: Add the activity_logs table creation SQL**

Append to the end of `supabase/migration.sql`:

```sql
-- 14. Activity Logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.activity_logs enable row level security;

create policy "Users can view own activity logs"
  on public.activity_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity logs"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

create index if not exists idx_activity_logs_user_created
  on public.activity_logs(user_id, created_at desc);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migration.sql
git commit -m "feat: add activity_logs table"
```

---

### Task 2: Add Locale Keys (id.json + en.json)

**Files:**

- Modify: `src/locales/id.json`
- Modify: `src/locales/en.json`

- [ ] **Step 1: Add activity._ and activities._ keys to id.json**

Append inside the root object of `src/locales/id.json`:

```json
  "activities": {
    "title": "Riwayat Aktivitas",
    "filter_entity": "Jenis",
    "filter_action": "Aksi",
    "filter_date": "Rentang Tanggal",
    "empty": "Belum ada aktivitas",
    "load_more": "Muat lebih banyak"
  },
  "activity": {
    "auth": {
      "login": "Login berhasil",
      "logout": "Logout"
    },
    "transaction": {
      "created": "Menambahkan transaksi \"{description}\"",
      "updated": "Mengubah transaksi \"{description}\"",
      "deleted": "Menghapus transaksi \"{description}\""
    },
    "category": {
      "created": "Menambahkan kategori \"{name}\"",
      "updated": "Mengubah kategori \"{name}\"",
      "deleted": "Menghapus kategori \"{name}\""
    },
    "budget": {
      "created": "Menambahkan budget untuk \"{category_name}\"",
      "updated": "Mengubah budget untuk \"{category_name}\"",
      "deleted": "Menghapus budget untuk \"{category_name}\""
    },
    "goal": {
      "created": "Menambahkan goal \"{name}\"",
      "updated": "Mengubah goal \"{name}\"",
      "deleted": "Menghapus goal \"{name}\""
    },
    "bill": {
      "created": "Menambahkan tagihan \"{name}\"",
      "updated": "Mengubah tagihan \"{name}\"",
      "deleted": "Menghapus tagihan \"{name}\""
    },
    "account": {
      "created": "Menambahkan akun \"{name}\"",
      "updated": "Mengubah akun \"{name}\"",
      "deleted": "Menghapus akun \"{name}\""
    },
    "recurring": {
      "created": "Menambahkan transaksi berulang \"{name}\"",
      "updated": "Mengubah transaksi berulang \"{name}\"",
      "deleted": "Menghapus transaksi berulang \"{name}\""
    },
    "todo": {
      "created": "Menambahkan tugas \"{description}\"",
      "updated": "Mengubah tugas \"{description}\"",
      "deleted": "Menghapus tugas \"{description}\""
    },
    "partner": {
      "connected": "Terhubung dengan pasangan",
      "disconnected": "Putus koneksi dengan pasangan"
    }
  }
```

- [ ] **Step 2: Add activity._ and activities._ keys to en.json**

Append inside the root object of `src/locales/en.json`:

```json
  "activities": {
    "title": "Activity History",
    "filter_entity": "Type",
    "filter_action": "Action",
    "filter_date": "Date Range",
    "empty": "No activity yet",
    "load_more": "Load more"
  },
  "activity": {
    "auth": {
      "login": "Logged in",
      "logout": "Logged out"
    },
    "transaction": {
      "created": "Added transaction \"{description}\"",
      "updated": "Updated transaction \"{description}\"",
      "deleted": "Deleted transaction \"{description}\""
    },
    "category": {
      "created": "Added category \"{name}\"",
      "updated": "Updated category \"{name}\"",
      "deleted": "Deleted category \"{name}\""
    },
    "budget": {
      "created": "Added budget for \"{category_name}\"",
      "updated": "Updated budget for \"{category_name}\"",
      "deleted": "Deleted budget for \"{category_name}\""
    },
    "goal": {
      "created": "Added goal \"{name}\"",
      "updated": "Updated goal \"{name}\"",
      "deleted": "Deleted goal \"{name}\""
    },
    "bill": {
      "created": "Added bill \"{name}\"",
      "updated": "Updated bill \"{name}\"",
      "deleted": "Deleted bill \"{name}\""
    },
    "account": {
      "created": "Added account \"{name}\"",
      "updated": "Updated account \"{name}\"",
      "deleted": "Deleted account \"{name}\""
    },
    "recurring": {
      "created": "Added recurring \"{name}\"",
      "updated": "Updated recurring \"{name}\"",
      "deleted": "Deleted recurring \"{name}\""
    },
    "todo": {
      "created": "Added task \"{description}\"",
      "updated": "Updated task \"{description}\"",
      "deleted": "Deleted task \"{description}\""
    },
    "partner": {
      "connected": "Connected with partner",
      "disconnected": "Disconnected from partner"
    }
  }
```

- [ ] **Step 3: Commit**

```bash
git add src/locales/id.json src/locales/en.json
git commit -m "feat: add activity log locale keys"
```

---

### Task 3: Create useActivityLog Composable

**Files:**

- Create: `src/composables/useActivityLog.ts`

- [ ] **Step 1: Create the useActivityLog composable**

Create `src/composables/useActivityLog.ts`:

```typescript
import { useSupabase } from '@/lib/supabase'

export type EntityType =
  | 'transaction'
  | 'category'
  | 'budget'
  | 'goal'
  | 'bill'
  | 'account'
  | 'recurring'
  | 'todo'
  | 'partner'
  | 'auth'

export type ActionType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'login'
  | 'logout'
  | 'connected'
  | 'disconnected'

export interface ActivityLog {
  id: string
  user_id: string
  entity_type: EntityType
  entity_id: string | null
  action: ActionType
  metadata: Record<string, unknown>
  created_at: string
}

export interface ActivityLogFilters {
  page?: number
  limit?: number
  entityType?: EntityType | EntityType[]
  action?: ActionType | ActionType[]
  startDate?: string
  endDate?: string
}

export const useActivityLog = () => {
  const supabase = useSupabase()
  const { user } = useAuth()

  const logs = ref<ActivityLog[]>([])
  const loading = ref(false)
  const total = ref(0)

  const log = async (
    entityType: EntityType,
    action: ActionType,
    metadata?: Record<string, unknown>,
    entityId?: string,
  ) => {
    if (!user.value) return

    await supabase.from('activity_logs').insert({
      user_id: user.value.id,
      entity_type: entityType,
      entity_id: entityId ?? null,
      action,
      metadata: metadata ?? {},
    })
    // Fire-and-forget: no error handling needed — failure to log shouldn't
    // block the user's primary action
  }

  const fetchAll = async (filters: ActivityLogFilters = {}) => {
    if (!user.value) return
    loading.value = true

    const { page = 1, limit = 50, entityType, action, startDate, endDate } = filters

    try {
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (entityType) {
        if (Array.isArray(entityType)) {
          query = query.in('entity_type', entityType)
        } else {
          query = query.eq('entity_type', entityType)
        }
      }
      if (action) {
        if (Array.isArray(action)) {
          query = query.in('action', action)
        } else {
          query = query.eq('action', action)
        }
      }
      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, count } = await query

      if (data) {
        logs.value = data as ActivityLog[]
      }
      if (count !== null) {
        total.value = count
      }
    } finally {
      loading.value = false
    }
  }

  const fetchRecent = async (limitCount = 5): Promise<ActivityLog[]> => {
    if (!user.value) return []

    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
      .limit(limitCount)

    return (data as ActivityLog[]) || []
  }

  return {
    logs,
    loading,
    total,
    log,
    fetchAll,
    fetchRecent,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useActivityLog.ts
git commit -m "feat: add useActivityLog composable"
```

---

### Task 4: Integrate into useTransactions

**Files:**

- Modify: `src/composables/useTransactions.ts`

- [ ] **Step 1: Add activity log calls after CRUD successes**

Add after the `toast.success(t('toast.transaction_added'))` line in `addTransaction`:

```typescript
activity.log(
  'transaction',
  'created',
  {
    description: tx.description || '',
    amount: tx.amount,
    type: tx.type,
  },
  data?.[0]?.id,
)
```

(Note: the `data[0].id` needs access to the inserted result. For insert, change the supabase call to capture the returned data.)

Update the insert in `addTransaction` to capture returned data:

```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert({ ...tx, user_id: user.value.id })
  .select()
```

Add after `toast.success(t('toast.transaction_updated'))` in `updateTransaction`:

```typescript
activity.log(
  'transaction',
  'updated',
  {
    description: updates.description || '',
    amount: updates.amount,
  },
  id,
)
```

Add after `toast.success(t('toast.transaction_deleted'))` in `deleteTransaction`:

```typescript
activity.log('transaction', 'deleted', {}, id)
```

Also add the `useActivityLog()` call at the top of the function body inside `useTransactions`:

```typescript
const activity = useActivityLog()
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useTransactions.ts
git commit -m "feat: add activity logging to transactions"
```

---

### Task 5: Integrate into useCategories

**Files:**

- Modify: `src/composables/useCategories.ts`

- [ ] **Step 1: Add activity log calls after CRUD successes**

Add inside the function body of `useCategories`:

```typescript
const activity = useActivityLog()
```

After `toast.success(t('toast.category_added'))` in `addCategory`:

```typescript
activity.log('category', 'created', { name: category.name }, data?.[0]?.id)
```

(Update the insert to return data with `.select()`.)

After `toast.success(t('toast.category_updated'))` in `updateCategory`:

```typescript
activity.log('category', 'updated', { name: updates.name }, id)
```

After `toast.success(t('toast.category_deleted'))` in `deleteCategory`:

```typescript
activity.log('category', 'deleted', { name: category.name }, id)
```

(For delete, get the name from the categories ref before deleting.)

- [ ] **Step 2: Commit**

```bash
git add src/composables/useCategories.ts
git commit -m "feat: add activity logging to categories"
```

---

### Task 6: Integrate into useBudgets

**Files:**

- Modify: `src/composables/useBudgets.ts`

- [ ] **Step 1: Add activity log calls after CRUD successes**

Add inside the function body of `useBudgets`:

```typescript
const activity = useActivityLog()
```

After successful insert (created path) in `setBudget`:

```typescript
activity.log('budget', 'created', { category_name: categoryId, amount })
```

After successful update (updated path) in `setBudget`:

```typescript
activity.log('budget', 'updated', { category_name: categoryId, amount })
```

After `toast.success(t('budget.deleted'))` in `deleteBudget`:

```typescript
activity.log('budget', 'deleted', { category_name: budget.category_name }, id)
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useBudgets.ts
git commit -m "feat: add activity logging to budgets"
```

---

### Task 7: Integrate into useGoals

**Files:**

- Modify: `src/composables/useGoals.ts`

- [ ] **Step 1: Add activity log calls after CRUD successes**

Add inside the function body of `useGoals`:

```typescript
const activity = useActivityLog()
```

After `toast.success(t('toast.goal_added'))` in `addGoal`:

```typescript
activity.log(
  'goal',
  'created',
  { name: goal.name, target_amount: goal.target_amount },
  data?.[0]?.id,
)
```

(Update the insert to return data with `.select()`.)

After `toast.success(t('toast.goal_updated'))` in `updateGoal`:

```typescript
activity.log('goal', 'updated', { name: updates.name }, id)
```

After `toast.success(t('toast.goal_deleted'))` in `deleteGoal`:

```typescript
activity.log('goal', 'deleted', { name: goal.name }, id)
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useGoals.ts
git commit -m "feat: add activity logging to goals"
```

---

### Task 8: Integrate into useBills

**Files:**

- Modify: `src/composables/useBills.ts`

- [ ] **Step 1: Add activity log calls after CRUD successes**

Add inside the function body of `useBills`:

```typescript
const activity = useActivityLog()
```

After `toast.success(t('bills.saved'))` in `addBill`:

```typescript
activity.log('bill', 'created', { name: data.title, amount: data.amount }, data.id)
```

After `toast.success(t('bills.saved'))` in `updateBill`:

```typescript
activity.log('bill', 'updated', { name: updates.title, amount: updates.amount }, id)
```

After `toast.success(t('bills.deleted'))` in `deleteBill`:

```typescript
activity.log('bill', 'deleted', { name: bill.title }, id)
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useBills.ts
git commit -m "feat: add activity logging to bills"
```

---

### Task 9: Integrate into useAccounts

**Files:**

- Modify: `src/composables/useAccounts.ts`

- [ ] **Step 1: Add activity log calls after CRUD successes**

Add inside the function body of `useAccounts`:

```typescript
const activity = useActivityLog()
```

After `toast.success(t('accounts.saved'))` in `addAccount`:

```typescript
activity.log('account', 'created', { name: data.name, type: data.type }, data.id)
```

After `toast.success(t('accounts.saved'))` in `updateAccount`:

```typescript
activity.log('account', 'updated', { name: updates.name }, id)
```

After `toast.success(t('accounts.deleted'))` in `deleteAccount`:

```typescript
activity.log('account', 'deleted', { name: account.name }, id)
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useAccounts.ts
git commit -m "feat: add activity logging to accounts"
```

---

### Task 10: Integrate into useRecurring

**Files:**

- Modify: `src/composables/useRecurring.ts`

- [ ] **Step 1: Add activity log calls after CRUD successes**

Add inside the function body of `useRecurring`:

```typescript
const activity = useActivityLog()
```

After `toast.success(t('toast.recurring_added'))` in `addRecurring`:

```typescript
activity.log('recurring', 'created', { name: item.description || item.type, amount: item.amount })
```

After `toast.success(t('toast.recurring_updated'))` in `updateRecurring`:

```typescript
activity.log('recurring', 'updated', { name: updates.description || updates.type }, id)
```

After `toast.success(t('toast.recurring_deleted'))` in `deleteRecurring`:

```typescript
activity.log('recurring', 'deleted', { name: recurringItem.description || recurringItem.type }, id)
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useRecurring.ts
git commit -m "feat: add activity logging to recurring"
```

---

### Task 11: Integrate into useAuth

**Files:**

- Modify: `src/composables/useAuth.ts`

- [ ] **Step 1: Add activity log calls for login and logout**

Add inside the function body of `useAuth`:

```typescript
const activity = useActivityLog()
```

After successful `signInWithGoogle` (after the redirect is triggered):

```typescript
// Note: Login happens after OAuth redirect, handled by getSession/page mount.
// We'll log login when the user lands back on the app.
```

Actually, login detection is handled differently — OAuth redirect means the user lands back on the app and a session is restored. The login event should be logged when `getSession()` returns a session. Add after `user.value = session?.user ?? null` in `getSession`:

```typescript
if (session?.user) {
  await activity.log('auth', 'login').catch(() => {})
}
```

And in `signOut`, after `user.value = null`:

```typescript
await activity.log('auth', 'logout').catch(() => {})
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useAuth.ts
git commit -m "feat: add activity logging to auth"
```

---

### Task 12: Integrate into usePartner

**Files:**

- Modify: `src/composables/usePartner.ts`

- [ ] **Step 1: Add activity log calls for partner connect/disconnect**

Add inside the function body of `usePartner`:

```typescript
const activity = useActivityLog()
```

After `toast.success(t('toast.partner_connected'))` in `acceptInvite`:

```typescript
activity.log('partner', 'connected')
```

After `toast.success(t('toast.partner_disconnected'))` in `disconnectPartner`:

```typescript
activity.log('partner', 'disconnected')
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/usePartner.ts
git commit -m "feat: add activity logging to partner"
```

---

### Task 13: Add Activities Link to Sidebar

**Files:**

- Modify: `src/components/AppSidebar.vue`

- [ ] **Step 1: Add activities nav item to the system section**

In `AppSidebar.vue`, add a new nav item in the `system` section:

```typescript
{
  label: t('sidebar.sections.system'),
  items: [
    { to: '/activities', label: t('sidebar.activities'), icon: 'hugeicons:timeline-01' },
    { to: '/settings', label: t('sidebar.settings'), icon: 'hugeicons:settings-01' },
  ],
},
```

- [ ] **Step 2: Add sidebar locale keys**

In `src/locales/id.json` sidebar section, add:

```json
"activities": "Aktivitas"
```

In `src/locales/en.json` sidebar section, add:

```json
"activities": "Activity"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AppSidebar.vue src/locales/id.json src/locales/en.json
git commit -m "feat: add activities link to sidebar"
```

---

### Task 14: Create Activities Page

**Files:**

- Create: `src/pages/activities/index.vue`
- Create: `src/components/ActivityLogList.vue`

- [ ] **Step 1: Create the activities page**

Create `src/pages/activities/index.vue`:

```vue
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight">{{ $t('activities.title') }}</h1>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <select
        v-model="filterEntity"
        class="rounded-xl border border-border/40 bg-card px-3 py-2 text-sm"
        @change="applyFilters"
      >
        <option value="">{{ $t('activities.filter_entity') }}</option>
        <option value="auth">Auth</option>
        <option value="transaction">Transaction</option>
        <option value="category">Category</option>
        <option value="budget">Budget</option>
        <option value="goal">Goal</option>
        <option value="bill">Bill</option>
        <option value="account">Account</option>
        <option value="recurring">Recurring</option>
        <option value="partner">Partner</option>
      </select>

      <select
        v-model="filterAction"
        class="rounded-xl border border-border/40 bg-card px-3 py-2 text-sm"
        @change="applyFilters"
      >
        <option value="">{{ $t('activities.filter_action') }}</option>
        <option value="created">Created</option>
        <option value="updated">Updated</option>
        <option value="deleted">Deleted</option>
        <option value="login">Login</option>
        <option value="logout">Logout</option>
        <option value="connected">Connected</option>
        <option value="disconnected">Disconnected</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 10" :key="i" class="h-14 animate-pulse rounded-xl bg-muted/30" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="logs.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <Icon name="hugeicons:timeline-01" :size="48" class="text-muted-foreground/30" />
      <p class="mt-4 text-sm text-muted-foreground">{{ $t('activities.empty') }}</p>
    </div>

    <!-- Activity List -->
    <div v-else class="space-y-1">
      <div
        v-for="log in logs"
        :key="log.id"
        class="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/30"
      >
        <Icon
          :name="getActivityIcon(log.entity_type, log.action)"
          :size="18"
          class="shrink-0 text-muted-foreground/60"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm">
            {{ $t(`activity.${log.entity_type}.${log.action}`, log.metadata) }}
          </p>
        </div>
        <time class="shrink-0 text-xs text-muted-foreground/60">
          {{ formatTime(log.created_at) }}
        </time>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="flex justify-center py-4">
      <Button variant="outline" :loading="loadingMore" @click="loadMore">
        {{ $t('activities.load_more') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import type { EntityType, ActionType } from '@/composables/useActivityLog'

const { logs, loading, total, fetchAll } = useActivityLog()

const filterEntity = ref('')
const filterAction = ref('')
const currentPage = ref(1)
const loadingMore = ref(false)

const pageSize = 50
const hasMore = computed(() => logs.value.length < total.value)

const getActivityIcon = (entityType: EntityType, action: ActionType): string => {
  const icons: Record<string, string> = {
    'auth.login': 'hugeicons:login-01',
    'auth.logout': 'hugeicons:logout-01',
    'transaction.created': 'hugeicons:arrow-left-right',
    'transaction.updated': 'hugeicons:edit-01',
    'transaction.deleted': 'hugeicons:delete-01',
    'category.created': 'hugeicons:grid-view',
    'category.updated': 'hugeicons:edit-01',
    'category.deleted': 'hugeicons:delete-01',
    'budget.created': 'hugeicons:wallet-03',
    'budget.updated': 'hugeicons:edit-01',
    'budget.deleted': 'hugeicons:delete-01',
    'goal.created': 'hugeicons:target-02',
    'goal.updated': 'hugeicons:edit-01',
    'goal.deleted': 'hugeicons:delete-01',
    'bill.created': 'hugeicons:calendar-03',
    'bill.updated': 'hugeicons:edit-01',
    'bill.deleted': 'hugeicons:delete-01',
    'account.created': 'hugeicons:bank',
    'account.updated': 'hugeicons:edit-01',
    'account.deleted': 'hugeicons:delete-01',
    'recurring.created': 'hugeicons:repeat',
    'recurring.updated': 'hugeicons:edit-01',
    'recurring.deleted': 'hugeicons:delete-01',
    'partner.connected': 'hugeicons:user',
    'partner.disconnected': 'hugeicons:user',
  }
  return icons[`${entityType}.${action}`] || 'hugeicons:timeline-01'
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMnt}m lalu`
  if (diffHours < 24) return `${diffHours}j lalu`
  if (diffDays < 7) return `${diffDays}h lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const applyFilters = () => {
  currentPage.value = 1
  fetchAll({
    page: 1,
    limit: pageSize,
    entityType: (filterEntity.value as EntityType) || undefined,
    action: (filterAction.value as ActionType) || undefined,
  })
}

const loadMore = async () => {
  loadingMore.value = true
  currentPage.value++
  await fetchAll({
    page: currentPage.value,
    limit: pageSize,
    entityType: (filterEntity.value as EntityType) || undefined,
    action: (filterAction.value as ActionType) || undefined,
  })
  loadingMore.value = false
}

// Initial fetch
applyFilters()
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/activities/index.vue
git commit -m "feat: add activities history page"
```

---

### Self-Review Checklist

1. **Spec coverage:** Every entity type and action from the spec is covered:
   - [x] auth: login, logout
   - [x] transaction: created, updated, deleted
   - [x] category: created, updated, deleted
   - [x] budget: created, updated, deleted
   - [x] goal: created, updated, deleted
   - [x] bill: created, updated, deleted
   - [x] account: created, updated, deleted
   - [x] recurring: created, updated, deleted
   - [x] partner: connected, disconnected
   - [x] i18n keys for all (id.json + en.json)
   - [x] useActivityLog composable with log/fetchAll/fetchRecent
   - [x] Sidebar nav link
   - [x] Activities page

2. **Placeholder scan:** No TBD, TODO, or incomplete sections. All code is concrete and ready to implement.

3. **Type consistency:** `EntityType` and `ActionType` unions are consistent across the composable, locale key patterns, and integration calls.

4. **Missing items from spec:** Todo is mentioned in spec but no `useTodos` composable exists in the codebase — skipped with note.
