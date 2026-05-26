<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <header class="relative z-20 flex items-center justify-between px-6 py-4">
      <span class="text-lg font-bold tracking-tight">{{ $t('sidebar.finance') }}</span>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" @click="goToLogin">{{ $t('auth.login_title') }}</Button>
        <Button size="sm" @click="goToLogin">{{ $t('auth.register') }}</Button>
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

const { t } = useI18n();
const router = useRouter();
const goToLogin = () => router.push('/login');

useSeoMeta({
  title: `Finance ${t('landing.footer_text')}`,
  description: `${t('landing.hero_desc')} ${t('landing.hero_free')}.`,
  ogTitle: `Finance ${t('landing.footer_text')}`,
  ogDescription: `${t('landing.hero_desc')} ${t('landing.hero_free')}.`,
  ogSiteName: 'Finance',
  twitterCard: 'summary_large_image',
});

defineOgImage('Default', {
  title: 'Finance',
  description: `${t('landing.hero_desc')} ${t('landing.hero_free')}.`,
});
</script>