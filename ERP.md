# Finance — Dokumentasi Alur Sistem (ERP)

> **Untuk Agent**: Dokumen ini adalah referensi alur sistem. Saat menerima task, baca bagian relevan di sini dulu sebelum mengubah kode. Jangan hapus/edit section ini tanpa persetujuan. Jika ada konflik antara `ERP.md` dan `AGENTS.md`, `AGENTS.md` lebih tinggi prioritasnya untuk command/convention, `ERP.md` untuk alur bisnis.

## Aturan untuk Agent

1. **Baca dulu, baru action** — sebelum mengimplementasi fitur atau memperbaiki bug, cari dulu bagian yang relevan di dokumen ini.
2. **Jangan edit file ini** tanpa tujuan yang jelas — dokumen ini adalah referensi alur sistem, bukan kode.
3. **Update ERP.md** jika kamu mengubah alur bisnis signifikan (relasi tabel baru, state baru, flow baru). Update section yang relevan, jangan tambah section duplikat.
4. **Jangan hapus gotchas** — setiap gotcha di section 15 adalah hasil debugging susah payah.
5. **Gunakan diagram alur** di dokumen ini sebagai acuan sebelum nulis kode — pastikan kode kamu ngikutin flow yang udah ada.

## 1. Arsitektur Umum

- **SSR di-skip** untuk auth check (semua client-side).
- **Supabase client singleton** (`app/lib/supabase.ts`) — satu koneksi, dipakai ulang semua komposable.
- **Semua query data via Supabase JS SDK langsung dari browser** — tidak ada Nitro API routes.
- **State management**: `useState` ref di masing-masing composable. Tidak ada Pinia/Vuex.

## 2. Alur Auth & Onboarding

| Langkah             | File                                          | Detail                                                                                             |
| ------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Landing page        | `app/pages/index.vue`                         | Layout `blank`, 6 komponen landing. `useSeoMeta` + `defineOgImage`                                 |
| Login               | `app/pages/login.vue`                         | Layout `blank`. Tombol Google OAuth via `signInWithGoogle()`                                       |
| Auth plugin         | `app/plugins/auth.client.ts`                  | Client-only. Load session di mount, listen `onAuthStateChange`, redirect `/login` → `/dashboard`   |
| Auth middleware     | `app/middleware/auth.global.ts`               | Guard semua route. Skip SSR (`import.meta.server`), skip hash token routes. Panggil `getSession()` |
| Profile auto-create | `supabase/migrations/20260523165600_init.sql` | Trigger `on_auth_user_created` → insert ke `profiles`                                              |
| Currency init       | `app/composables/useCurrency.ts`              | `loadCurrency()` dipanggil dari middleware setelah auth                                            |

**State**: `user` (ref User \| null) di `useAuth`, `defaultCurrency` (ref string) di `useCurrency`.

## 3. Alur Kategori

| Flow         | File                                     | Detail                                                            |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------- |
| Seed default | `app/composables/useCategories.ts:13-29` | Array `DEFAULT_CATEGORIES` — hardcoded bahasa Indonesia           |
| Fetch        | `fetchCategories()`                      | `supabase.from('categories').select('*').order('created_at')`     |
| Add          | `addCategory()`                          | Insert → refetch → toast                                          |
| Update       | `updateCategory()`                       | Update by id → refetch → toast                                    |
| Delete       | `deleteCategory()`                       | Delete by id → refetch → toast                                    |
| Reorder      | `app/pages/categories.vue:183-193`       | `Sortable` drag-n-drop, hanya reorder client-side state           |
| UI           | `CategoryForm.vue`                       | Dialog shadcn-vue, color picker, type selector (readonly on edit) |
| Tab filter   | `categories.vue`                         | Income/Expense tabs, computed filter                              |

**State**: `categories` (ref Category[]), `loading` di composable.
**Layout**: `default` — `categories.vue` render dalam sidebar+topbar layout.

## 4. Alur Transaksi

| Flow            | File                                       | Detail                                                                                                                                            |
| --------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create          | `TransactionForm.vue` → `addTransaction()` | Type selector (income/expense), amount with locale parsing, category picker, currency, date, description. Validasi `!form.amount \|\| !form.date` |
| Read (list)     | `fetchTransactions(filters?)`              | `.order('date', { ascending: false })`. Filter: `eq type`, `eq category_id`, `gte date`, `lte date`, `ilike description`                          |
| Update          | `updateTransaction(id, updates)`           | Partial update → refetch → toast                                                                                                                  |
| Delete          | `deleteTransaction(id)`                    | Delete by id → refetch → toast                                                                                                                    |
| Edit page       | `app/pages/transactions/[id]/edit.vue`     | Fetch single `getTransaction(id)`, render `TransactionForm`, confirm dialog                                                                       |
| New page        | `app/pages/transactions/new.vue`           | Render `TransactionForm` tanpa prop                                                                                                               |
| Filter          | `app/pages/transactions/index.vue:258-276` | Search debounced 300ms, type, category, date range (RangeCalendar), owner filter                                                                  |
| Group by date   | `groupedTransactions` computed             | Key: tanggal string → array transaksi                                                                                                             |
| Monthly summary | Header card                                | Income, expense, difference                                                                                                                       |

**Owner filter** (partner): Ketika `isPartnered`, filter `user_id` dilakukan **client-side** via computed, bukan query.

**State**: `transactions` (ref Transaction[]), `loading` di `useTransactions`.
**Layout**: `default` — `transactions/index.vue`, `transactions/new.vue`, `transactions/[id]/edit.vue` semua render dalam sidebar+topbar layout.

## 5. Alur Transaksi Rutin (Recurring)

| Flow               | Detail                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| Fetch              | `supabase.from('recurring_transactions').select('*').order('next_date')` |
| Create             | `addRecurring()` → insert → refetch → toast                              |
| Update             | `updateRecurring()` → partial update                                     |
| Delete             | `deleteRecurring()` → confirm dialog dulu                                |
| Toggle             | `toggleActive(id, active)` → wrapper `updateRecurring(id, { active })`   |
| Monthly projection | Computed: daily×30, weekly×4, monthly×1, yearly÷12                       |

**Table name gotcha**: Migrasi rename `recurring` → `recurring_transactions` (20260525000000). Composable pakai `recurring_transactions`.
**State**: `recurring` (ref RecurringTransaction[]), `loading` di `useRecurring`.
**Layout**: `default` — `recurring.vue` render dalam sidebar+topbar layout.

## 6. Alur Dashboard

| Komponen       | Source                                   | Detail                                          |
| -------------- | ---------------------------------------- | ----------------------------------------------- |
| Balance card   | `thisMonthTransactions`                  | Income - expense. Trend vs previous month       |
| Income/Expense | `thisMonthTransactions`                  | Filtered by type                                |
| Savings        | `totalIncome - totalExpense` (min 0)     | Clamped ke 0                                    |
| Expense donut  | `app/components/charts/ExpenseDonut.vue` | Per category, current month only                |
| Monthly bar    | `app/components/charts/MonthlyBar.vue`   | 6 bulan terakhir                                |
| Recent         | `RecentTransactions.vue`                 | 5 latest sorted by date                         |
| Partner toggle | `viewMode` ref                           | `all` / `mine` / `partner` — filter client-side |
| Loading        | 3 pulse cards + chart skeleton           | Selagi `loading = true`                         |

