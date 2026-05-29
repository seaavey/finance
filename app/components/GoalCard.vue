<template>
  <div
    class="group flex flex-col rounded-3xl border border-border/50 bg-card/30 p-5 transition-all hover:border-border hover:bg-card/50"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <div
          class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
          :style="!goal.image_url ? { backgroundColor: (goal.color || '#ec4899') + '20' } : {}"
        >
          <AspectRatio v-if="goal.image_url" :ratio="16 / 9" class="overflow-hidden rounded-xl">
            <img :src="goal.image_url" :alt="goal.name" class="h-full w-full object-cover" />
          </AspectRatio>
          <div
            v-else
            class="size-3 rounded-full"
            :style="{ backgroundColor: goal.color || '#ec4899' }"
          />
        </div>
        <div>
          <h3 class="font-semibold text-foreground md:text-lg">{{ goal.name }}</h3>
          <p v-if="goal.deadline" class="text-sm text-muted-foreground">
            {{ $t('goals.deadline') }}: {{ formattedDate }}
          </p>
        </div>
      </div>
      <div class="flex gap-1">
        <Button variant="ghost" size="icon-sm" class="rounded-full" @click="$emit('edit', goal)">
          <Icon name="hugeicons:pencil-edit-01" :size="16" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          class="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          @click="$emit('delete', goal.id)"
        >
          <Icon name="hugeicons:delete-01" :size="16" />
        </Button>
      </div>
    </div>

    <div class="mt-6">
      <div class="flex justify-between text-sm mb-2">
        <span class="text-muted-foreground"> {{ formattedCurrent }} / {{ formattedTarget }} </span>
        <span class="font-medium" :style="{ color: goal.color }"> {{ percentage }}% </span>
      </div>

      <!-- Progress Bar Shadcn -->
      <Progress :model-value="percentage" class="h-3">
        <template #indicator>
          <div
            class="h-full w-full transition-all duration-500 ease-out"
            :style="{
              backgroundColor: goal.color || '#ec4899',
              transform: `translateX(-${100 - Math.min(percentage, 100)}%)`,
            }"
          />
        </template>
      </Progress>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <div class="text-xs text-muted-foreground">
        <template v-if="percentage >= 100">
          <span class="font-medium text-emerald-500 flex items-center gap-1">
            <Icon name="hugeicons:tick-01" :size="14" />
            {{ $t('goals.completed') }}
          </span>
        </template>
        <template v-else> {{ $t('goals.remaining') }}: {{ formattedRemaining }} </template>
      </div>

      <Button
        size="sm"
        class="rounded-full gap-2"
        variant="secondary"
        @click="$emit('add-funds', goal)"
      >
        <Icon name="hugeicons:add-01" :size="16" />
        {{ $t('goals.add_funds') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AspectRatio } from '@/components/ui/aspect-ratio';
import type { Goal } from '~/composables/useGoals';

const props = defineProps<{
  goal: Goal;
}>();

defineEmits<{
  'add-funds': [goal: Goal];
  edit: [goal: Goal];
  delete: [id: string];
}>();

const { formatCurrency } = useCurrency();

const percentage = computed(() => {
  if (!props.goal.target_amount || props.goal.target_amount <= 0) {
    return 0;
  }
  return Math.round((props.goal.current_amount / props.goal.target_amount) * 100);
});

const formattedCurrent = computed(() => formatCurrency(Number(props.goal.current_amount)));
const formattedTarget = computed(() => formatCurrency(Number(props.goal.target_amount)));
const formattedRemaining = computed(() => {
  const remaining = Math.max(0, props.goal.target_amount - props.goal.current_amount);
  return formatCurrency(remaining);
});

const formattedDate = computed(() => {
  if (!props.goal.deadline) {
    return '';
  }
  const d = new Date(props.goal.deadline);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
});
</script>
