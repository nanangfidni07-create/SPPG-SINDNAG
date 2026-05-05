# SPPG Sindang - Monitoring Gizi

Aplikasi front-end untuk memonitor distribusi makanan dan kualitas hidangan di sekolah-sekolah Sindang.

## Deskripsi

SPPG Sindang adalah sistem pemantauan gizi yang dibuat dengan React dan Supabase. Aplikasi ini memungkinkan pengguna untuk:
- mencatat distribusi porsi makanan ke sekolah-sekolah terdaftar
- melakukan penilaian kualitas makanan berdasarkan rasa, suhu, dan kebersihan
- melihat data real-time dari Supabase Realtime

## Fitur Utama

- Input distribusi makanan (`Distribusi`) untuk mencatat menu dan jumlah porsi
- Input kualitas makanan (`Kualitas`) untuk menangkap nilai rasa, suhu, kebersihan, dan catatan
- Pencarian sekolah cepat
- Sinkronisasi data real-time dengan Supabase Realtime
- Otentikasi pengguna anonim via Supabase anon key

## Sekolah yang Didukung

- SDN Dermayu
- TK Gandasari
- Al Maadi
- Al Wasliyah
- MTS Al-Wasliyah
- SMP Al-Irsyad
- KB Ushafa
- TK Ushafa
- SD Al-Khoir
- SDN 1 Sindang
- SDN 2 Sindang
- SD Al-Irsyad
- SMA PGRI 2 Sindang

## Teknologi

- React
- Supabase (Postgres dan Realtime)
- Tailwind CSS
- lucide-react untuk ikon

## Struktur Data Supabase

Data tersimpan dalam tabel Postgres sebagai:
- `nutrition`
- `quality`

Setiap baris sebaiknya memiliki kolom:
- `id` (uuid atau bigserial)
- `app_id`
- `school`
- `timestamp`
- `session_id`
- `menu` / `porsi`
- `rasa`, `suhu`, `bersih`, `catatan`

Untuk sinkronisasi real-time, gunakan Realtime pada tabel `nutrition` dan `quality`.

## Instalasi

1. Pastikan Node.js dan npm sudah terpasang.
2. Jalankan:
   ```bash
   npm install
   ```
3. Buat file `.env` berdasarkan `.env.example`.

## Konfigurasi

Aplikasi ini menggunakan variabel lingkungan berikut:
- `VITE_SUPABASE_URL` — URL proyek Supabase
- `VITE_SUPABASE_ANON_KEY` — public anon key Supabase
- `VITE_APP_ID` — ID aplikasi internal (misalnya `monitoring-gizi-vercel`)

## Cara Menjalankan

Jalankan perintah berikut di folder proyek:

```bash
npm run dev
```

atau sesuai setup framework yang digunakan.
## Supabase Setup

1. Buat project baru di Supabase.
2. Jalankan `supabase-schema.sql` untuk membuat tabel dan policy.
3. (Opsional) Jalankan `supabase-sample-data.sql` untuk menambahkan data contoh.
4. Jika Anda ingin hanya membuat policy tanpa membuat ulang tabel, jalankan `supabase-policies.sql`.
5. Jika Anda ingin menambahkan akses untuk pengguna authenticated, jalankan `supabase-auth-policies.sql`.
6. Pastikan Realtime aktif untuk tabel `nutrition` dan `quality`.
7. Jika RLS aktif, policy sudah termasuk `SELECT` dan `INSERT` untuk anon dengan `app_id = 'monitoring-gizi-vercel'` dan sekolah hanya dari daftar resmi.
8. `UPDATE` dan `DELETE` tidak diizinkan untuk anonymous client oleh default RLS policy.
## Login Supabase

Aplikasi menyediakan layar login Supabase. Gunakan login untuk:
- mendapatkan role `authenticated`
- mengakses policy `supabase-auth-policies.sql`
- menyimpan `auth_user_id` pada setiap entri yang dikirim

Untuk login, buka aplikasi dan tekan tombol logout/icon di kanan atas untuk beralih ke layar login.
## Catatan

File saat ini berisi komponen React utama untuk antarmuka monitoring gizi. Jika Anda ingin mengembangkan lebih lanjut:
- tambahkan halaman atau rute baru
- perbaiki validasi form
- optimalkan query Supabase

## Lisensi

Silakan gunakan dan modifikasi sesuai kebutuhan.

## Deployment

Aplikasi ini siap dideploy sebagai SPA. Untuk hosting gunakan Vercel atau Netlify, dan database tetap berada di Supabase.

### Deploy ke Vercel

1. Pastikan repository sudah di-push ke GitHub.
2. Masuk ke Vercel dan pilih "New Project".
3. Hubungkan repository `SPPG-SINDNAG`.
4. Di halaman project settings, tambahkan environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_ID`
5. Atur build command:
   ```bash
   npm run build
   ```
6. Atur output directory:
   ```bash
   dist/
   ```
7. Deploy.

### Supabase

1. Buat project baru di Supabase.
2. Buka SQL editor dan jalankan `supabase-schema.sql`.
3. (Opsional) Jalankan `supabase-sample-data.sql` untuk data contoh.
4. Jika Anda ingin akses authenticated, jalankan `supabase-auth-policies.sql`.
5. Pastikan Realtime aktif untuk tabel `nutrition` dan `quality`.

> Catatan: Supabase database tidak dideploy di Vercel. Vercel hanya meng-host frontend; database dikelola di Supabase.
