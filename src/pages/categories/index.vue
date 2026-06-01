<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-foreground">
          {{ $t('categories.title')}}
        </h1>
        <p class="mt-1 font-medium text-muted-foreground">{{ $t('categories.subtitle')}}</p>
      </div>
      <Button
        class="flex h-11 items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:from-primary/80 hover:to-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        @click="router.push('/categories/new')"
      >
        <AppIcon name="hugeicons:add-01" :size="20" />
        <span>{{ $t('categories.add')}}</span>
      </Button>
    </div>

    <!-- TABS -->
    <div
      class="inline-flex rounded-2xl border border-border/50 bg-card/30 p-1 shadow-sm backdrop-blur-md"
    >
      <Button
        v-for="tab in tabs"
        :key="tab.value"
        :variant="activeTab === tab.value ? 'default' : 'ghost'"
        size="sm"
        class="rounded-xl px-6 transition-all duration-300"
        :class="activeTab === tab.value ? 'shadow-sm' : 'text-muted-foreground'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span class="ml-1.5 opacity-60">({{ tab.count }})</span>
      </Button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="i in 6"
        :key="i"
        class="flex animate-pulse items-center gap-4 rounded-4xl border border-border/50 bg-card p-4"
      >
        <Skeleton class="size-12 shrink-0 rounded-2xl bg-muted/50" />
        <div class="min-w-0 flex-1 space-y-2">
          <Skeleton class="h-4 w-32 rounded-md bg-muted/50" />
          <Skeleton class="h-3 w-48 rounded-md bg-muted/50" />
        </div>
        <Skeleton class="size-8 rounded-xl bg-muted/50" />
      </div>
    </div>

    <template v-else>
      <!-- EMPTY STATE -->
      <div
        v-if="filteredCategories.length === 0"
        class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 py-24 text-center"
      >
        <div
          class="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50 shadow-inner"
        >
          <AppIcon name="hugeicons:grid-view" :size="40" class="text-muted-foreground/40" />
        </div>
        <h3 class="text-xl font-black tracking-tight text-foreground">
          {{ $t('categories.empty')}}
        </h3>
        <p class="mt-2 max-w-xs text-sm font-medium text-muted-foreground">
          {{ $t('categories.empty_desc')}}
        </p>
        <Button
          variant="outline"
          class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
          @click="router.push('/categories/new')"
        >
          {{ $t('categories.add')}}
        </Button>
      </div>

      <!-- CATEGORY GRID -->
      <Sortable
        v-else
        :list="filteredCategories"
        item-key="id"
        :options="{ handle: '.drag-handle', ghostClass: 'opacity-20', animation: 250 }"
        class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        @end="onReorder"
      >
        <template #item="{ element: cat }">
          <div
            class="group flex items-center justify-between rounded-4xl border border-border/50 bg-card p-4 transition-all duration-200 hover:border-border/80 hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="drag-handle flex size-12 cursor-grab items-center justify-center rounded-2xl active:cursor-grabbing transition-transform group-hover:scale-105"
                :style="{ backgroundColor: cat.color + '15' }"
              >
                <div
                  class="size-3.5 rounded-full shadow-sm"
                  :style="{ backgroundColor: cat.color }"
                />
              </div>
              <div>
                <h3 class="font-bold text-foreground">{{ cat.name }}</h3>
                <p class="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-tight">
                  {{
                    $t('categories.transaction_count', {
                      count: (categoryStats.get(cat.id) ?? { count: 0, total: 0 }).count,
                    })
                  }}
                  · Rp
                  {{
                    (categoryStats.get(cat.id) ?? { count: 0, total: 0 }).total.toLocaleString(
                      locale,
                    )
                  }}
                </p>
              </div>
            </div>
            <div class="flex gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                class="size-9 rounded-xl hover:bg-muted"
                @click="router.push(`/categories/${cat.id}/edit`)"
              >
                <AppIcon name="hugeicons:pencil-edit-01" :size="16" class="text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="size-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500"
                @click="confirmDelete(cat)"
              >
                <AppIcon name="hugeicons:delete-01" :size="16" />
              </Button>
            </div>
          </div>
        </template>
      </Sortable>
    </template>

    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('categories.delete_title')"
      :description="`${t('categories.delete_confirm')} &quot;${deletingCategory?.name}&quot;? ${t('categories.delete_confirm_suffix')}`"
      :confirm-text="$t('categories.delete_action')"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PagesCategoriesIndex',
})
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sortable } from 'sortablejs-vue3';
import type { Category } from '@/composables/useCategories';

const router = useRouter();
const { t, locale } = useI18n();

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
    if (!tx.category_id) continue;
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
  if (!moved) return;
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
</script>
