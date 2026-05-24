<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const { t, locale } = useI18n()
const { formatCurrency } = useCurrency()

const props = defineProps<{
  data: { label: string; income: number; expense: number }[]
}>()

const chartData = computed(() => ({
  labels: props.data.map(d => d.label),
  datasets: [
    {
      label: t('charts.income'),
      data: props.data.map(d => d.income),
      backgroundColor: '#22c55e',
      borderRadius: 6,
      barPercentage: 0.6,
    },
    {
      label: t('charts.expense'),
      data: props.data.map(d => d.expense),
      backgroundColor: '#ef4444',
      borderRadius: 6,
      barPercentage: 0.6,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { raw: number; dataset: { label: string } }) => {
          const val = ctx.raw
          return ` ${ctx.dataset.label}: ${formatCurrency(val)}`
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
          const v = Number(val)
          return v >= 1000000 ? `${v / 1000000}${t('charts.million')}` : v >= 1000 ? `${v / 1000}${t('charts.thousand')}` : val
        },
      },
    },
  },
}
</script>

<template>
  <div class="relative size-full min-h-[200px]">
    <Bar v-if="data.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="flex size-full items-center justify-center">
      <p class="text-xs text-muted-foreground">{{ $t('charts.no_data') }}</p>
    </div>
  </div>
</template>
