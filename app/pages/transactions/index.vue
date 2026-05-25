<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold">Transaksi</h2>
        <p class="text-sm text-muted-foreground">{{ transactions.length }} transaksi</p>
      </div>
    </div>

    <div class="flex items-center gap-3 rounded-3xl border border-border/50 bg-card/30 p-3">
      <div class="relative flex-1">
        <HugeiconsIcon :icon="Search01Icon" :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="filters.search"
          placeholder="Cari transaksi..."
          class="h-12 w-full rounded-2xl border border-border/50 bg-background/50 pl-12 pr-4 text-sm text-foreground outline-none transition focus:border-pink-500/20"
          @input="debouncedFetch"
        >
      </div>
      <button
        class="flex size-12 items-center justify-center rounded-2xl border border-border/50 bg-card/30 text-muted-foreground transition hover:bg-card/50"
        @click="showFilters = !showFilters"
      >
        <HugeiconsIcon :icon="FilterIcon" :size="20" />
      </button>
    </div>

    <div v-if="showFilters" class="space-y-3 rounded-3xl border border-border/50 bg-card/30 p-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select v-model="filters.type" @update:model-value="applyFilters">
          <SelectTrigger>
            <SelectValue placeholder="Semua tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua tipe</SelectItem>
            <SelectItem value="income">Pemasukan</SelectItem>
            <SelectItem value="expense">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>

        <CategoryPicker v-model="filters.category_id" placeholder="Semua kategori" @update:model-value="applyFilters" />
      </div>

      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline" class="w-full justify-start text-left font-normal" :class="!dateRange.start && 'text-muted-foreground'">
            <HugeiconsIcon :icon="Calendar01Icon" :size="16" class="mr-2" />
            <span v-if="dateRange.start && dateRange.end">
              {{ formatDate(dateRange.start) }} - {{ formatDate(dateRange.end) }}
            </span>
            <span v-else>Pilih rentang tanggal</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" align="start">
          <RangeCalendar
            v-model="dateRange"
            :number-of-months="1"
            locale="id-ID"
            @update:model-value="onDateRangeChange"
          />
        </PopoverContent>
      </Popover>
    </div>

    <div v-if="!loading" class="grid grid-cols-3 gap-4">
      <div class="rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.07] p-5">
        <p class="text-sm text-emerald-400/70">Pemasukan</p>
        <h3 class="mt-2 text-2xl font-bold text-emerald-400">{{ formatCurrency(monthIncome) }}</h3>
      </div>
      <div class="rounded-3xl border border-red-500/10 bg-red-500/[0.07] p-5">
        <p class="text-sm text-red-400/70">Pengeluaran</p>
        <h3 class="mt-2 text-2xl font-bold text-red-400">{{ formatCurrency(monthExpense) }}</h3>
      </div>
      <div class="rounded-3xl border border-blue-500/10 bg-blue-500/[0.07] p-5">
        <p class="text-sm text-blue-400/70">Selisih</p>
        <h3 class="mt-2 text-2xl font-bold text-blue-400">{{ formatCurrency(monthIncome - monthExpense) }}</h3>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-20 rounded-3xl" />
      <Skeleton class="h-20 rounded-3xl" />
      <Skeleton class="h-20 rounded-3xl" />
      <Skeleton class="h-20 rounded-3xl" />
    </div>

    <div v-else-if="transactions.length === 0" class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 bg-card/20 py-20">
      <div class="flex size-12 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon :icon="InboxIcon" :size="24" class="text-muted-foreground" />
      </div>
      <p class="mt-3 text-sm text-muted-foreground">Belum ada transaksi</p>
    </div>

    <div v-else class="space-y-4">
      <template v-for="(group, date) in groupedTransactions" :key="date">
        <div class="sticky top-0 z-10 bg-background/80 py-1.5 backdrop-blur-sm">
          <span class="text-xs font-medium text-muted-foreground">{{ formatGroupDate(date as string) }}</span>
        </div>
        <div class="space-y-2">
          <NuxtLink
            v-for="tx in group"
            :key="tx.id"
            :to="`/transactions/${tx.id}/edit`"
            class="block"
          >
            <TransactionItem :transaction="tx" />
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search01Icon, FilterIcon, InboxIcon, Calendar01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { CalendarDate, type DateValue } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import type { TransactionFilters } from '~/composables/useTransactions'

const { transactions, loading, fetchTransactions } = useTransactions()
const { fetchCategories } = useCategories()

const { formatCurrency } = useCurrency()

const monthIncome = computed(() =>
  transactions.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
)
const monthExpense = computed(() =>
  transactions.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
)

const showFilters = ref(false)
const filters = reactive({
  search: '',
  type: '',
  category_id: '',
})

const dateRange = ref<DateRange>({ start: undefined, end: undefined })

let debounceTimer: ReturnType<typeof setTimeout>

onMounted(async () => {
  await fetchCategories()
  await fetchTransactions()
})

const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => applyFilters(), 300)
}

const onDateRangeChange = () => {
  applyFilters()
}

const formatDate = (date: DateValue) => {
  return new Date(date.year, date.month - 1, date.day).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const dateValueToString = (date: DateValue) => {
  const y = date.year
  const m = String(date.month).padStart(2, '0')
  const d = String(date.day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const applyFilters = () => {
  const f: TransactionFilters = {}
  if (filters.search) { f.search = filters.search }
  if (filters.type && filters.type !== 'all') { f.type = filters.type as 'income' | 'expense' }
  if (filters.category_id) { f.category_id = filters.category_id }
  if (dateRange.value.start) { f.dateFrom = dateValueToString(dateRange.value.start) }
  if (dateRange.value.end) { f.dateTo = dateValueToString(dateRange.value.end) }
  fetchTransactions(f)
}

const groupedTransactions = computed(() => {
  const groups: Record<string, typeof transactions.value> = {}
  for (const tx of transactions.value) {
    const date = tx.date
    if (!groups[date]) { groups[date] = [] }
    groups[date].push(tx)
  }
  return groups
})

const formatGroupDate = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) { return 'Hari ini' }
  if (d.toDateString() === yesterday.toDateString()) { return 'Kemarin' }
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
