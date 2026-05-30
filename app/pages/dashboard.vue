<template>
  <div class="pb-10 pt-4">
    <!-- Header with Greeting -->
    <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <ClientOnly>
          <h2 class="text-4xl font-bold tracking-tighter text-zinc-900">
            {{ $t('dashboard.greeting') }}, {{ displayName }}
          </h2>
          <template #fallback>
            <h2 class="text-4xl font-bold tracking-tighter text-zinc-900">
              {{ $t('dashboard.greeting_loading') }}
            </h2>
          </template>
        </ClientOnly>
        <p class="mt-1 text-zinc-500 font-medium">{{ monthLabel }}</p>
      </div>
      <div v-if="isPartnered" class="flex gap-1 rounded-2xl border border-zinc-200/50 bg-white/50 p-1 shadow-sm backdrop-blur-md">
        <Button
          v-for="mode in viewModes"
          :key="mode.value"
          :variant="viewMode === mode.value ? 'default' : 'ghost'"
          size="sm"
          class="rounded-xl px-4 transition-all duration-300"
          :class="viewMode === mode.value ? 'shadow-sm' : 'text-zinc-500'"
          @click="viewMode = mode.value"
        >
          {{ mode.label }}
        </Button>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-6">
      <div class="h-64 animate-pulse rounded-4xl bg-zinc-100 md:col-span-3" />
      <div v-for="i in 3" :key="i" class="h-64 animate-pulse rounded-4xl bg-zinc-100 md:col-span-1" />
      <div class="h-96 animate-pulse rounded-4xl bg-zinc-100 md:col-span-4" />
      <div class="h-96 animate-pulse rounded-4xl bg-zinc-100 md:col-span-2" />
    </div>

    <!-- Bento Grid Content -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-6">
      <!-- Main Balance Hero Card (3 cols) -->
      <div
        class="group relative flex flex-col justify-between overflow-hidden rounded-4xl border border-zinc-200/50 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/50 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both md:col-span-3"
      >
        <div class="relative z-10">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-200">
              <Icon name="hugeicons:wallet-01" :size="20" />
            </div>
            <span class="text-sm font-bold tracking-tight text-zinc-500 uppercase">{{ $t('dashboard.balance_this_month') }}</span>
          </div>
          <div class="mt-8">
            <h1 class="text-6xl font-black tracking-tighter text-zinc-900 leading-none">
              {{ formatCurrency(balance) }}
            </h1>
            <div class="mt-4 flex items-center gap-2">
              <div
                class="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black"
                :class="balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
              >
                <Icon :name="balance >= 0 ? 'hugeicons:arrow-up-01' : 'hugeicons:arrow-down-01'" :size="14" />
                {{ trendBalance === null ? $t('dashboard.new') : `${Math.abs(trendBalance)}%` }}
              </div>
              <span class="text-xs font-bold text-zinc-400">{{ $t('dashboard.vs_last_month_short') }}</span>
            </div>
          </div>
        </div>
        <div class="absolute -right-12 -top-12 size-64 rounded-full bg-zinc-50 transition-all duration-700 group-hover:scale-110 group-hover:bg-zinc-100/50" />
      </div>

      <!-- Income Stats (1 col) -->
      <div
        class="flex flex-col justify-between rounded-4xl border border-zinc-200/50 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg animate-in fade-in slide-in-from-bottom-6 delay-100 duration-700 fill-mode-both md:col-span-1"
      >
        <div class="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
          <Icon name="hugeicons:arrow-down-01" :size="24" />
        </div>
        <div>
          <p class="text-[10px] font-black tracking-widest text-zinc-400 uppercase">{{ $t('dashboard.income') }}</p>
          <p class="mt-1 text-2xl font-black tracking-tighter text-zinc-900">{{ formatCurrency(totalIncome) }}</p>
        </div>
      </div>

      <!-- Expense Stats (1 col) -->
      <div
        class="flex flex-col justify-between rounded-4xl border border-zinc-200/50 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg animate-in fade-in slide-in-from-bottom-6 delay-200 duration-700 fill-mode-both md:col-span-1"
      >
        <div class="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
          <Icon name="hugeicons:arrow-up-01" :size="24" />
        </div>
        <div>
          <p class="text-[10px] font-black tracking-widest text-zinc-400 uppercase">{{ $t('dashboard.expense') }}</p>
          <p class="mt-1 text-2xl font-black tracking-tighter text-zinc-900">{{ formatCurrency(totalExpense) }}</p>
        </div>
      </div>

      <!-- Net Worth Stats (1 col) -->
      <div
        class="flex flex-col justify-between rounded-4xl border border-zinc-200/50 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg animate-in fade-in slide-in-from-bottom-6 delay-300 duration-700 fill-mode-both md:col-span-1"
      >
        <div class="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
          <Icon name="hugeicons:chart-line-up-01" :size="24" />
        </div>
        <div>
          <p class="text-[10px] font-black tracking-widest text-zinc-400 uppercase">{{ $t('dashboard.net_worth') }}</p>
          <p class="mt-1 text-2xl font-black tracking-tighter text-zinc-900">{{ formatCurrency(currentNetWorth?.netWorth || 0) }}</p>
        </div>
      </div>

      <!-- Analytics Area: Monthly Bar Chart (4 cols) -->
      <div
        class="rounded-4xl border border-zinc-200/50 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg animate-in fade-in slide-in-from-bottom-6 delay-400 duration-700 fill-mode-both md:col-span-4"
      >
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-black tracking-tighter text-zinc-900">{{ $t('dashboard.expense_chart') }}</h3>
            <p class="text-sm font-medium text-zinc-400">{{ $t('dashboard.monthly_performance') }}</p>
          </div>
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <span class="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
              <span class="text-xs font-bold text-zinc-500">{{ $t('dashboard.income') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="size-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
              <span class="text-xs font-bold text-zinc-500">{{ $t('dashboard.expense') }}</span>
            </div>
          </div>
        </div>
        <div class="h-64">
          <ChartsMonthlyBar :data="monthlyData" />
        </div>
      </div>

      <!-- Side Section: Budget/Accounts/Reminders (2 cols) -->
      <div class="space-y-4 animate-in fade-in slide-in-from-bottom-6 delay-500 duration-700 fill-mode-both md:col-span-2">
        <!-- Upcoming Bills / Reminders -->
        <div v-if="activeReminders.length > 0" class="rounded-4xl border border-zinc-200/50 bg-rose-50/30 p-6 shadow-sm backdrop-blur-sm transition-all hover:bg-rose-50/50">
          <h3 class="mb-4 text-[10px] font-black tracking-widest text-rose-600 uppercase">{{ $t('dashboard.upcoming_bills') }}</h3>
          <div class="space-y-3">
            <div
              v-for="reminder in activeReminders.slice(0, 2)"
              :key="reminder.id"
              class="group flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shadow-sm">
                  <Icon name="hugeicons:calendar-03" :size="18" />
                </div>
                <div class="min-w-0">
                  <p class="truncate text-xs font-bold text-zinc-900">{{ reminder.name }}</p>
                  <p class="text-[10px] font-bold text-rose-500">
                    {{ reminder.days_left === 0 ? $t('recurring.due_today') : $t('recurring.due_in_n_days', { days: reminder.days_left }) }}
                  </p>
                </div>
              </div>
              <p class="text-xs font-black text-zinc-900">{{ formatCurrency(reminder.amount, reminder.currency) }}</p>
            </div>
          </div>
        </div>

        <!-- Budget Progress -->
        <div class="rounded-4xl border border-zinc-200/50 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-[10px] font-black tracking-widest text-zinc-400 uppercase">{{ $t('budget.dashboard_title') }}</h3>
            <NuxtLinkLocale to="/budget" class="text-[10px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors">
              {{ $t('dashboard.view_all') }}
            </NuxtLinkLocale>
          </div>
          <div class="space-y-4">
            <div v-for="sbudget in budgetSummaries.slice(0, 3)" :key="sbudget.id">
              <div class="flex items-center justify-between">
                <p class="text-xs font-bold text-zinc-900 truncate pr-2">{{ sbudget.category_name }}</p>
                <p class="text-[10px] font-black text-zinc-400">
                  {{ Math.round((sbudget.spent / sbudget.amount) * 100) }}%
                </p>
              </div>
              <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 shadow-inner">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="sbudget.spent > sbudget.amount ? 'bg-rose-500' : 'bg-zinc-900'"
                  :style="{ width: `${Math.min((sbudget.spent / sbudget.amount) * 100, 100)}%` }"
                />
              </div>
            </div>
            <div v-if="budgetSummaries.length === 0" class="py-4 text-center">
              <p class="text-xs text-zinc-400 font-bold uppercase tracking-tight">{{ $t('budget.empty') }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Accounts -->
        <div class="rounded-4xl border border-zinc-200/50 bg-zinc-900 p-6 shadow-xl text-white transition-all hover:shadow-zinc-300">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-[10px] font-black tracking-widest text-zinc-500 uppercase">{{ $t('dashboard.accounts_title') }}</h3>
            <NuxtLinkLocale to="/accounts" class="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
              {{ $t('dashboard.view_all') }}
            </NuxtLinkLocale>
          </div>
          <div class="grid grid-cols-1 gap-2">
            <div
              v-for="acct in accountBalances.slice(0, 3)"
              :key="acct.id"
              class="flex items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <div class="flex items-center gap-2 min-w-0">
                <div class="flex size-7 items-center justify-center rounded-lg bg-white/20">
                  <Icon v-if="acct.icon" :name="acct.icon" :size="14" />
                </div>
                <span class="truncate text-xs font-bold">{{ acct.name }}</span>
              </div>
              <span class="text-xs font-black tracking-tighter">{{ formatCurrency(acct.balance, acct.currency) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions (Full Width - 6 cols) -->
      <div
        class="rounded-4xl border border-zinc-200/50 bg-white shadow-sm transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-6 delay-700 duration-700 fill-mode-both md:col-span-6"
      >
        <div class="flex items-center justify-between border-b border-zinc-100 p-8">
          <div>
            <h3 class="text-xl font-black tracking-tighter text-zinc-900">{{ $t('dashboard.recent') }}</h3>
            <p class="text-sm font-medium text-zinc-400">{{ $t('dashboard.latest_activity') }}</p>
          </div>
          <NuxtLinkLocale
            to="/transactions"
            class="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-black text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300"
          >
            {{ $t('dashboard.view_all') }}
          </NuxtLinkLocale>
        </div>
        
        <div class="p-4">
          <div v-if="recentTransactions.length === 0" class="flex flex-col items-center gap-4 py-12 text-center">
            <div class="flex size-16 items-center justify-center rounded-full bg-zinc-50">
              <Icon name="hugeicons:arrow-left-right" :size="32" class="text-zinc-300" />
            </div>
            <div>
              <p class="text-base font-black text-zinc-900 tracking-tight">{{ $t('dashboard.empty_title') }}</p>
              <p class="text-sm font-medium text-zinc-400">{{ $t('dashboard.empty_desc') }}</p>
            </div>
          </div>
          <div v-else class="grid grid-cols-1 gap-1">
            <NuxtLinkLocale
              v-for="tx in recentTransactions"
              :key="tx.id"
              :to="`/transactions/${tx.id}/edit`"
              class="group flex items-center gap-4 rounded-3xl p-4 transition-all hover:bg-zinc-50"
            >
              <div
                class="flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm"
                :class="tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
              >
                <Icon
                  :name="tx.type === 'income' ? 'hugeicons:arrow-down-01' : 'hugeicons:arrow-up-01'"
                  :size="20"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-black text-zinc-900">
                    {{ tx.description || getCategoryName(tx.category_id) || $t('sidebar.transactions') }}
                  </p>
                  <span
                    v-if="getCategoryName(tx.category_id)"
                    class="rounded-full bg-zinc-100 px-2 py-0.5 text-[8px] font-black text-zinc-500 uppercase tracking-widest"
                  >
                    {{ getCategoryName(tx.category_id) }}
                  </span>
                </div>
                <p class="text-xs font-bold text-zinc-400">{{ formatRelativeDate(tx.date) }}</p>
              </div>
              <p
                class="shrink-0 text-lg font-black tracking-tighter"
                :class="tx.type === 'income' ? 'text-emerald-600' : 'text-zinc-900'"
              >
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
              </p>
            </NuxtLinkLocale>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="animate-in fade-in slide-in-from-bottom-6 delay-1000 duration-700 fill-mode-both md:col-span-3">
        <button
          class="flex w-full items-center gap-6 rounded-4xl border border-zinc-200/50 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100"
          @click="navigateTo('/transactions/new')"
        >
          <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-all duration-500 hover:scale-110">
            <Icon name="hugeicons:add-01" :size="28" />
          </div>
          <div class="text-left">
            <p class="text-lg font-black tracking-tighter text-zinc-900">{{ $t('dashboard.actions_add_transaction') }}</p>
            <p class="text-sm font-bold text-zinc-400">{{ $t('dashboard.actions_add_transaction_desc') }}</p>
          </div>
        </button>
      </div>
      <div class="animate-in fade-in slide-in-from-bottom-6 delay-1000 duration-700 fill-mode-both md:col-span-3">
        <button
          class="flex w-full items-center gap-6 rounded-4xl border border-zinc-200/50 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-100"
          @click="navigateTo('/categories')"
        >
          <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-100 transition-all duration-500 hover:scale-110">
            <Icon name="hugeicons:grid-view" :size="28" />
          </div>
          <div class="text-left">
            <p class="text-lg font-black tracking-tighter text-zinc-900">{{ $t('dashboard.actions_manage_categories') }}</p>
            <p class="text-sm font-bold text-zinc-400">{{ $t('dashboard.actions_manage_categories_desc') }}</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import type { BudgetWithProgress } from '~/composables/useBudgets';
import type { AccountWithBalance } from '~/composables/useAccounts';

const { user } = useAuth();
const { transactions, fetchTransactions } = useTransactions();
const { categories, fetchCategories } = useCategories();
const { formatCurrency } = useCurrency();
const { t, locale } = useI18n();
const { fetchPartner, partner, isPartnered } = usePartner();
const { fetchBudgetWithProgress } = useBudgets();
const { fetchAccounts, getAccountBalances } = useAccounts();
const { history, currentNetWorth, fetchNetWorthHistory } = useNetWorth();
const { recurring, fetchRecurring } = useRecurring();
const { activeReminders, dismissReminder } = useReminders();

const loading = ref(true);
const selectedPeriod = ref('30d');
const viewMode = ref<'all' | 'mine' | 'partner'>('all');
const budgetSummaries = ref<BudgetWithProgress[]>([]);
const accountBalances = ref<AccountWithBalance[]>([]);

const chartPeriods = ['7d', '30d', '90d'];

const viewModes = computed(() => [
  { value: 'all' as const, label: t('transactions.all') },
  { value: 'mine' as const, label: t('dashboard.greeting') },
  {
    value: 'partner' as const,
    label: partner.value?.display_name?.split(' ')[0] || t('sidebar.partner'),
  },
]);

const filteredTransactions = computed(() => {
  const all = transactions.value;
  if (!isPartnered.value || viewMode.value === 'all') {
    return all;
  }
  const targetUserId = viewMode.value === 'mine' ? user.value?.id : partner.value?.id;
  if (!targetUserId) {
    return all;
  }
  return all.filter((tx) => tx.user_id === targetUserId);
});

const displayName = computed(() => {
  const name = user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || '';
  return name.split(' ')[0] || t('dashboard.user');
});

const monthLabel = computed(() => {
  const d = new Date();
  return d.toLocaleDateString(locale.value, {
    month: 'long',
    year: 'numeric',
  });
});

const formatRelativeDate = (date: string) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return t('dashboard.today');
  }
  if (diffDays === 1) {
    return t('dashboard.yesterday');
  }
  if (diffDays < 7) {
    return t('dashboard.days_ago', { days: diffDays });
  }
  return d.toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'short',
  });
};

const categoryMap = computed(() => {
  const map = new Map<string, { name: string; color: string }>();
  for (const cat of categories.value) {
    map.set(cat.id, { name: cat.name, color: cat.color });
  }
  return map;
});

const getCategoryName = (id: string | null) => {
  if (!id) {
    return '';
  }
  return categoryMap.value.get(id)?.name || '';
};
const getCategoryColor = (id: string | null) => {
  if (!id) {
    return '#6b7280';
  }
  return categoryMap.value.get(id)?.color || '#6b7280';
};

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const thisMonthTransactions = computed(() =>
  filteredTransactions.value.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }),
);

