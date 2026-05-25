<template>
  <div
    class="group flex items-center justify-between rounded-3xl border border-border/50 bg-card/30 p-3 transition-all hover:border-border hover:bg-card/50 md:p-5"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-2xl md:size-12"
        :style="{ backgroundColor: (categoryColor ?? '#6b7280') + '20' }"
      >
        <div class="size-3 rounded-full" :style="{ backgroundColor: categoryColor ?? '#6b7280' }" />
      </div>
      <div class="min-w-0">
        <h3 class="truncate font-medium text-foreground">{{ transaction.description || categoryName || 'Tanpa deskripsi' }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ formattedDate }}</p>
      </div>
    </div>
    <div class="ml-3 shrink-0 text-right md:ml-0">
      <p
        class="font-semibold md:text-lg"
        :class="transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'"
      >
        {{ transaction.type === 'income' ? '+' : '-' }}{{ formatted }}
      </p>
      <p class="mt-1 text-xs text-muted-foreground md:text-sm">{{ transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '~/composables/useTransactions';

const props = defineProps<{
  transaction: Transaction;
}>();

const { formatCurrency } = useCurrency();
const { categories } = useCategories();

const category = computed(() =>
  categories.value.find((c) => c.id === props.transaction.category_id),
);
const categoryName = computed(() => category.value?.name ?? '');
const categoryColor = computed(() => category.value?.color);
const formatted = computed(() =>
  formatCurrency(Number(props.transaction.amount), props.transaction.currency),
);
const formattedDate = computed(() => {
  const d = new Date(props.transaction.date);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
});
</script>
