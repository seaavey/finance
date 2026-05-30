<template>
  <div class="mx-auto max-w-6xl space-y-8">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ $t('recurring.title') }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ recurring.length }} {{ $t('recurring.schedule_active') }}
        </p>
      </div>
      <Button
        class="flex items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-4 text-sm font-medium text-white transition hover:from-primary/80 hover:to-primary/90"
        @click="showForm = true"
      >
        <Icon name="hugeicons:add-01" :size="18" />
        <span class="hidden sm:inline">{{ $t('topbar.add') }}</span>
      </Button>
    </div>

    <!-- STATS -->
    <div v-if="!loading && recurring.length > 0" class="grid grid-cols-2 gap-4">
      <div class="rounded-4xl border border-red-500/10 bg-red-500/[0.07] p-5">
        <p class="text-sm text-red-400/70">{{ $t('recurring.expense') }}</p>
        <h3 class="mt-2 text-2xl font-bold text-red-400">{{ formatCurrency(monthlyExpense) }}</h3>
      </div>
      <div class="rounded-4xl border border-emerald-500/10 bg-emerald-500/[0.07] p-5">
        <p class="text-sm text-emerald-400/70">{{ $t('recurring.income') }}</p>
        <h3 class="mt-2 text-2xl font-bold text-emerald-400">
          {{ formatCurrency(monthlyIncome) }}
        </h3>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-[104px] rounded-4xl" />
      <Skeleton class="h-[104px] rounded-4xl" />
      <Skeleton class="h-[104px] rounded-4xl" />
    </div>

    <!-- EMPTY STATE -->
    <div
      v-else-if="recurring.length === 0"
      class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 px-6 py-16"
    >
      <div class="flex size-16 items-center justify-center rounded-full bg-card/30">
        <Icon name="hugeicons:repeat" :size="28" class="text-muted-foreground/60" />
      </div>
      <h3 class="mt-5 text-lg font-medium">{{ $t('recurring.empty') }}</h3>
      <p class="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        {{ $t('recurring.empty_desc') }}
      </p>
      <Button variant="default" class="mt-6" @click="showForm = true">
        {{ $t('recurring.add') }}
      </Button>
    </div>

    <!-- LIST -->
    <div v-else class="space-y-3">
      <div
        v-for="item in recurring"
        :key="item.id"
        class="group flex items-center justify-between rounded-4xl border border-border/50 bg-card/30 p-5 transition-all duration-200"
        :class="item.active ? 'hover:border-border/80 hover:bg-card/60' : 'opacity-50'"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex size-14 items-center justify-center rounded-2xl"
            :class="item.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'"
          >
            <Icon
              :name="item.type === 'income' ? 'hugeicons:arrow-down-01' : 'hugeicons:arrow-up-01'"
              :size="24"
              :class="item.type === 'income' ? 'text-emerald-400' : 'text-red-400'"
            />
          </div>
          <div>
            <h3 class="font-medium">
              {{
                item.description || categoryName(item.category_id) || $t('recurring.no_description')
              }}
            </h3>
            <div class="mt-1.5 flex items-center gap-2">
              <span class="rounded-lg bg-card/50 px-2 py-0.5 text-xs text-muted-foreground">
                {{ frequencyLabel(item.frequency) }}
              </span>
              <span class="text-xs text-muted-foreground/60">
                {{ formatNextDate(item.next_date) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-xs text-muted-foreground/60">{{ $t('recurring.amount') }}</p>
            <p
              class="text-lg font-semibold"
              :class="item.type === 'income' ? 'text-emerald-400' : 'text-red-400'"
            >
              {{ item.type === 'income' ? '+' : '-'
              }}{{ formatCurrency(Number(item.amount), item.currency) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Switch :checked="item.active" @update:checked="toggleActive(item.id, $event)" />
            <Button variant="ghost" size="icon" @click="editItem(item)">
              <Icon name="hugeicons:pencil-edit-01" :size="16" />
            </Button>
            <Button variant="ghost" size="icon" @click="onDelete(item)">
              <Icon name="hugeicons:delete-01" :size="16" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <RecurringForm
      v-if="showForm"
      :item="editingItem"
      @close="
        showForm = false;
        editingItem = undefined;
      "
      @saved="onSaved"
    />

    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('recurring.delete_title')"
      :description="deleteDescription"
      :confirm-text="$t('confirm.delete')"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { RecurringTransaction } from '~/composables/useRecurring';

const { recurring, loading, fetchRecurring, toggleActive, deleteRecurring } = useRecurring();
const { categories, fetchCategories } = useCategories();
const { formatCurrency } = useCurrency();
const { t, locale } = useI18n();

const showForm = ref(false);
const editingItem = ref<RecurringTransaction | undefined>();

const monthlyExpense = computed(() =>
  recurring.value
    .filter((r) => r.type === 'expense' && r.active)
    .reduce((s, r) => {
      if (r.frequency === 'daily') {
        return s + r.amount * 30;
      }
      if (r.frequency === 'weekly') {
        return s + r.amount * 4;
      }
      if (r.frequency === 'yearly') {
        return s + r.amount / 12;
      }
      return s + r.amount;
    }, 0),
);

const monthlyIncome = computed(() =>
  recurring.value
    .filter((r) => r.type === 'income' && r.active)
    .reduce((s, r) => {
      if (r.frequency === 'daily') {
        return s + r.amount * 30;
      }
      if (r.frequency === 'weekly') {
        return s + r.amount * 4;
      }
      if (r.frequency === 'yearly') {
        return s + r.amount / 12;
      }
      return s + r.amount;
    }, 0),
);

const categoryMap = computed(() => {
  const map = new Map<string, string>();
  for (const cat of categories.value) {
    map.set(cat.id, cat.name);
  }
  return map;
});

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchRecurring()]);
});

const categoryName = (id: string | null) => {
  if (!id) {
    return '';
  }
  return categoryMap.value.get(id) ?? '';
};

const frequencyLabel = (f: string) => {
  const map: Record<string, string> = {
    daily: t('recurring.daily'),
    weekly: t('recurring.weekly'),
    monthly: t('recurring.monthly'),
    yearly: t('recurring.yearly'),
  };
  return map[f] ?? f;
};

const formatNextDate = (date: string) => {
  const d = new Date(date);
  const today = new Date();
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) {
    return t('recurring.today');
  }
  if (diff === 1) {
    return t('recurring.tomorrow');
  }
  if (diff < 7) {
    return `${diff} ${t('recurring.days_left')}`;
  }
  return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' });
};

const showDeleteDialog = ref(false);
const deletingItem = ref<RecurringTransaction | undefined>();

const deleteDescription = computed(() => {
  const name = deletingItem.value?.description || t('recurring.no_description');
  return `${t('recurring.delete_confirm')} "${name}"?`;
});

const editItem = (item: RecurringTransaction) => {
  editingItem.value = item;
  showForm.value = true;
};

const onDelete = (item: RecurringTransaction) => {
  deletingItem.value = item;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (deletingItem.value) {
    await deleteRecurring(deletingItem.value.id);
  }
  showDeleteDialog.value = false;
  deletingItem.value = undefined;
};

const onSaved = () => {
  showForm.value = false;
  editingItem.value = undefined;
};
</script>
