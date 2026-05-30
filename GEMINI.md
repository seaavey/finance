# Finance App - Project Instructions

## Project Overview
Finance App is a modern, personal and couple-oriented financial management application. It allows users to track income, expenses, recurring transactions, savings goals, and net worth, either individually or collaboratively with a partner.

### Tech Stack
- **Frontend**: [Nuxt 3](https://nuxt.com/) (using Nuxt 4 directory structure)
- **Language**: TypeScript
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL with RLS)
- **Styling**: Tailwind CSS, [shadcn-vue](https://www.shadcn-vue.com/)
- **Charts**: Chart.js with `vue-chartjs`
- **Internationalization**: Nuxt i18n (supported: Indonesian `id`, English `en`)
- **State Management**: Vue Composables (`useState`)

### Architecture
- **`app/`**: Contains the main application code (Nuxt 4 layout).
  - **`components/`**: Reusable UI components and business-logic-specific components.
  - **`composables/`**: Core business logic (accounts, transactions, net worth, budgets, goals).
  - **`pages/`**: Application routes.
- **`supabase/`**: Database migrations, RLS policies, and configuration.
- **`server/`**: Nuxt server API routes and middleware.
- **`i18n/`**: Localization files.

---

## Building and Running

### Prerequisites
- Node.js (Latest LTS recommended)
- [Bun](https://bun.sh/) (preferred package manager)
- Supabase CLI (for database management)

### Setup
```bash
# Install dependencies
bun install

# Configure environment variables
# Copy .env.example to .env and fill in:
# NUXT_PUBLIC_SUPABASE_URL
# NUXT_PUBLIC_SUPABASE_ANON_KEY
```

### Development
```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Format code
npm run format
```

### Database Management
```bash
# Apply migrations to local Supabase
supabase migration up

# Push changes to linked project
supabase db push
```

---

## Development Conventions

### Code Style
- **Naming**: Use PascalCase for components (`AccountCard.vue`) and camelCase for composables/variables (`useAccounts.ts`).
- **Typing**: Strict TypeScript. Define interfaces for all data models.
- **Formatting**: Adhere to Prettier and ESLint configurations.

### Directory Structure (Nuxt 4)
Follow the Nuxt 4 directory pattern within the `app/` folder:
- Components live in `app/components/`.
- Composables live in `app/composables/`.
- Layouts live in `app/layouts/`.
- Pages live in `app/pages/`.

### Internationalization
All user-facing text must be localized using `i18n/locales/*.json`. Use the `$t()` helper in templates and `t()` from `useI18n()` in scripts.

### Database & Security
- Every table must have **Row Level Security (RLS)** enabled.
- Migrations should include policies for both solo and partnered access where applicable.
- Use `supabase/migrations/` for all schema changes.

### Git Workflow
- Use descriptive commit messages with conventional prefixes:
  - `feat:` for new features (e.g., `feat: implement bill reminders`)
  - `fix:` for bug fixes
  - `chore:` for maintenance/config changes
  - `docs:` for documentation updates
