<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold">{{ $t('todos.title') }}</h2>
        <p class="text-sm text-muted-foreground">
          {{ $t('todos.tasks', { count: todos.length }) }}
          <span v-if="completedCount > 0"> · {{ $t('todos.completed', { count: completedCount }) }}</span>
        </p>
      </div>
      <Button @click="openAdd">
        <HugeiconsIcon :icon="Add01Icon" :size="18" />
        {{ $t('common.add') }}
      </Button>
    </div>

    <div class="flex gap-2">
      <div class="relative flex-1">
        <HugeiconsIcon
          :icon="Search01Icon"
          :size="16"
          class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          v-model="searchQuery"
          :placeholder="$t('todos.search')"
          class="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent pl-8 pr-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] file:h-7 file:text-sm file:font-medium focus-visible:ring-3 md:text-sm min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <button
        class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        :class="showCompleted
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent'"
        @click="showCompleted = !showCompleted"
      >
        <HugeiconsIcon :icon="Tick01Icon" :size="16" />
        {{ showCompleted ? $t('todos.hide_completed') : $t('todos.show_completed') }}
      </button>
    </div>

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 5" :key="i" class="h-14 w-full rounded-xl" />
    </div>

    <template v-else>
      <div class="flex gap-2">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          :class="activeFilter === tab.value
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent'"
          @click="activeFilter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="filterShown.length === 0" class="flex flex-col items-center gap-3 py-12">
        <div class="flex size-12 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="24" class="text-muted-foreground" />
        </div>
        <p class="text-sm text-muted-foreground">
          {{ searchQuery ? $t('todos.no_match') : activeFilter === 'all' ? $t('todos.no_tasks') : $t('todos.no_priority_tasks', { priority: activeFilterLabel }) }}
        </p>
      </div>

      <template v-else>
        <div v-if="activeTodos.length > 0" class="space-y-1">
          <Sortable
            :list="activeTodos"
            item-key="id"
            :options="{ handle: '.drag-handle', ghostClass: 'opacity-30', animation: 200 }"
            class="space-y-1"
            @end="onReorder"
          >
            <template #item="{ element: todo }">
              <div class="group flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:bg-accent/30">
                <div class="drag-handle flex cursor-grab items-center text-muted-foreground active:cursor-grabbing">
                  <HugeiconsIcon :icon="Menu02Icon" :size="16" />
                </div>
                <button
                  class="flex size-5 shrink-0 items-center justify-center rounded-md border border-border transition-colors hover:border-primary"
                  @click="toggleComplete(todo)"
                >
                  <HugeiconsIcon v-if="todo.is_complete" :icon="Tick01Icon" :size="14" />
                </button>
                <span
                  class="flex-1 cursor-pointer text-sm"
                  @dblclick="openEdit(todo)"
                >
                  {{ todo.title }}
                </span>
                <span
                  v-if="todo.due_date"
                  class="flex items-center gap-1 text-xs"
                  :class="isOverdue(todo) ? 'text-red-500 font-medium' : 'text-muted-foreground'"
                >
                  <HugeiconsIcon :icon="Calendar01Icon" :size="12" />
                  {{ formatDate(todo.due_date) }}
                  <span v-if="isOverdue(todo)" class="ml-0.5 rounded bg-red-500/10 px-1 py-0.5 text-[10px] font-semibold text-red-500">{{ $t('todos.overdue') }}</span>
                </span>
                <span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium" :class="priorityBadgeClass(todo.priority)">
                  {{ priorityLabel(todo.priority) }}
                </span>
                <button
                  class="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                  @click="openEdit(todo)"
                >
                  <HugeiconsIcon :icon="PencilEdit01Icon" :size="16" />
                </button>
                <button
                  class="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  @click="onDelete(todo.id)"
                >
                  <HugeiconsIcon :icon="Delete01Icon" :size="16" />
                </button>
              </div>
            </template>
          </Sortable>
        </div>

        <div v-if="completedTodos.length > 0 && showCompleted" class="space-y-1">
          <div class="flex items-center gap-2 pt-4 pb-1">
            <div class="h-px flex-1 bg-border" />
            <span class="text-xs text-muted-foreground">{{ $t('todos.section_completed') }}</span>
            <div class="h-px flex-1 bg-border" />
          </div>
          <div
            v-for="todo in completedTodos"
            :key="todo.id"
            class="group flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors bg-muted/30"
          >
            <div class="flex size-5 shrink-0 items-center justify-center rounded-md border border-primary bg-primary text-primary-foreground">
              <HugeiconsIcon :icon="Tick01Icon" :size="14" />
            </div>
            <span class="flex-1 text-sm text-muted-foreground line-through">
              {{ todo.title }}
            </span>
            <span
              v-if="todo.due_date"
              class="flex items-center gap-1 text-xs text-muted-foreground"
            >
              <HugeiconsIcon :icon="Calendar01Icon" :size="12" />
              {{ formatDate(todo.due_date) }}
            </span>
            <span class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium" :class="priorityBadgeClass(todo.priority)">
              {{ priorityLabel(todo.priority) }}
            </span>
            <button
              class="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              @click="onDelete(todo.id)"
            >
              <HugeiconsIcon :icon="Delete01Icon" :size="16" />
            </button>
          </div>
        </div>
      </template>
    </template>

    <Dialog :open="showForm" @update:open="showForm = false; editingTodo = undefined">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingTodo ? $t('todos.edit_title') : $t('todos.add_title') }}</DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label for="title">{{ $t('todos.task_name') }}</Label>
            <input
              id="title"
              v-model="formTitle"
              :placeholder="$t('todos.task_name_placeholder')"
              required
              class="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] file:h-7 file:text-sm file:font-medium focus-visible:ring-3 md:text-sm min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground"
              @keydown.enter="onSubmit"
            />
          </div>

          <div class="space-y-2">
            <Label for="priority">{{ $t('todos.priority') }}</Label>
            <Select v-model="formPriority">
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">{{ $t('todos.priority_high') }}</SelectItem>
                <SelectItem value="medium">{{ $t('todos.priority_medium') }}</SelectItem>
                <SelectItem value="low">{{ $t('todos.priority_low') }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="due_date">{{ $t('todos.deadline') }}</Label>
            <input
              id="due_date"
              type="date"
              v-model="formDueDate"
              class="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] file:h-7 file:text-sm file:font-medium focus-visible:ring-3 md:text-sm min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" @click="showForm = false; editingTodo = undefined">{{ $t('common.cancel') }}</Button>
            <Button type="submit" :disabled="!formTitle.trim()">{{ editingTodo ? $t('common.save') : $t('common.add') }}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Add01Icon,
  Delete01Icon,
  CheckmarkCircle02Icon,
  Tick01Icon,
  Search01Icon,
  PencilEdit01Icon,
  Menu02Icon,
  Calendar01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { Sortable } from 'sortablejs-vue3'
import type { Todo, TodoPriority } from '~/composables/useTodos'

const { t, locale } = useI18n()
const { todos, loading, fetchTodos, addTodo, updateTodo, deleteTodo } = useTodos()

const showForm = ref(false)
const editingTodo = ref<Todo | undefined>()
const formTitle = ref('')
const formPriority = ref<TodoPriority>('medium')
const formDueDate = ref<string | null>(null)

const searchQuery = ref('')
const activeFilter = ref<'all' | TodoPriority>('all')
const showCompleted = ref(true)

const filterTabs = computed(() => [
  { value: 'all' as const, label: t('todos.all'), count: todos.value.length },
  { value: 'high' as const, label: t('todos.priority_high'), count: todos.value.filter(t => t.priority === 'high' && !t.is_complete).length },
  { value: 'medium' as const, label: t('todos.priority_medium'), count: todos.value.filter(t => t.priority === 'medium' && !t.is_complete).length },
  { value: 'low' as const, label: t('todos.priority_low'), count: todos.value.filter(t => t.priority === 'low' && !t.is_complete).length },
])

const activeFilterLabel = computed(() => {
  const map: Record<string, string> = { all: '', high: t('todos.priority_high'), medium: t('todos.priority_medium'), low: t('todos.priority_low') }
  return map[activeFilter.value]
})

const completedCount = computed(() => todos.value.filter(t => t.is_complete).length)

const filteredTodos = computed(() => {
  let list = todos.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t => t.title.toLowerCase().includes(q))
  }
  if (activeFilter.value !== 'all') {
    list = list.filter(t => t.priority === activeFilter.value)
  }
  return list
})

