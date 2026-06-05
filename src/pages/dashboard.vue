<template>
  <div class="pb-10 pt-4">
    <!-- Header with Greeting -->
    <div class="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div>
        <ClientOnly>
          <h2 class="text-4xl font-black tracking-tighter text-foreground md:text-5xl">
            {{ $t('dashboard.greeting') }}, {{ displayName }}
          </h2>
          <template #fallback>
            <h2 class="text-4xl font-black tracking-tighter text-foreground md:text-5xl">
              {{ $t('dashboard.greeting_loading') }}
            </h2>
          </template>
        </ClientOnly>
        <p class="mt-2 font-bold uppercase tracking-widest text-muted-foreground/90">
          {{ monthLabel }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div
          v-if="isPartnered"
          class="flex gap-1 rounded-2xl border border-border/50 bg-card/30 p-1 shadow-sm backdrop-blur-md"
        >
          <Button
            v-for="mode in viewModes"
            :key="mode.value"
            :variant="viewMode === mode.value ? 'default' : 'ghost'"
            size="sm"
            class="rounded-xl px-4 transition-all duration-300"
            :class="viewMode === mode.value ? 'shadow-sm' : 'text-muted-foreground'"
            @click="viewMode = mode.value"
          >
            {{ mode.label }}
          </Button>
        </div>

        <div
          class="flex gap-1 rounded-2xl border border-border/50 bg-card/30 p-1 shadow-sm backdrop-blur-md"
        >
          <Button
            v-for="p in periodOptions"
            :key="p.value"
            :variant="period === p.value ? 'default' : 'ghost'"
            size="sm"
            class="h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-wider transition-all duration-300"
            :class="period === p.value ? 'shadow-sm' : 'text-muted-foreground'"
            @click="period = p.value"
          >
            {{ p.label }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
      <div class="h-64 animate-pulse rounded-4xl bg-muted/50 md:col-span-2 lg:col-span-3" />
      <div
        v-for="i in 3"
        :key="i"
        class="h-64 animate-pulse rounded-4xl bg-muted/50 md:col-span-1 lg:col-span-1"
      />
      <div class="h-96 animate-pulse rounded-4xl bg-muted/50 md:col-span-2 lg:col-span-4" />
      <div class="h-96 animate-pulse rounded-4xl bg-muted/50 md:col-span-2 lg:col-span-2" />
    </div>

    <!-- Bento Grid Content -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-6">
      <!-- Main Balance Hero Card (3 cols) -->
      <div
        class="group relative flex flex-col justify-between overflow-hidden rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-none md:col-span-6 lg:col-span-3"
      >
        <div class="relative z-10">
          <div class="flex items-center gap-3">
            <div
              class="flex size-10 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-200 dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-none"
            >
              <AppIcon name="hugeicons:wallet-01" :size="20" />
            </div>
            <span class="text-sm font-bold tracking-tight text-muted-foreground uppercase">{{
              $t('dashboard.balance_this_month')
            }}</span>
          </div>
          <div class="mt-4">
            <h1
              class="text-5xl font-black tracking-tighter text-foreground leading-none md:text-6xl"
            >
              {{ formatCurrency(balance, activeCurrency) }}
            </h1>
            <div class="mt-4 flex items-center gap-2">
              <div
                class="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black"
                :class="
                  balance >= 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                "
              >
                <AppIcon
                  :name="balance >= 0 ? 'hugeicons:arrow-up-01' : 'hugeicons:arrow-down-01'"
                  :size="14"
                />
                {{ trendBalance === null ? $t('dashboard.new') : `${Math.abs(trendBalance)}%` }}
              </div>
              <span class="text-xs font-bold text-muted-foreground/90">{{
                $t('dashboard.vs_last_month_short')
              }}</span>
            </div>
          </div>
        </div>
        <div
          class="absolute -right-12 -top-12 size-64 rounded-full bg-muted/30 transition-all duration-700 group-hover:scale-110 group-hover:bg-muted/50"
        />
      </div>

      <!-- Income Stats (1 col) -->
      <div
        class="flex flex-col justify-between rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg md:col-span-2 lg:col-span-1"
      >
        <div
          class="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
        >
          <AppIcon name="hugeicons:arrow-down-01" :size="24" />
        </div>
        <div>
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('dashboard.income') }}
          </p>
          <p class="mt-1 text-2xl font-black tracking-tighter text-foreground">
            {{ formatCurrency(totalIncome, activeCurrency) }}
          </p>
        </div>
      </div>

      <!-- Expense Stats (1 col) -->
      <div
        class="flex flex-col justify-between rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg md:col-span-2 lg:col-span-1"
      >
        <div
          class="flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm"
        >
          <AppIcon name="hugeicons:arrow-up-01" :size="24" />
        </div>
        <div>
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('dashboard.expense') }}
          </p>
          <p class="mt-1 text-2xl font-black tracking-tighter text-foreground">
            {{ formatCurrency(totalExpense, activeCurrency) }}
          </p>
        </div>
      </div>

      <!-- Net Worth Stats (1 col) -->
      <div
        class="flex flex-col justify-between rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg md:col-span-2 lg:col-span-1"
      >
        <div
          class="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
        >
          <AppIcon name="hugeicons:chart-line-data-01" :size="24" />
        </div>
        <div>
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('dashboard.net_worth') }}
          </p>
          <p class="mt-1 text-2xl font-black tracking-tighter text-foreground">
            {{ formatCurrency(currentNetWorth?.netWorth || 0, defaultCurrency) }}
          </p>
        </div>
      </div>

      <!-- Analytics Area: Monthly Bar Chart (4 cols) -->
      <div
        class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg md:col-span-6 lg:col-span-4"
      >
        <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 class="text-xl font-black tracking-tighter text-foreground">
              {{ $t('dashboard.expense_chart') }}
            </h3>
            <p class="text-sm font-medium text-muted-foreground">
              {{ $t('dashboard.monthly_performance') }}
            </p>
          </div>
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <span
                class="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              />
              <span class="text-xs font-bold text-muted-foreground">{{
                $t('dashboard.income')
              }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="size-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
              <span class="text-xs font-bold text-muted-foreground">{{
                $t('dashboard.expense')
              }}</span>
            </div>
          </div>
        </div>
        <div class="h-[460px]">
          <ClientOnly>
            <ChartsMonthlyBar :data="monthlyData" />
            <template #fallback>
              <div class="flex h-full items-center justify-center">
                <Skeleton class="h-full w-full rounded-xl" />
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <!-- Side Section: Budget/Accounts/Reminders (2 cols) -->
      <div class="flex flex-col gap-4 md:col-span-6 lg:col-span-2">
        <BillDashboardWidget />

        <!-- Budget Progress -->
        <div
          class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md flex-1"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              {{ $t('budget.dashboard_title') }}
            </h3>
            <router-link
              to="/budget"
              class="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
            >
              {{ $t('dashboard.view_all') }}
            </router-link>
          </div>
          <div class="flex h-full flex-col justify-center pb-4">
            <template v-if="budgetSummaries.length > 0">
              <div
                v-for="sbudget in budgetSummaries.slice(0, 3)"
                :key="sbudget.id"
                class="mb-4 last:mb-0"
              >
                <div class="flex items-center justify-between">
                  <p class="text-xs font-bold text-foreground truncate pr-2">
                    {{ sbudget.category_name }}
                  </p>
                  <p class="text-[10px] font-black text-muted-foreground">
                    {{ Math.round((sbudget.spent / sbudget.amount) * 100) }}%
                  </p>
                </div>
                <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="sbudget.spent > sbudget.amount ? 'bg-rose-500' : 'bg-primary'"
                    :style="{ width: `${Math.min((sbudget.spent / sbudget.amount) * 100, 100)}%` }"
                  />
                </div>
              </div>
            </template>
            <div v-else class="flex flex-col items-center justify-center py-6 text-center">
              <div class="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted/50">
                <AppIcon name="hugeicons:chart" :size="20" class="text-muted-foreground/40" />
              </div>
              <p class="text-xs text-muted-foreground font-bold uppercase tracking-tight">
                {{ $t('budget.empty') }}
              </p>
              <Button
                variant="outline"
                size="sm"
                class="mt-3 rounded-xl border-border/50 text-[10px] font-black uppercase tracking-widest"
                @click="router.push(`/budget/new?month=${currentMonthStr}`)"
              >
                <AppIcon name="hugeicons:add-01" :size="14" class="mr-1" />
                {{ $t('budget.set_budget') }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions (Full Width - 6 cols) -->
      <div
        class="rounded-4xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-lg md:col-span-6"
      >
        <div class="flex items-center justify-between border-b border-border/50 p-6">
          <div>
            <h3 class="text-xl font-black tracking-tighter text-foreground">
              {{ $t('dashboard.recent') }}
            </h3>
            <p class="text-sm font-medium text-muted-foreground">
              {{ $t('dashboard.latest_activity') }}
            </p>
          </div>
          <router-link
            to="/transactions"
            class="rounded-xl border border-border px-4 py-2 text-xs font-black text-foreground transition-all hover:bg-muted hover:border-border"
          >
            {{ $t('dashboard.view_all') }}
          </router-link>
        </div>

        <div class="p-4">
          <div
            v-if="recentTransactions.length === 0"
            class="flex flex-col items-center gap-4 py-12 text-center"
          >
            <div class="flex size-16 items-center justify-center rounded-full bg-muted/50">
              <AppIcon
                name="hugeicons:arrow-left-right"
                :size="32"
                class="text-muted-foreground/30"
              />
            </div>
            <div>
              <p class="text-base font-black text-foreground tracking-tight">
                {{ $t('dashboard.empty_title') }}
              </p>
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('dashboard.empty_desc') }}
              </p>
            </div>
          </div>
          <div v-else class="grid grid-cols-1 gap-1">
            <router-link
              v-for="tx in recentTransactions"
              :key="tx.id"
              :to="`/transactions/${tx.id}/edit`"
              class="group flex items-center gap-4 rounded-3xl p-4 transition-all hover:bg-muted/50"
            >
              <div
                class="flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm"
                :class="
                  tx.type === 'income'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                "
              >
                <AppIcon
                  :name="tx.type === 'income' ? 'hugeicons:arrow-down-01' : 'hugeicons:arrow-up-01'"
                  :size="20"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-black text-foreground">
                    {{
                      tx.description ||
                      getCategoryName(tx.category_id) ||
                      $t('sidebar.transactions')
                    }}
                  </p>
                  <span
                    v-if="getCategoryName(tx.category_id)"
                    class="rounded-full bg-muted px-2 py-0.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest"
                  >
                    {{ getCategoryName(tx.category_id) }}
                  </span>
                </div>
                <p class="text-xs font-bold text-muted-foreground/90">
                  {{ formatRelativeDate(tx.date) }}
                </p>
              </div>
              <p
                class="shrink-0 text-lg font-black tracking-tighter"
                :class="
                  tx.type === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-foreground'
                "
              >
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount, tx.currency) }}
              </p>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Quick Accounts -->
      <div
        class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-lg md:col-span-6"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('dashboard.accounts_title') }}
          </h3>
          <router-link
            to="/accounts"
            class="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
          >
            {{ $t('dashboard.view_all') }}
          </router-link>
        </div>
        <div class="flex h-full flex-col justify-center pb-4">
          <template v-if="accountBalances.length > 0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="acct in accountBalances.slice(0, 3)"
                :key="acct.id"
                class="flex items-center justify-between rounded-xl bg-muted/30 p-2 transition-all hover:bg-muted/50"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="flex size-7 items-center justify-center rounded-lg bg-card shadow-sm border border-border/50"
                  >
                    <AppIcon v-if="acct.icon" :name="acct.icon" :size="14" class="text-primary" />
                  </div>
                  <span class="truncate text-xs font-bold text-foreground">{{ acct.name }}</span>
                </div>
                <span class="text-xs font-black tracking-tighter text-foreground">{{
                  formatCurrency(acct.balance, acct.currency)
                }}</span>
              </div>
            </div>
          </template>
          <div v-else class="flex flex-col items-center justify-center py-4 text-center">
            <div class="mb-2 flex size-10 items-center justify-center rounded-xl bg-muted/50">
              <AppIcon name="hugeicons:bank" :size="18" class="text-muted-foreground/40" />
            </div>
            <p class="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
              {{ $t('accounts.empty') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="md:col-span-3">
        <button
          class="flex w-full items-center gap-6 rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-none"
          @click="router.push('/transactions/new')"
        >
          <div
            class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all duration-500 hover:scale-110"
          >
            <AppIcon name="hugeicons:add-01" :size="28" />
          </div>
          <div class="text-left">
            <p class="text-lg font-black tracking-tighter text-foreground">
              {{ $t('dashboard.actions_add_transaction') }}
            </p>
            <p class="text-sm font-bold text-muted-foreground">
              {{ $t('dashboard.actions_add_transaction_desc') }}
            </p>
          </div>
        </button>
      </div>
      <div class="md:col-span-3">
        <button
          class="flex w-full items-center gap-6 rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-none"
          @click="router.push('/categories')"
        >
          <div
            class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 transition-all duration-500 hover:scale-110"
          >
            <AppIcon name="hugeicons:grid-view" :size="28" />
          </div>
          <div class="text-left">
            <p class="text-lg font-black tracking-tighter text-foreground">
              {{ $t('dashboard.actions_manage_categories') }}
            </p>
            <p class="text-sm font-bold text-muted-foreground">
              {{ $t('dashboard.actions_manage_categories_desc') }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DashboardPage',
})
import { Button } from '@/components/ui/button'
import { formatDateSafe } from '@/lib/utils'
import type { BudgetWithProgress } from '@/composables/useBudgets'
import type { AccountWithBalance } from '@/composables/useAccounts'
import BillDashboardWidget from '@/components/BillDashboardWidget.vue'

const ChartsMonthlyBar = defineAsyncComponent(() => import('@/components/charts/MonthlyBar.vue'))

const router = useRouter()
const { user, getSession } = useAuth()
const { transactions, fetchTransactions } = useTransactions()
const { categories, fetchCategories } = useCategories()
const { formatCurrency, defaultCurrency, convertTo } = useCurrency()
const { t, locale } = useI18n()
const { fetchPartner, partner, isPartnered } = usePartner()
const { fetchBudgetWithProgress, checkBudgetAlerts } = useBudgets()
const { fetchAccounts, getAccountBalances } = useAccounts()
const { currentNetWorth, fetchNetWorthHistory } = useNetWorth()
const { fetchRecurring, processDueRecurring } = useRecurring()
useReminders()

const loading = ref(true)
const viewMode = ref<'mine' | 'partner'>('mine')
const period = ref<'1d' | '7d' | '30d' | 'all'>('7d')
const budgetSummaries = ref<BudgetWithProgress[]>([])
const accountBalances = ref<AccountWithBalance[]>([])

const periodOptions = [
  { value: '1d' as const, label: '1D' },
  { value: '7d' as const, label: '7D' },
  { value: '30d' as const, label: '30D' },
  { value: 'all' as const, label: 'ALL' },
]

const viewModes = computed(() => [
  { value: 'mine' as const, label: displayName.value },
  {
    value: 'partner' as const,
    label: partner.value?.display_name?.split(' ')[0] || t('sidebar.partner'),
  },
])

const filteredTransactions = computed(() => {
  let list = transactions.value

  // 1. View Mode Filter (Self/Partner)
  if (isPartnered.value) {
    const targetUserId = viewMode.value === 'mine' ? user.value?.id : partner.value?.id
    if (targetUserId) {
      list = list.filter((tx) => tx.user_id === targetUserId)
    }
  }

  // 2. Period Filter
  if (period.value !== 'all') {
    const now = new Date()
    const daysMap = { '1d': 1, '7d': 7, '30d': 30 }
    const cutoff = new Date(now.getTime() - daysMap[period.value] * 24 * 60 * 60 * 1000)
    list = list.filter((tx) => new Date(tx.date) >= cutoff)
  }

  return list
})

const displayName = computed(() => {
  const name = user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || ''
  if (!name) {
    return t('dashboard.user')
  }
  return name.split(' ')[0]
})

// Determine which currency to use based on view mode
const activeCurrency = computed(() => {
  if (viewMode.value === 'partner' && isPartnered.value && partner.value?.currency) {
    return partner.value.currency
  }
  return defaultCurrency.value
})

// Convert a transaction amount to active currency using exchange rates
const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amount
  const converted = convertTo(amount, fromCurrency, toCurrency)
  if (converted !== null) return converted
  // If conversion fails (rates not loaded), fall back to 0 rather than silently using wrong currency
  console.warn(`Currency conversion failed: ${fromCurrency}→${toCurrency} for amount ${amount}`)
  return 0
}

