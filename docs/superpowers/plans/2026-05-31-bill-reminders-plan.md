# Bill Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement bill tracking, dashboard widget, calendar page, and notifications.

**Architecture:** Utilize Supabase for data persistence, Pinia/Composables for state management, and shadcn-vue components for UI.

**Tech Stack:** Vue 3, Supabase, Pinia, shadcn-vue, Tailwind CSS.

---

### Task 1: Database Setup

**Files:**

- Modify: `supabase/migrations/20260531000000_bills.sql` (new file)

- [ ] **Step 1: Create bills migration**

```sql
create table public.bills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  amount numeric not null,
  due_date date not null,
  is_paid boolean default false,
  recurrence text default 'none' check (recurrence in ('none', 'weekly', 'monthly')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.bills enable row level security;
create policy "Users can manage their own bills" on public.bills for all using (auth.uid() = user_id);
```

- [ ] **Step 2: Apply migration (simulated)**

(In a real scenario, run `supabase db push`)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260531000000_bills.sql
git commit -m "feat: add bills table migration"
```

### Task 2: Composables & State

**Files:**

- Create: `src/composables/useBills.ts`

- [ ] **Step 1: Implement `useBills`**

```typescript
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Bill {
  id: string
  title: string
  amount: number
  due_date: string
  is_paid: boolean
  recurrence: 'none' | 'weekly' | 'monthly'
}

export function useBills() {
  const bills = ref<Bill[]>([])

  async function fetchBills() {
    const { data } = await supabase.from('bills').select('*')
    if (data) bills.value = data
  }

  async function addBill(bill: Omit<Bill, 'id'>) {
    await supabase.from('bills').insert(bill)
    await fetchBills()
  }

  return { bills, fetchBills, addBill }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useBills.ts
git commit -m "feat: add useBills composable"
```

### Task 3: Dashboard Widget

**Files:**

- Create: `src/components/BillDashboardWidget.vue`
- Modify: `src/components/DashboardSummary.vue`

- [ ] **Step 1: Create `BillDashboardWidget.vue`**

```vue
<script setup lang="ts">
import { useBills } from '@/composables/useBills'
import { computed, onMounted } from 'vue'
const { bills, fetchBills } = useBills()

onMounted(fetchBills)

const upcomingBills = computed(() =>
  bills.value
    .filter((b) => !b.is_paid)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3),
)
</script>

<template>
  <div class="p-4 border rounded shadow">
    <h3>Upcoming Bills</h3>
    <ul v-if="upcomingBills.length">
      <li v-for="bill in upcomingBills" :key="bill.id">{{ bill.title }} - {{ bill.due_date }}</li>
    </ul>
    <p v-else>No upcoming bills!</p>
  </div>
</template>
```

- [ ] **Step 2: Integrate into `DashboardSummary.vue`**

(Add `<BillDashboardWidget />` to `DashboardSummary.vue`)

- [ ] **Step 3: Commit**

```bash
git add src/components/BillDashboardWidget.vue src/components/DashboardSummary.vue
git commit -m "feat: add dashboard bill widget"
```

### Task 4: Calendar Page

**Files:**

- Create: `src/pages/bills.vue`

- [ ] **Step 1: Create `BillsPage.vue`**

```vue
<script setup lang="ts">
import { Calendar } from '@/components/ui/calendar' // shadcn-vue
import { useBills } from '@/composables/useBills'
import { onMounted } from 'vue'

const { bills, fetchBills } = useBills()
onMounted(fetchBills)
</script>

<template>
  <div class="p-6">
    <h1>Bills Calendar</h1>
    <Calendar class="border rounded-md" />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/bills.vue
git commit -m "feat: add bills calendar page"
```

### Task 5: Notifications

**Files:**

- Modify: `src/App.vue`

- [ ] **Step 1: Add check for due bills**

```typescript
// In App.vue setup
import { useBills } from '@/composables/useBills'
import { useToast } from '@/composables/useToast'
import { onMounted } from 'vue'

const { bills, fetchBills } = useBills()
const { toast } = useToast()

onMounted(async () => {
  await fetchBills()
  const today = new Date().toISOString().split('T')[0]
  const dueToday = bills.value.filter((b) => b.due_date === today && !b.is_paid)

  if (dueToday.length) {
    toast({ title: 'Bill Due!', description: `You have ${dueToday.length} bill(s) due today!` })
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add src/App.vue
git commit -m "feat: add due bill notifications"
```
