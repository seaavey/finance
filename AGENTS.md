# Finance — Agent Guide

## Stack
- **Framework:** Nuxt 4 (Vue 3, file-based routing, `app/` directory)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` plugin, no postcss.config), shadcn-vue (reka-vega style)
- **Icons:** `@hugeicons/core-free-icons` + `@hugeicons/vue` (`<HugeiconsIcon :icon="..."/>`)
- **Auth / DB:** Supabase (Google OAuth only, RLS on every table)
- **Linter:** Biome v2 (`bun lint` / `bun lint:fix`)
- **Runtime:** bun (package manager, scripts)

## Commands
```sh
bun dev          # local dev on :3000
bun build        # nuxt build
bun lint         # biome check .
bun lint:fix     # biome format --write . && biome check --write .
```

## Architecture
- **State:** composables in `app/composables/` use `useState()` for shared reactive state (no Pinia)
- **Auth flow:** `app/plugins/auth.client.ts` initializes session → `app/middleware/auth.global.ts` protects routes
- **Supabase:** singleton client from `app/lib/supabase.ts` (`useSupabase()`)
- **Toast:** global singleton via `useToast()` — call `register()` in root, then `toast.success/error/info()` anywhere
- **Layouts:** `blank.vue` (landing/login), `default.vue` (sidebar + topbar for authenticated routes)
- **Pages use `definePageMeta({ layout: 'blank' })`** to opt into `blank.vue`; all others get `default.vue`

## Key conventions
- **UI language is Indonesian** — toast messages, labels, empty states
- **Currency:** profile-based, defaults to `IDR`; `useCurrency().formatCurrency()` handles locale
- **Composable methods** auto-refetch data on mutation and call `toast.success/error`
- **Type imports** from `~/composables/useX` (e.g. `import type { Transaction } from '~/composables/useTransactions'`)
- **`cn()`** from `~/lib/utils` for Tailwind class merging (clsx + tailwind-merge)

## Database
- Tables: `profiles`, `categories`, `transactions`, `recurring_transactions` (renamed from `recurring`), `todos`
- All have RLS policies per `auth.uid()` = `user_id`
- Profile auto-created on signup via trigger; categories seeded on first page load (see `categories.vue`)
- Migrations in `supabase/migrations/`, applied in date-prefix order

## Notable quirks
- No tests exist in this repo
- Recurring table was renamed from `recurring` → `recurring_transactions` in a migration; the composable uses the new name
- `.env` needs `NUXT_PUBLIC_SUPABASE_URL` and `NUXT_PUBLIC_SUPABASE_ANON_KEY`
- `form.amount` in TransactionForm blocks non-numeric key input via `onNumberKeydown`
