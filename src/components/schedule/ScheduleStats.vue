<template>
  <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
    <div class="rounded-2xl border border-border/50 bg-card p-4">
      <p class="text-[10px] font-black uppercase tracking-widest text-amber-500/70">
        {{ $t('schedule.unpaid') }}
      </p>
      <p class="mt-1 text-2xl font-black tracking-tighter text-amber-500">
        {{ unpaidCount }}
      </p>
      <p class="text-[10px] font-medium text-muted-foreground/60">
        {{ $t('schedule.bills_due') }}
      </p>
    </div>
    <div class="rounded-2xl border border-border/50 bg-card p-4">
      <p class="text-[10px] font-black uppercase tracking-widest text-green-500/70">
        {{ $t('schedule.paid') }}
      </p>
      <p class="mt-1 text-2xl font-black tracking-tighter text-green-500">
        {{ paidCount }}
      </p>
      <p class="text-[10px] font-medium text-muted-foreground/60">
        {{ $t('schedule.total_bills', { count: totalBills }) }}
      </p>
    </div>
    <div class="rounded-2xl border border-border/50 bg-card p-4">
      <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">
        {{ $t('schedule.income') }}
      </p>
      <p class="mt-1 text-2xl font-black tracking-tighter text-emerald-600">
        {{ formatCurrency(incomeTotal) }}
      </p>
      <p class="text-[10px] font-medium text-muted-foreground/60">
        {{ $t('schedule.total_recurring_income') }}
      </p>
    </div>
    <div class="rounded-2xl border border-border/50 bg-card p-4">
      <p class="text-[10px] font-black uppercase tracking-widest text-rose-500/70">
        {{ $t('schedule.expense') }}
      </p>
      <p class="mt-1 text-2xl font-black tracking-tighter text-rose-500">
        {{ formatCurrency(expenseTotal) }}
      </p>
      <p class="text-[10px] font-medium text-muted-foreground/60">
        {{ $t('schedule.total_recurring_expense') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  unpaidCount: number
  paidCount: number
  totalBills: number
  incomeTotal: number
  expenseTotal: number
}>()

const { formatCurrency } = useCurrency()
</script>
