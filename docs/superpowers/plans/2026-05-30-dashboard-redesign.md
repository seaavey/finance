# Premium Fintech Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely redesign the dashboard and surrounding layout components to a premium fintech aesthetic using a Bento Grid and Unovis-based charts.

**Architecture:** Refactor `dashboard.vue` into a grid-based layout, migrate charts to Shadcn/Unovis components, and polish `Sidebar` and `Topbar` for visual hierarchy and consistency.

**Tech Stack:** Nuxt 3, Tailwind CSS, shadcn-vue, Unovis (Charts).

---

### Task 1: Foundation & Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install Unovis dependencies**

Run: `bun add @unovis/ts @unovis/vue`

- [ ] **Step 2: Commit changes**

```bash
git add package.json bun.lock
git commit -m "chore: add unovis dependencies for charts"
```

---

### Task 2: Premium Sidebar Redesign

**Files:**

- Modify: `app/components/AppSidebar.vue`

- [ ] **Step 1: Refactor Sidebar for better hierarchy**
      Update the sidebar to include section groupings (Main, Finance, Personal) and improve active/hover states.

```vue
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

    <!-- Profile Section (unchanged logic, just styled) -->
    <div class="border-t border-zinc-200/50 p-4 dark:border-zinc-800/50">
      <!-- Existing Profile & Partner logic -->
    </div>
  </aside>
</template>

<script setup lang="ts">
// ... existing imports ...

const navSections = computed(() => [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: t('sidebar.dashboard'), icon: 'hugeicons:home-03' },
      { to: '/transactions', label: t('sidebar.transactions'), icon: 'hugeicons:arrow-left-right' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/budget', label: t('sidebar.budget'), icon: 'hugeicons:wallet-03' },
      { to: '/accounts', label: t('sidebar.accounts'), icon: 'hugeicons:bank' },
      { to: '/recurring', label: t('sidebar.recurring'), icon: 'hugeicons:repeat' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { to: '/goals', label: t('sidebar.goals'), icon: 'hugeicons:target-02' },
      { to: '/categories', label: t('sidebar.categories'), icon: 'hugeicons:grid-view' },
    ],
  },
]);

// ... isActive logic ...
</script>
```

- [ ] **Step 2: Commit Sidebar changes**

```bash
git add app/components/AppSidebar.vue
git commit -m "design: refactor sidebar for premium grouped layout"
```

---

### Task 3: Glassmorphism Topbar

**Files:**

- Modify: `app/components/AppTopbar.vue`

- [ ] **Step 1: Update Topbar with Glassmorphism and improved Search**
      Improve the alignment, add a better search input style, and ensure the backdrop blur is clean.

```vue
<template>
  <header
    class="sticky top-0 z-40 flex h-16 items-center border-b border-zinc-200/50 bg-white/70 px-6 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/70"
  >
    <!-- Breadcrumbs & Mobile Toggle (styled) -->

    <div class="ml-auto flex items-center gap-4">
      <!-- Search Input -->
      <div class="relative hidden md:block">
        <Button
          variant="outline"
          class="h-9 w-64 justify-start rounded-xl border-zinc-200/50 bg-zinc-100/50 pl-9 pr-12 text-xs font-normal text-zinc-500 transition-all hover:bg-zinc-100 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
          @click="showSearchDialog = true"
        >
          <Icon name="hugeicons:search-01" :size="14" class="absolute left-3 text-zinc-400" />
          <span>{{ $t('topbar.search') }}</span>
          <kbd
            class="absolute right-3 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            >⌘K</kbd
          >
        </Button>
      </div>

      <!-- Notifications & Theme (styled) -->

      <!-- Premium CTA -->
      <Button
        v-if="route.path !== '/settings'"
        class="h-9 gap-2 rounded-xl bg-zinc-900 px-4 text-xs font-bold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-900/10 dark:shadow-none"
        @click="navigateTo('/transactions/new')"
      >
        <Icon name="hugeicons:add-01" :size="16" />
        <span class="hidden sm:inline">{{ $t('topbar.add') }}</span>
      </Button>
    </div>
  </header>
</template>
```

- [ ] **Step 2: Commit Topbar changes**

```bash
git add app/components/AppTopbar.vue
git commit -m "design: update topbar with glassmorphism and premium search"
```

---

### Task 4: Bento Grid Dashboard Implementation

**Files:**

- Modify: `app/pages/dashboard.vue`

- [ ] **Step 1: Rewrite dashboard template with Bento Grid**
      Implement the `grid-cols-6` layout. Create the "Hero" card for Saldo Utama.

