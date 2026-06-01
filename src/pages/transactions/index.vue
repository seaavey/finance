<template>
  <div class="pb-10 pt-4">
    <!-- Header -->
    <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 class="text-4xl font-bold tracking-tighter text-foreground">
          {{ $t('transactions.title')}}
        </h2>
        <p class="mt-1 font-medium text-muted-foreground">
          {{ filteredTransactions.length }} {{ $t('transactions.title').toLowerCase()}}
        </p>
      </div>
      <Button
        class="flex items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:-translate-y-0.5"
        @click="router.push('/transactions/new')"
      >
        <AppIcon name="hugeicons:add-01" :size="18" />
        <span>{{ $t('topbar.add')}}</span>
      </Button>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
      <!-- Search & Filters Bento Card (Full on xs/md, 4 cols on lg) -->
      <div
        class="flex flex-col rounded-4xl border border-border/50 bg-card p-4 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both md:col-span-2 lg:col-span-4"
        :class="showFilters ? 'gap-4' : 'gap-0'"
      >
        <div class="flex items-center gap-3">
          <div class="relative flex-1">
            <AppIcon
              name="hugeicons:search-01"
              :size="22"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50"
            />
            <Input
              v-model="filters.search"
              :placeholder="$t('transactions.search_placeholder')"
              class="h-14 rounded-2xl border-none bg-muted/50 pl-12 pr-4 text-lg font-medium focus-visible:ring-primary/20"
              @input="debouncedFetch"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            class="size-14 rounded-2xl border-border/50 transition-all"
            :class="
              showFilters
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-muted/30'
            "
            @click="showFilters = !showFilters"
          >
            <AppIcon name="hugeicons:filter" :size="20" />
          </Button>
        </div>

        <!-- Expanded Filters -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div v-if="showFilters" class="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            <Select v-model="filters.type" @update:model-value="applyFilters">
              <SelectTrigger class="h-11 rounded-xl border-border/50 bg-muted/30">
                <SelectValue :placeholder="$t('transactions.all_types')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{{ $t('transactions.all_types')}}</SelectItem>
                <SelectItem value="income">{{ $t('transactions.income')}}</SelectItem>
                <SelectItem value="expense">{{ $t('transactions.expense')}}</SelectItem>
              </SelectContent>
            </Select>

            <CategoryPicker
              v-model="filters.category_id"
              :placeholder="$t('transactions.all_categories')"
              class="h-11 rounded-xl border-border/50 bg-muted/30"
              @update:model-value="applyFilters"
            />

            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  class="h-11 w-full justify-start rounded-xl border-border/50 bg-muted/30 text-left font-normal"
                  :class="!dateRange.start && 'text-muted-foreground'"
                >
                  <AppIcon name="hugeicons:calendar-01" :size="16" class="mr-2" />
                  <span v-if="dateRange.start && dateRange.end" class="truncate">
                    {{ formatDate(dateRange.start) }} - {{ formatDate(dateRange.end) }}
                  </span>
                  <span v-else>{{ $t('transactions.select_date_range')}}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-[calc(100vw-32px)] p-0 sm:w-auto" align="start">
                <RangeCalendar
                  v-model="dateRange"
                  :number-of-months="1"
                  locale="id-ID"
                  @update:model-value="onDateRangeChange"
                />
              </PopoverContent>
            </Popover>

            <div
              v-if="isPartnered"
              class="flex items-center gap-1 rounded-xl bg-muted/50 p-1 sm:col-span-2 lg:col-span-3"
            >
              <Button
                v-for="opt in ownerOptions"
                :key="opt.value"
                :variant="ownerFilter === opt.value ? 'default' : 'ghost'"
                size="sm"
                class="flex-1 rounded-lg h-9 text-xs font-bold"
                @click="
                  ownerFilter = opt.value;
                  applyFilters();
                "
              >
                {{ opt.label }}
              </Button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Quick Summary Cards (Side-by-side on md, 1 col each on lg) -->
      <div
        class="flex flex-col justify-between rounded-4xl border border-border/50 bg-emerald-500/5 p-6 shadow-sm transition-all hover:bg-emerald-500/10 animate-in fade-in slide-in-from-bottom-6 delay-100 duration-700 fill-mode-both md:col-span-1 lg:col-span-1"
      >
        <div
          class="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
        >
          <AppIcon name="hugeicons:arrow-down-01" :size="24" />
        </div>
        <div class="mt-4">
          <p
            class="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase"
          >
            {{ $t('transactions.income')}}
          </p>
          <p class="mt-1 text-2xl font-black tracking-tighter text-foreground truncate">
            {{ formatCurrency(monthIncome) }}
          </p>
        </div>
      </div>

      <div
        class="flex flex-col justify-between rounded-4xl border border-border/50 bg-rose-500/5 p-6 shadow-sm transition-all hover:bg-rose-500/10 animate-in fade-in slide-in-from-bottom-6 delay-150 duration-700 fill-mode-both md:col-span-1 lg:col-span-1"
      >
        <div
          class="flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm"
        >
          <AppIcon name="hugeicons:arrow-up-01" :size="24" />
        </div>
        <div class="mt-4">
          <p
            class="text-[10px] font-black tracking-widest text-rose-600 dark:text-rose-400 uppercase"
          >
            {{ $t('transactions.expense')}}
          </p>
          <p class="mt-1 text-2xl font-black tracking-tighter text-foreground truncate">
            {{ formatCurrency(monthExpense) }}
          </p>
        </div>
      </div>

      <!-- Transaction List Bento Card (Full Width - 2 cols on md, 6 cols on lg) -->
      <div
        class="rounded-4xl border border-border/50 bg-card shadow-sm transition-all animate-in fade-in slide-in-from-bottom-6 delay-200 duration-700 fill-mode-both md:col-span-2 lg:col-span-6"
      >
        <div class="flex items-center justify-between border-b border-border/50 p-6 md:p-8">
          <div>
            <h3 class="text-xl font-black tracking-tighter text-foreground">
              {{ $t('transactions.title')}}
            </h3>
            <p class="text-sm font-medium text-muted-foreground">
              {{ $t('dashboard.latest_activity')}}
            </p>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">
              {{ $t('transactions.difference')}}
            </p>
            <p
              class="text-lg font-black tracking-tighter"
              :class="
                monthIncome - monthExpense >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              "
            >
              {{ formatCurrency(monthIncome - monthExpense) }}
            </p>
          </div>
        </div>

        <div class="p-4">
          <!-- Loading State -->
          <div v-if="loading" class="space-y-3">
            <Skeleton v-for="i in 5" :key="i" class="h-20 rounded-3xl" />
          </div>

          <!-- Empty State -->
          <div
            v-else-if="filteredTransactions.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center"
          >
            <div class="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/50">
              <AppIcon name="hugeicons:inbox" :size="32" class="text-muted-foreground/30" />
            </div>
            <div>
              <p class="text-base font-black text-foreground tracking-tight">
                {{ $t('transactions.empty')}}
              </p>
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('dashboard.empty_desc')}}
              </p>
            </div>
          </div>

          <!-- Grouped List -->
          <div v-else class="space-y-8">
            <div v-for="(group, date) in groupedTransactions" :key="date" class="space-y-3">
              <div class="flex items-center gap-4 px-2">
                <span
                  class="text-xs font-black uppercase tracking-widest text-muted-foreground/90 whitespace-nowrap"
                >
                  {{ formatGroupDate(date as string) }}
                </span>
                <div class="h-px w-full bg-border/40" />
              </div>
              <div class="grid grid-cols-1 gap-1">
                <router-link
                  v-for="tx in group"
                  :key="tx.id"
                  :to="`/transactions/${tx.id}/edit`"
                  class="group block"
                >
                  <TransactionItem :transaction="tx" />
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PagesTransactionsIndex',
})
import { Input } from '@/components/ui/input';
import type { TransactionFilters } from '@/composables/useTransactions';

