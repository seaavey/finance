# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
# Development
pnpm dev              # Start Vite dev server (port 5173)

# Build
pnpm build            # Type-check + production build (Rolldown)
pnpm build-only       # Build without type-checking
pnpm preview          # Preview production build

# Lint & Format
pnpm lint             # Run oxlint --fix then eslint --fix --cache
pnpm format           # Prettier write on src/

# Type Checking
pnpm type-check       # vue-tsc --build

# Supabase
supabase start        # Start local Supabase stack
supabase stop         # Stop local Supabase
supabase migration up # Apply pending migrations
supabase db diff -f <name>  # Generate migration from local DB changes
```

## Architecture

**Tech stack**: Vue 3 (Composition API, `<script setup lang="ts">`), Vite 8, Tailwind CSS v4, shadcn-vue, Supabase, TanStack Vue Query, vue-router v5, vue-i18n, TypeScript, Unovis (charts).

**File-based routing** via `vite-plugin-pages` — `src/pages/` directory mirrors route structure. Dynamic segments use `[param]` directories. No manual route config needed (see `src/router/index.ts` for middleware only).

**Two layouts**: `default.vue` (sidebar + topbar, for authenticated pages) and `blank.vue` (for landing/auth pages). Set via `route.meta.layout` in the router.

**Composables** (`src/composables/`): One composable per domain entity. Each follows the same pattern — wraps Supabase queries with TanStack Vue Query, exposes CRUD methods, logs activity, shows toasts on mutations, and has reactive `loading` state.

**Data fetching pattern**: TanStack Vue Query everywhere.

- Queries use `useQuery({ queryKey, queryFn, enabled })` with `computed` for reactive keys.
- Mutations call Supabase directly, then `queryClient.invalidateQueries()` to refresh.
- Query keys follow the pattern `['entityName', computed(() => user.value?.id)]` with optional filter refs.
- Stale time default: 30s (set in `main.ts`).
- `enabled: computed(() => !!user.value)` prevents queries before auth.

**Auth flow**: Supabase Auth (Google OAuth). `useAuth` composable is a singleton with module-level `user` and `loading` refs. Public routes skip auth check in router guard. Login activity is logged on session fetch, not on mount.

**Supabase client**: Singleton in `src/lib/supabase.ts` — lazy-initialized, cached in module scope.

**Activity logging**: Fire-and-forget inserts to `activity_logs` table after every mutation. The `useActivityLog` composable provides a `log()` function called by every CRUD composable. Failures are silently ignored.

**Couple/partner mode**: Users can invite partners via email. Accepted couples share finances. `usePartner` handles invitations, acceptance (via edge function), and disconnection.

**Currency/formatting**: `useCurrency` composable renders numbers with `Intl.NumberFormat` per locale. Default currency from user profile. Currently only has exchange rate fetching skeleton (`fetchRates`).

**Auto-imports**: Vue APIs, vue-router, composables (from `src/composables/`), and utils (from `src/lib/`) are auto-imported. No explicit imports needed for these. UI components from `src/components/` are also auto-imported.

**Nuxt compatibility layer**: `src/composables/nuxt-compat.ts` provides Nuxt-like `useI18n`, `useLocalePath`, and `useColorMode` APIs so migrated code works without changes.

### Database (Supabase/PostgreSQL)

Key tables: `profiles`, `categories`, `transactions`, `recurring_transactions`, `budgets`, `accounts`, `bills`, `goals`, `activity_logs`, `couple_invitations`.

All tables have RLS enabled. Migrations in `supabase/migrations/` are timestamped `YYYYMMDDHHMMSS_desc.sql`. Schema defined in `supabase/migrations/20260523165600_init.sql` and subsequent files.

### Styling

Tailwind CSS v4 with CSS-first config (`src/styles/globals.css` uses `@theme inline`). shadcn-vue components in `src/components/ui/`. CSS variables for light/dark themes using the `.dark` variant. Custom `@keyframes` for fade-up, fade-in, and noise animations.

### Charts

Uses `@unovis/vue` (Unovis) for `MonthlyBar`, `ExpenseDonut` charts. `NetWorthChart` draws from `useNetWorth` composable which computes historical asset/debt/net-worth data.

## Environment

Copy `.env` to get started — it contains Supabase URL and anon key (bound to a live project). Local Supabase can be used with `supabase start`.

**Production URL:** [seaavey.site](https://seaavey.site)

## Naming conventions

- Composables: `usePascalCase.ts`
- Pages: `kebab-case.vue` matching route path
- Components: `PascalCase.vue`
- Migration files: `YYYYMMDDHHMMSS_snake_case_desc.sql`
- Supabase tables: `snake_case`, plural
- DB columns: `snake_case`
- Frontend interfaces: PascalCase matching table names
