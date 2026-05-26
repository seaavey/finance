<template>
  <div class="flex min-h-screen flex-col items-center justify-center p-8">
    <div class="mx-auto w-full max-w-sm space-y-8">
      <div class="space-y-2 text-center">
        <NuxtLinkLocale to="/" class="text-lg font-bold tracking-tight hover:text-primary transition-colors">{{ $t('sidebar.finance') }}</NuxtLinkLocale>
        <h1 class="font-heading text-xl font-bold tracking-tight">{{ $t('auth.login_title') }}</h1>
        <p class="text-sm text-muted-foreground">
          {{ $t('auth.login_subtitle') }}
        </p>
      </div>

      <Button
        class="w-full gap-2"
        size="lg"
        @click="signInWithGoogle"
      >
        <HugeiconsIcon :icon="GoogleIcon" :size="20" />
        {{ $t('auth.login_google') }}
      </Button>

      <p class="text-center text-xs text-muted-foreground">
        <NuxtLinkLocale to="/" class="hover:text-foreground transition-colors">{{ $t('auth.back') }}</NuxtLinkLocale>
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
