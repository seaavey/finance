<template>
  <div class="mx-auto max-w-2xl space-y-12 px-1 py-8 md:px-0">
    <!-- HEADER -->
    <div class="text-center space-y-2">
      <h2 class="text-4xl font-black tracking-tighter text-foreground md:text-5xl">
        {{ $t('converter.title') }}
      </h2>
      <p class="text-sm font-medium text-muted-foreground">
        {{ $t('converter.subtitle') }}
      </p>
    </div>

    <!-- HERO CONVERTER -->
    <div class="space-y-4">
      <!-- FROM INPUT -->
      <div class="group relative rounded-4xl bg-card/10 p-8 transition-all hover:bg-card/20">
        <div class="flex items-center justify-between gap-4">
          <input
            v-model="fromAmountString"
            type="text"
            inputmode="decimal"
            class="w-full bg-transparent text-5xl font-black tracking-tighter text-foreground focus:outline-none md:text-6xl"
            @input="onFromInput"
          />
          <Select v-model="fromCurrency">
            <SelectTrigger
              class="h-12 w-auto rounded-2xl border-none bg-background/50 px-4 font-bold shadow-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="rounded-2xl border-border/50 backdrop-blur-xl">
              <SelectGroup v-for="group in currencyGroups" :key="group.label">
                <SelectLabel class="text-[10px] font-black uppercase tracking-widest text-primary">{{
                  group.label
                }}</SelectLabel>
                <SelectItem
                  v-for="cur in group.currencies"
                  :key="cur.value"
                  :value="cur.value"
                  class="rounded-xl font-bold"
                >
                  {{ cur.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- SWAP DIVIDER -->
      <div class="relative -my-6 z-10 flex justify-center">
        <Button
          variant="outline"
          size="icon"
          class="size-14 rounded-full border-4 border-background bg-card shadow-xl transition-all hover:scale-110 active:scale-95"
          @click="swapCurrencies"
        >
          <AppIcon name="hugeicons:exchange-01" :size="24" class="text-primary" />
        </Button>
      </div>

      <!-- TO DISPLAY -->
      <div class="group relative rounded-4xl bg-card/5 p-8 transition-all">
        <div class="flex items-center justify-between gap-4">
          <div class="w-full text-5xl font-black tracking-tighter text-foreground/50 md:text-6xl">
            {{ formatNumberOnly(toAmount, toCurrency) }}
          </div>
          <Select v-model="toCurrency">
            <SelectTrigger
              class="h-12 w-auto rounded-2xl border-none bg-background/50 px-4 font-bold shadow-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="rounded-2xl border-border/50 backdrop-blur-xl">
              <SelectGroup v-for="group in currencyGroups" :key="group.label">
                <SelectLabel class="text-[10px] font-black uppercase tracking-widest text-primary">{{
                  group.label
                }}</SelectLabel>
                <SelectItem
                  v-for="cur in group.currencies"
                  :key="cur.value"
                  :value="cur.value"
                  class="rounded-xl font-bold"
                >
                  {{ cur.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- RATE INFO -->
      <div v-if="displayRate" class="text-center">
        <span
          class="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary"
        >
          1 {{ displayRate.from }} =
          {{ formatNumberOnly(displayRate.amount, displayRate.to, 4) }} {{ displayRate.to }}
        </span>
      </div>
    </div>

    <!-- QUICK MULTI-CONVERT GRID -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div
        v-for="item in quickConversions"
        :key="item.code"
        class="flex flex-col gap-1 rounded-3xl border border-border/50 bg-card/10 p-5 transition-all hover:bg-card/20"
      >
        <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {{ item.code }}
        </p>
        <p class="text-xl font-black tracking-tight text-foreground">
          {{ formatNumberOnly(item.amount, item.code) }}
        </p>
      </div>
    </div>

    <!-- TREND CHART -->
    <div class="rounded-4xl border border-border/50 bg-card/10 p-8 space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <AppIcon name="hugeicons:chart-line-up-01" :size="20" />
          </div>
          <div>
            <h3 class="text-sm font-black uppercase tracking-widest text-foreground">7-Day Trend</h3>
            <p class="text-[10px] font-bold text-muted-foreground">Performance of {{ fromCurrency }}/{{ toCurrency }}</p>
          </div>
        </div>
      </div>

      <div class="h-48 w-full relative">
        <!-- LOADING STATE -->
        <div v-if="chartLoading" class="absolute inset-0 z-10 rounded-2xl">
          <Skeleton class="h-full w-full rounded-2xl" />
        </div>

        <VisXYContainer v-if="trendData.length > 0" :data="trendData" class="h-full" :class="{ 'opacity-50': chartLoading }">
          <VisArea :x="x" :y="y" color="var(--primary)" :opacity="0.1" />
          <VisLine :x="x" :y="y" color="var(--primary)" :lineWidth="3" />
          <VisAxis type="x" :tickFormat="(t: number) => new Date(t).toLocaleDateString(undefined, { weekday: 'short' })" :gridLine="false" />
        </VisXYContainer>

        <!-- EMPTY STATE -->
        <div v-else-if="!chartLoading" class="flex h-full flex-col items-center justify-center gap-2 text-center">
          <p class="text-sm font-bold text-muted-foreground italic">
            {{ $t('converter.no_trend') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PagesConverterIndex',
})

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { VisXYContainer, VisLine, VisArea, VisAxis } from '@unovis/vue'
import { Skeleton } from '@/components/ui/skeleton'

const {
  currencyGroups,
  formatNumberOnly,
  parseLocalizedNumber,
  convertTo,
  fetchHistoricalRates,
} = useCurrency()

const fromCurrency = ref('USD')
const toCurrency = ref('IDR')
const fromAmountString = ref('1')
const fromAmount = ref(1)

const trendData = ref<{ date: string; value: number }[]>([])
const chartLoading = ref(false)
let currentRequestId = 0

const updateTrend = async () => {
  const requestId = ++currentRequestId
  chartLoading.value = true
  try {
    const data = await fetchHistoricalRates(fromCurrency.value, toCurrency.value)
    if (requestId === currentRequestId) {
      trendData.value = data || []
    }
  } finally {
    if (requestId === currentRequestId) {
      chartLoading.value = false
    }
  }
}

watch([fromCurrency, toCurrency], updateTrend, { immediate: true })

const x = (d: any) => new Date(d.date).getTime()
const y = (d: any) => d.value

const onFromInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  fromAmount.value = parseLocalizedNumber(val, fromCurrency.value)
  fromAmountString.value = formatNumberOnly(fromAmount.value, fromCurrency.value)
}

const setFromAmount = (amount: number) => {
  fromAmount.value = amount
  fromAmountString.value = formatNumberOnly(amount, fromCurrency.value)
}

const toAmount = computed(() => {
  return convertTo(fromAmount.value, fromCurrency.value, toCurrency.value) || 0
})

const currentRate = computed(() => {
  return convertTo(1, fromCurrency.value, toCurrency.value)
})

const displayRate = computed(() => {
  const rate = currentRate.value
  if (!rate) return null

  // If rate is very small (e.g. IDR to USD), show inverse for better readability
  if (rate < 0.01) {
    const inverse = convertTo(1, toCurrency.value, fromCurrency.value)
    if (inverse) {
      return {
        amount: inverse,
        from: toCurrency.value,
        to: fromCurrency.value,
      }
    }
  }

  return {
    amount: rate,
    from: fromCurrency.value,
    to: toCurrency.value,
  }
})

const quickTargets = ['EUR', 'SGD', 'GBP', 'MYR']
const quickConversions = computed(() => {
  return quickTargets.map((code) => ({
    code,
    amount: convertTo(fromAmount.value, fromCurrency.value, code) || 0,
  }))
})

const swapCurrencies = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
  // Re-format the string for the new currency
  fromAmountString.value = formatNumberOnly(fromAmount.value, fromCurrency.value)
}

onMounted(() => {
  setFromAmount(1)
})
</script>
