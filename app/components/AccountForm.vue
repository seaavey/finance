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
    if (form.initial_balance === 0 && !props.account) {
      return '';
    }
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
