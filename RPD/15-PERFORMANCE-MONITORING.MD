## 15. Performance & Monitoring

### 15.1 Database Query Performance

| Query                                         | Frekuensi        | Index Used                   | Est. Time |
| --------------------------------------------- | ---------------- | ---------------------------- | --------- |
| `SELECT transactions WHERE user_id + date`    | Setiap render    | `idx_transactions_user_date` | <10ms     |
| `SELECT transactions WHERE user_id + type`    | Filter transaksi | `idx_transactions_user_type` | <10ms     |
| `SELECT transactions WHERE description ILIKE` | Search           | None (seq scan)              | 50-200ms  |
| `SELECT budgets + SUM(transactions)`          | Dashboard load   | Partial                      | 20-100ms  |
| `SELECT accounts + SUM(transactions)`         | Net worth calc   | Partial                      | 50-500ms  |
| `SELECT activity_logs`                        | Activity page    | None                         | 10-50ms   |

**Optimasi yang sudah dilakukan:**

- `idx_transactions_user_date` — query utama dashboard
- `idx_transactions_user_type` — filter type
- `idx_recurring_user_active` — filter recurring aktif
- `idx_categories_user_id` — join yang sering
- `idx_goals_user_id` — join yang sering
- Optimasi index tambahan di migration `20260603000001`

### 15.2 Client Performance

| Metrik                 | Target | Current (Est.) |
| ---------------------- | ------ | -------------- |
| Lighthouse Performance | >90    | ~85-95         |
| First Contentful Paint | <1.5s  | ~1.2s          |
| Time to Interactive    | <2.5s  | ~2.0s          |
| Bundle Size (JS)       | <200KB | ~180KB (est.)  |
| Bundle Size (CSS)      | <50KB  | ~35KB          |

### 15.3 Monitoring (Belum Ada)

Saat ini tidak ada monitoring / error tracking. Rekomendasi:

- **Sentry** — error tracking (free tier cukup)
- **Supabase Query Performance** — built-in dashboard
- **Vercel Analytics** — built-in untuk frontend

---