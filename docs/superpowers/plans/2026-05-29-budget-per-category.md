# Budget per Category — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to set monthly spending budgets per transaction category and track progress with visual indicators.

**Architecture:** Adds a `budgets` database table with RLS for user+partner isolation. A new `useBudgets` composable handles CRUD following the existing pattern (cache, useState, toast). A new `/budget` page lists all expense categories with their budgets, current spending, and progress bars. A summary section on the dashboard shows the top budgets. Partner can view but not edit budgets.

**Tech Stack:** Supabase (table + RLS), Nuxt/Vue 3 (composable + page + components), shadcn-vue (dialog, progress), chart.js (optional dashboard widget)

---

### Task 1: Database Migration — Create `budgets` table

**Files:**

- Create: `supabase/migrations/20260529000000_budgets.sql`

- [ ] **Step 1: Add trigger function for `updated_at`**

Note: the `handle_updated_at()` function already exists (created in `20260527000003_goals.sql`), so skip creating it.

- [ ] **Step 2: Write the migration**

```sql
-- Create budgets table
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month date not null, -- first day of the month (e.g. '2026-06-01')
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique constraint: one budget per category per month per user
create unique index idx_budgets_user_category_month
  on public.budgets (user_id, category_id, month);

-- Index for listing budgets by user + month
create index idx_budgets_user_month
  on public.budgets (user_id, month);

-- Index for joining with categories
create index idx_budgets_category
  on public.budgets (category_id);

-- Enable RLS
alter table public.budgets enable row level security;

-- RLS: user can CRUD own budgets
create policy "users can manage own budgets"
  on public.budgets
  using (auth.uid() = user_id);

-- RLS: partner can read
create policy "partner can read budgets"
  on public.budgets
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and partner_id = budgets.user_id
    )
  );

-- Auto-update updated_at
create trigger handle_budgets_updated_at
  before update on public.budgets
  for each row
  execute function public.handle_updated_at();
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260529000000_budgets.sql
git commit -m "feat: add budgets table with RLS"
```

---

### Task 2: Composable — `useBudgets`

**Files:**

- Create: `app/composables/useBudgets.ts`

- [ ] **Step 1: Create the composable**

