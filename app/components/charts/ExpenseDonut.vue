<script setup lang="ts">
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type TooltipItem } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const { formatCurrency } = useCurrency();

const props = defineProps<{
  categories: { name: string; color: string; total: number }[];
}>();

const chartData = computed(() => ({
  labels: props.categories.map((c) => c.name),
  datasets: [
    {
      data: props.categories.map((c) => c.total),
      backgroundColor: props.categories.map((c) => c.color),
      borderWidth: 0,
      hoverOffset: 4,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'doughnut'>) => {
          const val = ctx.raw as number;
          return ` ${formatCurrency(val)}`;
        },
      },
    },
  },
}));
</script>

<template>
  <div class="relative h-[220px]">
    <Doughnut
      v-if="chartData.datasets[0].data.length > 0"
      :data="chartData"
      :options="chartOptions"
    />
    <div v-else class="flex size-full items-center justify-center">
      <p class="text-xs text-muted-foreground">{{ $t('chart.no_data') }}</p>
    </div>
  </div>
</template>
