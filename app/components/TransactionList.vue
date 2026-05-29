<template>
  <div class="space-y-2">
    <div v-if="transactions.length === 0" class="py-8 text-center text-sm text-muted-foreground">
      {{ $t('transactions.empty') }}
    </div>
    <NuxtLinkLocale
      v-for="tx in transactions"
      :key="tx.id"
      :to="`/transactions/${tx.id}/edit`"
      class="block"
    >
      <TransactionItem :transaction="tx" />
    </NuxtLinkLocale>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '~/composables/useTransactions';

defineProps<{
  transactions: Transaction[];
}>();
</script>
