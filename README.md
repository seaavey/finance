# Aemy Finance ✦

**Personal & Shared Finance Management**

A modern personal finance app with multi-currency support, interactive visualizations, and couple mode — free with no ads.

🌐 **Live:** [seaavey.site](https://seaavey.site)

---

## ✨ Key Features

| Feature                       | Description                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------- |
| 💰 **Interactive Dashboard**  | Bento-grid layout with balance, charts, budget progress, recent transactions |
| 💳 **Multi-Currency**         | Accounts in different currencies, auto-converted to base currency            |
| 📊 **Charts**                 | Monthly income/expense bars, category donut, net worth line chart            |
| 🏷️ **Categories**             | Indonesian defaults, fully customizable with icons & colors                  |
| 📋 **Budget Planning**        | Per-category monthly budgets with progress tracking                          |
| 🔁 **Recurring Transactions** | Daily / weekly / monthly / yearly                                            |
| 🎯 **Goals Tracker**          | Financial targets with progress bar and image upload                         |
| 💸 **Bills Manager**          | Bill tracking with paid/unpaid status and recurring support                  |
| 👫 **Couple Mode**            | Share finances with a partner — invite via email                             |
| 📈 **Net Worth**              | Track assets, debts, and net worth over time                                 |
| 📥 **CSV Export**             | Export all transactions to CSV                                               |
| 🔔 **Reminders**              | Upcoming bill notifications (7-day window)                                   |
| 🌙 **Dark Mode**              | Light/dark theme toggle                                                      |
| 🔒 **Secure**                 | Google OAuth, Row-Level Security on all data                                 |

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/seaavey/finance.git
cd finance

# Install dependencies
bun install

# Copy environment
cp .env .env.local

# Start dev server
bun dev
```

> **Note:** The `.env` file contains the Supabase URL and anon key tied to the live project. For local development, run `supabase start`.

### Prerequisites

- **bun** (JavaScript runtime & package manager)
- **Supabase CLI** (for local database)

---

## 🛠️ Tech Stack

### Frontend

| Technology                                     | Purpose                 |
| ---------------------------------------------- | ----------------------- |
| **Vue 3** + Composition API + `<script setup>` | UI framework            |
| **Vite 8** + Rolldown                          | Build tool              |
| **TypeScript 6**                               | Type safety             |
| **Tailwind CSS v4**                            | Utility-first styling   |
| **shadcn-vue**                                 | UI component library    |
| **TanStack Vue Query**                         | Server state management |
| **vue-router 5**                               | File-based routing      |
| **vue-i18n**                                   | Internationalization    |
| **Unovis**                                     | Chart visualization     |
| **Iconify** (HugeIcons)                        | Icon set                |
| **@unhead/vue**                                | SEO / meta tags         |

### Backend & Infrastructure

| Technology           | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| **Supabase**         | Database (PostgreSQL), Auth, Storage, Edge Functions |
| **Google OAuth**     | Authentication                                       |
| **Resend**           | Email (partner invitations)                          |
| **Vercel**           | Hosting                                              |
| **exchangerate.fun** | Exchange rate API                                    |

---

## 📁 Project Structure

```
src/
├── components/       # Auto-imported UI & domain components
│   ├── ui/           # shadcn-vue (136 components)
│   ├── charts/       # Unovis chart wrappers
│   └── landing/      # Landing page sections
├── composables/      # Domain logic (useAuth, useTransactions, etc.)
├── layouts/          # default.vue (sidebar), blank.vue (landing)
├── lib/              # supabase client, utility helpers
├── pages/            # File-based routes (35 pages)
├── router/           # Router guard & layout assignment
└── styles/           # Tailwind + CSS custom properties

supabase/
├── functions/        # Edge Functions (Deno)
│   ├── sync-rates/   # Exchange rate sync
│   ├── send-couple-invite/  # Partner invitation emails
│   └── og-image/     # Dynamic Open Graph image
└── migrations/       # 27 timestamped SQL migrations
```

---

## 📄 Pages & Routing

| Route                    | Page                   | Layout  |
| ------------------------ | ---------------------- | ------- |
| `/`                      | Landing page           | blank   |
| `/dashboard`             | Main dashboard         | default |
| `/transactions`          | Transaction list       | default |
| `/transactions/new`      | Add transaction        | default |
| `/transactions/:id/edit` | Edit transaction       | default |
| `/categories`            | Category management    | default |
| `/budget`                | Budget planning        | default |
| `/accounts`              | Account list           | default |
| `/bills`                 | Bill management        | default |
| `/recurring`             | Recurring transactions | default |
| `/goals`                 | Financial goals        | default |
| `/activities`            | Activity log           | default |
| `/settings`              | User settings          | default |
| `/auth/login`            | Login page             | blank   |
| `/about`                 | About                  | blank   |
| `/privacy-policy`        | Privacy policy         | blank   |
| `/terms-of-service`      | Terms of service       | blank   |

---

## 🗄️ Database (Supabase)

**11 tables** with Row-Level Security:

| Table                    | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `profiles`               | User profiles (display name, currency, partner)    |
| `categories`             | Income/expense categories                          |
| `transactions`           | Financial transaction records                      |
| `accounts`               | Bank/e-wallet/cash/investment/liability accounts   |
| `budgets`                | Per-category monthly budgets                       |
| `bills`                  | One-time & recurring bills                         |
| `recurring_transactions` | Recurring transactions                             |
| `goals`                  | Financial goals                                    |
| `activity_logs`          | User activity audit trail                          |
| `couple_invitations`     | Partner invitations                                |
| `exchange_rates`         | Currency exchange rates (synced via edge function) |

---

## 📦 Scripts

```bash
bun dev              # Dev server (port 5173)
bun build            # Type-check + production build
bun build-only       # Build without type-check
bun preview          # Preview production build
bun type-check       # vue-tsc type checking
bun lint             # oxlint + eslint --fix
bun format           # Prettier formatting
```

---

## 🌐 Environment & Deploy

- **Production:** [seaavey.site](https://seaavey.site) — deployed via Vercel
- **Supabase Project:** Connected to live project (URL & anon key in `.env`)
- **Local DB:** `supabase start` for local PostgreSQL + stack

---

## 📄 License

Copyright © 2026 — [seaavey](https://github.com/seaavey) · [Koxi](https://github.com/koci79)

---

> Built with ❤️ using Vue 3, Tailwind CSS, Supabase, and many other awesome technologies.
