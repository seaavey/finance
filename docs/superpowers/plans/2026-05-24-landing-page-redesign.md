# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page (`/`) with a Modern & Clean style (Stripe/Linear inspired) using shadcn-vue components.

**Architecture:** Single page component (`app/pages/index.vue`) with `blank` layout. Publically accessible — auth middleware already whitelists `/`. No additional routes, composables, or store changes needed.

**Tech Stack:** Nuxt 3, shadcn-vue (Card, Accordion, Button), HugeIcons, Tailwind CSS

---

### Task 1: Rewrite landing page — template

**Files:**
- Modify: `app/pages/index.vue` (full rewrite)

- [ ] **Step 1: Write the complete template**

Replace the entire `<template>` block in `app/pages/index.vue`:

```vue
<template>
  <div class="flex min-h-screen flex-col">
    <!-- Nav -->
    <header class="relative z-10 flex items-center justify-between px-6 py-4">
      <span class="text-lg font-bold">Finance</span>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" @click="goToLogin">Masuk</Button>
        <Button size="sm" @click="goToLogin">Daftar</Button>
      </div>
    </header>

    <main class="flex-1">
      <!-- Hero -->
      <section class="relative overflow-hidden px-6 py-20 text-center md:py-28">
        <div
          class="pointer-events-none absolute inset-0 opacity-[0.04]"
          style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px"
        />
        <div class="relative z-10 mx-auto max-w-xl">
          <h1 class="text-4xl font-extrabold tracking-tight md:text-5xl">
            Catat keuangan<br /><span class="text-muted-foreground">sendiri atau bareng</span>
          </h1>
          <p class="mt-4 text-muted-foreground">
            Lacak pemasukan, pengeluaran, dan saldo — sendirian atau bareng pasangan.
            Simpel, cepat, tanpa ribet.
          </p>
          <Button class="mt-8 w-full max-w-xs gap-2" size="lg" @click="goToLogin">
            Mulai Sekarang
            <HugeiconsIcon :icon="ArrowRightIcon" :size="18" />
          </Button>
        </div>
      </section>

      <!-- Fitur -->
      <section class="border-t border-border px-6 py-16 md:py-20">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="text-2xl font-bold">Kenapa Finance?</h2>
          <p class="mt-2 text-sm text-muted-foreground">Semua yang kamu butuh buat catat keuangan</p>
        </div>
        <div class="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-3">
          <Card>
            <CardContent class="flex flex-col items-center p-6 text-center">
              <div class="flex size-10 items-center justify-center rounded-lg bg-accent">
                <HugeiconsIcon :icon="ArrowLeftRightIcon" :size="20" class="text-primary" />
              </div>
              <h3 class="mt-4 font-semibold">Transaksi</h3>
              <p class="mt-1 text-sm text-muted-foreground">Catat pemasukan & pengeluaran harian dengan mudah</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="flex flex-col items-center p-6 text-center">
              <div class="flex size-10 items-center justify-center rounded-lg bg-accent">
                <HugeiconsIcon :icon="RepeatIcon" :size="20" class="text-primary" />
              </div>
              <h3 class="mt-4 font-semibold">Berulang</h3>
              <p class="mt-1 text-sm text-muted-foreground">Atur tagihan & cicilan otomatis tiap bulan</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="flex flex-col items-center p-6 text-center">
              <div class="flex size-10 items-center justify-center rounded-lg bg-accent">
                <HugeiconsIcon :icon="Home03Icon" :size="20" class="text-primary" />
              </div>
              <h3 class="mt-4 font-semibold">Dashboard</h3>
              <p class="mt-1 text-sm text-muted-foreground">Lihat ringkasan keuangan real-time dalam grafik</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- FAQ -->
      <section class="border-t border-border px-6 py-16 md:py-20">
        <div class="mx-auto max-w-2xl">
          <h2 class="text-center text-2xl font-bold">Pertanyaan Umum</h2>
          <Accordion type="single" collapsible class="mt-10">
            <AccordionItem value="free">
              <AccordionTrigger>Apakah aplikasi ini gratis?</AccordionTrigger>
              <AccordionContent>
                Ya, Finance gratis digunakan. Tidak ada biaya berlangganan.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="couple">
              <AccordionTrigger>Bisa dipakai bareng pasangan?</AccordionTrigger>
              <AccordionContent>
                Tentu! Kamu bisa menghubungkan akun dengan pasangan untuk saling
                lihat transaksi dan kelola keuangan bersama.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="security">
              <AccordionTrigger>Data saya aman?</AccordionTrigger>
              <AccordionContent>
                Data kamu terenkripsi dan aman. Kami menggunakan Supabase sebagai
                backend yang sudah terpercaya.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="mobile">
              <AccordionTrigger>Bisa diakses dari HP?</AccordionTrigger>
              <AccordionContent>
                Bisa. Finance adalah web app responsif yang bisa diakses dari
                browser HP mana pun.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="relative overflow-hidden px-6 py-16 text-center md:py-20">
        <div class="absolute inset-0 bg-gradient-to-b from-muted/50 to-muted/20" />
        <div class="relative z-10 mx-auto max-w-lg">
          <h2 class="text-2xl font-bold">Siap mulai?</h2>
          <p class="mt-2 text-muted-foreground">
            Catat keuanganmu sekarang — sendiri atau bareng pasangan. Gratis.
          </p>
          <Button class="mt-8 w-full max-w-xs gap-2" size="lg" @click="goToLogin">
            Mulai Sekarang
            <HugeiconsIcon :icon="ArrowRightIcon" :size="18" />
          </Button>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
      Finance &mdash; catat keuangan sendiri atau bareng
    </footer>
  </div>
</template>
```

- [ ] **Step 2: Verify template compiles**

Run: `npx biome check app/pages/index.vue`
Expected: No syntax errors (format/style warnings are fine — they're pre-existing)

### Task 2: Rewrite landing page — script

**Files:**
- Modify: `app/pages/index.vue` (script section)

- [ ] **Step 1: Write the script setup**

Replace the `<script setup>` block:

```vue
<script setup lang="ts">
import { ArrowRightIcon, ArrowLeftRightIcon, RepeatIcon, Home03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

definePageMeta({ layout: 'blank' })

const router = useRouter()
const goToLogin = () => router.push('/login')
</script>
```

- [ ] **Step 2: Run lint**

Run: `npx biome check app/pages/index.vue`
Expected: No errors specific to this file (pre-existing warnings unrelated to this file are fine)

- [ ] **Step 3: Verify build**

Run: `npx nuxi prepare`
Expected: Types generated successfully

### Task 3: Polish footer text

**Files:**
- Modify: `app/pages/index.vue` (footer line)

The footer update is already included in the template in Task 1. Verify:
- Footer text changed from `"Finance &mdash; kelola keuangan bareng pasangan"` to `"Finance &mdash; catat keuangan sendiri atau bareng"`