```typescript
import { useSupabase } from '~/lib/supabase';
import { createCache } from '~/lib/cache';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetWithProgress extends Budget {
  category_name: string;
  category_color: string;
  category_icon: string;
  spent: number;
}

export const useBudgets = () => {
  const supabase = useSupabase();
  const cache = createCache();
  const { t } = useI18n();
  const { toast } = useToast();

  const budgets = useState<Budget[]>('budgets', () => []);
  const loading = useState('budgets-loading', () => false);

  const fetchBudgets = async (month: string) => {
    if (!useAuth().user.value) return;
    loading.value = true;

    const result = await cache.fetch(
      `budgets:${month}`,
      async () => {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', useAuth().user.value!.id)
          .eq('month', month)
          .order('created_at');
        if (error) throw error;
        return data as Budget[];
      },
      30_000,
    );

    budgets.value = result || [];
    loading.value = false;
  };

  const fetchBudgetWithProgress = async (month: string): Promise<BudgetWithProgress[]> => {
    const { user } = useAuth();
    if (!user.value) return [];

    const { data: budgetData } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('month', month);

    const budgetsList = (budgetData as Budget[]) || [];

    if (budgetsList.length === 0) return [];

    const categoryIds = budgetsList.map((b) => b.category_id);

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, color, icon')
      .in('id', categoryIds);

    const categoryMap = new Map((categoriesData || []).map((c) => [c.id, c]));

    const nextMonth = new Date(new Date(month + 'T00:00:00').getTime() + 32 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const { data: txData } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', user.value.id)
      .eq('type', 'expense')
      .gte('date', month)
      .lt('date', nextMonth)
      .in('category_id', categoryIds);

    const spentMap = new Map<string, number>();
    for (const tx of (txData || []) as { category_id: string; amount: number }[]) {
      spentMap.set(tx.category_id, (spentMap.get(tx.category_id) || 0) + Number(tx.amount));
    }

    return budgetsList.map((b) => {
      const cat = categoryMap.get(b.category_id);
      return {
        ...b,
        category_name: cat?.name || '-',
        category_color: cat?.color || '#6b7280',
        category_icon: cat?.icon || '',
        spent: spentMap.get(b.category_id) || 0,
      };
    });
  };

  const setBudget = async (categoryId: string, month: string, amount: number) => {
    const { user } = useAuth();
    if (!user.value) {
      toast.error(t('toast.login_required'));
      return { error: new Error('Not authenticated') };
    }

    loading.value = true;

    const existing = budgets.value.find((b) => b.category_id === categoryId && b.month === month);

    let error;
    if (existing) {
      const result = await supabase.from('budgets').update({ amount }).eq('id', existing.id);
      error = result.error;
    } else {
      const result = await supabase.from('budgets').insert({
        user_id: user.value.id,
        category_id: categoryId,
        month,
        amount,
      });
      error = result.error;
    }

    if (!error) {
      cache.invalidate(`budgets:${month}`);
      await fetchBudgets(month);
      toast.success(t('budget.saved'));
    } else {
      toast.error(t('budget.save_error'));
    }

    loading.value = false;
    return { error };
  };

  const deleteBudget = async (id: string, month: string) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);

    if (!error) {
      cache.invalidate(`budgets:${month}`);
      await fetchBudgets(month);
      toast.success(t('budget.deleted'));
    } else {
      toast.error(t('budget.delete_error'));
    }

    return { error };
  };

  const getProgress = (budget: BudgetWithProgress) => {
    const pct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    return {
      percentage: Math.min(pct, 100),
      remaining: Math.max(budget.amount - budget.spent, 0),
      overspent: pct > 100,
    };
  };

  return {
    budgets,
    loading,
    fetchBudgets,
    fetchBudgetWithProgress,
    setBudget,
    deleteBudget,
    getProgress,
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add app/composables/useBudgets.ts
git commit -m "feat: add useBudgets composable"
```

---

### Task 3: i18n Keys

**Files:**

- Modify: `i18n/locales/id.json`
- Modify: `i18n/locales/en.json`

- [ ] **Step 1: Add budget keys to `id.json`**

Add after the `goals` closing brace:

```json
  "budget": {
    "title": "Budget",
    "subtitle": "Atur budget bulanan per kategori",
    "no_budgets": "Belum ada budget",
    "set_budget": "Atur Budget",
    "edit_budget": "Edit Budget",
    "delete_budget": "Hapus Budget",
    "monthly_limit": "Batas Bulanan",
    "spent": "Terpakai",
    "remaining": "Sisa",
    "overspent": "Over budget!",
    "saved": "Budget berhasil disimpan",
    "save_error": "Gagal menyimpan budget",
    "deleted": "Budget berhasil dihapus",
    "delete_error": "Gagal menghapus budget",
    "dashboard_title": "Budget Bulan Ini",
    "no_limit": "Tidak ada budget"
  },
```

- [ ] **Step 2: Add budget keys to `en.json`**

Same structure with English translations:

```json
  "budget": {
    "title": "Budget",
    "subtitle": "Set monthly budgets per category",
    "no_budgets": "No budgets yet",
    "set_budget": "Set Budget",
    "edit_budget": "Edit Budget",
    "delete_budget": "Delete Budget",
    "monthly_limit": "Monthly Limit",
    "spent": "Spent",
    "remaining": "Remaining",
    "overspent": "Over budget!",
    "saved": "Budget saved successfully",
    "save_error": "Failed to save budget",
    "deleted": "Budget deleted successfully",
    "delete_error": "Failed to delete budget",
    "dashboard_title": "This Month's Budget",
    "no_limit": "No budget set"
  },
```

