# Finance Tracker - Nuxt 4 & Supabase

A personal finance tracker designed for individuals and couples, built with Nuxt 4 and Supabase.

## Project Overview

- **Frontend:** [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript, `app/` directory structure).
- **Backend:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Row Level Security).
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with [shadcn-vue](https://www.shadcn-vue.com/).
- **Icons:** [HugeIcons](https://hugeicons.com/).
- **UI Integration:** [shadcn-nuxt](https://www.shadcn-vue.com/docs/installation/nuxt.html) for seamless component auto-import.
- **Data Visualization:** [Chart.js](https://www.chartjs.org/) with `vue-chartjs`.


## Getting Started

### Prerequisites

- **Bun:** Mandatory package manager and runtime. **All commands MUST be executed using `bun`** (e.g., `bun install`, `bun run <script>`, `bun x <package>`).
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

- **Command Execution:** **Always use `bun`** for package management, running scripts, and executing binaries.
- **TypeScript:** Strict type checking is mandatory. **Never use the `any` type.** Always define explicit interfaces or types for all data and function signatures.
- **Operational Constraints:** **Do not execute `bun run dev` or `bun run build`** unless specifically requested by the user. These commands are heavy and should be avoided during standard development/refactoring tasks.
- **Linting:** Use ESLint (via `@nuxt/eslint`) for linting and formatting.
  - `bun run lint`: Run checks.
  - `bun run lint:fix`: Format and fix issues.
- **UI Components:** **Use `shadcn-vue` components** for UI elements. Primitive UI components are located in `app/components/ui/`. When adding new UI components, use the `bun x shadcn-vue@latest add <component>` command.
- **Tailwind 4:** Use the latest Tailwind CSS 4 features and the `@tailwindcss/vite` plugin.
- **State Management:** Use `useState` for shared state within composables to ensure SSR compatibility.
- **Localization:** All user-facing text must be localized using the `@i18n/**` locale files (located in `i18n/locales/`). Hardcoded strings in templates or scripts are prohibited.

## External Tools & MCP

### pentest-ai
An offensive-security MCP server providing 200+ wrapped security tools and specialist agents.
- **Status:** Registered globally in Gemini CLI.
- **Usage:** Tools are automatically available. You can ask for security scans, vulnerability assessments, or authenticated pentesting.
- **Key Tools:** `list_tools`, `run_tool`, `test_web_app`, `test_api_security`, etc.
- **Configuration:** Managed via `gemini mcp` commands.

## Key Features
...

- **Transaction Management:** Create, read, update, and delete income and expense transactions.
- **Category Management:** Custom categories with icons and colors.
- **Recurring Transactions:** Set up automated transactions on daily, weekly, monthly, or yearly schedules.
- **Couple Sharing:** Invite a partner to share and manage finances together (implemented via `couple_invitations` and RLS).
- **Dashboard:** Visual summary of monthly income, expenses, and balance.
- **Export:** Export transaction data (handled by `useExport.ts` using `exceljs`).
