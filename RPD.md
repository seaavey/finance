# RPD — Aemy Finance

> **Product Requirements Document & Technical Reference**
> Generated from codebase analysis — June 2026

---

## 1. Project Overview

| Field            | Detail                                             |
| ---------------- | -------------------------------------------------- |
| **Name**         | Aemy Finance                                       |
| **Tagline**      | Kelola Keuangan Pribadi & Bersama                  |
| **Live URL**     | [seaavey.site](https://seaavey.site)               |
| **Status**       | Production (active)                                |
| **Type**         | Single-page application (SPA)                      |
| **Target Users** | Individuals and couples managing personal finances |
| **Language**     | Indonesian (primary), English support via i18n     |
| **Package Name** | `aemy-finance`                                     |

### 1.1 Vision

A personal finance management app that makes it easy to track income, expenses, budgets, and financial goals — with native multi-currency support and a unique **partner/couple mode** that lets two people share finances transparently.

### 1.2 Key Differentiators

- **Multi-currency first** — accounts can be in different currencies; all balances convert to the user's base currency
- **Partner/couple mode** — invite a partner via email and share financial data
- **Bento-grid dashboard** — visual, interactive dashboard with charts and summaries
- **Completely free** — no ads, no premium tiers
- **Indonesian market focus** — extensive IDR and Southeast Asian currency support

---

## 2. Tech Stack

### 2.1 Frontend

| Category           | Technology                                    | Version         |
| ------------------ | --------------------------------------------- | --------------- |
| **Framework**      | Vue 3 (Composition API + `<script setup>`)    | ^3.5.32         |
| **Build Tool**     | Vite (Rolldown production)                    | ^8.0.8          |
| **Language**       | TypeScript                                    | ~6.0.0          |
| **Styling**        | Tailwind CSS (CSS-first `@theme`)             | ^4.3.0          |
| **UI Library**     | shadcn-vue                                    | ^2.7.3          |
| **Routing**        | vue-router (file-based via vite-plugin-pages) | ^5.0.4          |
| **Data Fetching**  | TanStack Vue Query                            | ^5.100.14       |
| **i18n**           | vue-i18n                                      | ^11.4.4         |
| **Charts**         | Unovis (`@unovis/vue`)                        | ^1.6.5          |
| **Icon Library**   | @iconify/vue (HugeIcons set)                  | ^5.0.1          |
| **SEO**            | @unhead/vue                                   | ^3.1.1          |
| **Utilities**      | @vueuse/core                                  | —               |
| **Drag & Drop**    | sortablejs-vue3                               | ^1.3.0          |
| **CSS Animations** | tw-animate-css                                | ^1.4.0          |
| **Class Merge**    | tailwind-merge / class-variance-authority     | ^3.6.0 / ^0.7.1 |

### 2.2 Backend & Infrastructure

| Category           | Technology                     | Purpose                                      |
| ------------------ | ------------------------------ | -------------------------------------------- |
| **Database**       | Supabase (PostgreSQL)          | All persistent data                          |
| **Auth**           | Supabase Auth                  | Google OAuth, session management             |
| **Storage**        | Supabase Storage               | Goal images, receipts                        |
| **Edge Functions** | Supabase Edge Functions (Deno) | Exchange rate sync, email sending, OG images |
| **Email**          | Resend                         | Partner invitation emails                    |
| **Hosting**        | Vercel                         | Frontend hosting                             |
| **Exchange Rates** | exchangerate.fun API           | Free FX rate data                            |

### 2.3 Dev Tooling

| Tool          | Purpose                   |
| ------------- | ------------------------- |
| oxlint        | Linting (fast Rust-based) |
| eslint        | Additional linting rules  |
| Prettier      | Code formatting           |
| vue-tsc       | Type checking             |
| npm-run-all2  | Parallel script execution |
| Vite DevTools | Vue devtools in dev mode  |
| supabase CLI  | Local Supabase stack      |

---

## 3. UI Design System

### 3.1 Layouts

**Two layouts** applied via `route.meta.layout`:

| Layout    | Used By                          | Structure                                    |
| --------- | -------------------------------- | -------------------------------------------- |
| `default` | All authenticated pages          | Sidebar (left) + Topbar (top) + Main content |
| `blank`   | Landing page, Auth, Static pages | Full-width, no chrome                        |

- Sidebar: 256px fixed, collapsible on mobile, `backdrop-blur-xl` glass effect
- Topbar: Breadcrumbs + Search + Notifications + Theme toggle + CTA
- Main: `flex-1 overflow-y-auto` with `p-3 md:p-6`

### 3.2 Typography

| Property             | Value                                                               |
| -------------------- | ------------------------------------------------------------------- |
| **Body font**        | DM Sans (`--font-sans`)                                             |
| **Heading font**     | JetBrains Mono (`--font-heading`)                                   |
| **Weight palette**   | `font-medium`, `font-bold`, `font-black`                            |
| **Tracking**         | `tracking-tighter` (headings), `tracking-widest` (labels/uppercase) |
| **Uppercase labels** | Common pattern: `text-[10px] font-black uppercase tracking-widest`  |

### 3.3 Color System (OKLCH)

The entire color system uses OKLCH with CSS custom properties. Light theme is the default; dark theme is toggled via `.dark` class.

**Primary colors:**

| Token           | Light                                    | Dark                       | Usage                          |
| --------------- | ---------------------------------------- | -------------------------- | ------------------------------ |
| `--background`  | oklch(1 0 0)                             | oklch(0.141 0.005 285.823) | Page background                |
| `--foreground`  | oklch(0.141 0.005 285.823)               | oklch(0.985 0 0)           | Text color                     |
| `--primary`     | oklch(0.514 0.222 16.935) — **warm red** | oklch(0.455 0.188 13.697)  | Primary actions, active states |
| `--card`        | oklch(1 0 0)                             | oklch(0.21 0.006 285.885)  | Card backgrounds               |
| `--muted`       | oklch(0.967 0.001 286.375)               | oklch(0.274 0.006 286.033) | Secondary/skeleton backgrounds |
| `--destructive` | oklch(0.577 0.245 27.325)                | oklch(0.704 0.191 22.216)  | Delete/danger actions          |
| `--border`      | oklch(0.92 0.004 286.32)                 | oklch(1 0 0 / 10%)         | Borders, dividers              |
| `--radius`      | 0.625rem                                 | 0.625rem                   | Base border radius             |

**Semantic status colors** (inline utility classes, not CSS variables):

| Meaning          | Color (Light)                             |
| ---------------- | ----------------------------------------- |
| Income / Success | Emerald-500 / 600 (`#10b981` / `#059669`) |
| Expense / Loss   | Rose-500 / 600 (`#f43f5e` / `#e11d48`)    |
| Neutral / Info   | Indigo-500 / 600 (`#6366f1` / `#4f46e5`)  |
| Warning          | Amber-500 (`#f59e0b`)                     |

**Chart color palette** (5 values, `--chart-1` through `--chart-5`): warm spectrum from coral through deep red-brown.

### 3.4 Design Patterns

| Pattern              | Implementation                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------- |
| **Bento grid**       | Dashboard uses `grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6` with cards spanning 1-6 cols |
| **Rounded cards**    | `rounded-4xl`, `rounded-3xl`, `rounded-2xl` on cards and sections                            |
| **Glassmorphism**    | `backdrop-blur-xl`, `bg-background/80`, `border-border/50`, `bg-card/50`                     |
| **Card hover**       | `hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5`                                |
| **Icon containers**  | `flex size-10 items-center justify-center rounded-2xl` with status bg tint                   |
| **Progress bars**    | Inline thin bars: `h-1.5 w-full rounded-full bg-muted shadow-inner` with dynamic width       |
| **Skeleton loading** | `animate-pulse rounded-4xl bg-muted/50` for loading states                                   |
| **Empty states**     | Centered icon + text fallback for zero-data views                                            |
| **Dark mode**        | Toggle via `useColorMode()`, applied via `.dark` variant                                     |
| **Responsive**       | Mobile-first: sidebar hidden on mobile, overlay backdrop; topbar adapts                      |

### 3.5 Component Inventory

**shadcn-vue UI Components** (136 components across 27 directories):

| Category     | Components                                                                            |
| ------------ | ------------------------------------------------------------------------------------- |
| Data Display | Avatar (6), Badge, Breadcrumb (7), Calendar (12), RangeCalendar (12)                  |
| Feedback     | Alert Dialog (10), Dialog (10), Progress, Skeleton, Toast                             |
| Forms        | Button, Input, InputGroup (6), Label, NativeSelect (3), Select (11), Switch, Textarea |
| Navigation   | DropdownMenu (14), Sheet (9), Command (9)                                             |
| Overlays     | Popover (7)                                                                           |
| Charts       | Chart (4), Chart-Area, Chart-Bar, Chart-Donut                                         |
| Layout       | Accordion (4), AspectRatio, Separator                                                 |

**Custom Components** (28 components):

| Component                 | Purpose                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `AppSidebar.vue`          | Navigation sidebar with sections, avatar, partner badge       |
| `AppTopbar.vue`           | Top bar with breadcrumbs, search, notifications, theme toggle |
| `AppToast.vue`            | Toast notification renderer                                   |
| `DashboardSummary.vue`    | Dashboard header summary card                                 |
| `BillDashboardWidget.vue` | Bills widget for dashboard                                    |
| `CategoryPicker.vue`      | Category selection component                                  |
| `AccountIcon.vue`         | Account type icon display                                     |
| `AddFundsDialog.vue`      | Dialog for adding funds to goals                              |
| `ConfirmDialog.vue`       | Reusable confirmation dialog                                  |
| `SearchDialog.vue`        | ⌘K search dialog                                              |
| `AppIcon.vue`             | Typed `@iconify/vue` wrapper                                  |
| `SettingsItem.vue`        | Settings page row item                                        |
| `TransactionItem.vue`     | Transaction list row                                          |
| `TransactionList.vue`     | Transaction list container                                    |
| `BudgetProgress.vue`      | Budget progress bar with label                                |
| `ClientOnly.vue`          | SSR-safe client-only rendering wrapper                        |
| `ChartsMonthlyBar.vue`    | Monthly income/expense bar chart (Unovis)                     |
| `ChartsExpenseDonut.vue`  | Expense category donut chart (Unovis)                         |
| `ChartsNetWorthChart.vue` | Net worth line chart                                          |
| `LandingNavbar.vue`       | Landing page navigation                                       |
| `LandingHero.vue`         | Landing page hero section                                     |
| `LandingFeatures.vue`     | Landing page features grid                                    |
| `LandingFaq.vue`          | Landing page FAQ accordion                                    |
| `LandingTestimonials.vue` | Landing page testimonials                                     |
| `LandingCta.vue`          | Landing page call-to-action                                   |
| `LandingFooter.vue`       | Landing page footer                                           |

### 3.6 Animations

| Animation  | CSS                                            | Usage                        |
| ---------- | ---------------------------------------------- | ---------------------------- |
| `fade-up`  | translateY(24px) → 0                           | Page content entrance        |
| `fade-in`  | opacity: 0 → 1                                 | Overlays, dialogs            |
| `noise`    | random translate % pattern                     | Background texture animation |
| `pulse`    | Tailwind `animate-pulse`                       | Skeleton loading             |
| `bounce-x` | translateX bounce                              | CTA arrow icons              |
| `float`    | translateY bounce (4s)                         | Landing preview cards        |
| `ping`     | Tailwind `animate-ping`                        | Live indicator dots          |
| Transition | `duration-200`, `duration-300`, `duration-700` | Hover/state changes          |

### 3.7 Responsive Behavior

| Breakpoint              | Behavior                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Mobile** (< 1024px)   | Sidebar hidden (toggled via `translate-x-full`), overlay with `backdrop-blur-sm`, topbar shows hamburger menu |
| **Desktop** (>= 1024px) | Sidebar sticky at `lg:sticky lg:top-0 lg:h-screen`, always visible                                            |
| **Grid**                | Dashboard uses `md:col-span-* lg:col-span-*` for adaptive bento layout                                        |

---

## 4. Feature Modules

### 4.1 Authentication

| Aspect            | Detail                                                                      |
| ----------------- | --------------------------------------------------------------------------- |
| **Provider**      | Google OAuth via Supabase Auth                                              |
| **Composable**    | `useAuth` (singleton with module-level refs)                                |
| **Flow**          | Sign in → OAuth redirect → session callback → profile auto-created          |
| **Guard**         | Router `beforeEach` — redirects to `/auth/login` if unauthenticated         |
| **Public routes** | `/`, `/login`, `/about`, `/contact`, `/privacy-policy`, `/terms-of-service` |
| **Profile**       | Auto-created on signup via DB trigger `handle_new_user()`                   |
| **Session**       | Lazy-checked; module-level `user` ref shared across all composables         |

### 4.2 Dashboard

| Aspect             | Detail                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Route**          | `/dashboard` (default layout)                                                                                                            |
| **Layout**         | Bento grid (6-column)                                                                                                                    |
| **Widgets**        | Balance hero card, Income/Expense/NetWorth stats, Monthly bar chart, Budget progress, Quick accounts, Recent transactions, Quick actions |
| **Period filter**  | 1D / 7D / 30D / ALL — affects all chart and summary data                                                                                 |
| **Partner filter** | Mine / Partner — filters transactions by user (no "All" mode)                                                                            |
| **Multi-currency** | Summary cards convert all amounts to `activeCurrency` via exchange rates before summing. Partner mode uses partner's currency.           |
| **Data loaded**    | Transactions (6 months), categories, partner, net worth history, recurring, currencies, accounts, budget progress                        |
| **Chart**          | MonthlyBar: daily (1D/7D) or monthly (30D/ALL) income vs expense bars with multi-currency conversion                                     |
| **Empty states**   | Per-widget fallback with icon + message                                                                                                  |

### 4.3 Transactions

| Aspect           | Detail                                                                             |
| ---------------- | ---------------------------------------------------------------------------------- |
| **Routes**       | `/transactions` (list) · `/transactions/new` · `/transactions/:id/edit`            |
| **Composable**   | `useTransactions`                                                                  |
| **CRUD**         | `addTransaction`, `updateTransaction`, `deleteTransaction`, `getTransaction`       |
| **Filtering**    | `TransactionFilters`: type, category_id, search (description), dateFrom, dateTo    |
| **Limit**        | Fetches latest 100 by date DESC                                                    |
| **Search**       | `searchTransactions(term)` — ilike on description, limit 10                        |
| **Summary**      | Income/Expense/Selisih shown **per-currency** (IDR + BND rows) via computed maps   |
| **List row**     | `TransactionItem.vue` component — shows formatted amount in each tx's own currency |
| **Data type**    | `Transaction`: id, user_id, type, amount, currency, category_id, description, date |
| **Activity log** | Logged on every mutation                                                           |

### 4.4 Categories

| Aspect               | Detail                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Routes**           | `/categories` (grid) · `/categories/new` · `/categories/:id/edit`                                                    |
| **Composable**       | `useCategories`                                                                                                      |
| **CRUD**             | `addCategory`, `updateCategory`, `deleteCategory`                                                                    |
| **Defaults**         | Seeded on first login: 4 income + 7 expense categories with Indonesian names and HugeIcons                           |
| **Income defaults**  | Gaji (salary), Freelance, Investasi, Lainnya                                                                         |
| **Expense defaults** | Makanan (food), Transport, Belanja (shopping), Tagihan (bills), Hiburan (entertainment), Kesehatan (health), Lainnya |
| **Data type**        | `Category`: id, user_id, name, type, icon (HugeIcons key), color (hex)                                               |
| **Computed**         | `incomeCategories`, `expenseCategories`                                                                              |

### 4.5 Budget

| Aspect            | Detail                                                                                |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Routes**        | `/budget` (list) · `/budget/new` · `/budget/:id/edit` · `/budget/detail/:id`          |
| **Composable**    | `useBudgets`                                                                          |
| **CRUD**          | `setBudget` (upsert), `deleteBudget`                                                  |
| **Progress**      | `fetchBudgetWithProgress(month)` — joins categories, computes spent from transactions |
| **Monthly scope** | Keyed by `month` string (`YYYY-MM-DD`)                                                |
| **Data type**     | `Budget`: id, user_id, category_id, month, amount                                     |
| **Extended**      | `BudgetWithProgress`: + category_name, color, icon, spent                             |
| **Helpers**       | `getProgress()` — returns percentage, remaining, overspent                            |

### 4.6 Accounts (Multi-Currency)

| Aspect             | Detail                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Routes**         | `/accounts` (list) · `/accounts/new` · `/accounts/:id` · `/accounts/:id/edit`                                    |
| **Composable**     | `useAccounts`                                                                                                    |
| **CRUD**           | `addAccount`, `updateAccount`, `deleteAccount`                                                                   |
| **Types**          | `bank`, `e-wallet`, `cash`, `investment`, `liability`                                                            |
| **Balance**        | Computed from `initial_balance` + net transaction amounts per account                                            |
| **Multi-currency** | `getConvertedBalances()` — converts all account balances to user's base currency via `useCurrency().convertTo()` |
| **Filters**        | Computed: `bankAccounts`, `ewalletAccounts`, `cashAccounts`, `investmentAccounts`, `liabilityAccounts`           |
| **Data type**      | `Account`: id, user_id, name, type, currency, color, icon, initial_balance                                       |

### 4.7 Bills

| Aspect         | Detail                                                                                  |
| -------------- | --------------------------------------------------------------------------------------- |
| **Routes**     | `/bills` (list) · `/bills/new` · `/bills/:id` · `/bills/:id/edit`                       |
| **Composable** | `useBills`                                                                              |
| **CRUD**       | `addBill`, `updateBill`, `deleteBill`                                                   |
| **Status**     | `markAsPaid(id, accountId?)` — sets `is_paid: true` with optional account reference     |
| **Recurrence** | `none`, `weekly`, `monthly`                                                             |
| **Dashboard**  | `BillDashboardWidget` — shows upcoming bills                                            |
| **Data type**  | `Bill`: id, user_id, title, amount, due_date, is_paid, paid_with_account_id, recurrence |

### 4.8 Recurring Transactions

| Aspect         | Detail                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Routes**     | `/recurring` (list) · `/recurring/new` · `/recurring/:id/edit`                                                      |
| **Composable** | `useRecurring`                                                                                                      |
| **CRUD**       | `addRecurring`, `updateRecurring`, `deleteRecurring`, `toggleActive`                                                |
| **Frequency**  | `daily`, `weekly`, `monthly`, `yearly`                                                                              |
| **Data type**  | `RecurringTransaction`: id, user_id, type, amount, currency, category_id, frequency, next_date, active, description |

### 4.9 Goals

| Aspect         | Detail                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Routes**     | `/goals` (grid) · `/goals/new` · `/goals/:id` · `/goals/:id/edit`                          |
| **Composable** | `useGoals`                                                                                 |
| **CRUD**       | `addGoal`, `updateGoal`, `deleteGoal`                                                      |
| **Funds**      | `addFunds(goalId, amount)` — increments current_amount                                     |
| **Image**      | Upload to Supabase Storage bucket `goal-images`                                            |
| **Data type**  | `Goal`: id, user_id, name, target_amount, current_amount, deadline, icon, color, image_url |

### 4.10 Partner / Couple Mode

| Aspect          | Detail                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| **Composable**  | `usePartner`                                                                                          |
| **Invite flow** | Send invite by email → recipient sees pending in Settings → accepts/rejects                           |
| **Accept**      | Via `supabase.rpc('accept_couple_invitation')` — database RPC, not an edge function                   |
| **Disconnect**  | Via `supabase.rpc('disconnect_partner')` — database RPC, not an edge function                         |
| **Email**       | `send-couple-invite` edge function uses Resend                                                        |
| **Data types**  | `CoupleInvitation` (id, sender_id, recipient_email, status, token), `PartnerProfile` (profile subset) |
| **RLS**         | Couples can read each other's profiles and transactions                                               |
| **UI**          | Partner badge in sidebar, partner filter on dashboard, partner section in settings                    |

### 4.11 Activity Log

| Aspect           | Detail                                                                             |
| ---------------- | ---------------------------------------------------------------------------------- |
| **Composable**   | `useActivityLog`                                                                   |
| **Logging**      | Fire-and-forget insert on every entity mutation                                    |
| **Entity types** | transaction, category, budget, goal, bill, account, recurring, todo, partner, auth |
| **Actions**      | created, updated, deleted, login, logout, connected, disconnected                  |
| **Pagination**   | Accumulated logs with page tracking                                                |
| **Filters**      | entityType, action, startDate, endDate                                             |
| **Recent**       | `fetchRecent(limit)` for dashboard/topbar use                                      |

### 4.12 Net Worth

| Aspect          | Detail                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| **Composable**  | `useNetWorth`                                                            |
| **History**     | Monthly snapshots over configurable window (default 6 months)            |
| **Computation** | Assets (non-liability accounts) + Debts (liability accounts) → Net worth |
| **Conversion**  | All amounts converted to base currency (IDR) via exchange rates          |
| **Data type**   | `NetWorthData`: label, assets, debts, netWorth, date                     |
| **Chart**       | Rendered by `ChartsNetWorthChart` (Unovis area chart)                    |

### 4.13 Data Export

| Aspect         | Detail                               |
| -------------- | ------------------------------------ |
| **Composable** | `useExport`                          |
| **Format**     | CSV                                  |
| **Scope**      | All transactions with category names |
| **Trigger**    | From settings page                   |
| **File name**  | `seaavey-export-YYYY-MM-DD.csv`      |

### 4.14 Reminders

| Aspect         | Detail                                                  |
| -------------- | ------------------------------------------------------- |
| **Composable** | `useReminders`                                          |
| **Source**     | Active recurring expense transactions due within 7 days |
| **Storage**    | Dismissed reminders persisted in `localStorage`         |
| **UI**         | Notification bell badge in topbar + popover list        |
| **Dismiss**    | Per-reminder dismissal                                  |

### 4.15 Settings

| Aspect              | Detail                                        |
| ------------------- | --------------------------------------------- |
| **Route**           | `/settings` (default layout)                  |
| **Profile**         | Display name, avatar (from Google)            |
| **Preferences**     | Currency (from supported list), locale        |
| **Partner section** | Manage invitations, accept/reject, disconnect |
| **Export**          | CSV download button                           |
| **Data**            | Reads/writes `profiles` table                 |

### 4.16 Landing Page

| Aspect          | Detail                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| **Route**       | `/` (blank layout)                                                                                |
| **SEO**         | Dynamic OG image via `useSeoMeta` + `/functions/v1/og-image` edge function                        |
| **Sections**    | Hero (animated gradient, dashboard preview mockup) · Features · Testimonials · FAQ · CTA · Footer |
| **Performance** | Below-fold sections lazy-loaded via `defineAsyncComponent`                                        |

---

## 5. Architecture & Patterns

### 5.1 File-Based Routing

```
src/pages/                         → /
  dashboard.vue                    → /dashboard
  transactions/
    index.vue                      → /transactions
    new.vue                        → /transactions/new
    [id]/
      edit.vue                     → /transactions/:id/edit
```

- Powered by `vite-plugin-pages` — no manual route config
- Layout assignment is done in `src/router/index.ts` by matching route paths against a `blankLayoutRoutes` array
- Auth guard in `router.beforeEach` — public routes skip session check entirely

### 5.2 Composable Pattern

Every domain entity has a corresponding composable in `src/composables/usePascalCase.ts`.

**Common structure:**

```typescript
export const useEntity = () => {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()

  // Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['entity', computed(() => user.value?.id), ...filters],
    queryFn: async () => {
      /* supabase query */
    },
    enabled: computed(() => !!user.value),
  })

  // Mutations (CRUD)
  const addEntity = async (data) => {
    /* .insert() + invalidate + toast + activity.log */
  }
  const updateEntity = async (id, updates) => {
    /* .update() + invalidate + toast + activity.log */
  }
  const deleteEntity = async (id) => {
    /* .delete() + invalidate + toast + activity.log */
  }

  return { data, loading, addEntity, updateEntity, deleteEntity }
}
```

### 5.3 Data Fetching (TanStack Vue Query)

| Aspect                 | Convention                                                    |
| ---------------------- | ------------------------------------------------------------- |
| **Query keys**         | `['entityName', user.id, ...optionalFilters]`                 |
| **Stale time**         | 30s (global default)                                          |
| **Enabled**            | `computed(() => !!user.value)` — never fetch before auth      |
| **Mutations**          | Direct Supabase calls, then `queryClient.invalidateQueries()` |
| **Optimistic updates** | Not used — simple invalidate-and-refresh pattern              |

### 5.4 Auth Flow

```
User clicks "Sign in with Google"
  → supabase.auth.signInWithOAuth({ provider: 'google' })
    → OAuth redirect loop
      → Callback lands on /auth/login
        → Router guard checks route.hash for access_token
          → getSession() restores session
            → user ref is populated
              → Redirect to /dashboard
```

- `useAuth` is a **singleton** — `user` and `loading` are module-level refs shared across all composables
- Login/logout are logged to `activity_logs` (fire-and-forget)
- Session check runs once on app mount; subsequent page loads check module state

### 5.5 Activity Logging

- Fire-and-forget inserts to `activity_logs` table
- Called by every CRUD composable after successful mutations
- Failures are silently caught — never blocks the primary action
- Pattern: `activity.log(entityType, action, metadata, entityId?)`

### 5.6 Internationalization

- 11 locale files using vue-i18n
- All user-facing strings use `t('key')` via auto-imported `useI18n()`
- Locale affects date formatting, currency formatting, and month/day names
- Nuxt compatibility layer (`nuxt-compat.ts`) provides `useI18n`, `useLocalePath`, `useColorMode`

---

## 6. API & Database

### 6.1 Database Tables (Supabase PostgreSQL)

All tables have **Row-Level Security (RLS)** enabled and use UUID primary keys.

#### `profiles`

| Column       | Type        | Notes                                     |
| ------------ | ----------- | ----------------------------------------- |
| id           | uuid PK     | References `auth.users` ON DELETE CASCADE |
| display_name | text        | From Google OAuth or user-set             |
| currency     | text        | Default `'IDR'`                           |
| avatar_url   | text        | From Google OAuth                         |
| partner_id   | uuid        | Nullable — references profiles.id         |
| created_at   | timestamptz |                                           |
| updated_at   | timestamptz |                                           |

**Auto-trigger:** `handle_new_user()` creates profile row on user signup.

#### `categories`

| Column  | Type    | Notes                  |
| ------- | ------- | ---------------------- |
| id      | uuid PK | gen_random_uuid()      |
| user_id | uuid FK | auth.users             |
| name    | text    | e.g. "Makanan", "Gaji" |
| icon    | text    | HugeIcons key          |
| color   | text    | Hex color              |
| type    | text    | 'income' or 'expense'  |

#### `transactions`

| Column                  | Type        | Notes                           |
| ----------------------- | ----------- | ------------------------------- |
| id                      | uuid PK     |                                 |
| user_id                 | uuid FK     | auth.users                      |
| category_id             | uuid FK     | categories (ON DELETE SET NULL) |
| type                    | text        | 'income' or 'expense'           |
| amount                  | numeric     |                                 |
| currency                | text        | Default 'IDR'                   |
| description             | text        |                                 |
| date                    | date        |                                 |
| account_id              | uuid FK     | accounts (nullable)             |
| created_at / updated_at | timestamptz |                                 |

#### `accounts`

| Column          | Type    | Notes                                                 |
| --------------- | ------- | ----------------------------------------------------- |
| id              | uuid PK |                                                       |
| user_id         | uuid FK | auth.users                                            |
| name            | text    |                                                       |
| type            | text    | 'bank', 'e-wallet', 'cash', 'investment', 'liability' |
| currency        | text    | e.g. 'IDR', 'USD'                                     |
| color           | text    |                                                       |
| icon            | text    | HugeIcons key                                         |
| initial_balance | numeric |                                                       |

#### `budgets`

| Column                  | Type        | Notes                                |
| ----------------------- | ----------- | ------------------------------------ |
| id                      | uuid PK     |                                      |
| user_id                 | uuid FK     |                                      |
| category_id             | uuid FK     |                                      |
| month                   | text        | 'YYYY-MM-DD' format (first of month) |
| amount                  | numeric     |                                      |
| created_at / updated_at | timestamptz |                                      |

#### `bills`

| Column               | Type    | Notes                       |
| -------------------- | ------- | --------------------------- |
| id                   | uuid PK |                             |
| user_id              | uuid FK |                             |
| title                | text    |                             |
| amount               | numeric |                             |
| due_date             | date    |                             |
| is_paid              | boolean |                             |
| paid_with_account_id | uuid FK | accounts (nullable)         |
| recurrence           | text    | 'none', 'weekly', 'monthly' |

#### `recurring_transactions`

| Column      | Type    | Notes                                  |
| ----------- | ------- | -------------------------------------- |
| id          | uuid PK |                                        |
| user_id     | uuid FK |                                        |
| type        | text    | 'income' / 'expense'                   |
| amount      | numeric |                                        |
| currency    | text    |                                        |
| category_id | uuid FK |                                        |
| frequency   | text    | 'daily', 'weekly', 'monthly', 'yearly' |
| next_date   | date    |                                        |
| active      | boolean |                                        |
| description | text    |                                        |

#### `goals`

| Column                  | Type        | Notes                   |
| ----------------------- | ----------- | ----------------------- |
| id                      | uuid PK     |                         |
| user_id                 | uuid FK     |                         |
| name                    | text        |                         |
| target_amount           | numeric     |                         |
| current_amount          | numeric     |                         |
| deadline                | date        | Nullable                |
| icon                    | text        | Nullable                |
| color                   | text        |                         |
| image_url               | text        | Nullable — from Storage |
| created_at / updated_at | timestamptz |                         |

#### `activity_logs`

| Column      | Type        | Notes                 |
| ----------- | ----------- | --------------------- |
| id          | uuid PK     |                       |
| user_id     | uuid FK     |                       |
| entity_type | text        | See EntityType union  |
| entity_id   | uuid        | Nullable              |
| action      | text        | See ActionType union  |
| metadata    | jsonb       | Flexible context data |
| created_at  | timestamptz |                       |

#### `couple_invitations`

| Column                  | Type        | Notes                                          |
| ----------------------- | ----------- | ---------------------------------------------- |
| id                      | uuid PK     |                                                |
| sender_id               | uuid FK     | auth.users                                     |
| recipient_email         | text        |                                                |
| status                  | text        | 'pending', 'accepted', 'rejected', 'cancelled' |
| token                   | text        | For verification                               |
| created_at / updated_at | timestamptz |                                                |

#### `exchange_rates`

| Column          | Type        | Notes             |
| --------------- | ----------- | ----------------- |
| base_currency   | text        | 'IDR'             |
| target_currency | text        | e.g. 'USD', 'JPY' |
| rate            | numeric     |                   |
| updated_at      | timestamptz |                   |

**Unique constraint:** (base_currency, target_currency)

### 6.2 Storage Buckets

| Bucket        | Purpose            | Files stored as          |
| ------------- | ------------------ | ------------------------ |
| `goal-images` | Goal image uploads | `{user_id}/{uuid}.{ext}` |
| `receipts`    | Receipt snapshots  | `{user_id}/{uuid}.{ext}` |

### 6.3 Edge Functions (Supabase/Deno)

| Function             | Route                              | Purpose                                                                             |
| -------------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| `sync-rates`         | `/functions/v1/sync-rates`         | Fetches exchange rates from exchangerate.fun API, upserts to `exchange_rates` table |
| `send-couple-invite` | `/functions/v1/send-couple-invite` | Sends partner invitation email via Resend                                           |
| `og-image`           | `/functions/v1/og-image`           | Generates dynamic Open Graph PNG using Satori + Resvg                               |

**Auth:** `send-couple-invite` validates JWT Bearer token from caller against Supabase Auth before processing. Falls back gracefully for DB webhook format (no auth needed).

---

## 7. Endpoints Reference

### 7.1 Client-Side API (Composables)

These are all client-side methods that talk directly to Supabase. There is no custom REST API layer.

#### `useAuth`

| Method               | Params | Description                                       |
| -------------------- | ------ | ------------------------------------------------- |
| `signInWithGoogle()` | —      | Initiates Google OAuth flow                       |
| `signOut()`          | —      | Signs out, redirects to login                     |
| `getSession()`       | —      | Restores session from URL hash or existing cookie |

#### `useAccounts`

| Method                         | Params                        | Description                                           |
| ------------------------------ | ----------------------------- | ----------------------------------------------------- |
| `addAccount(data)`             | Omit<Account, id/user_id/...> | Create account                                        |
| `updateAccount(id, updates)`   | id, partial Account           | Update account                                        |
| `deleteAccount(id)`            | id                            | Delete account                                        |
| `getAccountBalance(accountId)` | accountId                     | Compute balance from initial + transactions           |
| `getAccountBalances()`         | —                             | All accounts with computed balances                   |
| `getConvertedBalances()`       | —                             | All accounts with balances converted to base currency |
| `fetchAccounts()`              | —                             | Refetch query                                         |

#### `useTransactions`

| Method                           | Params                            | Description                 |
| -------------------------------- | --------------------------------- | --------------------------- |
| `addTransaction(tx)`             | Omit<Transaction, id/user_id/...> | Create transaction          |
| `updateTransaction(id, updates)` | id, partial Transaction           | Update transaction          |
| `deleteTransaction(id)`          | id                                | Delete transaction          |
| `getTransaction(id)`             | id                                | Get single transaction      |
| `fetchTransactions(filters?)`    | TransactionFilters                | Query with optional filters |
| `searchTransactions(term)`       | string                            | Description ilike search    |

#### `useCategories`

| Method                        | Params                         | Description                  |
| ----------------------------- | ------------------------------ | ---------------------------- |
| `addCategory(data)`           | Omit<Category, id/user_id/...> | Create category              |
| `updateCategory(id, updates)` | id, partial                    | Update category              |
| `deleteCategory(id)`          | id                             | Delete category              |
| `seedDefaults(userId)`        | userId                         | Insert 11 default categories |
| `fetchCategories()`           | —                              | Refetch                      |

#### `useBudgets`

| Method                                 | Params                    | Description                   |
| -------------------------------------- | ------------------------- | ----------------------------- |
| `setBudget(categoryId, month, amount)` | categoryId, month, amount | Create or update budget       |
| `deleteBudget(id, month)`              | id, month                 | Delete budget                 |
| `fetchBudgets(month)`                  | month string              | Fetch budgets for month       |
| `fetchBudgetWithProgress(month)`       | month string              | Budgets with category + spent |

#### `useBills`

| Method                       | Params             | Description       |
| ---------------------------- | ------------------ | ----------------- |
| `addBill(data)`              | Omit<Bill, id/...> | Create bill       |
| `updateBill(id, updates)`    | id, partial Bill   | Update bill       |
| `deleteBill(id)`             | id                 | Delete bill       |
| `markAsPaid(id, accountId?)` | id, accountId?     | Mark bill as paid |
| `fetchBills()`               | —                  | Refetch           |

#### `useRecurring`

| Method                         | Params                             | Description         |
| ------------------------------ | ---------------------------------- | ------------------- |
| `addRecurring(item)`           | Omit<RecurringTransaction, id/...> | Create recurring    |
| `updateRecurring(id, updates)` | id, partial                        | Update recurring    |
| `deleteRecurring(id)`          | id                                 | Delete recurring    |
| `toggleActive(id, active)`     | id, boolean                        | Toggle active state |
| `fetchRecurring()`             | —                                  | Refetch             |

#### `useGoals`

| Method                     | Params                            | Description                  |
| -------------------------- | --------------------------------- | ---------------------------- |
| `addGoal(goal)`            | Omit<Goal, id/.../current_amount> | Create goal (starts at 0)    |
| `updateGoal(id, updates)`  | id, partial                       | Update goal                  |
| `deleteGoal(id)`           | id                                | Delete goal + clean up image |
| `addFunds(goalId, amount)` | id, amount                        | Increment current_amount     |
| `uploadGoalImage(file)`    | File                              | Upload to Supabase Storage   |
| `deleteGoalImage(url)`     | url                               | Delete from Storage          |
| `fetchGoals()`             | —                                 | Refetch                      |

#### `usePartner`

| Method                       | Params          | Description                          |
| ---------------------------- | --------------- | ------------------------------------ |
| `sendInvite(email)`          | recipient email | Create invitation + notify via email |
| `acceptInvite(invitationId)` | id              | Accept via `supabase.rpc()`          |
| `rejectInvite(invitationId)` | id              | Set status to 'rejected'             |
| `cancelInvite(invitationId)` | id              | Set status to 'cancelled'            |
| `disconnectPartner()`        | —               | Invoke `supabase.rpc()` disconnect   |
| `fetchPartner()`             | —               | Refresh partner profile              |
| `fetchInvitations()`         | —               | Refresh both sent and received       |

#### `useActivityLog`

| Method                                          | Params              | Description                     |
| ----------------------------------------------- | ------------------- | ------------------------------- |
| `log(entityType, action, metadata?, entityId?)` | Required + optional | Fire-and-forget activity insert |
| `fetchAll(filters?)`                            | ActivityLogFilters  | Paginated query with filters    |
| `fetchRecent(limit)`                            | number              | Get last N activities           |

#### `useCurrency`

| Method                                 | Params                           | Description                               |
| -------------------------------------- | -------------------------------- | ----------------------------------------- |
| `formatCurrency(amount, currency?)`    | number, optional currency        | Locale-aware currency string              |
| `formatNumberOnly(amount, currency?)`  | number, optional                 | Number formatting only                    |
| `parseLocalizedNumber(str, currency?)` | string, optional                 | Parse user input to number                |
| `convertTo(amount, from, to)`          | amount, fromCurrency, toCurrency | FX conversion via stored rates            |
| `loadCurrency()`                       | —                                | Load user's default currency from profile |

#### `useNetWorth`

| Method                          | Params             | Description                         |
| ------------------------------- | ------------------ | ----------------------------------- |
| `fetchNetWorthHistory(months?)` | number (default 6) | Compute monthly net worth snapshots |

#### `useExport`

| Method            | Params | Description                      |
| ----------------- | ------ | -------------------------------- |
| `exportAllData()` | —      | Download all transactions as CSV |

### 7.2 Supabase Edge Function Endpoints

| Endpoint                              | Method | Auth                                | Description                   |
| ------------------------------------- | ------ | ----------------------------------- | ----------------------------- |
| `/functions/v1/sync-rates`            | GET    | Service Role (cron)                 | Fetch & store exchange rates  |
| `/functions/v1/send-couple-invite`    | POST   | JWT Bearer token or DB webhook      | Send partner invitation email via Resend |
| `/functions/v1/og-image?title=&desc=` | GET    | Public                              | Generate OG image             |

### 7.3 Supabase Direct Queries

All data mutations go through the Supabase JS SDK directly:

- `supabase.from(table).select(...)` — Read
- `supabase.from(table).insert(...)` — Create
- `supabase.from(table).update(...).eq('id', id)` — Update
- `supabase.from(table).delete().eq('id', id)` — Delete
- `supabase.storage.from(bucket)` — File operations
- `supabase.auth.signInWithOAuth(...)` — Auth
- `supabase.functions.invoke(functionName)` — Edge function calls

RLS policies enforce user-level isolation (rows filtered by `auth.uid()` = `user_id`).

---

## 8. Packages (Dependencies)

### 8.1 Production Dependencies

| Package                    | Version           | Category      | Purpose                   |
| -------------------------- | ----------------- | ------------- | ------------------------- |
| `vue`                      | ^3.5.32           | Framework     | Core UI framework         |
| `vue-router`               | ^5.0.4            | Routing       | Client-side routing       |
| `vue-i18n`                 | ^11.4.4           | i18n          | Internationalization      |
| `@supabase/supabase-js`    | ^2.106.2          | Backend       | Supabase client SDK       |
| `@tanstack/vue-query`      | ^5.100.14         | Data Fetching | Server state management   |
| `tailwindcss`              | ^4.3.0            | Styling       | Utility CSS framework     |
| `@tailwindcss/vite`        | ^4.3.0            | Styling       | Tailwind Vite plugin      |
| `class-variance-authority` | ^0.7.1            | UI            | Component variant props   |
| `tailwind-merge`           | ^3.6.0            | UI            | Class merging utility     |
| `tw-animate-css`           | ^1.4.0            | UI            | Tailwind animation CSS    |
| `shadcn-vue`               | ^2.7.3            | UI            | High-level UI components  |
| `@iconify/vue`             | ^5.0.1            | Icons         | Iconify icon component    |
| `@unovis/vue`              | ^1.6.5            | Charts        | Chart components (Unovis) |
| `@unhead/vue`              | ^3.1.1            | SEO           | Document head management  |
| `sortablejs-vue3`          | ^1.3.0            | UX            | Drag-and-drop             |
| `@vueuse/core`             | — (auto-imported) | Utilities     | Composition utilities     |

### 8.2 Dev Dependencies

| Package                         | Version  | Purpose                            |
| ------------------------------- | -------- | ---------------------------------- |
| `typescript`                    | ~6.0.0   | Type checking                      |
| `vite`                          | ^8.0.8   | Build tool & dev server            |
| `@vitejs/plugin-vue`            | ^6.0.6   | Vue SFC compilation                |
| `vite-plugin-pages`             | ^0.33.3  | File-based routing                 |
| `vite-plugin-vue-devtools`      | ^8.1.1   | Vue devtools integration           |
| `vue-tsc`                       | ^3.2.6   | Vue TypeScript checker             |
| `oxlint`                        | ~1.60.0  | Fast Rust-based linter             |
| `eslint`                        | ^10.2.1  | Linter                             |
| `eslint-plugin-vue`             | ~10.8.0  | Vue ESLint rules                   |
| `@vue/eslint-config-typescript` | ^14.7.0  | Vue+TS ESLint config               |
| `eslint-config-prettier`        | ^10.1.8  | ESLint + Prettier compat           |
| `eslint-plugin-oxlint`          | ~1.60.0  | Oxlint ESLint bridge               |
| `prettier`                      | 3.8.3    | Code formatter                     |
| `npm-run-all2`                  | ^8.0.4   | Parallel script runner             |
| `jiti`                          | ^2.6.1   | Runtime TypeScript loading         |
| `@types/node`                   | ^24.12.2 | Node.js type definitions           |
| `@tsconfig/node24`              | ^24.0.4  | Node 24 TS config                  |
| `@vue/tsconfig`                 | ^0.9.1   | Recommended Vue TS config          |
| `unplugin-auto-import`          | ^21.0.0  | Auto-import Vue APIs & composables |
| `unplugin-vue-components`       | ^32.1.0  | Auto-import components             |

---

## Appendices

### A. Project Structure

```
src/
├── components/           # Auto-imported components
│   ├── charts/           # Unovis chart wrappers
│   ├── landing/          # Landing page sections
│   └── ui/               # shadcn-vue components (136 files)
├── composables/          # Domain composables (16 files)
├── layouts/              # default.vue, blank.vue
├── lib/                  # supabase.ts, utils.ts
├── pages/                # File-based routes (35 files)
├── router/               # index.ts (auth guard + layout assignment)
├── styles/               # globals.css (Tailwind + theme)
└── stores/               # (future Pinia stores)
supabase/
├── functions/            # Edge functions (Deno)
│   ├── og-image/
│   ├── send-couple-invite/
│   └── sync-rates/
├── migrations/           # 30 timestamped SQL migrations
├── config.toml           # Supabase project config
└── .temp/                # Local Supabase state
```

```
.env                     # (in gitignore) Live Supabase credentials
.env.example             # Template with docs for all env vars
```

### B. Design Files (docs/)

```
docs/
├── fitur-rekomendasi.md
└── superpowers/
    ├── plans/
    │   └── 2026-06-01-multi-currency.md
    └── specs/
        └── 2026-06-01-multi-currency-design.md
```

### C. Scripts Reference

| Script       | Command                   | Purpose                  |
| ------------ | ------------------------- | ------------------------ |
| `dev`        | `vite`                    | Dev server (port 5173)   |
| `build`      | `type-check + build-only` | Production build         |
| `build-only` | `vite build`              | Build without type check |
| `preview`    | `vite preview`            | Preview production build |
| `type-check` | `vue-tsc --build`         | TypeScript type check    |
| `lint`       | `oxlint + eslint --fix`   | Lint + auto-fix          |
| `format`     | `prettier --write src/`   | Format source files      |
| `audit:security` | `claude-flow security scan` | Security audit (defined in package.json) |

### D. Security Audit

**Status:** Scanned June 2026 — 0 critical vulnerabilities (bun audit), 7 RLS/auth issues found and fixed.

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🔴 Critical | Partner Escalation — profile UPDATE tanpa `WITH CHECK` | Added `WITH CHECK` preventing partner_id tampering |
| 2 | 🔴 Critical | Multi-Table Data Leak — goals & activity_logs missing partner SELECT policy | Added `is_my_partner()` policies |
| 3 | 🟠 High | acceptInvite manggil edge function yang tidak ada | Migrated to `supabase.rpc('accept_couple_invitation')` |
| 4 | 🟠 High | disconnectPartner manggil edge function yang tidak ada | Created `disconnect_partner()` RPC migration |
| 5 | 🟠 High | send-couple-invite tanpa auth JWT | Added Bearer token validation + sender_id ownership check |
| 6 | 🟠 High | Storage receipts RLS missing bucket_id filter | Added `bucket_id = 'receipts'` to storage policy |
| 7 | 🟡 Medium | exchange_rates public read (unauthenticated) | Restricted to `auth.role() = 'authenticated'` |
| — | ✅ All clear | XSS, SQL injection, mass assignment, env secrets | No vectors found |

---

> **Document generated from codebase analysis — June 2, 2026**
> Aemy Finance — `aemy-finance@0.0.0`