- [ ] **Step 3: Add sidebar key** — add to the `sidebar` object in both files:

In `id.json` sidebar: add `"budget": "Budget"` after `"goals": "Goals"`
In `en.json` sidebar: add `"budget": "Budget"` after `"goals": "Goals"`

- [ ] **Step 4: Commit**

```bash
git add i18n/locales/id.json i18n/locales/en.json
git commit -m "feat: add budget i18n keys"
```

---

### Task 4: Sidebar Link

**Files:**

- Modify: `app/components/AppSidebar.vue`

- [ ] **Step 1: Add budget to mainNavItems**

Insert after the goals entry:

```ts
{ to: '/budget', label: t('sidebar.budget'), icon: 'hugeicons:wallet-03' },
```

- [ ] **Step 2: Commit**

```bash
git add app/components/AppSidebar.vue
git commit -m "feat: add budget link to sidebar"
```

---

### Task 5: BudgetCard Component

**Files:**

- Create: `app/components/BudgetCard.vue`

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import type { BudgetWithProgress } from '~/composables/useBudgets';

const props = defineProps<{
  budget: BudgetWithProgress;
}>();

const emit = defineEmits<{
  edit: [budget: BudgetWithProgress];
  delete: [budget: BudgetWithProgress];
}>();

const { getProgress } = useBudgets();

const progress = computed(() => getProgress(props.budget));

const progressColor = computed(() => {
  if (progress.value.overspent > 0) return 'bg-red-500';
  if (progress.value.percentage >= 80) return 'bg-amber-500';
  return 'bg-primary';
});
</script>

<template>
  <div
    class="rounded-3xl border border-border/50 bg-card/20 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-card/25"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div
          class="flex size-10 items-center justify-center rounded-xl"
          :style="{ backgroundColor: budget.category_color + '20' }"
        >
          <Icon
            v-if="budget.category_icon"
            :name="budget.category_icon"
            :size="20"
            :style="{ color: budget.category_color }"
          />
        </div>
        <div>
          <p class="text-sm font-semibold text-foreground">{{ budget.category_name }}</p>
          <p class="text-xs text-muted-foreground">
            {{ $t('budget.monthly_limit') }}: {{ formatCurrency(budget.amount) }}
          </p>
        </div>
      </div>
      <div class="flex gap-1">
        <Button variant="ghost" size="icon" class="size-8" @click="emit('edit', budget)">
          <Icon name="hugeicons:edit-01" :size="16" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="size-8 text-red-500 hover:text-red-600"
          @click="emit('delete', budget)"
        >
          <Icon name="hugeicons:delete-01" :size="16" />
        </Button>
      </div>
    </div>

    <div class="mt-4 space-y-1.5">
  <div class="flex justify-between text-xs">
    <span class="text-muted-foreground">
      {{ $t('budget.spent') }}: {{ formatCurrency(budget.spent) }}
    </span>
    <span :class="progress.overspent > 0 ? 'text-red-500 font-semibold' : 'text-muted-foreground'">
      {{
        progress.overspent > 0
          ? $t('budget.overspent')
          : `${$t('budget.remaining')}: ${formatCurrency(progress.remaining)}`
      }}
    </span>
  </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="progressColor"
          :style="{ width: `${Math.min(progress.percentage, 100)}%` }"
        />
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/BudgetCard.vue
git commit -m "feat: add BudgetCard component"
```

---

### Task 6: BudgetForm Dialog Component

**Files:**

- Create: `app/components/BudgetForm.vue`

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import type { Budget } from '~/composables/useBudgets';

const props = defineProps<{
  open: boolean;
  budget?: Budget | null;
  categories: { id: string; name: string; icon: string; color: string; type: string }[];
  month: string;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const { t } = useI18n();
const { setBudget, loading } = useBudgets();
const { parseLocalizedNumber } = useCurrency();

const selectedCategoryId = ref(props.budget?.category_id || '');
const amountInput = ref(props.budget ? String(props.budget.amount) : '');

watchEffect(() => {
  if (props.open) {
    selectedCategoryId.value = props.budget?.category_id || '';
    amountInput.value = props.budget ? String(props.budget.amount) : '';
  }
});

const handleSave = async () => {
  if (!selectedCategoryId.value || !amountInput.value) return;

  const amount = parseLocalizedNumber(amountInput.value);
  if (amount <= 0) return;

  const result = await setBudget(selectedCategoryId.value, props.month, amount);
  if (!result.error) {
    emit('saved');
    emit('update:open', false);
  }
};

const availableCategories = computed(() => props.categories.filter((c) => c.type === 'expense'));
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="w-[calc(100vw-32px)] sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ budget ? t('budget.edit_budget') : t('budget.set_budget') }}</DialogTitle>
      </DialogHeader>
      <div class="space-y-4 py-2">
        <div class="space-y-2">
          <Label>{{ $t('categories.type_name') }}</Label>
          <Select v-model="selectedCategoryId" :disabled="!!budget">
            <SelectTrigger>
              <SelectValue :placeholder="t('categories.type_name')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
                <div class="flex items-center gap-2">
                  <Icon :name="cat.icon" :size="16" :style="{ color: cat.color }" />
                  {{ cat.name }}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>{{ $t('budget.monthly_limit') }}</Label>
          <Input
            v-model="amountInput"
            type="text"
            inputmode="numeric"
            :placeholder="t('budget.monthly_limit')"
            autofocus
          />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button variant="outline" size="sm" @click="emit('update:open', false)">
          {{ $t('common.cancel') }}
        </Button>
        <Button
          size="sm"
          :disabled="loading || !selectedCategoryId || !amountInput"
          @click="handleSave"
        >
          {{ loading ? $t('common.saving') : t('budget.set_budget') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/BudgetForm.vue
git commit -m "feat: add BudgetForm dialog component"
```

