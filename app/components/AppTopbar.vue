<template>
  <header
    class="sticky top-0 z-40 flex h-16 items-center border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl"
  >
    <!-- LEFT -->
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" class="lg:hidden" @click="$emit('toggleSidebar')">
        <Icon name="hugeicons:menu-02" :size="18" />
      </Button>

      <Breadcrumb class="hidden md:block">
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
      <!-- SEARCH - Mobile -->
      <Button variant="ghost" size="icon" class="md:hidden" @click="showSearchDialog = true">
        <Icon name="hugeicons:search-01" :size="18" />
      </Button>

      <!-- SEARCH - Desktop -->
      <div class="relative hidden md:block">
        <Button
          variant="outline"
          class="h-10 w-60 cursor-pointer items-center rounded-2xl border-border/50 bg-card/30 pl-10 pr-12 text-sm text-muted-foreground/60 transition hover:bg-card/60 hover:text-muted-foreground lg:w-65"
          @click="showSearchDialog = true"
        >
          <Icon name="hugeicons:search-01" :size="16" class="shrink-0 text-muted-foreground/60" />
          <span class="ml-2 flex-1 text-left">{{ $t('topbar.search') }}</span>
          <kbd
            class="rounded-md border border-border/50 bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/50"
            >⌘K</kbd
          >
        </Button>
      </div>

      <!-- NOTIFICATION -->
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="ghost" size="icon" class="relative">
            <Icon name="hugeicons:notification-03" :size="18" />
            <span
              v-if="activeReminders.length > 0"
              class="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background"
            >
              {{ activeReminders.length }}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-80 p-0" align="end">
          <div class="border-b border-border/50 p-4">
            <h4 class="text-sm font-semibold">{{ $t('topbar.notifications') }}</h4>
          </div>
          <div class="max-h-[300px] overflow-y-auto">
            <template v-if="activeReminders.length > 0">
              <div
                v-for="reminder in activeReminders"
                :key="reminder.id"
                class="flex items-start gap-3 border-b border-border/40 p-4 last:border-0 hover:bg-muted/50"
              >
                <div class="flex-1 space-y-1">
                  <p class="text-sm font-medium leading-none">{{ reminder.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatCurrency(reminder.amount, reminder.currency) }} •
                    {{
                      reminder.days_left === 1
                        ? $t('recurring.due_tomorrow')
                        : $t('recurring.due_in_7_days')
                    }}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-8 rounded-full"
                  @click="dismissReminder(reminder.id)"
                >
                  <Icon name="hugeicons:cancel-01" :size="14" />
                </Button>
              </div>
            </template>
            <div v-else class="flex h-32 flex-col items-center justify-center space-y-2">
              <Icon name="hugeicons:notification-03" :size="24" class="text-muted-foreground/40" />
              <p class="text-xs text-muted-foreground">{{ $t('topbar.no_notifications') }}</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <!-- THEME -->
      <Button variant="ghost" size="icon" @click="cycleColorMode">
        <ClientOnly>
          <Icon v-if="colorMode.value === 'dark'" name="hugeicons:sun-01" :size="18" />
          <Icon v-else name="hugeicons:moon-01" :size="18" />
          <template #fallback>
            <div class="size-[18px]" />
          </template>
        </ClientOnly>
      </Button>

      <!-- CTA -->
      <Button
        v-if="route.path !== '/settings'"
        class="h-10 gap-2 rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-4 text-sm font-medium text-white transition hover:from-pink-400 hover:to-pink-500"
        @click="navigateTo('/transactions/new')"
      >
        <Icon name="hugeicons:add-01" :size="18" />
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
const { activeReminders, dismissReminder } = useReminders();
const { formatCurrency } = useCurrency();

const showSearchDialog = ref(false);

const searchKeydownHandler = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    showSearchDialog.value = true;
  }
};

onMounted(() => document.addEventListener('keydown', searchKeydownHandler));
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
