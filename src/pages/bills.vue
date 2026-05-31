<template>
  <div class="pb-10 pt-4">
    <!-- Header -->
    <div class="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div>
        <h2 class="text-4xl font-black tracking-tighter text-foreground">
          {{ $t('bills.title') }}
        </h2>
        <p class="mt-1 text-sm font-medium text-muted-foreground">
          {{ $t('bills.subtitle') }}
        </p>
      </div>
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button>
            <Icon name="hugeicons:add-01" :size="16" class="mr-2" />
            {{ $t('bills.add_bill') }}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ $t('bills.add_title') }}</DialogTitle>
            <DialogDescription>{{ $t('bills.add_desc') }}</DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <Label for="title">{{ $t('bills.form_title') }}</Label>
              <Input id="title" v-model="form.title" />
            </div>
            <div class="grid gap-2">
              <Label for="amount">{{ $t('bills.form_amount') }}</Label>
              <Input id="amount" v-model.number="form.amount" type="number" min="0" step="any" />
            </div>
            <div class="grid gap-2">
              <Label for="due_date">{{ $t('bills.form_due_date') }}</Label>
              <Input id="due_date" v-model="form.due_date" type="date" />
            </div>
            <div class="grid gap-2">
              <Label for="recurrence">{{ $t('bills.form_recurrence') }}</Label>
              <Select v-model="form.recurrence">
                <SelectTrigger id="recurrence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{{ $t('bills.recurrence_none') }}</SelectItem>
                  <SelectItem value="monthly">{{ $t('bills.recurrence_monthly') }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="dialogOpen = false">
              {{ $t('bills.cancel') }}
            </Button>
            <Button :disabled="!isFormValid" @click="handleAddBill">
              {{ $t('bills.save') }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Filter Tabs -->
    <div class="mb-6 flex w-fit gap-1 rounded-xl bg-muted/50 p-1">
      <Button
        v-for="tab in filterTabs"
        :key="tab.value"
        :variant="filter === tab.value ? 'default' : 'ghost'"
        size="sm"
        class="rounded-lg px-4 transition-all"
        :class="filter === tab.value ? 'shadow-sm' : 'text-muted-foreground'"
        @click="filter = tab.value"
      >
        {{ tab.label }}
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 4"
        :key="i"
        class="h-20 animate-pulse rounded-2xl bg-muted/50"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredBills.length === 0"
      class="flex flex-col items-center gap-4 py-16 text-center"
    >
      <div class="flex size-16 items-center justify-center rounded-full bg-muted/50">
        <Icon name="hugeicons:calendar-03" :size="32" class="text-muted-foreground/30" />
      </div>
      <p class="text-sm font-bold text-muted-foreground">
        {{ $t('bills.no_bills') }}
      </p>
    </div>

    <!-- Bill List -->
    <div v-else class="space-y-3">
      <div
        v-for="bill in filteredBills"
        :key="bill.id"
        class="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-sm sm:flex-row sm:items-center"
      >
        <!-- Icon -->
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl"
          :class="getIconClass(bill)"
        >
          <Icon name="hugeicons:calendar-03" :size="20" />
        </div>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold text-foreground">{{ bill.title }}</p>
          <p class="text-xs font-bold" :class="getDueDateClass(bill)">
            {{ getDueDateText(bill) }}
          </p>
        </div>

        <!-- Amount -->
        <p class="shrink-0 text-sm font-black text-foreground">
          {{ formatCurrency(bill.amount) }}
        </p>

        <!-- Status Badge -->
        <span
          v-if="bill.is_paid"
          class="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
        >
          {{ $t('bills.paid') }}
        </span>
        <span
          v-else
          class="shrink-0 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400"
        >
          {{ $t('bills.unpaid') }}
        </span>

        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-2">
          <Button
            v-if="!bill.is_paid"
            variant="outline"
            size="sm"
            @click="handleMarkPaid(bill.id)"
          >
            {{ $t('bills.mark_paid') }}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="size-8 text-muted-foreground hover:text-rose-500"
            @click="handleDelete(bill.id)"
          >
            <Icon name="hugeicons:delete-01" :size="16" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const { bills, fetchBills, addBill, markAsPaid, deleteBill, loading } = useBills();
const { formatCurrency } = useCurrency();
const { t } = useI18n();

const filter = ref<'all' | 'unpaid' | 'paid'>('unpaid');
const dialogOpen = ref(false);

const form = reactive({
  title: '',
  amount: 0,
  due_date: '',
  recurrence: 'none' as 'none' | 'monthly',
});

const filterTabs = computed(() => [
  { value: 'all' as const, label: t('bills.all') },
  { value: 'unpaid' as const, label: t('bills.unpaid') },
  { value: 'paid' as const, label: t('bills.paid') },
]);

const filteredBills = computed(() => {
  if (filter.value === 'all') {
    return bills.value;
  }
  if (filter.value === 'unpaid') {
    return bills.value.filter((b) => !b.is_paid);
  }
  return bills.value.filter((b) => b.is_paid);
});

const isFormValid = computed(() => {
  return form.title.trim() && form.amount > 0 && form.due_date;
});

function getDaysUntilDue(dueDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDueDateText(bill: { due_date: string; is_paid: boolean }): string {
  if (bill.is_paid) {
    return t('bills.paid');
  }
  const days = getDaysUntilDue(bill.due_date);
  if (days === 0) {
    return t('bills.due_today');
  }
  if (days < 0) {
    return t('bills.overdue');
  }
  return t('bills.due_in_days', { days });
}

function getDueDateClass(bill: { due_date: string; is_paid: boolean }): string {
  if (bill.is_paid) {
    return 'text-emerald-600 dark:text-emerald-400';
  }
  const days = getDaysUntilDue(bill.due_date);
  if (days === 0) {
    return 'text-amber-500 dark:text-amber-400';
  }
  if (days < 0) {
    return 'text-rose-500 dark:text-rose-400';
  }
  return 'text-muted-foreground';
}

function getIconClass(bill: { due_date: string; is_paid: boolean }): string {
  if (bill.is_paid) {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  }
  const days = getDaysUntilDue(bill.due_date);
  if (days <= 0) {
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
  }
  return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
}

async function handleAddBill() {
  if (!isFormValid.value) {
    return;
  }
  const { error } = await addBill({
    title: form.title.trim(),
    amount: form.amount,
    due_date: form.due_date,
    recurrence: form.recurrence,
  });
  if (!error) {
    dialogOpen.value = false;
    form.title = '';
    form.amount = 0;
    form.due_date = '';
    form.recurrence = 'none';
  }
}

async function handleMarkPaid(id: string) {
  await markAsPaid(id);
}

async function handleDelete(id: string) {
  await deleteBill(id);
}

onMounted(() => {
  fetchBills();
});
</script>
