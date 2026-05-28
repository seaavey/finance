<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-6">
    <div class="w-full max-w-md space-y-6">
      <div class="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div class="flex flex-col items-center text-center">
          <div class="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="hugeicons:wallet-01" :size="24" class="text-primary" />
          </div>
          <h1 class="font-heading text-2xl font-bold tracking-tight text-foreground">
            {{ $t('auth.login_title') }}
          </h1>
          <p class="mt-2 text-sm text-muted-foreground">
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
