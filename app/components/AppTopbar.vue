<template>
  <header
    class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm"
  >
    <div class="flex items-center gap-3">
      <button
        class="rounded-lg p-1.5 text-muted-foreground hover:bg-accent md:hidden"
        @click="$emit('toggleSidebar')"
      >
        <HugeiconsIcon :icon="Menu02Icon" :size="20" />
      </button>
      <h1 class="text-sm font-semibold text-foreground">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="flex w-44 items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
      >
        <HugeiconsIcon :icon="Search01Icon" :size="16" />
        <span>Cari...</span>
        <kbd class="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
      </button>

      <button class="relative rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent">
        <HugeiconsIcon :icon="Notification03Icon" :size="18" />
        <span class="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
      </button>

      <ClientOnly>
        <button
          class="rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent"
          @click="cycleColorMode"
        >
          <HugeiconsIcon v-if="colorMode.preference === 'dark'" :icon="Sun01Icon" :size="18" />
          <HugeiconsIcon v-else :icon="Moon01Icon" :size="18" />
        </button>
      </ClientOnly>

      <button
        class="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        @click="navigateTo('/transactions/new')"
      >
        <HugeiconsIcon :icon="Add01Icon" :size="16" />
        <span class="hidden sm:inline">Tambah</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  Menu02Icon,
  Search01Icon,
  Notification03Icon,
  Sun01Icon,
  Moon01Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';

defineEmits<{
  toggleSidebar: [];
}>();

const route = useRoute();
const colorMode = useColorMode();

const cycleColorMode = () => {
  const modes = ['dark', 'light', 'system'];
  const current = modes.indexOf(colorMode.preference);
  colorMode.preference = modes[(current + 1) % modes.length];
};

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/transactions': 'Transaksi',
    '/transactions/new': 'Tambah Transaksi',
    '/categories': 'Kategori',
    '/todos': 'Todo',
    '/recurring': 'Transaksi Rutin',
    '/settings': 'Setelan',
  };
  return titles[route.path] ?? 'Finance';
});
</script>
