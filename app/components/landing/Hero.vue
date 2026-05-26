<template>
  <section class="relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28">
    <!-- Background effects -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 size-150 rounded-full bg-primary/8 blur-[120px]" />
      <div class="absolute bottom-0 right-0 size-100 rounded-full bg-primary/5 blur-[100px]" />
    </div>

    <div class="relative z-10 mx-auto max-w-6xl">
      <!-- Badge -->
      <div class="flex justify-center mb-8 animate-[fade-up_0.5s_ease-out]">
        <div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-sm backdrop-blur-sm">
          <span class="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span class="text-muted-foreground">100+ pengguna aktif</span>
        </div>
      </div>

      <!-- Headline -->
      <div class="text-center max-w-3xl mx-auto">
        <h1 class="font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl leading-tight">
          Kontrol keuangan pribadi
          <br class="hidden sm:block" />
          <span class="text-primary">tanpa ribet.</span>
        </h1>
        <p class="mt-6 text-base text-muted-foreground md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
          Pantau pengeluaran, transaksi rutin, dan saldo — bareng pasangan
          dalam satu dashboard modern.
        </p>
      </div>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 animate-[fade-up_0.5s_ease-out_0.2s_both]">
        <Button class="w-full sm:w-auto gap-2" size="lg" @click="goToLogin">
          Mulai Gratis
          <HugeiconsIcon :icon="ArrowRightIcon" :size="18" />
        </Button>
        <Button variant="outline" class="w-full sm:w-auto gap-2" size="lg" @click="scrollToFeatures">
          <HugeiconsIcon :icon="PlayCircleIcon" :size="18" />
          Lihat Demo
        </Button>
      </div>

      <!-- Trust badges -->
      <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-xs text-muted-foreground animate-[fade-up_0.5s_ease-out_0.3s_both]">
        <span class="flex items-center gap-1.5"><HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="14" class="text-green-500" /> Gratis selamanya</span>
        <span class="flex items-center gap-1.5"><HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="14" class="text-green-500" /> Tanpa iklan</span>
        <span class="flex items-center gap-1.5"><HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="14" class="text-green-500" /> Data terenkripsi</span>
      </div>

      <!-- Dashboard Preview -->
      <div class="relative mt-14 md:mt-20 animate-[fade-up_0.7s_ease-out_0.4s_both]">
        <!-- Glow behind -->
        <div class="absolute inset-0 -m-4 rounded-2xl bg-linear-to-b from-primary/10 via-transparent to-transparent blur-2xl" />

        <!-- Main dashboard card -->
        <div class="relative rounded-2xl border border-border/50 bg-background/80 shadow-2xl shadow-primary/5 backdrop-blur-sm overflow-hidden">
          <!-- Top bar -->
          <div class="flex items-center gap-2 border-b border-border/40 px-4 py-3">
            <div class="flex gap-1.5">
              <div class="h-3 w-3 rounded-full bg-red-500/70" />
              <div class="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div class="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <div class="flex-1 flex justify-center">
              <div class="rounded-md bg-muted/50 px-3 py-1 text-xs text-muted-foreground">seaavey.site/dashboard</div>
            </div>
          </div>

          <!-- Dashboard content -->
          <div class="p-4 md:p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <!-- Balance Card -->
              <div class="rounded-xl border border-border/40 bg-muted/30 p-4">
                <p class="text-xs text-muted-foreground">Saldo Bulan Ini</p>
                <p class="mt-1 text-2xl font-bold font-heading">Rp 12.450.000</p>
                <div class="mt-2 flex items-center gap-1 text-xs text-green-500">
                  <HugeiconsIcon :icon="ArrowUp01Icon" :size="12" />
                  <span>+12.5% dari bulan lalu</span>
                </div>
              </div>

              <!-- Income Card -->
              <div class="rounded-xl border border-border/40 bg-muted/30 p-4">
                <p class="text-xs text-muted-foreground">Pemasukan</p>
                <p class="mt-1 text-2xl font-bold font-heading text-green-500">Rp 18.200.000</p>
                <div class="mt-3 flex gap-1">
                  <div class="h-1.5 flex-1 rounded-full bg-green-500/30"><div class="h-full w-3/4 rounded-full bg-green-500" /></div>
                </div>
              </div>

              <!-- Expense Card -->
              <div class="rounded-xl border border-border/40 bg-muted/30 p-4">
                <p class="text-xs text-muted-foreground">Pengeluaran</p>
                <p class="mt-1 text-2xl font-bold font-heading text-red-400">Rp 5.750.000</p>
                <div class="mt-3 flex gap-1">
                  <div class="h-1.5 flex-1 rounded-full bg-red-500/30"><div class="h-full w-1/3 rounded-full bg-red-400" /></div>
                </div>
              </div>
            </div>

            <!-- Chart + Transactions row -->
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 mt-4 md:mt-6">
              <!-- Mini Chart -->
              <div class="md:col-span-3 rounded-xl border border-border/40 bg-muted/30 p-4">
                <div class="flex items-center justify-between mb-4">
                  <p class="text-sm font-medium">Grafik Pengeluaran</p>
                  <div class="flex gap-1">
                    <span class="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Minggu</span>
                  </div>
                </div>
                <div class="flex items-end gap-2 h-24">
                  <div class="flex-1 rounded-t bg-primary/20 h-[40%]" />
                  <div class="flex-1 rounded-t bg-primary/30 h-[65%]" />
                  <div class="flex-1 rounded-t bg-primary/20 h-[45%]" />
                  <div class="flex-1 rounded-t bg-primary/40 h-[80%]" />
                  <div class="flex-1 rounded-t bg-primary/25 h-[55%]" />
                  <div class="flex-1 rounded-t bg-primary/35 h-[70%]" />
                  <div class="flex-1 rounded-t bg-primary/20 h-[50%]" />
                </div>
                <div class="flex justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
                </div>
              </div>

              <!-- Recent Transactions -->
              <div class="md:col-span-2 rounded-xl border border-border/40 bg-muted/30 p-4">
                <p class="text-sm font-medium mb-3">Transaksi Terakhir</p>
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                      <HugeiconsIcon :icon="ShoppingBag01Icon" :size="14" class="text-orange-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium truncate">Belanja Bulanan</p>
                      <p class="text-[10px] text-muted-foreground">Hari ini</p>
                    </div>
                    <span class="text-xs font-medium text-red-400">-Rp 350rb</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                      <HugeiconsIcon :icon="MoneyReceive02Icon" :size="14" class="text-green-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium truncate">Gaji</p>
                      <p class="text-[10px] text-muted-foreground">2 hari lalu</p>
                    </div>
                    <span class="text-xs font-medium text-green-500">+Rp 15jt</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <HugeiconsIcon :icon="CreditCardIcon" :size="14" class="text-blue-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium truncate">Tagihan Listrik</p>
                      <p class="text-[10px] text-muted-foreground">3 hari lalu</p>
                    </div>
                    <span class="text-xs font-medium text-red-400">-Rp 280rb</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating stat card -->
        <div class="absolute -right-2 -bottom-3 md:right-4 md:-bottom-4 rounded-xl border border-border/50 bg-background/90 p-3 shadow-lg backdrop-blur-sm hidden sm:block">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <HugeiconsIcon :icon="ArrowUp01Icon" :size="16" class="text-green-500" />
            </div>
            <div>
              <p class="text-xs font-medium">Hemat bulan ini</p>
              <p class="text-sm font-bold text-green-500">Rp 2.100.000</p>
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
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Button } from '@/components/ui/button';
import { useRouter } from '#imports';

const router = useRouter();
const goToLogin = () => router.push('/login');
const scrollToFeatures = () =>
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
</script>