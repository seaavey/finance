# Topbar Search Dialog — Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans to implement this.

**Goal:** Replace inline search input with a command-palette-style search dialog with autocomplete.

**Architecture:** Create `SearchDialog.vue` using shadcn `Dialog` component. Modify `AppTopbar.vue` to trigger the dialog on click/⌘K. Dialog fetches transactions separately — does NOT mutate global state.

**Tech Stack:** Nuxt 4 + Vue 3 + TypeScript + shadcn-vue Dialog + Tailwind CSS v4

**Files:**

- Create: `app/components/SearchDialog.vue`
- Modify: `app/components/AppTopbar.vue`

---

### Task 1: Create SearchDialog.vue

- [ ] **Step 1: Write `<script setup>`**

```typescript
<script setup lang="ts">
import {
  Search01Icon,
  PencilEdit01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { useTransactions, type Transaction } from '~/composables/useTransactions';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

const { fetchTransactions } = useTransactions();
const { formatCurrency } = useCurrency();
const { categories } = useCategories();

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
  await fetchTransactions({ search: term });
  const { transactions } = useTransactions();
  results.value = transactions.value.slice(0, 10);
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
    navigateTo(`/transactions/${results.value[selectedIndex.value].id}/edit`);
    open.value = false;
  }
};

const getCategory = (id: string | null) =>
  categories.value.find((c) => c.id === id);

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
```

- [ ] **Step 2: Write `<template>`**

```html
<template>
  <dialog v-model:open="open">
    <DialogContent class="sm:max-w-xl gap-0 p-0">
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
        <p class="text-sm text-muted-foreground/60">No results found</p>
      </div>

      <div v-else-if="results.length > 0" class="max-h-80 overflow-y-auto p-2">
        <button
          v-for="(tx, i) in results"
          :key="tx.id"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
          :class="i === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'"
          @click="navigateTo('/transactions/' + tx.id + '/edit'); open = false"
          @mouseenter="selectedIndex = i"
        >
          <div
            class="size-2 shrink-0 rounded-full"
            :style="{ backgroundColor: (getCategory(tx.category_id)?.color || '#6b7280') }"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-foreground">
              {{ tx.description || getCategory(tx.category_id)?.name ||
              $t('transactions.no_description') }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
              }} · {{ getCategory(tx.category_id)?.name || $t('transactions.all') }}
            </p>
          </div>
          <p
            class="shrink-0 text-sm font-semibold"
            :class="tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'"
          >
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(Number(tx.amount), tx.currency)
            }}
          </p>
          <HugeiconsIcon
            :icon="PencilEdit01Icon"
            :size="14"
            class="shrink-0 text-muted-foreground/40"
          />
        </button>
      </div>
    </DialogContent>
  </dialog>
</template>
```

- [ ] **Step 3: Run lint and format**

```bash
bun run lint
bun run format
```

---

### Task 2: Update AppTopbar.vue

- [ ] **Step 1: Replace the search input with a trigger button**

**Current template (lines 39-57):**

```html
<!-- SEARCH -->
<div class="relative hidden md:block">
  <HugeiconsIcon
    :icon="Search01Icon"
    :size="16"
    class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
  />
  <input
    v-model="searchQuery"
    :placeholder="$t('topbar.search')"
    class="flex h-10 w-60 items-center rounded-2xl border border-border/50 bg-card/30 pl-10 pr-12 text-sm text-foreground outline-none transition hover:bg-card/60 hover:text-muted-foreground focus:border-pink-500/30 focus:bg-card/60 lg:w-65"
    @input="onSearchInput"
  />
  <kbd
    v-if="!searchQuery"
    class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border/50 bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/50"
    >⌘K</kbd
  >
</div>
```

**New template:**

```html
<!-- SEARCH -->
<div class="relative hidden md:block">
  <button
    class="flex h-10 w-60 cursor-pointer items-center rounded-2xl border border-border/50 bg-card/30 pl-10 pr-12 text-sm text-muted-foreground/60 transition hover:bg-card/60 hover:text-muted-foreground lg:w-65"
    @click="showSearchDialog = true"
  >
    <HugeiconsIcon :icon="Search01Icon" :size="16" class="shrink-0 text-muted-foreground/60" />
    <span class="ml-2 flex-1 text-left">{{ $t('topbar.search') }}</span>
    <kbd
      class="rounded-md border border-border/50 bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/50"
      >⌘K</kbd
    >
  </button>
</div>
```

Also add `SearchDialog` at the end of the template (before `</header>`):

```html
      <SearchDialog v-model:open="showSearchDialog" />
    </div>
  </header>
```

- [ ] **Step 2: Update `<script setup>`**

Replace the old search logic with a simple boolean ref:

**Remove these lines:**

```typescript
import { useTransactions } from '~/composables/useTransactions';
// ...
const searchQuery = ref('');

let searchDebounceTimer: ReturnType<typeof setTimeout>;

const { fetchTransactions } = useTransactions();

const onSearchInput = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchTransactions({ search: searchQuery.value || undefined }).catch(() => {});
  }, 300);
};

onUnmounted(() => {
  clearTimeout(searchDebounceTimer);
});
```

**Add:**

```typescript
const showSearchDialog = ref(false);
```

Add keyboard shortcut handler after `const { t } = useI18n();`:

```typescript
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      showSearchDialog.value = true;
    }
  };
  document.addEventListener('keydown', handler);
  onUnmounted(() => document.removeEventListener('keydown', handler));
});
```

- [ ] **Step 3: Run lint and format**

```bash
bun run lint
bun run format
```
