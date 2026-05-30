<script setup lang="ts">
import type { AccountWithBalance } from '~/composables/useAccounts';

defineProps<{
  account: AccountWithBalance;
}>();

const emit = defineEmits<{
  edit: [account: AccountWithBalance];
  delete: [account: AccountWithBalance];
}>();

const { formatCurrency } = useCurrency();

const typeLabels: Record<string, string> = {
  bank: 'accounts.bank',
  'e-wallet': 'accounts.e-wallet',
  cash: 'accounts.cash',
};
</script>

<template>
  <div
    class="group flex items-center justify-between rounded-3xl border border-border/50 bg-card/30 p-4 transition-all hover:border-border hover:bg-card/50"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-2xl"
        :style="{ backgroundColor: account.color + '20' }"
      >
        <Icon
          v-if="account.icon?.startsWith('hugeicons:')"
          :name="account.icon"
          :size="20"
          :style="{ color: account.color }"
        />
      </div>
      <div class="min-w-0">
        <h3 class="truncate font-medium text-foreground">{{ account.name }}</h3>
        <p class="text-xs text-muted-foreground">{{ $t(typeLabels[account.type] || '') }}</p>
      </div>
    </div>
    <div class="ml-3 shrink-0 text-right">
      <p class="font-semibold">{{ formatCurrency(account.balance, account.currency) }}</p>
    </div>
    <div class="ml-2 flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Button variant="ghost" size="icon" class="size-8 rounded-xl" @click="emit('edit', account)">
        <Icon name="hugeicons:pencil-edit-01" :size="16" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="size-8 rounded-xl text-red-400"
        @click="emit('delete', account)"
      >
        <Icon name="hugeicons:delete-01" :size="16" />
      </Button>
    </div>
  </div>
</template>
