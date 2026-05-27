<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ $t('funds_form.title') }}</DialogTitle>
        <DialogDescription>
          {{ $t('funds_form.subtitle', { name: goal.name }) }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4 pt-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label for="amount">{{ $t('funds_form.amount') }}</Label>
          <Input id="amount" v-model="amount" type="number" placeholder="0" required auto-focus />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="$emit('close')">
            {{ $t('funds_form.cancel') }}
          </Button>
          <Button type="submit" :disabled="!amount || Number(amount) <= 0">
            {{ $t('funds_form.add') }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Goal } from '~/composables/useGoals';

const props = defineProps<{
  goal: Goal;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const { addFunds } = useGoals();
const amount = ref('');

const onSubmit = async () => {
  const { error } = await addFunds(props.goal.id, Number(amount.value));
  if (!error) {
    emit('saved');
  }
};
</script>
