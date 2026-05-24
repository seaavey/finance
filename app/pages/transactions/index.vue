<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold">Transaksi</h2>
        <p class="text-sm text-muted-foreground">{{ transactions.length }} transaksi</p>
      </div>
      <Button @click="navigateTo('/transactions/new')">
        <HugeiconsIcon :icon="Add01Icon" :size="18" />
        Tambah
      </Button>
    </div>

    <Card>
      <CardContent class="p-3">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <HugeiconsIcon :icon="Search01Icon" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="filters.search"
              placeholder="Cari transaksi..."
              class="pl-9"
              @input="debouncedFetch"
            />
          </div>
          <Button variant="outline" size="icon" @click="showFilters = !showFilters">
            <HugeiconsIcon :icon="FilterIcon" :size="18" />
          </Button>
        </div>

        <div v-if="showFilters" class="mt-3 space-y-2 border-t border-border pt-3">
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
      </CardContent>
    </Card>

    <div v-if="!loading && transactions.length > 0" class="grid grid-cols-3 gap-1.5 sm:gap-2">
      <Card class="bg-green-50 dark:bg-green-950/30">
        <CardContent class="p-2 text-center sm:p-3">
          <p class="text-[10px] text-muted-foreground sm:text-[11px]">Pemasukan</p>
          <p class="truncate text-xs font-bold text-green-600 sm:text-sm">{{ formatCurrency(monthIncome) }}</p>
        </CardContent>
      </Card>
      <Card class="bg-red-50 dark:bg-red-950/30">
        <CardContent class="p-2 text-center sm:p-3">
          <p class="text-[10px] text-muted-foreground sm:text-[11px]">Pengeluaran</p>
          <p class="truncate text-xs font-bold text-red-600 sm:text-sm">{{ formatCurrency(monthExpense) }}</p>
        </CardContent>
      </Card>
      <Card class="bg-blue-50 dark:bg-blue-950/30">
        <CardContent class="p-2 text-center sm:p-3">
          <p class="text-[10px] text-muted-foreground sm:text-[11px]">Selisih</p>
          <p class="truncate text-xs font-bold sm:text-sm" :class="monthIncome - monthExpense >= 0 ? 'text-blue-600' : 'text-orange-600'">{{ formatCurrency(monthIncome - monthExpense) }}</p>
        </CardContent>
      </Card>
    </div>

    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-14 rounded-lg" />
      <Skeleton class="h-14 rounded-lg" />
      <Skeleton class="h-14 rounded-lg" />
      <Skeleton class="h-14 rounded-lg" />
      <Skeleton class="h-14 rounded-lg" />
    </div>

    <div v-else-if="transactions.length === 0" class="flex flex-col items-center gap-3 py-12">
      <div class="flex size-12 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon :icon="InboxIcon" :size="24" class="text-muted-foreground" />
      </div>
      <p class="text-sm text-muted-foreground">Belum ada transaksi</p>
      <Button size="sm" @click="navigateTo('/transactions/new')">Tambah Sekarang</Button>
    </div>

    <div v-else class="space-y-2">
      <template v-for="(group, date) in groupedTransactions" :key="date">
        <div class="sticky top-0 z-10 bg-background/80 py-1.5 backdrop-blur-sm">
          <span class="text-xs font-medium text-muted-foreground">{{ formatGroupDate(date as string) }}</span>
        </div>
        <div class="space-y-1.5">
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
import { Add01Icon, Search01Icon, FilterIcon, InboxIcon, Calendar01Icon } from '@hugeicons/core-free-icons'
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
  if (filters.search) f.search = filters.search
  if (filters.type && filters.type !== 'all') f.type = filters.type as 'income' | 'expense'
  if (filters.category_id) f.category_id = filters.category_id
  if (dateRange.value.start) f.dateFrom = dateValueToString(dateRange.value.start)
  if (dateRange.value.end) f.dateTo = dateValueToString(dateRange.value.end)
  fetchTransactions(f)
}

const groupedTransactions = computed(() => {
  const groups: Record<string, typeof transactions.value> = {}
  for (const tx of transactions.value) {
    const date = tx.date
    if (!groups[date]) groups[date] = []
    groups[date].push(tx)
  }
  return groups
})

const formatGroupDate = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Hari ini'
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin'
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
