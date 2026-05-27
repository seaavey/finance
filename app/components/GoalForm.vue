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
          <Label>{{ $t('goal_form.image') }}</Label>
          <div class="relative">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="hidden"
              @change="onFileSelect"
            />
            <button
              v-if="!imagePreview"
              type="button"
              class="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border/50 bg-muted/20 px-4 py-8 transition-colors hover:border-border hover:bg-muted/40"
              @click="fileInputRef?.click()"
            >
              <HugeiconsIcon :icon="Image01Icon" :size="32" class="text-muted-foreground" />
              <span class="text-sm text-muted-foreground">{{
                $t('goal_form.image_placeholder')
              }}</span>
            </button>
            <div v-else class="relative">
              <img :src="imagePreview" alt="Preview" class="h-40 w-full rounded-xl object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                class="absolute right-2 top-2 rounded-full"
                @click="removeImage"
              >
                <HugeiconsIcon :icon="Delete01Icon" :size="14" />
                {{ $t('goal_form.image_remove') }}
              </Button>
            </div>
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
import { Calendar01Icon, Image01Icon, Delete01Icon } from '@hugeicons/core-free-icons';
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

const fileInputRef = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string>(props.goal?.image_url ?? '');
const selectedFile = ref<File | null>(null);

const form = reactive({
  name: props.goal?.name ?? '',
  target_amount: props.goal?.target_amount ?? '',
  deadline: props.goal?.deadline ?? '',
  color: props.goal?.color ?? '#ec4899',
  icon: props.goal?.icon ?? 'target',
  image_url: props.goal?.image_url ?? null,
});

const onFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    const { toast } = useToast();
    toast.error('Max 5MB');
    return;
  }

  selectedFile.value = file;
  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.value = reader.result as string;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  selectedFile.value = null;
  imagePreview.value = '';
  form.image_url = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const calendarDate = computed({
  get: () => (form.deadline ? parseDate(form.deadline) : undefined),
  set: (val) => {
    if (val) {
      form.deadline = val.toString();
    }
  },
});

const onSubmit = async () => {
  let imageUrl = form.image_url;

  if (selectedFile.value) {
    const url = await uploadGoalImage(selectedFile.value);
    if (url) {
      if (props.goal?.image_url) {
        deleteGoalImage(props.goal.image_url);
      }
      imageUrl = url;
    }
  }

  if (props.goal) {
    await updateGoal(props.goal.id, {
      name: form.name,
      target_amount: Number(form.target_amount),
      deadline: form.deadline || null,
      color: form.color,
      image_url: imageUrl,
    });
  } else {
    await addGoal({
      name: form.name,
      target_amount: Number(form.target_amount),
      deadline: form.deadline || null,
      color: form.color,
      icon: form.icon,
      image_url: imageUrl,
    });
  }
  emit('saved');
};
</script>
