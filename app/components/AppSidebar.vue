<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-200 md:relative md:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-14 items-center gap-2 border-b border-border px-4">
      <div class="flex size-8 items-center justify-center rounded-lg bg-primary">
        <HugeiconsIcon :icon="Money01Icon" :size="18" class="text-primary-foreground" />
      </div>
      <span class="text-lg font-bold">Finance</span>
    </div>

    <nav class="flex-1 space-y-1 p-3">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        :class="{ 'bg-sidebar-accent text-sidebar-foreground': isActive(item.to) }"
        @click="$emit('close')"
      >
        <HugeiconsIcon :icon="item.icon" :size="20" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div class="border-t border-border p-3">
      <NuxtLink
        to="/settings"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        :class="{ 'bg-sidebar-accent text-sidebar-foreground': isActive('/settings') }"
        @click="$emit('close')"
      >
        <HugeiconsIcon :icon="Settings01Icon" :size="20" />
        Setelan
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  Home03Icon,
  ArrowLeftRightIcon,
  GridViewIcon,
  RepeatIcon,
  Settings01Icon,
  Money01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()

const route = useRoute()

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home03Icon },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRightIcon },
  { to: '/categories', label: 'Kategori', icon: GridViewIcon },
  { to: '/recurring', label: 'Rutin', icon: RepeatIcon },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
