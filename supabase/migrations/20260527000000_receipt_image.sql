-- Add receipt_image column to transactions
alter table public.transactions
  add column if not exists receipt_image text;

-- Storage bucket
-- NOTE: Run this in Supabase Dashboard > Storage > Create bucket
-- Name: receipts
-- Public: false
-- 
-- RLS policy for receipts bucket:
-- create policy "Users can CRUD own receipts"
--   on storage.objects for all
--   using (auth.uid() = owner_id)
--   with check (auth.uid() = owner_id);
