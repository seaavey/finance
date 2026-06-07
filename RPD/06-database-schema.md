## 6. Database Schema

### 6.1 Tabel: `profiles`

| Kolom          | Tipe          | Default | Constraint                            | Deskripsi                 |
| -------------- | ------------- | ------- | ------------------------------------- | ------------------------- |
| `id`           | `uuid`        | —       | PK → auth.users(id) ON DELETE CASCADE | User ID                   |
| `display_name` | `text`        | —       | —                                     | Nama tampilan             |
| `currency`     | `text`        | `'IDR'` | —                                     | Base currency             |
| `avatar_url`   | `text`        | —       | —                                     | Foto profil dari Google   |
| `partner_id`   | `uuid`        | —       | → profiles(id)                        | ID pasangan (couple mode) |
| `created_at`   | `timestamptz` | `now()` | —                                     | Waktu dibuat              |
| `updated_at`   | `timestamptz` | `now()` | —                                     | Waktu diupdate            |

**Trigger:** `on_auth_user_created` — auto-create profile saat user signup via Google OAuth.

### 6.2 Tabel: `categories`

| Kolom        | Tipe          | Default             | Constraint                              | Deskripsi         |
| ------------ | ------------- | ------------------- | --------------------------------------- | ----------------- |
| `id`         | `uuid`        | `gen_random_uuid()` | PK                                      | —                 |
| `user_id`    | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE      | Pemilik           |
| `name`       | `text`        | —                   | NOT NULL                                | Nama kategori     |
| `icon`       | `text`        | —                   | —                                       | Iconify icon name |
| `color`      | `text`        | `'#6366f1'`         | —                                       | Warna hex         |
| `type`       | `text`        | —                   | `CHECK (type IN ('income', 'expense'))` | Tipe              |
| `created_at` | `timestamptz` | `now()`             | —                                       | —                 |

**Default Categories:**
| Income | Expense |
|--------|---------|
| Gaji 💰 | Makanan 🍽️ |
| Freelance 💻 | Transport 🚗 |
| Investasi 📈 | Belanja 🛍️ |
| Lainnya 📌 | Tagihan 📄 |
| | Hiburan 🎮 |
| | Kesehatan 💊 |
| | Lainnya 📌 |

### 6.3 Tabel: `transactions`

| Kolom         | Tipe          | Default             | Constraint                              | Deskripsi                  |
| ------------- | ------------- | ------------------- | --------------------------------------- | -------------------------- |
| `id`          | `uuid`        | `gen_random_uuid()` | PK                                      | —                          |
| `user_id`     | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE      | Pemilik                    |
| `category_id` | `uuid`        | —                   | → categories(id) ON DELETE SET NULL     | Kategori                   |
| `account_id`  | `uuid`        | —                   | → accounts(id) ON DELETE SET NULL       | Akun (opsional)            |
| `type`        | `text`        | —                   | `CHECK (type IN ('income', 'expense'))` | Tipe                       |
| `amount`      | `numeric`     | `0`                 | NOT NULL                                | Jumlah                     |
| `currency`    | `text`        | `'IDR'`             | —                                       | Mata uang                  |
| `description` | `text`        | —                   | —                                       | Deskripsi/catatan          |
| `date`        | `date`        | `current_date`      | NOT NULL                                | Tanggal transaksi          |
| `image_url`   | `text`        | —                   | —                                       | URL lampiran (receipt)     |
| `splits`      | `jsonb`       | `'[]'`              | —                                       | Split ke multiple kategori |
| `created_at`  | `timestamptz` | `now()`             | —                                       | —                          |
| `updated_at`  | `timestamptz` | `now()`             | —                                       | —                          |

**Indexes:**

- `idx_transactions_user_date` ON `(user_id, date DESC)`
- `idx_transactions_user_type` ON `(user_id, type)`
- Additional optimized indexes from migration `20260603000001`

### 6.4 Tabel: `accounts`

