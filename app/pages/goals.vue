<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Goal } from '~/composables/useGoals';

const { goals, loading, fetchGoals, deleteGoal } = useGoals();

const showForm = ref(false);
const editingGoal = ref<Goal | undefined>();
const showFundsDialog = ref(false);
const selectedGoal = ref<Goal | undefined>();
const showDeleteDialog = ref(false);
const goalToDelete = ref<string | null>(null);

onMounted(() => {
  fetchGoals();
});

const openEditForm = (goal: Goal) => {
  editingGoal.value = goal;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingGoal.value = undefined;
};

const onSaved = () => {
  closeForm();
};

const openFundsDialog = (goal: Goal) => {
  selectedGoal.value = goal;
  showFundsDialog.value = true;
};

const closeFundsDialog = () => {
  showFundsDialog.value = false;
  selectedGoal.value = undefined;
};

const onFundsSaved = () => {
  closeFundsDialog();
};

const confirmDelete = (id: string) => {
  goalToDelete.value = id;
  showDeleteDialog.value = true;
};

const onDelete = async () => {
  if (goalToDelete.value) {
    await deleteGoal(goalToDelete.value);
    goalToDelete.value = null;
  }
};
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-foreground">
          {{ $t('goals.title') }}
        </h1>
        <p class="mt-1 font-medium text-muted-foreground">{{ $t('goals.subtitle') }}</p>
      </div>
      <Button
        class="flex h-11 items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:from-primary/80 hover:to-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        @click="showForm = true"
      >
        <Icon name="hugeicons:add-01" :size="20" />
        <span>{{ $t('goals.add') }}</span>
      </Button>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="i in 6" :key="i" class="h-64 rounded-4xl bg-muted/50" />
    </div>

    <template v-else>
      <!-- EMPTY STATE -->
      <div
        v-if="goals.length === 0"
        class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 py-24 text-center"
      >
        <div class="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50 shadow-inner">
          <Icon name="hugeicons:target-02" :size="40" class="text-muted-foreground/40" />
        </div>
        <h3 class="text-xl font-black tracking-tight text-foreground">{{ $t('goals.empty') }}</h3>
        <p class="mt-2 max-w-xs text-sm font-medium text-muted-foreground">
          {{ $t('goals.empty_desc') }}
        </p>
        <Button
          variant="outline"
          class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
          @click="showForm = true"
        >
          {{ $t('goals.add') }}
        </Button>
      </div>

      <!-- GOALS GRID -->
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <GoalCard
          v-for="goal in goals"
          :key="goal.id"
          :goal="goal"
          @add-funds="openFundsDialog"
          @edit="openEditForm"
          @delete="confirmDelete"
        />
      </div>
    </template>

    <!-- FORM DIALOG -->
    <GoalForm v-if="showForm" :goal="editingGoal" @close="closeForm" @saved="onSaved" />

    <!-- ADD FUNDS DIALOG -->
    <AddFundsDialog
      v-if="showFundsDialog && selectedGoal"
      :goal="selectedGoal"
      @close="closeFundsDialog"
      @saved="onFundsSaved"
    />

    <!-- DELETE CONFIRMATION -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('goals.delete_title')"
      :description="$t('goals.delete_confirm')"
      :confirm-text="$t('goals.delete_action')"
      @confirm="onDelete"
    />
  </div>
</template>
