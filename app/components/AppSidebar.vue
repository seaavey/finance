<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:sticky md:top-0 md:self-start md:max-h-dvh md:translate-x-0 h-screen"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex shrink-0 items-center gap-3 border-b border-sidebar-border px-4 h-16">
      <div class="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
        <Icon name="hugeicons:money-add-01" :size="18" class="text-sidebar-primary-foreground" />
      </div>
      <span class="text-base font-bold text-sidebar-foreground">{{ $t('sidebar.finance') }}</span>
    </div>

    <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      <NuxtLinkLocale
        v-for="item in mainNavItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        :class="{ 'bg-sidebar-accent text-sidebar-foreground': isActive(item.to) }"
        @click="$emit('close')"
      >
        <Icon :name="item.icon" :size="18" />
        {{ item.label }}
      </NuxtLinkLocale>

      <div class="mt-auto border-t border-sidebar-border pt-3">
        <NuxtLinkLocale
          v-for="item in bottomNavItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          :class="{ 'bg-sidebar-accent text-sidebar-foreground': isActive(item.to) }"
          @click="$emit('close')"
        >
          <Icon :name="item.icon" :size="18" />
          {{ item.label }}
        </NuxtLinkLocale>
      </div>
    </nav>

    <ClientOnly>
      <div
        v-if="user"
        class="flex shrink-0 items-center gap-2 border-t border-sidebar-border px-3 py-3"
      >
        <Avatar class="size-8 shrink-0">
          <AvatarImage
            v-if="user.user_metadata?.avatar_url"
            :src="user.user_metadata.avatar_url"
            :alt="user.user_metadata?.full_name"
          />
          <AvatarFallback class="text-xs font-medium">{{
            user.user_metadata?.full_name?.charAt(0) ?? '?'
          }}</AvatarFallback>
        </Avatar>
        <span class="flex-1 truncate text-sm font-medium text-sidebar-foreground">{{
          user.user_metadata?.full_name
        }}</span>
        <Button
          variant="ghost"
          size="icon"
          class="size-8 rounded-lg"
          :title="$t('sidebar.logout')"
          @click="onSignOut"
        >
          <Icon name="hugeicons:logout-01" :size="16" />
        </Button>
      </div>

      <!-- PARTNER BADGE -->
      <NuxtLinkLocale
        v-if="isPartnered"
        to="/settings"
        class="flex items-center gap-2 border-t border-sidebar-border/50 px-3 py-2 text-xs text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <Icon name="hugeicons:user" :size="14" />
        <span>{{ partnerDisplayName }}</span>
        <span class="ml-auto text-[10px] text-sidebar-foreground/30">{{
          $t('sidebar.partner')
        }}</span>
      </NuxtLinkLocale>
    </ClientOnly>
  </aside>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';

defineProps<{
  open: boolean;
}>();

defineEmits<{
  close: [];
}>();

const { user, signOut } = useAuth();
const { partner, isPartnered, partnerDisplayName, fetchPartner } = usePartner();
const route = useRoute();
const { t } = useI18n();

const mainNavItems = computed(() => [
  { to: '/dashboard', label: t('sidebar.dashboard'), icon: 'hugeicons:home-03' },
  { to: '/transactions', label: t('sidebar.transactions'), icon: 'hugeicons:arrow-left-right' },
  { to: '/categories', label: t('sidebar.categories'), icon: 'hugeicons:grid-view' },
  { to: '/recurring', label: t('sidebar.recurring'), icon: 'hugeicons:repeat' },
  { to: '/goals', label: t('sidebar.goals'), icon: 'hugeicons:target-02' },
  { to: '/budget', label: t('sidebar.budget'), icon: 'hugeicons:wallet-03' },
  { to: '/accounts', label: t('sidebar.accounts'), icon: 'hugeicons:bank' },
]);

const bottomNavItems = computed(() => [
  { to: '/settings', label: t('sidebar.settings'), icon: 'hugeicons:settings-01' },
]);

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

const onSignOut = async () => {
  await signOut();
};

onMounted(() => {
  if (user.value) {
    fetchPartner();
  }
});
</script>