| Kolom             | Tipe          | Default             | Constraint                                                                | Deskripsi         |
| ----------------- | ------------- | ------------------- | ------------------------------------------------------------------------- | ----------------- |
| `id`              | `uuid`        | `gen_random_uuid()` | PK                                                                        | —                 |
| `user_id`         | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE                                        | Pemilik           |
| `name`            | `text`        | —                   | NOT NULL                                                                  | Nama akun         |
| `type`            | `text`        | —                   | `CHECK (type IN ('bank', 'e-wallet', 'cash', 'investment', 'liability'))` | Jenis akun        |
| `currency`        | `text`        | `'IDR'`             | —                                                                         | Mata uang akun    |
| `color`           | `text`        | —                   | —                                                                         | Warna tampilan    |
| `icon`            | `text`        | —                   | —                                                                         | Iconify icon name |
| `initial_balance` | `numeric`     | `0`                 | —                                                                         | Saldo awal        |
| `created_at`      | `timestamptz` | `now()`             | —                                                                         | —                 |
| `updated_at`      | `timestamptz` | `now()`             | —                                                                         | —                 |

**Account Types:** `bank`, `e-wallet`, `cash`, `investment`, `liability`

### 6.5 Tabel: `budgets`

| Kolom         | Tipe          | Default             | Constraint                         | Deskripsi      |
| ------------- | ------------- | ------------------- | ---------------------------------- | -------------- |
| `id`          | `uuid`        | `gen_random_uuid()` | PK                                 | —              |
| `user_id`     | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE | Pemilik        |
| `category_id` | `uuid`        | —                   | → categories(id) ON DELETE CASCADE | Kategori       |
| `name`        | `text`        | —                   | —                                  | Nama budget    |
| `month`       | `text`        | —                   | NOT NULL (format: `YYYY-MM`)       | Periode budget |
| `amount`      | `numeric`     | —                   | NOT NULL                           | Alokasi budget |
| `created_at`  | `timestamptz` | `now()`             | —                                  | —              |
| `updated_at`  | `timestamptz` | `now()`             | —                                  | —              |

### 6.6 Tabel: `bills`

| Kolom                  | Tipe          | Default             | Constraint                                            | Deskripsi           |
| ---------------------- | ------------- | ------------------- | ----------------------------------------------------- | ------------------- |
| `id`                   | `uuid`        | `gen_random_uuid()` | PK                                                    | —                   |
| `user_id`              | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE                    | Pemilik             |
| `title`                | `text`        | —                   | NOT NULL                                              | Nama tagihan        |
| `amount`               | `numeric`     | —                   | NOT NULL                                              | Jumlah              |
| `due_date`             | `date`        | —                   | NOT NULL                                              | Tanggal jatuh tempo |
| `is_paid`              | `boolean`     | `false`             | —                                                     | Status bayar        |
| `paid_with_account_id` | `uuid`        | —                   | → accounts(id) ON DELETE SET NULL                     | Akun pembayaran     |
| `recurrence`           | `text`        | `'none'`            | `CHECK (recurrence IN ('none', 'weekly', 'monthly'))` | Frekuensi ulang     |
| `created_at`           | `timestamptz` | `now()`             | —                                                     | —                   |
| `updated_at`           | `timestamptz` | `now()`             | —                                                     | —                   |

### 6.7 Tabel: `recurring_transactions`

| Kolom         | Tipe          | Default             | Constraint                                                      | Deskripsi          |
| ------------- | ------------- | ------------------- | --------------------------------------------------------------- | ------------------ |
| `id`          | `uuid`        | `gen_random_uuid()` | PK                                                              | —                  |
| `user_id`     | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE                              | Pemilik            |
| `type`        | `text`        | —                   | `CHECK (type IN ('income', 'expense'))`                         | Tipe               |
| `amount`      | `numeric`     | `0`                 | NOT NULL                                                        | Jumlah             |
| `currency`    | `text`        | `'IDR'`             | —                                                               | Mata uang          |
| `category_id` | `uuid`        | —                   | → categories(id) ON DELETE SET NULL                             | Kategori           |
| `description` | `text`        | —                   | —                                                               | Deskripsi          |
| `frequency`   | `text`        | —                   | `CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly'))` | Frekuensi          |
| `next_date`   | `date`        | —                   | NOT NULL                                                        | Tanggal berikutnya |
| `active`      | `boolean`     | `true`              | —                                                               | Status aktif       |
| `created_at`  | `timestamptz` | `now()`             | —                                                               | —                  |
| `updated_at`  | `timestamptz` | `now()`             | —                                                               | —                  |

**Index:** `idx_recurring_user_active` ON `(user_id, active)`

### 6.8 Tabel: `goals`

