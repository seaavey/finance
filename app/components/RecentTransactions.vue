<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">Transaksi Terakhir</h3>
      <NuxtLinkLocale to="/transactions" class="text-xs text-primary">Lihat semua</NuxtLinkLocale>
    </div>
    <div v-if="recent.length === 0" class="py-4 text-center text-sm text-muted-foreground">
      Belum ada transaksi
    </div>
    <TransactionList :transactions="recent" />
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '~/composables/useTransactions';

defineProps<{
  recent: Transaction[];
}>();
</script>
