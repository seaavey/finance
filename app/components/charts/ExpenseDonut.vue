<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  categories: { name: string; color: string; total: number }[]
}>()

const chartData = computed(() => ({
  labels: props.categories.map(c => c.name),
  datasets: [{
    data: props.categories.map(c => c.total),
    backgroundColor: props.categories.map(c => c.color),
    borderWidth: 0,
    hoverOffset: 4,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          const val = ctx.raw as number
          return ` Rp ${val.toLocaleString('id-ID')}`
        },
      },
    },
  },
}
</script>

<template>
  <div class="relative size-full min-h-[180px]">
    <Doughnut v-if="categories.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="flex size-full items-center justify-center">
      <p class="text-xs text-muted-foreground">Belum ada data</p>
    </div>
  </div>
</template>
