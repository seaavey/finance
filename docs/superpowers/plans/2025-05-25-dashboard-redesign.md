# Dashboard UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the finance dashboard with a premium dark fintech aesthetic using shadcn-vue design tokens.

**Architecture:** Modify existing components (AppSidebar, AppTopbar, dashboard.vue) and global CSS. No new components needed. All data logic stays in existing composables.

**Tech Stack:** Nuxt 4, Vue 3, TailwindCSS, shadcn-vue, Inter font

---

### Task 1: Update Global CSS and Font

**Files:**
- Modify: `app/styles/global.css`
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Update global.css — switch to Inter font, add utility classes**

Replace the entire file content:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn-vue/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: "Inter", sans-serif;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.514 0.222 16.935);
  --primary-foreground: oklch(0.969 0.015 12.422);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --chart-1: oklch(0.81 0.117 11.638);
  --chart-2: oklch(0.645 0.246 16.439);
  --chart-3: oklch(0.586 0.253 17.585);
  --chart-4: oklch(0.514 0.222 16.935);
  --chart-5: oklch(0.455 0.188 13.697);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.586 0.253 17.585);
  --sidebar-primary-foreground: oklch(0.969 0.015 12.422);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.705 0.015 286.067);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.455 0.188 13.697);
  --primary-foreground: oklch(0.969 0.015 12.422);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.552 0.016 285.938);
  --chart-1: oklch(0.81 0.117 11.638);
  --chart-2: oklch(0.645 0.246 16.439);
  --chart-3: oklch(0.586 0.253 17.585);
  --chart-4: oklch(0.514 0.222 16.935);
  --chart-5: oklch(0.455 0.188 13.697);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.645 0.246 16.439);
  --sidebar-primary-foreground: oklch(0.969 0.015 12.422);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.552 0.016 285.938);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    @apply font-sans antialiased;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
}
```

- [ ] **Step 2: Update nuxt.config.ts — remove DM Sans/JetBrains references**

No changes needed to `nuxt.config.ts` — font is loaded via Google Fonts import in `global.css`. The font family is set via `--font-sans: "Inter", sans-serif` in the `@theme` block.

- [ ] **Step 3: Commit**

```bash
git add app/styles/global.css
git commit -m "style: switch to Inter font and shadcn-vue design tokens"
```

---

### Task 2: Sidebar with Profile Dropdown

**Files:**
- Modify: `app/components/AppSidebar.vue` (full rewrite)

- [ ] **Step 1: Rewrite AppSidebar.vue**

```vue
<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:relative md:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
      <div class="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
        <HugeiconsIcon :icon="MoneyAdd01Icon" :size="18" class="text-sidebar-primary-foreground" />
      </div>
      <span class="text-base font-bold text-sidebar-foreground">Finance</span>
    </div>

    <div class="px-4 pb-1 pt-4">
      <p class="text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">Menu</p>
    </div>

    <nav class="flex-1 space-y-0.5 overflow-y-auto px-3 min-h-0">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        :class="{ 'bg-sidebar-accent text-sidebar-foreground border-l-2 border-sidebar-primary': isActive(item.to) }"
        @click="$emit('close')"
      >
        <HugeiconsIcon :icon="item.icon" :size="18" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div v-if="user" class="shrink-0 border-t border-sidebar-border p-3">
      <button
        class="flex w-full items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2.5 transition-colors hover:bg-sidebar-accent"
        @click="profileOpen = !profileOpen"
      >
        <Avatar class="size-8">
          <AvatarImage v-if="user.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" :alt="user.user_metadata?.full_name" />
          <AvatarFallback class="text-xs font-medium">{{ user.user_metadata?.full_name?.charAt(0) ?? '?' }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1 text-left">
          <p class="truncate text-sm font-medium text-sidebar-foreground">{{ user.user_metadata?.full_name }}</p>
          <p class="truncate text-xs text-sidebar-foreground/50">{{ user.email }}</p>
        </div>
        <ChevronUpIcon
          :size="16"
          class="text-sidebar-foreground/40 transition-transform duration-200"
          :class="profileOpen ? 'rotate-180' : ''"
        />
      </button>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="profileOpen" class="mt-1 rounded-lg border border-border bg-popover p-1 shadow-lg">
          <NuxtLink
            to="/settings"
            class="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-popover-foreground/70 transition-colors hover:bg-accent hover:text-popover-foreground"
            @click="$emit('close')"
          >
            <HugeiconsIcon :icon="Settings01Icon" :size="16" />
            Setelan
          </NuxtLink>
          <button
            class="mt-0.5 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-destructive/70 transition-colors hover:bg-accent hover:text-destructive"
            @click="onSignOut"
          >
            <HugeiconsIcon :icon="Logout01Icon" :size="16" />
            Logout
          </button>
        </div>
      </Transition>
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
  ChevronUpIcon,
} from '@hugeicons/core-free-icons';

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { user, signOut } = useAuth();
const route = useRoute();

