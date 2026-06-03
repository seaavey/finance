<template>
  <div class="mx-auto w-full max-w-2xl space-y-8">
    <!-- HEADER -->
    <div class="text-center md:text-left">
      <h1 class="text-4xl font-black tracking-tighter text-foreground">
        {{ isEdit ? $t('transaction_form.title_edit') : $t('transaction_form.title_new')}}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">
        {{ isEdit ? $t('transaction_form.subtitle_edit') : $t('transaction_form.subtitle')}}
      </p>
    </div>

    <!-- TYPE SELECTOR -->
    <div class="grid grid-cols-2 gap-4">
      <Button
        variant="ghost"
        class="group relative h-auto flex-col items-center gap-3 py-6 rounded-3xl transition-all duration-300 border border-transparent overflow-hidden"
        :class="form.type === 'income' 
          ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 border-emerald-500' 
          : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground border-border/50'"
        @click="form.type = 'income'"
      >
        <div class="flex size-12 items-center justify-center rounded-2xl transition-colors"
          :class="form.type === 'income' ? 'bg-white/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'"
        >
          <AppIcon name="hugeicons:arrow-down-01" :size="28" />
        </div>
        <span class="text-xs font-black uppercase tracking-widest">{{ $t('transaction_form.income')}}</span>
      </Button>
      
      <Button
        variant="ghost"
        class="group relative h-auto flex-col items-center gap-3 py-6 rounded-3xl transition-all duration-300 border border-transparent overflow-hidden"
        :class="form.type === 'expense' 
          ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20 border-rose-500' 
          : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground border-border/50'"
        @click="form.type = 'expense'"
      >
        <div class="flex size-12 items-center justify-center rounded-2xl transition-colors"
          :class="form.type === 'expense' ? 'bg-white/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
        >
          <AppIcon name="hugeicons:arrow-up-01" :size="28" />
        </div>
        <span class="text-xs font-black uppercase tracking-widest">{{ $t('transaction_form.expense')}}</span>
      </Button>
    </div>

    <!-- SCAN RECEIPT BUTTON -->
    <div class="flex justify-center">
      <Button
        variant="outline"
        class="group relative h-12 w-full rounded-2xl border-dashed border-border/50 bg-transparent font-black uppercase tracking-widest text-xs transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
        :disabled="uploading || scanning"
        @click="fileInputRef?.click()"
      >
        <div class="flex items-center gap-3">
          <div class="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary/20">
            <AppIcon
              :name="scanning ? 'hugeicons:loading-03' : 'hugeicons:camera-01'"
              :size="16"
              :class="scanning ? 'animate-spin' : ''"
            />
          </div>
          <span>{{ scanning ? $t('transaction_form.scanning') : $t('transaction_form.scan_receipt') }}</span>
        </div>
      </Button>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFileSelected"
      />
    </div>

    <!-- AMOUNT CARD -->
    <div class="relative overflow-hidden rounded-4xl border border-border/50 bg-card/20 p-8 backdrop-blur-md shadow-2xl transition-all hover:border-border/80">
      <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{{ $t('transaction_form.amount')}}</Label>
      <div class="mt-4 flex items-center gap-4">
        <div class="flex h-14 items-center justify-center rounded-2xl bg-muted/50 px-5 text-xl font-black text-foreground shadow-inner">
          {{ form.currency }}
        </div>
        <input
          v-model="amountDisplay"
          type="text"
          inputmode="numeric"
          :placeholder="$t('transaction_form.amount_placeholder')"
          class="w-full border-none bg-transparent text-5xl font-black tracking-tighter text-foreground outline-none placeholder:text-muted-foreground/20 md:text-6xl"
          @keydown="onNumberKeydown"
        />
      </div>
      <p
        v-if="hasDecimals(form.currency)"
        class="mt-2 text-[10px] font-medium text-muted-foreground/60 text-center"
      >
        {{ $t('transaction_form.cents_hint', { value: '50000', formatted: formatNumberOnly(500, form.currency) }) }}
      </p>
    </div>

    <!-- DETAIL FORM GRID -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Category & Account (Left Side) -->
      <div class="space-y-4">
        <div class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-5 shadow-sm transition-all hover:bg-card/30">
          <Label class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
            <AppIcon name="hugeicons:grid-view" :size="12" />
            {{ $t('transaction_form.category') }}
          </Label>
          <CategoryPicker
            v-model="form.category_id"
            :type="form.type"
            :placeholder="$t('transaction_form.select_category')"
            class="w-full"
          />
        </div>

        <div class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-5 shadow-sm transition-all hover:bg-card/30">
          <Label class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
            <AppIcon name="hugeicons:wallet-01" :size="12" />
            {{ $t('transaction_form.select_account') }}
          </Label>
          <Select v-model="form.account_id">
            <SelectTrigger class="h-11 rounded-2xl border-border/50 bg-background/50 transition-all hover:bg-background/80">
              <SelectValue :placeholder="$t('transaction_form.select_account')" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl p-2">
              <SelectItem
                v-for="acct in accounts"
                :key="acct.id"
                :value="acct.id"
                class="rounded-xl px-3 py-2.5"
              >
                <div class="flex items-center gap-2">
                  <div class="size-2 rounded-full" :style="{ backgroundColor: acct.color }" />
                  <span class="font-bold">{{ acct.name }}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Currency & Date (Right Side) -->
      <div class="space-y-4">
        <div class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-5 shadow-sm transition-all hover:bg-card/30">
          <Label class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
            <AppIcon name="hugeicons:coins-swap" :size="12" />
            {{ $t('transaction_form.currency') }}
          </Label>
          <Select v-model="form.currency">
            <SelectTrigger class="h-11 rounded-2xl border-border/50 bg-background/50 transition-all hover:bg-background/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="max-h-[300px] rounded-2xl p-2">
              <SelectGroup v-for="group in currencyGroups" :key="group.label">
                <SelectLabel class="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                  {{ group.label }}
                </SelectLabel>
                <SelectItem
                  v-for="c in group.currencies"
                  :key="c.value"
                  :value="c.value"
                  class="rounded-xl px-3 py-2.5"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-black text-foreground">{{ c.value }}</span>
                    <span class="text-xs text-muted-foreground opacity-60"> - {{ c.label.split(' - ')[1] }}</span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-5 shadow-sm transition-all hover:bg-card/30">
          <Label class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
            <AppIcon name="hugeicons:calendar-01" :size="12" />
            {{ $t('transaction_form.select_date') }}
          </Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                class="h-11 w-full justify-between rounded-2xl border-border/50 bg-background/50 px-4 font-bold transition-all hover:bg-background/80"
                :class="!form.date && 'text-muted-foreground'"
              >
                {{
                  form.date
                    ? df.format(calendarDate!.toDate(getLocalTimeZone()))
                    : $t('transaction_form.select_date')
                }}
                <AppIcon name="hugeicons:arrow-down-01" :size="16" class="ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0 rounded-3xl border-border/50 shadow-2xl backdrop-blur-xl">
              <Calendar v-model="calendarDate" initial-focus class="rounded-3xl" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <!-- Notes (Full Width) -->
      <div class="col-span-1 space-y-2 rounded-3xl border border-border/50 bg-card/20 p-5 shadow-sm transition-all hover:bg-card/30 md:col-span-2">
        <Label class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
          <AppIcon name="hugeicons:note-01" :size="12" />
          {{ $t('transaction_form.note_optional') }}
        </Label>
        <Textarea
          v-model="form.description"
          :placeholder="$t('transaction_form.note_optional')"
          rows="2"
          class="min-h-[80px] rounded-2xl border-border/50 bg-background/50 p-4 font-medium transition-all hover:bg-background/80 focus-visible:ring-primary/20"
        />
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="flex items-center justify-end gap-4 pt-4">
      <Button 
        variant="ghost" 
        class="h-12 rounded-2xl px-8 font-black uppercase tracking-widest transition-all hover:bg-secondary/50"
        @click="$emit('cancel')"
      >
        {{ $t('transaction_form.cancel')}}
      </Button>
      <Button
        class="h-12 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-10 font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:from-primary/80 hover:to-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        :disabled="submitting || !form.amount || !form.date"
        @click="onSubmit"
      >
        {{ submitting ? $t('transaction_form.saving') : $t('transaction_form.save') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date';
import type { Transaction } from '@/composables/useTransactions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReceipts } from '@/composables/useReceipts';

const { locale } = useI18n();

const props = defineProps<{
  transaction?: Transaction;
}>();

const emit = defineEmits<{
  cancel: [];
  saved: [];
  dirty: [value: boolean];
}>();

const { currencyGroups, formatNumberOnly, parseLocalizedNumber, defaultCurrency, hasDecimals } = useCurrency();

const { addTransaction, updateTransaction } = useTransactions();
const { accounts, fetchAccounts } = useAccounts();

onMounted(() => {
  fetchAccounts();
});

const isEdit = computed(() => !!props.transaction);

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', {
  dateStyle: 'long',
});

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

