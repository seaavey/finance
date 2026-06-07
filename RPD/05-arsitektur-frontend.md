## 5. Arsitektur Frontend

### 5.1 Struktur Folder

```
src/
├── components/                  # Auto-imported (unplugin-vue-components)
│   ├── ui/                     # shadcn-vue primitives (136+ komponen)
│   │   ├── button/
│   │   ├── card/
│   │   ├── dialog/
│   │   ├── input/
│   │   ├── select/
│   │   ├── table/
│   │   ├── toast/
│   │   ├── progress/
│   │   ├── badge/
│   │   ├── separator/
│   │   └── ... (136+ komponen)
│   ├── charts/                 # Unovis chart wrappers
│   │   ├── DonutChart.vue
│   │   ├── BarChart.vue
│   │   └── LineChart.vue
│   └── landing/                # Landing page sections
│       ├── HeroSection.vue
│       ├── FeaturesSection.vue
│       └── FooterSection.vue
├── composables/                # 18 domain logic files
│   ├── useAuth.ts              # Auth state + Google OAuth
│   ├── useCurrency.ts          # Multi-currency formatting & conversion
│   ├── useTransactions.ts      # CRUD + pagination + search
│   ├── useAccounts.ts          # CRUD + balance calculation
│   ├── useCategories.ts        # CRUD + seed defaults
│   ├── useBudgets.ts           # CRUD + progress tracking
│   ├── useBills.ts             # CRUD + mark as paid
│   ├── useRecurring.ts         # CRUD + toggle active + auto-create due
│   ├── useGoals.ts             # CRUD + add funds + image upload
│   ├── useNetWorth.ts          # Historical net worth calculation
│   ├── useReminders.ts         # Bill due date reminders (7 days)
│   ├── usePartner.ts           # Couple mode CRUD + invitations
│   ├── useActivityLog.ts       # Audit trail logging
│   ├── useExport.ts            # CSV export
│   ├── useReceipts.ts          # OCR receipt scanning
│   ├── useToast.ts             # Toast notification
│   ├── useCamera.ts            # Camera capture
│   └── nuxt-compat.ts          # Nuxt → Vue migration shims
├── layouts/
│   ├── default.vue             # Sidebar + topbar + main content
│   └── blank.vue               # No chrome (landing, login, static)
├── lib/
│   ├── supabase.ts             # Supabase client singleton
│   └── utils.ts                # cn() helper, OG image generator
├── pages/                      # 35 file-based routes
│   ├── index.vue               # Landing page (/)
│   ├── dashboard.vue           # Main dashboard (/dashboard)
│   ├── transactions/           # CRUD transaction pages
│   ├── categories/             # Category management
│   ├── accounts/               # Account management
│   ├── budget/                 # Budget planning
│   ├── bills/                  # Bills management
│   ├── recurring/             # Recurring transactions
│   ├── goals/                  # Financial goals
│   ├── activities/            # Activity log
│   ├── settings.vue           # User settings
│   └── ... (static pages)
├── plugins/
│   └── i18n.ts                # vue-i18n configuration
├── locales/
│   ├── id.json                # Indonesian translations (default)
│   └── en.json                # English translations (fallback)
├── router/
│   └── index.ts               # Router setup + beforeEach guard
└── styles/
    └── globals.css            # Tailwind directives + CSS variables + dark mode
```

### 5.2 Auto-import Configuration

Semua Vue APIs (`ref`, `computed`, `watch`, dll.), vue-router hooks (`useRouter`, `useRoute`), dan composables di `src/composables/` otomatis di-import via `unplugin-auto-import`.

Semua komponen di `src/components/` otomatis di-register via `unplugin-vue-components`.

> **Tidak perlu import manual** — cukup pakai langsung di template/script.

### 5.3 Aliran Data

```
Aksi User → Komponen Vue → Composable (TanStack Query)
  → supabase-js → PostgreSQL (RLS) → Response JSON
  → queryClient.invalidateQueries()
  → Toast sukses/error
```

**Read Strategy:**
| Entity | staleTime | Reasoning |
|--------|-----------|-----------|
| Transactions | 30s | Sering berubah |
| Categories | 5m | Hampir tidak pernah berubah |
| Accounts | 2m | Jarang berubah |
| Budgets | 1m | Statis per bulan |
| Bills | 1m | Status bayar bisa berubah |
| Recurring | 2m | Jarang berubah |
| Goals | 30s | Dana bisa ditambah kapan saja |
| Exchange Rates | 1h | Kurs tidak berubah drastis per menit |
| Activity Logs | 5s | Butuh realtime-ish |
| Net Worth | 1m | Komputasi berat, di-cache |

**Write Pattern:**

```
insert/update/delete → invalidateQueries(queryKey) → toast.success/error → activity.log()
```

---