---

### Task 7: Budget Page

**Files:**

- Create: `app/pages/budget.vue`

- [ ] **Step 1: Create the page**

```vue
<script setup lang="ts">
definePageMeta({
  title: 'budget.title',
});

const { t } = useI18n();
const { categories, fetchCategories } = useCategories();

const now = new Date();
const currentMonth = computed(() => {
  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  return d.toISOString().slice(0, 10);
});

const {
  budgets: _budgets,
  loading,
  fetchBudgetWithProgress,
  deleteBudget,
  setBudget,
} = useBudgets();

const budgetList = ref<BudgetWithProgress[]>([]);
const showForm = ref(false);
const editingBudget = ref<BudgetWithProgress | null>(null);
const showDeleteDialog = ref(false);
const deletingBudget = ref<BudgetWithProgress | null>(null);

const loadData = async () => {
  await fetchCategories();
  budgetList.value = await fetchBudgetWithProgress(currentMonth.value);
};

onMounted(() => {
  loadData();
});

const onAddBudget = () => {
  editingBudget.value = null;
  showForm.value = true;
};

const onEditBudget = (budget: BudgetWithProgress) => {
  editingBudget.value = budget;
  showForm.value = true;
};

const onDeleteRequest = (budget: BudgetWithProgress) => {
  deletingBudget.value = budget;
  showDeleteDialog.value = true;
};

const onDeleteConfirm = async () => {
  if (!deletingBudget.value) return;
  await deleteBudget(deletingBudget.value.id, currentMonth.value);
  budgetList.value = await fetchBudgetWithProgress(currentMonth.value);
  showDeleteDialog.value = false;
  deletingBudget.value = null;
};

const onFormSaved = async () => {
  budgetList.value = await fetchBudgetWithProgress(currentMonth.value);
};

const expenseCategories = computed(() => categories.value.filter((c) => c.type === 'expense'));
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ $t('budget.title') }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">{{ $t('budget.subtitle') }}</p>
      </div>
      <Button
        class="flex items-center gap-2 rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-4 text-sm font-medium text-white transition hover:from-pink-400 hover:to-pink-500"
        @click="onAddBudget"
      >
        <Icon name="hugeicons:add-01" :size="18" />
        <span class="hidden sm:inline">{{ $t('budget.set_budget') }}</span>
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-28 w-full rounded-3xl" />
      <Skeleton class="h-28 w-full rounded-3xl" />
      <Skeleton class="h-28 w-full rounded-3xl" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="budgetList.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <div class="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
        <Icon name="hugeicons:wallet-03" :size="32" class="text-muted-foreground" />
      </div>
      <p class="text-sm font-medium text-muted-foreground">{{ $t('budget.no_budgets') }}</p>
      <Button variant="outline" size="sm" class="mt-4" @click="onAddBudget">
        {{ $t('budget.set_budget') }}
      </Button>
    </div>

    <!-- Budget List -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <BudgetCard
        v-for="budget in budgetList"
        :key="budget.id"
        :budget="budget"
        @edit="onEditBudget"
        @delete="onDeleteRequest"
      />
    </div>

    <!-- Budget Form Dialog -->
    <BudgetForm
      v-model:open="showForm"
      :budget="editingBudget"
      :categories="expenseCategories"
      :month="currentMonth"
      @saved="onFormSaved"
    />

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('budget.delete_budget')"
      :description="`${$t('budget.delete_budget')} &quot;${deletingBudget?.category_name}&quot;?`"
      :confirm-text="$t('common.delete')"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/budget.vue
git commit -m "feat: add budget page"
```

