<template>
  <section id="faq" class="relative px-6 py-20 md:py-32 overflow-hidden">
    <!-- Animated dynamic background glows -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute top-1/4 -left-20 size-96 rounded-full bg-primary/10 blur-[100px] animate-pulse" />
      <div class="absolute bottom-1/4 -right-20 size-96 rounded-full bg-blue-500/10 blur-[100px] animate-pulse [animation-delay:2s]" />
    </div>

    <div class="mx-auto max-w-3xl">
      <div class="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary mb-6 shadow-sm">
          <HugeiconsIcon :icon="HelpCircleIcon" :size="14" />
          {{ $t('landing.nav_faq') }}
        </div>
        <h2 class="font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          {{ $t('landing.faq_title') }}
        </h2>
        <p class="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {{ $t('landing.faq_desc') }}
        </p>
      </div>

      <div class="grid gap-4">
        <div
          v-for="(item, index) in faqItems"
          :key="item.value"
          class="group rounded-2xl border border-border/40 bg-background/40 backdrop-blur-md transition-all duration-500 hover:border-primary/30 hover:bg-background/80 shadow-sm hover:shadow-xl hover:-translate-y-1"
          :style="{ animationDelay: `${index * 100}ms`, animationDuration: '800ms' }"
        >
          <Accordion type="single" collapsible class="w-full">
            <AccordionItem :value="item.value" class="border-0">
              <AccordionTrigger class="px-6 py-5 text-base md:text-lg font-semibold hover:no-underline text-left transition-all data-[state=open]:text-primary [&[data-state=open]>svg]:rotate-180">
                <div class="flex items-center gap-4">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors text-muted-foreground group-hover:text-primary">
                    <HugeiconsIcon :icon="item.icon" :size="20" />
                  </div>
                  {{ $t(item.questionKey) }}
                </div>
              </AccordionTrigger>
              <AccordionContent class="px-6 pb-6 text-sm md:text-base text-muted-foreground leading-relaxed pl-[4.5rem]">
                {{ $t(item.answerKey) }}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <!-- Support CTA -->
      <div class="mt-16 text-center p-10 rounded-[2.5rem] border border-dashed border-primary/30 bg-primary/5 relative overflow-hidden group">
        <div class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div class="relative z-10">
          <p class="text-base font-medium text-foreground mb-2">{{ $t('landing.faq_support_title') }}</p>
          <p class="text-sm text-muted-foreground mb-6">{{ $t('landing.faq_support_desc') }}</p>
          <Button variant="default" class="rounded-full gap-2 px-8 py-6 h-auto text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
            <HugeiconsIcon :icon="CustomerServiceIcon" :size="20" />
            {{ $t('landing.faq_support_button') }}
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/vue';
import {
  HelpCircleIcon,
  CustomerServiceIcon,
  LicenseIcon,
  UserGroupIcon,
  Shield01Icon,
  SmartPhone01Icon,
  File02Icon,
  GridViewIcon,
} from '@hugeicons/core-free-icons';

const faqItems = [
  {
    value: 'free',
    questionKey: 'landing.faq_q_free',
    answerKey: 'landing.faq_a_free',
    icon: LicenseIcon,
  },
  {
    value: 'couple',
    questionKey: 'landing.faq_q_couple',
    answerKey: 'landing.faq_a_couple',
    icon: UserGroupIcon,
  },
  {
    value: 'security',
    questionKey: 'landing.faq_q_security',
    answerKey: 'landing.faq_a_security',
    icon: Shield01Icon,
  },
  {
    value: 'mobile',
    questionKey: 'landing.faq_q_mobile',
    answerKey: 'landing.faq_a_mobile',
    icon: SmartPhone01Icon,
  },
  {
    value: 'export',
    questionKey: 'landing.faq_q_export',
    answerKey: 'landing.faq_a_export',
    icon: File02Icon,
  },
  {
    value: 'category',
    questionKey: 'landing.faq_q_category',
    answerKey: 'landing.faq_a_category',
    icon: GridViewIcon,
  },
];
</script>
