# Landing Page Redesign

**Date:** 2026-05-24
**Project:** Finance
**Status:** Approved

## Overview

Redesain landing page di `/` dengan gaya **Modern & Clean** (Stripe/Linear inspired), menggunakan komponen **shadcn-vue** dan **HugeIcons**.

## Sections

### 1. Hero
- **Layout:** Centered text only, tanpa ilustrasi
- **Background:** Subtle dot grid pattern (opacity rendah)
- **Nav bar:** Logo "Finance" di kiri, "Masuk" (outlined) & "Daftar" (solid) di kanan
- **Headline:** "Catat keuangan sendiri atau bareng" — bold, 3xl-4xl
- **Subtitle:** "Lacak pemasukan, pengeluaran, dan saldo — sendirian atau bareng pasangan. Simpel, cepat, tanpa ribet."
- **CTA:** "Mulai Sekarang" — solid dark button dengan arrow icon
- **Components:** `Button` (shadcn-vue)

### 2. Fitur
- **Layout:** 3 equal card grid
- **Header:** "Kenapa Finance?" + subtitle
- **Card 1 - Transaksi:** Icon `ArrowLeftRightIcon`, "Catat pemasukan & pengeluaran harian dengan mudah"
- **Card 2 - Berulang:** Icon `RepeatIcon`, "Atur tagihan & cicilan otomatis tiap bulan"
- **Card 3 - Dashboard:** Icon `Home03Icon`, "Lihat ringkasan keuangan real-time dalam grafik"
- **Components:** `Card`, `CardContent`, `CardHeader`, `CardTitle` (shadcn-vue), HugeIcons

### 3. FAQ
- **Layout:** Accordion, divider lines
- **Pertanyaan:**
  - "Apakah aplikasi ini gratis?"
  - "Bisa dipakai bareng pasangan?"
  - "Data saya aman?"
  - "Bisa diakses dari HP?"
- **Components:** `Accordion` (shadcn-vue)

### 4. Bottom CTA
- **Background:** Soft linear gradient (light gray)
- **Headline:** "Siap mulai?"
- **Subtitle:** "Catat keuanganmu sekarang — sendiri atau bareng pasangan. Gratis."
- **CTA:** "Mulai Sekarang" — solid dark button
- **Components:** `Button` (shadcn-vue)

### 5. Footer
- Simple centered text: "Finance — catat keuangan sendiri atau bareng"

## Visual Style
- **Palette:** White background, black/dark typography, subtle grays
- **Typography:** Bold sans-serif headlines, clean body text
- **Borders:** 1px solid `#e5e5e5`, border-radius 12px untuk card
- **Layout:** `flex min-h-screen flex-col`, max-width containers

## Technical
- **Layout:** `blank` layout (no sidebar)
- **Auth:** Public page — `/` whitelisted in `auth.global.ts`, authenticated users redirected to `/dashboard`
- **Routing:** `/` (Nuxt file-based routing via `app/pages/index.vue`)