const todayDate = today(getLocalTimeZone()).toString();

const form = reactive({
  type: props.transaction?.type ?? ('expense' as 'income' | 'expense'),
  amount: props.transaction?.amount ?? 0,
  currency: props.transaction?.currency ?? defaultCurrency.value,
  category_id: props.transaction?.category_id ?? '',
  account_id: props.transaction?.account_id ?? '',
  description: props.transaction?.description ?? '',
  date: props.transaction?.date ?? todayDate,
});

const submitting = ref(false);

const fileInputRef = ref<HTMLInputElement | null>(null)

const { uploading, scanning, scanReceiptFromFile } = useReceipts()

const { categories } = useCategories()

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const receiptData = await scanReceiptFromFile(file)

  // Reset file input so the same file can be selected again
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  if (!receiptData) return

  // --- AUTO-FILL FORM ---
  form.type = receiptData.type

  form.amount = receiptData.amount
  form.currency = receiptData.currency

  // Match category name from AI to local category_id
  if (receiptData.category) {
    const match = categories.value.find(
      (c: { name: string; type: string }) => c.name.toLowerCase() === receiptData.category!.toLowerCase() && c.type === form.type,
    )
    if (match) {
      form.category_id = match.id
    }
  }

  if (receiptData.description) {
    form.description = receiptData.description
  }

  if (receiptData.date) {
    form.date = receiptData.date
  }

  // merchant is appended to description if it exists and description doesn't already include it
  if (receiptData.merchant && receiptData.description && !receiptData.description.includes(receiptData.merchant)) {
    form.description = `${receiptData.merchant} — ${receiptData.description}`
  }
}

