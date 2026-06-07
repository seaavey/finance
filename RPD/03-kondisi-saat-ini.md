## 3. Kondisi Saat Ini

### Status

| Aspek                   | Detail                                               |
| ----------------------- | ---------------------------------------------------- |
| **Status**              | 🟢 **Production** — aktif di seaavey.site            |
| **Versi**               | v1.0 (pre-release)                                   |
| **Frontend**            | Vue 3.5 + Vite 8 + TypeScript 6                      |
| **Backend**             | Supabase (PostgreSQL 15, Auth, Storage)              |
| **Hosting**             | Vercel (frontend) + Supabase Cloud (backend)         |
| **Database Migrations** | 41 migrasi SQL (dari init sampai performance_tuning) |
| **Edge Functions**      | 4 fungsi Deno                                        |
| **Halaman**             | 37 route (file-based via vite-plugin-pages)          |
| **i18n**                | Indonesia (id) default, Inggris (en) fallback        |
| **Autentikasi**         | Google OAuth via Supabase Auth                       |
| **PWA**                 | Service worker + runtime caching + offline banner    |
| **Package Manager**     | bun                                                  |
| **Total Dependencies**  | 17 production + 16 devDependencies                   |

### Metrik (Estimasi)

- **Database tables:** 11
- **Database indexes:** 6+
- **RLS policies:** ~35 (3-5 per tabel)
- **Composables:** 18 file
- **UI Components (shadcn-vue):** 136+ komponen primitif
- **Lines of Code (frontend):** ~15,000+ (est.)
- **Edge Function LOC:** ~400+ lines (total)

---