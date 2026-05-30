<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { BudgetWithProgress } from '~/composables/useBudgets';

definePageMeta({});

const { t, locale } = useI18n();
const seoTitle = computed(() => t('budget.title'));
useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
});

const { categories, fetchCategories } = useCategories();
const { loading, fetchBudgetWithProgress, deleteBudget } = useBudgets();

const budgetList = ref<BudgetWithProgress[]>([]);
const showForm = ref(false);
const editingBudget = ref<BudgetWithProgress | null>(null);
const showDeleteDialog = ref(false);
const deletingBudget = ref<BudgetWithProgress | null>(null);

// Month Navigation
const selectedDate = ref(new Date());
const currentMonthStr = computed(() => {
  const d = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1);
  return d.toISOString().slice(0, 10);
});

const monthLabel = computed(() => {
  return selectedDate.value.toLocaleDateString(locale.value, {
    month: 'long',
    year: 'numeric',
  });
});

const changeMonth = async (delta: number) => {
  const d = new Date(selectedDate.value);
  d.setMonth(d.getMonth() + delta);
  selectedDate.value = d;
  await loadBudget();
};

const loadData = async () => {
  await fetchCategories();
  await loadBudget();
};

const loadBudget = async () => {
  budgetList.value = await fetchBudgetWithProgress(currentMonthStr.value);
};

onMounted(() => {
  loadData();
});

const onAddBudget = () => {
  editingBudget.value = null;
  showForm.value = true;
};

const onEditBudget = (budget: BudgetWithProgress) => {
  editingBudget.value = budget;
  showForm.value = true;
};

const onDeleteRequest = (budget: BudgetWithProgress) => {
  deletingBudget.value = budget;
  showDeleteDialog.value = true;
};

const onDeleteConfirm = async () => {
  if (!deletingBudget.value) {
    return;
  }
  await deleteBudget(deletingBudget.value.id, currentMonthStr.value);
  await loadBudget();
  showDeleteDialog.value = false;
  deletingBudget.value = null;
};

const onFormSaved = async () => {
  await loadBudget();
};

const expenseCategories = computed(() => categories.value.filter((c) => c.type === 'expense'));
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-foreground">
          {{ $t('budget.title') }}
        </h1>
        <p class="mt-1 font-medium text-muted-foreground">{{ $t('budget.subtitle') }}</p>
      </div>
      <Button
        class="flex h-11 items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:from-primary/80 hover:to-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        @click="onAddBudget"
      >
        <Icon name="hugeicons:add-01" :size="20" />
        <span>{{ $t('budget.set_budget') }}</span>
      </Button>
    </div>

    <!-- MONTH SELECTOR -->
    <div
      class="flex items-center justify-between rounded-3xl border border-border/50 bg-card/30 p-2 shadow-sm backdrop-blur-md"
    >
      <Button variant="ghost" size="icon" class="rounded-2xl" @click="changeMonth(-1)">
        <Icon name="hugeicons:arrow-left-01" :size="20" />
      </Button>
      <span class="text-sm font-black uppercase tracking-widest text-foreground">
        {{ monthLabel }}
      </span>
      <Button variant="ghost" size="icon" class="rounded-2xl" @click="changeMonth(1)">
        <Icon name="hugeicons:arrow-right-01" :size="20" />
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="i in 6" :key="i" class="h-40 w-full rounded-4xl bg-muted/50" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="budgetList.length === 0"
      class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 py-24 text-center"
    >
      <div
        class="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50 shadow-inner"
      >
        <Icon name="hugeicons:wallet-03" :size="40" class="text-muted-foreground/40" />
      </div>
      <h3 class="text-xl font-black tracking-tight text-foreground">
        {{ $t('budget.no_budgets') }}
      </h3>
      <p class="mt-2 max-w-xs text-sm font-medium text-muted-foreground">
        {{ $t('budget.empty') }}
      </p>
      <Button
        variant="outline"
        class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
        @click="onAddBudget"
      >
        {{ $t('budget.set_budget') }}
      </Button>
    </div>

    <!-- Budget List -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <BudgetCard
        v-for="budget in budgetList"
        :key="budget.id"
        :budget="budget"
        @edit="onEditBudget"
        @delete="onDeleteRequest"
      />
    </div>

    <!-- Budget Form Dialog -->
    <BudgetForm
      v-model:open="showForm"
      :budget="editingBudget"
      :categories="expenseCategories"
      :month="currentMonthStr"
      @saved="onFormSaved"
    />

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('budget.delete_budget')"
      :description="`${$t('budget.delete_budget')} &quot;${deletingBudget?.category_name}&quot;?`"
      :confirm-text="$t('common.delete')"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>
