<template>
  <section id="features" class="relative px-6 py-16 md:py-24">
    <div class="mx-auto max-w-5xl">
      <div class="text-center max-w-2xl mx-auto">
        <p class="text-sm font-medium text-primary mb-3">{{ $t('landing.features_title') }}</p>
        <h2 class="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {{ $t('landing.features_heading') }}
        </h2>
        <p class="mt-3 text-muted-foreground">
          {{ $t('landing.features_desc') }}
        </p>
      </div>

      <div class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="group relative rounded-xl border border-border/40 bg-background/40 p-5 transition-all duration-300 hover:border-primary/30 hover:bg-background/60 hover:shadow-lg hover:shadow-primary/5"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-300"
            :class="feature.iconBg"
          >
            <HugeiconsIcon :icon="feature.icon" :size="20" :class="feature.iconColor" />
          </div>
          <h3 class="mt-4 font-heading text-sm font-semibold">{{ feature.title }}</h3>
          <p class="mt-1.5 text-sm text-muted-foreground leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  ChartIcon,
  RepeatIcon,
  GroupIcon,
  Wallet01Icon,
  File02Icon,
  ArrangeIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import type { Component } from 'vue';

interface Feature {
  title: string;
  description: string;
  icon: Component;
  iconBg: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    title: 'Dashboard Analytics',
    description: 'Ringkasan keuangan real-time dengan grafik interaktif yang mudah dipahami.',
    icon: ChartIcon,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Transaksi Rutin',
    description: 'Atur tagihan & cicilan otomatis tiap bulan, tidak pernah telat bayar.',
    icon: RepeatIcon,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Kolaborasi Pasangan',
    description: 'Hubungkan akun dengan pasangan, saling lihat transaksi & kelola bareng.',
    icon: GroupIcon,
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
  },
  {
    title: 'Multi Wallet',
    description: 'Kelola cash, e-wallet, dan rekening dalam satu tempat terpusat.',
    icon: Wallet01Icon,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  {
    title: 'Export Laporan',
    description: 'Download laporan keuangan bulanan dalam format CSV untuk analisis mandiri.',
    icon: File02Icon,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  {
    title: 'Smart Category',
    description: 'Kategori otomatis berdasarkan pola transaksi — semakin pintar seiring waktu.',
    icon: ArrangeIcon,
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500',
  },
];
</script>