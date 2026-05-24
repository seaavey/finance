<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">{{ $t('dashboard.recent_transactions') }}</h3>
      <NuxtLink to="/transactions" class="text-xs text-primary">{{ $t('common.view_all') }}</NuxtLink>
    </div>
    <div v-if="recent.length === 0" class="py-4 text-center text-sm text-muted-foreground">
      {{ $t('dashboard.no_transactions') }}
    </div>
    <TransactionList :transactions="recent" />
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '~/composables/useTransactions'

defineProps<{
  recent: Transaction[]
}>()
</script>