```vue
<template>
  <div class="space-y-8 pb-10">
    <!-- Header: Greeting & View Mode -->
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50">
          {{ $t('dashboard.greeting') }}, {{ displayName }}
        </h1>
        <p class="text-sm font-medium text-zinc-500">{{ monthLabel }}</p>
      </div>
      <!-- View mode switch (styled) -->
    </header>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-6">
      <!-- Main Balance Card (Span 3) -->
      <div
        class="group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-4xl border border-zinc-200/50 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900 md:col-span-3"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-zinc-400">
              {{ $t('dashboard.balance_this_month') }}
            </p>
            <h2 class="mt-2 text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
              {{ formatCurrency(balance) }}
            </h2>
          </div>
          <div
            class="flex size-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500"
          >
            <Icon name="hugeicons:wallet-01" :size="24" />
          </div>
        </div>

        <div class="mt-8 flex items-end justify-between">
          <div class="space-y-1">
            <div class="flex items-center gap-1.5">
              <span
                class="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              >
                <Icon name="hugeicons:arrow-up-01" :size="12" class="mr-1" />
                {{ trendBalance || 0 }}%
              </span>
              <span class="text-xs text-zinc-400">{{ $t('dashboard.vs_last_month_short') }}</span>
            </div>
          </div>
          <!-- Sparkline placeholder -->
          <div class="h-16 w-32">
            <!-- We will add a mini chart here in later steps -->
          </div>
        </div>
      </div>

      <!-- Secondary Stats (Span 1 each) -->
      <div
        v-for="stat in secondaryStats"
        :key="stat.label"
        class="col-span-1 rounded-4xl border border-zinc-200/50 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900 md:col-span-1"
      >
        <div class="flex size-10 items-center justify-center rounded-xl" :class="stat.bgClass">
          <Icon :name="stat.icon" :size="20" :class="stat.iconClass" />
        </div>
        <p class="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
          {{ stat.label }}
        </p>
        <p class="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {{ formatCurrency(stat.value) }}
        </p>
      </div>

      <!-- Main Chart (Span 4) -->
      <div
        class="col-span-1 rounded-4xl border border-zinc-200/50 bg-white p-8 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 md:col-span-4"
      >
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-widest text-zinc-400">
            {{ $t('dashboard.expense_chart') }}
          </h3>
        </div>
        <ChartsMonthlyBar :data="monthlyData" />
      </div>

      <!-- Side Section (Span 2) -->
      <div class="col-span-1 space-y-4 md:col-span-2">
        <!-- Accounts/Budget Summaries -->
      </div>

      <!-- Transactions (Span 6) -->
      <div
        class="col-span-1 overflow-hidden rounded-4xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 md:col-span-6"
      >
        <!-- Clean Transaction Table -->
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit Dashboard layout changes**

```bash
git add app/pages/dashboard.vue
git commit -m "design: implement bento grid layout for dashboard"
```

---

### Task 5: Migrate to Unovis Charts

**Files:**

- Modify: `app/components/charts/MonthlyBar.vue`
- Modify: `app/components/charts/ExpenseDonut.vue`
- Modify: `app/components/charts/NetWorthChart.vue`

- [ ] **Step 1: Refactor MonthlyBar.vue using Shadcn Chart (Unovis)**
      Use `ChartContainer`, `Bar`, and premium tooltips.

```vue
<script setup lang="ts">
import { BarChart } from '@/components/ui/chart-bar';

const props = defineProps<{
  data: { label: string; income: number; expense: number }[];
}>();

const { t } = useI18n();

const chartData = computed(() =>
  props.data.map((d) => ({
    name: d.label,
    income: d.income,
    expense: d.expense,
  })),
);
</script>

<template>
  <div class="h-75 w-full">
    <BarChart
      :data="chartData"
      index="name"
      :categories="['income', 'expense']"
      :colors="['#10b981', '#f43f5e']"
      :rounded-corners="6"
    />
  </div>
</template>
```

_(Repeat for Donut and NetWorth charts)_

- [ ] **Step 2: Commit Chart migrations**

```bash
git add app/components/charts/
git commit -m "refactor: migrate charts to Unovis/Shadcn components"
```

---

### Task 6: Final Polish & Animations

**Files:**

- Modify: `app/styles/global.css`
- Modify: `app/pages/dashboard.vue`

- [ ] **Step 1: Add subtle hover animations and transitions**
      Ensure cards have smooth scaling and shadows.

- [ ] **Step 2: Final Verification**
      Check responsive views on mobile and tablet.

- [ ] **Step 3: Commit final polish**

```bash
git commit -am "style: final polish and transitions for premium dashboard"
```