const totalIncome = computed(() =>
  thisMonthTransactions.value.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
);

const totalExpense = computed(() =>
  thisMonthTransactions.value.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
);

const balance = computed(() => totalIncome.value - totalExpense.value);

const trendIncome = computed(() => {
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prev = filteredTransactions.value
    .filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear && tx.type === 'income';
    })
    .reduce((s, t) => s + t.amount, 0);
  if (prev === 0) {
    return totalIncome.value > 0 ? null : 0;
  }
  return Math.round(((totalIncome.value - prev) / prev) * 100);
});

const trendExpense = computed(() => {
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prev = filteredTransactions.value
    .filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear && tx.type === 'expense';
    })
    .reduce((s, t) => s + t.amount, 0);
  if (prev === 0) {
    return totalExpense.value > 0 ? null : 0;
  }
  return Math.round(((totalExpense.value - prev) / prev) * 100);
});

const trendBalance = computed(() => {
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevIncome = filteredTransactions.value
    .filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear && tx.type === 'income';
    })
    .reduce((s, t) => s + t.amount, 0);
  const prevExpense = filteredTransactions.value
    .filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear && tx.type === 'expense';
    })
    .reduce((s, t) => s + t.amount, 0);
  const prevBalance = prevIncome - prevExpense;
  if (prevBalance === 0) {
    return balance.value !== 0 ? null : 0;
  }
  return Math.round(((balance.value - prevBalance) / prevBalance) * 100);
});

