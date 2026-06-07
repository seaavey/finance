## 4. Tech Stack Detail

### Frontend Production

| Paket                      | Versi     | Fungsi                           |
| -------------------------- | --------- | -------------------------------- |
| `vue`                      | ^3.5.32   | Framework UI reaktif             |
| `vue-router`               | ^5.0.4    | Routing SPA                      |
| `vue-i18n`                 | ^11.4.4   | Internasionalisasi (ID + EN)     |
| `@tanstack/vue-query`      | ^5.100.14 | Server state management          |
| `@unhead/vue`              | ^3.1.1    | SEO / meta tags dinamis          |
| `@unovis/vue`              | ^1.6.5    | Chart visualisasi (Unovis)       |
| `@supabase/supabase-js`    | ^2.106.2  | Supabase client SDK              |
| `tailwindcss`              | ^4.3.0    | Utility-first CSS framework      |
| `@tailwindcss/vite`        | ^4.3.0    | Tailwind v4 Vite plugin          |
| `tailwind-merge`           | ^3.6.0    | Utility class merger (cn helper) |
| `tw-animate-css`           | ^1.4.0    | Animasi Tailwind                 |
| `class-variance-authority` | ^0.7.1    | Variant-based styling (shadcn)   |
| `shadcn-vue`               | ^2.7.3    | UI component library             |
| `@iconify/vue`             | ^5.0.1    | Icon set (HugeIcons)             |
| `sortablejs-vue3`          | ^1.3.0    | Drag-and-drop (jika dipakai)     |
| `vite-plugin-pwa`          | ^1.3.0    | PWA service worker generator     |
| `vite-plugin-pages`        | ^0.33.3   | File-based routing               |

### Frontend Development

| Paket                     | Versi   | Fungsi                   |
| ------------------------- | ------- | ------------------------ |
| `vite`                    | ^8.0.8  | Build tool (Rolldown)    |
| `typescript`              | ~6.0.0  | Type checking            |
| `vue-tsc`                 | ^3.2.6  | Vue SFC type checker     |
| `oxlint`                  | ~1.60.0 | Rust-based linter        |
| `eslint`                  | ^10.2.1 | Linter                   |
| `prettier`                | 3.8.3   | Formatter                |
| `unplugin-auto-import`    | ^21.0.0 | Auto-import Vue APIs     |
| `unplugin-vue-components` | ^32.1.0 | Auto-register components |
| `@vitejs/plugin-vue`      | ^6.0.6  | Vue SFC compiler         |

### Backend / Infrastructure

| Layanan                     | Versi         | Fungsi                           |
| --------------------------- | ------------- | -------------------------------- |
| **Supabase PostgreSQL**     | 15.8          | Database utama                   |
| **Supabase Auth**           | Built-in      | Google OAuth, session management |
| **Supabase Storage**        | S3-compatible | Upload gambar receipt + goal     |
| **Supabase Edge Functions** | Deno 2        | 4 fungsi serverless              |
| **Resend**                  | API v1        | Email undangan pasangan          |
| **exchangerate.fun**        | REST API      | Kurs mata uang asing             |
| **Vercel**                  | Platform      | Hosting frontend + edge          |

---