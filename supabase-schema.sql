-- Supabase schema untuk SPPG Sindang
-- Buat tabel nutrition dan quality serta policy untuk anonymous access.

-- Pastikan ekstensi pgcrypto tersedia.
create extension if not exists "pgcrypto";

create table if not exists public.nutrition (
  id uuid primary key default gen_random_uuid(),
  app_id text not null,
  school text not null,
  menu text,
  porsi integer,
  session_id text,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.quality (
  id uuid primary key default gen_random_uuid(),
  app_id text not null,
  school text not null,
  rasa integer,
  suhu integer,
  bersih integer,
  catatan text,
  session_id text,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Aktifkan row level security untuk kedua tabel.
alter table public.nutrition enable row level security;
alter table public.quality enable row level security;

-- Policy untuk anonymous client berhasil membaca data, khusus untuk app_id tertentu.
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

-- Tidak membuat policy UPDATE atau DELETE untuk anon. Dengan RLS, operasi ini akan ditolak secara default,
-- sehingga data hanya dapat ditambahkan dan dibaca oleh anonymous client.
