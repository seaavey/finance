<template>
  <div class="space-y-5 pb-6">
    <div class="flex items-center justify-between">
      <div>
        <ClientOnly>
          <h2 class="text-3xl font-bold tracking-tight">
            {{ $t('dashboard.greeting') }}, {{ displayName }}
          </h2>
          <template #fallback>
            <h2 class="text-3xl font-bold tracking-tight">
              {{ $t('dashboard.greeting_loading') }}
            </h2>
          </template>
        </ClientOnly>
        <p class="text-sm text-muted-foreground">{{ monthLabel }}</p>
      </div>
      <div v-if="isPartnered" class="flex gap-1 rounded-2xl border border-border/50 bg-card/30 p-1">
        <button
          v-for="mode in viewModes"
          :key="mode.value"
          class="rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            viewMode === mode.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="viewMode = mode.value"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-5">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-2xl bg-card" />
      </div>
      <div class="h-64 animate-pulse rounded-2xl bg-card" />
      <div class="h-52 animate-pulse rounded-2xl bg-card" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div
          class="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:col-span-1"
        >
          <div class="flex items-start justify-between">
            <div class="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10">
              <HugeiconsIcon :icon="Wallet01Icon" :size="18" class="text-indigo-400" />
            </div>
            <div
              class="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400"
            >
              {{
                trendBalance === null
                  ? $t('dashboard.new')
                  : `${balance >= 0 ? '+' : ''}${trendBalance}%`
              }}
            </div>
          </div>
          <p class="mt-3 text-xs text-muted-foreground">{{ $t('dashboard.balance_this_month') }}</p>
          <p class="mt-1 text-xl font-bold text-foreground">{{ formatCurrency(balance) }}</p>
          <p class="mt-1 text-[10px] text-muted-foreground/60">
            {{
              $t('dashboard.vs_last_month', {
                value:
                  (trendBalance || 0) > 0 ? '+' + trendBalance + '%' : (trendBalance || 0) + '%',
              })
            }}
          </p>
        </div>

        <div
          class="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:col-span-1"
        >
          <div class="flex items-start justify-between">
            <div class="flex size-9 items-center justify-center rounded-xl bg-green-500/10">
              <HugeiconsIcon :icon="ArrowDown01Icon" :size="18" class="text-green-500" />
            </div>
          </div>
          <p class="mt-3 text-xs text-muted-foreground">{{ $t('dashboard.income') }}</p>
          <p class="mt-1 text-xl font-bold text-foreground">{{ formatCurrency(totalIncome) }}</p>
        </div>

        <div
          class="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:col-span-1"
        >
          <div class="flex items-start justify-between">
            <div class="flex size-9 items-center justify-center rounded-xl bg-red-500/10">
              <HugeiconsIcon :icon="ArrowUp01Icon" :size="18" class="text-red-500" />
            </div>
          </div>
          <p class="mt-3 text-xs text-muted-foreground">{{ $t('dashboard.expense') }}</p>
          <p class="mt-1 text-xl font-bold text-foreground">{{ formatCurrency(totalExpense) }}</p>
        </div>

        <div
          class="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:col-span-1"
        >
          <div class="flex items-start justify-between">
            <div class="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10">
              <HugeiconsIcon :icon="Wallet01Icon" :size="18" class="text-cyan-500" />
            </div>
          </div>
          <p class="mt-3 text-xs text-muted-foreground">{{ $t('dashboard.savings_this_month') }}</p>
          <p class="mt-1 text-xl font-bold text-foreground">
            {{ formatCurrency(totalIncome - totalExpense > 0 ? totalIncome - totalExpense : 0) }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-2xl border border-border bg-card p-4">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foreground">
              {{ $t('dashboard.per_category') }}
            </h3>
            <div class="flex gap-1">
              <button
                v-for="period in chartPeriods"
                :key="period"
                class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                :class="
                  selectedPeriod === period
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                "
                @click="selectedPeriod = period"
              >
                {{ period }}
              </button>
            </div>
          </div>
          <ChartsExpenseDonut :categories="expenseByCategory" />
          <div v-if="expenseByCategory.length > 0" class="mt-4 space-y-2">
            <div
              v-for="cat in expenseByCategory"
              :key="cat.name"
              class="flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-2">
                <span class="size-2 rounded-full" :style="{ backgroundColor: cat.color }" />
                <span class="text-muted-foreground">{{ cat.name }}</span>
              </div>
              <span class="font-medium text-foreground">{{ formatCurrency(cat.total) }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-border bg-card p-4">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foreground">
              {{ $t('dashboard.expense_chart') }}
            </h3>
            <span class="text-xs text-muted-foreground/60">{{
              $t('dashboard.income_vs_expense')
            }}</span>
          </div>
          <ChartsMonthlyBar :data="monthlyData" />
          <div class="mt-3 flex justify-center gap-4">
            <div class="flex items-center gap-1.5 text-xs">
              <span class="size-2.5 rounded-sm bg-green-500/70" />
              <span class="text-muted-foreground">{{ $t('dashboard.income') }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
              <span class="size-2.5 rounded-sm bg-red-500/70" />
              <span class="text-muted-foreground">{{ $t('dashboard.expense') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-card">
        <div class="flex items-center justify-between p-4 pb-0">
          <h3 class="text-sm font-semibold text-foreground">{{ $t('dashboard.recent') }}</h3>
          <NuxtLinkLocale
            to="/transactions"
            class="text-xs font-medium text-primary hover:underline"
          >
            {{ $t('dashboard.view_all') }}
          </NuxtLinkLocale>
        </div>
        <div class="p-4">
          <div
            v-if="recentTransactions.length === 0"
            class="flex flex-col items-center gap-3 py-8 text-center"
          >
            <div class="flex size-12 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon
                :icon="ArrowLeftRightIcon"
                :size="24"
                class="text-muted-foreground/40"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-foreground">{{ $t('dashboard.empty_title') }}</p>
              <p class="text-xs text-muted-foreground">{{ $t('dashboard.empty_desc') }}</p>
            </div>
            <NuxtLinkLocale
              to="/transactions/new"
              class="mt-1 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {{ $t('dashboard.add_transaction') }}
            </NuxtLinkLocale>
          </div>
          <div v-else class="-mx-4 space-y-0">
            <NuxtLinkLocale
              v-for="(tx, index) in recentTransactions"
              :key="tx.id"
              :to="`/transactions/${tx.id}/edit`"
              class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
              :class="index < recentTransactions.length - 1 ? 'border-b border-border' : ''"
            >
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-xl"
                :class="tx.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'"
              >
                <HugeiconsIcon
                  :icon="tx.type === 'income' ? ArrowDown01Icon : ArrowUp01Icon"
                  :size="16"
                  :class="tx.type === 'income' ? 'text-green-500' : 'text-red-500'"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-foreground">
                  {{
                    tx.description || getCategoryName(tx.category_id) || $t('sidebar.transactions')
                  }}
                </p>
                <div class="mt-0.5 flex items-center gap-2">
                  <span class="text-xs text-muted-foreground/60">{{
                    formatRelativeDate(tx.date)
                  }}</span>
                  <span v-if="tx.category_id" class="size-1 rounded-full bg-muted-foreground/30" />
                  <span
                    v-if="getCategoryName(tx.category_id)"
                    class="rounded-md px-1.5 py-0.5 text-xs font-medium"
                    :style="{
                      backgroundColor: getCategoryColor(tx.category_id) + '20',
                      color: getCategoryColor(tx.category_id),
                    }"
                  >
                    {{ getCategoryName(tx.category_id) }}
                  </span>
                </div>
              </div>
              <p
                class="shrink-0 text-sm font-bold"
                :class="tx.type === 'income' ? 'text-green-500' : 'text-red-500'"
              >
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
              </p>
            </NuxtLinkLocale>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          class="flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          @click="navigateToLocale('/transactions/new')"
        >
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10"
          >
            <HugeiconsIcon :icon="Add01Icon" :size="22" class="text-indigo-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">
              {{ $t('dashboard.actions_add_transaction') }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ $t('dashboard.actions_add_transaction_desc') }}
            </p>
          </div>
        </div>
        <div
          class="flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          @click="navigateToLocale('/categories')"
        >
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10"
          >
            <HugeiconsIcon :icon="GridViewIcon" :size="22" class="text-orange-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">
              {{ $t('dashboard.actions_manage_categories') }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ $t('dashboard.actions_manage_categories_desc') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Wallet01Icon,
  Add01Icon,
  GridViewIcon,
  ArrowLeftRightIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';

const { user } = useAuth();
const { transactions, fetchTransactions } = useTransactions();
const { categories, fetchCategories } = useCategories();
const { formatCurrency } = useCurrency();
const { t } = useI18n();
const { partner, isPartnered, fetchPartner } = usePartner();

const loading = ref(true);
const selectedPeriod = ref('30d');
const viewMode = ref<'all' | 'mine' | 'partner'>('all');

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
  return name.split(' ')[0] || 'User';
});

const monthLabel = computed(() => {
  const d = new Date();
  return d.toLocaleDateString(currentLocale.value === 'id' ? 'id-ID' : 'en-US', {
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
    return currentLocale.value === 'id' ? `${diffDays} hari lalu` : `${diffDays} days ago`;
  }
  return d.toLocaleDateString(currentLocale.value === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
};

const getCategoryName = (id: string | null) => {
  if (!id) {
    return '';
  }
  return categories.value.find((c) => c.id === id)?.name || '';
};

const getCategoryColor = (id: string | null) => {
  if (!id) {
    return '#6b7280';
  }
  return categories.value.find((c) => c.id === id)?.color || '#6b7280';
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
  thisMonthTransactions.value
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = categories.value.find((c) => c.id === t.category_id);
      const key = cat?.id || 'uncategorized';
      const existing = map.get(key);
      if (existing) {
        existing.total += t.amount;
      } else {
        map.set(key, {
          name: cat?.name || t('dashboard.other'),
          color: cat?.color || '#6b7280',
          total: t.amount,
        });
      }
    });
  return [...map.values()].sort((a, b) => b.total - a.total);
});

const monthlyData = computed(() => {
  const months: { label: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const label = d.toLocaleDateString(currentLocale.value === 'id' ? 'id-ID' : 'en-US', {
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
  await Promise.all([fetchTransactions(), fetchCategories(), fetchPartner()]);
  loading.value = false;
});
</script>
