# Topbar Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the topbar search bar functional (filters transactions by description via Supabase ILIKE) instead of its current static visual-only state.

**Architecture:** The existing `useTransactions` composable already has `fetchTransactions({ search: string })` which queries `description ILIKE '%term%'`. The transaction state is a global `useState` ref, so calling `fetchTransactions` from the topbar updates the transaction list everywhere (dashboard, transactions page, etc.). We only need to replace the current visual-only div in AppTopbar.vue with an actual input and wire it up.

**Tech Stack:** Nuxt 4 + Vue 3 + TypeScript + Supabase (+ Tailwind CSS v4)

**Files Modified:**

- `app/components/AppTopbar.vue` — the only file that changes (template + script)

**Files with Pre-existing Content (read-only):**

- `app/composables/useTransactions.ts` — provides `fetchTransactions(filters)`, already handles `search` filter via `query.ilike('description', '%{term}%')`
- `i18n/locales/en.json` / `id.json` — already have `topbar.search` key ("Search transactions..."/"Cari transaksi...")

---

### Task 1: Replace visual search div with functional input in AppTopbar.vue

**Files:**

- Modify: `app/components/AppTopbar.vue`

- [ ] **Step 1: Replace the visual-only search template**

  In the template, replace the current `<div>` at lines 40-55 (which is just a styled div with static text) with an actual `<input>` element that binds to a `searchQuery` ref and fires a debounced handler:

  **Old code (lines 39-55):**

  ```html
  <!-- SEARCH -->
  <div class="relative hidden md:block">
    <HugeiconsIcon
      :icon="Search01Icon"
      :size="16"
      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
    />
    <div
      class="flex h-10 w-60 cursor-pointer items-center rounded-2xl border border-border/50 bg-card/30 pl-10 pr-12 text-sm text-muted-foreground/60 transition hover:bg-card/60 hover:text-muted-foreground lg:w-65"
    >
      <span>{{ $t('topbar.search') }}</span>
      <kbd
        class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border/50 bg-background/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/50"
        >⌘K</kbd
      >
    </div>
  </div>
  ```

  **New code:**

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

  **Key differences:**
  - `<div>` → `<input>` with `v-model="searchQuery"` and `@input="onSearchInput"`
  - Added `outline-none` to remove default input outline
  - Added `focus:border-pink-500/30 focus:bg-card/60` for focus states
  - Changed `text-muted-foreground/60` to `text-foreground` for typed text contrast
  - Keyboard hint `⌘K` is now conditional (`v-if="!searchQuery"`) — hides when user is typing
  - Removed `cursor-pointer` (no longer needed for a div) and `items-center` from classes that don't apply to input (`flex` is kept for alignment)

- [ ] **Step 2: Add imports and reactive state in `<script setup>`**

  **Current imports (lines 94-103):**

  ```typescript
  import {
    Menu02Icon,
    Search01Icon,
    Notification03Icon,
    Sun01Icon,
    Moon01Icon,
    Add01Icon,
  } from '@hugeicons/core-free-icons';
  import { HugeiconsIcon } from '@hugeicons/vue';
  ```

  **Add the useTransactions import after the existing imports:**

  ```typescript
  import { useTransactions } from '~/composables/useTransactions';
  ```

  **Add search state and debounce handler after the `const { t } = useI18n();` line (line 111):**

  ```typescript
  const searchQuery = ref('');

  let searchDebounceTimer: ReturnType<typeof setTimeout>;

  const { fetchTransactions } = useTransactions();

  const onSearchInput = () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      fetchTransactions({ search: searchQuery.value || undefined });
    }, 300);
  };
  ```

- [ ] **Step 3: Run linter and type-check**

  ```bash
  bun run lint
  ```

  Fix any lint issues if they arise.

- [ ] **Step 4: Run format**

  ```bash
  bun run format
  ```

  This ensures the edited file matches project formatting (semicolons, single quotes, 2-space indent, 100 width, trailing commas).

---

## Verification (manual — no test infra)

1. Start dev server: `bun run dev`
2. Navigate to Dashboard — the topbar now shows an input field with placeholder "Search transactions..."
3. Type a word that exists in a transaction description (e.g., "belanja") — the dashboard's recent transactions list should filter to matching items after 300ms
4. Navigate to `/transactions` — the list should similarly reflect the search filter from the topbar
5. Clear the input — transactions should reset to full list
6. Verify the keyboard shortcut hint (`⌘K`) is visible when input is empty, hidden while typing
7. Test on mobile viewport — the search should be hidden (`hidden md:block`)
