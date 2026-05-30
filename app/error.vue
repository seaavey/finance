<script setup lang="ts">
defineProps({
  error: Object,
});

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-background text-foreground"
  >
    <div class="max-w-md w-full space-y-6">
      <div class="space-y-2">
        <h1 class="text-9xl font-extrabold tracking-tighter text-primary/20">
          {{ error?.statusCode || '500' }}
        </h1>
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          {{ error?.statusCode === 404 ? $t('error.title_404') : $t('error.title_500') }}
        </h2>
        <p class="text-muted-foreground text-lg">
          {{ error?.statusCode === 404 ? $t('error.desc_404') : $t('error.desc_500') }}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" @click="handleError"> {{ $t('error.back_to_home') }} </Button>
        <Button variant="outline" size="lg" @click="navigateTo('/transactions')">
          {{ $t('error.view_transactions') }}
        </Button>
      </div>
    </div>
  </div>
</template>
