<script setup lang="ts">
import type { BudgetWithProgress } from '~/composables/useBudgets';

definePageMeta({});

const { t } = useI18n();
const seoTitle = computed(() => t('budget.title'));
useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
});
const { categories, fetchCategories } = useCategories();

const now = new Date();
const currentMonth = computed(() => {
  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  return d.toISOString().slice(0, 10);
});

const { loading, fetchBudgetWithProgress, deleteBudget } = useBudgets();

const budgetList = ref<BudgetWithProgress[]>([]);
const showForm = ref(false);
const editingBudget = ref<BudgetWithProgress | null>(null);
const showDeleteDialog = ref(false);
const deletingBudget = ref<BudgetWithProgress | null>(null);

const loadData = async () => {
  await fetchCategories();
  budgetList.value = await fetchBudgetWithProgress(currentMonth.value);
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
  await deleteBudget(deletingBudget.value.id, currentMonth.value);
  budgetList.value = await fetchBudgetWithProgress(currentMonth.value);
  showDeleteDialog.value = false;
  deletingBudget.value = null;
};

const onFormSaved = async () => {
  budgetList.value = await fetchBudgetWithProgress(currentMonth.value);
};

const expenseCategories = computed(() => categories.value.filter((c) => c.type === 'expense'));
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ $t('budget.title') }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">{{ $t('budget.subtitle') }}</p>
      </div>
      <Button
        class="flex items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-4 text-sm font-medium text-white transition hover:from-primary/80 hover:to-primary/90"
        @click="onAddBudget"
      >
        <Icon name="hugeicons:add-01" :size="18" />
        <span class="hidden sm:inline">{{ $t('budget.set_budget') }}</span>
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-28 w-full rounded-4xl" />
      <Skeleton class="h-28 w-full rounded-4xl" />
      <Skeleton class="h-28 w-full rounded-4xl" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="budgetList.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <div class="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
        <Icon name="hugeicons:wallet-03" :size="32" class="text-muted-foreground" />
      </div>
      <p class="text-sm font-medium text-muted-foreground">{{ $t('budget.no_budgets') }}</p>
      <Button variant="outline" size="sm" class="mt-4" @click="onAddBudget">
        {{ $t('budget.set_budget') }}
      </Button>
    </div>

    <!-- Budget List -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
      :month="currentMonth"
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
