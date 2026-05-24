<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold">Transaksi Rutin</h2>
        <p class="text-sm text-muted-foreground">{{ recurring.length }} jadwal aktif</p>
      </div>
      <Button @click="showForm = true">
        <HugeiconsIcon :icon="Add01Icon" :size="18" />
        Tambah
      </Button>
    </div>

    <div v-if="!loading && recurring.length > 0" class="grid grid-cols-2 gap-3">
      <Card class="bg-red-50 dark:bg-red-950/30">
        <CardContent class="p-3 text-center">
          <p class="text-[11px] text-muted-foreground">Pengeluaran Rutin/Bulan</p>
          <p class="text-sm font-bold text-red-600">Rp {{ monthlyExpense.toLocaleString('id-ID') }}</p>
        </CardContent>
      </Card>
      <Card class="bg-green-50 dark:bg-green-950/30">
        <CardContent class="p-3 text-center">
          <p class="text-[11px] text-muted-foreground">Pemasukan Rutin/Bulan</p>
          <p class="text-sm font-bold text-green-600">Rp {{ monthlyIncome.toLocaleString('id-ID') }}</p>
        </CardContent>
      </Card>
    </div>

    <div v-if="loading" class="space-y-2">
      <Skeleton class="h-[72px] rounded-xl" />
      <Skeleton class="h-[72px] rounded-xl" />
      <Skeleton class="h-[72px] rounded-xl" />
    </div>

    <div v-else-if="recurring.length === 0" class="flex flex-col items-center gap-3 py-12">
      <div class="flex size-12 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon :icon="RepeatIcon" :size="24" class="text-muted-foreground" />
      </div>
      <p class="text-sm text-muted-foreground">Belum ada transaksi rutin</p>
      <Button size="sm" @click="showForm = true">Tambah Sekarang</Button>
    </div>

    <div v-else class="space-y-2">
      <Card
        v-for="item in recurring"
        :key="item.id"
        class="group transition-colors"
        :class="item.active ? 'hover:bg-accent/50' : 'opacity-50'"
      >
        <CardContent class="flex items-center justify-between p-4">
          <div class="flex items-center gap-3">
            <div
              class="flex size-10 items-center justify-center rounded-xl"
              :class="item.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'"
            >
              <HugeiconsIcon
                :icon="item.type === 'income' ? ArrowDown01Icon : ArrowUp01Icon"
                :size="20"
                :class="item.type === 'income' ? 'text-green-600' : 'text-red-600'"
              />
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium">{{ item.description || categoryName(item.category_id) || 'Tanpa deskripsi' }}</p>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span class="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5">
                  <HugeiconsIcon :icon="RepeatIcon" :size="12" />
                  {{ frequencyLabel(item.frequency) }}
                </span>
                <span>{{ formatNextDate(item.next_date) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <p
              class="text-sm font-semibold"
              :class="item.type === 'income' ? 'text-green-600' : 'text-red-600'"
            >
              {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(Number(item.amount), item.currency) }}
            </p>

            <div class="flex items-center gap-1">
              <Switch :checked="item.active" @update:checked="toggleActive(item.id, $event)" />
              <button
                class="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                @click="editItem(item)"
              >
                <HugeiconsIcon :icon="PencilEdit01Icon" :size="16" />
              </button>
              <button
                class="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                @click="onDelete(item)"
              >
                <HugeiconsIcon :icon="Delete01Icon" :size="16" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <RecurringForm
      v-if="showForm"
      :item="editingItem"
      @close="showForm = false; editingItem = undefined"
      @saved="onSaved"
    />

    <ConfirmDialog
      v-model:open="showDeleteDialog"
      title="Hapus Transaksi Rutin"
      :description="`Yakin hapus &quot;${deletingItem?.name || 'transaksi rutin'}&quot;? Tindakan ini tidak bisa dibatalkan.`"
      confirm-text="Hapus"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Add01Icon,
  RepeatIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  PencilEdit01Icon,
  Delete01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { RecurringTransaction } from '~/composables/useRecurring'

const { recurring, loading, fetchRecurring, toggleActive, deleteRecurring } = useRecurring()
const { categories, fetchCategories } = useCategories()
const { formatCurrency } = useCurrency()

const showForm = ref(false)
const editingItem = ref<RecurringTransaction | undefined>()

const monthlyExpense = computed(() =>
  recurring.value.filter(r => r.type === 'expense' && r.active).reduce((s, r) => {
    if (r.frequency === 'daily') return s + r.amount * 30
    if (r.frequency === 'weekly') return s + r.amount * 4
    if (r.frequency === 'yearly') return s + r.amount / 12
    return s + r.amount
  }, 0)
)

const monthlyIncome = computed(() =>
  recurring.value.filter(r => r.type === 'income' && r.active).reduce((s, r) => {
    if (r.frequency === 'daily') return s + r.amount * 30
    if (r.frequency === 'weekly') return s + r.amount * 4
    if (r.frequency === 'yearly') return s + r.amount / 12
    return s + r.amount
  }, 0)
)

onMounted(async () => {
  await fetchCategories()
  await fetchRecurring()
})

const categoryName = (id: string | null) => {
  if (!id) return ''
  return categories.value.find((c) => c.id === id)?.name ?? ''
}

const frequencyLabel = (f: string) => {
  const map: Record<string, string> = { daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan', yearly: 'Tahunan' }
  return map[f] ?? f
}

const formatNextDate = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff === 0) return 'Hari ini'
  if (diff === 1) return 'Besok'
  if (diff < 7) return `${diff} hari lagi`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const showDeleteDialog = ref(false)
const deletingItem = ref<RecurringTransaction | undefined>()

const editItem = (item: RecurringTransaction) => {
  editingItem.value = item
  showForm.value = true
}

const onDelete = (item: RecurringTransaction) => {
  deletingItem.value = item
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (deletingItem.value) {
    await deleteRecurring(deletingItem.value.id)
  }
  showDeleteDialog.value = false
  deletingItem.value = undefined
}

const onSaved = () => {
  showForm.value = false
  editingItem.value = undefined
}
</script>