| Kolom            | Tipe          | Default             | Constraint                         | Deskripsi           |
| ---------------- | ------------- | ------------------- | ---------------------------------- | ------------------- |
| `id`             | `uuid`        | `gen_random_uuid()` | PK                                 | —                   |
| `user_id`        | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE | Pemilik             |
| `name`           | `text`        | —                   | NOT NULL                           | Nama target         |
| `target_amount`  | `numeric`     | —                   | NOT NULL                           | Target nominal      |
| `current_amount` | `numeric`     | `0`                 | —                                  | Dana terkumpul      |
| `deadline`       | `date`        | —                   | —                                  | Deadline (opsional) |
| `icon`           | `text`        | —                   | —                                  | Icon                |
| `color`          | `text`        | `'#6366f1'`         | —                                  | Warna               |
| `image_url`      | `text`        | —                   | —                                  | URL gambar target   |
| `created_at`     | `timestamptz` | `now()`             | —                                  | —                   |
| `updated_at`     | `timestamptz` | `now()`             | —                                  | —                   |

**Index:** `idx_goals_user_id` ON `(user_id)`

### 6.9 Tabel: `activity_logs`

| Kolom         | Tipe          | Default             | Constraint                         | Deskripsi                                                |
| ------------- | ------------- | ------------------- | ---------------------------------- | -------------------------------------------------------- |
| `id`          | `uuid`        | `gen_random_uuid()` | PK                                 | —                                                        |
| `user_id`     | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE | Pelaku                                                   |
| `entity_type` | `text`        | —                   | NOT NULL                           | Tipe entitas (`transaction`, `category`, `budget`, dll.) |
| `entity_id`   | `uuid`        | —                   | —                                  | ID entitas terkait                                       |
| `action`      | `text`        | —                   | NOT NULL                           | Aksi (`created`, `updated`, `deleted`, `login`, dll.)    |
| `metadata`    | `jsonb`       | `'{}'`              | —                                  | Data tambahan                                            |
| `created_at`  | `timestamptz` | `now()`             | —                                  | —                                                        |

### 6.10 Tabel: `couple_invitations`

| Kolom             | Tipe          | Default             | Constraint                                                           | Deskripsi      |
| ----------------- | ------------- | ------------------- | -------------------------------------------------------------------- | -------------- |
| `id`              | `uuid`        | `gen_random_uuid()` | PK                                                                   | —              |
| `sender_id`       | `uuid`        | —                   | → auth.users(id) ON DELETE CASCADE                                   | Pengirim       |
| `recipient_email` | `text`        | —                   | NOT NULL                                                             | Email penerima |
| `status`          | `text`        | `'pending'`         | `CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled'))` | Status         |
| `token`           | `text`        | `gen_random_uuid()` | —                                                                    | Unique token   |
| `created_at`      | `timestamptz` | `now()`             | —                                                                    | —              |
| `updated_at`      | `timestamptz` | `now()`             | —                                                                    | —              |

### 6.11 Tabel: `exchange_rates`

| Kolom             | Tipe          | Default | Constraint | Deskripsi                            |
| ----------------- | ------------- | ------- | ---------- | ------------------------------------ |
| `target_currency` | `text`        | —       | PK         | Kode mata uang (USD, SGD, MYR, dll.) |
| `rate`            | `numeric`     | —       | NOT NULL   | 1 IDR = X target                     |
| `updated_at`      | `timestamptz` | `now()` | —          | —                                    |

### 6.12 Storage Buckets

| Bucket        | Visibility | Fungsi                          |
| ------------- | ---------- | ------------------------------- |
| `receipts`    | Private    | Upload gambar receipt untuk OCR |
| `goal-images` | Public     | Upload gambar target goal       |

### 6.13 Stored Procedures (RPC)

| Nama                      | Parameter                                                                      | Return  | Deskripsi                                                 |
| ------------------------- | ------------------------------------------------------------------------------ | ------- | --------------------------------------------------------- |
| `get_transaction_summary` | `p_user_id`, `p_start_date`, `p_end_date`, `p_target_currency`                 | `TABLE` | Ringkasan income/expense dengan konversi mata uang        |
| `get_category_stats`      | `p_user_id`, `p_start_date`, `p_end_date`                                      | `TABLE` | Statistik (jumlah & total) per kategori                   |
| `accept_invitation`       | `p_invitation_id`                                                              | `void`  | Menghubungkan user dengan partner berdasarkan undangan    |
| `disconnect_partner`      | —                                                                              | `void`  | Memutus hubungan partner dan membersihkan `partner_id`    |

---
