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
defineOptions({
  name: 'LandingPage',
})
import LandingNavbar from '@/components/landing/Navbar.vue';
import LandingHero from '@/components/landing/Hero.vue';
import LandingFeatures from '@/components/landing/Features.vue';
import LandingTestimonials from '@/components/landing/Testimonials.vue';
import LandingFaq from '@/components/landing/Faq.vue';
import LandingCta from '@/components/landing/Cta.vue';
import LandingFooter from '@/components/landing/Footer.vue';
import { getOgImageUrl } from '@/lib/utils';

// Note: layout: 'blank' is handled in App.vue meta checks
// but we need to ensure the route meta is set in router/index.ts

const { t } = useI18n();

const title = 'Aemy Finance - Kelola Keuangan Pribadi & Bersama';
const description = `${t('landing.hero_desc')} ${t('landing.hero_free')}.`;

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: getOgImageUrl('Aemy Finance', description),
  twitterCard: 'summary_large_image',
});
</script>
