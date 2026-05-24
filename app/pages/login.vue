<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-sm space-y-8 text-center">
      <div class="space-y-2">
        <h1 class="text-4xl font-bold tracking-tight">Finance</h1>
        <p class="text-muted-foreground">
          Kelola keuangan kamu dan pasangan
        </p>
      </div>

      <div class="space-y-4">
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
  </div>
</template>

<script setup lang="ts">
import { GoogleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

definePageMeta({ layout: 'blank' })

const { signInWithGoogle } = useAuth()
</script>
