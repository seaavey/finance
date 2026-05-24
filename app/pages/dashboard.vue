<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold">Halo, {{ displayName }} 👋</h2>
      <p class="text-sm text-muted-foreground">{{ monthLabel }}</p>
    </div>

    <div v-if="loading" class="space-y-6">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Skeleton class="h-24 rounded-xl" />
        <Skeleton class="h-24 rounded-xl" />
        <Skeleton class="h-24 rounded-xl" />
      </div>
      <Skeleton class="h-64 rounded-xl" />
      <Skeleton class="h-48 rounded-xl" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card class="bg-green-50 dark:bg-green-950/30">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 items-center justify-center rounded-full bg-green-100">
              <HugeiconsIcon :icon="ArrowDown01Icon" :size="18" class="text-green-600" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Pemasukan</p>
              <p class="text-lg font-bold text-green-600">{{ formatCurrency(totalIncome) }}</p>
            </div>
          </CardContent>
        </Card>

        <Card class="bg-red-50 dark:bg-red-950/30">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
              <HugeiconsIcon :icon="ArrowUp01Icon" :size="18" class="text-red-600" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Pengeluaran</p>
              <p class="text-lg font-bold text-red-600">{{ formatCurrency(totalExpense) }}</p>
            </div>
          </CardContent>
        </Card>

        <Card class="bg-blue-50 dark:bg-blue-950/30">
          <CardContent class="flex items-center gap-3 p-4">
            <div class="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
              <HugeiconsIcon :icon="Wallet01Icon" :size="18" class="text-blue-600" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Saldo</p>
              <p class="text-lg font-bold" :class="balance >= 0 ? 'text-blue-600' : 'text-orange-600'">{{ formatCurrency(balance) }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium">Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartsExpenseDonut :categories="expenseByCategory" />
            <div v-if="expenseByCategory.length > 0" class="mt-3 space-y-1.5">
              <div v-for="cat in expenseByCategory" :key="cat.name" class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <div class="size-2.5 rounded-full" :style="{ backgroundColor: cat.color }" />
                  <span>{{ cat.name }}</span>
                </div>
                <span class="font-medium">{{ formatCurrency(cat.total) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium">Tren 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartsMonthlyBar :data="monthlyData" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Transaksi Terakhir</CardTitle>
          <NuxtLink to="/transactions" class="text-xs text-primary hover:underline">Lihat semua</NuxtLink>
        </CardHeader>
        <CardContent>
          <div v-if="recentTransactions.length === 0" class="py-6 text-center text-sm text-muted-foreground">
            Belum ada transaksi
          </div>
          <div v-else class="space-y-3">
            <div v-for="tx in recentTransactions" :key="tx.id" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="flex size-8 items-center justify-center rounded-full"
                  :class="tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'"
                >
                  <HugeiconsIcon
                    :icon="tx.type === 'income' ? ArrowDown01Icon : ArrowUp01Icon"
                    :size="14"
                    :class="tx.type === 'income' ? 'text-green-600' : 'text-red-600'"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium">{{ tx.description || getCategoryName(tx.category_id) || 'Transaksi' }}</p>
                  <p class="text-[11px] text-muted-foreground">{{ formatDate(tx.date) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold" :class="tx.type === 'income' ? 'text-green-600' : 'text-red-600'">
                  {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                </p>
                <p class="text-[11px] text-muted-foreground">{{ getCategoryName(tx.category_id) }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="grid grid-cols-2 gap-3">
        <Card class="cursor-pointer transition-colors hover:bg-accent/50" @click="navigateTo('/transactions/new')">
          <CardContent class="flex flex-col items-center gap-2 p-4">
            <div class="flex size-10 items-center justify-center rounded-full bg-green-100">
              <HugeiconsIcon :icon="Add01Icon" :size="20" class="text-green-600" />
            </div>
            <p class="text-xs font-medium">Tambah Transaksi</p>
          </CardContent>
        </Card>
        <Card class="cursor-pointer transition-colors hover:bg-accent/50" @click="navigateTo('/categories')">
          <CardContent class="flex flex-col items-center gap-2 p-4">
            <div class="flex size-10 items-center justify-center rounded-full bg-purple-100">
              <HugeiconsIcon :icon="GridViewIcon" :size="20" class="text-purple-600" />
            </div>
            <p class="text-xs font-medium">Kelola Kategori</p>
          </CardContent>
        </Card>
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
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

const { user } = useAuth()
const { transactions, fetchTransactions } = useTransactions()
const { categories, fetchCategories } = useCategories()
const { formatCurrency } = useCurrency()

const loading = ref(true)

const displayName = computed(() => {
  const name = user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || ''
  return name.split(' ')[0] || 'User'
})

const monthLabel = computed(() => {
  return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getCategoryName = (id: string | null) => {
  if (!id) return ''
  return categories.value.find(c => c.id === id)?.name || ''
}

const getCategoryColor = (id: string | null) => {
  if (!id) return '#6b7280'
  return categories.value.find(c => c.id === id)?.color || '#6b7280'
}

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

const thisMonthTransactions = computed(() =>
  transactions.value.filter(tx => {
    const d = new Date(tx.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })
)

const totalIncome = computed(() =>
  thisMonthTransactions.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
)

const totalExpense = computed(() =>
  thisMonthTransactions.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
)

const balance = computed(() => totalIncome.value - totalExpense.value)

const recentTransactions = computed(() =>
  [...transactions.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
)

const expenseByCategory = computed(() => {
  const map = new Map<string, { name: string; color: string; total: number }>()
  thisMonthTransactions.value
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = categories.value.find(c => c.id === t.category_id)
      const key = cat?.id || 'uncategorized'
      const existing = map.get(key)
      if (existing) {
        existing.total += t.amount
      } else {
        map.set(key, { name: cat?.name || 'Lainnya', color: cat?.color || '#6b7280', total: t.amount })
      }
    })
  return [...map.values()].sort((a, b) => b.total - a.total)
})

const monthlyData = computed(() => {
  const months: { label: string; income: number; expense: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1)
    const label = d.toLocaleDateString('id-ID', { month: 'short' })
    const m = d.getMonth()
    const y = d.getFullYear()
    const monthTx = transactions.value.filter(tx => {
      const td = new Date(tx.date)
      return td.getMonth() === m && td.getFullYear() === y
    })
    months.push({
      label,
      income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    })
  }
  return months
})

onMounted(async () => {
  await Promise.all([fetchTransactions(), fetchCategories()])
  loading.value = false
})
</script>