const profileOpen = ref(false);

const onSignOut = async () => {
  await signOut();
};

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home03Icon },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRightIcon },
  { to: '/categories', label: 'Kategori', icon: GridViewIcon },
  { to: '/recurring', label: 'Rutin', icon: RepeatIcon },
];

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};
</script>
```

- [ ] **Step 2: Verify the file compiles**

Run: `bunx vue-tsc --noEmit 2>&1 | head -30`
Expected: No errors related to AppSidebar

- [ ] **Step 3: Commit**

```bash
git add app/components/AppSidebar.vue
git commit -m "feat: redesign sidebar with profile dropdown"
```

---

### Task 3: Topbar with Search, Notifications, Quick Actions

**Files:**
- Modify: `app/components/AppTopbar.vue` (full rewrite)

- [ ] **Step 1: Rewrite AppTopbar.vue**

```vue
<template>
  <header
    class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm"
  >
    <div class="flex items-center gap-3">
      <button
        class="rounded-lg p-1.5 text-muted-foreground hover:bg-accent md:hidden"
        @click="$emit('toggleSidebar')"
      >
        <HugeiconsIcon :icon="Menu02Icon" :size="20" />
      </button>
      <h1 class="text-sm font-semibold text-foreground">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="flex w-44 items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
      >
        <HugeiconsIcon :icon="Search01Icon" :size="16" />
        <span>Cari...</span>
        <kbd class="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
      </button>

      <button class="relative rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent">
        <HugeiconsIcon :icon="Notification03Icon" :size="18" />
        <span class="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
      </button>

      <ClientOnly>
        <button
          class="rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent"
          @click="cycleColorMode"
        >
          <HugeiconsIcon v-if="colorMode.preference === 'dark'" :icon="Sun01Icon" :size="18" />
          <HugeiconsIcon v-else :icon="Moon01Icon" :size="18" />
        </button>
      </ClientOnly>

      <button
        class="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        @click="navigateTo('/transactions/new')"
      >
        <HugeiconsIcon :icon="Add01Icon" :size="16" />
        <span class="hidden sm:inline">Tambah</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  Menu02Icon,
  Search01Icon,
  Notification03Icon,
  Sun01Icon,
  Moon01Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';

defineEmits<{
  toggleSidebar: [];
}>();

const route = useRoute();
const colorMode = useColorMode();

