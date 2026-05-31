# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev          # Start Vite dev server
bun run build        # Type-check + production build (via vue-tsc --build && vite build)
bun run preview      # Preview production build

# Linting & Formatting
bun run lint         # Run both oxlint and eslint (auto-fix + cache)
bun run lint:oxlint  # oxlint --fix
bun run lint:eslint  # eslint --fix --cache
bun run format       # prettier --write on src/

# Type Checking
bun run type-check   # vue-tsc --build

# Bun-specific
bun install          # Install dependencies (lockfile: bun.lock)
```

## Git & Commits

- **Jangan** tambahkan `Co-Authored-By: Claude` atau trailer apapun di commit messages.
- Git author sudah dikonfigurasi sebagai `seaavey` — gunakan itu.
- Commit messages harus ditulis dari perspektif pengguna (seaavey), bukan AI.

## Architecture

**Aemy Finance** — personal finance tracking app with supabase backend, migrated from Nuxt 3 to pure Vite + Vue 3.

### Stack

- **Vue 3** + **Vite 8** + **TypeScript**
- **Supabase**: auth, database (PostgreSQL), edge functions, storage
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- **shadcn-vue** UI component kit (under `src/components/ui/`)
- **vue-router** with file-based routing (via `vite-plugin-pages`)
- **Pinia** available but most state managed via composables
- **vue-i18n**: Indonesian (`id`) and English (`en`) locales
- **@unhead/vue**: SEO meta management
- **unovis**: charts (area, bar, donut)
- **unplugin-auto-import**: auto-imports vue, vue-router, pinia, all composables, and lib

### Project Structure

```
src/
  composables/       # Primary data access layer — one per domain
  pages/             # File-based routes (vite-plugin-pages)
  layouts/           # default.vue (sidebar+topbar), blank.vue (landing/auth)
  components/
    ui/              # shadcn-vue components (button, dialog, calendar, etc.)
    charts/          # Chart wrappers
    landing/         # Landing page sections
    *.vue            # Feature components
  lib/               # Core utilities
    supabase.ts      # Singleton Supabase client
    cache.ts         # Request deduplication + TTL cache
    utils.ts         # cn() helper, getOgImageUrl()
  plugins/i18n.ts    # vue-i18n setup (id + en)
  styles/globals.css # Tailwind v4 imports + CSS variables + dark mode
  router/index.ts    # Router with auth middleware
supabase/
  migration.sql      # Full schema (profiles, categories, transactions, recurring, todos, accounts, budgets, goals, couple_invitations, etc.)
  config.toml        # Supabase local dev config
  functions/         # Edge functions (og-image, send-couple-invite, accept-couple-invite, disconnect-partner)
```

### Key Patterns

**Composable-based data layer**: Each domain has a composable in `src/composables/` (useTransactions, useAccounts, useBudgets, useCategories, useGoals, useRecurring, usePartner, useNetWorth, useExport, useReminders, useCurrency, useAuth). Composables are the primary state management pattern — they hold reactive state (`ref`), expose CRUD methods, and use `createCache()` for request deduplication (30-60s TTL). Most composables call `useAuth()` and `useSupabase()` internally.

**Cache layer** (`src/lib/cache.ts`): In-memory Map-based cache with TTL support. Deduplicates in-flight requests. Invalidate by key prefix (e.g., `cache.invalidate('transactions')`) or clear all. Used by most data composables.

**Auth flow**: Google OAuth via Supabase. `useAuth()` holds singleton `user` and `loading` refs. Router `beforeEach` guard redirects unauthenticated users to `/auth/login` and already-authenticated users away from login pages.

**Layout routing**: Routes use `meta.layout` — public pages (landing, login, about, etc.) use the `blank` layout (no sidebar), authenticated pages use the `default` layout (sidebar + topbar).

**i18n**: vue-i18n with `id` and `en` locales. A Nuxt compatibility layer (`nuxt-compat.ts`) provides Nuxt-style `useI18n()`, `useLocalePath()`, and `useColorMode()` wrappers. Locale files at `src/locales/{id,en}.json`.

**Nuxt migration compatibility**: The app was migrated from Nuxt 3 to pure Vite + Vue 3. It registers global fallback components (NuxtLink → RouterLink, ClientOnly, Icon) in `main.ts` and provides Nuxt-like composable APIs via `nuxt-compat.ts`. Auto-imports are configured for all composables and lib modules.

**Auto-imports**: `unplugin-auto-import` auto-imports Vue core APIs (ref, computed, watch, onMounted), vue-router, pinia, @unhead/vue (useHead, useSeoMeta), @vueuse/core (useWindowScroll, useStorage, useDark, useToggle), and all modules from `src/composables/` and `src/lib/`.

**Dark mode**: Toggled via `useColorMode()` (from nuxt-compat.ts) which wraps `@vueuse/core`'s `useColorMode`. Stores preference in `localStorage` under `vueuse-color-scheme`. CSS variables switch via `.dark` class on root element.

### Supabase Schema

Key tables (all with RLS policies scoped to `auth.uid()`):

- `profiles` — user profile, currency preference, partner_id
- `categories` — user-defined income/expense categories with icon and color
- `transactions` — income/expense entries with category, account, description, date
- `accounts` — financial accounts (bank, e-wallet, cash, investment, liability) with initial_balance
- `budgets` — monthly spending limits per category
- `goals` — savings goals with target amount, deadline, optional image
- `recurring_transactions` — recurring income/expense entries
- `todos` — task list with priority and due date
- `couple_invitations` — partner connection invitations
