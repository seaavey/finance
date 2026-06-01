# Align Dashboard Bento Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Balance the dashboard columns and remove redundancy by refactoring the Bento grid layout.

**Architecture:** Refactor `src/pages/dashboard.vue` by removing redundant components, adjusting chart heights for better alignment, and relocating widgets to optimize whitespace usage.

**Tech Stack:** Vue 3, Tailwind CSS

---

### Task 1: Cleanup Redundant Widgets

**Files:**
- Modify: `src/pages/dashboard.vue`

- [ ] **Step 1: Remove the redundant "Upcoming Bills" list**
Delete the block starting with `<div v-if="activeReminders.length > 0" ...>` (approx. lines 201-240). Keep the `<BillDashboardWidget />` component.

```vue
<!-- DELETE THIS BLOCK -->
        <div
          v-if="activeReminders.length > 0"
          class="rounded-4xl border border-border/50 bg-rose-500/5 p-6 shadow-sm backdrop-blur-sm transition-all hover:bg-rose-500/10 flex-1"
        >
          ...
        </div>
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/dashboard.vue
git commit -m "refactor: remove redundant upcoming bills list from dashboard"
```

### Task 2: Adjust Chart Height

**Files:**
- Modify: `src/pages/dashboard.vue`

- [ ] **Step 1: Increase the height of the Monthly Bar chart container**
Find the div with class `h-80` (approx. line 190) and change it to `h-[460px]`.

```vue
<!-- BEFORE -->
        <div class="h-80">
          <ClientOnly>
            <ChartsMonthlyBar :data="monthlyData" />
<!-- AFTER -->
        <div class="h-[460px]">
          <ClientOnly>
            <ChartsMonthlyBar :data="monthlyData" />
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/dashboard.vue
git commit -m "refactor: increase monthly bar chart height for better alignment"
```

### Task 3: Relocate and Resize Quick Accounts Widget

**Files:**
- Modify: `src/pages/dashboard.vue`

- [ ] **Step 1: Move the "Quick Accounts" block**
Cut the "Quick Accounts" block (approx. lines 280-318) and paste it after the "Recent Transactions" block (approx. line 403) but before the "Quick Actions" buttons (approx. line 406).

- [ ] **Step 2: Adjust container classes**
Update the relocated block's top-level div classes.
Change from: `rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-lg flex-1`
To: `rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-lg md:col-span-6`

- [ ] **Step 3: Adjust inner grid layout**
Find the inner grid `<div class="grid grid-cols-1 gap-2">` (approx. line 299) and change it to `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">`.

```vue
<!-- NEW LOCATION AND CLASSES -->
      <!-- Quick Accounts (Moved and Span 6) -->
      <div
        class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-lg md:col-span-6"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('dashboard.accounts_title') }}
          </h3>
          ...
        </div>
        <div class="flex h-full flex-col justify-center pb-4">
          <template v-if="accountBalances.length > 0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ...
            </div>
          </template>
          ...
        </div>
      </div>
```

- [ ] **Step 4: Commit**
```bash
git add src/pages/dashboard.vue
git commit -m "feat: align dashboard bento grid and remove redundant widgets"
```
