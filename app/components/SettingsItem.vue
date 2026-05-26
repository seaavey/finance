<template>
  <button class="group flex w-full items-center gap-3 px-4 py-3.5 transition-all duration-200 hover:bg-card/40" @click="$emit('click')">
    <div class="flex size-8 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-105" :class="iconBg">
      <HugeiconsIcon :icon="iconComponent" :size="18" :class="iconColor" />
    </div>
    <div class="flex flex-1 items-center justify-between min-w-0">
      <span class="text-sm font-medium transition-colors duration-200 group-hover:text-foreground">{{ label }}</span>
      <div class="flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80">
        <span class="text-xs">{{ value }}</span>
        <HugeiconsIcon :icon="ArrowRight01Icon" :size="14" />
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import {
  UserIcon,
  CurrencyIcon,
  ColorsIcon,
  Download01Icon,
  GlobeIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';

const props = defineProps<{
  icon: 'user' | 'currency' | 'palette' | 'download' | 'language';
  label: string;
  value: string;
}>();

defineEmits(['click']);

const iconMap = {
  user: {
    component: UserIcon,
    bg: 'bg-blue-100 dark:bg-blue-950/50',
    color: 'text-blue-600 dark:text-blue-400',
  },
  currency: {
    component: CurrencyIcon,
    bg: 'bg-green-100 dark:bg-green-950/50',
    color: 'text-green-600 dark:text-green-400',
  },
  palette: {
    component: ColorsIcon,
    bg: 'bg-purple-100 dark:bg-purple-950/50',
    color: 'text-purple-600 dark:text-purple-400',
  },
  download: {
    component: Download01Icon,
    bg: 'bg-orange-100 dark:bg-orange-950/50',
    color: 'text-orange-600 dark:text-orange-400',
  },
  language: {
    component: GlobeIcon,
    bg: 'bg-cyan-100 dark:bg-cyan-950/50',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
};

const iconComponent = computed(() => iconMap[props.icon].component);
const iconBg = computed(() => iconMap[props.icon].bg);
const iconColor = computed(() => iconMap[props.icon].color);
</script>
