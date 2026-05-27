<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-xl gap-0 p-0">
      <DialogTitle class="sr-only">{{ $t('topbar.search') }}</DialogTitle>
      <DialogDescription class="sr-only">{{ $t('topbar.search') }}</DialogDescription>
      <div class="flex items-center gap-3 border-b border-border/50 px-4">
        <HugeiconsIcon :icon="Search01Icon" :size="18" class="shrink-0 text-muted-foreground/60" />
        <input
          ref="inputRef"
          v-model="searchQuery"
          :placeholder="$t('topbar.search')"
          class="h-14 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          @input="onInput"
          @keydown="onKeydown"
        />
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <p class="text-sm text-muted-foreground/60">Searching...</p>
      </div>

      <div
        v-else-if="results.length === 0 && searchQuery"
        class="flex items-center justify-center py-12"
      >
        <p class="text-sm text-muted-foreground/60">{{ $t('transactions.empty') }}</p>
      </div>

      <div v-else-if="results.length > 0" class="max-h-80 overflow-y-auto p-2">
        <button
          v-for="(tx, i) in results"
          :key="tx.id"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
          :class="i === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'"
          @click="select(tx.id)"
          @mouseenter="selectedIndex = i"
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
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Search01Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { useTransactions, type Transaction } from '~/composables/useTransactions';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const { searchTransactions } = useTransactions();
const { formatCurrency } = useCurrency();
const { categories } = useCategories();
const { t } = useI18n();

const open = defineModel<boolean>('open', { default: false });
const searchQuery = ref('');
const results = ref<Transaction[]>([]);
const loading = ref(false);
const selectedIndex = ref(-1);

let debounceTimer: ReturnType<typeof setTimeout>;

const search = async () => {
  const term = searchQuery.value.trim();
  if (!term) {
    results.value = [];
    selectedIndex.value = -1;
    return;
  }
  loading.value = true;
  results.value = await searchTransactions(term);
  loading.value = false;
  selectedIndex.value = -1;
};

const onInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(search, 300);
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (e.key === 'Enter' && selectedIndex.value >= 0) {
    select(results.value[selectedIndex.value].id);
  }
};

const select = (id: string) => {
  open.value = false;
  navigateTo(`/transactions/${id}/edit`);
};

const getCategory = (id: string | null) => categories.value.find((c) => c.id === id);

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const inputRef = ref<HTMLInputElement | null>(null);

watch(open, (val) => {
  if (val) {
    nextTick(() => inputRef.value?.focus());
  } else {
    searchQuery.value = '';
    results.value = [];
    selectedIndex.value = -1;
  }
});
</script>
