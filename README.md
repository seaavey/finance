# Aemy Finance ✦

**Kelola Keuangan Pribadi & Bersama**

Aplikasi manajemen keuangan pribadi modern dengan dukungan multi-mata uang, visualisasi interaktif, dan mode pasangan (couple mode) — gratis tanpa iklan.

🌐 **Live:** [seaavey.site](https://seaavey.site)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 💰 **Dashboard interaktif** | Bento-grid dengan balance, chart, budget progress, transaksi terbaru |
| 💳 **Multi-mata uang** | Akun dalam berbagai mata uang, konversi otomatis ke base currency |
| 📊 **Chart visual** | Grafik bulanan (income/expense), donat kategori, net worth line chart |
| 🏷️ **Kategori** | Default Indonesia, bisa dikustom dengan ikon & warna |
| 📋 **Budget planning** | Anggaran per kategori per bulan dengan progress tracking |
| 🔁 **Transaksi berulang** | Daily / weekly / monthly / yearly recurring transactions |
| 🎯 **Goals tracker** | Target finansial dengan progress bar dan upload gambar |
| 💸 **Bills manager** | Manajemen tagihan dengan status paid/unpaid & recurring |
| 👫 **Couple mode** | Bagikan keuangan dengan pasangan — undang via email |
| 📈 **Net worth** | Pantau aset, utang, dan kekayaan bersih dari waktu ke waktu |
| 📥 **Export CSV** | Ekspor transaksi ke CSV |
| 🔔 **Reminder** | Notifikasi tagihan jatuh tempo (7 hari ke depan) |
| 🌙 **Dark mode** | Toggle light/dark theme |
| 🔒 **Aman** | Autentikasi Google OAuth, Row-Level Security di database |

---

## 🚀 Mulai Cepat

```bash
# Clone
git clone https://github.com/seaavey/finance-vite.git
cd finance-vite

# Install dependencies
pnpm install

# Copy environment
cp .env .env.local

# Start dev server
pnpm dev
```

> **Catatan:** `.env` berisi Supabase URL dan anon key yang sudah terhubung ke project live. Untuk development lokal, jalankan `supabase start`.

### Prerequisites

- **Node.js** ^20.19.0 or >=22.12.0
- **pnpm** (recommended package manager)
- **Supabase CLI** (untuk lokal)

---

## 🛠️ Tech Stack

### Frontend

| Teknologi | Kegunaan |
|-----------|----------|
| **Vue 3** + Composition API + `<script setup>` | Framework UI |
| **Vite 8** + Rolldown | Build tool |
| **TypeScript 6** | Type safety |
| **Tailwind CSS v4** | Utility-first styling |
| **shadcn-vue** | UI component library |
| **TanStack Vue Query** | Server state management |
| **vue-router 5** | File-based routing |
| **vue-i18n** | Internasionalisasi |
| **Unovis** | Chart visualisasi |
| **Iconify** (HugeIcons) | Icon set |
| **@unhead/vue** | SEO / meta tags |

### Backend & Infrastructure

| Teknologi | Kegunaan |
|-----------|----------|
| **Supabase** | Database (PostgreSQL), Auth, Storage, Edge Functions |
| **Google OAuth** | Autentikasi |
| **Resend** | Email (undangan pasangan) |
| **Vercel** | Hosting |
| **exchangerate.fun** | API kurs mata uang |

---

## 📁 Struktur Project

```
src/
├── components/       # Auto-imported UI & domain components
│   ├── ui/           # shadcn-vue (136 komponen)
│   ├── charts/       # Unovis chart wrappers
│   └── landing/      # Landing page sections
├── composables/      # Domain logic (useAuth, useTransactions, dll.)
├── layouts/          # default.vue (sidebar), blank.vue (landing)
├── lib/              # supabase client, utility helpers
├── pages/            # File-based routes (35 halaman)
├── router/           # Router guard & layout assignment
└── styles/           # Tailwind + CSS custom properties

supabase/
├── functions/        # Edge Functions (Deno)
│   ├── sync-rates/   # Sinkronisasi kurs mata uang
│   ├── send-couple-invite/  # Email undangan pasangan
│   └── og-image/     # Dynamic Open Graph image
└── migrations/       # 27 timestamped SQL migrations
```

---

## 📄 Halaman & Routing

| Route | Halaman | Layout |
|-------|---------|--------|
| `/` | Landing page | blank |
| `/dashboard` | Dashboard utama | default |
| `/transactions` | Daftar transaksi | default |
| `/transactions/new` | Tambah transaksi | default |
| `/transactions/:id/edit` | Edit transaksi | default |
| `/categories` | Manajemen kategori | default |
| `/budget` | Budget planning | default |
| `/accounts` | Daftar akun | default |
| `/bills` | Manajemen tagihan | default |
| `/recurring` | Transaksi berulang | default |
| `/goals` | Financial goals | default |
| `/activities` | Activity log | default |
| `/settings` | Pengaturan profil | default |
| `/auth/login` | Halaman login | blank |
| `/about` | Tentang | blank |
| `/privacy-policy` | Kebijakan privasi | blank |
| `/terms-of-service` | Syarat & ketentuan | blank |

---

## 🗄️ Database (Supabase)

**10 tabel utama** dengan Row-Level Security:

| Tabel | Fungsi |
|-------|--------|
| `profiles` | Profil user (display name, currency, partner) |
| `categories` | Kategori income/expense |
| `transactions` | Catatan transaksi keuangan |
| `accounts` | Akun bank/e-wallet/cash/investment/liability |
| `budgets` | Anggaran per kategori per bulan |
| `bills` | Tagihan berulang & satu kali |
| `recurring_transactions` | Transaksi berulang |
| `goals` | Target finansial |
| `activity_logs` | Log aktivitas user |
| `couple_invitations` | Undangan pasangan |
| `exchange_rates` | Kurs mata uang (sync dari edge function) |

---

## 📦 Scripts

```bash
pnpm dev              # Dev server (port 5173)
pnpm build            # Type-check + production build
pnpm build-only       # Build tanpa type-check
pnpm preview          # Preview production build
pnpm type-check       # vue-tsc type checking
pnpm lint             # oxlint + eslint --fix
pnpm format           # Prettier formatting
```

---

## 🌐 Lingkungan & Deploy

- **Production:** [seaavey.site](https://seaavey.site) — deploy via Vercel
- **Supabase Project:** Terhubung ke project live (URL & anon key di `.env`)
- **Local DB:** `supabase start` untuk lokal PostgreSQL + Stack

---

## 🤝 Kontribusi

Project ini adalah proyek pribadi. Jika ada saran atau menemukan bug, silakan buka issue atau hubungi langsung.

---

## 📄 Lisensi

Hak cipta © 2026 — [seaavey](https://github.com/seaavey)

---

> Dibuat dengan ❤️ menggunakan Vue 3, Tailwind CSS, Supabase, dan sederet teknologi keren lainnya.
