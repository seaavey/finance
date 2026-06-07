## 12. Fitur & Implementasi Detail

### 12.1 Dashboard Bento-Grid

**File:** `pages/dashboard.vue`
**Charts:**

- Donut chart: Pengeluaran per kategori (Unovis `Donut`)
- Bar chart: Income vs Expense bulanan (Unovis `Bar`)
- Line chart: Net worth historical (Unovis `Line`)

**Bento Cards:**

- **Total Balance** — Ringkasan saldo semua akun (in base currency)
- **Monthly Summary** — Income / Expense / Balance bulan ini
- **Budget Progress** — Progress bar per kategori budget
- **Recent Transactions** — 5 transaksi terbaru
- **Quick Actions** — Tombol shortcut (Tambah transaksi, dll.)
- **Reminders** — Tagihan jatuh tempo 7 hari ke depan

### 12.2 Multi-Mata Uang

**Pipeline:**

1. User set `profile.currency` = base currency (default IDR)
2. Setiap transaksi punya `currency` sendiri
3. Setiap akun punya `currency` sendiri
4. `useCurrency().formatCurrency()` render dengan locale yang sesuai
5. `useCurrency().convertTo()` konversi antar mata uang
6. `useAccounts().getConvertedBalances()` — semua saldo dalam base currency
7. `useNetWorth()` — net worth dalam base currency

**Rate Sources:**

1. **Primary:** `exchange_rates` table (sync dari Edge Function)
2. **Fallback:** Fetch langsung dari `exchangerate.fun` (client-side, cached module-level)

**Currencies Supported:** IDR, MYR, SGD, THB, PHP, VND, MMK, KHR, LAK, BND, JPY, KRW, CNY, TWD, HKD, INR, BDT, PKR, LKR, NPR — 20 mata uang Asia.

### 12.3 Couple Mode

**Flow Undangan:**

```
User A → Masuk email User B → Insert couple_invitations → Edge Function kirim email via Resend
  → User B masuk dashboard → Lihat undangan → Accept
    → RPC accept_couple_invitation (update profiles.partner_id kedua user)
      → RLS partner policies aktif → Data bersama
```

**Flow Disconnect:**

```
User A → Klik Disconnect → RPC disconnect_partner
  → Hapus partner_id kedua user
  → RLS partner policies non-aktif
```

**Shared Data (read-only partner access):** `transactions`, `accounts`, `categories`

**Not Shared:** `budgets`, `bills`, `goals`, `activity_logs`

### 12.4 OCR Receipt Scanning

**Pipeline Detail:**

```
User pilih gambar → validateFile()
  → compressImage() [max 1920px, JPEG 0.7, <5MB]
    → uploadToStorage() [Supabase private bucket 'receipts']
      → createSignedUrl() [10 menit expiry]
        → callScanEndpoint() [POST /functions/v1/ocr-receipt]
          → AI extract receipt data
            → Return ReceiptData → Auto-fill form transaksi
```

**Error Handling:**

- Format tidak valid → toast error
- Ukuran >5MB → toast error
- Duplicate upload → retry dengan UUID baru
- Auth error → toast + throw
- Scan gagal → toast error detail

### 12.5 Net Worth Calculation

**Algorithm (single-pass):**

```
1. Fetch semua accounts (type, currency, initial_balance)
2. Fetch semua transactions (account_id, type, amount, date) — bounded by N months
3. Sort transactions ascending by date
4. For each month boundary:
   - Apply semua transactions sampai bulan itu (running balance)
   - Separate by asset/liability
   - Convert semua ke base currency
   - Hitung total assets, debts, netWorth
5. Return array NetWorthData[]
```

**Performance Concern:** O(months × accounts + transactions) — untuk 6 bulan dengan ~1000 transaksi masih OK. Untuk 12+ bulan dengan ribuan transaksi, perlu optimasi.

### 12.6 PWA Setup

**Service Worker Strategy:**
| Resource | Strategy |
|----------|----------|
| Iconify icons | StaleWhileRevalidate |
| Supabase API | NetworkFirst |
| App shell | CacheFirst (precache) |

**Offline Handling:** `useOnline()` dari `@vueuse/core` → banner "Koneksi terputus" di App.vue.

### 12.7 Dark Mode

**Implementation:** CSS variables + class `dark` di `<html>`.
**Persistence:** `useLocalStorage` via `@vueuse/core`.
**Toggle:** Di settings page + sidebar.

```css
:root {
  --bg: #ffffff;
  --text: #000000;
}
.dark {
  --bg: #0f0f0f;
  --text: #ffffff;
}
```

### 12.8 Optimasi Query & Performance (RPC)

Untuk menangani volume transaksi yang besar dan konversi mata uang yang kompleks, aplikasi menggunakan **PostgreSQL Functions (RPC)**:

- **`get_transaction_summary`**: Menghitung total income/expense dalam satu query di database. Konversi mata uang dilakukan di tingkat database menggunakan tabel `exchange_rates`, sehingga frontend tidak perlu melakukan loop konversi manual yang berat.
- **`get_category_stats`**: Agregasi statistik per kategori dilakukan langsung oleh engine PostgreSQL, mengurangi jumlah data yang harus dikirim ke client (over-fetching).
- **Indexing**: Database dioptimasi dengan B-tree index pada kolom `user_id`, `date`, `category_id`, dan `account_id` untuk memastikan performa query O(log n) bahkan dengan jutaan baris data.

### 12.9 Konverter Mata Uang

**File:** `pages/converter/index.vue`
**Logic:**

- Menggunakan `useCurrency().convertTo()` untuk perhitungan real-time.
- Integrasi `Intl.NumberFormat` untuk formatting angka yang sesuai dengan locale mata uang (misal: IDR tanpa desimal, USD dengan 2 desimal).
- Fitur *Quick Conversion* untuk mempercepat estimasi nominal umum (1, 10, 50, 100).
- Sinkronisasi otomatis dengan `exchange_rates` di Supabase.

---