# SILAPOR SAMPAH (Sistem Informasi Layanan Laporan Sampah)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

Aplikasi sistem informasi berbasis web yang dikembangkan untuk **Dinas Lingkungan Hidup (DLH) Kabupaten Kuningan** guna memudahkan masyarakat melaporkan titik timbulan sampah liar secara cepat dan transparan, serta mengoptimalkan operasional penugasan armada pengangkutan sampah oleh petugas/kru di lapangan.

---

## Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Arsitektur & Tumpukan Teknologi](#-arsitektur--tumpukan-teknologi)
- [Struktur Folder](#-struktur-folder)
- [Prasyarat Sistem](#-prasyarat-sistem)
- [Panduan Instalasi & Penggunaan](#-panduan-instalasi--penggunaan)
- [Environment Variables](#-environment-variables)
- [Daftar Perintah (NPM Scripts)](#-daftar-perintah-npm-scripts)
- [Keamanan & Proteksi Abuse](#-keamanan--proteksi-abuse)
- [Kontribusi & Lisensi](#-lisensi)

---

## Fitur Utama

Berdasarkan analisis kebutuhan sistem (Role-Based Access Control / RBAC):

### 1. Akses Publik (Masyarakat)
- **Pelaporan Sampah Liar**: Formulir pelaporan cepat dengan titik lokasi, deskripsi kondisi, dan unggahan foto bukti.
- **Kompresi Gambar Otomatis**: Foto dikompresi otomatis di sisi browser sebelum diunggah (batas maksimal 5 MB).
- **Anti-Bot & Spam**: Terlindungi dengan verifikasi Cloudflare Turnstile.
- **Pelacakan Status Real-Time**: Warga dapat memantau status aduan (*Menunggu Verifikasi*, *Dijadwalkan*, *Sedang Diangkut*, hingga *Selesai*).

### 2. Administrator (DLH Kabupaten Kuningan)
- **Manajemen Aduan**: Verifikasi validitas laporan masyarakat yang masuk.
- **Penjadwalan Armada & Kru**: Disposisi penugasan pengangkutan ke armada truk dan sopir/kru terkait.
- **Monitoring & Statistik**: Dashboard pemantauan volume laporan dan sebaran wilayah timbulan sampah.
- **Ekspor Rekap Laporan**: Unduh rekapitulasi data laporan penanganan sampah dalam format Microsoft Excel (`.xlsx`).

### 3. Petugas Lapangan (Sopir / Kru Angkut)
- **Daftar Tugas Pengangkutan**: Melihat penugasan rute dan titik penjemputan sampah harian.
- **Unggah Bukti Penanganan**: Mengunggah foto hasil pembersihan sampah di lapangan sebagai bukti penyelesaian tugas ke Cloud Storage.

---

## Arsitektur & Tumpukan Teknologi

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Frontend Framework** | **Next.js 16** (App Router, Turbopack) | Server-Side Rendering (SSR) & React Server Components |
| **Bahasa Pemrograman** | **TypeScript** | *Type safety* penuh dari basis data hingga UI |
| **Styling & Desain** | **Tailwind CSS v4** | Desain responsif (*mobile-friendly*) |
| **Backend & Database** | **Supabase** (PostgreSQL 17) | BaaS: Auth, Database PostgreSQL, Row Level Security (RLS) |
| **Penyimpanan Berkas** | **Supabase Storage** | Bucket `bukti-pengangkutan` khusus gambar (JPEG, PNG, WebP) |
| **Kompresi Gambar** | `browser-image-compression` | Mereduksi ukuran foto tanpa mengurangi kualitas signifikan |
| **Ekspor Data** | `exceljs` | Pembuatan laporan spreadsheet `.xlsx` terstruktur |
| **Rate Limiter & DDoS** | `@upstash/ratelimit` & `@upstash/redis` | Pembatasan frekuensi request per alamat IP |
| **Anti-Bot CAPTCHA** | `@marsidev/react-turnstile` | Proteksi bot tak kasat mata pada formulir publik dan login |

---

## Struktur Folder

```text
SILAPOR-SAMPAH/
├── frontend/                     # Kode sumber aplikasi frontend (Next.js)
│   ├── public/                   # Aset publik statis (logo, favicon)
│   ├── src/
│   │   ├── app/                  # Rute halaman Next.js App Router
│   │   ├── lib/
│   │   │   └── supabase/         # Klien Supabase (client.ts & server.ts)
│   │   ├── types/
│   │   │   └── database.types.ts # Definisi tipe TypeScript skema Supabase
│   │   └── middleware.ts         # Middleware keamanan & rate limiting
│   ├── next.config.ts            # Konfigurasi Turbopack & Security Headers
│   ├── package.json              # Dependensi frontend
│   └── .env.local                # Variabel lingkungan frontend (tidak di-commit)
├── backend/                      # Konfigurasi Supabase & skema database
│   ├── supabase/
│   │   ├── config.toml           # Konfigurasi lokal, captcha, dan rate limit auth
│   │   └── migrations/           # Riwayat migrasi SQL & bucket storage
│   ├── tsconfig.json             # Konfigurasi TypeScript backend
│   └── package.json              # Dependensi Supabase CLI & tools backend
├── .agents/                      # Supabase Agent Skills untuk AI assistant
├── .gitignore                    # Berkas dan folder yang diabaikan Git
├── framework.md                  # Dokumentasi panduan teknis proyek
└── package.json                  # Root monorepo scripts (dev:all, build, dll.)
```

---

## Prasyarat Sistem

Sebelum memulai instalasi, pastikan perangkat Anda telah terpasang:
- **Node.js**: versi LTS (disarankan v20.9.0 atau yang lebih baru). Cek dengan: `node -v`
- **npm**: versi 10+ atau yang sesuai dengan Node.js. Cek dengan: `npm -v`
- **Git**: untuk mengkloning repositori. Cek dengan: `git --version`

---

## Panduan Instalasi & Penggunaan

### 1. Kloning Repositori
Buka terminal dan jalankan perintah:

```bash
git clone https://github.com/MuhammadRizalNurfirdaus/SILAPOR-SAMPAH.git
cd SILAPOR-SAMPAH
```

### 2. Pasang Seluruh Dependensi

Instal dependensi pada root, frontend, dan backend:

```bash
# 1. Instal dependensi root (concurrently, dsb.)
npm install

# 2. Instal dependensi frontend
cd frontend && npm install && cd ..

# 3. Instal dependensi backend
cd backend && npm install && cd ..
```

### 3. Konfigurasi Environment Variables

Salin berkas contoh konfigurasi di folder `frontend/`:

```bash
cp frontend/.env.local.example frontend/.env.local
```

Buka file `frontend/.env.local` dan sesuaikan nilainya dengan kredensial project Supabase dan layanan pendukung Anda:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-dari-dashboard-supabase>

# Rate Limiting (Upstash Redis) - Opsional di lokal
UPSTASH_REDIS_REST_URL=https://<id>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>

# Anti-Bot (Cloudflare Turnstile) - Opsional di lokal
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site-key>
TURNSTILE_SECRET_KEY=<secret-key>
```

> **Catatan:** Middleware telah dirancang secara fleksibel (*graceful fallback*). Jika kredensial Upstash/Turnstile belum diisi saat tahap *development* awal, aplikasi tetap dapat berjalan normal tanpa crash.

### 4. Menjalankan Aplikasi

Jalankan perintah berikut langsung dari direktori root:

```bash
npm run dev:all
# atau
npm run dev
```

Buka browser dan akses aplikasi pada alamat:
👉 **`http://localhost:3002`**

*(Port diset ke `3002` secara default untuk mencegah bentrok dengan aplikasi lain yang menggunakan port `3000`/`3001`).*

---

## Environment Variables

| Variabel | Keterangan | Wajib? |
|---|---|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | URL endpoint API Supabase project | **Ya** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon JWT key Supabase | **Ya** |
| `SUPABASE_SERVICE_ROLE_KEY` | Private Service Role key (hanya untuk server-side/admin) | Opsional |
| `UPSTASH_REDIS_REST_URL` | REST URL Redis Upstash untuk rate limiter | Opsional |
| `UPSTASH_REDIS_REST_TOKEN` | REST Token Redis Upstash | Opsional |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public Site Key Cloudflare Turnstile CAPTCHA | Opsional |
| `TURNSTILE_SECRET_KEY` | Secret Key Cloudflare Turnstile untuk validasi server | Opsional |

---

## Daftar Perintah (NPM Scripts)

Eksekusi perintah-perintah ini dari root folder proyek:

```bash
# Menjalankan server development Next.js di http://localhost:3002
npm run dev:all

# Melakukan kompilasi build produksi frontend
npm run build

# Menjalankan server produksi hasil build
npm run start

# Menjalankan pemeriksaan kode ESLint
npm run lint

# Menghasilkan (generate) tipe TypeScript skema Supabase otomatis
npm run supabase:types

# Melihat status koneksi Supabase
npm run supabase:status
```

---

## Keamanan & Proteksi Abuse

Aplikasi ini mengimplementasikan prinsip *defense-in-depth* untuk menjaga integritas data dan ketersediaan layanan publik:

1. **Security Headers**:
   - `X-Frame-Options: DENY` (mencegah *clickjacking*).
   - `X-Content-Type-Options: nosniff` (mencegah *MIME sniffing*).
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `Strict-Transport-Security` (HSTS).
2. **Server Actions Size Limit**: Dibatasi maksimal 5 MB selaras dengan batasan berkas foto bukti.
3. **Application Rate Limiting**:
   - Pembatasan umum: 60 request/menit per IP.
   - Pembatasan rute autentikasi (`/login`): 5 request/menit per IP untuk menangkal *brute force*.
4. **Row Level Security (RLS)**: Setiap tabel database dilindungi dengan kebijakan akses berbasis peran (Admin, Kru, Publik).
5. **Storage Bucket Constraints**: Bucket `bukti-pengangkutan` hanya mengizinkan MIME type `image/jpeg`, `image/png`, dan `image/webp` dengan batasan 5.242.880 bytes (5 MB).

---

## Lisensi

Proyek ini dikembangkan untuk keperluan akademik Laporan Kerja Praktek Program Studi Teknik Informatika, Fakultas Ilmu Komputer, Universitas Kuningan bekerja sama dengan **Dinas Lingkungan Hidup Kabupaten Kuningan**.


---

## Keamanan & Proteksi Abuse

Aplikasi ini mengimplementasikan prinsip *defense-in-depth* untuk menjaga integritas data dan ketersediaan layanan publik:

1. **Security Headers**:
   - `X-Frame-Options: DENY` (mencegah *clickjacking*).
   - `X-Content-Type-Options: nosniff` (mencegah *MIME sniffing*).
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `Strict-Transport-Security` (HSTS).
2. **Server Actions Size Limit**: Dibatasi maksimal 5 MB selaras dengan batasan berkas foto bukti.
3. **Application Rate Limiting**:
   - Pembatasan umum: 60 request/menit per IP.
   - Pembatasan rute autentikasi (`/login`): 5 request/menit per IP untuk menangkal *brute force*.
4. **Row Level Security (RLS)**: Setiap tabel database dilindungi dengan kebijakan akses berbasis peran (Admin, Kru, Publik).
5. **Storage Bucket Constraints**: Bucket `bukti-pengangkutan` hanya mengizinkan MIME type `image/jpeg`, `image/png`, dan `image/webp` dengan batasan 5.242.880 bytes (5 MB).

---

## Lisensi

Proyek ini dikembangkan untuk keperluan akademik Laporan Kerja Praktek Program Studi Teknik Informatika, Fakultas Ilmu Komputer, Universitas Kuningan bekerja sama dengan **Dinas Lingkungan Hidup Kabupaten Kuningan**.