**Layout**: `default` — `dashboard.vue` render dalam sidebar+topbar layout.

## 7. Alur Partner/Couple

### 7.1 Mengirim Undangan

| Langkah         | File                                               | Detail                                                                                     |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Invite form     | `settings.vue:165-181`                             | Input email + button, keyup.enter                                                          |
| `sendInvite()`  | `usePartner.ts:97-166`                             | 4 validasi (not self, not partnered, no pending invite), insert, toast, edge function call |
| Edge function   | `supabase/functions/send-couple-invite/index.ts`   | Deno runtime. Deteksi format webhook vs direct API. Cari sender, kirim email via Resend    |
| DB trigger path | `migrations/20260526000000_couple_invitations.sql` | Table `couple_invitations` dengan RLS                                                      |

### 7.2 Menerima Undangan

| Langkah          | File                                                  | Detail                                                                                    |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| List undangan    | `usePartner.ts:67-95`                                 | `fetchInvitations()` → sent (by sender_id) + received (by email with sender profile join) |
| `acceptInvite()` | `usePartner.ts:168-191`                               | Panggil RPC `accept_couple_invitation`, handle error, refetch                             |
| RPC function     | `migrations/20260526000006_accept_invitation_rpc.sql` | Security definer, validasi, single transaction, update both `partner_id`                  |
| `partner_id`     | `migrations/20260526000001_couple_partner_id.sql`     | Kolom di `profiles`, index, helper `is_my_partner()` untuk RLS                            |
| Disconnect       | `disconnectPartner()`                                 | Update `partner_id = null` di kedua profile                                               |

### 7.3 Data Sharing & RLS

Ketika `partner_id` terisi:

- Dashboard & transactions: toggle All/Mine/Partner — filter `user_id` **client-side** via computed, bukan dari DB
- Profile visibility: RLS policy di `profiles` izinkan partner lihat (via `is_my_partner()`)
- `transactions`, `categories`, `recurring`: **tidak ada RLS partner** — hanya berbasis `user_id`. Semua transaksi di-fetch milik user sendiri, filter partner dilakukan client-side

**Layout**: `default` — semua flow partner (send/accept/reject/disconnect) di-render di `settings.vue` dalam sidebar+topbar layout.

Edge function config: `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`.

## 8. Alur Export

| Sheet           | Columns                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| Transaksi       | No, Tanggal, Tipe, Kategori, Jumlah, Mata Uang, Deskripsi                |
| Transaksi Rutin | No, Tipe, Jumlah, Mata Uang, Frekuensi, Tgl Berikutnya, Aktif, Deskripsi |
| Kategori        | No, Nama, Tipe, Warna                                                    |

`useExport.exportAllData()` → fetch all user data → ExcelJS workbook (3 sheets) → Blob → download `finansiil-export-{date}.xlsx`.
**State**: `exporting` (ref boolean).
**Layout**: `default` — trigger export ada di `settings.vue` dalam sidebar+topbar layout.

## 9. Alur Mata Uang (Currency)

| Fitur                 | Detail                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Default               | `IDR` dari `profiles.currency`                                                                    |
| Format                | `Intl.NumberFormat` dengan locale mapping per currency                                            |
| No-decimal currencies | `['IDR', 'JPY', 'KRW', 'VND', 'KHR', 'LAK', 'MMK']` — fraction digits 0                           |
| Parse                 | `parseLocalizedNumber()` — deteksi separator desimal/ribuan via `Intl.NumberFormat.formatToParts` |
| Currency groups       | Southeast Asia (10), East Asia (5), South Asia (5) — 25 currencies total                          |
| Locale mapping        | 16 explicit locale mappings, fallback `en-US`                                                     |

## 10. Alur Keamanan (Security Middleware)

**`server/middleware/security.ts`**: Remove Server & x-powered-by headers. Set CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Block open redirects via query params (`to`, `url`, `redirect`, `next`, dll — absolute URL regex). Block XSS patterns in query strings (`<script`, `javascript:`, `onerror=`). Block SQLi patterns on `/sessions` and `/api/users` paths.

**`server/plugins/error.ts`**: Strip stack trace. Scrub path reflection (404 → "Not Found"). Scrub local filesystem paths (`/Users/`, `/var/www/`).

## 11. UI & Design System

### 11.0 Aturan UI untuk Agent

1. **Jangan buat komponen baru kalau yang existing bisa dipakai** — cek `app/components/ui/` (17 komponen shadcn) dan `app/components/` dulu.
2. **Semua warna via CSS variables** — jangan pakai warna hardcoded Tailwind (kecuali alpha overlay seperti `bg-green-500/10`). `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, dll.
3. **Income = green** (`text-green-500`/`text-emerald-400`), **Expense = red** (`text-red-500`/`text-red-400`).
4. **CTA buttons = pink gradient** (`bg-linear-to-b from-pink-500 to-pink-600`).
5. **Card pattern standar** = `rounded-2xl md:rounded-3xl border border-border/50 bg-card/30 p-4 md:p-6`.
6. **Jangan tambah inline `dark:` classes** — semua dark mode via CSS variables. Cuma `bg-{color}/10` untuk icon bg (itu light mode doang, dark mode warnanya TIDAK perlu diubah karena opacity bikin dia tetap keliatan).
7. **Pendinginan animasi** = `transition-all duration-200` untuk interaksi kecil, `duration-300` untuk hover card, `duration-500` untuk page entry.
8. **Ikon** = `@hugeicons/core-free-icons` + `<HugeiconsIcon :icon="NamaIcon" :size="18" />`.

### 11.1 Design Tokens & Theme

```css
/* app/styles/global.css — Tailwind CSS v4 + CSS Variables */
/* Color mode: system/light/dark  (nuxtjs/color-mode) */
/* Class suffix: '' (none) — prefers .dark, not .dark-mode */

/* Primary: warm pink/rose (#e11d48 area) */
--primary: oklch(0.514 0.222 16.935); /* light */
--primary: oklch(0.455 0.188 13.697); /* dark  */

