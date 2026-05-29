<script setup lang="ts">
import type { BudgetWithProgress } from '~/composables/useBudgets';

const props = defineProps<{
  budget: BudgetWithProgress;
}>();

const emit = defineEmits<{
  edit: [budget: BudgetWithProgress];
  delete: [budget: BudgetWithProgress];
}>();

const { t } = useI18n();
const { getProgress } = useBudgets();
const { formatCurrency: fmtCurrency } = useCurrency();

const progress = computed(() => getProgress(props.budget));

const progressColor = computed(() => {
  if (progress.value.overspent > 0) {
    return 'bg-red-500';
  }
  if (progress.value.percentage >= 80) {
    return 'bg-amber-500';
  }
  return 'bg-primary';
});
</script>

<template>
  <div
    class="rounded-3xl border border-border/50 bg-card/20 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-card/25"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div
          class="flex size-10 items-center justify-center rounded-xl"
          :style="{ backgroundColor: budget.category_color + '20' }"
        >
          <Icon
            v-if="budget.category_icon"
            :name="budget.category_icon"
            :size="20"
            :style="{ color: budget.category_color }"
          />
        </div>
        <div>
          <p class="text-sm font-semibold text-foreground">{{ budget.category_name }}</p>
          <p class="text-xs text-muted-foreground">
            {{ t('budget.monthly_limit') }}: {{ fmtCurrency(budget.amount) }}
          </p>
        </div>
      </div>
      <div class="flex gap-1">
        <Button variant="ghost" size="icon" class="size-8" @click="emit('edit', budget)">
          <Icon name="hugeicons:edit-01" :size="16" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="size-8 text-red-500 hover:text-red-600"
          @click="emit('delete', budget)"
        >
          <Icon name="hugeicons:delete-01" :size="16" />
        </Button>
      </div>
    </div>

    <div class="mt-4 space-y-1.5">
      <div class="flex justify-between text-xs">
        <span class="text-muted-foreground">
          {{ t('budget.spent') }}: {{ fmtCurrency(budget.spent) }}
        </span>
        <span
          :class="progress.overspent > 0 ? 'text-red-500 font-semibold' : 'text-muted-foreground'"
        >
          {{
            progress.overspent > 0
              ? t('budget.overspent')
              : `${t('budget.remaining')}: ${fmtCurrency(progress.remaining)}`
          }}
        </span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="progressColor"
          :style="{ width: `${Math.min(progress.percentage, 100)}%` }"
        />
      </div>
    </div>
  </div>
</template>
