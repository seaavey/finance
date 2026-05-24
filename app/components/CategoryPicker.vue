<template>
  <Select :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <SelectTrigger>
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="cat in filteredCategories"
        :key="cat.id"
        :value="cat.id"
      >
        <div class="flex items-center gap-2">
          <div class="size-3 rounded-full" :style="{ backgroundColor: cat.color }" />
          {{ cat.name }}
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  type?: 'income' | 'expense'
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const { categories, incomeCategories, expenseCategories } = useCategories()

const filteredCategories = computed(() => {
  if (props.type === 'income') return incomeCategories.value
  if (props.type === 'expense') return expenseCategories.value
  return categories.value
})
</script>
