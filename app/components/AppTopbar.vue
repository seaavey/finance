<template>
  <header
    class="sticky top-0 z-40 flex h-16 items-center border-b border-zinc-200/50 bg-white/70 px-6 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/70"
  >
    <!-- LEFT: Breadcrumbs & Mobile Toggle -->
    <div class="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        class="size-9 rounded-xl border border-zinc-200/50 bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-950/50 lg:hidden"
        @click="$emit('toggleSidebar')"
      >
        <Icon name="hugeicons:menu-02" :size="18" />
      </Button>

      <Breadcrumb class="hidden md:block">
        <BreadcrumbList>
          <template v-for="(item, i) in breadcrumbItems" :key="i">
            <template v-if="i === breadcrumbItems.length - 1">
              <BreadcrumbItem>
                <BreadcrumbPage class="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50">
                  {{ item.label }}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </template>
            <template v-else>
              <BreadcrumbItem class="hidden md:flex">
                <BreadcrumbLink
                  :to="item.to!"
                  class="text-xs font-black uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-50"
                >
                  {{ item.label }}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:flex">
                <Icon name="hugeicons:arrow-right-01" :size="10" class="text-zinc-300" />
              </BreadcrumbSeparator>
            </template>
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <!-- RIGHT: Search, Notifications, Theme, CTA -->
    <div class="ml-auto flex items-center gap-4">
      <!-- SEARCH - Mobile -->
      <Button
        variant="ghost"
        size="icon"
        class="size-9 rounded-xl border border-zinc-200/50 bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-950/50 md:hidden"
        @click="showSearchDialog = true"
      >
        <Icon name="hugeicons:search-01" :size="18" />
      </Button>

      <!-- SEARCH - Desktop -->
      <div class="relative hidden md:block">
        <Button
          variant="outline"
          class="h-9 w-64 justify-start rounded-xl border-zinc-200/50 bg-zinc-100/50 pl-9 pr-12 text-xs font-bold text-zinc-500 transition-all hover:bg-zinc-100 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
          @click="showSearchDialog = true"
        >
          <Icon name="hugeicons:search-01" :size="14" class="absolute left-3 text-zinc-400" />
          <span>{{ $t('topbar.search') }}</span>
          <kbd
            class="absolute right-3 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-black text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            >⌘K</kbd
          >
        </Button>
      </div>

      <!-- NOTIFICATIONS -->
      <Popover>
        <PopoverTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="relative size-9 rounded-xl border border-zinc-200/50 bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-950/50"
          >
            <Icon name="hugeicons:notification-03" :size="18" />
            <span
              v-if="activeReminders.length > 0"
              class="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-950"
            >
              {{ activeReminders.length }}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-80 rounded-2xl border-zinc-200/50 p-0 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/90" align="end">
          <div class="border-b border-zinc-200/50 p-4 dark:border-zinc-800/50">
            <h4 class="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50">
              {{ $t('topbar.notifications') }}
            </h4>
          </div>
          <div class="max-h-[300px] overflow-y-auto p-2">
            <template v-if="activeReminders.length > 0">
              <div
                v-for="reminder in activeReminders"
                :key="reminder.id"
                class="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50"
              >
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500"
                >
                  <Icon name="hugeicons:alert-01" :size="14" />
                </div>
                <div class="flex-1 space-y-0.5">
                  <p class="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {{ reminder.name }}
                  </p>
                  <p class="text-xs font-medium text-zinc-500">
                    {{ formatCurrency(reminder.amount, reminder.currency) }} •
                    {{
                      reminder.days_left === 0
                        ? $t('recurring.due_today')
                        : reminder.days_left === 1
                          ? $t('recurring.due_tomorrow')
                          : $t('recurring.due_in_n_days', { days: reminder.days_left })
                    }}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-7 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  @click="dismissReminder(reminder.id)"
                >
                  <Icon name="hugeicons:cancel-01" :size="14" />
                </Button>
              </div>
            </template>
            <div v-else class="flex h-32 flex-col items-center justify-center space-y-2">
              <Icon name="hugeicons:notification-03" :size="24" class="text-zinc-200 dark:text-zinc-800" />
              <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {{ $t('topbar.no_notifications') }}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <!-- THEME -->
      <Button
        variant="ghost"
        size="icon"
        class="size-9 rounded-xl border border-zinc-200/50 bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-950/50"
        @click="cycleColorMode"
      >
        <ClientOnly>
          <Icon v-if="colorMode.value === 'dark'" name="hugeicons:sun-01" :size="18" />
          <Icon v-else name="hugeicons:moon-01" :size="18" />
          <template #fallback>
            <div class="size-[18px]" />
          </template>
        </ClientOnly>
      </Button>

      <!-- PREMIUM CTA -->
      <Button
        v-if="route.path !== '/settings'"
        class="h-9 gap-2 rounded-xl bg-zinc-900 px-4 text-xs font-bold text-white shadow-lg shadow-zinc-900/10 transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:shadow-none dark:hover:bg-zinc-200"
        @click="navigateTo('/transactions/new')"
      >
        <Icon name="hugeicons:add-01" :size="16" />
        <span class="hidden sm:inline">{{ $t('topbar.add') }}</span>
      </Button>
    </div>

    <SearchDialog v-model:open="showSearchDialog" />
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

defineEmits<{
  toggleSidebar: [];
}>();

const route = useRoute();
const colorMode = useColorMode();
const { t } = useI18n();
const { fetchRecurring } = useRecurring();
const { activeReminders, dismissReminder } = useReminders();
const { formatCurrency } = useCurrency();

const showSearchDialog = ref(false);

const searchKeydownHandler = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    showSearchDialog.value = true;
  }
};

onMounted(() => {
  document.addEventListener('keydown', searchKeydownHandler);
  fetchRecurring();
});
onUnmounted(() => document.removeEventListener('keydown', searchKeydownHandler));

interface BreadcrumbItemDef {
  label: string;
  to?: string;
}

const breadcrumbItems = computed<BreadcrumbItemDef[]>(() => {
  const path = route.path;
  const items: BreadcrumbItemDef[] = [{ label: t('topbar.dashboard'), to: '/' }];

  if (path === '/') {
    return items;
  }

  if (path.startsWith('/transactions')) {
    items.push({ label: t('topbar.transactions'), to: '/transactions' });
    if (path === '/transactions/new') {
      items.push({ label: t('topbar.add_title') });
    } else if (path.includes('/edit')) {
      items.push({ label: t('topbar.edit') });
    }
    return items;
  }

  if (path.startsWith('/categories')) {
    items.push({ label: t('topbar.categories') });
    return items;
  }

  if (path.startsWith('/recurring')) {
    items.push({ label: t('topbar.recurring') });
    return items;
  }

  if (path.startsWith('/goals')) {
    items.push({ label: t('topbar.goals') });
    return items;
  }

  if (path.startsWith('/budget')) {
    items.push({ label: t('topbar.budget') });
    return items;
  }

  if (path.startsWith('/accounts')) {
    items.push({ label: t('topbar.accounts') });
    return items;
  }

  if (path.startsWith('/settings')) {
    items.push({ label: t('topbar.settings') });
    return items;
  }

  return items;
});

const cycleColorMode = () => {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light';
};
</script>
