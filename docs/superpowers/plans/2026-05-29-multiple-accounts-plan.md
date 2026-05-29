# Multiple Accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multiple account support (bank/e-wallet/cash) with per-account computed balance and account selector on transactions.

**Architecture:** New `accounts` table + RLS, new `useAccounts` composable with `createCache`, account selector in `TransactionForm`, accounts management page, accounts section on dashboard. Balance computed from `initial_balance + sum income - sum expense`.

**Tech Stack:** Supabase migration, Nuxt/Vue 3 composable, shadcn-vue UI, HugeIcons, i18n

---

### Task 1: Database Migration

**Files:**

- Create: `supabase/migrations/20260530000000_accounts.sql`

- [ ] **Step 1: Write migration file**

```sql
-- Create accounts table
CREATE TABLE accounts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('bank', 'e-wallet', 'cash')),
  currency text DEFAULT 'IDR',
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'hugeicons:bank',
  initial_balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION on_accounts_updated()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_accounts_updated
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION on_accounts_updated();

-- Add account_id to transactions
ALTER TABLE transactions ADD COLUMN account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_select_own_accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT partner_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "users_can_insert_own_accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260530000000_accounts.sql
git commit -m "feat: add accounts table with RLS and transaction account_id"
```

---

### Task 2: i18n Keys

**Files:**

- Modify: `i18n/locales/id.json`
- Modify: `i18n/locales/en.json`

- [ ] **Step 1: Add to `i18n/locales/id.json`**

Insert after the `budget` block:

```json
  "accounts": {
    "title": "Akun",
    "subtitle": "Kelola rekening, e-wallet, dan dompet",
    "add": "Tambah Akun",
    "edit": "Edit Akun",
    "delete": "Hapus Akun",
    "name": "Nama Akun",
    "type": "Tipe",
    "bank": "Rekening Bank",
    "e-wallet": "E-Wallet",
    "cash": "Uang Tunai",
    "currency": "Mata Uang",
    "color": "Warna",
    "initial_balance": "Saldo Awal",
    "empty": "Belum ada akun",
    "empty_desc": "Tambah rekening bank, e-wallet, atau uang tunai",
    "balance": "Saldo",
    "delete_title": "Hapus Akun",
    "delete_confirm": "Yakin hapus akun",
    "delete_confirm_suffix": "Transaksi dengan akun ini tidak akan terhapus",
    "saved": "Akun berhasil disimpan",
    "save_error": "Gagal menyimpan akun",
    "deleted": "Akun berhasil dihapus",
    "delete_error": "Gagal menghapus akun"
  },
```

Also add `"accounts": "Akun"` in the `sidebar` section. And add `"select_account": "Pilih akun"` in `transaction_form`.

For dashboard, add `"accounts_title": "Akun"` in the `dashboard` namespace.

- [ ] **Step 2: Add to `i18n/locales/en.json`**

Same structure with English translations:

```json
  "accounts": {
    "title": "Accounts",
    "subtitle": "Manage bank accounts, e-wallets, and cash",
    "add": "Add Account",
    "edit": "Edit Account",
    "delete": "Delete Account",
    "name": "Account Name",
    "type": "Type",
    "bank": "Bank Account",
    "e-wallet": "E-Wallet",
    "cash": "Cash",
    "currency": "Currency",
    "color": "Color",
    "initial_balance": "Initial Balance",
    "empty": "No accounts yet",
    "empty_desc": "Add a bank account, e-wallet, or cash",
    "balance": "Balance",
    "delete_title": "Delete Account",
    "delete_confirm": "Are you sure you want to delete this account?",
    "delete_confirm_suffix": "Transactions with this account will not be deleted",
    "saved": "Account saved successfully",
    "save_error": "Failed to save account",
    "deleted": "Account deleted successfully",
    "delete_error": "Failed to delete account"
  },
```

Also add `"accounts": "Accounts"` in `sidebar`. `"select_account": "Select account"` in `transaction_form`. `"accounts_title": "Accounts"` in `dashboard`.

- [ ] **Step 3: Commit**

```bash
git add i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(i18n): add accounts translation keys"
```

---

### Task 3: Composable — `useAccounts`

**Files:**

- Create: `app/composables/useAccounts.ts`

- [ ] **Step 1: Write composable**

