<script setup lang="ts">
import {
  PencilEdit01Icon,
  Home03Icon,
  ArrowLeftRightIcon,
  GridViewIcon,
  RepeatIcon,
  Settings01Icon,
  Add01Icon as Plus01Icon,
  MoneyAdd01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date';
import { useTransactions, type Transaction } from '~/composables/useTransactions';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

const { searchTransactions } = useTransactions();
const { formatCurrency } = useCurrency();
const { categories } = useCategories();
const { t, locale } = useI18n();

const open = defineModel<boolean>('open', { default: false });
const searchQuery = ref('');
const results = ref<Transaction[]>([]);
const loading = ref(false);

const suggestions = computed(() => [
  { label: t('sidebar.dashboard'), icon: Home03Icon, to: '/dashboard' },
  { label: t('sidebar.transactions'), icon: ArrowLeftRightIcon, to: '/transactions' },
  { label: t('sidebar.categories'), icon: GridViewIcon, to: '/categories' },
  { label: t('sidebar.recurring'), icon: RepeatIcon, to: '/recurring' },
]);

const quickActions = computed(() => [
  { label: t('dashboard.actions_add_transaction'), icon: Plus01Icon, to: '/transactions/new' },
  { label: t('recurring.add'), icon: MoneyAdd01Icon, to: '/recurring' },
  { label: t('sidebar.settings'), icon: Settings01Icon, to: '/settings', shortcut: '⌘S' },
]);

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', {
  day: 'numeric',
  month: 'short',
});

let debounceTimer: ReturnType<typeof setTimeout>;

const search = async (term: string) => {
  if (!term) {
    results.value = [];
    return;
  }
  loading.value = true;
  results.value = await searchTransactions(term);
  loading.value = false;
};

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  searchQuery.value = target.value;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => search(searchQuery.value), 300);
};

const select = (to: string) => {
  open.value = false;
  navigateTo(to);
};

const getCategory = (id: string | null) => categories.value.find((c) => c.id === id);

const formatDate = (date: string) => {
  try {
    return df.format(parseDate(date).toDate(getLocalTimeZone()));
  } catch {
    return date;
  }
};
</script>

<template>
  <CommandDialog v-model:open="open" :title="$t('topbar.search')">
    <CommandInput :placeholder="$t('topbar.search')" @input="onInput" />
    <CommandList>
      <div v-if="loading" class="flex items-center justify-center py-12">
        <p class="text-sm text-muted-foreground/60">{{ $t('topbar.searching') }}</p>
      </div>

      <CommandEmpty v-else-if="results.length === 0 && searchQuery">
        {{ $t('topbar.no_results') }}
      </CommandEmpty>

      <!-- RESULTS -->
      <CommandGroup v-if="results.length > 0 && searchQuery" :heading="$t('transactions.title')">
        <CommandItem
          v-for="tx in results"
          :key="tx.id"
          :value="tx.description || tx.id"
          class="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
          @select="select(`/transactions/${tx.id}/edit`)"
        >
          <div
            class="size-2 shrink-0 rounded-full"
            :style="{ backgroundColor: getCategory(tx.category_id)?.color || '#6b7280' }"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-foreground">
              {{
                tx.description ||
                getCategory(tx.category_id)?.name ||
                $t('transactions.no_description')
              }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ formatDate(tx.date) }}
              · {{ getCategory(tx.category_id)?.name || $t('transactions.all') }}
            </p>
          </div>
          <p
            class="shrink-0 text-sm font-semibold"
            :class="tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'"
          >
            {{ tx.type === 'income' ? '+' : '-'
            }}{{ formatCurrency(Number(tx.amount), tx.currency) }}
          </p>
          <HugeiconsIcon
            :icon="PencilEdit01Icon"
            :size="14"
            class="shrink-0 text-muted-foreground/40"
          />
        </CommandItem>
      </CommandGroup>

      <!-- DEFAULT VIEW (SUGGESTIONS) -->
      <template v-if="!searchQuery && !loading">
        <CommandGroup :heading="$t('topbar.suggestions')">
          <CommandItem
            v-for="item in suggestions"
            :key="item.to"
            :value="item.label"
            class="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
            @select="select(item.to)"
          >
            <HugeiconsIcon :icon="item.icon" :size="16" class="text-muted-foreground" />
            <span class="text-sm font-medium">{{ item.label }}</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup :heading="$t('topbar.quick_actions')">
          <CommandItem
            v-for="item in quickActions"
            :key="item.to"
            :value="item.label"
            class="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
            @select="select(item.to)"
          >
            <HugeiconsIcon :icon="item.icon" :size="16" class="text-muted-foreground" />
            <span class="text-sm font-medium">{{ item.label }}</span>
            <CommandShortcut v-if="item.shortcut">
              {{ item.shortcut }}
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </template>
    </CommandList>
  </CommandDialog>
</template>
