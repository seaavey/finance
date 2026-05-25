<template>
  <div class="mx-auto max-w-6xl space-y-8">
    <!-- HEADER -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Transaksi Rutin</h1>
      <p class="mt-1 text-sm text-muted-foreground">{{ recurring.length }} jadwal aktif</p>
    </div>

    <!-- STATS -->
    <div v-if="!loading && recurring.length > 0" class="grid grid-cols-2 gap-4">
      <div class="rounded-3xl border border-red-500/10 bg-red-500/[0.07] p-5">
        <p class="text-sm text-red-400/70">Pengeluaran Rutin</p>
        <h3 class="mt-2 text-2xl font-bold text-red-400">{{ formatCurrency(monthlyExpense) }}</h3>
      </div>
      <div class="rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.07] p-5">
        <p class="text-sm text-emerald-400/70">Pemasukan Rutin</p>
        <h3 class="mt-2 text-2xl font-bold text-emerald-400">{{ formatCurrency(monthlyIncome) }}</h3>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-[104px] rounded-3xl" />
      <Skeleton class="h-[104px] rounded-3xl" />
      <Skeleton class="h-[104px] rounded-3xl" />
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="recurring.length === 0" class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 bg-card/20 px-6 py-16">
      <div class="flex size-16 items-center justify-center rounded-full bg-card/30">
        <HugeiconsIcon :icon="RepeatIcon" :size="28" class="text-muted-foreground/60" />
      </div>
      <h3 class="mt-5 text-lg font-medium">Belum ada transaksi rutin</h3>
      <p class="mt-2 max-w-sm text-center text-sm text-muted-foreground">Buat transaksi otomatis untuk pengeluaran atau pemasukan rutin bulanan.</p>
      <button
        class="mt-6 rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-5 py-2.5 text-sm font-medium text-white transition hover:from-pink-400 hover:to-pink-500"
        @click="showForm = true"
      >
        Tambah Transaksi Rutin
      </button>
    </div>

    <!-- LIST -->
    <div v-else class="space-y-3">
      <div
        v-for="item in recurring"
        :key="item.id"
        class="group flex items-center justify-between rounded-3xl border border-border/50 bg-card/30 p-5 transition-all duration-200"
        :class="item.active ? 'hover:border-border/80 hover:bg-card/60' : 'opacity-50'"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex size-14 items-center justify-center rounded-2xl"
            :class="item.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'"
          >
            <HugeiconsIcon
              :icon="item.type === 'income' ? ArrowDown01Icon : ArrowUp01Icon"
              :size="24"
              :class="item.type === 'income' ? 'text-emerald-400' : 'text-red-400'"
            />
          </div>
          <div>
            <h3 class="font-medium">{{ item.description || categoryName(item.category_id) || 'Tanpa deskripsi' }}</h3>
            <div class="mt-1.5 flex items-center gap-2">
              <span class="rounded-lg bg-card/50 px-2 py-0.5 text-xs text-muted-foreground">
                {{ frequencyLabel(item.frequency) }}
              </span>
              <span class="text-xs text-muted-foreground/60">
                {{ formatNextDate(item.next_date) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-xs text-muted-foreground/60">Nominal</p>
            <p
              class="text-lg font-semibold"
              :class="item.type === 'income' ? 'text-emerald-400' : 'text-red-400'"
            >
              {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(Number(item.amount), item.currency) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Switch :checked="item.active" @update:checked="toggleActive(item.id, $event)" />
            <button
              class="rounded-xl p-2 text-muted-foreground opacity-0 transition hover:bg-card hover:text-foreground group-hover:opacity-100"
              @click="editItem(item)"
            >
              <HugeiconsIcon :icon="PencilEdit01Icon" :size="16" />
            </button>
            <button
              class="rounded-xl p-2 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              @click="onDelete(item)"
            >
              <HugeiconsIcon :icon="Delete01Icon" :size="16" />
            </button>
          </div>
        </div>
      </div>
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
      :description="`Yakin hapus &quot;${deletingItem?.description || 'transaksi rutin'}&quot;? Tindakan ini tidak bisa dibatalkan.`"
      confirm-text="Hapus"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import {
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
    if (r.frequency === 'daily') { return s + r.amount * 30 }
    if (r.frequency === 'weekly') { return s + r.amount * 4 }
    if (r.frequency === 'yearly') { return s + r.amount / 12 }
    return s + r.amount
  }, 0)
)

const monthlyIncome = computed(() =>
  recurring.value.filter(r => r.type === 'income' && r.active).reduce((s, r) => {
    if (r.frequency === 'daily') { return s + r.amount * 30 }
    if (r.frequency === 'weekly') { return s + r.amount * 4 }
    if (r.frequency === 'yearly') { return s + r.amount / 12 }
    return s + r.amount
  }, 0)
)

onMounted(async () => {
  await fetchCategories()
  await fetchRecurring()
})

const categoryName = (id: string | null) => {
  if (!id) { return '' }
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

  if (diff === 0) { return 'Hari ini' }
  if (diff === 1) { return 'Besok' }
  if (diff < 7) { return `${diff} hari lagi` }
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
