-- Supabase role-based policies untuk pengguna authenticated di SPPG Sindang
-- Gunakan file ini setelah Anda menyiapkan autentikasi Supabase.
-- File ini menyetujui operasi SELECT, INSERT, UPDATE, dan DELETE untuk pengguna authenticated
-- pada app_id khusus, sementara anonymous hanya tetap dapat melakukan SELECT dan INSERT apabila menggunakan kebijakan lain.

create policy if not exists "Allow authenticated select nutrition" on public.nutrition
  for select using (auth.role() = 'authenticated' AND app_id = 'monitoring-gizi-vercel');

create policy if not exists "Allow authenticated insert nutrition" on public.nutrition
  for insert with check (auth.role() = 'authenticated' AND app_id = 'monitoring-gizi-vercel');

create policy if not exists "Allow authenticated update nutrition" on public.nutrition
  for update using (auth.role() = 'authenticated' AND app_id = 'monitoring-gizi-vercel');

create policy if not exists "Allow authenticated delete nutrition" on public.nutrition
  for delete using (auth.role() = 'authenticated' AND app_id = 'monitoring-gizi-vercel');

create policy if not exists "Allow authenticated select quality" on public.quality
  for select using (auth.role() = 'authenticated' AND app_id = 'monitoring-gizi-vercel');

create policy if not exists "Allow authenticated insert quality" on public.quality
  for insert with check (auth.role() = 'authenticated' AND app_id = 'monitoring-gizi-vercel');

create policy if not exists "Allow authenticated update quality" on public.quality
  for update using (auth.role() = 'authenticated' AND app_id = 'monitoring-gizi-vercel');

create policy if not exists "Allow authenticated delete quality" on public.quality
  for delete using (auth.role() = 'authenticated' AND app_id = 'monitoring-gizi-vercel');