const filterShown = computed(() => {
  return showCompleted.value ? filteredTodos.value : filteredTodos.value.filter(t => !t.is_complete)
})

const activeTodos = computed(() => filterShown.value.filter(t => !t.is_complete))

const completedTodos = computed(() => filterShown.value.filter(t => t.is_complete))

const todayStr = computed(() => new Date().toISOString().slice(0, 10))

const isOverdue = (todo: Todo) => {
  if (todo.is_complete || !todo.due_date) { return false }
  return todo.due_date < todayStr.value
}

const formatDate = (d: string) => {
  const date = new Date(`${d}T00:00:00`)
  return date.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })
}

const priorityLabel = (p: TodoPriority) => {
  const map: Record<TodoPriority, string> = { high: t('todos.priority_high'), medium: t('todos.priority_medium'), low: t('todos.priority_low') }
  return map[p]
}

const priorityBadgeClass = (p: TodoPriority) => {
  const map: Record<TodoPriority, string> = {
    high: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    medium: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    low: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
  }
  return map[p]
}

const openAdd = () => {
  editingTodo.value = undefined
  formTitle.value = ''
  formPriority.value = 'medium'
  formDueDate.value = null
  showForm.value = true
}

const openEdit = (todo: Todo) => {
  editingTodo.value = todo
  formTitle.value = todo.title
  formPriority.value = todo.priority
  formDueDate.value = todo.due_date
  showForm.value = true
}

const onSubmit = async () => {
  try {
    const title = formTitle.value.trim()
    if (!title) { return }

    if (editingTodo.value) {
      await updateTodo(editingTodo.value.id, { title, priority: formPriority.value, due_date: formDueDate.value })
    } else {
      await addTodo(title, formPriority.value, formDueDate.value)
    }

    showForm.value = false
    editingTodo.value = undefined
    formTitle.value = ''
    formPriority.value = 'medium'
    formDueDate.value = null
  } catch (e) {
    console.error('Error submit todo:', e)
  }
}

const toggleComplete = (todo: Todo) => {
  updateTodo(todo.id, { is_complete: !todo.is_complete })
}

const onDelete = async (id: string) => {
  await deleteTodo(id)
}

const onReorder = (evt: { oldIndex: number; newIndex: number }) => {
  const list = [...todos.value.filter((t): t is Todo => !t.is_complete)]
  const [moved] = list.splice(evt.oldIndex, 1)
  if (!moved) { return }
  list.splice(evt.newIndex, 0, moved)
  const completed = todos.value.filter(t => t.is_complete)
  todos.value = [...list, ...completed]
}

onMounted(() => {
  fetchTodos()
})
</script>
