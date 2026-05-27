<template>
  <section id="cta" class="relative py-24 md:py-40 overflow-hidden">
    <!-- background decorative elements -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/10 blur-[150px]"
      />
    </div>

    <div class="mx-auto max-w-5xl px-6">
      <div
        class="relative overflow-hidden rounded-[3rem] border border-border/40 bg-background/40 p-8 md:p-20 text-center backdrop-blur-xl"
      >
        <!-- Inner glow -->
        <div
          class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none"
        />

        <div class="relative z-10 max-w-2xl mx-auto">
          <h2 class="font-heading text-4xl font-bold tracking-tight md:text-6xl mb-6">
            {{ $t('landing.cta_title') }}
          </h2>
          <p class="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
            {{ $t('landing.cta_desc') }}
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              size="lg"
              class="h-14 px-8 text-base font-bold rounded-2xl group transition-all duration-300 hover:scale-105"
              as-child
            >
              <NuxtLink to="/login">
                {{ $t('landing.cta_button') }}
                <HugeiconsIcon
                  :icon="ArrowRight01Icon"
                  :size="20"
                  class="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                />
              </NuxtLink>
            </Button>
          </div>

          <p class="text-sm text-muted-foreground/60 font-medium">
            {{ $t('landing.cta_footer') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Button } from '@/components/ui/button';
</script>