const cycleColorMode = () => {
  const modes = ['dark', 'light', 'system'];
  const current = modes.indexOf(colorMode.preference);
  colorMode.preference = modes[(current + 1) % modes.length];
};

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/transactions': 'Transaksi',
    '/transactions/new': 'Tambah Transaksi',
    '/categories': 'Kategori',
    '/todos': 'Todo',
    '/recurring': 'Transaksi Rutin',
    '/settings': 'Setelan',
  };
  return titles[route.path] ?? 'Finance';
});
</script>
```

- [ ] **Step 2: Verify the file compiles**

Run: `bunx vue-tsc --noEmit 2>&1 | head -30`
Expected: No errors related to AppTopbar

- [ ] **Step 3: Commit**

```bash
git add app/components/AppTopbar.vue
git commit -m "feat: redesign topbar with search, notifications, quick actions"
```

---

### Task 4: Dashboard Page Redesign

**Files:**
- Modify: `app/pages/dashboard.vue`

- [ ] **Step 1: Rewrite dashboard.vue**

```vue
<template>
  <div class="space-y-5 pb-6">
    <div class="flex items-center justify-between">
      <div>
        <ClientOnly>
          <h2 class="text-lg font-semibold text-foreground">Halo, {{ displayName }}</h2>
          <template #fallback>
            <h2 class="text-lg font-semibold text-foreground">Halo...</h2>
          </template>
        </ClientOnly>
        <p class="text-sm text-muted-foreground">{{ monthLabel }}</p>
      </div>
    </div>

    <div v-if="loading" class="space-y-5">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-2xl bg-card" />
      </div>
      <div class="h-64 animate-pulse rounded-2xl bg-card" />
      <div class="h-52 animate-pulse rounded-2xl bg-card" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div class="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <div class="flex items-start justify-between">
            <div class="flex size-9 items-center justify-center rounded-xl bg-green-500/10">
              <HugeiconsIcon :icon="ArrowDown01Icon" :size="18" class="text-green-500" />
            </div>
            <div class="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-500">
              +{{ trendIncome }}%
            </div>
          </div>
          <p class="mt-3 text-xs text-muted-foreground">Pemasukan</p>
          <p class="mt-1 text-xl font-bold text-foreground">{{ formatCurrency(totalIncome) }}</p>
        </div>

        <div class="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <div class="flex items-start justify-between">
            <div class="flex size-9 items-center justify-center rounded-xl bg-red-500/10">
              <HugeiconsIcon :icon="ArrowUp01Icon" :size="18" class="text-red-500" />
            </div>
            <div class="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500">
              +{{ trendExpense }}%
            </div>
          </div>
          <p class="mt-3 text-xs text-muted-foreground">Pengeluaran</p>
          <p class="mt-1 text-xl font-bold text-foreground">{{ formatCurrency(totalExpense) }}</p>
        </div>

        <div class="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <div class="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-indigo-500/10 blur-2xl" />
          <div class="relative flex items-start justify-between">
            <div class="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10">
              <HugeiconsIcon :icon="Wallet01Icon" :size="18" class="text-indigo-400" />
            </div>
            <div class="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400">
              {{ balance >= 0 ? '+' : '' }}{{ trendBalance }}%
            </div>
          </div>
          <p class="relative mt-3 text-xs text-muted-foreground">Saldo</p>
          <p class="relative mt-1 text-xl font-bold text-foreground">{{ formatCurrency(balance) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-2xl border border-border bg-card p-4">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foreground">Pengeluaran per Kategori</h3>
            <div class="flex gap-1">
              <button
                v-for="period in chartPeriods"
                :key="period"
                class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                :class="selectedPeriod === period ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'"
                @click="selectedPeriod = period"
              >
                {{ period }}
              </button>
            </div>
          </div>
          <ChartsExpenseDonut :categories="expenseByCategory" />
          <div v-if="expenseByCategory.length > 0" class="mt-4 space-y-2">
            <div v-for="cat in expenseByCategory" :key="cat.name" class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="size-2 rounded-full" :style="{ backgroundColor: cat.color }" />
                <span class="text-muted-foreground">{{ cat.name }}</span>
              </div>
              <span class="font-medium text-foreground">{{ formatCurrency(cat.total) }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-border bg-card p-4">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foreground">Tren 6 Bulan</h3>
            <span class="text-xs text-muted-foreground/60">Pemasukan vs Pengeluaran</span>
          </div>
          <ChartsMonthlyBar :data="monthlyData" />
          <div class="mt-3 flex justify-center gap-4">
            <div class="flex items-center gap-1.5 text-xs">
              <span class="size-2.5 rounded-sm bg-green-500/70" />
              <span class="text-muted-foreground">Pemasukan</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
              <span class="size-2.5 rounded-sm bg-red-500/70" />
              <span class="text-muted-foreground">Pengeluaran</span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-card">
        <div class="flex items-center justify-between p-4 pb-0">
          <h3 class="text-sm font-semibold text-foreground">Transaksi Terakhir</h3>
          <NuxtLink to="/transactions" class="text-xs font-medium text-primary hover:underline">
            Lihat semua &rarr;
          </NuxtLink>
        </div>
        <div class="p-4">
          <div v-if="recentTransactions.length === 0" class="flex flex-col items-center gap-3 py-8 text-center">
            <div class="flex size-12 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon :icon="ArrowLeftRightIcon" :size="24" class="text-muted-foreground/40" />
            </div>
            <div>
              <p class="text-sm font-medium text-foreground">Belum ada transaksi</p>
              <p class="text-xs text-muted-foreground">Mulai catat pemasukan atau pengeluaran pertama kamu</p>
            </div>
            <NuxtLink
              to="/transactions/new"
              class="mt-1 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              + Tambah Transaksi
            </NuxtLink>
          </div>
          <div v-else class="-mx-4 space-y-0">
            <NuxtLink
              v-for="(tx, index) in recentTransactions"
              :key="tx.id"
              :to="`/transactions/${tx.id}/edit`"
              class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
              :class="index < recentTransactions.length - 1 ? 'border-b border-border' : ''"
            >
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-xl"
                :class="tx.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'"
              >
                <HugeiconsIcon
                  :icon="tx.type === 'income' ? ArrowDown01Icon : ArrowUp01Icon"
                  :size="16"
                  :class="tx.type === 'income' ? 'text-green-500' : 'text-red-500'"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-foreground">{{ tx.description || getCategoryName(tx.category_id) || 'Transaksi' }}</p>
                <div class="mt-0.5 flex items-center gap-2">
                  <span class="text-xs text-muted-foreground/60">{{ formatRelativeDate(tx.date) }}</span>
                  <span v-if="tx.category_id" class="size-1 rounded-full bg-muted-foreground/30" />
                  <span
                    v-if="getCategoryName(tx.category_id)"
                    class="rounded-md px-1.5 py-0.5 text-xs font-medium"
                    :style="{
                      backgroundColor: getCategoryColor(tx.category_id) + '20',
                      color: getCategoryColor(tx.category_id),
                    }"
                  >
                    {{ getCategoryName(tx.category_id) }}
                  </span>
                </div>
              </div>
              <p
                class="shrink-0 text-sm font-bold"
                :class="tx.type === 'income' ? 'text-green-500' : 'text-red-500'"
              >
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
              </p>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          class="flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          @click="navigateTo('/transactions/new')"
        >
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
            <HugeiconsIcon :icon="Add01Icon" :size="22" class="text-indigo-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">Tambah Transaksi</p>
            <p class="text-xs text-muted-foreground">Catat pemasukan atau pengeluaran</p>
          </div>
        </div>
        <div
          class="flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          @click="navigateTo('/categories')"
        >
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
            <HugeiconsIcon :icon="GridViewIcon" :size="22" class="text-orange-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">Kelola Kategori</p>
            <p class="text-xs text-muted-foreground">Atur kategori transaksi kamu</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Wallet01Icon,
  Add01Icon,
  GridViewIcon,
  ArrowLeftRightIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';

const { user } = useAuth();
const { transactions, fetchTransactions } = useTransactions();
const { categories, fetchCategories } = useCategories();
const { formatCurrency } = useCurrency();

const loading = ref(true);
const selectedPeriod = ref('30d');

const chartPeriods = ['7d', '30d', '90d'];

const displayName = computed(() => {
  const name = user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || '';
  return name.split(' ')[0] || 'User';
});

const monthLabel = computed(() => {
  return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
});

const formatRelativeDate = (date: string) => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const getCategoryName = (id: string | null) => {
  if (!id) return '';
  return categories.value.find(c => c.id === id)?.name || '';
};

const getCategoryColor = (id: string | null) => {
  if (!id) return '#6b7280';
  return categories.value.find(c => c.id === id)?.color || '#6b7280';
};

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const thisMonthTransactions = computed(() =>
  transactions.value.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  })
);

