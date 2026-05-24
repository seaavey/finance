<template>
  <div class="mx-auto max-w-lg space-y-6">


    <div class="flex gap-2">
      <button
        type="button"
        class="flex-1 rounded-xl py-3 text-center text-sm font-semibold transition-all"
        :class="form.type === 'income'
          ? 'bg-green-500/10 text-green-600 ring-2 ring-green-500/30'
          : 'bg-muted text-muted-foreground hover:bg-accent'"
        @click="form.type = 'income'"
      >
        <HugeiconsIcon :icon="ArrowDown01Icon" :size="18" class="mr-1 inline-block" />
        {{ $t('transactions.income') }}
      </button>
      <button
        type="button"
        class="flex-1 rounded-xl py-3 text-center text-sm font-semibold transition-all"
        :class="form.type === 'expense'
          ? 'bg-red-500/10 text-red-600 ring-2 ring-red-500/30'
          : 'bg-muted text-muted-foreground hover:bg-accent'"
        @click="form.type = 'expense'"
      >
        <HugeiconsIcon :icon="ArrowUp01Icon" :size="18" class="mr-1 inline-block" />
        {{ $t('transactions.expense') }}
      </button>
    </div>

    <Card class="overflow-hidden">
      <CardContent class="flex flex-col items-center gap-2 py-8">
        <span class="text-xs font-medium text-muted-foreground">{{ $t('common.amount') }}</span>
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-medium text-muted-foreground">{{ form.currency }}</span>
          <input
            :value="displayAmount"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="w-48 border-none bg-transparent text-center text-4xl font-bold outline-none placeholder:text-muted-foreground/40"
            @input="onAmountInput"
          />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="divide-y divide-border p-0">
        <div class="flex items-center gap-3 px-4 py-3">
          <HugeiconsIcon :icon="Wallet01Icon" :size="18" class="text-muted-foreground" />
          <div class="flex-1">
            <CategoryPicker v-model="form.category_id" :type="form.type" :placeholder="$t('transactions.category_placeholder')" />
          </div>
        </div>

        <div class="flex items-center gap-3 px-4 py-3">
          <HugeiconsIcon :icon="CoinsSwapIcon" :size="18" class="text-muted-foreground" />
          <div class="flex-1">
            <Select v-model="form.currency">
              <SelectTrigger class="border-none shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in currencies" :key="c.value" :value="c.value">
                  {{ c.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex items-center gap-3 px-4 py-3">
          <HugeiconsIcon :icon="Calendar01Icon" :size="18" class="text-muted-foreground" />
          <div class="flex-1">
            <Input v-model="form.date" type="date" class="border-none shadow-none" />
          </div>
        </div>

        <div class="flex items-start gap-3 px-4 py-3">
          <HugeiconsIcon :icon="Note01Icon" :size="18" class="mt-0.5 text-muted-foreground" />
          <div class="flex-1">
            <Textarea
              v-model="form.description"
              :placeholder="$t('transactions.note_placeholder')"
              rows="2"
              class="resize-none border-none shadow-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <div class="flex gap-3">
      <Button variant="outline" class="flex-1" @click="$emit('cancel')">{{ $t('common.cancel') }}</Button>
      <Button class="flex-1" :disabled="!form.amount || !form.date" @click="onSubmit">{{ $t('common.save') }}</Button>
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
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { Transaction } from '~/composables/useTransactions'

const props = defineProps<{
  transaction?: Transaction
}>()

const emit = defineEmits<{
  cancel: []
  saved: []
}>()

const { t, locale } = useI18n()
const { currencies } = useCurrency()
const { addTransaction, updateTransaction } = useTransactions()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  type: props.transaction?.type ?? ('expense' as 'income' | 'expense'),
  amount: props.transaction?.amount ?? 0,
  currency: props.transaction?.currency ?? 'IDR',
  category_id: props.transaction?.category_id ?? '',
  description: props.transaction?.description ?? '',
  date: props.transaction?.date ?? today,
})

const formatNumber = (num: number) => {
  if (!num) return ''
  return num.toLocaleString(locale.value)
}

const displayAmount = computed(() => formatNumber(form.amount))

const onAmountInput = (e: Event) => {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
  form.amount = raw ? parseInt(raw, 10) : 0
}

const onSubmit = async () => {
  const payload = {
    type: form.type,
    amount: Number(form.amount),
    currency: form.currency,
    category_id: form.category_id || null,
    description: form.description || null,
    date: form.date,
  }

  if (props.transaction) {
    await updateTransaction(props.transaction.id, payload)
  } else {
    await addTransaction(payload)
  }
  emit('saved')
}
</script>
