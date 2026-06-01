# Activity Log — Riwayat Aktivitas Aemy Finance

**Date:** 2026-05-31
**Status:** Draft
**Author:** seaavey

## 1. Ringkasan

Fitur Activity Log mencatat seluruh aktivitas pengguna di Aemy Finance ke dalam satu timeline kronologis. Pengguna dapat melihat riwayat lengkap mulai dari login, CRUD transaksi/kategori/budget/goal/bill/akun, hingga perubahan pengaturan — semuanya di satu halaman dedicated `/activities`.

## 2. Tujuan

- Memberikan transparansi penuh kepada pengguna tentang apa yang terjadi di akun mereka
- Membantu audit/pencarian ketika pengguna lupa kapan atau apa yang mereka lakukan
- Menjadi "kertas jejak" digital yang berguna untuk deteksi anomali di masa depan

## 3. Lingkup Aktivitas

Semua aktivitas dicatat, meliputi:

| Domain          | Aksi                      |
| --------------- | ------------------------- |
| **Auth**        | login, logout             |
| **Transaction** | created, updated, deleted |
| **Category**    | created, updated, deleted |
| **Budget**      | created, updated, deleted |
| **Goal**        | created, updated, deleted |
| **Bill**        | created, updated, deleted |
| **Account**     | created, updated, deleted |
| **Recurring**   | created, updated, deleted |
| **Todo**        | created, updated, deleted |
| **Partner**     | connected, disconnected   |

## 4. Arsitektur

### 4.1. Database — Table Baru

```sql
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.activity_logs enable row level security;

create policy "Users can view own activity logs"
  on public.activity_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity logs"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

create index if not exists idx_activity_logs_user_created
  on public.activity_logs(user_id, created_at desc);
```

### 4.2. Composable — `useActivityLog.ts`

Mengikuti pola composable yang sudah ada (`useTransactions`, `useBudgets`, dll).

```typescript
// Lokasi: src/composables/useActivityLog.ts

// State:
// - logs: Ref<ActivityLog[]>
// - loading: Ref<boolean>

// Methods:
// - log(entityType, action, metadata?) → Promise<void>
//   Insert log ke Supabase. Dipanggil dari composable lain setelah operasi sukses.
//   NOTE: Tidak ada parameter description — deskripsi dibentuk via i18n di frontend.
//   Yang disimpan di DB hanya entity_type + action + metadata (data terstruktur).

// - fetchAll({ page, limit, entityType?, action?, startDate?, endDate? }) → Promise<void>
//   Ambil log dengan pagination & filter.

// - fetchRecent(limit = 5) → Promise<ActivityLog[]>
//   Ambil log terbaru (buat widget dashboard nanti).

// Types:
interface ActivityLog {
  id: string
  user_id: string
  entity_type: EntityType
  entity_id: string | null
  action: ActionType
  metadata: Record<string, unknown>
  // description tidak disimpan di DB — dirender via i18n di frontend
  created_at: string
}

// Untuk nampilin deskripsi di frontend, pake helper:
// $t(`activity.${entityType}.${action}`, metadata)
// Contoh: $t('activity.transaction.created', { description: 'Makan Siang', amount: 25000 })

type EntityType =
  | 'transaction'
  | 'category'
  | 'budget'
  | 'goal'
  | 'bill'
  | 'account'
  | 'recurring'
  | 'todo'
  | 'partner'
  | 'auth'

type ActionType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'login'
  | 'logout'
  | 'connected'
  | 'disconnected'
```

### 4.3. Integrasi ke Composable yang Ada

Tambahkan `activity.log(entityType, action, metadata)` di **akhir** method yang sukses (setelah validasi dan setelah insert/update/delete ke Supabase). **Tidak ada parameter description — cukup data terstruktur.**

**Pola umum:**

```typescript
// Di useTransactions.ts — createTransaction
const { data, error } = await supabase.from('transactions').insert(...)
if (error) { /* handle */ }
// Data transaksi sudah ada di variable, tinggal log data terstruktur
activity.log('transaction', 'created', {
  description: values.description,
  amount: values.amount,
  type: values.type,
  category_id: values.category_id,
})
```

**Khusus auth:** Login/logout tidak melalui Supabase langsung — hook di `useAuth.ts`:

```typescript
// Login berhasil
activity.log('auth', 'login')

// Logout
activity.log('auth', 'logout')
```

Di frontend, deskripsi dirender via i18n:

```vue
<template>
  <p>{{ $t(`activity.${log.entity_type}.${log.action}`, log.metadata) }}</p>
</template>
```

### 4.4. Halaman `/activities` — Folder-based Route

```
src/pages/
  activities/
    index.vue          → Tabel utama activity log
```

**Komponen:**

