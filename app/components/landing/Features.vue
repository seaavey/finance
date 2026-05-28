<template>
  <section id="features" class="relative px-6 py-24 md:py-40 overflow-hidden">
    <!-- background decorative elements -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute top-1/2 left-0 size-96 rounded-full bg-primary/5 blur-[120px]" />
      <div class="absolute bottom-0 right-0 size-[500px] rounded-full bg-blue-500/5 blur-[150px]" />
    </div>

    <div class="mx-auto max-w-6xl">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-20 md:mb-28">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <Icon name="hugeicons:grid-view" :size="14" />
          {{ $t('landing.features_title') }}
        </div>
        <h2
          class="font-heading text-4xl font-extrabold tracking-tighter md:text-5xl lg:text-6xl mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100"
        >
          {{ $t('landing.features_heading') }}
        </h2>
        <p
          class="text-lg text-muted-foreground md:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200"
        >
          {{ $t('landing.features_desc') }}
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <div
          v-for="(feature, index) in features"
          :key="feature.titleKey"
          class="group relative rounded-[2.5rem] border border-border/40 bg-background/40 p-8 md:p-10 transition-all duration-500 hover:border-primary/30 hover:bg-background/80 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
          :style="{ animationDelay: `${index * 100 + 400}ms` }"
        >
          <!-- Hover Glow Effect -->
          <div
            class="absolute inset-0 rounded-[2.5rem] bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />

          <div
            class="relative mb-8 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20"
            :class="feature.iconBg"
          >
            <!-- Animated Icon Glow -->
            <div
              class="absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity"
              :class="feature.iconBg"
            />
            <Icon
              :name="feature.icon"
              :size="32"
              :class="feature.iconColor"
              class="relative z-10"
            />
          </div>

          <div class="relative z-10">
            <h3
              class="font-heading text-xl font-bold mb-3 group-hover:text-primary transition-colors"
            >
              {{ $t(feature.titleKey) }}
            </h3>
            <p
              class="text-muted-foreground leading-relaxed font-medium group-hover:text-foreground/80 transition-colors"
            >
              {{ $t(feature.descKey) }}
            </p>
          </div>

          <!-- Decorative Arrow on Hover -->
          <div
            class="absolute bottom-8 right-8 opacity-0 translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0"
          >
            <div
              class="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center text-primary bg-primary/5"
            >
              <Icon name="hugeicons:arrow-right-01" :size="14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Feature {
  titleKey: string;
  descKey: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    titleKey: 'landing.feature_dashboard_title',
    descKey: 'landing.feature_dashboard_desc',
    icon: 'hugeicons:chart',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    titleKey: 'landing.feature_recurring_title',
    descKey: 'landing.feature_recurring_desc',
    icon: 'hugeicons:repeat',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    titleKey: 'landing.feature_couple_title',
    descKey: 'landing.feature_couple_desc',
    icon: 'hugeicons:group',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
  },
  {
    titleKey: 'landing.feature_wallet_title',
    descKey: 'landing.feature_wallet_desc',
    icon: 'hugeicons:wallet-01',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  {
    titleKey: 'landing.feature_export_title',
    descKey: 'landing.feature_export_desc',
    icon: 'hugeicons:file-02',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  {
    titleKey: 'landing.feature_category_title',
    descKey: 'landing.feature_category_desc',
    icon: 'hugeicons:arrange',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500',
  },
];
</script>
