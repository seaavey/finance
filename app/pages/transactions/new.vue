<template>
    <TransactionForm @saved="onSaved" @cancel="navigateTo('/transactions')" />
</template>

<script setup lang="ts">
const { fetchCategories } = useCategories();

onMounted(async () => {
  await fetchCategories();
});

const onSaved = () => {
  navigateTo('/transactions');
};
</script>
