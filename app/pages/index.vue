<template>
  <div class="flex min-h-screen flex-col">
    <header class="relative z-20 flex items-center justify-between px-6 py-4">
      <span class="text-lg font-bold tracking-tight">Finance</span>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" @click="goToLogin">{{ $t('auth.login_title') }}</Button>
        <Button size="sm" @click="goToLogin">{{ $t('auth.register') }}</Button>
      </div>
    </header>

    <main class="flex-1">
      <section class="relative flex flex-col items-center overflow-hidden px-6 py-20 text-center md:py-32">
        <div class="pointer-events-none absolute -top-40 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-primary opacity-[0.07] blur-3xl md:size-[700px]" />
        <div class="pointer-events-none absolute -bottom-32 left-1/2 size-[300px] -translate-x-1/2 rounded-full bg-primary opacity-[0.04] blur-3xl" />

        <div class="relative z-10 mx-auto max-w-3xl">
          <div class="animate-[fade-up_0.6s_ease-out]">
            <h1 class="font-heading text-4xl font-bold tracking-tight md:text-6xl">
              {{ $t('landing.hero_title') }}<br />
              <span class="text-primary">{{ $t('landing.hero_subtitle') }}</span>
            </h1>
          </div>
          <div class="animate-[fade-up_0.6s_ease-out_0.15s_both]">
            <p class="mt-6 max-w-lg text-muted-foreground md:text-lg">
              {{ $t('landing.hero_description') }}
            </p>
          </div>
          <div class="animate-[fade-up_0.6s_ease-out_0.3s_both]">
            <Button class="mt-8 w-full max-w-xs gap-2" size="lg" @click="goToLogin">
              {{ $t('landing.cta') }}
              <HugeiconsIcon :icon="ArrowRightIcon" :size="18" />
            </Button>
          </div>
        </div>
      </section>

      <section class="relative border-t border-border px-6 py-20 md:py-28">
        <div class="mx-auto max-w-3xl text-center">
          <div class="animate-[fade-up_0.6s_ease-out_both]">
            <h2 class="font-heading text-2xl font-bold">{{ $t('landing.features_title') }}</h2>
            <p class="mt-2 text-muted-foreground">{{ $t('landing.features_subtitle') }}</p>
          </div>
        </div>
        <div class="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-3">
          <div class="animate-[fade-up_0.6s_ease-out_0.1s_both]">
            <Card class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent class="flex flex-col items-center p-6 text-center">
                <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                  <HugeiconsIcon :icon="ArrowLeftRightIcon" :size="22" class="text-primary" />
                </div>
                <h3 class="mt-5 font-heading font-semibold">{{ $t('landing.feature_transactions') }}</h3>
                <p class="mt-2 text-sm text-muted-foreground">{{ $t('landing.feature_transactions_desc') }}</p>
              </CardContent>
            </Card>
          </div>
          <div class="animate-[fade-up_0.6s_ease-out_0.2s_both]">
            <Card class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent class="flex flex-col items-center p-6 text-center">
                <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                  <HugeiconsIcon :icon="RepeatIcon" :size="22" class="text-primary" />
                </div>
                <h3 class="mt-5 font-heading font-semibold">{{ $t('landing.feature_recurring') }}</h3>
                <p class="mt-2 text-sm text-muted-foreground">{{ $t('landing.feature_recurring_desc') }}</p>
              </CardContent>
            </Card>
          </div>
          <div class="animate-[fade-up_0.6s_ease-out_0.3s_both]">
            <Card class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent class="flex flex-col items-center p-6 text-center">
                <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                  <HugeiconsIcon :icon="Home03Icon" :size="22" class="text-primary" />
                </div>
                <h3 class="mt-5 font-heading font-semibold">{{ $t('landing.feature_dashboard') }}</h3>
                <p class="mt-2 text-sm text-muted-foreground">{{ $t('landing.feature_dashboard_desc') }}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section class="relative border-t border-border px-6 py-20 md:py-28">
        <div class="mx-auto max-w-2xl">
          <div class="animate-[fade-up_0.6s_ease-out_both] text-center">
            <h2 class="font-heading text-2xl font-bold">{{ $t('landing.faq_title') }}</h2>
          </div>
          <Accordion type="single" collapsible class="mt-12">
            <AccordionItem value="free">
              <AccordionTrigger>{{ $t('landing.faq_free_q') }}</AccordionTrigger>
              <AccordionContent>
                {{ $t('landing.faq_free_a') }}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="couple">
              <AccordionTrigger>{{ $t('landing.faq_couple_q') }}</AccordionTrigger>
              <AccordionContent>
                {{ $t('landing.faq_couple_a') }}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="security">
              <AccordionTrigger>{{ $t('landing.faq_security_q') }}</AccordionTrigger>
              <AccordionContent>
                {{ $t('landing.faq_security_a') }}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="mobile">
              <AccordionTrigger>{{ $t('landing.faq_mobile_q') }}</AccordionTrigger>
              <AccordionContent>
                {{ $t('landing.faq_mobile_a') }}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section class="relative overflow-hidden border-t border-border px-6 py-20 text-center md:py-28">
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        <div class="pointer-events-none absolute left-1/2 top-0 size-[400px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div class="relative z-10 mx-auto max-w-lg">
          <div class="animate-[fade-up_0.6s_ease-out_both]">
            <h2 class="font-heading text-2xl font-bold">{{ $t('landing.cta_section_title') }}</h2>
            <p class="mt-2 text-muted-foreground">
              {{ $t('landing.cta_section_desc') }}
            </p>
          </div>
          <div class="animate-[fade-up_0.6s_ease-out_0.15s_both]">
            <Button class="mt-8 w-full max-w-xs gap-2" size="lg" @click="goToLogin">
              {{ $t('landing.cta') }}
              <HugeiconsIcon :icon="ArrowRightIcon" :size="18" />
            </Button>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">
      {{ $t('landing.meta_title') }}
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ArrowRightIcon, ArrowLeftRightIcon, RepeatIcon, Home03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

const { t } = useI18n()

definePageMeta({ layout: 'blank' })

useHead({
  title: computed(() => t('landing.meta_title')),
})

const router = useRouter()
const goToLogin = () => router.push('/login')
</script>
