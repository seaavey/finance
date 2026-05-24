<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
    <div class="mx-auto w-full max-w-sm space-y-6">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold tracking-tight">Finance</h1>
        <p class="text-sm text-muted-foreground">
          Kelola keuangan kamu dan pasangan
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { GoogleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

definePageMeta({ layout: 'blank' })

const { signInWithGoogle } = useAuth()
</script>
