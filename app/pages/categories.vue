<template>
  <div class="mx-auto max-w-6xl space-y-8">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ $t('categories.title') }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">{{ $t('categories.subtitle') }}</p>
      </div>
      <Button
        class="flex items-center gap-2 rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-4 text-sm font-medium text-white transition hover:from-pink-400 hover:to-pink-500"
        @click="showForm = true"
      >
        <Icon name="hugeicons:add-01" :size="18" />
        <span class="hidden sm:inline">{{ $t('categories.add') }}</span>
      </Button>
    </div>

    <div v-if="loading" class="space-y-6">
      <div class="inline-flex rounded-2xl border border-border/50 bg-card/30 p-1">
        <Skeleton class="h-9 w-32 rounded-xl" />
        <Skeleton class="h-9 w-28 rounded-xl" />
      </div>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton class="h-22 rounded-3xl" />
        <Skeleton class="h-22 rounded-3xl" />
        <Skeleton class="h-22 rounded-3xl" />
        <Skeleton class="h-22 rounded-3xl" />
        <Skeleton class="h-22 rounded-3xl" />
        <Skeleton class="h-22 rounded-3xl" />
      </div>
    </div>

    <template v-else>
      <!-- TABS -->
      <div class="inline-flex rounded-2xl border border-border/50 bg-card/30 p-1">
        <Button
          v-for="tab in tabs"
          :key="tab.value"
          :variant="activeTab === tab.value ? 'default' : 'outline'"
          size="sm"
          @click="activeTab = tab.value"
        >
          {{ tab.label }} ({{ tab.count }})
        </Button>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="filteredCategories.length === 0" class="flex flex-col items-center gap-4 py-16">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-card/30">
          <Icon name="hugeicons:grid-view" :size="24" class="text-muted-foreground/60" />
        </div>
        <div class="text-center">
          <p class="font-medium">{{ $t('categories.empty') }}</p>
          <p class="mt-0.5 text-sm text-muted-foreground">{{ $t('categories.empty_desc') }}</p>
        </div>
      </div>

      <!-- CATEGORY GRID -->
      <Sortable
        v-else
        :list="filteredCategories"
        item-key="id"
        :options="{ handle: '.drag-handle', ghostClass: 'opacity-20', animation: 250 }"
        class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
        @end="onReorder"
      >
        <template #item="{ element: cat }">
          <div
            class="group flex items-center justify-between rounded-3xl border border-border/50 bg-card/30 p-4 transition-all duration-200 hover:border-border/80 hover:bg-card/60"
          >
            <div class="flex items-center gap-4">
              <div
                class="drag-handle flex size-12 cursor-grab items-center justify-center rounded-2xl active:cursor-grabbing"
                :style="{ backgroundColor: cat.color + '15' }"
              >
                <div class="size-3.5 rounded-full" :style="{ backgroundColor: cat.color }" />
              </div>
              <div>
                <h3 class="font-medium">{{ cat.name }}</h3>
                <p class="text-sm text-muted-foreground">
                  {{ (categoryStats.get(cat.id) ?? { count: 0, total: 0 }).count }} transaksi · Rp
                  {{
                    (categoryStats.get(cat.id) ?? { count: 0, total: 0 }).total.toLocaleString(
                      'id-ID',
                    )
                  }}
                </p>
              </div>
            </div>
            <div
              class="flex gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              <Button variant="ghost" size="icon" @click="editCategory(cat)">
                <Icon name="hugeicons:pencil-edit-01" :size="16" />
              </Button>
              <Button variant="ghost" size="icon" @click="confirmDelete(cat)">
                <Icon name="hugeicons:delete-01" :size="16" />
              </Button>
            </div>
          </div>
        </template>
      </Sortable>
    </template>

    <CategoryForm
      v-if="showForm"
      :category="editingCategory"
      @close="
        showForm = false;
        editingCategory = undefined;
      "
      @saved="onSaved"
    />

    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('categories.delete_title')"
      :description="`${t('categories.delete_confirm')} &quot;${deletingCategory?.name}&quot;? Tindakan ini tidak bisa dibatalkan.`"
      :confirm-text="$t('categories.delete_action')"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Sortable } from 'sortablejs-vue3';
import type { Category } from '~/composables/useCategories';

const { t } = useI18n();

const {
  categories,
  loading,
  incomeCategories,
  expenseCategories,
  fetchCategories,
  seedDefaults,
  deleteCategory,
} = useCategories();
const { transactions, fetchTransactions } = useTransactions();
const { user } = useAuth();

const categoryStats = computed(() => {
  const map = new Map<string, { count: number; total: number }>();
  for (const tx of transactions.value) {
    if (!tx.category_id) {
      continue;
    }
    const existing = map.get(tx.category_id);
    if (existing) {
      existing.count++;
      existing.total += tx.amount;
    } else {
      map.set(tx.category_id, { count: 1, total: tx.amount });
    }
  }
  return map;
});

const showForm = ref(false);
const editingCategory = ref<Category | undefined>();
const activeTab = ref<'income' | 'expense'>('expense');
const showDeleteDialog = ref(false);
const deletingCategory = ref<Category | undefined>();

const tabs = computed(() => [
  {
    value: 'expense' as const,
    label: t('categories.expense'),
    count: expenseCategories.value.length,
  },
  { value: 'income' as const, label: t('categories.income'), count: incomeCategories.value.length },
]);

const filteredCategories = computed(() =>
  activeTab.value === 'income' ? incomeCategories.value : expenseCategories.value,
);

const onReorder = (evt: { oldIndex: number; newIndex: number }) => {
  const list = [...filteredCategories.value];
  const [moved] = list.splice(evt.oldIndex, 1);
  if (!moved) {
    return;
  }
  list.splice(evt.newIndex, 0, moved);
  const otherType = activeTab.value === 'income' ? expenseCategories.value : incomeCategories.value;
  categories.value =
    activeTab.value === 'income' ? [...list, ...otherType] : [...otherType, ...list];
};

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchTransactions()]);
  if (categories.value.length === 0 && user.value) {
    await seedDefaults(user.value.id);
  }
});

const editCategory = (cat: Category) => {
  editingCategory.value = cat;
  showForm.value = true;
};

const confirmDelete = (cat: Category) => {
  deletingCategory.value = cat;
  showDeleteDialog.value = true;
};

const onDelete = async () => {
  if (deletingCategory.value) {
    await deleteCategory(deletingCategory.value.id);
  }
  showDeleteDialog.value = false;
  deletingCategory.value = undefined;
};

const onSaved = () => {
  showForm.value = false;
  editingCategory.value = undefined;
};
</script>
