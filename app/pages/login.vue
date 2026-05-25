<template>
  <div class="flex min-h-screen flex-col items-center justify-center p-8">
    <div class="mx-auto w-full max-w-sm space-y-8">
      <div class="space-y-2 text-center">
        <NuxtLink to="/" class="text-lg font-bold tracking-tight hover:text-primary transition-colors">Finance</NuxtLink>
        <h1 class="font-heading text-xl font-bold tracking-tight">Masuk</h1>
        <p class="text-sm text-muted-foreground">
          Catat keuangan sendiri atau bareng
        </p>
      </div>

      <Button
        class="w-full gap-2"
        size="lg"
        @click="signInWithGoogle"
      >
        <HugeiconsIcon :icon="GoogleIcon" :size="20" />
        Login dengan Google
      </Button>

      <p class="text-center text-xs text-muted-foreground">
        <NuxtLink to="/" class="hover:text-foreground transition-colors">&larr; Kembali</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GoogleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';

definePageMeta({ layout: 'blank' });

const { signInWithGoogle } = useAuth();
</script>
