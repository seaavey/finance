# Bill Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a notification system for upcoming recurring bills at H-1 and H-7 before their due date.

**Architecture:** A new `useReminders` composable will calculate active reminders from recurring transactions. UI components will subscribe to this state, and LocalStorage will track dismissed alerts.

**Tech Stack:** Nuxt 3, Vue 3, LocalStorage API, Nuxt i18n, shadcn-vue.

---

### Task 1: Create `useReminders` Composable

**Files:**

- Create: `app/composables/useReminders.ts`

- [ ] **Step 1: Define the Reminder interface and basic structure**

```typescript
export interface Reminder {
  id: string;
  transaction_id: string;
  name: string;
  amount: number;
  currency: string;
  next_date: string;
  days_left: number;
}

export const useReminders = () => {
  const { recurring } = useRecurring();
  const reminders = computed<Reminder[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return recurring.value
      .filter((tx) => tx.active && tx.type === 'expense')
      .map((tx) => {
        const nextDate = new Date(tx.next_date);
        nextDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: `${tx.id}-${tx.next_date}`,
          transaction_id: tx.id,
          name: tx.description || 'Bill',
          amount: tx.amount,
          currency: tx.currency,
          next_date: tx.next_date,
          days_left: diffDays,
        };
      })
      .filter((r) => r.days_left === 1 || r.days_left === 7);
  });

  return { reminders };
};
```

- [ ] **Step 2: Add Dismissal Logic using LocalStorage**

Modify `app/composables/useReminders.ts` to include:

```typescript
const dismissedReminders = useLocalStorage<Record<string, boolean>>('dismissed-bill-reminders', {});

const activeReminders = computed(() => {
  return reminders.value.filter((r) => !dismissedReminders.value[r.id]);
});

const dismissReminder = (id: string) => {
  dismissedReminders.value[id] = true;
};
```

- [ ] **Step 3: Commit**

```bash
git add app/composables/useReminders.ts
git commit -m "feat: add useReminders composable with dismissal logic"
```

---

### Task 2: Update `AppTopbar.vue` Notification Bell

**Files:**

- Modify: `app/components/AppTopbar.vue`

- [ ] **Step 1: Integrate `useReminders` and add Badge**

```vue
<script setup lang="ts">
const { activeReminders, dismissReminder } = useReminders();
// ...
</script>

<template>
  <!-- ... existing code ... -->
  <Button variant="ghost" size="icon" class="relative">
    <Icon name="hugeicons:notification-03" :size="18" />
    <span
      v-if="activeReminders.length > 0"
      class="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background"
    >
      {{ activeReminders.length }}
    </span>
  </Button>
  <!-- ... -->
</template>
```

- [ ] **Step 2: Add Popover with list of reminders**

Use `shadcn-vue` Popover to show the list when the bell is clicked.

- [ ] **Step 3: Commit**

```bash
git add app/components/AppTopbar.vue
git commit -m "feat: show active reminders count in topbar notification bell"
```

---

### Task 3: Add "Upcoming Bills" Card to Dashboard

**Files:**

- Modify: `app/pages/dashboard.vue`

- [ ] **Step 1: Add the Upcoming Bills Section**

Insert a section that shows if `activeReminders.length > 0`.

- [ ] **Step 2: Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "feat: add upcoming bills section to dashboard"
```

---

### Task 4: Add Toast Notification on App Load

**Files:**

- Modify: `app/app.vue` or `app/plugins/auth.client.ts`

- [ ] **Step 1: Trigger toast if new reminders exist**

In `app/app.vue`:

```typescript
onMounted(() => {
  if (activeReminders.value.length > 0) {
    toast.info(t('reminders.new_alerts', { count: activeReminders.value.length }));
  }
});
```

- [ ] **Step 2: Add i18n labels**

Update `id.json` and `en.json`.

- [ ] **Step 3: Commit**

```bash
git add app/app.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat: add toast notification for new bill reminders"
```
