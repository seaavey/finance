<script setup lang="ts">
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

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      label: 'Pemasukan',
      data: props.data.map((d) => d.income),
      backgroundColor: '#22c55e',
      borderRadius: 6,
      barPercentage: 0.6,
    },
    {
      label: 'Pengeluaran',
      data: props.data.map((d) => d.expense),
      backgroundColor: '#ef4444',
      borderRadius: 6,
      barPercentage: 0.6,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) => {
          const val = ctx.raw as number;
          return ` ${ctx.dataset.label}: Rp ${val.toLocaleString('id-ID')}`;
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
          return v >= 1000000 ? `${v / 1000000}jt` : v >= 1000 ? `${v / 1000}rb` : val;
        },
      },
    },
  },
};
</script>

<template>
  <div class="relative size-full min-h-50">
    <Bar v-if="data.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="flex size-full items-center justify-center">
      <p class="text-xs text-muted-foreground">Belum ada data</p>
    </div>
  </div>
</template>
