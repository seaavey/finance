<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold">{{ $t('categories.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('categories.count_suffix', { count: categories.length }) }}</p>
      </div>
      <Button @click="showForm = true">
        <HugeiconsIcon :icon="Add01Icon" :size="18" />
        {{ $t('common.add') }}
      </Button>
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="flex gap-2">
        <Skeleton class="h-8 w-28 rounded-lg" />
        <Skeleton class="h-8 w-28 rounded-lg" />
      </div>
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Skeleton class="h-16 rounded-xl" />
        <Skeleton class="h-16 rounded-xl" />
        <Skeleton class="h-16 rounded-xl" />
        <Skeleton class="h-16 rounded-xl" />
        <Skeleton class="h-16 rounded-xl" />
        <Skeleton class="h-16 rounded-xl" />
      </div>
    </div>

    <template v-else>
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          :class="activeTab === tab.value
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent'"
          @click="activeTab = tab.value"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <div v-if="filteredCategories.length === 0" class="flex flex-col items-center gap-3 py-12">
        <div class="flex size-12 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon :icon="GridViewIcon" :size="24" class="text-muted-foreground" />
        </div>
        <p class="text-sm text-muted-foreground">{{ activeTab === 'income' ? $t('categories.no_income') : $t('categories.no_expense') }}</p>
      </div>

      <Sortable
        v-else
        :list="filteredCategories"
        item-key="id"
        :options="{ handle: '.drag-handle', ghostClass: 'opacity-30', animation: 200 }"
        class="grid grid-cols-1 gap-2 md:grid-cols-2"
        @end="onReorder"
      >
        <template #item="{ element: cat }">
          <Card class="group transition-colors hover:bg-accent/50">
            <CardContent class="flex items-center justify-between p-3">
              <div class="flex items-center gap-3">
                <div class="drag-handle flex size-10 cursor-grab items-center justify-center rounded-xl active:cursor-grabbing" :style="{ backgroundColor: cat.color + '15' }">
                  <div class="size-4 rounded-full" :style="{ backgroundColor: cat.color }" />
                </div>
                <div>
                  <p class="text-sm font-medium">{{ cat.name }}</p>
                  <p class="text-[11px] text-muted-foreground">
                    {{ getCategoryStats(cat.id).count }} {{ $t('categories.transaction_suffix') }} · {{ formatCurrency(getCategoryStats(cat.id).total) }}
                  </p>
                </div>
              </div>
              <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  class="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                  @click="editCategory(cat)"
                >
                  <HugeiconsIcon :icon="PencilEdit01Icon" :size="16" />
                </button>
                <button
                  class="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  @click="confirmDelete(cat)"
                >
                  <HugeiconsIcon :icon="Delete01Icon" :size="16" />
                </button>
              </div>
            </CardContent>
          </Card>
        </template>
      </Sortable>
    </template>

    <CategoryForm
      v-if="showForm"
      :category="editingCategory"
      @close="showForm = false; editingCategory = undefined"
      @saved="onSaved"
    />

    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('categories.delete_title')"
      :description="$t('categories.delete_confirm', { name: deletingCategory?.name })"
      :confirm-text="$t('common.delete')"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Add01Icon, PencilEdit01Icon, Delete01Icon, GridViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Sortable } from 'sortablejs-vue3'
import type { Category } from '~/composables/useCategories'

const { t, locale } = useI18n()
const { categories, loading, incomeCategories, expenseCategories, fetchCategories, seedDefaults, deleteCategory } = useCategories()
const { transactions, fetchTransactions } = useTransactions()
const { user } = useAuth()
const { formatCurrency } = useCurrency()

const formatNumber = (n: number) => n.toLocaleString(locale.value)

const getCategoryStats = (catId: string) => {
  const txs = transactions.value.filter(t => t.category_id === catId)
  return {
    count: txs.length,
    total: txs.reduce((s, t) => s + t.amount, 0),
  }
}

const showForm = ref(false)
const editingCategory = ref<Category | undefined>()
const activeTab = ref<'income' | 'expense'>('expense')
const showDeleteDialog = ref(false)
const deletingCategory = ref<Category | undefined>()

const tabs = computed(() => [
  { value: 'expense' as const, label: t('categories.expense'), count: expenseCategories.value.length },
  { value: 'income' as const, label: t('categories.income'), count: incomeCategories.value.length },
])

const filteredCategories = computed(() =>
  activeTab.value === 'income' ? incomeCategories.value : expenseCategories.value
)

const onReorder = (evt: { oldIndex: number; newIndex: number }) => {
  const list = [...filteredCategories.value]
  const [moved] = list.splice(evt.oldIndex, 1)
  list.splice(evt.newIndex, 0, moved)
  const otherType = activeTab.value === 'income' ? expenseCategories.value : incomeCategories.value
  categories.value = activeTab.value === 'income' ? [...list, ...otherType] : [...otherType, ...list]
}

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchTransactions()])
  if (categories.value.length === 0 && user.value) {
    await seedDefaults(user.value.id)
  }
})

const editCategory = (cat: Category) => {
  editingCategory.value = cat
  showForm.value = true
}

const confirmDelete = (cat: Category) => {
  deletingCategory.value = cat
  showDeleteDialog.value = true
}

const onDelete = async () => {
  if (deletingCategory.value) {
    await deleteCategory(deletingCategory.value.id)
  }
  showDeleteDialog.value = false
  deletingCategory.value = undefined
}

const onSaved = () => {
  showForm.value = false
  editingCategory.value = undefined
}
</script>
