# Instalasi Framework — SILAPOR SAMPAH

Panduan ini disusun dari Laporan Kerja Praktek **Aplikasi SILAPOR SAMPAH** (Dinas Lingkungan Hidup Kabupaten Kuningan). Berdasarkan Bab 3.7 (Teknologi) dan Tabel 4.4.3 (Spesifikasi Perangkat Lunak), teknologi yang dipakai:

| Kategori | Teknologi | Folder |
|---|---|---|
| Bahasa pemrograman | TypeScript (frontend & backend) | `frontend/`, `backend/` |
| Frontend framework | Next.js (App Router) | `frontend/` |
| CSS framework | Tailwind CSS | `frontend/` |
| Kompresi gambar sisi klien | browser-image-compression | `frontend/` |
| Backend & basis data | Supabase (PostgreSQL, Auth, Storage) | `backend/` |
| Development tools | VS Code, Node.js, Git, GitHub | global |
| Proteksi DDoS & abuse *(tambahan)* | Cloudflare/Vercel Firewall, Upstash Ratelimit, Turnstile | `frontend/`, `backend/` |

## Struktur Folder

```
silapor-sampah/
├── frontend/     # Next.js + TypeScript + Tailwind CSS
└── backend/      # Supabase (PostgreSQL, Auth, Storage, migrasi)
```

---

## 0. Prasyarat (Global)

Sesuai Tabel 4.4.3 (Development Tools): **VS Code, Node.js, Git, GitHub**.

```bash
# Cek versi (Node.js minimal 20.9+ untuk Next.js versi terbaru, disarankan LTS)
node -v
npm -v
git --version
```

Instalasi Node.js (pilih salah satu):

```bash
# Arch Linux
sudo pacman -S nodejs npm git

# Windows 11 (PowerShell, via winget)
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install Microsoft.VisualStudioCode
```

Ekstensi VS Code yang disebut di laporan:

```bash
code --install-extension bradlc.vscode-tailwindcss   # Tailwind CSS IntelliSense
code --install-extension dbaeumer.vscode-eslint      # ESLint
```

Buat folder proyek:

```bash
mkdir silapor-sampah && cd silapor-sampah
git init
mkdir frontend backend
```

---

## 1. Folder `frontend/` — Framework Frontend

Berisi: **Next.js + TypeScript + Tailwind CSS** (+ pustaka pendukung sisi klien).

### 1.1 Next.js + TypeScript + Tailwind CSS

Satu perintah ini memasang ketiganya sekaligus (TypeScript, Tailwind CSS, ESLint, dan App Router sesuai laporan):

