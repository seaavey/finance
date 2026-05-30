<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/40 bg-sidebar/50 backdrop-blur-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen"
    :class="open ? 'translate-x-0' : '-translate-x-full lg:-ml-64'"
  >
    <div class="flex h-16 shrink-0 items-center gap-3 px-6">
      <div
        class="flex size-8 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20"
      >
        <Icon name="hugeicons:money-add-01" :size="18" class="text-white" />
      </div>
      <span class="text-lg font-black tracking-tighter text-foreground">{{
        $t('sidebar.finance')
      }}</span>
    </div>

    <nav class="flex-1 space-y-6 overflow-y-auto px-4 py-6">
      <div v-for="section in navSections" :key="section.label" class="space-y-1">
        <h4
          class="px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
        >
          {{ section.label }}
        </h4>
        <div class="space-y-0.5">
          <NuxtLinkLocale
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200"
            :class="
              isActive(item.to)
                ? 'bg-card text-foreground shadow-sm ring-1 ring-border/50'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            "
            @click="$emit('close')"
          >
            <Icon
              :name="item.icon"
              :size="18"
              :class="
                isActive(item.to)
                  ? 'text-primary'
                  : 'text-muted-foreground/60 group-hover:text-foreground'
              "
            />
            {{ item.label }}
          </NuxtLinkLocale>
        </div>
      </div>
    </nav>

    <ClientOnly>
      <div class="border-t border-border/40 p-4">
        <div v-if="user" class="flex items-center gap-3">
          <Avatar class="size-9 shrink-0 border-2 border-background shadow-sm">
            <AvatarImage
              v-if="user.user_metadata?.avatar_url"
              :src="user.user_metadata.avatar_url"
              :alt="user.user_metadata?.full_name"
            />
            <AvatarFallback class="bg-muted text-xs font-bold text-muted-foreground">{{
              user.user_metadata?.full_name?.charAt(0) ?? '?'
            }}</AvatarFallback>
          </Avatar>
          <div class="flex-1 truncate">
            <p class="truncate text-sm font-bold text-foreground">
              {{ user.user_metadata?.full_name }}
            </p>
            <p class="truncate text-[10px] font-medium text-muted-foreground">
              {{ user.email }}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="size-8 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            @click="onSignOut"
          >
            <Icon name="hugeicons:logout-01" :size="16" />
          </Button>
        </div>

        <!-- PARTNER BADGE -->
        <NuxtLinkLocale
          v-if="isPartnered"
          to="/settings"
          class="mt-3 flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-2 text-[10px] font-bold text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <Icon name="hugeicons:user" :size="14" class="text-primary" />
          <span>{{ partnerDisplayName }}</span>
          <span class="ml-auto text-[8px] uppercase tracking-widest text-muted-foreground/40"
            >Partner</span
          >
        </NuxtLinkLocale>
      </div>
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
const { isPartnered, partnerDisplayName, fetchPartner } = usePartner();
const route = useRoute();
const { t } = useI18n();

const navSections = computed(() => [
  {
    label: t('sidebar.sections.main'),
    items: [
      { to: '/dashboard', label: t('sidebar.dashboard'), icon: 'hugeicons:home-03' },
      { to: '/transactions', label: t('sidebar.transactions'), icon: 'hugeicons:arrow-left-right' },
    ],
  },
  {
    label: t('sidebar.sections.finance'),
    items: [
      { to: '/budget', label: t('sidebar.budget'), icon: 'hugeicons:wallet-03' },
      { to: '/accounts', label: t('sidebar.accounts'), icon: 'hugeicons:bank' },
      { to: '/recurring', label: t('sidebar.recurring'), icon: 'hugeicons:repeat' },
    ],
  },
  {
    label: t('sidebar.sections.personal'),
    items: [
      { to: '/goals', label: t('sidebar.goals'), icon: 'hugeicons:target-02' },
      { to: '/categories', label: t('sidebar.categories'), icon: 'hugeicons:grid-view' },
    ],
  },
  {
    label: t('sidebar.sections.system'),
    items: [{ to: '/settings', label: t('sidebar.settings'), icon: 'hugeicons:settings-01' }],
  },
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