const monthLabel = computed(() => {
  if (period.value === '1d') {
    return t('dashboard.today')
  }
  if (period.value === '7d') {
    return t('dashboard.last_7_days')
  }
  if (period.value === '30d') {
    return t('dashboard.last_30_days')
  }
  return t('dashboard.all_time')
})

const formatRelativeDate = (date: string) => {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) {
    return t('dashboard.today')
  }
  if (diffDays === 1) {
    return t('dashboard.yesterday')
  }
  if (diffDays < 7) {
    return t('dashboard.days_ago', { days: diffDays })
  }
  return d.toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'short',
  })
}

const categoryMap = computed(() => {
  const map = new Map<string, { name: string; color: string }>()
  for (const cat of categories.value) {
    map.set(cat.id, { name: cat.name, color: cat.color })
  }
  return map
})

const getCategoryName = (id: string | null) => {
  if (!id) {
    return ''
  }
  return categoryMap.value.get(id)?.name || ''
}

const totalIncome = computed(() =>
  filteredTransactions.value
    .filter((t) => t.type === 'income')
    .reduce(
      (s, t) =>
        s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCurrency.value),
      0,
    ),
)

const totalExpense = computed(() =>
  filteredTransactions.value
    .filter((t) => t.type === 'expense')
    .reduce(
      (s, t) =>
        s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCurrency.value),
      0,
    ),
)