/* Radius: 0.625rem base */
--radius: 0.625rem;
--radius-sm: calc(0.625rem - 4px); /* ~0.375rem */
--radius-md: calc(0.625rem - 2px); /* ~0.5rem */
--radius-lg: 0.625rem; /* same as base */
--radius-xl: calc(0.625rem + 4px); /* ~0.875rem */
```

- **Color space**: `oklch` — semua warna di :root dan .dark.
- **Font body**: `'Inter', sans-serif` (dari `--font-sans`).
- **Font heading**: `'Inter', sans-serif` (dari `--font-heading`). DM Sans dan JetBrains Mono di-import Google Fonts tapi TIDAK dipakai sebagai variable font — hanya fallback.
- **Sidebar**: Palette terpisah (`--sidebar-*`) dengan warna inverted di light mode, lebih gelap di dark mode.
- **Border**: `--border` di light = solid oklch(0.92...), di dark = `oklch(1 0 0 / 10%)` (transparan).
- **Noise texture**: SVG fractal noise overlay di landing hero (`Hero.vue`).
- **Animasi custom**: `fade-up`, `fade-in`, `noise`, `bounce-x`, `float`, `animate-pulse`.

### 11.2 Komponen UI (shadcn-vue style)

| Package          | Detail                                                     |
| ---------------- | ---------------------------------------------------------- |
| UI system        | shadcn-vue (reka-ui based), style `reka-vega`              |
| Icon library     | `@hugeicons/core-free-icons` + `<HugeiconsIcon>` component |
| Class utility    | `cn()` = clsx + tailwind-merge, dari `app/lib/utils.ts`    |
| Component prefix | `''` (none) — langsung `Button`, `Card`, `Dialog`, dll     |

**17 komponen ui/** (shadcn-vue):
`accordion`, `alert-dialog`, `avatar`, `breadcrumb`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `popover`, `range-calendar`, `select`, `sheet`, `skeleton`, `switch`, `textarea`

### 11.3 Responsive Breakpoint Strategy

| Breakpoint         | Usage                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `default` (mobile) | Single column layouts, full-width cards, bottom sheets instead of dialogs, hamburger menu |
| `sm` (640px)       | Horizontal layouts mulai, side-by-side buttons                                            |
| `md` (768px)       | Sidebar muncul (`md:sticky`), grid 2 kolom, padding naik `p-3 → md:p-4`                   |
| `lg` (1024px)      | Grid 3 kolom, sidebar full-width 240px                                                    |
| `xl` (1280px)      | Grid 3-4 kolom, max container                                                             |

- Semua card `rounded-2xl` di mobile, naik ke `rounded-3xl` di `md:`.
- Sidebar: `fixed` + `-translate-x-full` di mobile, `md:sticky md:translate-x-0`.
- Overlay klik di mobile saat sidebar terbuka: `fixed inset-0 z-40 md:hidden`.
- Tidak ada `xl:` atau `2xl:` breakpoints yang dipakai secara signifikan.

### 11.4 Layout Structure

Dua layout:

- **`default.vue`**: `flex h-screen` — Sidebar (fixed mobile, `md:sticky`, `w-60`) + Topbar (sticky, `h-16`, `backdrop-blur-xl`) + main (`flex-1 p-3 md:p-4 overflow-y-auto`)
- **`blank.vue`**: `min-h-screen bg-background` — landing page & login

Komponen root: `NuxtLoadingIndicator` + `NuxtLayout` + `AppToast` (Teleport body, fixed top-right, TransitionGroup, auto-dismiss 3s).

Sidebar: Logo (`rounded-lg bg-sidebar-primary`), nav links (`rounded-xl px-3 py-2.5`, active: `bg-sidebar-accent`), Settings (`mt-auto`), avatar + logout (border-t), partner badge (border-t).

Topbar: Hamburger (`lg:hidden`, `size-9 rounded-xl border`), Breadcrumb (`hidden md:block`), Search bar (desktop, rounded-2xl, ⌘K badge), Notification bell (decorative, red dot), Theme toggle (rounded-2xl border), CTA "+" pink gradient → `/transactions/new`.

### 11.5 Layout CSS Detail

- **Page container**: inline di setiap page — tidak ada wrapper global.
  - Dashboard: `space-y-5 pb-6`
  - Transactions: `mx-auto max-w-7xl space-y-6`
  - Categories: `mx-auto max-w-6xl space-y-8`
  - Settings: `mx-auto w-full max-w-2xl space-y-8 overflow-hidden px-4 pb-24 md:px-0 md:pb-8 lg:space-y-10`
  - Recurring: `mx-auto max-w-6xl space-y-8`
- **Padding inkonsisten**: `pb-24 md:pb-8` di settings (space for mobile nav bar?).
- **Overflow behavior**: `overflow-hidden` di beberapa page container + `overflow-y-auto` di main layout.

### 11.6 Theme: Color Mode Toggle

3 mode: `system` → `light` → `dark` (cycle).

- Di Topbar: toggle langsung light↔dark (`cycleColorMode` — skip "system").
- Di Landing Navbar: toggle langsung light↔dark (`toggleColorMode` — skip "system").
- Di Settings: cycle semua 3 mode (`system→light→dark→system`).
- Default: `system`, fallback: `light`.
- Class suffix: `''` (kosong) — jadi `.dark` di `<html>`, bukan `.dark-mode`.
- Deteksi di CSS: `@custom-variant dark (&:is(.dark *))`.

**CSS Variables — Light vs Dark:**

| Token          | Light                              | Dark                                      |
| -------------- | ---------------------------------- | ----------------------------------------- |
| `--background` | `oklch(1 0 0)` (white)             | `oklch(0.141 0.005 285.823)` (near black) |
| `--foreground` | `oklch(0.141 0.005 285.823)`       | `oklch(0.985 0 0)` (white)                |
| `--primary`    | `oklch(0.514 0.222 16.935)` (pink) | `oklch(0.455 0.188 13.697)` (darker pink) |
| `--card`       | `oklch(1 0 0)`                     | `oklch(0.21 0.006 285.885)`               |
| `--border`     | `oklch(0.92 0.004 286.32)`         | `oklch(1 0 0 / 10%)` (transparent white)  |
| `--sidebar`    | `oklch(0.985 0 0)` (near white)    | `oklch(0.21 0.006 285.885)`               |
| `--radius`     | `0.625rem`                         | same                                      |

### 11.7 Typography

| Usage                   | Class                                                                                       | Font                  |
| ----------------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| Body                    | `font-sans antialiased`                                                                     | `'Inter', sans-serif` |
| Headings                | `font-heading` atau bold + `tracking-tight`/`tracking-tighter`                              | `'Inter', sans-serif` |
| H1 page title           | `text-3xl font-bold tracking-tight`                                                         | Inter                 |
| Dashboard greeting      | `text-3xl font-bold tracking-tight`                                                         | Inter                 |
| Card value              | `text-xl font-bold`                                                                         | Inter                 |
| Section header          | `text-xs font-bold uppercase tracking-[0.2em]`                                              | Inter                 |
| Landing H1 hero         | `font-heading text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl` | Inter                 |
| Landing H2              | `font-heading text-4xl font-extrabold tracking-tighter md:text-5xl lg:text-6xl`             | Inter                 |
| Landing feature heading | `font-heading text-xl font-bold`                                                            | Inter                 |

**Font files di-import:**

- DM Sans (`400;500;600;700`) — di-import via Google Fonts di `global.css` baris 1
- JetBrains Mono (`400;500;600;700`) — di-import via Google Fonts di `global.css` baris 2
- **Tapi**: `--font-sans` dan `--font-heading` diset ke `'Inter', sans-serif` — jadi DM Sans dan JetBrains Mono tidak terpakai.

**Catatan font heading di component.json:**

```json
{
  "font": "dm-sans", // shadcn font
  "fontHeading": "jetbrains-mono" // shadcn heading font — KONFLIK dengan CSS
}
```

Konfigurasi shadcn ini TIDAK konsisten dengan CSS (yang pake Inter). Ini adalah legacy/artifact.

### 11.8 Spacing & Sizing

| Scale             | Example                                                                      |
| ----------------- | ---------------------------------------------------------------------------- |
| Base unit         | `gap-3` (12px), `space-y-4` (16px), `p-4` (16px)                             |
| Card inner        | `p-4 md:p-5 md:p-6`                                                          |
| Page horizontal   | `px-4` atau `p-3 md:p-4` (dari main layout)                                  |
| Section vertical  | `space-y-6` (32px) atau `space-y-8` (32px)                                   |
| Dashboard grid    | `gap-3` (cards), `gap-4` (charts)                                            |
| Feature grid      | `gap-6 md:gap-8`                                                             |
| Icon containers   | `size-9` (36px), `size-10` (40px), `size-11` (44px), `size-12` (48px)        |
| Avatar            | `size-8` (sidebar), `size-14` (partner card), `size-20 md:size-24` (profile) |
| Button CTA height | `h-14` (56px) di landing                                                     |
| Sidebar width     | `w-60` (240px)                                                               |
| Max content       | `max-w-6xl`, `max-w-7xl`, `max-w-3xl`                                        |

### 11.9 Component Spesifik

| Komponen        | Container                                                                                                         | Warna Ikon                                                                                                                                                            | Kelas Penting                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dashboard card  | `rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg` | Balance: `bg-indigo-500/10 text-indigo-400`; Income: `bg-green-500/10 text-green-500`; Expense: `bg-red-500/10 text-red-500`; Savings: `bg-cyan-500/10 text-cyan-500` | Icon: `size-9 rounded-xl`, Trend badge: `rounded-full px-2 py-0.5 text-xs`, Value: `text-xl font-bold`                                                                               |
| TransactionItem | `rounded-3xl border border-border/50 bg-card/30 p-3 md:p-5 hover:border-border hover:bg-card/50`                  | Color dot: `size-3 rounded-full`, bg `size-10 md:size-12 rounded-2xl`                                                                                                 | Amount: income `text-emerald-400`, expense `text-red-400`. Partner badge: `size-5 rounded-full border-2 border-background bg-sidebar-accent -ml-2`                                   |
| SettingsItem    | Button `w-full gap-4 px-4 py-3.5 hover:bg-card/40 active:bg-card/60`                                              | `size-9 rounded-xl` colored bg+text                                                                                                                                   | Label: `truncate text-sm font-semibold`, Value: `text-xs text-muted-foreground` + ArrowRight01Icon                                                                                   |
| Error page      | `max-w-md w-full space-y-6`                                                                                       | N/A                                                                                                                                                                   | Error#: `text-9xl font-extrabold tracking-tighter text-primary/20`, Title: `text-3xl font-bold`, Desc: `text-lg text-muted-foreground`, Buttons: Kembali (default) + Lihat (outline) |
| ConfirmDialog   | shadcn `AlertDialog`                                                                                              | N/A                                                                                                                                                                   | `destructive` variant → `bg-destructive text-white hover:bg-destructive/90`                                                                                                          |

**Landing components** — semua ada di `app/components/landing/`:

| Komponen     | Key Styling                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navbar       | Sticky → `bg-background/80 backdrop-blur-xl` saat scroll >20px. Nav pill: `bg-muted/50 rounded-full`. Mobile: Sheet. IntersectionObserver                                                     |
| Hero         | `animate-pulse` glows, Noise SVG overlay, gradient text `from-primary via-primary/80 to-primary bg-clip-text text-transparent`, 3D hover `group-hover:-rotate-x-1`, `animate-float` stat card |
| Features     | Grid `md:grid-cols-3`, `rounded-[2.5rem]`, hover `-translate-y-2 shadow-2xl shadow-primary/10`, icon `h-16 w-16 rounded-2xl`, inset glow `from-primary/10 via-transparent`                    |
| Testimonials | Infinite marquee (`@keyframes marquee`, `--duration: 40s`), 3× items, hover pause, gradient fade edges                                                                                        |
| FAQ          | Accordion, `rounded-2xl border border-border/40 bg-background/40 backdrop-blur-md hover:-translate-y-1`                                                                                       |
| CTA          | `rounded-[3rem] border bg-background/40 p-8 md:p-20 backdrop-blur-xl`, inner glow `from-primary/5`, button `hover:scale-105`                                                                  |
| Footer       | 4-col grid, gradient logo text, newsletter input, `pt-8 border-t`                                                                                                                             |

### 11.10 Transitions & Animations

| Elemen                   | Animasi                                                                   | CSS                            |
| ------------------------ | ------------------------------------------------------------------------- | ------------------------------ |
| Page entry               | `animate-in fade-in slide-in-from-bottom-4 duration-500`                  | Tailwind (via tw-animate-css)  |
| Landing sections         | `animate-in fade-in slide-in-from-bottom-* duration-700/1000`             | Tailwind                       |
| Card hover               | Lift: `hover:-translate-y-0.5` (or -1, -2), Shadow: `hover:shadow-lg/2xl` | Transition `duration-200/300`  |
| Icon hover               | `group-hover:scale-110 group-hover:rotate-6`                              | Duration `500`                 |
| Button                   | `active:scale-95` atau `active:translate-y-px`                            | Transition                     |
| Sidebar                  | `transition-transform duration-200`                                       | Tailwind                       |
| Toast                    | `TransitionGroup` — enter: `opacity-0 translate-x-4`, leave: opposite     | 300ms ease-out / 200ms ease-in |
| Landing hero glow        | `animate-pulse` (3s delay alternatif)                                     | Tailwind                       |
| Landing floating element | `animate-float` (4s ease-in-out)                                          | Custom `@keyframes float`      |
| Marquee (testimonials)   | `animate-marquee` linear infinite                                         | Custom `@keyframes marquee`    |
| CTA arrow                | `group-hover:translate-x-1`                                               | Duration `300`                 |
| Feature arrow            | `opacity-0 translate-x-4 → group-hover:opacity-100 translate-x-0`         | Duration `500`                 |
| Button bounce arrow      | `animate-bounce-x` (translateX 0→5px)                                     | Custom keyframes               |
| Noise                    | `@keyframes noise` — translate random                                     | Duration pendek, hanya overlay |
| Settings avatar          | `group-hover:scale-105`                                                   | Duration `300`                 |

### 11.11 Skeleton/Loading States

Semua page punya skeleton loading state yang dirender saat `loading = true`:

| Page             | Skeleton                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Dashboard        | 3 pulse cards (`h-28 animate-pulse rounded-2xl bg-card`) + chart placeholder (`h-64`, `h-52`) |
| Transactions     | 3 skeleton items (`Skeleton h-20 rounded-3xl`)                                                |
| Categories       | Tab skeleton + grid 6 skeleton (`Skeleton h-22 rounded-3xl`)                                  |
| Recurring        | 3 skeleton (`Skeleton h-[104px] rounded-3xl`)                                                 |
| Settings         | Profile card (`Skeleton size-20 md:size-24 rounded-full` + text lines) + 3 setting rows       |
| Edit transaction | 4 skeleton rows (`Skeleton h-10/h-12/h-48`)                                                   |

Pattern: `<Skeleton>` dari shadcn (untuk bentuk tidak beraturan) atau `animate-pulse bg-card rounded-2xl` (untuk card placeholder).

### 11.12 Animasi Loading Global

- `NuxtLoadingIndicator` di `app.vue` — bar tipis di atas pas navigasi antar page.
- `ClientOnly` + `<template #fallback>` — skeleton atau div kosong untuk komponen yang bergantung DOM (avatar fallback, theme icon, sidebar user section).

