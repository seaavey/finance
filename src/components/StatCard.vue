<script setup lang="ts">
import { useCurrency } from '@/composables/useCurrency'

const props = defineProps<{
  label: string
  value: number | string
  currency?: string
  icon?: string
  trend?: 'up' | 'down'
  trendValue?: number | string
}>()

const { formatCurrency } = useCurrency()
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-4xl border border-primary/10 bg-primary/[0.03] p-6 transition-all hover:bg-primary/[0.06]"
  >
    <div class="relative z-10">
      <div class="flex items-center gap-2">
        <p class="text-[10px] font-black uppercase tracking-widest text-primary/70">
          {{ label }}
        </p>
        <div
          v-if="trend"
          class="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-black"
          :class="trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'"
        >
          <AppIcon :name="trend === 'up' ? 'hugeicons:arrow-up-01' : 'hugeicons:arrow-down-01'" :size="10" />
          {{ trendValue }}
        </div>
      </div>
      <h3 class="mt-2 text-3xl font-black tracking-tighter text-primary">
        {{ typeof value === 'number' ? formatCurrency(value, currency) : value }}
      </h3>
    </div>
    <AppIcon
      v-if="icon"
      :name="icon"
      class="absolute -right-4 -top-4 size-24 rotate-12 opacity-5 transition-transform group-hover:scale-110"
    />
  </div>
</template>
