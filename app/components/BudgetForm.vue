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
const { parseLocalizedNumber } = useCurrency();

const selectedCategoryId = ref(props.budget?.category_id || '');
const amountInput = ref(props.budget ? String(props.budget.amount) : '');

watchEffect(() => {
  if (props.open) {
    selectedCategoryId.value = props.budget?.category_id || '';
    amountInput.value = props.budget ? String(props.budget.amount) : '';
  }
});

const handleSave = async () => {
  if (!selectedCategoryId.value || !amountInput.value) return;

  const amount = parseLocalizedNumber(amountInput.value);
  if (amount <= 0) return;

  const result = await setBudget(selectedCategoryId.value, props.month, amount);
  if (!result.error) {
    emit('saved');
    emit('update:open', false);
  }
};

const availableCategories = computed(() =>
  props.categories.filter((c) => c.type === 'expense'),
);
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="w-[calc(100vw-32px)] sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ budget ? t('budget.edit_budget') : t('budget.set_budget') }}</DialogTitle>
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
                  <Icon :name="cat.icon" :size="16" :style="{ color: cat.color }" />
                  {{ cat.name }}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>{{ $t('budget.monthly_limit') }}</Label>
          <Input
            v-model="amountInput"
            type="text"
            inputmode="numeric"
            :placeholder="t('budget.monthly_limit')"
            autofocus
          />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Button variant="outline" size="sm" @click="emit('update:open', false)">
          {{ $t('common.cancel') }}
        </Button>
        <Button
          size="sm"
          :disabled="loading || !selectedCategoryId || !amountInput"
          @click="handleSave"
        >
          {{ loading ? $t('common.saving') : t('budget.set_budget') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