const totalIncome = computed(() =>
  thisMonthTransactions.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
);

const totalExpense = computed(() =>
  thisMonthTransactions.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
);

const balance = computed(() => totalIncome.value - totalExpense.value);

const trendIncome = computed(() => {
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prev = transactions.value.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear && tx.type === 'income';
  }).reduce((s, t) => s + t.amount, 0);
  if (prev === 0) return 0;
  return Math.round(((totalIncome.value - prev) / prev) * 100);
});

const trendExpense = computed(() => {
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prev = transactions.value.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear && tx.type === 'expense';
  }).reduce((s, t) => s + t.amount, 0);
  if (prev === 0) return 0;
  return Math.round(((totalExpense.value - prev) / prev) * 100);
});

const trendBalance = computed(() => {
  return Math.round(((totalIncome.value - totalExpense.value) / (totalIncome.value || 1)) * 100);
});

const recentTransactions = computed(() =>
  [...transactions.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
);

const expenseByCategory = computed(() => {
  const map = new Map<string, { name: string; color: string; total: number }>();
  thisMonthTransactions.value
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = categories.value.find(c => c.id === t.category_id);
      const key = cat?.id || 'uncategorized';
      const existing = map.get(key);
      if (existing) {
        existing.total += t.amount;
      } else {
        map.set(key, { name: cat?.name || 'Lainnya', color: cat?.color || '#6b7280', total: t.amount });
      }
    });
  return [...map.values()].sort((a, b) => b.total - a.total);
});

const monthlyData = computed(() => {
  const months: { label: string; income: number; expense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const label = d.toLocaleDateString('id-ID', { month: 'short' });
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthTx = transactions.value.filter(tx => {
      const td = new Date(tx.date);
      return td.getMonth() === m && td.getFullYear() === y;
    });
    months.push({
      label,
      income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    });
  }
  return months;
});

onMounted(async () => {
  await Promise.all([fetchTransactions(), fetchCategories()]);
  loading.value = false;
});
</script>
```

- [ ] **Step 2: Verify the file has no unused imports**

The dashboard template uses: ArrowDown01Icon, ArrowUp01Icon, Wallet01Icon, Add01Icon, GridViewIcon, ArrowLeftRightIcon — all used in template. `HugeiconsIcon` used in template. All good.

- [ ] **Step 3: Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "feat: redesign dashboard with premium fintech components"
```

---

### Task 5: Verify with Lint and Build

**Files:** N/A — runs checks

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: No errors in modified files (existing codebase may have pre-existing lint issues)

- [ ] **Step 2: Fix any lint errors in changed files**

If lint reports unused imports or formatting issues in AppSidebar.vue, AppTopbar.vue, or dashboard.vue, fix them.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: fix lint issues after redesign"
```