```typescript
import { useSupabase } from '~/lib/supabase';
import { createCache } from '~/lib/cache';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'bank' | 'e-wallet' | 'cash';
  currency: string;
  color: string;
  icon: string;
  initial_balance: number;
  created_at: string;
  updated_at: string;
}

export interface AccountWithBalance extends Account {
  balance: number;
}

export const useAccounts = () => {
  const supabase = useSupabase();
  const cache = createCache();
  const { t } = useI18n();
  const { toast } = useToast();
  const { user } = useAuth();

  const accounts = useState<Account[]>('accounts', () => []);
  const loading = useState('accounts-loading', () => false);

  const fetchAccounts = async () => {
    if (!user.value) return;
    loading.value = true;
    try {
      const result = await cache.fetch(
        'accounts',
        async () => {
          const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', user.value!.id)
            .order('created_at');
          if (error) throw error;
          return data as Account[];
        },
        30_000,
      );
      accounts.value = result || [];
    } finally {
      loading.value = false;
    }
  };

  const addAccount = async (
    data: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => {
    if (!user.value) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('accounts').insert({ ...data, user_id: user.value.id });
    if (!error) {
      cache.invalidate('accounts');
      await fetchAccounts();
      toast.success(t('accounts.saved'));
    } else {
      toast.error(t('accounts.save_error'));
    }
    return { error };
  };

  const updateAccount = async (
    id: string,
    updates: Partial<
      Pick<Account, 'name' | 'type' | 'currency' | 'color' | 'icon' | 'initial_balance'>
    >,
  ) => {
    const { error } = await supabase.from('accounts').update(updates).eq('id', id);
    if (!error) {
      cache.invalidate('accounts');
      await fetchAccounts();
      toast.success(t('accounts.saved'));
    } else {
      toast.error(t('accounts.save_error'));
    }
    return { error };
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (!error) {
      cache.invalidate('accounts');
      cache.invalidate('transactions');
      await fetchAccounts();
      toast.success(t('accounts.deleted'));
    } else {
      toast.error(t('accounts.delete_error'));
    }
    return { error };
  };

  const getAccountBalance = async (accountId: string): Promise<number> => {
    if (!user.value) return 0;
    const account = accounts.value.find((a) => a.id === accountId);
    if (!account) return 0;

    const { data } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', user.value.id)
      .eq('account_id', accountId);

    const net = (data || []).reduce((sum, tx: { type: string; amount: number }) => {
      return tx.type === 'income' ? sum + Number(tx.amount) : sum - Number(tx.amount);
    }, 0);

    return Number(account.initial_balance) + net;
  };

  const getAccountBalances = async (): Promise<AccountWithBalance[]> => {
    if (!user.value) return [];
    const accts = accounts.value;
    if (accts.length === 0) return [];

    const { data } = await supabase
      .from('transactions')
      .select('account_id, type, amount')
      .eq('user_id', user.value.id)
      .in(
        'account_id',
        accts.map((a) => a.id),
      )
      .not('account_id', 'is', null);

    const netMap = new Map<string, number>();
    for (const tx of (data || []) as { account_id: string; type: string; amount: number }[]) {
      const current = netMap.get(tx.account_id) || 0;
      netMap.set(
        tx.account_id,
        tx.type === 'income' ? current + Number(tx.amount) : current - Number(tx.amount),
      );
    }

    return accts.map((a) => ({
      ...a,
      balance: Number(a.initial_balance) + (netMap.get(a.id) || 0),
    }));
  };

  const bankAccounts = computed(() => accounts.value.filter((a) => a.type === 'bank'));
  const ewalletAccounts = computed(() => accounts.value.filter((a) => a.type === 'e-wallet'));
  const cashAccounts = computed(() => accounts.value.filter((a) => a.type === 'cash'));

  return {
    accounts,
    loading,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountBalance,
    getAccountBalances,
    bankAccounts,
    ewalletAccounts,
    cashAccounts,
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add app/composables/useAccounts.ts
git commit -m "feat: add useAccounts composable with CRUD and balance computation"
```

---

### Task 4: AccountCard Component

**Files:**

- Create: `app/components/AccountCard.vue`

- [ ] **Step 1: Write component**

```vue
<script setup lang="ts">
import type { AccountWithBalance } from '~/composables/useAccounts';

const props = defineProps<{
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
```

- [ ] **Step 2: Commit**

```bash
git add app/components/AccountCard.vue
git commit -m "feat: add AccountCard component"
```

---

### Task 5: AccountForm Component

**Files:**

- Create: `app/components/AccountForm.vue`

- [ ] **Step 1: Write component**

