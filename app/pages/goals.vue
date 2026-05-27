<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-20">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ $t('goals.title') }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">{{ $t('goals.subtitle') }}</p>
      </div>
      <Button
        class="flex items-center gap-2 rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-4 text-sm font-medium text-white transition hover:from-pink-400 hover:to-pink-500"
        @click="showForm = true"
      >
        <HugeiconsIcon :icon="Add01Icon" :size="18" />
        <span class="hidden sm:inline">{{ $t('goals.add') }}</span>
      </Button>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="i in 3" :key="i" class="h-48 rounded-3xl" />
    </div>

    <template v-else>
      <!-- EMPTY STATE -->
      <div v-if="goals.length === 0" class="flex flex-col items-center gap-4 py-16">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-card/30">
          <HugeiconsIcon :icon="Target01Icon" :size="24" class="text-muted-foreground/60" />
        </div>
        <div class="text-center max-w-sm">
          <p class="font-medium">{{ $t('goals.empty') }}</p>
          <p class="mt-0.5 text-sm text-muted-foreground">
            {{ $t('goals.empty_desc') }}
          </p>
        </div>
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

<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue';
import { Add01Icon, Target01Icon } from '@hugeicons/core-free-icons';
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
