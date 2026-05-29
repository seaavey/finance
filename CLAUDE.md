# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun dev`: Start Nuxt development server
- `bun build`: Build for production
- `bun lint`: Run ESLint check
- `bun lint:fix`: Fix linting issues automatically
- `bun format`: Format code with Prettier
- `bun postinstall`: Prepare Nuxt environment

## Architecture & Structure

This is a Nuxt 4 application (using the `app/` directory structure) for a personal finance management system.

- **Frontend Framework**: Nuxt 4 with Vue 3.
- **Styling**: Tailwind CSS 4 with `@tailwindcss/vite`.
- **UI Components**:
  - `app/components/ui/`: shadcn-vue based primitive components (using Reka UI).
  - `app/components/landing/`: Marketing landing page sections (Hero, Features, FAQ, etc.).
  - Business components located directly in `app/components/` (e.g., `TransactionForm.vue`, `GoalCard.vue`).
- **State & Logic**:
  - `app/composables/`: Business logic hooks (e.g., `useTransactions`, `useAuth`, `useCurrency`).
  - `app/lib/`: Shared utilities and Supabase client configuration.
  - `app/middleware/`: Global authentication guards.
- **Routing**: File-based routing in `app/pages/`.
- **Database/Backend**: Supabase integration via `@supabase/supabase-js`.
- **Internationalization**: `@nuxtjs/i18n` for multi-language support (locales in `i18n/locales/`).

## Key Patterns

- **UI System**: Custom styled shadcn components. Icons use `hugeicons` via `@nuxt/icon`.
- **Validation**: `zod` for schema definition and `vee-validate` for form handling.
- **Data Fetching**: Primarily handled within composables using Supabase.
- **Design Docs**: Implementation plans and design specs are stored in `docs/superpowers/`.

## Development Rules

- **Git Commits**: Do NOT include "Co-Authored-By" headers in commit messages.
- **Git Commits**: Always follow Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- **PR Bodies**: Do NOT include automated footers like "Generated with Claude Code".