- `ActivityLogList.vue` — tabel utama dengan infinite scroll atau pagination
- `ActivityLogFilter.vue` — filter bar (date range, entity type, action)
- `ActivityLogItem.vue` — satu baris log (icon + deskripsi + timestamp)

**Layout halaman:**

```
┌─────────────────────────────────────────────┐
│  🔍 [Filter by type] [Filter by action]     │
│  [Date range: ▾]                           │
├─────────────────────────────────────────────┤
│ 🔵 Baru saja   Menambahkan transaksi...     │
│ 🟢 2 jam lalu  Login dari perangkat baru    │
│ 🟡 Kemarin     Budget "Groceries" diubah    │
│ 🔴 3 hari lalu Kategori "Transport" dihapus │
│ ...                                         │
│ [Load more ↓]                               │
└─────────────────────────────────────────────┘
```

**Deskripsi dirender via i18n** — menggunakan `$t(`activity.${entity_type}.${action}`, metadata)` agar mendukung bilingual (id/en).

### 4.5. i18n — Locale Keys

Semua deskripsi aktivitas dirender melalui vue-i18n, bukan hardcoded string. Database hanya menyimpan data terstruktur (`entity_type`, `action`, `metadata`), tanpa `description` column.

**Pola key:**

```
activity.<entity_type>.<action>
```

**Contoh isi locale files:**

```json
// id.json
{
  "activity": {
    "auth": {
      "login": "Login berhasil",
      "logout": "Logout"
    },
    "transaction": {
      "created": "Menambahkan transaksi \"{description}\"",
      "updated": "Mengubah transaksi \"{description}\"",
      "deleted": "Menghapus transaksi \"{description}\""
    },
    "category": {
      "created": "Menambahkan kategori \"{name}\"",
      "updated": "Mengubah kategori \"{name}\"",
      "deleted": "Menghapus kategori \"{name}\""
    },
    "budget": {
      "created": "Menambahkan budget untuk \"{category_name}\"",
      "updated": "Mengubah budget untuk \"{category_name}\"",
      "deleted": "Menghapus budget untuk \"{category_name}\""
    },
    "goal": {
      "created": "Menambahkan goal \"{name}\"",
      "updated": "Mengubah goal \"{name}\"",
      "deleted": "Menghapus goal \"{name}\""
    },
    "bill": {
      "created": "Menambahkan tagihan \"{name}\"",
      "updated": "Mengubah tagihan \"{name}\"",
      "deleted": "Menghapus tagihan \"{name}\""
    },
    "account": {
      "created": "Menambahkan akun \"{name}\"",
      "updated": "Mengubah akun \"{name}\"",
      "deleted": "Menghapus akun \"{name}\""
    },
    "recurring": {
      "created": "Menambahkan transaksi berulang \"{name}\"",
      "updated": "Mengubah transaksi berulang \"{name}\"",
      "deleted": "Menghapus transaksi berulang \"{name}\""
    },
    "todo": {
      "created": "Menambahkan tugas \"{description}\"",
      "updated": "Mengubah tugas \"{description}\"",
      "deleted": "Menghapus tugas \"{description}\""
    },
    "partner": {
      "connected": "Terhubung dengan pasangan",
      "disconnected": "Putus koneksi dengan pasangan"
    }
  }
}
```

```json
// en.json
{
  "activity": {
    "auth": {
      "login": "Logged in",
      "logout": "Logged out"
    },
    "transaction": {
      "created": "Added transaction \"{description}\"",
      "updated": "Updated transaction \"{description}\"",
      "deleted": "Deleted transaction \"{description}\""
    },
    "category": {
      "created": "Added category \"{name}\"",
      "updated": "Updated category \"{name}\"",
      "deleted": "Deleted category \"{name}\""
    },
    "budget": {
      "created": "Added budget for \"{category_name}\"",
      "updated": "Updated budget for \"{category_name}\"",
      "deleted": "Deleted budget for \"{category_name}\""
    },
    "goal": {
      "created": "Added goal \"{name}\"",
      "updated": "Updated goal \"{name}\"",
      "deleted": "Deleted goal \"{name}\""
    },
    "bill": {
      "created": "Added bill \"{name}\"",
      "updated": "Updated bill \"{name}\"",
      "deleted": "Deleted bill \"{name}\""
    },
    "account": {
      "created": "Added account \"{name}\"",
      "updated": "Updated account \"{name}\"",
      "deleted": "Deleted account \"{name}\""
    },
    "recurring": {
      "created": "Added recurring \"{name}\"",
      "updated": "Updated recurring \"{name}\"",
      "deleted": "Deleted recurring \"{name}\""
    },
    "todo": {
      "created": "Added task \"{description}\"",
      "updated": "Updated task \"{description}\"",
      "deleted": "Deleted task \"{description}\""
    },
    "partner": {
      "connected": "Connected with partner",
      "disconnected": "Disconnected from partner"
    }
  }
}
```

