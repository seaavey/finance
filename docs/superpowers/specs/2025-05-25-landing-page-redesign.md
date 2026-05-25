# Landing Page Redesign — Finance App

## Ringkasan

Redesign landing page dari yang sekarang (centered hero + cards grid) menjadi **Hero Bold + Long Scroll** dengan **Split Hero**, **Alternating Feature Rows**, dan **Playful & Friendly** visual style menggunakan shadcn-vue.

---

## 1. Visual Style

| Aspek | Detail |
|---|---|
| **Mood** | Playful & Friendly — pink dominant, spacing longgar, micro-animations |
| **UI System** | shadcn-vue (existing) — Button, Card, Accordion sudah terpakai |
| **Font** | Inter (existing) — sudah di `global.css` |
| **Warna** | Primary pink oklch (existing), aksen playful dari gradient pink |
| **Background Hero** | Subtle grid pattern + gradient pink blur di sudut |
| **Animasi** | `animate-[fade-up]` scroll entry (existing pattern), hover lift pada cards/buttons |

## 2. Struktur Layout (top-to-bottom)

```
┌──────────────────────────────────┐
│  [Header: Logo | Masuk | Daftar] │
├──────────────────────────────────┤
│  ┌───────────┬────────────────┐  │
│  │ Headline  │  Preview       │  │
│  │ Subtitle  │  Dashboard     │  │
│  │ [Mulai →] │  (grafik +     │  │
│  │           │   transaksi)   │  │
│  └───────────┴────────────────┘  │  ← HERO (split)
├──────────────────────────────────┤
│  ┌───────────┬────────────────┐  │
│  │ [Preview] │ Dasbor & Grafik│  │
│  └───────────┴────────────────┘  │
│  ┌────────────────┬───────────┐  │
│  │ Transaksi Rutin│ [Preview] │  │
│  └────────────────┴───────────┘  │
│  ┌───────────┬────────────────┐  │
│  │ [Preview] │ Kolaborasi     │  │
│  │           │ Pasangan       │  │
│  └───────────┴────────────────┘  │  ← FEATURES (3 alternating rows)
├──────────────────────────────────┤
│  1.000+ Pengguna                 │
│  "Mantap! Keuangan jadi teratur" │  ← TESTIMONIAL (minimal stats)
├──────────────────────────────────┤
│  FAQ Accordion (4-5 items)       │  ← FAQ (existing shadcn accordion)
├──────────────────────────────────┤
│  [Ilustrasi]                     │
│  Siap mulai? Gratis selamanya.   │  ← BOTTOM CTA (illustrated)
│  [Mulai Sekarang →]              │
├──────────────────────────────────┤
│  Finance — catat keuangan sendiri│
│  atau bareng                     │  ← FOOTER
└──────────────────────────────────┘
```

## 3. Komponen Baru

Semua di `app/components/landing/`:

| Komponen | File | Isi |
|---|---|---|
| `LandingHero` | `app/components/landing/Hero.vue` | Split section: kiri headline + subtitle + CTA, kanan preview dashboard (grafik/UI mockup). Background: grid + gradient blur. Animasi fade-up bertahap: teks → CTA → preview |
| `LandingFeatures` | `app/components/landing/Features.vue` | 3 alternating rows: (1) Dasbor & Grafik, (2) Transaksi Berulang, (3) Kolaborasi Pasangan. Masing-masing: screenshot kiri/right + teks + icon. Scroll animation fade-up. Props: `features` array |
| `LandingTestimonials` | `app/components/landing/Testimonials.vue` | Minimal stats: "1.000+ Pengguna" + 1 featured testimoni quote + avatar + rating bintang. Background subtle. |
| `LandingCta` | `app/components/landing/Cta.vue` | Illustrated CTA: ilustrasi playful + headline ajakan + tombol "Mulai Gratis". Background: gradient pink. |
| `LandingFooter` | `app/components/landing/Footer.vue` | Footer simpel: brand name "Finance" + tagline + copyright. |

## 4. Halaman Index (refactor)

`app/pages/index.vue`:
- Header (existing — logo + Masuk/Daftar buttons)
- `<LandingHero />`
- `<LandingFeatures />`
- `<LandingTestimonials />`
- FAQ section (existing — pindahkan dari inline ke sini, masih pakai shadcn Accordion)
- `<LandingCta />`
- `<LandingFooter />`

Semua komponen di-compose di halaman, tanpa logic berat — hanya `goToLogin` dan `definePageMeta`.

## 5. Data Flow

- **Hero**: static copy (headline, subtitle). Preview dashboard adalah static mockup/screenshot (bukan live data) — landing halaman publik, tidak perlu auth.
- **Features**: static array of feature objects (icon, title, description, image/screenshot). Passed sebagai props ke `<LandingFeatures />`.
- **Testimonials**: static data (nama, quote, avatar, rating).
- **CTA**: static copy + tombol → `router.push('/login')`.
- **FAQ**: static items (existing), rendered via Accordion.

Tidak ada fetch API, composable, atau supabase — landing page adalah fully static marketing page.

## 6. Tidak Perlu Ditangani (Out of Scope)

- Screenshot/dashboard preview — akan dummy/default mockup (tidak perlu screenshot real app)
- Multi-language — tetap Bahasa Indonesia
- SEO / meta tags — sudah ditangani Nuxt via `useHead` atau `definePageMeta`
- Analytics tracking
- A/B testing
- Mobile menu / hamburger — hanya header simpel dengan 2 button

## 7. File yang Diubah

| File | Tindakan |
|---|---|
| `app/pages/index.vue` | Refactor — pindahkan section inline ke komponen landing/ |
| `app/components/landing/Hero.vue` | Create |
| `app/components/landing/Features.vue` | Create |
| `app/components/landing/Testimonials.vue` | Create |
| `app/components/landing/Cta.vue` | Create |
| `app/components/landing/Footer.vue` | Create |
