# SILAPOR SAMPAH (Sistem Lapor dan Pemantauan Pengangkutan Sampah)
### Dinas Lingkungan Hidup Kabupaten Kuningan

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Realtime%20Maps-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)

Aplikasi web modern, mobile-first, dan responsif (320–1920 px) yang dikembangkan untuk **Dinas Lingkungan Hidup (DLH) Kabupaten Kuningan** guna memudahkan masyarakat melaporkan titik timbulan sampah liar secara transparan, serta mengoptimalkan operasional dan pemantauan penugasan armada pengangkutan sampah secara realtime.

---

## Daftar Isi
- [Peran & Fitur Utama](#-peran--fitur-utama)
- [Tumpukan Teknologi](#-tumpukan-teknologi)
- [Struktur Proyek](#-struktur-proyek)
- [Prasyarat & Instalasi](#-prasyarat--instalasi)
- [Environment Variables](#-environment-variables)
- [Daftar Perintah (NPM Scripts & UAT)](#-daftar-perintah)
- [Panduan Singkat Pengguna per Peran](#-panduan-singkat-per-peran)
- [Checklist Keamanan & Proteksi Sistem](#-checklist-keamanan)
- [Panduan Deployment ke Vercel](#-panduan-deployment-ke-vercel)
- [Pertanyaan Terbuka untuk DLH Kuningan](#-pertanyaan-terbuka-untuk-dlh)

---

## 🚀 Peran & Fitur Utama

Sistem menerapkan **Role-Based Access Control (RBAC)** ketat dengan 4 jenis akses:

### 1. Publik (Masyarakat Kuningan) — Tanpa Akun
- **Buat Aduan Sampah (Layar 04/04b/05)**: Formulir laporan titik sampah dilengkapi foto bukti (kompresi otomatis di klien), deskripsi lokasi, koordinat GPS (opsional), proteksi Cloudflare Turnstile, honeypot, dan rate limit.
- **Kode Tiket Instan**: Tiket acak format `SLP-YYMM-XXXXXXXX` diterbitkan langsung untuk warga.
- **Cek Status Aduan (Layar 06/06b)**: Pantau perkembangan aduan secara transparan beserta catatan tindak lanjut dari petugas DLH.
- **Peta Armada Publik (Layar 03)**: Memantau armada pengangkut yang sedang beroperasi dengan plat nomor disamarkan untuk privasi (`E **** **`) dan pembaruan berkala 15 detik.

### 2. Sopir (Pengemudi Armada Lapangan) — Mobile Priority
- **Dashboard Tugas (Layar 07)**: Memilih unit armada yang berstatus `garasi` (armada `perawatan` otomatis disembunyikan).
- **Perjalanan Aktif (Layar 08)**: Memulai perjalanan via RPC database atomik, pengiriman koordinat GPS otomatis tiap 30 detik, durasi perjalanan dinamis, dan Screen Wake Lock API agar layar tidak mati saat bertugas.
- **Unggah Bukti Lapangan (Layar 09/09b)**: Mengambil foto hasil pengangkutan langsung dari kamera/galeri, kompresi browser otomatis, dan penyimpanan aman ke bucket privat Supabase Storage.
- **Akhiri Perjalanan (Layar 10)**: Validasi ketat wajib memiliki minimal 1 foto bukti penanganan sebelum perjalanan dapat diakhiri dan status armada kembali ke `garasi`.

### 3. Kepala Bidang (Kabid Pengelolaan Sampah)
- **Pemantauan Operasional (Layar 11)**: Kartu statistik ringkasan (unit beroperasi, garasi, perawatan, ritasi hari ini, aduan baru), daftar perjalanan aktif, dan peta armada Realtime via Supabase Realtime channel.
- **Galeri Bukti Pengangkutan (Layar 12)**: Grid dokumentasi visual dengan signed URL berumur pendek (≤ 5 menit), filter tanggal, armada, dan sopir, serta modal Lightbox layar penuh dengan gestur sentuh (swipe) & keyboard.
- **Daftar & Detail Aduan (Layar 13/14)**: Manajemen aduan masuk, filter status dan tanggal, tampilan kartu di HP & tabel di desktop, serta form respon yang otomatis memperbarui status aduan via trigger database.
- **Fitur "Kabari WA" 1-Klik**: Tombol langsung di setiap baris antrean aduan, detail aduan, dan notifikasi pasca-respon untuk mengabari pelapor via WhatsApp Web/App dengan pesan otomatis resmi yang rapi memuat salam resmi DLH Kuningan, kode tiket, status tindak lanjut, catatan petugas, serta tautan pelacakan status warga.
- **Laporan & Ekspor Excel (Layar 15/15b)**: Ekspor rekapitulasi data 2 sheet (*Aduan* dan *Perjalanan & Bukti*) ke format `.xlsx` (ExcelJS), pembatasan 10.000 baris, dan penanganan status error Layar 15b.

### 4. Administrator (DLH Kuningan)
- **Kelola Armada (Layar 16–19)**: CRUD armada kendaraan sampah (Dump Truck, Armroll, Compactor, Pickup, dll.). Plat nomor otomatis kapital dan unik. Penghapusan armada yang memiliki riwayat operasional menerapkan **Soft Delete** (`is_active = false`) agar integritas riwayat tetap utuh.
- **Kelola Pengguna (Layar 20–23)**: CRUD akun petugas lapangan dan pimpinan via Supabase Auth Admin API. Proteksi sistem: Administrator tidak dapat menghapus atau menonaktifkan akun miliknya sendiri.
- **Retensi Data Identitas Warga (UU No. 27/2022 PDP)**: Kebijakan perlindungan privasi otomatis dan manual. Aduan masyarakat yang telah selesai lebih dari 2 tahun secara otomatis (via background cron harian) maupun manual dianonimkan (nama diubah menjadi *Masyarakat (Anonim UU PDP)*, nomor telepon menjadi *080000000000*, dan IP hash dikosongkan) guna memenuhi ketentuan UU Pelindungan Data Pribadi.
- **Audit Logging**: Setiap tindakan administratif (buat/ubah/hapus armada dan akun, serta eksekusi retensi data) dicatat permanen ke tabel `audit_log`.

---

## 🛠 Tumpukan Teknologi

| Lapisan | Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js 16.4 (App Router & Turbopack) | Server Components, Server Actions, Route Handlers |
| **Bahasa** | TypeScript 5.9 | Tipe skema database terintegrasi otomatis |
| **Styling** | Tailwind CSS v4 & Lucide Icons | Token warna resmi DLH, mobile-first, fluid layout |
| **Database & Auth** | Supabase (PostgreSQL 17) | RLS, Triggers, Stored Procedures, Realtime Pub/Sub |
| **Peta Digital** | Leaflet & OpenStreetMap | Dynamic import SSR:false, touch gestures, custom marker |
| **Ekspor Berkas** | ExcelJS | Multi-sheet spreadsheet generator dengan limit 10k baris |
| **Validasi & Proteksi** | Zod v4, Cloudflare Turnstile, Sharp/Magic Bytes | Validasi MIME type, anti-bot, IP rate limit |

---

## 📂 Struktur Proyek

```text
SILAPOR-SAMPAH/
├── 0001_init_schema.sql       # Skema awal database PostgreSQL (Prosedur, RLS, Storage)
├── 0002_advisors_fixes.sql     # Index foreign keys & pengerasan search_path
├── 0003_grant_authenticated.sql# Izin eksekusi RPC helper authenticated
├── PRD.md                      # Dokumen Kebutuhan Produk (23 Layar + States)
├── BUILD_GUIDE.md              # Panduan Arsitektur, Endpoint, & UAT
├── RESPONSIVE_SPEC.md          # Spesifikasi Responsif 320–1920 px & DoD
├── MASTER_PROMPT.md            # Workflow Fase 0–8 pengembangan sistem
├── README.md                   # Dokumentasi teknis dan operasional sistem
└── frontend/                   # Aplikasi Next.js App Router
    ├── scripts/                # Skrip pengujian otomatis UAT Fase 1–8
    │   ├── seed-and-test-auth.mjs
    │   ├── test-rls.mjs
    │   ├── test-uat-fase3.mjs
    │   ├── test-uat-fase4.mjs
    │   ├── test-fase5-peta.mjs
    │   ├── test-uat-fase6.mjs
    │   ├── test-uat-fase7.mjs
    │   └── test-responsive-audit.mjs
    └── src/
        ├── app/
        │   ├── (public)        # Beranda (/), Buat Aduan (/aduan/baru), Cek Status, Peta
        │   ├── sopir/          # Portal Sopir (/sopir, /sopir/perjalanan, bukti, akhiri)
        │   ├── kabid/          # Modul Kabid (pemantauan, galeri, aduan, laporan)
        │   ├── admin/          # Modul Admin (kelola armada, kelola pengguna)
        │   ├── login/          # Autentikasi staf & pesan kesalahan generik
        │   └── api/            # Route Handlers (/api/aduan, cek-status, laporan, dll.)
        ├── components/
        │   ├── layout/         # HeaderDLH, Navbar, SopirNav, KabidNav, AdminNav
        │   ├── map/            # Leaflet client wrappers & Realtime tracking
        │   └── ui/             # Button, Input, Select, Textarea, Card, Badge, Dialog, TableCard
        ├── lib/
        │   ├── auth/           # Guard peran (requireRole), email mapping staf
        │   ├── format/         # Helper zona waktu WIB (Asia/Jakarta)
        │   ├── supabase/       # Klien browser, server (cookies), & admin (service role)
        │   └── validation/     # Skema validasi Zod & magic bytes gambar
        └── proxy.ts            # Next.js 16 Edge Proxy untuk route protection & role redirection
```

---

## ⚙️ Prasyarat & Instalasi

### 1. Prasyarat
- Node.js versi 20.x atau 22.x+
- NPM atau PNPM
- Proyek Supabase aktif (PostgreSQL 17)

### 2. Langkah Pemasangan
```bash
# Clone repositori
git clone https://github.com/<organisasi>/SILAPOR-SAMPAH.git
cd SILAPOR-SAMPAH/frontend

# Pasang dependensi
npm install

# Buat file konfigurasi lingkungan lokal
cp .env.local.example .env.local
```

### 3. Opsi Supabase Lokal (tanpa cloud, butuh Docker Desktop)
```bash
# Dari root repo
npm run supabase:start      # terapkan migrasi + seed
npm run supabase:status     # salin anon key & service_role key ke frontend/.env.local
node frontend/scripts/seed-and-test-auth.mjs   # buat akun admin/kabid/sopir1
npm run dev                 # http://localhost:3002
```

`frontend/.env.local` untuk lokal memakai `NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"`.

---

## 🔑 Environment Variables

Pastikan file `frontend/.env.local` telah terisi:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<supabase-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<supabase-service-role-key>" # HANYA DI SERVER, JANGAN DIBOCORKAN!

# Cloudflare Turnstile (Anti-Bot)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA" # Kunci testing dummy lokal
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"

# Hash Salt untuk Anonimisasi IP Pelapor
IP_HASH_SALT="kuningan-silapor-secret-salt-2026"
```

---

## 💻 Daftar Perintah

Jalankan perintah dari folder `frontend`:

```bash
# Menjalankan server development (port 3002)
npm run dev

# Pemeriksaan linter ESLint (wajib 0 error sebelum commit)
npm run lint

# Kompilasi build produksi Next.js
npm run build

# Menjalankan server produksi
npm run start
```

### Eksekusi Pengujian Skenario UAT Otomatis

```bash
# UAT Autentikasi & RLS Database (UAT 5, 6, 16)
node scripts/seed-and-test-auth.mjs
node scripts/test-rls.mjs

# UAT Halaman Publik & Validasi Aduan (UAT 1–4)
node scripts/test-uat-fase3.mjs

# UAT Modul Sopir & Storage Bukti Foto (UAT 7–10)
node scripts/test-uat-fase4.mjs

# UAT Peta Armada & Realtime (Fase 5)
node scripts/test-fase5-peta.mjs

# UAT Modul Kabid, Respon Aduan & Ekspor Excel (UAT 11–12)
node scripts/test-uat-fase6.mjs

# UAT Modul Admin, Soft Delete & Proteksi Diri (UAT 13–15)
node scripts/test-uat-fase7.mjs

# UAT Retensi Data Identitas Warga (Kepatuhan UU No. 27/2022 PDP)
node scripts/test-uupdp-retensi.mjs

# UAT Fitur "Kabari WA" 1-Klik Modul Kabid
node scripts/test-kabari-wa.mjs

# Audit Responsif Matriks 10 Resolusi (320–1920 px Tanpa Overflow)
node scripts/test-responsive-audit.mjs
```

---

## 👥 Panduan Singkat per Peran

### 🔑 Akun & Kredensial Pengujian (Default Seed)

Untuk menguji aplikasi melalui halaman login (`/login`):

| Peran (Aktor) | Username | Kata Sandi (Password) | Email Internal Supabase | Hak Akses Rute |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `PasswordKuningan2026!` | `admin@silapor.local` | `/admin/*` (Armada, Pengguna, Retensi UU PDP) & `/kabid` |
| **Kepala Bidang (Kabid)** | `kabid` | `PasswordKuningan2026!` | `kabid@silapor.local` | `/kabid/*` (Pemantauan Realtime, Galeri, Respon Aduan, Laporan) |
| **Sopir Armada 1** | `sopir1` | `PasswordKuningan2026!` | `sopir1@silapor.local` | `/sopir/*` (Tugas Armada, Pelacakan GPS, Unggah Bukti) |
| **Sopir Armada 2** | `sopir2` | `PasswordKuningan2026!` | `sopir2@silapor.local` | `/sopir/*` (Tugas Armada, Pelacakan GPS, Unggah Bukti) |

> [!NOTE]
> Pada form login (`/login`), cukup masukkan **Username** (bukan email) dan **Kata Sandi**.

### 1. Warga / Pelapor (Publik)
1. Buka halaman utama atau klik menu **Buat Aduan**.
2. Unggah foto tumpukan sampah, ketik lokasi patokan yang jelas, isi nama dan nomor telepon Anda.
3. Centang verifikasi Turnstile, lalu klik **Kirim Laporan Aduan**.
4. Simpan **Kode Tiket** yang tampil di layar (misal: `SLP-2611-XXXXXXXX`).
5. Pantau tindak lanjut petugas di menu **Cek Status**.

### 2. Sopir Armada
1. Buka `/login`, masukkan username (misal: `sopir1`) dan password.
2. Di halaman **Dashboard**, pilih unit armada yang berstatus *Di Garasi*, lalu klik **Mulai Perjalanan**.
3. Pastikan izin lokasi GPS diaktifkan dan biarkan browser tetap terbuka selama bertugas.
4. Saat sampah diangkut, ambil foto pembersihan sampah melalui tombol **Unggah Foto Bukti**.
5. Setelah rute pengangkutan selesai, klik **Akhiri Perjalanan** (wajib minimal ada 1 foto bukti). Unit armada akan otomatis kembali berstatus *Di Garasi*.

### 3. Kepala Bidang (Kabid)
1. Buka `/login`, masukkan akun Kabid (`kabid`).
2. Di menu **Pemantauan**, pantau posisi armada yang sedang bergerak di peta realtime dan cek ritasi perjalanan harian.
3. Di menu **Galeri Bukti**, periksa foto-foto hasil kerja lapangan yang dikirim sopir.
4. Di menu **Daftar Aduan**, pilih aduan warga yang masuk untuk melihat titik lokasi dan memberikan **Respon Petugas** (ubah status menjadi *Diproses*, *Selesai*, atau *Ditolak*).
5. Di menu **Laporan Excel**, unduh rekapitulasi data periodik untuk evaluasi dinas.

### 4. Administrator
1. Buka `/login`, masuk dengan akun `admin`.
2. Di menu **Kelola Armada**, daftarkan unit truk baru, ubah status perawatan bengkel, atau arsipkan armada lama.
3. Di menu **Kelola Pengguna**, buatkan akun untuk pengemudi baru atau kepala bidang baru.
4. Semua aktivitas pembuatan dan modifikasi data terekam pada audit log sistem.

---

## 🛡 Checklist Keamanan

Aplikasi memenuhi seluruh poin standar keamanan **BUILD_GUIDE §8**:

- [x] **Sign-up publik dimatikan**: Pengguna internal hanya dapat didaftarkan oleh Administrator.
- [x] **Row Level Security (RLS)**: Aktif di 100% tabel database. Pengguna anonim ditolak dari query langsung ke REST API.
- [x] **Zero Service Role Leak**: Secret key `SUPABASE_SERVICE_ROLE_KEY` hanya dieksekusi di server; bundle klien bersih (`grep -rn` terverifikasi 0 bocoran).
- [x] **Keamanan HTTP Headers**:
  - `Content-Security-Policy`: Terkonfigurasi untuk Supabase, Cloudflare Turnstile, dan tile OpenStreetMap.
  - `X-Frame-Options: DENY` & `X-Content-Type-Options: nosniff`.
  - `Strict-Transport-Security` (HSTS preload aktif).
- [x] **Validasi File Unggahan**: Pengecekan MIME type dan *magic bytes* biner (`JPEG: FF D8 FF`, `PNG: 89 50 4E 47`, `WebP: RIFF...WEBP`) untuk menangkal file berbahaya yang disamarkan.
- [x] **Signed URL Storage**: Bucket privat; foto hanya dapat diakses dengan token kedaluwarsa singkat (≤ 5 menit).
- [x] **Privasi Data Warga**: Nama dan nomor telepon pelapor dilindungi RLS dan tidak pernah dikirim ke endpoint publik.
- [x] **Audit Responsif Penuh**: Lulus verifikasi Playwright 10 resolusi layar (320–1920 px) tanpa scroll horizontal.

---

## ☁️ Panduan Deployment ke Vercel

1. **Hubungkan Repositori ke Vercel**:
   - Masuk ke dashboard [Vercel](https://vercel.com) dan impor repositori GitHub ini.
   - Atur **Root Directory** ke folder `frontend`.
   - Pilih Framework Preset **Next.js**.
2. **Konfigurasi Environment Variables di Vercel**:
   Tambahkan variabel berikut pada menu *Settings -> Environment Variables*:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Tandai sebagai *Secret / Sensitive*)
   - `TURNSTILE_SECRET_KEY` (Tandai sebagai *Secret / Sensitive*)
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `IP_HASH_SALT`
3. **Konfigurasi Supabase Project**:
   - Di dashboard Supabase: buka *Authentication -> URL Configuration*.
   - Atur **Site URL** ke domain Vercel Anda (misal: `https://silapor-sampah.kuningankab.go.id`).
   - Tambahkan domain redirect di *Redirect URLs*.
4. **Deploy**: Klik tombol **Deploy**. Aplikasi akan otomatis dikompilasi dan siap digunakan.

---

## ❓ Pertanyaan Terbuka untuk DLH Kabupaten Kuningan

Berikut adalah beberapa poin pertimbangan operasional lanjutan yang diserahkan kepada pihak manajemen DLH Kuningan:
1. ~~**Kebijakan Retensi Data Privasi (UU PDP)**~~: **Telah diimplementasikan penuh** dengan skema pembersihan otomatis via Vercel Cron harian (`0 2 * * *` / 09:00 WIB) dan panel eksekusi manual administrator di `/admin/retensi` dengan batas usia 2 tahun.
2. **Koneksi GPS Lapangan**: Sebagian wilayah pedesaan di Kabupaten Kuningan memiliki kendala sinyal seluler (*blank spot*). Aplikasi telah mendukung toleransi offline di mana sopir tetap dapat mengambil foto dan menyelesaikan tugas dengan peringatan GPS. Apakah diperlukan sinkronisasi antrean offline lokal (*background sync*) jika sopir berada di area tanpa sinyal lebih dari 30 menit?
3. **Struktur Pengelola Akun**: Apakah akun admin master dipegang oleh Tim IT Dinas Kominfo Kuningan atau langsung oleh staf bagian kepegawaian DLH?

---

*Dikembangkan dengan standar kualitas, efisiensi minimalis, dan kepatuhan penuh terhadap spesifikasi teknis Pemerintah Kabupaten Kuningan.*