const recentTransactions = computed(() =>
  [...filteredTransactions.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5),
);

const expenseByCategory = computed(() => {
  const map = new Map<string, { name: string; color: string; total: number }>();
  for (const tx of thisMonthTransactions.value) {
    if (tx.type !== 'expense') {
      continue;
    }
    const cat = tx.category_id ? categoryMap.value.get(tx.category_id) : undefined;
    const key = cat ? tx.category_id : 'uncategorized';
    const existing = map.get(key!);
    if (existing) {
      existing.total += tx.amount;
    } else {
      map.set(key!, {
        name: cat?.name || t('dashboard.other'),
        color: cat?.color || '#6b7280',
        total: tx.amount,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
});

const monthlyData = computed(() => {
  const months: { label: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const label = d.toLocaleDateString(locale.value, {
      month: 'short',
    });
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthTx = filteredTransactions.value.filter((tx) => {
      const td = new Date(tx.date);
      return td.getMonth() === m && td.getFullYear() === y;
    });
    months.push({
      label,
      income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    });
  }
  return months;
});

onMounted(async () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  await Promise.all([
    fetchTransactions({ dateFrom: firstDay }),
    fetchCategories(),
    fetchPartner(),
    fetchNetWorthHistory(),
    fetchRecurring(),
  ]);
  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  budgetSummaries.value = await fetchBudgetWithProgress(monthStr);
  await fetchAccounts();
  accountBalances.value = await getAccountBalances();
  loading.value = false;
});
</script>
