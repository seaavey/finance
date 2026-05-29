<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type TooltipItem,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const props = defineProps<{
  data: { label: string; income: number; expense: number }[];
}>();

const { t } = useI18n();
const { formatCurrency } = useCurrency();

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      label: t('dashboard.income'),
      data: props.data.map((d) => d.income),
      backgroundColor: '#22c55e',
      borderRadius: 6,
      barPercentage: 0.6,
    },
    {
      label: t('dashboard.expense'),
      data: props.data.map((d) => d.expense),
      backgroundColor: '#ef4444',
      borderRadius: 6,
      barPercentage: 0.6,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) => {
          const val = ctx.raw as number;
          return ` ${ctx.dataset.label}: ${formatCurrency(val)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
    y: {
      grid: { color: '#f1f5f9' },
      ticks: {
        font: { size: 11 },
        callback: (val: number | string) => {
          const v = Number(val);
          return v >= 1000000
            ? `${v / 1000000}${t('chart.million')}`
            : v >= 1000
              ? `${v / 1000}${t('chart.thousand')}`
              : val;
        },
      },
    },
  },
}));
</script>

<template>
  <div class="relative h-[220px]">
    <Bar v-if="data.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="flex size-full items-center justify-center">
      <p class="text-xs text-muted-foreground">{{ $t('chart.no_data') }}</p>
    </div>
  </div>
</template>
