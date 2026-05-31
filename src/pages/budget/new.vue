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
const route = useRoute();
const { t } = useI18n();
const { categories, fetchCategories } = useCategories();
const { setBudget, loading } = useBudgets();
const { formatNumberOnly, parseLocalizedNumber, defaultCurrency } = useCurrency();

const selectedCategoryId = ref('');
const rawAmount = ref(0);
const month = ref(route.query.month as string || '');

const amountDisplay = computed({
  get: () => rawAmount.value === 0 ? '' : formatNumberOnly(rawAmount.value, defaultCurrency.value),
  set: (val: string) => { rawAmount.value = parseLocalizedNumber(val, defaultCurrency.value); },
});

const onNumberKeydown = (e: KeyboardEvent) => {
  const allowed = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
  if (allowed.includes(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && ['a','c','v','x'].includes(e.key.toLowerCase())) return;
  if (/^[0-9]$/.test(e.key)) return;
  if (e.key === ',' || e.key === '.') { e.preventDefault(); return; }
  e.preventDefault();
};

const expenseCategories = computed(() => categories.value.filter((c) => c.type === 'expense'));
const isFormValid = computed(() => selectedCategoryId.value && rawAmount.value > 0);

const handleSave = async () => {
  if (!isFormValid.value || !month.value) return;
  const result = await setBudget(selectedCategoryId.value, month.value, rawAmount.value);
  if (!result.error) {
    router.push('/budget');
  }
};

onMounted(async () => {
  await fetchCategories();
  // Default to current month if not specified
  if (!month.value) {
    const d = new Date();
    month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }
});
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/budget')">
        <Icon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-3xl font-black tracking-tighter text-foreground">
        {{ $t('budget.set_budget') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">
        {{ $t('budget.subtitle') }}
      </p>
    </div>

    <div class="space-y-6 rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
      <div class="space-y-2">
        <Label>{{ $t('budget.month') }}</Label>
        <Input
          v-model="month"
          type="month"
          :disabled="true"
          class="bg-muted/30"
        />
      </div>

      <div class="space-y-2">
        <Label>{{ $t('categories.type_name') }}</Label>
        <Select v-model="selectedCategoryId">
          <SelectTrigger>
            <SelectValue :placeholder="t('categories.type_name')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="cat in expenseCategories"
              :key="cat.id"
              :value="cat.id"
            >
              <div class="flex items-center gap-2">
                <Icon
                  v-if="cat.icon?.startsWith('hugeicons:')"
                  :name="cat.icon"
                  :size="16"
                  :style="{ color: cat.color }"
                />
                {{ cat.name }}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label>{{ $t('budget.monthly_limit') }}</Label>
        <Input
          v-model="amountDisplay"
          type="text"
          inputmode="numeric"
          :placeholder="t('budget.monthly_limit')"
          autofocus
          @keydown="onNumberKeydown"
        />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button variant="outline" @click="router.push('/budget')">
          {{ $t('common.cancel') }}
        </Button>
        <Button :disabled="loading || !isFormValid" @click="handleSave">
          {{ loading ? $t('common.saving') : $t('budget.set_budget') }}
        </Button>
      </div>
    </div>
  </div>
</template>
