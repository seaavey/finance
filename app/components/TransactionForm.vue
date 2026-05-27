<template>
  <div class="mx-auto w-full max-w-3xl space-y-8">
    <!-- HEADER -->
    <div>
      <h1 class="text-3xl font-bold">{{ $t('transaction_form.title_new') }}</h1>
      <p class="mt-1.5 text-sm text-muted-foreground">{{ $t('transaction_form.subtitle') }}</p>
    </div>

    <!-- TYPE SELECTOR -->
    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        class="rounded-2xl border px-5 py-4 text-center text-sm font-semibold transition-all duration-300"
        :class="
          form.type === 'income'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_-4px] shadow-emerald-500/20'
            : 'border-border/50 bg-card/30 text-muted-foreground hover:border-border hover:bg-card/60'
        "
        @click="form.type = 'income'"
      >
        <HugeiconsIcon :icon="ArrowDown01Icon" :size="20" class="mr-2 inline-block" />
        {{ $t('transaction_form.income') }}
      </button>
      <button
        type="button"
        class="rounded-2xl border px-5 py-4 text-center text-sm font-semibold transition-all duration-300"
        :class="
          form.type === 'expense'
            ? 'border-red-500/30 bg-red-500/10 text-red-500 shadow-[0_0_20px_-4px] shadow-red-500/20'
            : 'border-border/50 bg-card/30 text-muted-foreground hover:border-border hover:bg-card/60'
        "
        @click="form.type = 'expense'"
      >
        <HugeiconsIcon :icon="ArrowUp01Icon" :size="20" class="mr-2 inline-block" />
        {{ $t('transaction_form.expense') }}
      </button>
    </div>

    <!-- AMOUNT CARD -->
    <div class="rounded-3xl border border-border/50 bg-card/40 p-8">
      <p class="text-sm font-medium text-muted-foreground">{{ $t('transaction_form.amount') }}</p>
      <div class="mt-4 flex items-start gap-2">
        <span class="mt-2 text-2xl font-semibold text-muted-foreground/60">{{
          form.currency
        }}</span>
        <input
          v-model="amountDisplay"
          type="text"
          inputmode="numeric"
          :placeholder="$t('transaction_form.amount_placeholder')"
          class="w-full border-none bg-transparent text-5xl font-bold outline-none placeholder:text-muted-foreground/20"
          @keydown="onNumberKeydown"
        />
      </div>
    </div>

    <!-- DETAIL FORM -->
    <div class="space-y-px overflow-hidden rounded-3xl border border-border/50 bg-card/20">
      <div class="flex items-center gap-3 px-5 py-4">
        <HugeiconsIcon :icon="Wallet01Icon" :size="18" class="text-muted-foreground" />
        <div class="flex-1">
          <CategoryPicker
            v-model="form.category_id"
            :type="form.type"
            :placeholder="$t('transaction_form.select_category')"
          />
        </div>
      </div>

      <div class="flex items-center gap-3 px-5 py-4">
        <HugeiconsIcon :icon="CoinsSwapIcon" :size="18" class="text-muted-foreground" />
        <div class="flex-1">
          <Select v-model="form.currency">
            <SelectTrigger class="border-none shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              class="bg-popover border border-border shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-2xl p-2"
            >
              <SelectGroup v-for="group in currencyGroups" :key="group.label">
                <SelectLabel
                  class="sticky top-0 bg-popover z-10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >{{ group.label }}</SelectLabel
                >
                <SelectItem
                  v-for="c in group.currencies"
                  :key="c.value"
                  :value="c.value"
                  class="rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-accent cursor-pointer"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ c.value }}</span>
                    <span class="text-muted-foreground">{{ c.label.split(' - ')[1] }}</span>
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
            :placeholder="$t('transaction_form.note_optional')"
            rows="2"
            class="resize-none border-none shadow-none"
          />
        </div>
      </div>
    </div>

    <!-- RECEIPT SCAN -->
    <div
      v-if="!transaction"
      class="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border/50 bg-card/20 px-5 py-4 transition hover:border-pink-500/30 hover:bg-card/40"
      @click="showScanner = true"
    >
      <div class="flex size-10 items-center justify-center rounded-xl bg-pink-500/10">
        <HugeiconsIcon :icon="Camera01Icon" :size="18" class="text-pink-400" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium text-foreground">Scan Struk</p>
        <p class="text-xs text-muted-foreground">Foto struk untuk isi otomatis</p>
      </div>
      <p v-if="receiptFile" class="text-xs text-emerald-400">Photo selected</p>
    </div>

    <img
      v-if="receiptPreview && !transaction"
      :src="receiptPreview"
      alt="Receipt preview"
      class="max-h-32 w-full rounded-2xl object-cover border border-border/50"
    />

    <!-- ACTION BUTTONS -->
    <div class="flex items-center justify-end gap-3">
      <button
        v-if="transaction"
        class="rounded-2xl border border-red-500/10 bg-red-500/3 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/8"
        @click="$emit('delete')"
      >
        {{ $t('transaction_form.delete') }}
      </button>
      <button
        class="rounded-2xl border border-border/50 px-5 py-3 text-sm text-muted-foreground transition hover:bg-card/50"
        @click="$emit('cancel')"
      >
        {{ $t('transaction_form.cancel') }}
      </button>
      <button
        class="rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-pink-500/25 transition hover:from-pink-400 hover:to-pink-500"
        :disabled="!form.amount || !form.date"
        @click="onSubmit"
      >
        {{ $t('transaction_form.save') }}
      </button>
    </div>
    <ReceiptScanner v-model:open="showScanner" @scanned="onScanned" />
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
  Camera01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import type { Transaction } from '~/composables/useTransactions';

