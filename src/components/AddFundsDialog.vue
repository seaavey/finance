<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ $t('funds_form.title')}}</DialogTitle>
        <DialogDescription>
          {{ $t('funds_form.subtitle', { name: goal.name })}}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4 pt-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label for="amount">{{ $t('funds_form.amount')}}</Label>
          <Input
            id="amount"
            v-model="amountDisplay"
            type="text"
            inputmode="numeric"
            placeholder="0"
            required
            auto-focus
            @keydown="onNumberKeydown"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="$emit('close')">
            {{ $t('funds_form.cancel')}}
          </Button>
          <Button type="submit" :disabled="!rawAmount || Number(rawAmount) <= 0">
            {{ $t('funds_form.add')}}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Goal } from '@/composables/useGoals';

const props = defineProps<{
  goal: Goal;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const { addFunds } = useGoals();
const { formatNumberOnly, parseLocalizedNumber, defaultCurrency } = useCurrency();
const rawAmount = ref(0);

const amountDisplay = computed({
  get: () => {
    if (!rawAmount.value) {
      return '';
    }
    return formatNumberOnly(rawAmount.value, defaultCurrency.value);
  },
  set: (val: string) => {
    rawAmount.value = parseLocalizedNumber(val, defaultCurrency.value);
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
  const { error } = await addFunds(props.goal.id, Number(rawAmount.value));
  if (!error) {
    emit('saved');
  }
};
</script>
