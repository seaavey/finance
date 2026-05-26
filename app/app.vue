<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppToast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
const toastRef = ref();
const { register } = useToast();

onMounted(() => {
  register((msg: string, type?: 'success' | 'error' | 'info') => {
    toastRef.value?.addToast(msg, type || 'info');
  });
});

defineOgImage('Default', {
  title: 'Finance',
  description: 'Kelola keuanganmu dengan mudah.',
});
</script>
