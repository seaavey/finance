<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <header class="relative z-20 flex items-center justify-between px-6 py-4">
      <span class="text-lg font-bold tracking-tight">Finance</span>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" @click="goToLogin">Masuk</Button>
        <Button size="sm" @click="goToLogin">Daftar</Button>
      </div>
    </header>

    <main class="flex-1">
      <LandingHero />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { useRouter } from '#imports';

import LandingHero from '@/components/landing/Hero.vue';
import LandingFeatures from '@/components/landing/Features.vue';
import LandingTestimonials from '@/components/landing/Testimonials.vue';
import LandingFaq from '@/components/landing/Faq.vue';
import LandingCta from '@/components/landing/Cta.vue';
import LandingFooter from '@/components/landing/Footer.vue';

definePageMeta({ layout: 'blank' });

useSeoMeta({
  title: 'Finance — Catat keuangan sendiri atau bareng',
  description: 'Pantau pengeluaran, transaksi rutin, dan saldo bersama pasangan dalam satu dashboard modern. Gratis selamanya.',
  ogTitle: 'Finance — Catat keuangan sendiri atau bareng',
  ogDescription: 'Pantau pengeluaran, transaksi rutin, dan saldo bersama pasangan dalam satu dashboard modern. Gratis selamanya.',
  ogSiteName: 'Finance',
  twitterCard: 'summary_large_image',
});

const router = useRouter();
const goToLogin = () => router.push('/login');
</script>