```bash
# dari root proyek (silapor-sampah/)
rmdir frontend
npx create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Jika ditanya prompt interaktif, pilih:

| Pertanyaan | Jawaban |
|---|---|
| TypeScript | Yes |
| ESLint | Yes |
| Tailwind CSS | Yes |
| `src/` directory | Yes |
| App Router | Yes |
| Import alias `@/*` | Yes |

### 1.2 Pustaka Pendukung Frontend

```bash
cd frontend

# Kompresi gambar di sisi klien (Bab 4.3.2a, batas unggahan 5 MB)
npm install browser-image-compression

# Klien Supabase untuk menghubungkan frontend ke backend (Auth, Database, Storage)
npm install @supabase/supabase-js @supabase/ssr
```

### 1.3 Ekspor Laporan Excel (.xlsx) — *opsional / saran*

Laporan mewajibkan fitur ekspor `.xlsx` (UC-11), tetapi tidak menyebut nama pustakanya. Pilih salah satu:

```bash
npm install exceljs
# atau
npm install xlsx
```

### 1.4 Environment Variable

Buat file `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-dari-dashboard-supabase>
```

> Jangan commit `.env.local` ke GitHub. Pastikan sudah ada di `.gitignore`.

### 1.5 Menjalankan Frontend

```bash
cd frontend
npm run dev      # http://localhost:3000
npm run build    # build produksi
npm run lint     # cek ESLint
```

### 1.6 Verifikasi Instalasi Frontend

```bash
cd frontend
npx next --version
npx tsc --version
npm ls tailwindcss browser-image-compression @supabase/supabase-js
```

---

## 2. Folder `backend/` — Framework Backend

Berisi: **Supabase** sebagai Backend-as-a-Service (PostgreSQL, Authentication, Cloud Storage), dengan TypeScript. Sesuai laporan, tidak ada server backend terpisah (Express, Laravel, dsb.); logika backend memakai layanan Supabase.

### 2.1 Inisialisasi Proyek Backend

```bash
cd backend
npm init -y
npm install typescript --save-dev
npx tsc --init
```

### 2.2 Supabase CLI

```bash
cd backend
npm install supabase --save-dev
npx supabase init
```

Perintah di atas membuat folder `backend/supabase/` (konfigurasi, migrasi, dan seed).

### 2.3 Menjalankan Supabase Secara Lokal *(opsional, butuh Docker)*

```bash
# Arch Linux
sudo pacman -S docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER      # lalu logout/login ulang

# Windows 11: pasang Docker Desktop
winget install Docker.DockerDesktop
```

```bash
cd backend
npx supabase start     # menjalankan PostgreSQL, Auth, Storage, Studio lokal
npx supabase status    # melihat URL & key lokal
npx supabase stop
```

### 2.4 Menggunakan Supabase Cloud (sesuai laporan)

Laporan memakai Supabase sebagai layanan cloud (PostgreSQL & Storage).

1. Daftar/login di <https://supabase.com> dan buat project baru.
2. Salin **Project URL** dan **anon key** dari *Project Settings → API* ke `frontend/.env.local`.
3. Hubungkan CLI ke project:

```bash
cd backend
npx supabase login
npx supabase link --project-ref <project-ref>
```

### 2.5 Pustaka Backend Pendukung

```bash
cd backend

# Pembuatan tipe TypeScript dari skema database (type safety, sesuai Bab 3.7)
# (tidak perlu paket tambahan, memakai Supabase CLI)
npx supabase gen types typescript --linked > ../frontend/src/types/database.types.ts

# Enkripsi password (password_hash) — opsional/saran, jika hashing ditangani manual
npm install bcryptjs
npm install @types/bcryptjs --save-dev
```

> Catatan: jika memakai **Supabase Auth**, hashing password sudah ditangani otomatis oleh Supabase. `bcryptjs` hanya perlu bila tabel `pengguna` dengan kolom `password_hash` dikelola sendiri.

### 2.6 Migrasi Database & Storage

```bash
cd backend
npx supabase migration new init_schema   # buat file migrasi baru
npx supabase db push                     # terapkan migrasi ke Supabase cloud
```

Buat bucket penyimpanan foto bukti pengangkutan (jalankan di SQL Editor atau migrasi):

```sql
insert into storage.buckets (id, name, public, file_size_limit)
values ('bukti-pengangkutan', 'bukti-pengangkutan', false, 5242880); -- 5 MB
```

Atur peran (RBAC) sesuai laporan: **Admin DLH**, **Sopir/Kru**, dan **Akses Publik Masyarakat**, memakai Row Level Security (RLS) pada tiap tabel.

### 2.7 Verifikasi Instalasi Backend

```bash
cd backend
npx supabase --version
npx tsc --version
```

---

## 3. Perlindungan DDoS & Abuse

> Bagian ini **tambahan** dan tidak disebut di laporan. Tujuannya membuat SILAPOR SAMPAH tetap bertahan saat ada lonjakan trafik berbahaya, terutama pada halaman publik (form aduan masyarakat) dan halaman login.

**Penting:** serangan DDoS volumetrik berskala besar **tidak bisa dihentikan oleh kode aplikasi**. Pertahanan utama harus berada di lapisan *edge* (CDN/WAF). Kode di bawah hanya menjadi lapisan tambahan terhadap *abuse* tingkat aplikasi (brute force login, spam aduan, flood API).

### 3.1 Strategi Pertahanan Berlapis

| Lapisan | Alat | Melindungi dari | Folder |
|---|---|---|---|
| 1. Edge / jaringan | Cloudflare (proxy + WAF) **atau** Vercel Firewall | Serangan volumetrik, bot, trafik anomali | DNS / hosting |
| 2. Aplikasi | Rate limiting di Next.js middleware (Upstash) | Flood request, brute force login | `frontend/` |
| 3. Anti-bot | Cloudflare Turnstile (CAPTCHA) | Spam form aduan, bot login | `frontend/` + `backend/` |
| 4. Data | Supabase Auth rate limit, RLS, batas Storage | Penyalahgunaan Auth, upload berlebihan | `backend/` |

### 3.2 Lapisan Edge: Cloudflare atau Vercel Firewall

Pilih **salah satu** sesuai tempat deploy:

**Opsi A, deploy di Vercel:**

1. Buka *Project → Firewall* di dashboard Vercel.
2. Aktifkan **Attack Challenge Mode** saat sedang diserang.
3. Tambahkan aturan *rate limit* untuk path `/api/*` dan `/login`.

**Opsi B, domain lewat Cloudflare:**

1. Pindahkan nameserver domain ke Cloudflare dan aktifkan **Proxy** (ikon awan oranye) pada record DNS.
2. *Security → Settings*: aktifkan **Bot Fight Mode**.
3. *Security → WAF → Rate limiting rules*: batasi `/login` dan `/api/*` (misal 20 request/menit per IP).
4. Saat diserang: *Security → Settings → Security Level → I'm Under Attack*.
5. Jangan ekspos IP asli server, dan batasi origin agar hanya menerima trafik dari Cloudflare.

### 3.3 Rate Limiting di Next.js (Upstash Redis)

```bash
cd frontend
npm install @upstash/ratelimit @upstash/redis
```

Buat database Redis gratis di <https://upstash.com>, lalu tambahkan ke `frontend/.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://<id>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>
```

Buat `frontend/src/middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Batas umum: 60 request / menit / IP
const generalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "rl:general",
});

// Batas ketat untuk login: 5 percobaan / menit / IP
const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "rl:login",
});

export async function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";

  const isLogin = req.nextUrl.pathname.startsWith("/login");
  const limiter = isLogin ? loginLimiter : generalLimiter;

  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return new NextResponse("Terlalu banyak permintaan. Coba lagi nanti.", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/login", "/aduan/:path*"],
};
```

> Catatan: pada Next.js versi terbaru, nama file/konvensi middleware dapat berubah (misalnya `proxy.ts`). Cek dokumentasi versi yang terpasang. Sesuaikan juga `matcher` dengan rute aplikasi Anda. Middleware ini bisa digabung dengan proteksi middleware RBAC yang sudah disebut di laporan (Bab 4.3.2b).

### 3.4 Security Headers & Batas Ukuran Request

Edit `frontend/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "5mb" }, // selaras batas unggah foto 5 MB
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 3.5 Anti-Bot: Cloudflare Turnstile

Pasang di form login dan form aduan publik agar bot tidak bisa membanjiri sistem.

```bash
cd frontend
npm install @marsidev/react-turnstile
```

Tambahkan ke `frontend/.env.local`:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site-key>
TURNSTILE_SECRET_KEY=<secret-key>
```

Contoh pemakaian di komponen form:

```tsx
"use client";
import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";

export default function FormAduan() {
  const [token, setToken] = useState("");
  return (
    <form>
      {/* ...field form... */}
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setToken}
      />
      <button type="submit" disabled={!token}>Kirim</button>
    </form>
  );
}
```

Token **wajib diverifikasi di sisi server** (API route / server action) ke `https://challenges.cloudflare.com/turnstile/v0/siteverify` memakai `TURNSTILE_SECRET_KEY`. Verifikasi hanya di klien tidak cukup.

