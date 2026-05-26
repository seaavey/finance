<template>
  <div class="mx-auto w-full max-w-3xl space-y-8">
    <!-- HEADER -->
    <div>
      <h1 class="text-3xl font-bold">Tambah Transaksi</h1>
      <p class="mt-1.5 text-sm text-muted-foreground">Catat pemasukan atau pengeluaran baru</p>
    </div>

    <!-- TYPE SELECTOR -->
    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        class="rounded-2xl border px-5 py-4 text-center text-sm font-semibold transition-all duration-300"
        :class="form.type === 'income'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_-4px] shadow-emerald-500/20'
          : 'border-border/50 bg-card/30 text-muted-foreground hover:border-border hover:bg-card/60'"
        @click="form.type = 'income'"
      >
        <HugeiconsIcon :icon="ArrowDown01Icon" :size="20" class="mr-2 inline-block" />
        Pemasukan
      </button>
      <button
        type="button"
        class="rounded-2xl border px-5 py-4 text-center text-sm font-semibold transition-all duration-300"
        :class="form.type === 'expense'
          ? 'border-red-500/30 bg-red-500/10 text-red-500 shadow-[0_0_20px_-4px] shadow-red-500/20'
          : 'border-border/50 bg-card/30 text-muted-foreground hover:border-border hover:bg-card/60'"
        @click="form.type = 'expense'"
      >
        <HugeiconsIcon :icon="ArrowUp01Icon" :size="20" class="mr-2 inline-block" />
        Pengeluaran
      </button>
    </div>

    <!-- AMOUNT CARD -->
    <div class="rounded-3xl border border-border/50 bg-card/40 p-8">
      <p class="text-sm font-medium text-muted-foreground">Nominal</p>
      <div class="mt-4 flex items-start gap-2">
        <span class="mt-2 text-2xl font-semibold text-muted-foreground/60">{{ form.currency }}</span>
        <input
          v-model.number="form.amount"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          class="w-full border-none bg-transparent text-5xl font-bold outline-none placeholder:text-muted-foreground/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          @keydown="onNumberKeydown"
        />
      </div>
    </div>

    <!-- DETAIL FORM -->
    <div class="space-y-px overflow-hidden rounded-3xl border border-border/50 bg-card/20">
      <div class="flex items-center gap-3 px-5 py-4">
        <HugeiconsIcon :icon="Wallet01Icon" :size="18" class="text-muted-foreground" />
        <div class="flex-1">
          <CategoryPicker v-model="form.category_id" :type="form.type" placeholder="Pilih kategori" />
        </div>
      </div>

      <div class="flex items-center gap-3 px-5 py-4">
        <HugeiconsIcon :icon="CoinsSwapIcon" :size="18" class="text-muted-foreground" />
        <div class="flex-1">
          <Select v-model="form.currency">
            <SelectTrigger class="border-none shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="bg-[#111114] border border-white/10 shadow-2xl shadow-black/40 rounded-2xl p-2">
              <SelectGroup v-for="group in currencyGroups" :key="group.label">
                <SelectLabel class="sticky top-0 bg-[#111114] z-10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">{{ group.label }}</SelectLabel>
                <SelectItem
                  v-for="c in group.currencies"
                  :key="c.value"
                  :value="c.value"
                  class="rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 cursor-pointer"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ c.value }}</span>
                    <span class="text-zinc-500">{{ c.label.split(' - ')[1] }}</span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex items-center gap-3 px-5 py-4">
        <HugeiconsIcon :icon="Calendar01Icon" :size="18" class="text-muted-foreground" />
        <div class="flex-1">
          <Input v-model="form.date" type="date" class="border-none shadow-none" />
        </div>
      </div>

      <div class="flex items-start gap-3 px-5 py-4">
        <HugeiconsIcon :icon="Note01Icon" :size="18" class="mt-0.5 text-muted-foreground" />
        <div class="flex-1">
          <Textarea
            v-model="form.description"
            placeholder="Catatan (opsional)"
            rows="2"
            class="resize-none border-none shadow-none"
          />
        </div>
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="flex items-center justify-end gap-3">
      <button
        v-if="transaction"
        class="rounded-2xl border border-red-500/10 bg-red-500/3 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/8"
        @click="$emit('delete')"
      >
        Hapus
      </button>
      <button
        class="rounded-2xl border border-border/50 px-5 py-3 text-sm text-muted-foreground transition hover:bg-card/50"
        @click="$emit('cancel')"
      >
        Batal
      </button>
      <button
        class="rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-pink-500/25 transition hover:from-pink-400 hover:to-pink-500"
        :disabled="!form.amount || !form.date"
        @click="onSubmit"
      >
        Simpan Transaksi
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Wallet01Icon,
  CoinsSwapIcon,
  Calendar01Icon,
  Note01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import type { Transaction } from '~/composables/useTransactions';

const props = defineProps<{
  transaction?: Transaction;
}>();

const emit = defineEmits<{
  cancel: [];
  saved: [];
  delete: [];
}>();

const { currencies, currencyGroups } = useCurrency();

const selectedCurrency = computed(() => currencies.find((c) => c.value === form.currency));
const { addTransaction, updateTransaction } = useTransactions();

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  type: props.transaction?.type ?? ('expense' as 'income' | 'expense'),
  amount: props.transaction?.amount ?? 0,
  currency: props.transaction?.currency ?? 'IDR',
  category_id: props.transaction?.category_id ?? '',
  description: props.transaction?.description ?? '',
  date: props.transaction?.date ?? today,
});

const onNumberKeydown = (e: KeyboardEvent) => {
  const allowed = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ];
  if (allowed.includes(e.key)) {
    return;
  }
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
    return;
  }
  if (/^[0-9]$/.test(e.key)) {
    return;
  }
  e.preventDefault();
};

const onSubmit = async () => {
  const payload = {
    type: form.type,
    amount: Number(form.amount),
    currency: form.currency,
    category_id: form.category_id || null,
    description: form.description || null,
    date: form.date!,
  };

  if (props.transaction) {
    await updateTransaction(props.transaction.id, payload);
  } else {
    await addTransaction(payload);
  }
  emit('saved');
};
</script>