---

### Task 8: Dashboard Budget Summary

**Files:**

- Create: `app/components/BudgetSummary.vue` (optional, or inline on dashboard)
- Modify: `app/pages/dashboard.vue`

- [ ] **Step 1: Add budget section to dashboard**

Insert into the template below the trends chart section (after the MonthlyBar chart):

```vue
      <!-- Budget Summary -->
      <div v-if="budgetSummaries.length > 0" class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold tracking-tight">{{ $t('budget.dashboard_title') }}</h2>
          <NuxtLinkLocale
            to="/budget"
            class="text-xs font-medium text-primary hover:underline"
          >
            {{ $t('dashboard.view_all') }}
          </NuxtLinkLocale>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="budget in budgetSummaries"
            :key="budget.id"
            class="rounded-2xl border border-border/50 bg-card/20 p-4 backdrop-blur-sm"
          >
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-muted-foreground truncate">{{ budget.category_name }}</p>
              <span
                class="text-[11px] font-semibold"
                :class="budget.spent > budget.amount ? 'text-red-500' : 'text-muted-foreground'"
              >
                {{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.amount) }}
              </span>
            </div>
            <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full transition-all"
                :class="budget.spent > budget.amount ? 'bg-red-500' : budget.spent / budget.amount >= 0.8 ? 'bg-amber-500' : 'bg-primary'"
                :style="{ width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>
```

Add the composable import and data fetch in the `<script setup>` section of dashboard.vue:

```ts
const { fetchBudgetWithProgress } = useBudgets();
const budgetSummaries = ref<BudgetWithProgress[]>([]);

// Inside the onMounted or data loading function:
budgetSummaries.value = await fetchBudgetWithProgress(currentMonth.value);
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/dashboard.vue app/components/BudgetSummary.vue
git commit -m "feat: add budget summary section to dashboard"
```

---

### Task 9: Format & Lint

**Files:** No source changes — verification only.

- [ ] **Step 1: Run lint**

```bash
bun run lint
```

Expected: 0 errors (pre-existing warnings OK).

- [ ] **Step 2: Run format check**

```bash
bun run format:check
```

Expected: All matched files use Prettier code style.

If either fails, run `bun run lint:fix` and/or `bun run format`, then re-run checks.

- [ ] **Step 3: Final commit if needed**

```bash
git add -A
git commit -m "style: fix formatting"
```
