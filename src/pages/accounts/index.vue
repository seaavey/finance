<script setup lang="ts">
defineOptions({
  name: 'PagesAccountsIndex',
})
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { AccountWithBalance } from '@/composables/useAccounts';

const router = useRouter();
useI18n();
const { loading, fetchAccounts, getAccountBalances, deleteAccount } = useAccounts();
const { fetchCategories } = useCategories();
const { formatCurrency, convertTo, defaultCurrency } = useCurrency();

const accountList = ref<AccountWithBalance[]>([]);
const showDeleteDialog = ref(false);
const deletingAccount = ref<AccountWithBalance | null>(null);

const typeLabels: Record<string, string> = {
  bank: 'accounts.bank',
  'e-wallet': 'accounts.e-wallet',
  cash: 'accounts.cash',
  investment: 'accounts.investment',
  liability: 'accounts.liability',
};

const loadData = async () => {
  await Promise.all([fetchAccounts(), fetchCategories()]);
  accountList.value = await getAccountBalances();
};

onMounted(() => {
  loadData();
});

const onDeleteRequest = (account: AccountWithBalance) => {
  deletingAccount.value = account;
  showDeleteDialog.value = true;
};

const onDeleteConfirm = async () => {
  if (!deletingAccount.value) return;
  await deleteAccount(deletingAccount.value.id);
  accountList.value = await getAccountBalances();
  showDeleteDialog.value = false;
  deletingAccount.value = null;
};

const goToNew = () => router.push('/accounts/new');

const goToEdit = (account: AccountWithBalance) => {
  router.push(`/accounts/${account.id}/edit`);
};

const goToDetail = (account: AccountWithBalance) => {
  router.push(`/accounts/${account.id}`);
};

const totalBalance = computed(() => {
  let total = 0;
  for (const a of accountList.value) {
    const converted = convertTo(a.balance, a.currency, defaultCurrency.value);
    total += converted ?? a.balance;
  }
  return total;
});
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-foreground">
          {{ $t('accounts.title') }}
        </h1>
        <p class="mt-1 font-medium text-muted-foreground">{{ $t('accounts.subtitle') }}</p>
      </div>
      <Button
        class="flex h-11 items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:from-primary/80 hover:to-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        @click="goToNew"
      >
        <AppIcon name="hugeicons:add-01" :size="20" />
        <span>{{ $t('accounts.add') }}</span>
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <!-- Balance bar skeleton -->
      <Skeleton class="h-24 w-full rounded-3xl bg-muted/50" />
      <!-- Account cards grid -->
      <div class="grid gap-3 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        <Skeleton v-for="i in 4" :key="i" class="h-20 rounded-3xl bg-muted/50" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="accountList.length === 0"
      class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 py-24 text-center"
    >
      <div
        class="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50 shadow-inner"
      >
        <AppIcon name="hugeicons:bank" :size="40" class="text-muted-foreground/40" />
      </div>
      <h3 class="text-xl font-black tracking-tight text-foreground">{{ $t('accounts.empty') }}</h3>
      <p class="mt-2 max-w-xs text-sm font-medium text-muted-foreground">
        {{ $t('accounts.empty_desc') }}
      </p>
      <Button
        variant="outline"
        class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
        @click="goToNew"
      >
        {{ $t('accounts.add') }}
      </Button>
    </div>

    <!-- Account List -->
    <div v-else class="space-y-6">
      <!-- Total Balance Bar -->
      <div class="rounded-3xl border border-border/50 bg-card/20 p-5 backdrop-blur-sm">
        <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">
          {{ $t('dashboard.balance') }}
        </p>
        <p class="text-3xl font-black tracking-tighter text-foreground">
          {{ formatCurrency(totalBalance) }}
        </p>
      </div>

      <!-- Account Cards -->
      <div class="grid gap-3 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        <div
          v-for="account in accountList"
          :key="account.id"
          class="group flex items-center justify-between rounded-3xl border border-border/50 bg-card/30 p-4 transition-all hover:border-border hover:bg-card/50 cursor-pointer"
          @click="goToDetail(account)"
        >
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-2xl"
              :style="{ backgroundColor: account.color + '20' }"
            >
              <AccountIcon
                :icon="account.icon"
                :type="account.type"
                :size="20"
                :color="account.color"
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
          <div class="ml-2 flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
            <Button variant="ghost" size="icon" class="size-8 rounded-xl" @click="goToEdit(account)">
              <AppIcon name="hugeicons:pencil-edit-01" :size="16" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-8 rounded-xl text-red-600"
              @click="onDeleteRequest(account)"
            >
              <AppIcon name="hugeicons:delete-01" :size="16" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('accounts.delete_title')"
      :description="`${$t('accounts.delete_confirm')} &quot;${deletingAccount?.name}&quot;? ${$t('accounts.delete_confirm_suffix')}.`"
      :confirm-text="$t('common.delete')"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>
