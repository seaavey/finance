## 17. Deploy & CI/CD

### 17.1 Production

| Layanan      | Detail                                 | URL                   |
| ------------ | -------------------------------------- | --------------------- |
| **Frontend** | Vercel Hobby (auto-deploy dari Github) | https://seaavey.site  |
| **Backend**  | Supabase Cloud (Free tier)             | project.supabase.co   |
| **Email**    | Resend (Free tier — 100 email/hari)    | API via Edge Function |

### 17.2 Local Development

```bash
# Prerequisites
bun            # JavaScript runtime & package manager
supabase CLI   # Supabase local development

# Start
git clone https://github.com/seaavey/finance.git
cd finance
bun install
cp .env .env.local        # Environment variables
supabase start            # Local PostgreSQL + Edge Functions
bun dev                   # Vite dev server → http://localhost:5173
```

### 17.3 Scripts

```bash
bun dev              # Dev server (port 5173)
bun build            # Type-check + production build (Rolldown)
bun build-only       # Build tanpa type-check
bun preview          # Preview production build
bun type-check       # vue-tsc type checking
bun lint             # oxlint + eslint --fix
bun format           # Prettier formatting on src/
```

### 17.4 Supabase Commands

```bash
supabase start                                     # Start local Supabase
supabase stop                                      # Stop local Supabase
supabase db push                                   # Push migrations
supabase functions deploy ocr-receipt              # Deploy satu function
supabase functions deploy --project-ref <ref>      # Deploy semua function
supabase secrets set RESEND_API_KEY=xxx            # Set secrets
```

---