**Cara render di komponen:**

```vue
<template>
  <span>{{ $t(`activity.${log.entity_type}.${log.action}`, log.metadata) }}</span>
</template>
```

**Label UI terpisah** — untuk judul halaman, tombol, label filter:

```json
// id.json
{
  "activities": {
    "title": "Riwayat Aktivitas",
    "filter_entity": "Jenis",
    "filter_action": "Aksi",
    "filter_date": "Rentang Tanggal",
    "empty": "Belum ada aktivitas",
    "load_more": "Muat lebih banyak"
  }
}
```

```json
// en.json
{
  "activities": {
    "title": "Activity History",
    "filter_entity": "Type",
    "filter_action": "Action",
    "filter_date": "Date Range",
    "empty": "No activity yet",
    "load_more": "Load more"
  }
}
```

## 5. i18n Key Reference

| Key                             | Parameters        | ID (Indonesia)                             | EN (English)                         |
| ------------------------------- | ----------------- | ------------------------------------------ | ------------------------------------ |
| `activity.auth.login`           | —                 | Login berhasil                             | Logged in                            |
| `activity.auth.logout`          | —                 | Logout                                     | Logged out                           |
| `activity.transaction.created`  | `{description}`   | Menambahkan transaksi "{description}"      | Added transaction "{description}"    |
| `activity.transaction.updated`  | `{description}`   | Mengubah transaksi "{description}"         | Updated transaction "{description}"  |
| `activity.transaction.deleted`  | `{description}`   | Menghapus transaksi "{description}"        | Deleted transaction "{description}"  |
| `activity.category.created`     | `{name}`          | Menambahkan kategori "{name}"              | Added category "{name}"              |
| `activity.category.updated`     | `{name}`          | Mengubah kategori "{name}"                 | Updated category "{name}"            |
| `activity.category.deleted`     | `{name}`          | Menghapus kategori "{name}"                | Deleted category "{name}"            |
| `activity.budget.created`       | `{category_name}` | Menambahkan budget untuk "{category_name}" | Added budget for "{category_name}"   |
| `activity.budget.updated`       | `{category_name}` | Mengubah budget untuk "{category_name}"    | Updated budget for "{category_name}" |
| `activity.budget.deleted`       | `{category_name}` | Menghapus budget untuk "{category_name}"   | Deleted budget for "{category_name}" |
| `activity.goal.created`         | `{name}`          | Menambahkan goal "{name}"                  | Added goal "{name}"                  |
| `activity.goal.updated`         | `{name}`          | Mengubah goal "{name}"                     | Updated goal "{name}"                |
| `activity.goal.deleted`         | `{name}`          | Menghapus goal "{name}"                    | Deleted goal "{name}"                |
| `activity.bill.created`         | `{name}`          | Menambahkan tagihan "{name}"               | Added bill "{name}"                  |
| `activity.bill.updated`         | `{name}`          | Mengubah tagihan "{name}"                  | Updated bill "{name}"                |
| `activity.bill.deleted`         | `{name}`          | Menghapus tagihan "{name}"                 | Deleted bill "{name}"                |
| `activity.account.created`      | `{name}`          | Menambahkan akun "{name}"                  | Added account "{name}"               |
| `activity.account.updated`      | `{name}`          | Mengubah akun "{name}"                     | Updated account "{name}"             |
| `activity.account.deleted`      | `{name}`          | Menghapus akun "{name}"                    | Deleted account "{name}"             |
| `activity.recurring.created`    | `{name}`          | Menambahkan transaksi berulang "{name}"    | Added recurring "{name}"             |
| `activity.recurring.updated`    | `{name}`          | Mengubah transaksi berulang "{name}"       | Updated recurring "{name}"           |
| `activity.recurring.deleted`    | `{name}`          | Menghapus transaksi berulang "{name}"      | Deleted recurring "{name}"           |
| `activity.todo.created`         | `{description}`   | Menambahkan tugas "{description}"          | Added task "{description}"           |
| `activity.todo.updated`         | `{description}`   | Mengubah tugas "{description}"             | Updated task "{description}"         |
| `activity.todo.deleted`         | `{description}`   | Menghapus tugas "{description}"            | Deleted task "{description}"         |
| `activity.partner.connected`    | —                 | Terhubung dengan pasangan                  | Connected with partner               |
| `activity.partner.disconnected` | —                 | Putus koneksi dengan pasangan              | Disconnected from partner            |

## 6. Tidak Dicakup (untuk Iterasi Pertama)

- [ ] Widget activity log di dashboard (bisa ditambahkan nanti)
- [ ] Notifikasi push/email untuk aktivitas
- [ ] Delete/purge activity logs (arsip manual)
- [ ] Export activity logs ke CSV/PDF
- [ ] Activity log untuk partner connection — melihat aktivitas pasangan