### 11.13 Komponen shadcn yang Dipakai

Semua ada di `app/components/ui/` + langsung import dari `@/components/ui/`:

| Komponen           | Dipakai di                                                | Keterangan                                                           |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------------------------- |
| `Button`           | Hampir semua page                                         | 6 variant (default/outline/secondary/ghost/destructive/link), 7 size |
| `Card` + sub       | Dashboard, Recent                                         | Size `default` / `sm`, shadow-xs, ring-1                             |
| `Dialog`           | Settings (name, currency), CategoryForm, RecurringForm    | Modal                                                                |
| `AlertDialog`      | ConfirmDialog                                             | Konfirmasi destructive actions                                       |
| `Input`            | Settings, RecurringForm, FilterBar, TransactionForm       | Type text/number/date/email                                          |
| `Select` + sub     | TransactionForm, RecurringForm, CategoryPicker, FilterBar | Dropdown                                                             |
| `Popover` + sub    | Transactions filter (date range)                          | Floating card                                                        |
| `RangeCalendar`    | Transactions filter (date range picker)                   | Reka UI calendar                                                     |
| `Switch`           | Recurring, Sidebar (mobile)                               | Toggle                                                               |
| `Skeleton`         | Semua loading state                                       | Pulse animation                                                      |
| `Avatar` + sub     | Sidebar, Settings                                         | Profile photo + fallback initial                                     |
| `Breadcrumb` + sub | AppTopbar                                                 | Navigation breadcrumb                                                |
| `Textarea`         | TransactionForm (description)                             | Multi-line input                                                     |
| `Label`            | RecurringForm, CategoryForm, FilterBar                    | Form label                                                           |
| `Sheet`            | Landing Navbar (mobile menu)                              | Slide-in panel (kanan)                                               |
| `DropdownMenu`     | Landing Navbar (language switcher)                        | Floating menu                                                        |
| `Accordion`        | Landing FAQ                                               | Expandable sections                                                  |

