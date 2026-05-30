<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { AccountWithBalance } from '~/composables/useAccounts';

definePageMeta({});

const { t } = useI18n();
const seoTitle = computed(() => t('accounts.title'));
useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
});

const { loading, fetchAccounts, getAccountBalances, deleteAccount } = useAccounts();
const { fetchCategories } = useCategories();

const accountList = ref<AccountWithBalance[]>([]);
const showForm = ref(false);
const editingAccount = ref<AccountWithBalance | null>(null);
const showDeleteDialog = ref(false);
const deletingAccount = ref<AccountWithBalance | null>(null);

const loadData = async () => {
  await Promise.all([fetchAccounts(), fetchCategories()]);
  accountList.value = await getAccountBalances();
};

onMounted(() => {
  loadData();
});

const onAdd = () => {
  editingAccount.value = null;
  showForm.value = true;
};

const onEdit = (account: AccountWithBalance) => {
  editingAccount.value = account;
  showForm.value = true;
};

const onDeleteRequest = (account: AccountWithBalance) => {
  deletingAccount.value = account;
  showDeleteDialog.value = true;
};

const onDeleteConfirm = async () => {
  if (!deletingAccount.value) { return; }
  await deleteAccount(deletingAccount.value.id);
  accountList.value = await getAccountBalances();
  showDeleteDialog.value = false;
  deletingAccount.value = null;
};

const onFormSaved = async () => {
  accountList.value = await getAccountBalances();
};
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-foreground">
          {{ t('accounts.title') }}
        </h1>
        <p class="mt-1 font-medium text-muted-foreground">{{ t('accounts.subtitle') }}</p>
      </div>
      <Button
        class="flex h-11 items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:from-primary/80 hover:to-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        @click="onAdd"
      >
        <Icon name="hugeicons:add-01" :size="20" />
        <span>{{ t('accounts.add') }}</span>
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="i in 6" :key="i" class="h-32 w-full rounded-4xl bg-muted/50" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="accountList.length === 0"
      class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 py-24 text-center"
    >
      <div class="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50 shadow-inner">
        <Icon name="hugeicons:bank" :size="40" class="text-muted-foreground/40" />
      </div>
      <h3 class="text-xl font-black tracking-tight text-foreground">{{ t('accounts.empty') }}</h3>
      <p class="mt-2 max-w-xs text-sm font-medium text-muted-foreground">
        {{ t('accounts.empty_desc') }}
      </p>
      <Button
        variant="outline"
        class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
        @click="onAdd"
      >
        {{ t('accounts.add') }}
      </Button>
    </div>

    <!-- Account List Grid -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AccountCard
        v-for="account in accountList"
        :key="account.id"
        :account="account"
        @edit="onEdit"
        @delete="onDeleteRequest"
      />
    </div>

    <AccountForm v-model:open="showForm" :account="editingAccount" @saved="onFormSaved" />

    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="t('accounts.delete_title')"
      :description="`${t('accounts.delete_confirm')} &quot;${deletingAccount?.name}&quot;? ${t('accounts.delete_confirm_suffix')}.`"
      :confirm-text="t('common.delete')"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>
