# Aemy Finance

## Project Overview

**Aemy Finance** is a personal finance tracking application. The application was recently migrated from Nuxt 3 to a pure Vite + Vue 3 architecture, while maintaining Nuxt-like developer experience patterns (file-based routing, auto-imports, and Nuxt composable aliases). It uses Supabase as its backend-as-a-service for authentication, database, edge functions, and storage.

**Production URL:** [seaavey.site](https://seaavey.site)

### Tech Stack

- **Frontend Framework:** Vue 3 + Vite 8 + TypeScript
- **Backend/Database:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite`)
- **UI Components:** `shadcn-vue` (located in `src/components/ui/`)
- **Routing:** `vue-router` with file-based routing (`vite-plugin-pages`)
- **Data Fetching & State:** `@tanstack/vue-query` for server state, combined with domain-specific composables (`src/composables/`).
- **Internationalization:** `vue-i18n` with Indonesian (`id`) and English (`en`) locales.
- **Charts:** `unovis`
- **SEO:** `@unhead/vue`

### Architecture & Patterns

- **Composable-Based Data Layer:** Each core domain feature has a dedicated composable (e.g., `useTransactions`, `useBudgets`, `useAccounts`). These hold reactive state, expose CRUD methods, and use `useQuery`/`useMutation` from Vue Query for data fetching, caching, and cache invalidation.
- **Auto-Imports:** The project relies heavily on `unplugin-auto-import`. Vue core APIs, Vue Router, Pinia, VueUse, and all local composables/utilities are auto-imported.
- **Layout Routing:** Routes utilize `meta.layout`. Public pages use the `blank` layout, while authenticated pages use the `default` layout (sidebar + topbar).
- **Dark Mode:** Managed via a Nuxt-compat `useColorMode()` wrapper around VueUse, toggling the `.dark` class on the root element.

## Building and Running

This project uses `bun` as its primary package manager and script runner.

### Development

```bash
bun install          # Install all dependencies (uses bun.lock)
bun run dev          # Start the Vite development server
```

### Production

```bash
bun run type-check   # Run type-checking only (via vue-tsc)
bun run build        # Type-check and generate production build
bun run preview      # Preview the production build locally
```

### Linting & Formatting

```bash
bun run lint         # Run both oxlint and eslint with auto-fix
bun run lint:oxlint  # Run oxlint --fix
bun run lint:eslint  # Run eslint --fix --cache
bun run format       # Format code in src/ using Prettier
```

## Development Conventions

### Git & Commits

- **Do not** add `Co-Authored-By: Claude` or `Co-Authored-By: Gemini` or any similar AI trailers to commit messages.
- The Git author is pre-configured as `seaavey`. Use this perspective for all Git operations.
- Write commit messages from the perspective of the user (`seaavey`), rather than an AI agent.

### Code Style & Best Practices

- **Vue Query:** Rely on `@tanstack/vue-query` (`useQuery`, `useQueryClient`) for data fetching within composables instead of manual caching logic. Invalidate query keys (e.g., `queryClient.invalidateQueries({ queryKey: ['transactions'] })`) after successful mutations.
- **UI Components:** Use the pre-configured `shadcn-vue` components in `src/components/ui/`.
- **Localization:** Always use `$t('key')` in templates or `const { t } = useI18n()` in scripts for text strings to support the `id` and `en` locales.
- **Nuxt Fallbacks:** Since this is a migrated project, use the registered fallback components like `<NuxtLink>` (mapped to `RouterLink`) or `<ClientOnly>` when applicable.
- **Imports:** Rely on auto-imports for standard Vue, Vue Router, and local composables. You don't need to manually import things like `ref`, `computed`, `onMounted`, `useRouter`, or your domain composables in standard Vue SFCs or composable files.
