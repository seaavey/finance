<template>
  <div class="space-y-6">
    <div v-if="loading" class="space-y-6">
      <Skeleton class="h-10 w-48 rounded-lg" />
      <Skeleton class="h-12 rounded-xl" />
      <Skeleton class="h-48 rounded-xl" />
      <Skeleton class="h-12 rounded-xl" />
    </div>

    <template v-else-if="transaction">
      <TransactionForm :transaction="transaction" @saved="onSaved" @cancel="navigateTo('/transactions')" />
      <div class="pt-2">
        <Button variant="destructive" class="w-full" @click="showDeleteDialog = true">
          <HugeiconsIcon :icon="Delete01Icon" :size="18" />
          Hapus Transaksi
        </Button>
      </div>
    </template>

    <div v-else class="flex flex-col items-center gap-3 py-12">
      <p class="text-sm text-muted-foreground">Transaksi tidak ditemukan</p>
      <Button variant="outline" @click="navigateTo('/transactions')">Kembali</Button>
    </div>

    <ConfirmDialog
      v-model:open="showDeleteDialog"
      title="Hapus Transaksi"
      description="Yakin hapus transaksi ini? Tindakan ini tidak bisa dibatalkan."
      confirm-text="Hapus"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Delete01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import type { Transaction } from '~/composables/useTransactions'

const route = useRoute()
const { getTransaction, deleteTransaction } = useTransactions()
const { fetchCategories } = useCategories()

const transaction = ref<Transaction | null>(null)
const loading = ref(true)
const showDeleteDialog = ref(false)

onMounted(async () => {
  await fetchCategories()
  const id = route.params.id as string
  const { data } = await getTransaction(id)
  transaction.value = data
  loading.value = false
})

const onSaved = () => {
  navigateTo('/transactions')
}

const onDelete = async () => {
  if (!transaction.value) return
  await deleteTransaction(transaction.value.id)
  showDeleteDialog.value = false
  navigateTo('/transactions')
}
</script>
