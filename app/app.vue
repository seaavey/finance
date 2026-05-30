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
const { register, toast } = useToast();
const { activeReminders } = useReminders();
const { fetchRecurring } = useRecurring();
const { t } = useI18n();
const { user } = useAuth();

onMounted(async () => {
  register((msg: string, type?: 'success' | 'error' | 'info') => {
    toastRef.value?.addToast(msg, type || 'info');
  });

  if (user.value) {
    await fetchRecurring();
    if (activeReminders.value.length > 0) {
      toast.info(t('reminders.new_alerts', { count: activeReminders.value.length }));
    }
  }
});

defineOgImage('Default', {
  title: 'Finance',
  description: 'Kelola keuanganmu dengan mudah.',
});
</script>