const calendarDate = computed({
  get: () => (form.date ? parseDate(form.date) : undefined),
  set: (val) => {
    if (val) {
      form.date = val.toString();
    }
  },
});

watch(
  () => ({ ...form }),
  (newForm) => {
    if (!props.transaction) {
      return;
    }
    const initial = {
      type: props.transaction.type,
      amount: props.transaction.amount,
      currency: props.transaction.currency,
      category_id: props.transaction.category_id,
      description: props.transaction.description,
      date: props.transaction.date,
    };
    const changed =
      newForm.type !== initial.type ||
      Number(newForm.amount) !== Number(initial.amount) ||
      newForm.currency !== initial.currency ||
      newForm.category_id !== (initial.category_id ?? '') ||
      newForm.account_id !== ((initial as Record<string, unknown>).account_id ?? '') ||
      newForm.description !== (initial.description ?? '') ||
      newForm.date !== initial.date;
    emit('dirty', changed);
  },
  { deep: true, immediate: true },
);

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
  // Prevent decimal separators to reinforce digits-only entry
  if (e.key === ',' || e.key === '.') {
    e.preventDefault();
    return;
  }
  e.preventDefault();
};

const onSubmit = async () => {
  if (submitting.value) {
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      type: form.type,
      amount: Number(form.amount),
      currency: form.currency,
      category_id: form.category_id || null,
      account_id: form.account_id || null,
      description: form.description || null,
      date: form.date!,
    };

    const result = props.transaction
      ? await updateTransaction(props.transaction.id, payload)
      : await addTransaction(payload);

    if (!result.error) {
      emit('saved');
    }
  } finally {
    submitting.value = false;
  }
};
</script>
