# Finance — Personal/Couple Finance Tracker

Nuxt 4 + Vue 3 + TypeScript + Supabase + shadcn-vue (Reka UI) + Tailwind CSS v4.

> **REQUIRED**: Read `ERP.md` before implementing features or fixing bugs related to business logic. It contains system flow details, state, and gotchas you must understand first.

## Commands

| Command                | Description            |
| ---------------------- | ---------------------- |
| `bun run dev`          | Dev server on `:3000`  |
| `bun run build`        | Nuxt production build  |
| `bun run generate`     | Static site generation |
| `bun run lint`         | ESLint check           |
| `bun run lint:fix`     | ESLint auto-fix        |
| `bun run format`       | Prettier write         |
| `bun run format:check` | Prettier check         |

`bun` is the package manager (bun.lock). After install, `nuxt prepare` runs automatically via `postinstall` to generate `.nuxt/` types.

No test infrastructure exists.

## Architecture

- **Auth**: Supabase OAuth (Google only). Client-side plugin (`app/plugins/auth.client.ts`) loads the session and listens for `onAuthStateChange`. Global middleware (`app/middleware/auth.global.ts`) protects routes; skips server-side runs and OAuth callback redirects.
- **Supabase client**: Singleton via `app/lib/supabase.ts` — one `createClient` call, reused. All data fetching happens browser-side; no Nitro API routes.
- **State management**: `useState` refs in composables (no Pinia). Composables are self-contained: `useAuth`, `useTransactions`, `useCategories`, `useCurrency`, `usePartner`, `useRecurring`, `useExport`, `useToast`.
- **Toast**: Custom system via `useToast` + `AppToast` component. Registered once in `app.vue` `onMounted`.
- **i18n**: `@nuxtjs/i18n`. Two locales: `id` (default) and `en`. Files in `i18n/locales/`. Use `$t()` or `useI18n()`.
- **Routing**: File-based Nuxt pages in `app/pages/`. Layouts: `default` (sidebar + topbar) for auth pages, `blank` for landing/login.
- **Currency**: IDR default, stored in `profiles.currency`. `useCurrency` composable handles formatting, locale-aware parsing, and no-decimal currency detection.

## Key Directories

| Path                   | Purpose                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `app/pages/`           | Page routes (dashboard, transactions/, categories, recurring, settings, auth/login) |
| `app/components/`      | Shared SFCs (landing/, charts/, ui/ via shadcn, AppSidebar, etc.)                   |
| `app/composables/`     | 8 composables — single-file, import from `~/composables/`                           |
| `app/lib/`             | supabase.ts (client), utils.ts (cn helper)                                          |
| `app/middleware/`      | `auth.global.ts`                                                                    |
| `app/plugins/`         | `auth.client.ts`                                                                    |
| `server/middleware/`   | Security headers, open redirect protection, injection detection                     |
| `server/plugins/`      | Error stack trace scrubbing (pentest finding)                                       |
| `supabase/migrations/` | 12 SQL migrations for schema and RLS                                                |
| `supabase/functions/`  | Edge function `send-couple-invite`                                                  |

## Couple/Partner Feature

Users can send email invitations to partner. The `profiles` table has a `partner_id` column. System uses `couple_invitations` table + `accept_couple_invitation` RPC. Flow: send invite → recipient sees in Settings → accept → RPC links both profiles.

## Database Tables

`profiles`, `categories`, `transactions`, `recurring_transactions` (migrated from `recurring`), `couple_invitations`. All user-owned with RLS policies. Indexed on user+date, user+type for transactions.

## Security (pentest remediations)

- CSP, HSTS, X-Frame-Options, nosniff, etc. in `server/middleware/security.ts`
- Open redirect block on query params (to, url, redirect, next, etc.)
- Injection pattern detection in query strings
- Error plugin (`server/plugins/error.ts`) strips stack traces and 404 path reflection

## Code Conventions

- Vue: `<script setup lang="ts">`, Composition API, no Options API.
- Imports: `~/` alias (e.g., `~/lib/supabase`, `~/composables/useAuth`).
- Classes: `cn()` from `~/lib/utils` (clsx + tailwind-merge).
- Icons: `@hugeicons/core-free-icons` + `<HugeiconsIcon>` component.
- UI: shadcn-vue components from `@/components/ui/` (reka-ui based).
- Styling: Tailwind CSS v4 with CSS variables in `app/styles/global.css`.
- Format: prettier (semicolons, single quotes, 2-space indent, 100 width, trailing commas, LF).
- **No `any` type** — never use `as any`, `: any`, or `@ts-ignore`. Use proper types or `unknown` with narrowing.
- **Never run `bun run dev` or `bun run build`** — only `bun run lint`, `bun run lint:fix`, `bun run format`, `bun run format:check`.

## Gotchas

- `useSupabase()` is auto-imported? No — must import explicitly from `~/lib/supabase`.
- ESLint relaxed: `no-explicit-any`, `no-unused-vars`, `ban-ts-comment`, `require-default-prop` are all **off**.
- The `recurring` table was renamed to `recurring_transactions` (migration 20260525000000). Composables reference the new name.
- `import.meta.server` guard is used in auth middleware to skip SSR for auth checks.
- `navigateToLocale` (from i18n) is used for locale-aware navigation; `navigateTo` for non-localized routes.
