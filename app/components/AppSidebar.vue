<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:sticky md:top-0 md:self-start md:max-h-dvh md:translate-x-0 h-screen"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex shrink-0 items-center gap-3 border-b border-sidebar-border px-4 h-16">
      <div class="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
        <HugeiconsIcon :icon="MoneyAdd01Icon" :size="18" class="text-sidebar-primary-foreground" />
      </div>
      <span class="text-base font-bold text-sidebar-foreground">Finance</span>
    </div>

    <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      <NuxtLink
        v-for="item in mainNavItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        :class="{ 'bg-sidebar-accent text-sidebar-foreground': isActive(item.to) }"
        @click="$emit('close')"
      >
        <HugeiconsIcon :icon="item.icon" :size="18" />
        {{ item.label }}
      </NuxtLink>

      <div class="mt-auto border-t border-sidebar-border pt-3">
        <NuxtLink
          v-for="item in bottomNavItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          :class="{ 'bg-sidebar-accent text-sidebar-foreground': isActive(item.to) }"
          @click="$emit('close')"
        >
          <HugeiconsIcon :icon="item.icon" :size="18" />
          {{ item.label }}
        </NuxtLink>
      </div>
    </nav>

    <div v-if="user" class="flex shrink-0 items-center gap-2 border-t border-sidebar-border px-3 py-3">
      <Avatar class="size-8 shrink-0">
        <AvatarImage
          v-if="user.user_metadata?.avatar_url"
          :src="user.user_metadata.avatar_url"
          :alt="user.user_metadata?.full_name"
        />
        <AvatarFallback class="text-xs font-medium">{{ user.user_metadata?.full_name?.charAt(0) ?? '?' }}</AvatarFallback>
      </Avatar>
      <span class="flex-1 truncate text-sm font-medium text-sidebar-foreground">{{ user.user_metadata?.full_name }}</span>
      <button
        class="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        @click="onSignOut"
        title="Logout"
      >
        <HugeiconsIcon :icon="Logout01Icon" :size="16" />
      </button>
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
} from '@hugeicons/core-free-icons';

defineProps<{
  open: boolean;
}>();

defineEmits<{
  close: [];
}>();

const { user, signOut } = useAuth();
const route = useRoute();

const mainNavItems = [
  { to: '/', label: 'Dashboard', icon: Home03Icon },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRightIcon },
  { to: '/categories', label: 'Kategori', icon: GridViewIcon },
  { to: '/recurring', label: 'Rutin', icon: RepeatIcon },
];

const bottomNavItems = [{ to: '/settings', label: 'Setelan', icon: Settings01Icon }];

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

const onSignOut = async () => {
  await signOut();
};
</script>
