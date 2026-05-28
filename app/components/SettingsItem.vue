<template>
  <button
    class="group flex w-full items-center gap-4 overflow-hidden px-4 py-3.5 transition-all duration-200 hover:bg-card/40 active:bg-card/60"
    @click="$emit('click')"
  >
    <div
      class="flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-active:scale-95"
      :class="iconBg"
    >
      <Icon :name="iconComponent" :size="20" :class="iconColor" />
    </div>

    <div
      class="flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <span
        class="truncate text-sm font-semibold text-foreground/90 transition-colors duration-200 group-hover:text-foreground"
      >
        {{ label }}
      </span>

      <div
        class="flex min-w-0 items-center gap-1.5 transition-colors duration-200 group-hover:text-foreground/80"
      >
        <span
          class="truncate text-left text-xs text-muted-foreground transition-colors sm:text-right group-hover:text-muted-foreground/80"
        >
          {{ value }}
        </span>
        <Icon
          name="hugeicons:arrow-right-01"
          :size="14"
          class="shrink-0 text-muted-foreground/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground/60"
        />
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">

const props = defineProps<{
  icon: 'user' | 'currency' | 'palette' | 'download' | 'language';
  label: string;
  value: string;
}>();

defineEmits(['click']);

const iconMap = {
  user: {
    component: 'hugeicons:user',
    bg: 'bg-blue-100 dark:bg-blue-950/50',
    color: 'text-blue-600 dark:text-blue-400',
  },
  currency: {
    component: 'hugeicons:currency',
    bg: 'bg-green-100 dark:bg-green-950/50',
    color: 'text-green-600 dark:text-green-400',
  },
  palette: {
    component: 'hugeicons:colors',
    bg: 'bg-purple-100 dark:bg-purple-950/50',
    color: 'text-purple-600 dark:text-purple-400',
  },
  download: {
    component: 'hugeicons:download-01',
    bg: 'bg-orange-100 dark:bg-orange-950/50',
    color: 'text-orange-600 dark:text-orange-400',
  },
  language: {
    component: 'hugeicons:globe',
    bg: 'bg-cyan-100 dark:bg-cyan-950/50',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
};

const iconComponent = computed(() => iconMap[props.icon].component);
const iconBg = computed(() => iconMap[props.icon].bg);
const iconColor = computed(() => iconMap[props.icon].color);
</script>
