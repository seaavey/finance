<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ category ? $t('categories.edit_title') : $t('categories.add_title') }}</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <Label for="name">{{ $t('common.name') }}</Label>
          <Input id="name" v-model="form.name" :placeholder="$t('categories.name_placeholder')" required />
        </div>

        <div class="space-y-2">
          <Label for="type">{{ $t('common.type') }}</Label>
          <Select v-model="form.type" :disabled="!!category">
            <SelectTrigger>
              <SelectValue :placeholder="$t('categories.type_placeholder')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">{{ $t('categories.income') }}</SelectItem>
              <SelectItem value="expense">{{ $t('categories.expense') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>Warna</Label>
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
          <Button type="button" variant="outline" @click="$emit('close')">{{ $t('common.cancel') }}</Button>
          <Button type="submit" :disabled="!form.name || !form.type">{{ $t('common.save') }}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Category } from '~/composables/useCategories'

const props = defineProps<{
  category?: Category
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { addCategory, updateCategory } = useCategories()

const colorOptions = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#f97316',
  '#06b6d4', '#ec4899', '#ef4444', '#a855f7',
  '#14b8a6', '#6b7280', '#eab308', '#f43f5e',
]

const form = reactive({
  name: props.category?.name ?? '',
  type: props.category?.type ?? 'expense',
  icon: props.category?.icon ?? 'wallet',
  color: props.category?.color ?? '#3b82f6',
})

const onSubmit = async () => {
  if (props.category) {
    await updateCategory(props.category.id, {
      name: form.name,
      color: form.color,
    })
  } else {
    await addCategory({
      name: form.name,
      type: form.type,
      icon: form.icon,
      color: form.color,
    })
  }
  emit('saved')
}
</script>
