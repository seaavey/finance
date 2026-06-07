## 14. Tech Debt & Known Issues

### 🔴 High Priority

| Issue                        | Detail                                                    | Impact                           | Proposed Fix                               |
| ---------------------------- | --------------------------------------------------------- | -------------------------------- | ------------------------------------------ |
| **No test infrastructure**   | Zero unit tests, zero E2E tests                           | Risk regression tiap deploy      | Setup Vitest + Vue Test Utils + Playwright |
| **No error boundary**        | Tidak ada global error handler / error boundary           | UI bisa white-screen tanpa pesan | Vue `errorCaptured` + global handler       |
| **Nuxt compatibility shims** | `nuxt-compat.ts`, `ClientOnly.vue`, `NuxtLinkLocale` dll. | Dead code yang membingungkan     | Bersihkan gradual setelah migrasi selesai  |

### 🟡 Medium Priority

| Issue                             | Detail                                                                       | Impact                       | Proposed Fix                     |
| --------------------------------- | ---------------------------------------------------------------------------- | ---------------------------- | -------------------------------- |
| **`as any` type assertions**      | Beberapa tempat masih pake `as any` (navigator.standalone, JSON.parse, etc.) | Type safety berkurang        | Intersection types + type guards |
| **Hardcoded staleTime**           | Setiap composable define staleTime sendiri-sendiri                           | Inkonsisten, susah di-tuning | Centralized config object        |
| **No pagination budget history**  | Budget hanya menampilkan bulan aktif                                         | Tidak bisa lihat histori     | Budget history table             |
| **Fire-and-forget activity logs** | `log()` function pake fire-and-forget try/catch                              | Bisa loss data log           | Queue + batch insert             |
| **No input validation**           | Tidak ada validasi di frontend (amount negative, date future, etc.)          | Data integrity risiko        | Zod schema + form validation     |

### 🟢 Low Priority

| Issue                          | Detail                                                  | Impact                       | Proposed Fix                      |
| ------------------------------ | ------------------------------------------------------- | ---------------------------- | --------------------------------- |
| **No rate limiting pada API**  | Edge Functions tanpa rate limit                         | Abuse risk                   | Supabase rate limiting            |
| **Console.warn di production** | `console.warn` di usePartner.ts                         | Kotor, bisa bocor info       | Remove atau ganti logging service |
| **Hardcoded API URL**          | `exchangerate.fun` hardcoded di `useCurrency.ts`        | Vendor lock-in               | Environment variable              |
| **No pagination di net worth** | `fetchNetWorthHistory` fetch semua transactions N bulan | Bisa lambat untuk heavy user | Windowed query                    |
| **CSS class inconsistencies**  | Campuran Tailwind utility + kustom CSS                  | Maintenance burden           | CSS audit                         |

---