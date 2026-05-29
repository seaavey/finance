<template>
  <footer class="border-t border-border/40 bg-background/95 pt-20 pb-10 px-6">
    <div class="mx-auto max-w-7xl">
      <!-- Top Section: Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <!-- Column 1: Brand -->
        <div class="space-y-6">
          <NuxtLinkLocale to="/" class="flex items-center gap-2 group w-fit">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm"
            >
              <Icon name="hugeicons:wallet-01" :size="20" />
            </div>
            <span
              class="text-xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-500"
            >
              {{ $t('sidebar.finance') }}
            </span>
          </NuxtLinkLocale>
          <p class="text-sm text-muted-foreground leading-relaxed font-medium max-w-60">
            {{ $t('landing.hero_title') }}
          </p>
          <div class="flex items-center gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.labelKey"
              :href="social.href"
              class="h-9 w-9 flex items-center justify-center rounded-lg border border-border/40 bg-muted/20 text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              :aria-label="$t(`landing.${social.labelKey}`)"
            >
              <Icon :name="social.icon" :size="18" />
            </a>
          </div>
        </div>

        <!-- Column 2: Product -->
        <div>
          <h4 class="text-sm font-bold uppercase tracking-wider mb-6 text-foreground">
            {{ $t('landing.footer_product') }}
          </h4>
          <ul class="space-y-4">
            <li v-for="link in productLinks" :key="link.labelKey">
              <Button
                variant="link"
                class="h-auto p-0 text-sm text-muted-foreground font-medium"
                @click="scrollToSection(link.href)"
              >
                {{ $t(link.labelKey) }}
              </Button>
            </li>
          </ul>
        </div>

        <!-- Column 3: Company & Legal -->
        <div>
          <h4 class="text-sm font-bold uppercase tracking-wider mb-6 text-foreground">
            {{ $t('landing.footer_company') }}
          </h4>
          <ul class="space-y-4">
            <li v-for="link in companyLinks" :key="link.labelKey">
              <a
                :href="link.href"
                class="text-sm text-muted-foreground font-medium transition-colors hover:text-primary"
              >
                {{ $t(link.labelKey) }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 4: Newsletter -->
        <div class="space-y-6">
          <h4 class="text-sm font-bold uppercase tracking-wider text-foreground">
            {{ $t('landing.footer_subscribe_title') }}
          </h4>
          <p class="text-sm text-muted-foreground font-medium leading-relaxed">
            {{ $t('landing.footer_subscribe_desc') }}
          </p>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <Icon
                name="hugeicons:mail-01"
                :size="16"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="email"
                :placeholder="$t('landing.footer_subscribe_placeholder')"
                class="w-full h-10 pl-10 pr-3 rounded-xl border border-border/40 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>
            <Button size="sm" class="rounded-xl font-bold px-4">
              {{ $t('landing.footer_subscribe_button') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Copyright -->
      <div
        class="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p class="text-xs text-muted-foreground font-medium">
          {{ $t('landing.footer_copyright', { year: new Date().getFullYear() }) }}
        </p>
        <div class="flex items-center gap-6">
          <a
            v-for="link in legalLinks"
            :key="link.labelKey"
            :href="link.href"
            class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 transition-colors hover:text-primary"
          >
            {{ $t(link.labelKey) }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const socialLinks = [
  { labelKey: 'footer_github', href: '#', icon: 'hugeicons:github' },
  { labelKey: 'footer_twitter', href: '#', icon: 'hugeicons:twitter' },
  { labelKey: 'footer_linkedin', href: '#', icon: 'hugeicons:linkedin-01' },
];

const productLinks = [
  { labelKey: 'landing.nav_features', href: '#features' },
  { labelKey: 'landing.nav_testimonials', href: '#testimonials' },
  { labelKey: 'landing.nav_faq', href: '#faq' },
];

const companyLinks = [
  { labelKey: 'landing.footer_about', href: '#' },
  { labelKey: 'landing.footer_blog', href: '#' },
  { labelKey: 'landing.footer_contact', href: '#' },
];

const legalLinks = [
  { labelKey: 'landing.footer_privacy', href: '#' },
  { labelKey: 'landing.footer_terms', href: '#' },
];

const scrollToSection = (href: string) => {
  const id = href.replace('#', '');
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};
</script>
