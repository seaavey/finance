<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200/50 bg-zinc-50/50 backdrop-blur-xl transition-transform duration-200 dark:border-zinc-800/50 dark:bg-zinc-950/50 md:sticky md:top-0 md:h-screen md:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-16 shrink-0 items-center gap-3 px-6">
      <div
        class="flex size-8 items-center justify-center rounded-xl bg-pink-500 shadow-lg shadow-pink-500/20"
      >
        <Icon name="hugeicons:money-add-01" :size="18" class="text-white" />
      </div>
      <span class="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{{
        $t('sidebar.finance')
      }}</span>
    </div>

    <nav class="flex-1 space-y-6 overflow-y-auto px-4 py-6">
      <div v-for="section in navSections" :key="section.label" class="space-y-1">
        <h4
          class="px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"
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
                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:ring-zinc-800'
                : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50'
            "
            @click="$emit('close')"
          >
            <Icon
              :name="item.icon"
              :size="18"
              :class="
                isActive(item.to)
                  ? 'text-pink-500'
                  : 'text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300'
              "
            />
            {{ item.label }}
          </NuxtLinkLocale>
        </div>
      </div>
    </nav>

    <ClientOnly>
      <div class="border-t border-zinc-200/50 p-4 dark:border-zinc-800/50">
        <div v-if="user" class="flex items-center gap-3">
          <Avatar class="size-9 shrink-0 border-2 border-white shadow-sm dark:border-zinc-800">
            <AvatarImage
              v-if="user.user_metadata?.avatar_url"
              :src="user.user_metadata.avatar_url"
              :alt="user.user_metadata?.full_name"
            />
            <AvatarFallback class="bg-zinc-100 text-xs font-bold text-zinc-400 dark:bg-zinc-800">{{
              user.user_metadata?.full_name?.charAt(0) ?? '?'
            }}</AvatarFallback>
          </Avatar>
          <div class="flex-1 truncate">
            <p class="truncate text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {{ user.user_metadata?.full_name }}
            </p>
            <p class="truncate text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
              {{ user.email }}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="size-8 rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            @click="onSignOut"
          >
            <Icon name="hugeicons:logout-01" :size="16" />
          </Button>
        </div>

        <!-- PARTNER BADGE -->
        <NuxtLinkLocale
          v-if="isPartnered"
          to="/settings"
          class="mt-3 flex items-center gap-2 rounded-xl bg-zinc-100/50 px-3 py-2 text-[10px] font-bold text-zinc-500 transition-colors hover:bg-zinc-100 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          <Icon name="hugeicons:user" :size="14" class="text-pink-500" />
          <span>{{ partnerDisplayName }}</span>
          <span class="ml-auto text-[8px] uppercase tracking-widest text-zinc-300 dark:text-zinc-600"
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

