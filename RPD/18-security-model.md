## 18. Security Model

### 18.1 Authentication

- **Method:** Google OAuth via Supabase Auth
- **Session:** HTTP-only cookie + access token
- **Redirect:** OAuth callback → `/auth/callback` → `/dashboard`

### 18.2 Authorization

- **Database:** Row-Level Security (RLS) di semua tabel
- **Storage:** Bucket `receipts` = private (signed URL), `goal-images` = public
- **Edge Functions:** Bearer token auth (kecuali `og-image` public)

### 18.3 Data Protection

- **In transit:** HTTPS everywhere (Vercel + Supabase)
- **At rest:** Supabase handles encryption
- **User data:** Scoped by `user_id` — tidak ada akses silang (kecuali couple mode)

### 18.4 Couple Mode Security

- Partner ID disimpan di `profiles.partner_id`
- RLS diperluas dengan policy yang cek `partner_id`
- `disconnect_partner` RPC hapus partner_id kedua user
- `accept_couple_invitation` RPC validasi token + update kedua profile

### 18.5 Input Validation

- **Frontend:** Minimal (hanya tipe data dari TypeScript)
- **Database:** Constraint CHECK, NOT NULL, foreign keys
- **Edge Functions:** Validasi input di Deno

---