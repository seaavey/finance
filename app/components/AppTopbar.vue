<template>
  <header
    class="sticky top-0 z-40 flex h-16 items-center border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl"
  >
    <!-- LEFT -->
    <div class="flex items-center gap-3">
      <button
        class="flex size-9 items-center justify-center rounded-xl border border-border/50 bg-card/30 text-muted-foreground transition hover:bg-card/60 hover:text-foreground lg:hidden"
        @click="$emit('toggleSidebar')"
      >
        <HugeiconsIcon :icon="Menu02Icon" :size="18" />
      </button>

      <Breadcrumb>
        <BreadcrumbList>
          <template v-for="(item, i) in breadcrumbItems" :key="i">
            <template v-if="i === breadcrumbItems.length - 1">
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {{ item.label }}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </template>
            <template v-else>
              <BreadcrumbItem class="hidden md:flex">
                <BreadcrumbLink :to="item.to!">
                  {{ item.label }}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:flex" />
            </template>
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <!-- RIGHT -->
    <div class="ml-auto flex items-center gap-3">
      <!-- SEARCH -->
      <div class="relative hidden md:block">
        <HugeiconsIcon :icon="Search01Icon" :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
        <div
          class="flex h-10 w-60 cursor-pointer items-center rounded-2xl border border-border/50 bg-card/30 pl-10 pr-12 text-sm text-muted-foreground/60 transition hover:bg-card/60 hover:text-muted-foreground lg:w-65"
        >
          <span>Cari transaksi...</span>
          <kbd class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border/50 bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/50">⌘K</kbd>
        </div>
      </div>

      <!-- NOTIFICATION -->
      <button class="relative flex size-10 items-center justify-center rounded-2xl border border-border/50 bg-card/30 text-muted-foreground transition hover:bg-card/60 hover:text-foreground">
        <HugeiconsIcon :icon="Notification03Icon" :size="18" />
        <span class="absolute right-2.5 top-2.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
      </button>

      <!-- THEME -->
      <button
        class="flex size-10 items-center justify-center rounded-2xl border border-border/50 bg-card/30 text-muted-foreground transition hover:bg-card/60 hover:text-foreground"
        @click="cycleColorMode"
      >
        <HugeiconsIcon v-if="colorMode.value === 'dark'" :icon="Sun01Icon" :size="18" />
        <HugeiconsIcon v-else :icon="Moon01Icon" :size="18" />
      </button>

      <!-- CTA -->
      <button
        v-if="route.path !== '/settings'"
        class="flex h-10 items-center gap-2 rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-4 text-sm font-medium text-white transition hover:from-pink-400 hover:to-pink-500"
        @click="navigateTo('/transactions/new')"
      >
        <HugeiconsIcon :icon="Add01Icon" :size="18" />
        <span class="hidden sm:inline">Tambah</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
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

interface BreadcrumbItem {
  label: string;
  to?: string;
}

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const path = route.path;
  const items: BreadcrumbItem[] = [{ label: 'Dashboard', to: '/' }];

  if (path === '/') return items;

  if (path.startsWith('/transactions')) {
    items.push({ label: 'Transaksi', to: '/transactions' });
    if (path === '/transactions/new') {
      items.push({ label: 'Tambah' });
    } else if (path.includes('/edit')) {
      items.push({ label: 'Edit' });
    }
    return items;
  }

  if (path.startsWith('/categories')) {
    items.push({ label: 'Kategori' });
    return items;
  }

  if (path.startsWith('/recurring')) {
    items.push({ label: 'Transaksi Rutin' });
    return items;
  }

  if (path.startsWith('/settings')) {
    items.push({ label: 'Setelan' });
    return items;
  }

  return items;
});

const cycleColorMode = () => {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light';
};
</script>
