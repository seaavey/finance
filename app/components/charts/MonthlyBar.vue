<script setup lang="ts">
import { BarChart } from '@/components/ui/chart-bar';
import type { ChartConfig } from '@/components/ui/chart';

defineProps<{
  data: { label: string; income: number; expense: number }[];
}>();

const { t } = useI18n();

const chartConfig = computed<ChartConfig>(() => ({
  income: {
    label: t('dashboard.income'),
    color: '#22c55e',
  },
  expense: {
    label: t('dashboard.expense'),
    color: '#ef4444',
  },
}));

const yFormatter = (val: number | string) => {
  const v = Number(val);
  return v >= 1000000
    ? `${v / 1000000}${t('chart.million')}`
    : v >= 1000
      ? `${v / 1000}${t('chart.thousand')}`
      : val.toString();
};
</script>

<template>
  <div class="relative h-[220px]">
    <BarChart
      v-if="data.length > 0"
      :data="data"
      index="label"
      :categories="['income', 'expense']"
      :config="chartConfig"
      :y-formatter="yFormatter"
      class="h-full w-full"
    />
    <div v-else class="flex size-full items-center justify-center">
      <p class="text-xs text-muted-foreground">{{ $t('chart.no_data') }}</p>
    </div>
  </div>
</template>
