<template>
  <div class="mx-auto w-full max-w-3xl space-y-8">
    <!-- HEADER -->
    <div>
      <h1 class="text-3xl font-bold">
        {{ isEdit ? $t('transaction_form.title_edit') : $t('transaction_form.title_new') }}
      </h1>
      <p class="mt-1.5 text-sm text-muted-foreground">
        {{ isEdit ? $t('transaction_form.subtitle_edit') : $t('transaction_form.subtitle') }}
      </p>
    </div>

    <!-- TYPE SELECTOR -->
    <div class="grid grid-cols-2 gap-3">
      <Button
        :variant="form.type === 'income' ? 'default' : 'outline'"
        class="rounded-2xl px-5 py-4 text-center"
        @click="form.type = 'income'"
      >
        <Icon name="hugeicons:arrow-down-01" :size="20" class="mr-2 inline-block" />
        {{ $t('transaction_form.income') }}
      </Button>
      <Button
        :variant="form.type === 'expense' ? 'default' : 'outline'"
        class="rounded-2xl px-5 py-4 text-center"
        @click="form.type = 'expense'"
      >
        <Icon name="hugeicons:arrow-up-01" :size="20" class="mr-2 inline-block" />
        {{ $t('transaction_form.expense') }}
      </Button>
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
        >
      </div>
    </div>

    <!-- DETAIL FORM -->
    <div class="space-y-px overflow-hidden rounded-3xl border border-border/50 bg-card/20">
      <div class="flex items-center gap-3 px-5 py-4">
        <Icon name="hugeicons:wallet-01" :size="18" class="text-muted-foreground" />
        <div class="flex-1">
          <CategoryPicker
            v-model="form.category_id"
            :type="form.type"
            :placeholder="$t('transaction_form.select_category')"
          />
        </div>
      </div>

      <div class="flex items-center gap-3 px-5 py-4">
        <Icon name="hugeicons:coins-swap" :size="18" class="text-muted-foreground" />
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
                    <span class="text-muted-foreground"> - {{ c.label.split(' - ')[1] }}</span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex items-center gap-3 px-5 py-4">
        <Icon name="hugeicons:calendar-01" :size="18" class="text-muted-foreground" />
        <div class="">
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="
                  cn(
                    'w-full justify-between border-none px-4 font-medium shadow-none hover:bg-transparent',
                    !form.date && 'text-muted-foreground',
                  )
                "
              >
                {{
                  form.date
                    ? df.format(calendarDate!.toDate(getLocalTimeZone()))
                    : $t('transaction_form.select_date')
                }}
                <Icon
                  name="hugeicons:arrow-down-01"
                  :size="16"
                  class="text-muted-foreground ml-auto opacity-50"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="calendarDate" initial-focus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div class="flex items-start gap-3 px-5 py-4">
        <Icon name="hugeicons:note-01" :size="18" class="mt-0.5 text-muted-foreground" />
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

    <!-- ACTION BUTTONS -->
    <div class="flex items-center justify-end gap-3">
      <Button
        variant="outline"
        @click="$emit('cancel')"
      >
        {{ $t('transaction_form.cancel') }}
      </Button>
      <button
        class="rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-pink-500/25 transition hover:from-pink-400 hover:to-pink-500"
        :disabled="!form.amount || !form.date"
        @click="onSubmit"
      >
        {{ $t('transaction_form.save') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date';
import type { Transaction } from '~/composables/useTransactions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const { t, locale } = useI18n();

const props = defineProps<{
  transaction?: Transaction;
}>();

const emit = defineEmits<{
  cancel: [];
  saved: [];
  dirty: [value: boolean];
}>();

const { currencyGroups, formatNumberOnly, parseLocalizedNumber, defaultCurrency } = useCurrency();

const { addTransaction, updateTransaction } = useTransactions();

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
  description: props.transaction?.description ?? '',
  date: props.transaction?.date ?? todayDate,
});

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
  if (e.key === ',' || e.key === '.') {
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
