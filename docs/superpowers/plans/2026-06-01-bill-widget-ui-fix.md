# Bill Widget UI Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the `BillDashboardWidget.vue` to use a two-row stacked layout, preventing text truncation and improving visual hierarchy.

**Architecture:** Transition from a horizontal `flex items-center` layout to a hybrid layout where the icon is on the left, and the content area uses vertical stacking for title/amount and metadata/actions.

**Tech Stack:** Vue 3, Tailwind CSS, Lucide Icons (via AppIcon).

---

### Task 1: Refactor Template Structure

**Files:**
- Modify: `src/components/BillDashboardWidget.vue`

- [ ] **Step 1: Update the item container and content layout**

Modify the `v-for` loop content to create the stacked layout.

```vue
<!-- Old Structure (approximate) -->
<div class="group flex items-center gap-3 ...">
  <div class="icon">...</div>
  <div class="min-w-0 flex-1">
    <p class="truncate ...">{{ bill.title }}</p>
    <p class="...">{{ getDueDateText(bill.due_date) }}</p>
  </div>
  <div class="flex shrink-0 items-center gap-2">
    <p>{{ formatCurrency(bill.amount) }}</p>
    <Button>...</Button>
  </div>
</div>

<!-- New Structure -->
<div
  v-for="bill in upcomingBills"
  :key="bill.id"
  class="group flex gap-4 rounded-2xl bg-muted/30 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
>
  <!-- Icon remains left-aligned -->
  <div
    class="flex size-10 shrink-0 items-center justify-center rounded-xl"
    :class="isOverdue(bill.due_date) ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'"
  >
    <AppIcon name="hugeicons:calendar-03" :size="20" />
  </div>

  <!-- Main Content Area: Stacked -->
  <div class="flex min-w-0 flex-1 flex-col gap-2.5">
    <!-- Top Row: Title and Amount -->
    <div class="flex items-start justify-between gap-2">
      <p class="truncate text-sm font-bold text-foreground">{{ bill.title }}</p>
      <p class="shrink-0 text-sm font-black text-foreground">
        {{ formatCurrency(bill.amount) }}
      </p>
    </div>

    <!-- Bottom Row: Due Date and Action -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <AppIcon name="hugeicons:calendar-03" :size="12" class="text-muted-foreground/60" />
        <p class="text-[10px] font-bold" :class="getDueDateClass(bill.due_date)">
          {{ getDueDateText(bill.due_date) }}
        </p>
      </div>
      <Button variant="outline" size="sm" class="h-7 px-3 text-[10px] font-bold" @click="handleMarkPaid(bill.id)">
        {{ $t('bills.mark_paid') }}
      </Button>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Apply the changes to the file**

Use `replace` or `write_file` to update the template.

- [ ] **Step 3: Commit the changes**

```bash
git add src/components/BillDashboardWidget.vue
git commit -m "feat: refactor bill widget to stacked layout for better readability"
```

---

### Task 2: Manual Verification

**Files:**
- N/A (Visual check)

- [ ] **Step 1: Verify layout and truncation**
Ensure that longer bill titles now have more horizontal space before truncating.

- [ ] **Step 2: Verify button functionality**
Click "Mark as Paid" and ensure the bill is removed/updated correctly.

- [ ] **Step 3: Verify color coding**
Ensure overdue bills still show in rose/red and upcoming bills in amber/yellow.
