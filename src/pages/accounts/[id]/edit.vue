<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const router = useRouter();
const { t } = useI18n();
const { accounts, fetchAccounts, updateAccount, loading } = useAccounts();
const { formatNumberOnly, parseLocalizedNumber, defaultCurrency, currencies } = useCurrency();

const accountId = useRoute().params.id as string;

const form = reactive({
  name: '',
  type: 'bank' as 'bank' | 'e-wallet' | 'cash' | 'investment' | 'liability',
  currency: defaultCurrency.value,
  color: '#3b82f6',
  icon: 'hugeicons:bank',
  initial_balance: 0,
});

const balanceDisplay = computed({
  get: () => form.initial_balance === 0 ? '' : formatNumberOnly(form.initial_balance, form.currency),
  set: (val: string) => { form.initial_balance = parseLocalizedNumber(val, form.currency); },
});

const typeOptions = [
  { value: 'bank', label: t('accounts.bank'), icon: 'hugeicons:bank' },
  { value: 'e-wallet', label: t('accounts.e-wallet'), icon: 'hugeicons:wallet-03' },
  { value: 'cash', label: t('accounts.cash'), icon: 'hugeicons:cash-01' },
  { value: 'investment', label: t('accounts.investment'), icon: 'hugeicons:chart-line-data-01' },
  { value: 'liability', label: t('accounts.liability'), icon: 'hugeicons:credit-card-change' },
];

const typeIcons: Record<string, string> = {
  bank: 'hugeicons:bank',
  'e-wallet': 'hugeicons:wallet-03',
  cash: 'hugeicons:cash-01',
  investment: 'hugeicons:chart-line-data-01',
  liability: 'hugeicons:credit-card-change',
};

watch(
  () => form.type,
  (type) => { form.icon = typeIcons[type] || 'hugeicons:bank'; },
);

const colorOptions = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#f97316', '#06b6d4',
  '#ec4899', '#ef4444', '#a855f7', '#14b8a6', '#eab308', '#f43f5e', '#6b7280',
];

const onNumberKeydown = (e: KeyboardEvent) => {
  const allowed = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
  if (allowed.includes(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && ['a','c','v','x'].includes(e.key.toLowerCase())) return;
  if (/^[0-9]$/.test(e.key)) return;
  if (e.key === ',' || e.key === '.') { e.preventDefault(); return; }
  e.preventDefault();
};

onMounted(async () => {
  await fetchAccounts();
  const account = accounts.value.find((a) => a.id === accountId);
  if (account) {
    form.name = account.name;
    form.type = account.type;
    form.currency = account.currency;
    form.color = account.color;
    form.icon = account.icon;
    form.initial_balance = Number(account.initial_balance);
  }
});

const isFormValid = computed(() => form.name.length > 0);

const onSubmit = async () => {
  if (!isFormValid.value) return;
  const result = await updateAccount(accountId, {
    name: form.name,
    type: form.type,
    currency: form.currency,
    color: form.color,
    icon: form.icon,
    initial_balance: form.initial_balance,
  });
  if (!result.error) {
    router.push('/accounts');
  }
};
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/accounts')">
        <Icon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-3xl font-black tracking-tighter text-foreground">
        {{ $t('accounts.edit') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">{{ $t('accounts.subtitle') }}</p>
    </div>

    <form class="space-y-6 rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm" @submit.prevent="onSubmit">
      <div class="space-y-2">
        <Label>{{ $t('accounts.name') }}</Label>
        <Input v-model="form.name" :placeholder="t('accounts.name')" required />
      </div>

      <div class="space-y-2">
        <Label>{{ $t('accounts.type') }}</Label>
        <div class="grid grid-cols-3 gap-2">
          <Button
            v-for="opt in typeOptions"
            :key="opt.value"
            :variant="form.type === opt.value ? 'default' : 'outline'"
            class="flex flex-col items-center gap-1 py-3"
            @click="form.type = opt.value as 'bank' | 'e-wallet' | 'cash' | 'investment' | 'liability'"
          >
            <Icon :name="opt.icon" :size="20" />
            <span class="text-xs">{{ opt.label }}</span>
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <Label>{{ $t('accounts.currency') }}</Label>
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
        <Label>{{ $t('accounts.initial_balance') }}</Label>
        <Input
          v-model="balanceDisplay"
          type="text"
          inputmode="numeric"
          :placeholder="t('accounts.initial_balance')"
          @keydown="onNumberKeydown"
        />
      </div>

      <div class="space-y-2">
        <Label>{{ $t('accounts.color') }}</Label>
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
        <Button type="button" variant="outline" @click="router.push('/accounts')">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="submit" :disabled="loading || !isFormValid">
          {{ loading ? $t('common.saving') : $t('accounts.edit') }}
        </Button>
      </div>
    </form>
  </div>
</template>
