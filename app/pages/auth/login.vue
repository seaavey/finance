<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-6">
    <div class="w-full max-w-md space-y-6">
      <div class="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div class="space-y-2 text-center">
          <NuxtLinkLocale
            to="/"
            class="text-lg font-bold tracking-tight hover:text-primary transition-colors"
            >{{ $t('sidebar.finance') }}</NuxtLinkLocale
          >
          <h1 class="font-heading text-xl font-bold tracking-tight">
            {{ $t('auth.login_title') }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ $t('auth.login_subtitle') }}
          </p>
        </div>

        <div class="mt-8 space-y-4">
          <Button class="w-full gap-2" size="lg" @click="signInWithGoogle">
            <Icon name="hugeicons:google" :size="20" />
            {{ $t('auth.login_google') }}
          </Button>

          <p class="text-center text-xs text-muted-foreground">
            <NuxtLinkLocale to="/" class="hover:text-foreground transition-colors">{{
              $t('auth.back')
            }}</NuxtLinkLocale>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

definePageMeta({ layout: 'blank' });

const { signInWithGoogle } = useAuth();
</script>
