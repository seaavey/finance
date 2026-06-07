## 11. Migration History

| #   | Migration                                          | Tgl (Approx) | Deskripsi                                                  |
| --- | -------------------------------------------------- | ------------ | ---------------------------------------------------------- |
| 1   | `20260523165600_init`                              | 23 Mei '26   | Schema awal: profiles, categories, transactions, recurring |
| 2   | `20260524000000_todos`                             | 24 Mei '26   | Tabel todos (sejak itu di-drop)                            |
| 3   | `20260524000001_todos_due_date`                    | 24 Mei '26   | Tambah `due_date` ke todos                                 |
| 4   | `20260525000000_recurring_rename`                  | 25 Mei '26   | Rename recurring → recurring_transactions                  |
| 5   | `20260525000001_recurring_fix`                     | 25 Mei '26   | Fix recurring schema                                       |
| 6   | `20260526000000_couple_invitations`                | 26 Mei '26   | Tabel couple_invitations                                   |
| 7   | `20260526000001_couple_partner_id`                 | 26 Mei '26   | Tambah `partner_id` ke profiles                            |
| 8   | `20260526000002_couple_rls`                        | 26 Mei '26   | RLS policies untuk couple mode                             |
| 9   | `20260526000003_fix_profiles_rls`                  | 26 Mei '26   | Fix RLS profiles                                           |
| 10  | `20260526000004_invitation_profiles_rls`           | 26 Mei '26   | RLS untuk invitations + profiles                           |
| 11  | `20260526000005_fix_invitation_fk`                 | 26 Mei '26   | Fix foreign key invitations                                |
| 12  | `20260526000006_accept_invitation_rpc`             | 26 Mei '26   | RPC `accept_couple_invitation`                             |
| 13  | `20260527000000_receipt_image`                     | 27 Mei '26   | Tambah column untuk receipt image di transactions          |
| 14  | `20260527000001_drop_todos`                        | 27 Mei '26   | Drop tabel todos                                           |
| 15  | `20260527000002_drop_budgets`                      | 27 Mei '26   | Drop budget lama (redesign)                                |
| 16  | `20260527000003_goals`                             | 27 Mei '26   | Tabel goals                                                |
| 17  | `20260527000004_goal_images`                       | 27 Mei '26   | Upload gambar untuk goals                                  |
| 18  | `20260528000001_index_categories_user_id`          | 28 Mei '26   | Index categories.user_id                                   |
| 19  | `20260528000002_index_goals_user_id`               | 28 Mei '26   | Index goals.user_id                                        |
| 20  | `20260529000000_budgets`                           | 29 Mei '26   | Recreate budgets table (versi baru)                        |
| 21  | `20260530000000_accounts`                          | 30 Mei '26   | Tabel accounts                                             |
| 22  | `20260530000001_accounts_types`                    | 30 Mei '26   | Tambah constraint type ke accounts                         |
| 23  | `20260531000000_bills`                             | 31 Mei '26   | Tabel bills                                                |
| 24  | `20260531000001_activity_logs`                     | 31 Mei '26   | Tabel activity_logs                                        |
| 25  | `20260601000000_bill_paid_with`                    | 1 Jun '26    | Tambah `paid_with_account_id` ke bills                     |
| 26  | `20260601000001_exchange_rates`                    | 1 Jun '26    | Tabel exchange_rates                                       |
| 27  | `20260602000000_disconnect_partner`                | 2 Jun '26    | RPC `disconnect_partner`                                   |
| 28  | `20260602000001_fix_rls_vulnerabilities`           | 2 Jun '26    | Security fix RLS                                           |
| 29  | `20260602000002_fix_exchange_rates_rls`            | 2 Jun '26    | Fix RLS exchange_rates                                     |
| 30  | `20260602000003_fix_receipts_bucket_rls`           | 2 Jun '26    | Fix RLS storage bucket receipts                            |
| 31  | `20260603000001_optimize_indexes`                  | 3 Jun '26    | Optimasi index untuk performance                           |
| 32  | `20260604000000_allow_partner_update_transactions` | 4 Jun '26    | RLS: partner bisa update transaksi pasangan                |
| 33  | `20260604000001_allow_partner_delete_transactions` | 4 Jun '26    | RLS: partner bisa delete transaksi pasangan                |
| 34  | `20260606000000_goals_partner_rls`                 | 6 Jun '26    | RLS: partner bisa lihat goals pasangan                     |
| 35  | `20260607000000_transaction_attachments`           | 7 Jun '26    | Tambah kolom `image_url` di transactions                   |
| 36  | `20260608000000_split_transactions`                | 8 Jun '26    | Tambah kolom `splits` (jsonb) untuk split kategori         |
| 37  | `20260608000001_multiple_budgets_per_category`     | 8 Jun '26    | Tambah kolom `name` di budgets + drop unique constraint    |
| 38  | `20260609000000_dashboard_summary_rpc`             | 9 Jun '26    | RPC `get_transaction_summary` dengan konversi mata uang    |
| 39  | `20260609000001_category_stats_rpc`                | 9 Jun '26    | RPC `get_category_stats` untuk statistik kategori          |
| 40  | `20260609000002_indexing_optimizations`            | 9 Jun '26    | Optimasi index pada tabel transaksi dan budgets            |
| 41  | `20260609000003_performance_tuning`                | 9 Jun '26    | Fine-tuning PostgreSQL parameters untuk workload tinggi     |

**Catatan:** Migrasi dilakukan dalam 18 hari (23 Mei - 9 Juni 2026). Ini menunjukkan development pace yang sangat cepat.

---