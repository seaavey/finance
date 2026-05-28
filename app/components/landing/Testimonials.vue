<template>
  <section id="testimonials" class="relative overflow-hidden py-24 md:py-40">
    <div class="mx-auto max-w-5xl px-6">
      <div class="text-center max-w-2xl mx-auto mb-16 md:mb-24">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary mb-6"
        >
          <Icon name="hugeicons:comment-01" :size="14" />
          {{ $t('landing.testimonials_title') }}
        </div>
        <h2 class="font-heading text-4xl font-bold tracking-tight md:text-5xl">
          {{ $t('landing.testimonials_heading') }}
        </h2>
        <p class="mt-4 text-lg text-muted-foreground font-medium">
          {{ $t('landing.testimonials_desc') }}
        </p>
      </div>
    </div>

    <!-- Marquee Container -->
    <div class="group relative flex overflow-hidden py-12 [--duration:40s] [--gap:2rem]">
      <div
        class="flex shrink-0 animate-marquee items-stretch gap-[--gap] px-[--gap] group-hover:paused"
      >
        <!-- 3 sets of testimonials to ensure full coverage and smooth loop -->
        <template v-for="set in 3" :key="set">
          <div
            v-for="(t, index) in testimonials"
            :key="`t${set}-${index}`"
            class="flex w-[320px] shrink-0 flex-col justify-between rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-sm transition-colors hover:bg-background/60"
            :style="{ marginRight: 'var(--gap)' }"
          >
            <div>
              <!-- Stars -->
              <div class="flex gap-0.5">
                <Icon
                  v-for="n in 5"
                  :key="n"
                  name="hugeicons:star"
                  :size="14"
                  :class="
                    n <= t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'
                  "
                />
              </div>
              <!-- Quote -->
              <p class="mt-4 text-sm text-muted-foreground leading-relaxed italic">
                "{{ rt(t.quote) }}"
              </p>
            </div>

            <!-- Author -->
            <div class="mt-6 flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                :class="getColorClasses(t.color)"
              >
                {{ rt(t.initials) }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{{ rt(t.name) }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ rt(t.role) }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Gradient Overlays for smooth fade -->
    <div
      class="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-background to-transparent"
    />
    <div
      class="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-background to-transparent"
    />
  </section>
</template>

<script setup lang="ts">

const { tm, rt } = useI18n();

interface Testimonial {
  name: string | object;
  role: string | object;
  quote: string | object;
  initials: string | object;
  color: string | object;
  rating: number;
}

const testimonials = tm('landing.testimonials_items') as Testimonial[];

const getColorClasses = (color: string | object) => {
  const colorStr = typeof color === 'string' ? color : rt(color as any);
  switch (colorStr) {
    case 'pink':
      return 'bg-pink-500/15 text-pink-500';
    case 'blue':
      return 'bg-blue-500/15 text-blue-500';
    case 'purple':
      return 'bg-purple-500/15 text-purple-500';
    case 'amber':
      return 'bg-amber-500/15 text-amber-500';
    case 'emerald':
      return 'bg-emerald-500/15 text-emerald-500';
    default:
      return 'bg-primary/15 text-primary';
  }
};
</script>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-1 / 3 * 100%));
  }
}

.animate-marquee {
  animation: marquee var(--duration) linear infinite;
}
</style>