```vue
<script setup lang="ts">
import type { Account, AccountWithBalance } from '~/composables/useAccounts';

const props = defineProps<{
  open: boolean;
  account?: Account | AccountWithBalance | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const { t } = useI18n();
const { addAccount, updateAccount, loading } = useAccounts();
const { formatNumberOnly, parseLocalizedNumber, defaultCurrency, currencies } = useCurrency();

const form = reactive({
  name: '',
  type: 'bank' as 'bank' | 'e-wallet' | 'cash',
  currency: defaultCurrency.value,
  color: '#3b82f6',
  icon: 'hugeicons:bank',
  initial_balance: 0,
});

const balanceDisplay = computed({
  get: () => {
    if (form.initial_balance === 0 && !props.account) return '';
    return formatNumberOnly(form.initial_balance, form.currency);
  },
  set: (val: string) => {
    form.initial_balance = parseLocalizedNumber(val, form.currency);
  },
});

const typeOptions = [
  { value: 'bank', label: t('accounts.bank'), icon: 'hugeicons:bank' },
  { value: 'e-wallet', label: t('accounts.e-wallet'), icon: 'hugeicons:wallet-03' },
  { value: 'cash', label: t('accounts.cash'), icon: 'hugeicons:cash-01' },
];

const typeIcons: Record<string, string> = {
  bank: 'hugeicons:bank',
  'e-wallet': 'hugeicons:wallet-03',
  cash: 'hugeicons:cash-01',
};

watchEffect(() => {
  if (props.open) {
    if (props.account) {
      form.name = props.account.name;
      form.type = props.account.type;
      form.currency = props.account.currency;
      form.color = props.account.color;
      form.icon = props.account.icon;
      form.initial_balance = Number(props.account.initial_balance);
    } else {
      form.name = '';
      form.type = 'bank';
      form.currency = defaultCurrency.value;
      form.color = '#3b82f6';
      form.icon = 'hugeicons:bank';
      form.initial_balance = 0;
    }
  }
});

watch(
  () => form.type,
  (type) => {
    form.icon = typeIcons[type] || 'hugeicons:bank';
  },
);

const colorOptions = [
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#f97316',
  '#06b6d4',
  '#ec4899',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#eab308',
  '#f43f5e',
  '#6b7280',
];

const onNumberKeydown = (e: KeyboardEvent) => {
  const allowed = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ];
  if (allowed.includes(e.key)) {
    return;
  }
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
    return;
  }
  if (/^[0-9]$/.test(e.key)) {
    return;
  }
  if (e.key === ',' || e.key === '.') {
    return;
  }
  e.preventDefault();
};

const onSubmit = async () => {
  if (!form.name) {
    return;
  }
  let result;
  if (props.account) {
    result = await updateAccount(props.account.id, {
      name: form.name,
      type: form.type,
      currency: form.currency,
      color: form.color,
      icon: form.icon,
      initial_balance: form.initial_balance,
    });
  } else {
    result = await addAccount({
      name: form.name,
      type: form.type,
      currency: form.currency,
      color: form.color,
      icon: form.icon,
      initial_balance: form.initial_balance,
    });
  }
  if (!result.error) {
    emit('saved');
    emit('update:open', false);
  }
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="w-[calc(100vw-32px)] sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ account ? t('accounts.edit') : t('accounts.add') }}</DialogTitle>
        <DialogDescription class="sr-only">{{
          account ? t('accounts.edit') : t('accounts.add')
        }}</DialogDescription>
      </DialogHeader>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label>{{ t('accounts.name') }}</Label>
          <Input v-model="form.name" :placeholder="t('accounts.name')" required />
        </div>
        <div class="space-y-2">
          <Label>{{ t('accounts.type') }}</Label>
          <div class="grid grid-cols-3 gap-2">
            <Button
              v-for="opt in typeOptions"
              :key="opt.value"
              :variant="form.type === opt.value ? 'default' : 'outline'"
              class="flex flex-col items-center gap-1 py-3"
              @click="form.type = opt.value"
            >
              <Icon :name="opt.icon" :size="20" />
              <span class="text-xs">{{ opt.label }}</span>
            </Button>
          </div>
        </div>
        <div class="space-y-2">
          <Label>{{ t('accounts.currency') }}</Label>
          <Select v-model="form.currency">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in currencies" :key="c.value" :value="c.value">
                {{ c.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>{{ t('accounts.initial_balance') }}</Label>
          <Input
            v-model="balanceDisplay"
            type="text"
            inputmode="numeric"
            :placeholder="t('accounts.initial_balance')"
            @keydown="onNumberKeydown"
          />
        </div>
        <div class="space-y-2">
          <Label>{{ t('accounts.color') }}</Label>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="c in colorOptions"
              :key="c"
              variant="outline"
              class="size-8 rounded-full p-0"
              :class="form.color === c && 'scale-110 ring-2 ring-foreground'"
              :style="{ backgroundColor: c }"
              @click="form.color = c"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            {{ t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="loading || !form.name">
            {{ loading ? t('common.saving') : t('accounts.add') }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
```

