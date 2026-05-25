<template>
  <div
    class="group flex items-center justify-between rounded-3xl border border-border/50 bg-card/30 p-5 transition-all hover:border-border hover:bg-card/50"
  >
    <div class="flex items-center gap-4">
      <div
        class="flex size-12 items-center justify-center rounded-2xl"
        :style="{ backgroundColor: (categoryColor ?? '#6b7280') + '20' }"
      >
        <div class="size-3 rounded-full" :style="{ backgroundColor: categoryColor ?? '#6b7280' }" />
      </div>
      <div>
        <h3 class="font-medium text-foreground">{{ transaction.description || categoryName || 'Tanpa deskripsi' }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ formattedDate }}</p>
      </div>
    </div>
    <div class="text-right">
      <p
        class="text-lg font-semibold"
        :class="transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'"
      >
        {{ transaction.type === 'income' ? '+' : '-' }}{{ formatted }}
      </p>
      <p class="mt-1 text-sm text-muted-foreground">{{ transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '~/composables/useTransactions'

const props = defineProps<{
  transaction: Transaction
}>()

const { formatCurrency } = useCurrency()
const { categories } = useCategories()

const category = computed(() => categories.value.find((c) => c.id === props.transaction.category_id))
const categoryName = computed(() => category.value?.name ?? '')
const categoryColor = computed(() => category.value?.color)
const formatted = computed(() => formatCurrency(Number(props.transaction.amount), props.transaction.currency))
const formattedDate = computed(() => {
  const d = new Date(props.transaction.date)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
})
</script>
