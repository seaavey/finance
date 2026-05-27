<template>
  <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 pt-20 pb-24 md:pt-32 md:pb-40">
    <!-- Premium Dynamic Background -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30">
        <div class="absolute top-[-10%] left-[-10%] size-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div class="absolute bottom-[-10%] right-[-10%] size-[400px] rounded-full bg-blue-500/10 blur-[100px] animate-pulse [animation-delay:3s]" />
      </div>
      <!-- Grid Overlay -->
      <div class="absolute inset-0 opacity-20 brightness-100 contrast-150" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" />
    </div>

    <div class="relative z-10 mx-auto max-w-6xl w-full">
      <!-- Animated Badge -->
      <div class="flex justify-center mb-10">
        <div class="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/60 px-4 py-1.5 text-sm font-medium backdrop-blur-md transition-all hover:border-primary/40 hover:bg-background/80 shadow-sm">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span class="text-muted-foreground group-hover:text-foreground transition-colors">{{ $t('landing.hero_badge') }}</span>
          <HugeiconsIcon :icon="ArrowRightIcon" :size="12" class="text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
        </div>
      </div>

      <!-- Main Headline -->
      <div class="text-center max-w-4xl mx-auto">
        <h1 class="font-heading text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1]">
          {{ heroTitleStart }}
          <span class="relative inline-block mt-2 sm:mt-0">
            <span class="relative z-10 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              {{ heroTitleHighlight }}
            </span>
            <div class="absolute -bottom-2 left-0 w-full h-3 bg-primary/10 -rotate-1 -z-10 rounded-full blur-[2px]" />
          </span>
        </h1>
        <p class="mt-8 text-lg text-muted-foreground md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed font-medium">
          {{ $t('landing.hero_desc') }}
        </p>
      </div>

      <!-- Enhanced CTA -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
        <Button class="w-full sm:w-auto h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all gap-3" size="lg" @click="goToLogin">
          {{ $t('landing.hero_cta') }}
          <HugeiconsIcon :icon="ArrowRightIcon" :size="20" class="animate-bounce-x" />
        </Button>
        <Button variant="outline" class="w-full sm:w-auto h-14 px-8 rounded-2xl text-lg font-bold backdrop-blur-sm hover:bg-muted/50 transition-all border-border/60 gap-3" size="lg" @click="scrollToFeatures">
          <HugeiconsIcon :icon="PlayCircleIcon" :size="20" />
          {{ $t('landing.hero_demo') }}
        </Button>
      </div>

      <!-- Micro-Trust Badges -->
      <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-12 text-xs md:text-sm font-semibold text-muted-foreground">
        <span class="flex items-center gap-2 group cursor-default"><div class="rounded-full p-1 bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all"><HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="14" /></div> {{ $t('landing.hero_free') }}</span>
        <span class="flex items-center gap-2 group cursor-default"><div class="rounded-full p-1 bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all"><HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="14" /></div> {{ $t('landing.hero_noads') }}</span>
        <span class="flex items-center gap-2 group cursor-default"><div class="rounded-full p-1 bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all"><HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="14" /></div> {{ $t('landing.hero_secure') }}</span>
      </div>

      <!-- Premium Dashboard Preview -->
      <div class="relative mt-20 md:mt-28 perspective-1000 group">
        <!-- Floating Glows around the card -->
        <div class="absolute -top-10 -left-10 size-40 bg-primary/20 blur-[80px] rounded-full animate-float" />
        <div class="absolute -bottom-10 -right-10 size-40 bg-blue-500/20 blur-[80px] rounded-full animate-float [animation-delay:2s]" />

        <!-- Main Card with 3D-like hover -->
        <div class="relative rounded-3xl border border-border/40 bg-background/60 shadow-2xl shadow-primary/10 backdrop-blur-xl overflow-hidden transition-all duration-700 group-hover:shadow-primary/20 group-hover:border-primary/20 group-hover:-rotate-x-1 group-hover:rotate-y-1">
          <!-- Browser-like Top bar -->
          <div class="flex items-center gap-3 border-b border-border/40 px-6 py-4 bg-muted/20">
            <div class="flex gap-2">
              <div class="h-3.5 w-3.5 rounded-full bg-[#FF5F57] shadow-inner" />
              <div class="h-3.5 w-3.5 rounded-full bg-[#FFBD2E] shadow-inner" />
              <div class="h-3.5 w-3.5 rounded-full bg-[#28C840] shadow-inner" />
            </div>
            <div class="flex-1 flex justify-center">
              <div class="rounded-full bg-muted/40 px-6 py-1.5 text-[11px] font-medium text-muted-foreground border border-border/20 flex items-center gap-2">
                <HugeiconsIcon :icon="Shield01Icon" :size="10" />
                seaavey.site/dashboard
              </div>
            </div>
          </div>

          <!-- Dashboard Mockup Content -->
          <div class="p-6 md:p-10">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Cards with inner glow -->
              <div class="rounded-2xl border border-border/40 bg-muted/20 p-6 relative overflow-hidden group/card transition-all hover:bg-muted/30 hover:border-primary/20">
                <div class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                <p class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{{ $t('landing.hero_preview.balance') }}</p>
                <p class="mt-2 text-3xl font-bold font-heading">Rp 12.450.000</p>
                <div class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500">
                  <HugeiconsIcon :icon="ArrowUp01Icon" :size="12" />
                  <span>{{ $t('landing.hero_preview.trend') }}</span>
                </div>
              </div>

              <div class="rounded-2xl border border-border/40 bg-muted/20 p-6 transition-all hover:bg-muted/30">
                <p class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{{ $t('landing.hero_preview.income') }}</p>
                <p class="mt-2 text-3xl font-bold font-heading text-green-500">Rp 18.200.000</p>
                <div class="mt-5 flex gap-1">
                  <div class="h-2 flex-1 rounded-full bg-green-500/20"><div class="h-full w-3/4 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /></div>
                </div>
              </div>

              <div class="rounded-2xl border border-border/40 bg-muted/20 p-6 transition-all hover:bg-muted/30">
                <p class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{{ $t('landing.hero_preview.expense') }}</p>
                <p class="mt-2 text-3xl font-bold font-heading text-red-400">Rp 5.750.000</p>
                <div class="mt-5 flex gap-1">
                  <div class="h-2 flex-1 rounded-full bg-red-500/20"><div class="h-full w-1/3 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" /></div>
                </div>
              </div>
            </div>

            <!-- Enhanced Chart row -->
            <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6 md:mt-8">
              <div class="md:col-span-3 rounded-2xl border border-border/40 bg-muted/20 p-6">
                <div class="flex items-center justify-between mb-6">
                  <p class="text-base font-bold">{{ $t('landing.hero_preview.chart_title') }}</p>
                  <div class="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{{ $t('landing.hero_preview.chart_period') }}</div>
                </div>
                <div class="flex items-end gap-3 h-32">
                  <div v-for="(h, i) in [40, 65, 45, 80, 55, 70, 50]" :key="i" class="flex-1 rounded-t-lg bg-primary/30 relative group/bar hover:bg-primary/50 transition-all duration-300" :style="{ height: `${h}%` }">
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">Rp {{ h }}0k</div>
                  </div>
                </div>
                <div class="flex justify-between mt-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  <span>{{ $t('landing.hero_preview.days.mon') }}</span>
                  <span>{{ $t('landing.hero_preview.days.tue') }}</span>
                  <span>{{ $t('landing.hero_preview.days.wed') }}</span>
                  <span>{{ $t('landing.hero_preview.days.thu') }}</span>
                  <span>{{ $t('landing.hero_preview.days.fri') }}</span>
                  <span>{{ $t('landing.hero_preview.days.sat') }}</span>
                  <span>{{ $t('landing.hero_preview.days.sun') }}</span>
                </div>
              </div>

              <!-- Simplified Transaction List -->
              <div class="md:col-span-2 rounded-2xl border border-border/40 bg-muted/20 p-6">
                <p class="text-base font-bold mb-5">{{ $t('landing.hero_preview.recent_title') }}</p>
                <div class="space-y-4">
                  <div v-for="(tx, i) in previewTransactions" :key="i" class="flex items-center gap-4 group/tx cursor-default">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all" :class="tx.bg">
                      <HugeiconsIcon :icon="tx.icon" :size="18" :class="tx.color" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold truncate group-hover/tx:text-primary transition-colors">{{ $t(tx.title) }}</p>
                      <p class="text-[11px] font-medium text-muted-foreground">{{ $t(tx.date) }}</p>
                    </div>
                    <span class="text-sm font-bold" :class="tx.amountColor">{{ tx.amount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Floating stat card -->
        <div class="absolute -right-4 -bottom-6 md:right-8 md:-bottom-8 rounded-3xl border border-primary/20 bg-background/95 p-5 shadow-2xl shadow-primary/20 backdrop-blur-xl hidden sm:block animate-float">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
              <HugeiconsIcon :icon="Wallet01Icon" :size="24" />
            </div>
            <div>
              <p class="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{{ $t('landing.hero_preview.savings') }}</p>
              <p class="text-xl font-black text-green-500">Rp 2.100.000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  ArrowRightIcon,
  ArrowUp01Icon,
  CheckmarkCircle02Icon,
  PlayCircleIcon,
  ShoppingBag01Icon,
  MoneyReceive02Icon,
  CreditCardIcon,
  Wallet01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Button } from '@/components/ui/button';
import { useRouter } from '#imports';

const { t } = useI18n();
const router = useRouter();
const goToLogin = () => router.push('/login');
const scrollToFeatures = () =>
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });

const heroTitleStart = computed(() => {
  const full = t('landing.hero_title');
  const idx = full.indexOf('tanpa');
  return idx === -1 ? full : full.slice(0, idx);
});
const heroTitleHighlight = computed(() => {
  const full = t('landing.hero_title');
  const idx = full.indexOf('tanpa');
  return idx === -1 ? '' : full.slice(idx);
});

const previewTransactions = [
  {
    icon: ShoppingBag01Icon,
    title: 'landing.hero_preview.item_shopping',
    date: 'landing.hero_preview.today',
    amount: '-Rp 350rb',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    amountColor: 'text-red-400',
  },
  {
    icon: MoneyReceive02Icon,
    title: 'landing.hero_preview.item_salary',
    date: 'landing.hero_preview.days_ago_2',
    amount: '+Rp 15jt',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    amountColor: 'text-green-500',
  },
  {
    icon: CreditCardIcon,
    title: 'landing.hero_preview.item_bill',
    date: 'landing.hero_preview.days_ago_3',
    amount: '-Rp 280rb',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    amountColor: 'text-red-400',
  },
];
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

@keyframes bounce-x {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

.animate-bounce-x {
  animation: bounce-x 1s infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}
</style>
