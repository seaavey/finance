<template>
  <section class="relative overflow-hidden px-6 py-16 md:py-24">
    <!-- Background glow -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-3xl text-center">
      <h2 class="font-heading text-3xl font-bold tracking-tight md:text-4xl">
        Mulai atur uangmu dengan
        <span class="text-primary">cara modern.</span>
      </h2>
      <p class="mt-4 text-muted-foreground max-w-lg mx-auto">
        Gratis selamanya. Tanpa iklan. Tanpa ribet. Cukup daftar dan langsung pakai.
      </p>
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button class="w-full sm:w-auto gap-2" size="lg" @click="goToLogin">
          Buat Akun Gratis
          <HugeiconsIcon :icon="ArrowRightIcon" :size="18" />
        </Button>
      </div>
      <p class="mt-4 text-xs text-muted-foreground">
        Gratis selamanya &middot; Tanpa kartu kredit &middot; Setup 1 menit
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRightIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Button } from '@/components/ui/button';
import { useRouter } from '#imports';

const router = useRouter();
const goToLogin = () => router.push('/login');
</script>