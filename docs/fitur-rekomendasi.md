# Rekomendasi Fitur — Finance Vite

> Dihasilkan: 2026-06-01
> Diperbarui: 2026-06-01 (multi-currency selesai ✅)
> Berdasarkan eksplorasi kodebase dan database schema.

---

## Status Saat Ini

Aplikasi sudah memiliki fitur inti yang solid:

| Fitur                  | Status                                |
| ---------------------- | ------------------------------------- |
| Auth (Google OAuth)    | ✅                                    |
| Dashboard + Chart      | ✅ (Unovis)                           |
| Transaksi CRUD         | ✅                                    |
| Kategori               | ✅                                    |
| Akun Bank & E-Wallet   | ✅                                    |
| Bills/Tagihan          | ✅                                    |
| Budget Planning        | ✅                                    |
| Goals/Tabungan         | ✅ (dengan upload gambar)             |
| Recurring Transactions | ✅                                    |
| Partner/Couple Sharing | ✅                                    |
| Multi-currency         | ✅ (kurs otomatis + konversi balance) |
| Activity Log           | ✅                                    |
| Ekspor Data            | ✅                                    |
| Reminder Tagihan       | ✅                                    |
| i18n                   | ✅                                    |

---

## Rekomendasi Fitur

### 🔥 Prioritas Tinggi

#### 1. Transfer Antar Akun

Belum ada cara memindahkan uang antar akun (misal dari BCA ke GoPay).

- **Tabel baru:** `transfers` (source_account_id, destination_account_id, amount, fee, notes)
- **Dampak:** Update balance kedua akun, catat di activity log
- **Kompleksitas:** Rendah — pola CRUD sudah ada di composables lain

#### 2. Manajemen Langganan (Subscription Hub)

Lihat semua langganan aktif dalam satu tempat (Netflix, Spotify, dll).

- Memanfaatkan tabel `recurring_transactions` yang sudah ada + filter `type: 'subscription'`
- View khusus dengan informasi: tagihan bulan depan, total pengeluaran bulanan
- Notifikasi sebelum billing date

#### 3. Forecasting / Arus Kas

Prediksi saldo berdasarkan transaksi berulang + saldo saat ini.

- **Data source:** `recurring_transactions` + `accounts.balance`
- **Visual:** Line chart 30/60 hari ke depan
- **Kompleksitas:** Sedang — charting sudah pakai Unovis

---

### 🧠 AI / Pintar

#### 4. OCR Receipt

Scan foto receipt/struk belanja — isi form transaksi otomatis.

- **DB:** Kolom `receipt_image` sudah ada di tabel `transactions`
- **Flow:** Upload foto (Supabase Storage) → extract dengan OCR → mapping amount/date/merchant → review user
- **Integrasi:** OCR via free tier Google Cloud Vision atau Tesseract via edge function
- **Kompleksitas:** Sedang-tinggi

#### 5. Spending Insights / Analisis Pola

Rangkuman pengeluaran periodik: "Bulan ini kamu habis 20% lebih banyak untuk makanan."

- **Data source:** `transactions` + `categories`
- **Feature:** Bandingkan bulan ke bulan, kategori terbesar, tren bulanan
- **Delivery:** Widget di dashboard atau halaman insight terpisah
- **Kompleksitas:** Sedang

---

### 📱 Pengalaman & Kualitas Hidup

#### 6. PWA / Mobile-First

Agar aplikasi bisa "di-install" ke home screen HP.

- **Teknologi:** Vite PWA plugin (`vite-plugin-pwa`)
- **Manfaat:** Notifikasi push, offline mode, akses cepat
- **Kompleksitas:** Rendah-sedang

#### 7. Multiple Layout Charts di Dashboard

Dashboard saat ini menampilkan chart — bisa ditambah variasi tampilan (harian, mingguan, kustom).

#### 8. Dark Mode Polish

Sudah support dark mode via CSS variables, tapi bisa diperhalus transisi dan konsistensi.

#### 9. Ekspor/Impor Lebih Lengkap

- CSV import dari bank (BCA, Mandiri format)
- Ekspor PDF untuk laporan

#### 10. Tag/Pengelompokan Kustom

Selain kategori, tambah tag bebas untuk grouping lintas kategori (e.g., #trip, #rumah, #work).

---

### 🏗️ Arsitektur & Teknis

#### 11. Notifikasi Real-time

- **Teknologi:** Supabase Realtime subscriptions
- **Use case:** Notifikasi saat partner menambah transaksi, tagihan jatuh tempo
- **Kompleksitas:** Sedang

#### 12. Scheduler / Cron untuk Recurring

Automatically create transactions from recurring schedule.

- **Teknologi:** `pg_cron` di Supabase atau edge function scheduled
- **Kompleksitas:** Sedang

---

## Urutan Implementasi yang Direkomendasikan

1. **Transfer Antar Akun** — paling berdampak, effort rendah
2. **Subscription Hub** — manfaatkan data yang sudah ada
3. **Forecasting / Arus Kas** — bedakan dari dashboard yang sudah ada
4. **Spending Insights** — nilai tambah tinggi, pakai data historis
5. **PWA / Mobile** — pengalaman pengguna
6. **OCR Receipt** — fitur "wow" tapi effort lebih besar

---

_Dokumen ini bisa diperbarui seiring prioritas yang berubah._
