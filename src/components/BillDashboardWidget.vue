<template>
  <div
    class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md"
  >
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
        {{ $t('bills.title') }}
      </h3>
    </div>
    <div v-if="upcomingBills.length > 0" class="space-y-2">
      <div
        v-for="bill in upcomingBills"
        :key="bill.id"
        class="group flex items-center gap-3 rounded-2xl bg-muted/30 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div
          class="flex size-9 shrink-0 items-center justify-center rounded-xl"
          :class="
            isOverdue(bill.due_date)
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          "
        >
          <Icon name="hugeicons:calendar-03" :size="18" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-bold text-foreground">{{ bill.title }}</p>
          <p
            class="text-[10px] font-bold"
            :class="getDueDateClass(bill.due_date)"
          >
            {{ getDueDateText(bill.due_date) }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <p class="text-xs font-black text-foreground">
            {{ formatCurrency(bill.amount) }}
          </p>
          <Button variant="outline" size="sm" @click="handleMarkPaid(bill.id)">
            {{ $t('bills.mark_paid') }}
          </Button>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center py-6 text-center">
      <div class="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted/50">
        <Icon name="hugeicons:calendar-03" :size="20" class="text-muted-foreground/40" />
      </div>
      <p class="text-xs text-muted-foreground font-bold uppercase tracking-tight">
        {{ $t('bills.no_bills') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import type { Bill } from '@/composables/useBills';

const { bills, fetchBills, markAsPaid } = useBills();
const { formatCurrency } = useCurrency();

const upcomingBills = computed(() =>
  [...bills.value]
    .filter((b: Bill) => !b.is_paid)
    .sort((a: Bill, b: Bill) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3),
);

const getDaysUntilDue = (dueDate: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const isOverdue = (dueDate: string): boolean => getDaysUntilDue(dueDate) < 0;

const getDueDateText = (dueDate: string): string => {
  const days = getDaysUntilDue(dueDate);
  if (days === 0) return 'Due today!';
  if (days < 0) return 'Overdue!';
  return `Due in ${days} days`;
};

const getDueDateClass = (dueDate: string): string => {
  const days = getDaysUntilDue(dueDate);
  if (days === 0) return 'text-amber-500 dark:text-amber-400';
  if (days < 0) return 'text-rose-500 dark:text-rose-400';
  return 'text-muted-foreground';
};

const handleMarkPaid = async (id: string) => {
  try {
    await markAsPaid(id);
  } catch {
    toast.error('Failed to mark bill as paid');
  }
};

onMounted(() => {
  fetchBills();
});
</script>
