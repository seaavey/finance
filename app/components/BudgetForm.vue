<script setup lang="ts">
import type { Budget } from '~/composables/useBudgets';

const props = defineProps<{
  open: boolean;
  budget?: Budget | null;
  categories: { id: string; name: string; icon: string; color: string; type: string }[];
  month: string;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const { t } = useI18n();
const { setBudget, loading } = useBudgets();
const { formatNumberOnly, parseLocalizedNumber, defaultCurrency } = useCurrency();

const selectedCategoryId = ref(props.budget?.category_id || '');
const rawAmount = ref(props.budget?.amount ?? 0);

watchEffect(() => {
  if (props.open) {
    selectedCategoryId.value = props.budget?.category_id || '';
    rawAmount.value = props.budget?.amount ?? 0;
  }
});

const amountDisplay = computed({
  get: () => {
    if (rawAmount.value === 0 && !props.budget) {
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

const handleSave = async () => {
  if (!selectedCategoryId.value || !rawAmount.value) {
    return;
  }

  const amount = rawAmount.value;
  if (amount <= 0) {
    return;
  }

  const result = await setBudget(selectedCategoryId.value, props.month, amount);
  if (!result.error) {
    emit('saved');
    emit('update:open', false);
  }
};

const availableCategories = computed(() => props.categories.filter((c) => c.type === 'expense'));
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="w-[calc(100vw-32px)] sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ budget ? t('budget.edit_budget') : t('budget.set_budget') }}</DialogTitle>
        <DialogDescription class="sr-only">{{
          budget ? t('budget.edit_budget') : t('budget.set_budget')
        }}</DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-2">
        <div class="space-y-2">
          <Label>{{ $t('categories.type_name') }}</Label>
          <Select v-model="selectedCategoryId" :disabled="!!budget">
            <SelectTrigger>
              <SelectValue :placeholder="t('categories.type_name')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
                <div class="flex items-center gap-2">
                  <Icon
                    v-if="cat.icon?.startsWith('hugeicons:')"
                    :name="cat.icon"
                    :size="16"
                    :style="{ color: cat.color }"
                  />
                  {{ cat.name }}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>{{ $t('budget.monthly_limit') }}</Label>
          <Input
            v-model="amountDisplay"
            type="text"
            inputmode="numeric"
            :placeholder="t('budget.monthly_limit')"
            autofocus
            @keydown="onNumberKeydown"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button variant="outline" size="sm" @click="emit('update:open', false)">
          {{ $t('common.cancel') }}
        </Button>
        <Button
          size="sm"
          :disabled="loading || !selectedCategoryId || !rawAmount"
          @click="handleSave"
        >
          {{ loading ? $t('common.saving') : t('budget.set_budget') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
