-- Contoh data awal untuk Supabase SPPG Sindang

insert into public.nutrition (app_id, school, menu, porsi, session_id)
values
  ('monitoring-gizi-vercel', 'SDN 1 Sindang', 'Nasi + Sayur + Ikan', 120, 'sample-session-1'),
  ('monitoring-gizi-vercel', 'TK Gandasari', 'Bubur Ayam', 60, 'sample-session-1'),
  ('monitoring-gizi-vercel', 'SDN 2 Sindang', 'Nasi + Telur', 80, 'sample-session-2');

insert into public.quality (app_id, school, rasa, suhu, bersih, catatan, session_id)
values
  ('monitoring-gizi-vercel', 'SDN 1 Sindang', 8, 7, 9, 'Makanan hangat dan bersih', 'sample-session-1'),
  ('monitoring-gizi-vercel', 'TK Gandasari', 7, 8, 8, 'Konsistensi bubur baik', 'sample-session-1'),
  ('monitoring-gizi-vercel', 'SDN 2 Sindang', 8, 7, 7, 'Sedikit pedas untuk anak-anak', 'sample-session-2');
