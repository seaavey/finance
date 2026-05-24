<template>
  <button class="flex w-full items-center gap-3 p-3.5 active:bg-accent/50" @click="$emit('click')">
    <div class="flex size-8 items-center justify-center rounded-lg" :class="iconBg">
      <HugeiconsIcon :icon="iconComponent" :size="18" :class="iconColor" />
    </div>
    <div class="flex flex-1 items-center justify-between min-w-0">
      <span class="text-sm font-medium">{{ label }}</span>
      <div class="flex items-center gap-1.5 text-muted-foreground">
        <span class="text-xs">{{ value }}</span>
        <HugeiconsIcon :icon="ArrowRight01Icon" :size="14" />
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { UserIcon, CurrencyIcon, ColorsIcon, Download01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

const props = defineProps<{
  icon: 'user' | 'currency' | 'palette' | 'download'
  label: string
  value: string
}>()

defineEmits(['click'])

const iconMap = {
  user: { component: UserIcon, bg: 'bg-blue-100 dark:bg-blue-950/50', color: 'text-blue-600 dark:text-blue-400' },
  currency: { component: CurrencyIcon, bg: 'bg-green-100 dark:bg-green-950/50', color: 'text-green-600 dark:text-green-400' },
  palette: { component: ColorsIcon, bg: 'bg-purple-100 dark:bg-purple-950/50', color: 'text-purple-600 dark:text-purple-400' },
  download: { component: Download01Icon, bg: 'bg-orange-100 dark:bg-orange-950/50', color: 'text-orange-600 dark:text-orange-400' },
}

const iconComponent = computed(() => iconMap[props.icon].component)
const iconBg = computed(() => iconMap[props.icon].bg)
const iconColor = computed(() => iconMap[props.icon].color)
</script>
