<template>
  <section class="relative overflow-hidden px-6 py-16 md:py-24">
    <!-- Background glow -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-125 rounded-full bg-primary/10 blur-[120px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-3xl text-center">
      <h2 class="font-heading text-3xl font-bold tracking-tight md:text-4xl">
        {{ ctaTitleStart }}
        <span class="text-primary">{{ ctaTitleHighlight }}</span>
      </h2>
      <p class="mt-4 text-muted-foreground max-w-lg mx-auto">
        {{ $t('landing.cta_desc') }}
      </p>
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button class="w-full sm:w-auto gap-2" size="lg" @click="goToLogin">
          {{ $t('landing.cta_button') }}
          <HugeiconsIcon :icon="ArrowRightIcon" :size="18" />
        </Button>
      </div>
      <p class="mt-4 text-xs text-muted-foreground">
        {{ $t('landing.cta_footer') }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRightIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Button } from '@/components/ui/button';
import { useRouter } from '#imports';

const { t } = useI18n();
const router = useRouter();
const goToLogin = () => router.push('/login');

const ctaTitleStart = computed(() => {
  const full = t('landing.cta_title');
  const idx = full.indexOf('cara modern.');
  return idx === -1 ? full : full.slice(0, idx);
});
const ctaTitleHighlight = computed(() => {
  const full = t('landing.cta_title');
  const idx = full.indexOf('cara modern.');
  return idx === -1 ? '' : full.slice(idx);
});
</script>