const { t } = useI18n();

const props = defineProps<{
  transaction?: Transaction;
}>();

const emit = defineEmits<{
  cancel: [];
  saved: [];
  delete: [];
}>();

const { currencyGroups, formatNumberOnly, parseLocalizedNumber, defaultCurrency } = useCurrency();

const { addTransaction, updateTransaction, uploadReceipt } = useTransactions();

const amountDisplay = computed({
  get: () => {
    if (!form.amount) {
      return '';
    }
    return formatNumberOnly(form.amount, form.currency);
  },
  set: (val: string) => {
    form.amount = parseLocalizedNumber(val, form.currency);
  },
});

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  type: props.transaction?.type ?? ('expense' as 'income' | 'expense'),
  amount: props.transaction?.amount ?? 0,
  currency: props.transaction?.currency ?? defaultCurrency.value,
  category_id: props.transaction?.category_id ?? '',
  description: props.transaction?.description ?? '',
  date: props.transaction?.date ?? today,
});

const showScanner = ref(false);
const receiptFile = ref<File | null>(null);
const receiptPreview = ref<string | null>(null);
const receiptUrl = ref<string | null>(null);

const onScanned = async (data: {
  receiptFile: File;
  total: number | null;
  date: string | null;
  description: string;
}) => {
  receiptFile.value = data.receiptFile;
  receiptPreview.value = URL.createObjectURL(data.receiptFile);

  if (data.total && data.total > 0) {
    form.amount = data.total;
  }
  if (data.date) {
    form.date = data.date;
  }
  if (data.description) {
    form.description = data.description;
  }
};

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
  if (e.key === ',' || e.key === '.') {
    return;
  }
  e.preventDefault();
};

const onSubmit = async () => {
  if (receiptFile.value && !receiptUrl.value) {
    receiptUrl.value = await uploadReceipt(receiptFile.value);
  }

  const payload = {
    type: form.type,
    amount: Number(form.amount),
    currency: form.currency,
    category_id: form.category_id || null,
    description: form.description || null,
    date: form.date!,
    receipt_image: receiptUrl.value || null,
  };

  if (props.transaction) {
    await updateTransaction(props.transaction.id, payload);
  } else {
    await addTransaction(payload);
  }
  emit('saved');
};
</script>
