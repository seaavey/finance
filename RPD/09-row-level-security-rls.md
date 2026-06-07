## 9. Row-Level Security (RLS)

### 9.1 Policy Pattern

Semua tabel user-scoped mengikuti pola:

```sql
-- SELECT: user can only see own rows
CREATE POLICY "Users can view own X"
  ON public.X FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: auto-set user_id from auth context
CREATE POLICY "Users can insert own X"
  ON public.X FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: only own rows
CREATE POLICY "Users can update own X"
  ON public.X FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: only own rows
CREATE POLICY "Users can delete own X"
  ON public.X FOR DELETE
  USING (auth.uid() = user_id);
```

### 9.2 Couple Mode RLS (Special)

Saat couple mode aktif, RLS diperluas untuk mengizinkan akses pasangan:

```sql
-- Policy: user dapat melihat data milik pasangan juga
CREATE POLICY "couple_select"
  ON public.transactions FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT partner_id FROM profiles WHERE id = user_id
    )
  );
```

Ini diterapkan di tabel: `transactions`, `accounts`, `categories` (read-only untuk partner).

### 9.3 Tabel dengan RLS

| Tabel                    | Policies                          | Couple-aware?                           |
| ------------------------ | --------------------------------- | --------------------------------------- |
| `profiles`               | 3 (select, update, insert)        | ✗ (masing-masing punya profile sendiri) |
| `categories`             | 4 (CRUD) + couple select          | ✓                                       |
| `transactions`           | 4 (CRUD) + couple select          | ✓                                       |
| `accounts`               | 4 (CRUD) + couple select          | ✓                                       |
| `budgets`                | 4 (CRUD)                          | ✗                                       |
| `bills`                  | 4 (CRUD)                          | ✗                                       |
| `recurring_transactions` | 4 (CRUD)                          | ✗                                       |
| `goals`                  | 4 (CRUD)                          | ✗                                       |
| `activity_logs`          | 4 (CRUD)                          | ✗                                       |
| `couple_invitations`     | 4 (CRUD) + sender/recipient rules | N/A                                     |

---