Semua komponen shadcn prefix kosong (`''`), jadi import `Button` bukan `UiButton`.

### 11.14 Icon Library Detail

- **Package**: `@hugeicons/core-free-icons` v4, `@hugeicons/vue` v1
- **Size**: `:size="18"` (default), `:size="16"` (small), `:size="20"` (medium), `:size="24"` (large), `:size="32"` (feature card)
- **Icons sering dipakai** (extracted from codebase):

| Icon                                         | Lokasi                                                               |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `ArrowDown01Icon`                            | Income indicator (green), TransactionForm type selector              |
| `ArrowUp01Icon`                              | Expense indicator (red), TransactionForm type selector               |
| `Wallet01Icon`                               | Logo, Landing, Balance card, Settings header, TransactionForm detail |
| `Add01Icon`                                  | CTA "+" button, Category add button                                  |
| `GridViewIcon`                               | Categories nav, Features section badge                               |
| `RepeatIcon`                                 | Recurring nav, empty state, Features                                 |
| `ArrowLeftRightIcon`                         | Transactions nav, empty state                                        |
| `Search01Icon`                               | Search bar, Topbar                                                   |
| `Calendar01Icon`                             | Date picker icons                                                    |
| `FilterIcon`                                 | Filter toggle                                                        |
| `ArrowRight01Icon`                           | CTA arrows, Settings chevron                                         |
| `Tick01Icon`                                 | Currency selector checkmark                                          |
| `PencilEdit01Icon`                           | Edit action                                                          |
| `Delete01Icon`                               | Delete action                                                        |
| `Logout01Icon`                               | Sign out                                                             |
| `UserIcon` / `Mail01Icon` / `Settings01Icon` | Sidebar/Profile                                                      |
| `Sun01Icon` / `Moon01Icon`                   | Theme toggle                                                         |

### 11.15 Chart.js Configuration

Registered modules:

- **Doughnut**: `ArcElement, Tooltip, Legend`
- **Bar**: `CategoryScale, LinearScale, BarElement, Tooltip`

| Chart        | Container            | Options                                                                                           |
| ------------ | -------------------- | ------------------------------------------------------------------------------------------------- |
| ExpenseDonut | `relative h-[220px]` | `cutout: '70%'`, `borderWidth: 0`, `hoverOffset: 4`, no legend, IDR tooltip                       |
| MonthlyBar   | `relative h-[220px]` | `borderRadius: 6`, `barPercentage: 0.6`, green income / red expense, custom y-axis labels (rb/jt) |

Library: `vue-chartjs` + `chart.js`.

### 11.16 Form Patterns

**TransactionForm** (full page, bukan dialog):

- Type toggle: 2 button, border + bg berubah sesuai active (green glow for income, red glow for expense)
- Amount: `text-5xl font-bold`, no border, keyboard filter (hanya angka, backspace, arrow, dll)
- Locale-aware: `formatNumberOnly` untuk display, `parseLocalizedNumber` untuk parse input
- Currency selector: `Select` with groups (Asia Tenggara, Timur, Selatan) + custom rounded-2xl dropdown
- Date: native `input[type=date]`
- Description: `Textarea`, resize-none
- Validasi: `!form.amount || !form.date` → button disabled
- Save button: pink gradient, `shadow-lg shadow-pink-500/25`
- Delete button (edit mode only): `border-red-500/10 bg-red-500/3 text-red-400`

**RecurringForm** (dialog modal):

- shadcn `Dialog`, `sm:max-w-md`
- Type: `Button` toggle (default/outline, flex-1)
- Amount: `input[type=number]` (bukan locale-aware — inconsistency dengan TransactionForm)
- Frequency: `Select` — daily/weekly/monthly/yearly
- Next date: `input[type=date]`
- Validasi: `!form.amount || !form.next_date`

**CategoryForm** (dialog modal):

- shadcn `Dialog`, `sm:max-w-md`
- Name: `Input` text
- Type: `Select` (disabled on edit — type tidak bisa diubah)
- Color: 12 color swatches (bulat), `scale-110` + `border-foreground` untuk selected
  - Colors: `#22c55e, #3b82f6, #8b5cf6, #f97316, #06b6d4, #ec4899, #ef4444, #a855f7, #14b8a6, #6b7280, #eab308, #f43f5e`
- Validasi: `!form.name || !form.type`

### 11.17 Color Palette (Non-CSS-Variable)

Warna-warna yang dipakai langsung (bukan via CSS variable — biasanya di inline style atau class Tailwind langsung):

| Warna                 | Tailwind Class                          | Lokasi                                   |
| --------------------- | --------------------------------------- | ---------------------------------------- |
| Pink (primary accent) | `from-pink-500 to-pink-600`             | Semua gradient CTA buttons               |
| Indigo (balance)      | `text-indigo-400`, `bg-indigo-500/10`   | Dashboard card                           |
| Green (income)        | `text-green-500`, `bg-green-500/10`     | Income indicators, savings               |
| Red (expense)         | `text-red-500`, `bg-red-500/10`         | Expense indicators, destructive          |
| Emerald (income alt)  | `text-emerald-400`, `bg-emerald-500/10` | TransactionItem, dashboard               |
| Cyan (savings)        | `text-cyan-500`, `bg-cyan-500/10`       | Savings card icon                        |
| Orange (categories)   | `text-orange-400`, `bg-orange-500/10`   | Categories quick action, settings export |
| Pink (feature)        | `bg-pink-500/10 text-pink-500`          | Landing features (couple)                |
| Purple (feature)      | `bg-purple-500/10 text-purple-500`      | Landing features (recurring)             |
| Yellow                | `text-yellow-500 fill-yellow-500`       | Testimonials stars                       |

