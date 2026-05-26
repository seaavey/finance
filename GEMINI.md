# Finance Tracker - Nuxt 4 & Supabase

A personal finance tracker designed for individuals and couples, built with Nuxt 4 and Supabase.

## Project Overview

- **Frontend:** [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript, `app/` directory structure).
- **Backend:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Row Level Security).
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with [Shadcn UI](https://www.shadcn-vue.com/).
- **Icons:** [HugeIcons](https://hugeicons.com/).
- **Localization:** [Nuxt i18n](https://i18n.nuxtjs.org/) supporting Indonesian (`id`) and English (`en`).
- **Data Visualization:** [Chart.js](https://www.chartjs.org/) with `vue-chartjs`.
- **Linting & Formatting:** [Biome](https://biomejs.dev/).

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended package manager)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local database management)

### Development Setup

1.  **Install dependencies:**
    ```bash
    bun install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the root with the following keys:
    ```env
    NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NUXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

3.  **Run the development server:**
    ```bash
    bun run dev
    ```

### Building for Production

```bash
bun run build
```

## Development Conventions

### Architecture & Structure

- **Nuxt 4:** The application follows the Nuxt 4 structure where the main source code is located in the `app/` directory.
- **Composables:** Business logic, data fetching, and state management are encapsulated in composables within `app/composables/` (e.g., `useTransactions`, `useAuth`).
- **Supabase Integration:** The Supabase client is initialized in `app/lib/supabase.ts` and can be accessed via the `useSupabase()` composable.
- **Components:** UI components are organized in `app/components/`. Reusable UI primitives are in `app/components/ui/`.
- **Database Schema:** Managed via Supabase migrations in `supabase/migrations/`. The schema includes `profiles`, `categories`, `transactions`, and `recurring` tables with RLS enabled.
- **Localization:** Language strings are stored in `i18n/locales/` as JSON files.

### Coding Standards

- **Linting:** Use Biome for linting and formatting.
  - `bun run lint`: Run checks.
  - `bun run lint:fix`: Format and fix issues.
- **TypeScript:** Strict type checking is encouraged. Define interfaces for data models (e.g., `Transaction` in `useTransactions.ts`).
- **Tailwind 4:** Use the latest Tailwind CSS 4 features and the `@tailwindcss/vite` plugin.
- **State Management:** Use `useState` for shared state within composables to ensure SSR compatibility.

## Key Features

- **Transaction Management:** Create, read, update, and delete income and expense transactions.
- **Category Management:** Custom categories with icons and colors.
- **Recurring Transactions:** Set up automated transactions on daily, weekly, monthly, or yearly schedules.
- **Couple Sharing:** Invite a partner to share and manage finances together (implemented via `couple_invitations` and RLS).
- **Dashboard:** Visual summary of monthly income, expenses, and balance.
- **Export:** Export transaction data (handled by `useExport.ts` using `exceljs`).
