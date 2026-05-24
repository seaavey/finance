<template>
  <div class="space-y-6">
    <h2 class="text-xl font-bold">{{ $t('transactions.add_title') }}</h2>
    <TransactionForm @saved="onSaved" @cancel="navigateTo('/transactions')" />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { fetchCategories } = useCategories()

onMounted(async () => {
  await fetchCategories()
})

const onSaved = () => {
  navigateTo('/transactions')
}
</script>