### 11.18 Catatan Penting (UI Gotchas)

1. **Font DM Sans di-import tapi var font pakai Inter** — `--font-sans` dan `--font-heading` diset ke `'Inter', sans-serif`, bukan DM Sans.
2. **Tidak ada typecheck atau CSS lint** — `bun run lint` cuma ESLint, tidak ada stylelint atau Tailwind linter.
3. **shadcn component prefix kosong** — `prefix: ''` di nuxt.config, jadi komponen dipanggil `Button` bukan `UiButton`.
4. **`cn()` utility** untuk merge class — import dari `~/lib/utils`, bukan `@/lib/utils` (meski `components.json` define `utils: "@/lib/utils"`).
5. **TransitionGroup** dipakai di AppToast untuk animasi toast keluar-masuk.
6. **ClientOnly** wrapper dipakai untuk komponen yang butuh DOM (avatar fallback, theme icon) — SSR fallback-nya skeleton atau div kosong.
7. **Semua button action pakai transition** — `transition-all duration-200` atau `duration-300`.
8. **Spasi horizontal inkonsisten** — `p-3 md:p-4` di main layout, tapi beberapa page pakai `px-4` manual. Page container: `mx-auto w-full max-w-6xl` atau `max-w-7xl`.

## 12. i18n (Internasionalisasi)

### 12.1 Konfigurasi

