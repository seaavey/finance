<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{
          goal ? $t('goal_form.title_edit') : $t('goal_form.title_new')
        }}</DialogTitle>
        <DialogDescription>
          {{ goal ? $t('goal_form.subtitle_edit') : $t('goal_form.subtitle') }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label for="name">{{ $t('goal_form.name') }}</Label>
          <Input
            id="name"
            v-model="form.name"
            :placeholder="$t('goal_form.name_placeholder')"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="target_amount">{{ $t('goal_form.target_amount') }}</Label>
          <Input
            id="target_amount"
            v-model="form.target_amount"
            type="number"
            placeholder="0"
            required
          />
        </div>

        <!-- CALENDAR INPUT -->
        <div class="space-y-2">
          <Label for="deadline">{{ $t('goal_form.deadline') }}</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="
                  cn(
                    'w-full justify-between px-3 font-normal',
                    !form.deadline && 'text-muted-foreground',
                  )
                "
              >
                {{
                  form.deadline
                    ? df.format(calendarDate!.toDate(getLocalTimeZone()))
                    : $t('goal_form.deadline')
                }}
                <HugeiconsIcon :icon="Calendar01Icon" :size="16" class="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="calendarDate" initial-focus />
            </PopoverContent>
          </Popover>
        </div>

        <div class="space-y-2">
          <Label>{{ $t('goal_form.color') }}</Label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              class="size-8 rounded-full border-2 transition-transform"
              :class="form.color === color ? 'scale-110 border-foreground' : 'border-transparent'"
              :style="{ backgroundColor: color }"
              @click="form.color = color"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="$emit('close')">
            {{ $t('goal_form.cancel') }}
          </Button>
          <Button type="submit" :disabled="!form.name || !form.target_amount">
            {{ $t('goal_form.save') }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue';
import { Calendar01Icon } from '@hugeicons/core-free-icons';
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date';
import type { Goal } from '~/composables/useGoals';
import { cn } from '~/lib/utils';

const props = defineProps<{
  goal?: Goal;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const { t, locale } = useI18n();
const { addGoal, updateGoal } = useGoals();

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', {
  dateStyle: 'long',
});

const colorOptions = [
  '#ec4899',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#06b6d4',
  '#10b981',
  '#ef4444',
  '#f97316',
  '#14b8a6',
  '#6366f1',
  '#f43f5e',
  '#84cc16',
];

const form = reactive({
  name: props.goal?.name ?? '',
  target_amount: props.goal?.target_amount ?? '',
  deadline: props.goal?.deadline ?? '',
  color: props.goal?.color ?? '#ec4899',
  icon: props.goal?.icon ?? 'target',
});

const calendarDate = computed({
  get: () => (form.deadline ? parseDate(form.deadline) : undefined),
  set: (val) => {
    if (val) {
      form.deadline = val.toString();
    }
  },
});

const onSubmit = async () => {
  if (props.goal) {
    await updateGoal(props.goal.id, {
      name: form.name,
      target_amount: Number(form.target_amount),
      deadline: form.deadline || null,
      color: form.color,
    });
  } else {
    await addGoal({
      name: form.name,
      target_amount: Number(form.target_amount),
      deadline: form.deadline || null,
      color: form.color,
      icon: form.icon,
    });
  }
  emit('saved');
};
</script>
