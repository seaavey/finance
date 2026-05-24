<template>
  <div
    class="flex items-center justify-between rounded-lg border border-border p-3"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10"
        :style="{ backgroundColor: (categoryColor ?? '#6b7280') + '20' }"
      >
        <div class="size-2.5 rounded-full sm:size-3" :style="{ backgroundColor: categoryColor ?? '#6b7280' }" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">{{ transaction.description || categoryName || 'Tanpa deskripsi' }}</p>
        <p class="text-xs text-muted-foreground">{{ formattedDate }}</p>
      </div>
    </div>
    <div class="shrink-0 text-right">
      <p
        class="text-sm font-semibold"
        :class="transaction.type === 'income' ? 'text-green-500' : 'text-red-500'"
      >
        {{ transaction.type === 'income' ? '+' : '-' }}{{ formatted }}
      </p>
      <p class="text-[10px] text-muted-foreground">{{ categoryName }}</p>
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
