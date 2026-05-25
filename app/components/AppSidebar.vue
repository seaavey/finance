<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:relative md:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
      <div class="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
        <HugeiconsIcon :icon="MoneyAdd01Icon" :size="18" class="text-sidebar-primary-foreground" />
      </div>
      <span class="text-base font-bold text-sidebar-foreground">Finance</span>
    </div>

    <div class="px-4 pb-1 pt-4">
      <p class="text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">Menu</p>
    </div>

    <nav class="flex-1 space-y-0.5 overflow-y-auto px-3 min-h-0">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        :class="{ 'bg-sidebar-accent text-sidebar-foreground border-l-2 border-sidebar-primary': isActive(item.to) }"
        @click="$emit('close')"
      >
        <HugeiconsIcon :icon="item.icon" :size="18" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div v-if="user" class="shrink-0 border-t border-sidebar-border p-3">
      <button
        class="flex w-full items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2.5 transition-colors hover:bg-sidebar-accent"
        @click="profileOpen = !profileOpen"
      >
        <Avatar class="size-8">
          <AvatarImage v-if="user.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" :alt="user.user_metadata?.full_name" />
          <AvatarFallback class="text-xs font-medium">{{ user.user_metadata?.full_name?.charAt(0) ?? '?' }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1 text-left">
          <p class="truncate text-sm font-medium text-sidebar-foreground">{{ user.user_metadata?.full_name }}</p>
          <p class="truncate text-xs text-sidebar-foreground/50">{{ user.email }}</p>
        </div>
        <ChevronUpIcon
          :size="16"
          class="text-sidebar-foreground/40 transition-transform duration-200"
          :class="profileOpen ? 'rotate-180' : ''"
        />
      </button>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="profileOpen" class="mt-1 rounded-lg border border-border bg-popover p-1 shadow-lg">
          <NuxtLink
            to="/settings"
            class="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-popover-foreground/70 transition-colors hover:bg-accent hover:text-popover-foreground"
            @click="$emit('close')"
          >
            <HugeiconsIcon :icon="Settings01Icon" :size="16" />
            Setelan
          </NuxtLink>
          <button
            class="mt-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-destructive/70 transition-colors hover:bg-accent hover:text-destructive"
            @click="onSignOut"
          >
            <HugeiconsIcon :icon="Logout01Icon" :size="16" />
            Logout
          </button>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue';
import {
  Home03Icon,
  ArrowLeftRightIcon,
  GridViewIcon,
  RepeatIcon,
  Settings01Icon,
  MoneyAdd01Icon,
  Logout01Icon,
  ChevronUpIcon,
} from '@hugeicons/core-free-icons';

defineProps<{
  open: boolean;
}>();

defineEmits<{
  close: [];
}>();

const { user, signOut } = useAuth();
const route = useRoute();

const profileOpen = ref(false);

const onSignOut = async () => {
  await signOut();
};

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home03Icon },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRightIcon },
  { to: '/categories', label: 'Kategori', icon: GridViewIcon },
  { to: '/recurring', label: 'Rutin', icon: RepeatIcon },
];

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};
</script>
