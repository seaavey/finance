<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CurrencyInput from '@/components/CurrencyInput.vue'
import CategoryPicker from '@/components/CategoryPicker.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useCategories } from '@/composables/useCategories'
import { useBudgets } from '@/composables/useBudgets'

defineOptions({
  name: 'PagesBudgetNew',
})

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { categories, fetchCategories } = useCategories()
const { createBudget, loading } = useBudgets()
const { defaultCurrency } = useCurrency()

const selectedCategoryId = ref('')
const rawAmount = ref(0)
const budgetName = ref('')
const month = ref((route.query.month as string)?.substring(0, 7) || '')

const expenseCategories = computed(() => categories.value.filter((c) => c.type === 'expense'))
const isFormValid = computed(() => selectedCategoryId.value && rawAmount.value > 0)

const handleSave = async () => {
  if (!isFormValid.value || !month.value) return
  const result = await createBudget(
    selectedCategoryId.value,
    month.value,
    rawAmount.value,
    budgetName.value || null,
  )
  if (!result.error) {
    router.push('/budget')
  }
}

onMounted(async () => {
  await fetchCategories()
  // Default to current month if not specified
  if (!month.value) {
    const d = new Date()
    month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl px-2" @click="router.push('/budget')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-4xl font-black tracking-tighter text-foreground">
        {{ $t('budget.set_budget') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">
        {{ $t('budget.subtitle') }}
      </p>
    </div>

    <!-- HERO AMOUNT CARD -->
    <div
      class="relative overflow-hidden rounded-3xl border border-border/50 bg-card/20 p-5 shadow-2xl transition-all hover:border-border/80 md:rounded-4xl md:p-8 backdrop-blur-md"
    >
      <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{{
        $t('budget.monthly_limit')
      }}</Label>
      <div class="mt-3 flex items-center gap-3 md:mt-4 md:gap-4">
        <div
          class="flex h-11 items-center justify-center rounded-xl bg-muted/50 px-4 text-base font-black text-foreground shadow-inner md:h-14 md:rounded-2xl md:px-5 md:text-xl"
        >
          {{ defaultCurrency }}
        </div>
        <CurrencyInput
          v-model="rawAmount"
          :currency="defaultCurrency"
          :placeholder="t('budget.monthly_limit')"
          class="h-auto w-full border-none bg-transparent py-0 text-4xl font-black tracking-tighter text-foreground outline-none shadow-none placeholder:text-muted-foreground/20 focus-visible:ring-0 md:text-6xl"
        />
      </div>
    </div>

    <div class="space-y-6 rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
      <div class="space-y-2">
        <Label>{{ $t('budget.month') }}</Label>
        <Input v-model="month" type="month" :disabled="true" class="bg-muted/30" />
      </div>

      <div class="space-y-2">
        <Label>{{ $t('categories.type_name') }}</Label>
        <Select v-model="selectedCategoryId">
          <SelectTrigger>
            <SelectValue :placeholder="t('categories.type_name')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
              <div class="flex items-center gap-2">
                <AppIcon
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
        <Label>{{ $t('budget.name_label') }}</Label>
        <Input
          v-model="budgetName"
          type="text"
          maxlength="100"
          :placeholder="t('budget.name_placeholder')"
        />
        <p class="text-xs text-muted-foreground">{{ $t('budget.name_hint') }}</p>
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
