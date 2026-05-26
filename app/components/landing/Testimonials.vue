<template>
  <section class="relative px-6 py-16 md:py-24">
    <div class="mx-auto max-w-5xl">
      <div class="text-center max-w-2xl mx-auto">
        <p class="text-sm font-medium text-primary mb-3">Testimoni</p>
        <h2 class="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Dipakai 100+ orang
        </h2>
        <p class="mt-3 text-muted-foreground">
          Lihat apa kata mereka yang sudah pakai Finance sehari-hari.
        </p>
      </div>

      <div class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="t in testimonials"
          :key="t.name"
          class="rounded-xl border border-border/40 bg-background/40 p-5 transition-all duration-300 hover:border-primary/20 hover:bg-background/60"
        >
          <!-- Stars -->
          <div class="flex gap-0.5">
            <HugeiconsIcon
              v-for="n in 5"
              :key="n"
              :icon="StarIcon"
              :size="14"
              :class="n <= t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'"
            />
          </div>
          <!-- Quote -->
          <p class="mt-3 text-sm text-muted-foreground leading-relaxed">
            "{{ t.quote }}"
          </p>
          <!-- Author -->
          <div class="mt-4 flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
              :class="t.avatarBg"
            >
              {{ t.initials }}
            </div>
            <div>
              <p class="text-sm font-medium">{{ t.name }}</p>
              <p class="text-xs text-muted-foreground">{{ t.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';

const testimonials = [
  {
    name: 'Rani Sutrisno',
    role: 'Freelance Designer',
    quote: 'Sekarang gue bisa tracking pengeluaran bulanan tanpa Excel lagi. Simpel dan jelas.',
    initials: 'RS',
    avatarBg: 'bg-pink-500/15 text-pink-500',
    rating: 5,
  },
  {
    name: 'Dimas Pratama',
    role: 'Software Engineer',
    quote: 'Fitur transaksi rutin ngebantu banget. Gak pernah telat bayar listrik & internet lagi.',
    initials: 'DP',
    avatarBg: 'bg-blue-500/15 text-blue-500',
    rating: 5,
  },
  {
    name: 'Aisyah Putri',
    role: 'Ibu Rumah Tangga',
    quote: 'Bareng suami kelola keuangan jadi lebih transparan. No more mystery spending!',
    initials: 'AP',
    avatarBg: 'bg-purple-500/15 text-purple-500',
    rating: 5,
  },
];
</script>