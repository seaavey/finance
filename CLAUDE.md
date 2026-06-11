# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev server
bun dev

# Build (type-check + build)
bun build

# Type-check only
bun type-check

# Lint (oxlint fast pass + eslint deep pass)
bun lint

# Format
bun format

# Run tests (uses bun:test, no vitest)
bun test
bun test --watch                        # watch mode
bun test src/services/__tests__/transaction.service.test.ts  # single file

# Security audit
bun audit:security

# Full stack with Supabase locally
bunx supabase start                     # starts local Supabase services
```

Stack: **Bun** runtime, **Vite 8** build tool (Rolldown), **Vue 3** (Composition API, `<script setup>`), **TypeScript 6**, **Tailwind CSS v4** + **shadcn-vue**, **TanStack Vue Query v5**, **Supabase** (PostgreSQL, Auth, Storage, Edge Functions), **vue-i18n**, **Unovis** (charts), **vite-plugin-pwa**.

## Architecture

### Layer structure (data flows top-to-bottom)

```
Pages (src/pages/)           ← file-based routing via vite-plugin-pages
  ↕ calls composables
Composables (src/composables/)  ← TanStack Query wrappers, UI state, toast/activity side-effects
  ↕ calls service functions
Services (src/services/)      ← pure Supabase query functions, return Result<T>
  ↕ uses query-wrapper
Lib (src/lib/)                ← supabase client, query-wrapper (Result<T> helpers), storage-util, rpc, utils
```

**Key principle**: Composable → Service → Lib. Services do NOT import composables; composables do NOT directly call Supabase. Every layer uses TypeScript types from `src/types/`.

### Data access pattern

All Supabase queries go through **query-wrapper** helpers (`src/lib/query-wrapper.ts`):

- `querySingle<T>` — `.single()`, returns `Result<T>`
- `queryMaybeSingle<T>` — `.maybeSingle()`, returns `Result<T | null>`
- `queryList<T>` — multiple rows, returns `Result<T[]>`
- `mutationWithReturn<T>` — insert/update with `.select().single()`
- `mutationVoid` — delete/update returning no data
- `queryWithCount<T>` — paginated queries with exact count

Edge Functions are called via `rpc()` or `callEdgeFunction()` in `src/lib/rpc.ts`.

### Result type pattern

Every function returns `Result<T>`: `{ data: T; error: null } | { data: null; error: AppError }` defined in `src/types/result.ts`. All service functions use this — check `.error` before using `.data`.

### Routes & layouts

File-based routing in `src/pages/` (via `vite-plugin-pages`). Two layouts:

- `default` — sidebar + topbar (authenticated pages). See `src/layouts/default.vue`
- `blank` — no chrome (login, landing, legal pages). See `src/layouts/blank.vue`

Public routes (no auth): `/`, `/login`, `/about`, `/contact`, `/privacy-policy`, `/terms-of-service`, `/auth/login`, `/auth/callback`, `/source`.

Auth guard in `src/router/index.ts` — lazy-imports `useAuth` composable to check session. No page-level auth meta needed.

### Domain modules

Each domain (accounts, transactions, budget, goals, bills, recurring, subscriptions, categories) follows the same structure:

- **Page** in `src/pages/{domain}/` — list (`index.vue`), detail (`[id].vue`), create (`new.vue`)
- **Service** in `src/services/{domain}.service.ts` — pure query functions, no UI imports
- **Composable** in `src/composables/use{Domain}.ts` — TanStack Query wrappers + side-effects (toast, activity log, cache invalidation)
- **Types** in `src/types/index.ts` — typed rows derived from `Database` type with domain-specific enums overlaid (e.g. `TransactionType`, `AccountType`)

The "partner" (couple) feature adds another user filter: composables optionally accept `partnerId` and include it in query filters. Services query `user_id` or `in('user_id', [userId, partnerId])`.

### Shared types

`src/types/` directory:

- `database.ts` — auto-generated Supabase types (`Database` interface)
- `index.ts` — domain types derived from `Database`, plus enums (`AccountType`, `TransactionType`, `BillingCycle`, etc.)
- `result.ts` — `Result<T>` discriminated union and `AppError` class

### Auto-imports

Vue APIs (`ref`, `computed`, `watch`, `onMounted`), vue-router (`useRoute`, `useRouter`), vueuse (`useOnline`, `useDark`, `useStorage`), and all composables from `src/composables/` / utilities from `src/lib/` are auto-imported. No explicit import needed. Components in `src/components/` are also auto-imported.

### i18n

Two locales: `id` (primary) and `en` (fallback) in `src/locales/`. Use `t('key')` from auto-imported `useI18n()` or `$t` in templates. Locale is configured in `src/plugins/i18n.ts`.

### Styling

Tailwind CSS v4 with shadcn-vue component primitives. Dark mode via `.dark` class. CSS variables defined in `src/styles/globals.css`. Use `cn()` utility from `src/lib/utils.ts` for conditional class merging. Reka UI (Radix Vue port) for headless primitives. shadcn-vue components live in `src/components/ui/`.

### Service field constants

`src/services/fields.ts` contains shared field selection constants (e.g., `TRANSACTION_FIELDS`, `BUDGET_FIELDS`) used across services.

### Supabase

- Client initialized in `src/lib/supabase.ts` — singleton pattern, reads `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY` from env.
- Database migration in `supabase/migration.sql` (RLS policies included).
- Supabase config in `supabase/config.toml`.
- Edge Functions: OCR, OG image generation, email notifications.

### PWA

`vite-plugin-pwa` configured in `vite.config.ts` with runtime caching for Iconify, exchange rate API, Unsplash images, and Supabase API. Registers service worker with auto-update.
