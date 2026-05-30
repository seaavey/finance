<template>
  <div
    class="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300"
  >
    <LandingNavbar />

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
import LandingNavbar from '@/components/landing/Navbar.vue';
import LandingHero from '@/components/landing/Hero.vue';
import LandingFeatures from '@/components/landing/Features.vue';
import LandingTestimonials from '@/components/landing/Testimonials.vue';
import LandingFaq from '@/components/landing/Faq.vue';
import LandingCta from '@/components/landing/Cta.vue';
import LandingFooter from '@/components/landing/Footer.vue';

definePageMeta({ layout: 'blank' });

const { t } = useI18n();

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
