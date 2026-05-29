<script setup lang="ts">
import type { AccountWithBalance } from '~/composables/useAccounts';

definePageMeta({});

const { t } = useI18n();
const seoTitle = computed(() => t('accounts.title'));
useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
});

const { accounts, loading, fetchAccounts, getAccountBalances, deleteAccount } = useAccounts();
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
  if (!deletingAccount.value) {
    return;
  }
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
  <div class="mx-auto max-w-6xl space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ t('accounts.title') }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">{{ t('accounts.subtitle') }}</p>
      </div>
      <Button
        class="flex items-center gap-2 rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-4 text-sm font-medium text-white transition hover:from-pink-400 hover:to-pink-500"
        @click="onAdd"
      >
        <Icon name="hugeicons:add-01" :size="18" />
        <span class="hidden sm:inline">{{ t('accounts.add') }}</span>
      </Button>
    </div>

    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-20 w-full rounded-3xl" />
      <Skeleton class="h-20 w-full rounded-3xl" />
    </div>

    <div
      v-else-if="accountList.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <div class="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
        <Icon name="hugeicons:bank" :size="32" class="text-muted-foreground" />
      </div>
      <p class="text-sm font-medium text-muted-foreground">{{ t('accounts.empty') }}</p>
      <p class="mt-1 text-xs text-muted-foreground">{{ t('accounts.empty_desc') }}</p>
      <Button variant="outline" size="sm" class="mt-4" @click="onAdd">
        {{ t('accounts.add') }}
      </Button>
    </div>

    <div v-else class="space-y-3">
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