Wait, `$currencies` won't work in the template. I need to import `currencies` from `useCurrency`. Let me fix this:

In script, add:

```ts
const { formatNumberOnly, parseLocalizedNumber, defaultCurrency, currencies } = useCurrency();
```

And in template, use `currencies` instead of `$currencies`.

- [ ] **Step 2: Commit**

```bash
git add app/components/AccountForm.vue
git commit -m "feat: add AccountForm component"
```

---

### Task 6: Accounts Page

**Files:**

- Create: `app/pages/accounts.vue`

- [ ] **Step 1: Write page**

```vue
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
  if (!deletingAccount.value) return;
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
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/accounts.vue
git commit -m "feat: add accounts management page"
```

---

### Task 7: Sidebar Link

**Files:**

- Modify: `app/components/AppSidebar.vue`

- [ ] **Step 1: Add accounts link**

The sidebar nav items are defined as an array at line 103 in `AppSidebar.vue`. Add after the budget entry:

```ts
{ to: '/accounts', label: t('sidebar.accounts'), icon: 'hugeicons:bank' },
```

The full array should look like:

```ts
const navItems = [
  { to: '/dashboard', label: t('sidebar.dashboard'), icon: 'hugeicons:home-03' },
  { to: '/transactions', label: t('sidebar.transactions'), icon: 'hugeicons:arrow-left-right' },
  { to: '/categories', label: t('sidebar.categories'), icon: 'hugeicons:grid-view' },
  { to: '/recurring', label: t('sidebar.recurring'), icon: 'hugeicons:repeat' },
  { to: '/goals', label: t('sidebar.goals'), icon: 'hugeicons:target-02' },
  { to: '/budget', label: t('sidebar.budget'), icon: 'hugeicons:wallet-03' },
  { to: '/accounts', label: t('sidebar.accounts'), icon: 'hugeicons:bank' },
];
```

- [ ] **Step 2: Commit**

```bash
git add app/components/AppSidebar.vue
git commit -m "feat: add accounts link to sidebar"
```

---

### Task 8: Transaction Account Selector

**Files:**

- Modify: `app/components/TransactionForm.vue`
- Modify: `app/components/TransactionItem.vue`

- [ ] **Step 1: Add account selector to TransactionForm**

In the detail form section, after the category picker row, add:

```vue
<div class="flex items-center gap-3 px-5 py-4">
  <Icon name="hugeicons:bank" :size="18" class="text-muted-foreground" />
  <div class="flex-1">
    <Select v-model="form.account_id">
      <SelectTrigger class="border-none shadow-none">
        <SelectValue :placeholder="t('transaction_form.select_account')" />
      </SelectTrigger>
      <SelectContent class="bg-popover border border-border shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-2xl p-2">
        <SelectItem value="" class="rounded-xl px-3 py-2.5 text-sm text-muted-foreground">
          {{ t('transaction_form.select_account') }}
        </SelectItem>
        <SelectItem
          v-for="acct in accounts"
          :key="acct.id"
          :value="acct.id"
          class="rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-accent cursor-pointer"
        >
          <div class="flex items-center gap-2">
            <div class="size-2 rounded-full" :style="{ backgroundColor: acct.color }" />
            <span>{{ acct.name }}</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
```

In script:

- Import `useAccounts` and call `fetchAccounts` on mount
- Add `account_id` to the form reactive object
- Add `accounts` from useAccounts

- [ ] **Step 2: Show account on TransactionItem**

Add an account indicator after the owner badge. Look up account name/color from accounts list. Show a small colored dot or badge.

- [ ] **Step 3: Commit**

```bash
git add app/components/TransactionForm.vue app/components/TransactionItem.vue
git commit -m "feat: add account selector to transaction form and account indicator"
```

---

### Task 9: Dashboard Account Section

**Files:**

- Modify: `app/pages/dashboard.vue`

- [ ] **Step 1: Add accounts section**

Following the same pattern as the budget section added earlier. In `onMounted`, call `getAccountBalances()` and assign to a ref. In the template, add a section after budget summary showing compact account cards.

- [ ] **Step 2: Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "feat: add account balances section to dashboard"
```

---

### Task 10: Migration & Verification

- [ ] **Step 1: Push migration to Supabase**

```bash
supabase db push --linked
```

- [ ] **Step 2: Run lint and format**

```bash
bun run lint && bun run format:check
```

Expected: 0 errors, format clean.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: run migration and final cleanup"
```