### 3.6 Proteksi di Backend (Supabase)

Edit `backend/supabase/config.toml` (untuk lingkungan lokal; di Supabase Cloud atur lewat *Dashboard → Authentication → Rate Limits* dan *Attack Protection*):

```toml
[auth.rate_limit]
email_sent = 2
sign_in_sign_ups = 30
token_refresh = 150

[auth.captcha]
enabled = true
provider = "turnstile"
secret = "env(TURNSTILE_SECRET_KEY)"
```

Perketat bucket foto di migrasi (batas ukuran dan tipe file), menggantikan perintah di bagian 2.6:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bukti-pengangkutan', 'bukti-pengangkutan', false,
  5242880,                                   -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
);
```

Checklist tambahan di Supabase:

- Aktifkan **Row Level Security (RLS)** di semua tabel, jangan ada tabel tanpa policy.
- Aktifkan **Captcha protection** di *Authentication → Attack Protection*.
- Gunakan **connection pooler** (Supavisor) agar koneksi database tidak habis saat trafik melonjak.
- Aktifkan **Network Restrictions** jika akses database langsung hanya dari IP tertentu.
- Atur **Spend Cap / pantau usage** agar lonjakan trafik tidak menyebabkan tagihan membengkak.
- Jangan pernah memakai `service_role` key di frontend atau mengekspos di `NEXT_PUBLIC_*`.

### 3.7 Pemantauan & Respons Insiden

- Pantau *Analytics* di Cloudflare/Vercel dan *Logs → API/Auth* di Supabase.
- Siapkan prosedur darurat: aktifkan *Under Attack / Attack Challenge Mode*, turunkan batas rate limit, blokir IP/ASN/negara yang mencurigakan.
- Cadangkan database secara berkala (*Database → Backups*).

---

## 4. Ringkasan Cepat (Copy-Paste)

```bash
# Setup awal
mkdir silapor-sampah && cd silapor-sampah
git init

