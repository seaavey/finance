<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ item ? $t('recurring.edit_title') : $t('recurring.add_title') }}</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label>{{ $t('recurring.type') }}</Label>
          <div class="flex gap-2">
            <Button type="button" :variant="form.type === 'income' ? 'default' : 'outline'" class="flex-1" @click="form.type = 'income'">
              {{ $t('transactions.income') }}
            </Button>
            <Button type="button" :variant="form.type === 'expense' ? 'default' : 'outline'" class="flex-1" @click="form.type = 'expense'">
              {{ $t('transactions.expense') }}
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="r-amount">{{ $t('recurring.amount') }}</Label>
          <Input id="r-amount" v-model.number="form.amount" type="number" min="1" step="any" placeholder="0" required />
        </div>

        <div class="space-y-2">
          <Label>{{ $t('recurring.currency') }}</Label>
          <Select v-model="form.currency">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in currencies" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>{{ $t('recurring.category') }}</Label>
          <CategoryPicker v-model="form.category_id" :type="form.type" :placeholder="$t('recurring.category_placeholder')" />
        </div>

        <div class="space-y-2">
          <Label for="r-desc">{{ $t('common.description') }}</Label>
          <Input id="r-desc" v-model="form.description" :placeholder="$t('recurring.description_placeholder')" />
        </div>

        <div class="space-y-2">
          <Label>Frekuensi</Label>
          <Select v-model="form.frequency">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">{{ $t('recurring.frequency_daily') }}</SelectItem>
              <SelectItem value="weekly">{{ $t('recurring.frequency_weekly') }}</SelectItem>
              <SelectItem value="monthly">{{ $t('recurring.frequency_monthly') }}</SelectItem>
              <SelectItem value="yearly">{{ $t('recurring.frequency_yearly') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="r-next">{{ $t('recurring.next_date') }}</Label>
          <Input id="r-next" v-model="form.next_date" type="date" required />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="$emit('close')">{{ $t('common.cancel') }}</Button>
          <Button type="submit" :disabled="!form.amount || !form.next_date">{{ $t('common.save') }}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { RecurringTransaction } from '~/composables/useRecurring'

const props = defineProps<{
  item?: RecurringTransaction
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { currencies } = useCurrency()
const { addRecurring, updateRecurring } = useRecurring()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  type: props.item?.type ?? ('expense' as 'income' | 'expense'),
  amount: props.item?.amount ?? ('' as unknown as number),
  currency: props.item?.currency ?? 'IDR',
  category_id: props.item?.category_id ?? '',
  description: props.item?.description ?? '',
  frequency: props.item?.frequency ?? ('monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly'),
  next_date: props.item?.next_date ?? today,
})

const onSubmit = async () => {
  const payload = {
    type: form.type,
    amount: Number(form.amount),
    currency: form.currency,
    category_id: form.category_id || null,
    description: form.description || null,
    frequency: form.frequency,
    next_date: form.next_date,
    active: true,
  }

  if (props.item) {
    await updateRecurring(props.item.id, payload)
  } else {
    await addRecurring(payload)
  }
  emit('saved')
}
</script>
