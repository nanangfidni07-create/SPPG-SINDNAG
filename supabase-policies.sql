-- Supabase RLS policy khusus untuk SPPG Sindang
-- Gunakan file ini jika Anda hanya ingin menerapkan policy tanpa membuat ulang tabel.

-- Pastikan Row Level Security telah diaktifkan pada tabel.

create policy if not exists "Allow anon select nutrition" on public.nutrition
  for select using (auth.role() = 'anon' AND app_id = 'monitoring-gizi-vercel');

create policy if not exists "Allow anon insert nutrition" on public.nutrition
  for insert with check (
    auth.role() = 'anon' AND
    app_id = 'monitoring-gizi-vercel' AND
    school in (
      'SDN Dermayu',
      'TK Gandasari',
      'Al Maadi',
      'Al Wasliyah',
      'MTS Al-Wasliyah',
      'SMP Al-Irsyad',
      'KB Ushafa',
      'TK Ushafa',
      'SD Al-Khoir',
      'SDN 1 Sindang',
      'SDN 2 Sindang',
      'SD Al-Irsyad',
      'SMA PGRI 2 Sindang'
    )
  );

create policy if not exists "Allow anon select quality" on public.quality
  for select using (auth.role() = 'anon' AND app_id = 'monitoring-gizi-vercel');

create policy if not exists "Allow anon insert quality" on public.quality
  for insert with check (
    auth.role() = 'anon' AND
    app_id = 'monitoring-gizi-vercel' AND
    school in (
      'SDN Dermayu',
      'TK Gandasari',
      'Al Maadi',
      'Al Wasliyah',
      'MTS Al-Wasliyah',
      'SMP Al-Irsyad',
      'KB Ushafa',
      'TK Ushafa',
      'SD Al-Khoir',
      'SDN 1 Sindang',
      'SDN 2 Sindang',
      'SD Al-Irsyad',
      'SMA PGRI 2 Sindang'
    )
  );

-- Tidak membuat policy UPDATE atau DELETE untuk anon. Dengan RLS, operasi ini akan ditolak secara default.