# FRONTEND
npx create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend
npm install browser-image-compression @supabase/supabase-js @supabase/ssr
npm install @upstash/ratelimit @upstash/redis @marsidev/react-turnstile   # proteksi DDoS/abuse
cd ..

# BACKEND
mkdir backend && cd backend
npm init -y
npm install typescript supabase --save-dev
npx tsc --init
npx supabase init
cd ..
```

---

## 5. Daftar Paket Akhir

| Folder | Paket | Sumber di Laporan |
|---|---|---|
| `frontend/` | `next`, `react`, `react-dom` | Bab 3.7 (Next.js) |
| `frontend/` | `typescript`, `@types/*` | Bab 3.7 (TypeScript) |
| `frontend/` | `tailwindcss` | Bab 3.7 (Tailwind CSS) |
| `frontend/` | `eslint`, `eslint-config-next` | Bab 3.7 (VS Code, ESLint) |
| `frontend/` | `browser-image-compression` | Bab 4.3.2a |
| `frontend/` | `@supabase/supabase-js`, `@supabase/ssr` | Bab 3.7 (integrasi API Supabase) |
| `frontend/` | `exceljs` / `xlsx` *(saran)* | UC-11 (ekspor .xlsx) |
| `frontend/` | `@upstash/ratelimit`, `@upstash/redis` *(tambahan)* | Proteksi DDoS / rate limiting |
| `frontend/` | `@marsidev/react-turnstile` *(tambahan)* | Anti-bot (CAPTCHA) |
| `backend/` | `supabase` (CLI) | Bab 3.7 (Supabase) |
| `backend/` | `typescript` | Bab 3.7 (TypeScript backend) |
| `backend/` | `bcryptjs` *(saran)* | Bab 4.3.2b (password_hash) |
