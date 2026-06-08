# Proyek Standards: Reusable Architecture

Dokumen ini berisi standar komponen reusable yang **WAJIB** digunakan untuk menjaga konsistensi UI/UX dan kebersihan kode di proyek **finance-vite**.

## 1. Komponen Layout Utama

| Komponen | Kegunaan | Contoh Penggunaan |
| :--- | :--- | :--- |
| `PageHeader` | Judul halaman + Tombol aksi utama | `<PageHeader title="Daftar" button-text="Tambah" @action="..." />` |
| `BaseCard` | Wrapper kartu gaya "Bento Box" | `<BaseCard title="Total" subtitle="..."> Konten </BaseCard>` |
| `BaseDialog` | Wrapper modal standar | `<BaseDialog v-model:open="isOpen" title="..."> Form </BaseDialog>` |

## 2. Komponen Input & Data

| Komponen | Kegunaan | Contoh Penggunaan |
| :--- | :--- | :--- |
| `CurrencyInput` | Input angka dengan format mata uang otomatis | `<CurrencyInput v-model="form.amount" :currency="form.currency" />` |
| `DateRangePicker` | Filter rentang tanggal dengan label otomatis | `<DateRangePicker v-model="dateRange" />` |
| `StatCard` | Kartu ringkasan angka dengan varian warna | `<StatCard label="Saldo" :value="1000" variant="success" />` |
| `EmptyState` | Tampilan saat data kosong | `<EmptyState title="Kosong" icon="hugeicons:search" />` |

## 3. Komponen Utilitas List

| Komponen | Kegunaan | Contoh Penggunaan |
| :--- | :--- | :--- |
| `ListItemAction` | Grup tombol Edit & Hapus | `<ListItemAction @edit="..." @delete="..." />` |
| `StatusBadge` | Label status kecil berwarna | `<StatusBadge type="danger">Expense</StatusBadge>` |

---

## Prinsip Pengembangan
1. **Global First**: Semua komponen di atas terdaftar secara global di `main.ts`. Tidak perlu import manual.
2. **Logic Centralization**: Logika kompleks (seperti format angka atau tanggal) harus berada di komponen, bukan di halaman.
3. **DRY (Don't Repeat Yourself)**: Jangan menulis ulang class Tailwind `rounded-4xl border border-border/50` secara manual, gunakan `BaseCard`.
