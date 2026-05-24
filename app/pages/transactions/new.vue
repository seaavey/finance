<template>
  <div class="space-y-6">
    <h2 class="text-xl font-bold">Tambah Transaksi</h2>
    <TransactionForm @saved="onSaved" @cancel="navigateTo('/transactions')" />
  </div>
</template>

<script setup lang="ts">
const { fetchCategories } = useCategories()

onMounted(async () => {
  await fetchCategories()
})

const onSaved = () => {
  navigateTo('/transactions')
}
</script>