const balance = computed(() => totalIncome.value - totalExpense.value)

const currentMonthStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
})

const trendBalance = computed(() => {
  if (period.value === 'all') {
    return 0
  }

  const now = new Date()
  const daysMap = { '1d': 1, '7d': 7, '30d': 30 }
  const days = daysMap[period.value]

  const currentCutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const prevCutoff = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000)

  const prevTransactions = transactions.value.filter((tx) => {
    const d = new Date(tx.date)
    return d >= prevCutoff && d < currentCutoff
  })

  const activeCur = activeCurrency.value
  const prevIncome = prevTransactions
    .filter((tx) => tx.type === 'income')
    .reduce(
      (s, t) => s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur),
      0,
    )
  const prevExpense = prevTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce(
      (s, t) => s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur),
      0,
    )

  const prevBalance = prevIncome - prevExpense
  if (prevBalance === 0) {
    return balance.value !== 0 ? null : 0
  }
  return Math.round(((balance.value - prevBalance) / prevBalance) * 100)
})

const recentTransactions = computed(() =>
  [...filteredTransactions.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5),
)

const monthlyData = computed(() => {
  // If viewing 1D or 7D, show daily granularity. If 30D or ALL, show monthly.
  if (period.value === '1d' || period.value === '7d') {
    const days = period.value === '1d' ? 1 : 7
    const data: { label: string; income: number; expense: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric' })
      const dateStr = formatDateSafe(d)

      const dayTx = filteredTransactions.value.filter((tx) => tx.date === dateStr)
      const activeCur = activeCurrency.value
      data.push({
        label,
        income: dayTx
          .filter((t) => t.type === 'income')
          .reduce(
            (s, t) => s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur),
            0,
          ),
        expense: dayTx
          .filter((t) => t.type === 'expense')
          .reduce(
            (s, t) => s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur),
            0,
          ),
      })
    }
    return data
  }

  // Monthly logic for 30D and ALL
  const months: { label: string; income: number; expense: number }[] = []
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1)
    const label = d.toLocaleDateString(locale.value, { month: 'short' })
    const m = d.getMonth()
    const y = d.getFullYear()

    const monthTx = transactions.value.filter((tx) => {
      const td = new Date(tx.date)
      return td.getMonth() === m && td.getFullYear() === y
    })

    const activeCur = activeCurrency.value
    months.push({
      label,
      income: monthTx
        .filter((t) => t.type === 'income')
        .reduce(
          (s, t) => s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur),
          0,
        ),
      expense: monthTx
        .filter((t) => t.type === 'expense')
        .reduce(
          (s, t) => s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur),
          0,
        ),
    })
  }
  return months
})

onMounted(async () => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const sixMonthsAgo = formatDateSafe(new Date(currentYear, currentMonth - 5, 1))

  // Ensure session is loaded before fetching (defense-in-depth for OAuth redirect)
  await getSession()

  await Promise.all([
    fetchTransactions({ dateFrom: sixMonthsAgo }),
    fetchCategories(),
    fetchPartner(),
    fetchNetWorthHistory(),
    fetchRecurring(),
    loadCurrency(),
  ])

  // Auto-process due recurring transactions
  await processDueRecurring()

  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
  const [budgets] = await Promise.all([fetchBudgetWithProgress(monthStr), fetchAccounts()])
  budgetSummaries.value = budgets
  accountBalances.value = await getAccountBalances()

  // Check budget thresholds for alerts after fresh budget data is loaded
  await checkBudgetAlerts(monthStr)

  loading.value = false
})
</script>