**Module**: `@nuxtjs/i18n` v10. **Strategy**: `prefix_except_default` — `en` dapat prefix `/en/`, `id` tanpa prefix. **Default**/**Fallback**: `id`.
**Files**: `i18n/locales/id.json` + `en.json` — 386 key identik, 19 namespaces, ICU interpolation `{value}`. Ada array translation (`landing.testimonials_items`).

### 12.2 Pola Pemakaian

| Helper                | Lokasi                                               | Catatan               |
| --------------------- | ---------------------------------------------------- | --------------------- |
| `$t('key')`           | Template (223+)                                      | Auto-imported         |
| `useI18n()` → `{ t }` | 23 file                                              | Auto-imported         |
| `setLocale(code)`     | `settings.vue:503`, `Navbar.vue:94,190`              | Cycle / dropdown      |
| `navigateToLocale`    | `dashboard.vue:261,279`, `transactions/index.vue:12` | Locale-aware navigate |
| `<NuxtLinkLocale>`    | 14 instances                                         | Locale-aware link     |
| `tm()` + `rt()`       | `Testimonials.vue:84,98`                             | Array translation     |

### 12.3 Date Formatting (Inconsistency)

- **Hardcoded `'id-ID'`**: `transactions/index.vue:244,302`, `recurring.vue:237`, `TransactionItem.vue:66`
- **Ternary reaktif**: `dashboard.vue:352,372,496` — `currentLocale === 'id' ? 'id-ID' : 'en-US'`

### 12.4 Currency Formatting (Terpisah)

`useCurrency.ts` punya `getLocale()` sendiri (16 mapping, fallback `en-US`), **tidak** pakai locale dari i18n. Semua composable mutasi lain pakai `useI18n()` untuk toast — kecuali `useCurrency`.

## 13. SEO & Meta

**Module**: `@nuxtjs/seo` v5. `site` config di nuxt.config: url, name, description, defaultLocale `id`. OG image + sitemap `zeroRuntime: true` (build-time).

**Root** (`app.vue`): `defineOgImage('Default', { title: 'Finance', description: 'Kelola keuanganmu dengan mudah.' })`. Tidak ada `useSeoMeta` di root.

**Per-page**: Hanya **Landing** (`index.vue:29-42`) yang punya SEO explicit — `useSeoMeta` dengan title/ogTitle/ogDescription + `twitterCard`. Semua page authenticated (dashboard, transactions, categories, recurring, settings) **tidak punya SEO** — mengandalkan module defaults.

**Error page** (`app/error.vue`): Nuxt error page, hardcoded ID strings, no i18n/SEO. Action: "Kembali ke Beranda" (clearError → `/`) + "Lihat Transaksi".

## 14. Nuxt Config & Package

**Modules** (6): `shadcn-nuxt`, `@nuxtjs/color-mode`, `@nuxtjs/seo`, `@nuxtjs/i18n`, `@nuxt/fonts`, `@nuxt/eslint`.

**Key config**: `colorMode: { classSuffix: '' }` → class `.dark`, bukan `.dark-mode`. `shadcn: { prefix: '' }` → `Button` bukan `UiButton`. `runtimeConfig.public`: `supabaseUrl`, `supabaseAnonKey`, `siteUrl`. No `app.config.ts` or `typescript` override.

**Package manager**: `bun` (bun.lock). **Postinstall**: `nuxt prepare`.

| Package                             | Version          | Fungsi        |
| ----------------------------------- | ---------------- | ------------- |
| `nuxt` / `vue`                      | ^4.4.6 / ^3.5.34 | Framework     |
| `@supabase/supabase-js`             | ^2.106.1         | DB client     |
| `@nuxtjs/i18n`                      | ^10.4.0          | i18n          |
| `shadcn-nuxt` / `reka-ui`           | 2.7.3 / ^2.9.8   | UI components |
| `tailwindcss` / `@tailwindcss/vite` | ^4.3.0           | CSS           |
| `chart.js` + `vue-chartjs`          | ^4.5.1 / ^5.3.3  | Charts        |
| `@hugeicons/core-free-icons`        | ^4.1.4           | Icons         |
| `exceljs`                           | ^4.4.0           | Export        |
| `sortablejs` + `sortablejs-vue3`    | ^1.15.7 / ^1.3.0 | Drag          |
| `typescript`                        | ^6.0.3 (dev)     | Types         |
| `prettier`                          | ^3.5.0 (dev)     | Formatter     |

## 15. TypeScript Types & Interfaces

**No `.d.ts` files, no `app/types/`, no Supabase `Database` type generation.** Semua type inline di composable sebagai exported interface. DB responses di-cast manual (`as Transaction[]`).

| Interface               | File                       | Fields                                                                                                                                                         |
| ----------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Transaction`           | `useTransactions.ts:3-13`  | `id, user_id, type('income'\|'expense'), amount: number, currency, category_id?, description?, date, created_at`                                               |
| `TransactionFilters`    | `useTransactions.ts:15-21` | `type?, category_id?, search?, dateFrom?, dateTo?`                                                                                                             |
| `Category`              | `useCategories.ts:3-11`    | `id, user_id, name, type, icon, color, created_at`                                                                                                             |
| `RecurringTransaction`  | `useRecurring.ts:3-15`     | `id, user_id, type, amount, currency, category_id?, description?, frequency('daily'\|'weekly'\|'monthly'\|'yearly'), next_date, active: bool, created_at`      |
| `CoupleInvitation`      | `usePartner.ts:2-14`       | `id, sender_id, recipient_email, status('pending'\|'accepted'\|'rejected'\|'cancelled'), token, created_at, updated_at, sender?: { display_name, avatar_url }` |
| `PartnerProfile`        | `usePartner.ts:16-21`      | `id, display_name?, avatar_url?, currency`                                                                                                                     |
| `ToastType` / `ToastFn` | `useToast.ts:1-2`          | `'success'\|'error'\|'info'` / `(message: string, type?: ToastType) => void`                                                                                   |

**Tambahan**: `User` dan `SupabaseClient` dari `@supabase/supabase-js`. `error.vue` props **untyped** (`defineProps({ error: Object })`).

## 16. Error Handling Patterns

**Pola mutasi** (add/update/delete) di semua composable: `await supabase.from('tbl').action()` → if `!error`: refresh state + `toast.success(t(...))`, else: `toast.error(t(...))`. Return `{ error }`.

**Tidak ada `try/catch`** di 6/7 composables — satu-satunya: `useExport` (ExcelJS bisa throw).

**Gaps:**

- `fetch*` functions: silent failure (no error toast, state jadi `[]`)
- `seedDefaults()` (useCategories): zero error handling
- `signInWithGoogle()` (useAuth): **throws** (satu-satunya yang throw)
- `signOut()` / `getSession()`: no error handling
- `addCategory()`: return `undefined` silently if `!user.value` (vs addTransaction return `{ error }`)
- Network errors: **unhandled** jika Supabase throw (bukan return `{ error }`) — semua composable cuma check `{ error }` object

**Auth guard** — 3 pola: (A) `return { error }` (useTransaction), (B) `return` silently (useCategories), (C) `toast.error` + return error (usePartner).

**Partner pre-checks** (`sendInvite`): not self, not partnered, no pending invite → masing-masing `toast.error()`.

**Recurring**: **Tidak ada auto-generation** — tidak ada cron/edge function yang bikin transaksi dari recurring. Ini murni scheduler template, monthly projection dihitung client-side.

## 17. Search Implementation

### 17.1 Topbar Search (Visual Only)

`AppTopbar.vue:40-54` — Pencarian di topbar adalah **purely visual/decorative**:

- `<div>` dengan `cursor-pointer` (bukan `<input>`)
- Tidak ada `@click` handler — klik tidak melakukan apa-apa
- `<kbd>⌘K</kbd>` — **tidak ada event listener** Command+K
- Hidden di mobile (`hidden md:block`)
- Label dari i18n `$t('topbar.search')`

### 17.2 Transactions Search (Functional)

`transactions/index.vue:20-31` — Input pencarian yang benar-benar berfungsi:

- `<input>` dengan `v-model="filters.search"`
- `@input="debouncedFetch"` — debounce 300ms
- Filter dikirim ke `fetchTransactions(filters)` sebagai parameter `search`
- Query: `supabase.from('transactions').select('*').ilike('description', '%{search}%')`
- Styling: `rounded-2xl border h-12 pl-12`, focus `border-pink-500/20`

## 18. Routing Map

| Route                    | Layout    | Auth                                       | File                                   |
| ------------------------ | --------- | ------------------------------------------ | -------------------------------------- |
| `/`                      | `blank`   | No                                         | `app/pages/index.vue`                  |
| `/login`                 | `blank`   | No (redirect to dashboard if already auth) | `app/pages/login.vue`                  |
| `/dashboard`             | `default` | Yes                                        | `app/pages/dashboard.vue`              |
| `/transactions`          | `default` | Yes                                        | `app/pages/transactions/index.vue`     |
| `/transactions/new`      | `default` | Yes                                        | `app/pages/transactions/new.vue`       |
| `/transactions/:id/edit` | `default` | Yes                                        | `app/pages/transactions/[id]/edit.vue` |
| `/categories`            | `default` | Yes                                        | `app/pages/categories.vue`             |
| `/recurring`             | `default` | Yes                                        | `app/pages/recurring.vue`              |
| `/settings`              | `default` | Yes                                        | `app/pages/settings.vue`               |

Semua page authenticated (kecuali `/` dan `/login`) dilindungi `app/middleware/auth.global.ts`.

**Middleware flow** (`auth.global.ts:1-28`):

1. Skip server-side (`import.meta.server`)
2. Skip OAuth callback (hash contains `access_token` or query has `code`)
3. Panggil `getSession()` dari useAuth
4. Not authenticated + not on `/login` or `/` → redirect to `/login`
5. Authenticated + on `/login` → redirect to `/dashboard`
6. After auth: `loadCurrency()` background

## 19. Komponen Utama

| Komponen                | Parent                                               | Deskripsi                                                  |
| ----------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| `AppSidebar`            | `layouts/default.vue`                                | Navigasi utama, avatar, partner badge, logout              |
| `AppTopbar`             | `layouts/default.vue`                                | Breadcrumb, search (visual), theme toggle, CTA "+"         |
| `AppToast`              | `app.vue`                                            | Root-level toast notification via ref + TransitionGroup    |
| `TransactionForm`       | `transactions/new.vue`, `transactions/[id]/edit.vue` | Form CRUD transaksi (shared component)                     |
| `CategoryForm`          | `categories.vue`                                     | Dialog modal untuk CRUD kategori (color picker, type)      |
| `RecurringForm`         | `recurring.vue`                                      | Dialog modal untuk CRUD recurring                          |
| `CategoryPicker`        | `TransactionForm`, `FilterBar`                       | Dropdown kategori (shadcn Select, computed filter by type) |
| `ConfirmDialog`         | `categories.vue`, `recurring.vue`, `edit.vue`        | AlertDialog konfirmasi delete (destructive variant)        |
| `FilterBar`             | `transactions/index.vue`                             | Filter search, type, category, date range (RangeCalendar)  |
| `DashboardSummary`      | `dashboard.vue`                                      | 3-4 card: balance, income, expense, savings                |
| `RecentTransactions`    | `dashboard.vue`                                      | 5 transaksi terbaru                                        |
| `ChartsExpenseDonut`    | `dashboard.vue`                                      | Donut chart per kategori (chart.js, current month)         |
| `ChartsMonthlyBar`      | `dashboard.vue`                                      | Bar chart 6 bulan (chart.js, income vs expense)            |
| `SettingsItem`          | `settings.vue`                                       | Row item (icon + label + value + arrow right)              |
| `Landing*` (6 komponen) | `index.vue`                                          | Navbar, Hero, Features, Testimonials, Faq, Cta, Footer     |

## 20. Database Schema (Ringkasan)

```
profiles
  id                uuid PK → auth.users
  display_name      text
  currency          text, default 'IDR'
  avatar_url        text
  partner_id        uuid → auth.users, nullable
  created_at        timestamptz
  updated_at        timestamptz

categories
  id                uuid PK
  user_id           uuid → auth.users
  name              text
  icon              text
  color             text
  type              'income' | 'expense'
  created_at        timestamptz

transactions
  id                uuid PK
  user_id           uuid → auth.users
  category_id       uuid → categories, nullable, on delete set null
  type              'income' | 'expense'
  amount            numeric
  currency          text, default 'IDR'
  description       text
  date              date
  created_at        timestamptz
  updated_at        timestamptz
  INDEX: (user_id, date desc), (user_id, type)

recurring_transactions  (renamed from recurring)
  id                uuid PK
  user_id           uuid → auth.users
  category_id       uuid → categories, nullable
  type              'income' | 'expense'
  amount            numeric
  currency          text, default 'IDR'
  description       text         -- migrated from name column
  frequency         'daily' | 'weekly' | 'monthly' | 'yearly'
  next_date         date
  active            boolean, default true
  created_at        timestamptz
  updated_at        timestamptz
  INDEX: (user_id, active)

couple_invitations
  id                uuid PK
  sender_id         uuid → auth.users (FK changed to profiles in migration 5)
  recipient_email   text
  status            'pending' | 'accepted' | 'rejected' | 'cancelled'
  token             uuid
  created_at        timestamptz
  updated_at        timestamptz
  INDEX: (sender_id), (recipient_email), (token)

todos  (unused/inactive feature — table ada tapi tidak ada UI)
  id                uuid PK
  user_id           uuid → auth.users
  title             text
  is_complete       boolean
  priority          'low' | 'medium' | 'high'
  due_date          date, nullable
  created_at        timestamptz
```

## 21. Migration History

| #   | File                                         | Isi                                                                             |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `20260523165600_init.sql`                    | Core schema (profiles/categories/transactions/recurring), trigger, RLS, indexes |
| 2   | `20260524000000_todos.sql`                   | Table `todos` (unused — no UI)                                                  |
| 3   | `20260524000001_todos_due_date.sql`          | Add `due_date` to todos                                                         |
| 4   | `20260525000000_recurring_rename.sql`        | Rename recurring→recurring_transactions, migrate name→description               |
| 5   | `20260525000001_recurring_fix.sql`           | Idempotent fix: handle partial failure                                          |
| 6   | `20260526000000_couple_invitations.sql`      | couple_invitations table, RLS, indexes                                          |
| 7   | `20260526000001_couple_partner_id.sql`       | partner_id on profiles, is_my_partner(), update SELECT policy                   |
| 8   | `20260526000002_couple_rls.sql`              | Partner SELECT policy on all data tables                                        |
| 9   | `20260526000003_fix_profiles_rls.sql`        | Fix infinite recursion: `auth.uid() = id OR partner_id = auth.uid()`            |
| 10  | `20260526000004_invitation_profiles_rls.sql` | Sender↔recipient profile visibility via invitations join                        |
| 11  | `20260526000005_fix_invitation_fk.sql`       | sender_id FK: auth.users → public.profiles                                      |
| 12  | `20260526000006_accept_invitation_rpc.sql`   | RPC accept_couple_invitation, security definer, row lock                        |

## 22. Ringkasan State Management

8 composables via `useState` ref (no Pinia/Vuex). Semua singleton — key unik menjamin state reusable.

| Composable          | File                          | State                                                                                                    | Methods                                                                                            |
| ------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **useAuth**         | `useAuth.ts`                  | `user`, `loading`                                                                                        | `signInWithGoogle()`, `signOut()`, `getSession()`                                                  |
| **useCategories**   | `useCategories.ts`            | `categories`, `loading`, computed `income/expenseCategories`                                             | `fetchCategories()`, `seedDefaults()`, `add/update/deleteCategory()`                               |
| **useTransactions** | `useTransactions.ts`          | `transactions`, `loading`, computed `monthlySummary`                                                     | `fetchTransactions(filters?)`, `add/update/deleteTransaction()`, `getTransaction()`                |
| **useRecurring**    | `useRecurring.ts`             | `recurring`, `loading`                                                                                   | `fetchRecurring()`, `add/update/deleteRecurring()`, `toggleActive()`                               |
| **useCurrency**     | `useCurrency.ts`              | `defaultCurrency`                                                                                        | `loadCurrency()`, `formatCurrency()`, `formatNumberOnly()`, `parseLocalizedNumber()`               |
| **usePartner**      | `usePartner.ts`               | `partner`, `sent/receivedInvitations`, `loading`, `sending`, computed `isPartnered`/`partnerDisplayName` | `fetchPartner()`, `fetchInvitations()`, `send/accept/reject/cancelInvite()`, `disconnectPartner()` |
| **useExport**       | `useExport.ts`                | `exporting`                                                                                              | `exportAllData()`                                                                                  |
| **useToast**        | `app/composables/useToast.ts` | Module-level ref via `register(fn)`                                                                      | `toast.success()`, `toast.error()`, `toast.info()`                                                 |

Semua composable menggunakan **singleton pattern**: `useState` dengan key unik memastikan state yang sama dipakai ulang di semua komponen yang meng-import composable yang sama.

**Pola umum** di composable:

1. `useState<Type>('key', () => initialValue)` untuk state
2. `useSupabase()` untuk Supabase client (manual import dari `~/lib/supabase`)
3. `useI18n()` untuk `t()` — toast messages
4. `useToast()` untuk `toast.success`/`toast.error`
5. Mutation functions mengikuti pola: call Supabase → if (!error) refresh + toast.success else toast.error

## 23. Catatan Penting (Gotchas)

1. **`useSupabase()` tidak auto-import** — harus `import { useSupabase } from '~/lib/supabase'`
2. **Nama tabel recurring** — di kode pakai `recurring_transactions`, bukan `recurring`
3. **Partner data sharing** — transaksi partner tidak di-query dari DB via RLS. Semua user bisa lihat transaksi mereka sendiri. Filter partner dilakukan **client-side** setelah fetch semua transaksi. Ini berarti partner melihat SEMUA transaksi user (tidak ada RLS untuk partner di tabel transaksi)
4. **No Pinia** — semua state via `useState` ref di composables
5. **No test** — tidak ada test framework/script
6. **i18n default** — `id` (Indonesia), fallback locale `id`
7. **ESLint relaxed** — `no-explicit-any`, `no-unused-vars`, `ban-ts-comment` semuanya OFF
8. **Server middleware** — jangan tambah endpoint yang butuh data response tanpa update security headers
9. **Currency format** — `IDR` dan beberapa currency Asia pakai 0 decimal (Intl.NumberFormat fraction 0)
10. **Toast** — terdaftar di `app.vue` `onMounted`. Jika composable dipanggil sebelum mounted, `toastFn.value` masih null
11. **Date formatting tidak konsisten** — Ada yang hardcoded `'id-ID'`, ada yang ternary `currentLocale === 'id' ? 'id-ID' : 'en-US'`
12. **Recurring bukan auto-generate** — Tidak ada cron/edge function yang bikin transaksi dari recurring. Recurring cuma template scheduler. Monthly projection dihitung client-side
13. **Topbar search adalah visual only** — `<div>` tanpa handler, ⌘K tanpa listener. Hanya `transactions/index.vue` yang punya search functional
14. **SEO minimal** — Hanya landing page yang punya `useSeoMeta`. Page authenticated tidak punya SEO setup
15. **`cn()` import** — Import dari `~/lib/utils`, **bukan** `@/lib/utils` (meski `components.json` define `utils: "@/lib/utils"`)
16. **Font DM Sans di-import tapi var font pakai Inter** — `--font-sans` dan `--font-heading` diset ke `'Inter', sans-serif`, bukan DM Sans
17. **Tidak ada typecheck** — `bun run lint` cuma ESLint, tidak ada vue-tsc atau stylelint
18. **Tidak ada Supabase Database types** — Semua response di-cast manual (`as Transaction[]`). Tidak ada `supabase gen types`
