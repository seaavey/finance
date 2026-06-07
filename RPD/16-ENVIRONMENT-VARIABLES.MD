## 16. Environment Variables

| Variable                        | Diperlukan | Default                 | Deskripsi                |
| ------------------------------- | ---------- | ----------------------- | ------------------------ |
| `VITE_PUBLIC_SUPABASE_URL`      | ✅         | —                       | Supabase project URL     |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | ✅         | —                       | Supabase anon/public key |
| `VITE_PUBLIC_SITE_URL`          | ✅         | `http://localhost:5173` | Callback URL untuk OAuth |

> Edge Function secrets dikelola via `supabase secrets set` — tidak disimpan di `.env`.

---