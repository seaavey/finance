<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  type TooltipItem,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const props = defineProps<{
  data: { label: string; netWorth: number; assets: number; debts: number }[];
}>();

const { t } = useI18n();
const { formatCurrency } = useCurrency();

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      label: t('dashboard.net_worth'),
      data: props.data.map((d) => d.netWorth),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      callbacks: {
        label: (ctx: TooltipItem<'line'>) => {
          const val = ctx.raw as number;
          return ` ${ctx.dataset.label}: ${formatCurrency(val)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 } },
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.1)' },
      ticks: {
        font: { size: 10 },
        callback: (val: number | string) => {
          const v = Number(val);
          if (v === 0) {
            return '0';
          }
          const absV = Math.abs(v);
          const suffix = v < 0 ? '-' : '';
          if (absV >= 1000000) {
            return `${suffix}${absV / 1000000}${t('chart.million')}`;
          }
          if (absV >= 1000) {
            return `${suffix}${absV / 1000}${t('chart.thousand')}`;
          }
          return `${suffix}${absV}`;
        },
      },
    },
  },
}));
</script>

<template>
  <div class="relative h-[220px]">
    <Line v-if="data.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="flex size-full items-center justify-center">
      <p class="text-xs text-muted-foreground">{{ $t('chart.no_data') }}</p>
    </div>
  </div>
</template>