interface CalendarDateLike {
  year: number;
  month: number;
  day: number;
}

const { transactions, loading, fetchTransactions } = useTransactions();
const { fetchCategories } = useCategories();
const { partner, isPartnered, fetchPartner } = usePartner();

const router = useRouter();
const { t } = useI18n();
const { formatCurrency } = useCurrency();
const { user } = useAuth();

const ownerFilter = ref<'all' | 'mine' | 'partner'>('all');

const ownerOptions = computed(() => [
  { value: 'all' as const, label: t('transactions.owner_filter_all') },
  { value: 'mine' as const, label: t('transactions.owner_filter_mine') },
  {
    value: 'partner' as const,
    label: partner.value?.display_name?.split(' ')[0] || t('transactions.owner_filter_partner'),
  },
]);

const filteredTransactions = computed(() => {
  const all = transactions.value;
  if (!isPartnered.value || ownerFilter.value === 'all') {
    return all;
  }
  if (ownerFilter.value === 'mine') {
    return all.filter((tx) => tx.user_id === user.value?.id);
  }
  // ownerFilter is 'partner'
  return all.filter((tx) => tx.user_id === partner.value?.id);
});

const monthIncome = computed(() =>
  filteredTransactions.value.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
);
const monthExpense = computed(() =>
  filteredTransactions.value.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
);

const showFilters = ref(false);
const filters = reactive({
  search: '',
  type: '',
  category_id: '',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dateRange = ref<any>({ start: undefined, end: undefined });

let debounceTimer: ReturnType<typeof setTimeout>;

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchPartner(), fetchTransactions()]);
});

const debouncedFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => applyFilters(), 300);
};

const onDateRangeChange = () => {
  applyFilters();
};

const formatDate = (date: CalendarDateLike) => {
  return new Date(date.year, date.month - 1, date.day).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const dateValueToString = (date: CalendarDateLike) => {
  const y = date.year;
  const m = String(date.month).padStart(2, '0');
  const d = String(date.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const applyFilters = () => {
  const f: TransactionFilters = {};
  if (filters.search) {
    f.search = filters.search;
  }
  if (filters.type && filters.type !== 'all') {
    f.type = filters.type as 'income' | 'expense';
  }
  if (filters.category_id) {
    f.category_id = filters.category_id;
  }
  if (dateRange.value.start) {
    f.dateFrom = dateValueToString(dateRange.value.start);
  }
  if (dateRange.value.end) {
    f.dateTo = dateValueToString(dateRange.value.end);
  }
  fetchTransactions(f);
};

const groupedTransactions = computed(() => {
  const groups: Record<string, typeof filteredTransactions.value> = {};
  for (const tx of filteredTransactions.value) {
    const date = tx.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
  }
  return groups;
});

const formatGroupDate = (date: string) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return t('transactions.today');
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return t('transactions.yesterday');
  }
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
</script>
