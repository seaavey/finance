<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{
          item ? $t('recurring_form.title_edit') : $t('recurring_form.title_new')
        }}</DialogTitle>
        <DialogDescription>
          {{ $t('recurring.empty_desc') }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label>{{ $t('recurring_form.type') }}</Label>
          <div class="flex gap-2">
            <Button
              type="button"
              :variant="form.type === 'income' ? 'default' : 'outline'"
              class="flex-1"
              @click="form.type = 'income'"
            >
              {{ $t('recurring_form.income') }}
            </Button>
            <Button
              type="button"
              :variant="form.type === 'expense' ? 'default' : 'outline'"
              class="flex-1"
              @click="form.type = 'expense'"
            >
              {{ $t('recurring_form.expense') }}
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="r-amount">{{ $t('recurring_form.amount') }}</Label>
          <Input
            id="r-amount"
            v-model="amountDisplay"
            type="text"
            inputmode="numeric"
            :placeholder="$t('transaction_form.amount_placeholder')"
            required
            @keydown="onNumberKeydown"
          />
        </div>

        <div class="space-y-2">
          <Label>{{ $t('recurring_form.currency') }}</Label>
          <Select v-model="form.currency">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in currencies" :key="c.value" :value="c.value">{{
                c.label
              }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>{{ $t('recurring_form.category') }}</Label>
          <CategoryPicker
            v-model="form.category_id"
            :type="form.type"
            :placeholder="$t('recurring_form.select_category')"
          />
        </div>

        <div class="space-y-2">
          <Label for="r-desc">{{ $t('recurring_form.description') }}</Label>
          <Input
            id="r-desc"
            v-model="form.description"
            :placeholder="$t('recurring_form.note_optional')"
          />
        </div>

        <div class="space-y-2">
          <Label>{{ $t('recurring_form.frequency') }}</Label>
          <Select v-model="form.frequency">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">{{ $t('recurring_form.daily') }}</SelectItem>
              <SelectItem value="weekly">{{ $t('recurring_form.weekly') }}</SelectItem>
              <SelectItem value="monthly">{{ $t('recurring_form.monthly') }}</SelectItem>
              <SelectItem value="yearly">{{ $t('recurring_form.yearly') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="r-next">{{ $t('recurring_form.next_date') }}</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="
                  cn(
                    'w-full justify-between text-left font-medium',
                    !form.next_date && 'text-muted-foreground',
                  )
                "
              >
                <div class="flex items-center">
                  <Icon name="hugeicons:calendar-01" :size="16" class="mr-2" />
                  {{
                    form.next_date
                      ? df.format(calendarDate!.toDate(getLocalTimeZone()))
                      : $t('recurring_form.select_date')
                  }}
                </div>
                <Icon
                  name="hugeicons:arrow-down-01"
                  :size="16"
                  class="text-muted-foreground opacity-50"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="calendarDate" initial-focus />
            </PopoverContent>
          </Popover>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="$emit('close')">{{
            $t('recurring_form.cancel')
          }}</Button>
          <Button type="submit" :disabled="!form.amount || !form.next_date">{{
            $t('recurring_form.save')
          }}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date';
import type { RecurringTransaction } from '~/composables/useRecurring';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const props = defineProps<{
  item?: RecurringTransaction;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const { locale } = useI18n();
const { currencies, defaultCurrency, formatNumberOnly, parseLocalizedNumber } = useCurrency();
const { addRecurring, updateRecurring } = useRecurring();

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', {
  dateStyle: 'long',
});

const todayDate = today(getLocalTimeZone()).toString();

const form = reactive({
  type: props.item?.type ?? ('expense' as 'income' | 'expense'),
  amount: props.item?.amount ?? 0,
  currency: props.item?.currency ?? defaultCurrency.value,
  category_id: props.item?.category_id ?? '',
  description: props.item?.description ?? '',
  frequency: props.item?.frequency ?? ('monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly'),
  next_date: props.item?.next_date ?? todayDate,
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

const calendarDate = computed({
  get: () => (form.next_date ? parseDate(form.next_date) : undefined),
  set: (val) => {
    if (val) {
      form.next_date = val.toString();
    }
  },
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
  // Prevent decimal separators to reinforce digits-only entry
  if (e.key === ',' || e.key === '.') {
    e.preventDefault();
    return;
  }
  e.preventDefault();
};

const onSubmit = async () => {
  const payload: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'> = {
    type: form.type,
    amount: Number(form.amount),
    currency: form.currency,
    category_id: form.category_id || null,
    description: form.description || null,
    frequency: form.frequency,
    next_date: form.next_date!,
    active: true,
  };

  if (props.item) {
    await updateRecurring(props.item.id, payload);
  } else {
    await addRecurring(payload);
  }
  emit('saved');
};
</script>
