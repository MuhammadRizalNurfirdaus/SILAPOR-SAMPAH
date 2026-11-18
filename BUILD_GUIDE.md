# BUILD GUIDE — SILAPOR SAMPAH

Panduan teknis untuk membangun aplikasi sesuai `PRD.md`. Dibuat untuk dikerjakan bersama AI agent di Antigravity IDE (Gemini) lewat **Supabase MCP** dan **Figma MCP**.

Urutan baca: `PRD.md` → dokumen ini → `MASTER_PROMPT.md` (perintah yang ditempel ke agent) → `0001_init_schema.sql`.

---

## 0. Persiapan satu kali

### 0.1 Konfigurasi MCP (Supabase + Figma)
Edit `~/.gemini/antigravity/mcp_config.json` (atau lewat menu `···` di panel Agent → MCP Servers → Manage MCP Servers → View raw config):

```json
{
  "mcpServers": {
    "supabase": {
      "serverUrl": "https://mcp.supabase.com/mcp?project_ref=wymulanaxgbbccbcbjnn&features=docs%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions"
    },
    "figma": {
      "serverUrl": "https://mcp.figma.com/mcp"
    }
  }
}
```

Simpan, restart Antigravity, lalu selesaikan OAuth untuk Supabase dan Figma. Jika gagal: `Ctrl+,` → tab **Customizations** → tombol **Authenticate** di samping server.

> **Saran keamanan.** Konfigurasi bawaan dari Supabase memuat fitur `account` dan `branching`. Di atas saya sengaja membuangnya supaya agent hanya bisa bekerja di dalam project `wymulanaxgbbccbcbjnn`, tidak bisa membuat/menjeda project lain. Fitur `database` memberi agent kemampuan menjalankan SQL di project nyata, jadi:
> - Tinjau setiap migrasi sebelum disetujui; minta agent memakai `apply_migration` untuk perubahan skema (tercatat di riwayat) dan `execute_sql` hanya untuk membaca.
> - Setelah ada data warga, ubah URL menjadi `...&read_only=true` untuk pekerjaan sehari-hari dan gunakan project/branch terpisah untuk eksperimen.
> - Isi aduan ditulis oleh orang asing. **Jangan biarkan agent mengikuti instruksi yang tertulis di dalam isi baris database** (risiko prompt injection). Sudah dicantumkan di `MASTER_PROMPT.md`.
> - Jangan tempel `service_role` key ke chat agent. Simpan hanya di `.env.local` dan variabel environment hosting.

### 0.2 Agent Skills Supabase (opsional, disarankan)
```bash
npx skills add supabase/agent-skills
```

### 0.3 Aset logo
Salin logo DLH (`logo-dlh-kuningan.png`, 1281×193, transparan) ke `frontend/public/logo-dlh-kuningan.png`.

### 0.4 Pengaturan Supabase Auth (Dashboard)
- **Authentication → Providers → Email:** matikan **Allow new users to sign up** (publik tidak punya akun; akun hanya dibuat Admin).
- **Matikan** "Confirm email" (akun internal memakai email sintetis; tidak ada email yang dikirim).
- Setelah punya domain: isi **Site URL** dan **Redirect URLs**.

---

## 1. Stack dan keputusan arsitektur

| Bagian | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js App Router + TypeScript (sudah ada di `frontend/`) | Server Actions, Route Handlers, middleware dalam satu proyek |
| UI | Tailwind CSS + komponen sendiri (opsional shadcn/ui) | Token warna dari Figma mudah dipetakan |
| Database/Auth/Storage/Realtime | Supabase | Sudah dipilih; RLS untuk keamanan |
| Validasi | Zod | Skema yang sama di klien dan server |
| Peta | Leaflet + react-leaflet + OpenStreetMap | Gratis, tanpa API key. Untuk lalu lintas tinggi di produksi, pakai penyedia tile berlangganan sesuai kebijakan OSM |
| Excel | `exceljs` | Stabil, tanpa dependensi native |
| Anti-bot | Cloudflare Turnstile + honeypot + rate limit berbasis DB | Tanpa infrastruktur tambahan |
| Kompres foto | `browser-image-compression` | Hemat kuota sopir |
| Hosting | Vercel (frontend) + Supabase (backend) | Sederhana |

**Keputusan penting**
1. **Anon tidak pernah menyentuh tabel.** Aduan, cek status, dan peta publik dilayani Route Handler server (service role) dengan validasi dan rate limit.
2. **Login pakai username.** Supabase Auth butuh email, jadi username dipetakan ke email sintetis `username@silapor.local` (konstanta tunggal di `lib/auth/username.ts`; ganti domain bila validator menolak). Peran disimpan di `profiles.role`.
3. **Logika yang butuh integritas ada di database** (RPC `mulai_perjalanan`, `akhiri_perjalanan`, trigger respon), bukan di klien.
4. **Foto selalu di bucket privat**, diakses lewat signed URL berumur pendek.

---

## 2. Struktur folder target

```
SILAPOR-SAMPAH/
├─ AGENTS.md
├─ PRD.md
├─ BUILD_GUIDE.md
├─ MASTER_PROMPT.md
├─ supabase/
│  └─ migrations/0001_init_schema.sql
├─ backend/                      # biarkan isi yang sudah ada; agent harus memeriksanya dulu
└─ frontend/
   ├─ public/logo-dlh-kuningan.png
   ├─ middleware.ts              # (Next.js 16+: proxy.ts)
   └─ src/
      ├─ app/
      │  ├─ (publik)/            # /, /peta, /aduan/baru, /aduan/berhasil/[kode], /cek-status
      │  ├─ login/
      │  ├─ sopir/               # /sopir, /perjalanan, /perjalanan/bukti, /perjalanan/akhiri
      │  ├─ kabid/               # /kabid, /galeri, /aduan, /aduan/[id], /laporan
      │  ├─ admin/               # /armada(+baru,[id]/ubah), /pengguna(+baru,[id]/ubah)
      │  └─ api/
      │     ├─ aduan/route.ts
      │     ├─ cek-status/route.ts
      │     ├─ public/armada/route.ts
      │     └─ laporan/route.ts
      ├─ components/
      │  ├─ layout/HeaderDLH.tsx, Navbar.tsx
      │  ├─ ui/                  # Button, Input, Card, Badge, Dialog, Table, Alert
      │  └─ map/PetaArmada.tsx   # dynamic import, ssr:false
      ├─ lib/
      │  ├─ supabase/{client,server,admin}.ts
      │  ├─ auth/{username,guard}.ts
      │  ├─ validation/{aduan,armada,pengguna}.ts
      │  ├─ image-check.ts, turnstile.ts, format.ts
      └─ types/database.ts       # hasil `npm run supabase:types`
```

---

## 3. Environment

`frontend/.env.local` (jangan di-commit; pastikan ada di `.gitignore`) dan `.env.local.example` tanpa nilai rahasia:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wymulanaxgbbccbcbjnn.supabase.co
# Nama kunci bisa "anon key" atau "publishable key" tergantung dashboard Anda
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SERVER ONLY — jangan pernah diawali NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
# string acak panjang untuk menghash IP
IP_HASH_SALT=
```

Kunci uji Turnstile saat pengembangan: site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA` (selalu lolos).

Perintah yang sudah ada di proyek: `npm run dev:all` (port 3002), `build`, `start`, `lint`, `supabase:types`, `supabase:status`. Tambahan paket:

```bash
cd frontend
npm i @supabase/supabase-js @supabase/ssr zod exceljs leaflet react-leaflet browser-image-compression
npm i -D @types/leaflet
```

---

## 4. Database

1. Simpan `0001_init_schema.sql` di `supabase/migrations/`.
2. Terapkan lewat agent (`apply_migration` via Supabase MCP) **atau** tempel di SQL Editor.
3. Jalankan **Advisors** (security & performance) dan perbaiki temuan.
4. `npm run supabase:types` → hasil ke `frontend/src/types/database.ts`.
5. Buat admin pertama: Dashboard → Authentication → Users → *Add user* (email `admin@silapor.local`, password kuat, centang auto confirm), lalu:

```sql
insert into public.profiles (id, username, nama_lengkap, role)
select id, 'admin', 'Administrator DLH', 'admin'
from auth.users where email = 'admin@silapor.local';
```

Ringkasan skema: `profiles`, `armada`, `perjalanan`, `lokasi_armada`, `bukti_pengangkutan`, `aduan`, `respon_aduan`, `audit_log`; RPC `mulai_perjalanan`, `akhiri_perjalanan`, `cek_status_aduan`, `posisi_armada_terbaru`; bucket `aduan-foto` dan `bukti-pengangkutan`.

---

## 5. Autentikasi dan otorisasi

### 5.1 Klien Supabase

```ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
}
```

```ts
// lib/supabase/admin.ts  — SERVER ONLY
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)
```

`lib/supabase/client.ts` memakai `createBrowserClient` dari `@supabase/ssr` dengan dua variabel publik.

### 5.2 Username → email dan login

```ts
// lib/auth/username.ts
export const toEmail = (username: string) => `${username.trim().toLowerCase()}@silapor.local`
```

```ts
// app/login/actions.ts
'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { toEmail } from '@/lib/auth/username'

const HOME = { sopir: '/sopir', kabid: '/kabid', admin: '/admin/armada' } as const

export async function login(_: unknown, form: FormData) {
  const username = String(form.get('username') ?? '')
  const password = String(form.get('password') ?? '')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email: toEmail(username), password })
  if (error || !data.user) return { error: 'Username atau password salah' }   // layar 01b

  const { data: p } = await supabase.from('profiles').select('role,is_active').eq('id', data.user.id).single()
  if (!p || !p.is_active) { await supabase.auth.signOut(); return { error: 'Username atau password salah' } }
  redirect(HOME[p.role])
}
```

### 5.3 Guard peran

```ts
// middleware.ts  (Next.js 16+: ganti nama file menjadi proxy.ts)
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const RULES: [string, string[]][] = [
  ['/sopir', ['sopir']],
  ['/kabid', ['kabid', 'admin']],
  ['/admin', ['admin']],
]

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        } } }
  )
  const rule = RULES.find(([prefix]) => req.nextUrl.pathname.startsWith(prefix))
  if (!rule) return res

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))
  const { data: p } = await supabase.from('profiles').select('role,is_active').eq('id', user.id).single()
  if (!p?.is_active || !rule[1].includes(p.role)) return NextResponse.redirect(new URL('/', req.url))
  return res
}

export const config = { matcher: ['/sopir/:path*', '/kabid/:path*', '/admin/:path*'] }
```

Middleware **bukan** satu-satunya lapisan: setiap Server Action Admin/Kabid juga memanggil `requireRole([...])` (di `lib/auth/guard.ts`) sebelum bekerja, dan RLS tetap menjadi lapisan terakhir.

---

## 6. Snippet kunci

### 6.1 Validasi aduan
```ts
// lib/validation/aduan.ts
import { z } from 'zod'
export const aduanSchema = z.object({
  nama_pelapor: z.string().trim().min(2, 'Minimal 2 karakter').max(100),
  no_telepon: z.string().trim().regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor telepon tidak valid'),
  deskripsi_lokasi: z.string().trim().min(10, 'Minimal 10 karakter').max(500),
})
```

### 6.2 Cek jenis gambar (magic bytes) dan Turnstile
```ts
// lib/image-check.ts
export function detectImage(b: Uint8Array): 'jpg' | 'png' | 'webp' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg'
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp'
  return null
}
```
```ts
// lib/turnstile.ts
export async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return process.env.NODE_ENV !== 'production'
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  })
  return (await r.json()).success === true
}
```

### 6.3 `POST /api/aduan`
```ts
// app/api/aduan/route.ts
import { NextResponse } from 'next/server'
import { createHash, randomUUID } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { aduanSchema } from '@/lib/validation/aduan'
import { detectImage } from '@/lib/image-check'
import { verifyTurnstile } from '@/lib/turnstile'

const MAX = 5 * 1024 * 1024

export async function POST(req: Request) {
  const form = await req.formData()
  if (form.get('website')) return NextResponse.json({ ok: true })            // honeypot

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!(await verifyTurnstile(String(form.get('cf-turnstile-response') ?? ''), ip)))
    return NextResponse.json({ ok: false, message: 'Verifikasi keamanan gagal' }, { status: 400 })

  const parsed = aduanSchema.safeParse({
    nama_pelapor: form.get('nama_pelapor'),
    no_telepon: form.get('no_telepon'),
    deskripsi_lokasi: form.get('deskripsi_lokasi'),
  })
  const foto = form.get('foto')
  const ext = foto instanceof File && foto.size > 0 && foto.size <= MAX
    ? detectImage(new Uint8Array(await foto.slice(0, 16).arrayBuffer())) : null

  if (!parsed.success || !(foto instanceof File) || !ext) {
    return NextResponse.json({
      ok: false,
      message: 'Data atau ukuran foto tidak valid',                            // layar 04b
      fields: parsed.success ? {} : parsed.error.flatten().fieldErrors,
      foto: !ext ? 'Foto wajib, JPG/PNG/WebP, maksimal 5 MB' : undefined,
    }, { status: 422 })
  }

  const ipHash = createHash('sha256').update(ip + process.env.IP_HASH_SALT).digest('hex')
  const { count } = await supabaseAdmin.from('aduan').select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash).gte('created_at', new Date(Date.now() - 3600_000).toISOString())
  if ((count ?? 0) >= 5)
    return NextResponse.json({ ok: false, message: 'Terlalu banyak aduan. Coba lagi nanti.' }, { status: 429 })

  const id = randomUUID()
  const path = `aduan/${id}/${randomUUID()}.${ext}`
  const up = await supabaseAdmin.storage.from('aduan-foto')
    .upload(path, foto, { contentType: foto.type, upsert: false })
  if (up.error) return NextResponse.json({ ok: false, message: 'Gagal mengunggah foto' }, { status: 500 })

  const { data, error } = await supabaseAdmin.from('aduan')
    .insert({ id, ...parsed.data, foto_path: path, ip_hash: ipHash })
    .select('kode_tiket').single()
  if (error) {
    await supabaseAdmin.storage.from('aduan-foto').remove([path])
    return NextResponse.json({ ok: false, message: 'Gagal menyimpan aduan' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, kode: data.kode_tiket })
}
```

### 6.4 Cek status dan peta publik
```ts
// app/api/cek-status/route.ts  (GET ?kode=SLP-...)
const kode = new URL(req.url).searchParams.get('kode') ?? ''
if (!/^SLP-\d{4}-[A-F0-9]{8}$/i.test(kode.trim())) return NextResponse.json({ found: false }, { status: 404 })
const { data } = await supabaseAdmin.rpc('cek_status_aduan', { p_kode: kode })
return data?.length ? NextResponse.json({ found: true, aduan: data[0] }) : NextResponse.json({ found: false }, { status: 404 })
```
```ts
// app/api/public/armada/route.ts  — cache pendek, samarkan plat
export const revalidate = 15
const { data } = await supabaseAdmin.rpc('posisi_armada_terbaru')
const mask = (p: string) => p.replace(/(\d{2})\d{2}/, '$1••')
return NextResponse.json((data ?? []).map(a => ({ id: a.armada_id, plat: mask(a.plat_nomor),
  jenis: a.jenis, lat: a.lat, lng: a.lng, waktu: a.direkam_at })))
```
Tambahkan pembatas laju sederhana (mis. 30 permintaan/menit/IP) pada `cek-status`.

### 6.5 Sopir: kirim lokasi (komponen klien)
```tsx
useEffect(() => {
  if (!aktif) return
  let lock: WakeLockSentinel | null = null
  navigator.wakeLock?.request('screen').then(l => (lock = l)).catch(() => {})
  const kirim = () => navigator.geolocation.getCurrentPosition(
    async p => { await supabase.from('lokasi_armada').insert({
      perjalanan_id, armada_id, lat: p.coords.latitude, lng: p.coords.longitude }) },
    () => setIzinDitolak(true), { enableHighAccuracy: true, timeout: 10_000 })
  kirim()
  const t = setInterval(kirim, 30_000)
  return () => { clearInterval(t); lock?.release() }
}, [aktif, perjalanan_id, armada_id])
```

### 6.6 Sopir: unggah bukti
Kompres di klien (`browser-image-compression`, `maxSizeMB: 1.5`), cek ukuran ≤ 5 MB (jika masih lebih → layar 09b), unggah ke `bukti-pengangkutan` di path `${userId}/${perjalananId}/${crypto.randomUUID()}.jpg`, lalu `insert` ke `bukti_pengangkutan`. Jika insert gagal, hapus objek yang sudah terunggah.

### 6.7 Kabid: peta Realtime
```ts
supabase.channel('lokasi').on('postgres_changes',
  { event: 'INSERT', schema: 'public', table: 'lokasi_armada' },
  payload => perbaruiMarker(payload.new)).subscribe()
```
Muat posisi awal dari RPC `posisi_armada_terbaru`. Leaflet wajib diimpor dengan `dynamic(() => import(...), { ssr: false })`.

### 6.8 Kabid: respon aduan
`insert` ke `respon_aduan` dengan `petugas_id = user.id`; trigger database memperbarui status aduan. Setelah sukses panggil `revalidatePath('/kabid/aduan')`. Foto aduan ditampilkan lewat `createSignedUrl(path, 300)`.

### 6.9 Kabid: ekspor Excel
```ts
// app/api/laporan/route.ts  (setelah requireRole(['kabid','admin']) dan validasi rentang tanggal)
import ExcelJS from 'exceljs'
const wb = new ExcelJS.Workbook()
const ws = wb.addWorksheet('Aduan')
ws.columns = [
  { header: 'Kode Tiket', key: 'kode_tiket', width: 22 },
  { header: 'Tanggal', key: 'created_at', width: 20 },
  { header: 'Pelapor', key: 'nama_pelapor', width: 24 },
  { header: 'Telepon', key: 'no_telepon', width: 16 },
  { header: 'Lokasi', key: 'deskripsi_lokasi', width: 50 },
  { header: 'Status', key: 'status', width: 12 },
]
rows.forEach(r => ws.addRow(r))
ws.getRow(1).font = { bold: true }
const buf = await wb.xlsx.writeBuffer()
return new Response(buf, { headers: {
  'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'Content-Disposition': `attachment; filename="laporan-aduan-${from}_${to}.xlsx"` } })
```
Batasi 10.000 baris; di atas itu atau error → kembalikan JSON error agar UI menampilkan layar 15b. Sheet kedua: *Perjalanan & Bukti* (tanggal, plat, sopir, mulai, selesai, jumlah bukti).

### 6.10 Admin: buat pengguna
```ts
'use server'
export async function buatPengguna(input: unknown) {
  await requireRole(['admin'])
  const v = penggunaSchema.parse(input)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: toEmail(v.username), password: v.password, email_confirm: true })
  if (error || !data.user) return { error: 'Gagal membuat akun (username mungkin sudah dipakai)' }
  const { error: e2 } = await supabaseAdmin.from('profiles')
    .insert({ id: data.user.id, username: v.username, nama_lengkap: v.nama_lengkap, role: v.role })
  if (e2) { await supabaseAdmin.auth.admin.deleteUser(data.user.id); return { error: 'Gagal menyimpan profil' } }
  await supabaseAdmin.from('audit_log').insert({ actor_id: admin.id, aksi: 'pengguna.buat', entitas: 'profiles', entitas_id: data.user.id })
  revalidatePath('/admin/pengguna')
}
```
Aturan tambahan: admin tidak boleh menghapus/menonaktifkan dirinya sendiri; hapus akun yang punya riwayat = `is_active=false` (dan `auth.admin.updateUserById(id, { ban_duration: '876000h' })` agar sesi mati).

---

## 7. Tema dan komponen dari Figma

1. Baca variabel Figma (koleksi "Colors") dengan Figma MCP `get_variable_defs`, lalu terjemahkan ke CSS variables/Tailwind theme (tabel token ada di `PRD.md` §7).
2. Impor komponen **Header DLH / Desktop** dan **Header DLH / Mobile** (section "Komponen — Header DLH") menjadi `HeaderDLH.tsx` yang responsif.
3. Untuk setiap layar, panggil `get_design_context` pada frame terkait (nomor 01–23), lalu **implementasikan dengan komponen yang sudah ada**, bukan menyalin kode mentah.
4. Layar "b" = state error pada route yang sama.
5. Latar halaman `bg`, kartu `surface`; jangan mengganti ke putih/abu polos.

---

## 8. Checklist keamanan (wajib sebelum rilis)

- [ ] Sign-up publik Supabase dimatikan
- [ ] RLS aktif di semua tabel; `anon` tidak punya policy apa pun
- [ ] Advisors Supabase (security + performance) bersih
- [ ] `SUPABASE_SERVICE_ROLE_KEY` hanya di server; tidak ada di bundle klien (`grep` hasil build)
- [ ] Security headers di `next.config.ts` (CSP yang mengizinkan Supabase, Turnstile, tile OSM; X-Frame-Options DENY; nosniff; Referrer-Policy; HSTS)
- [ ] Validasi Zod di semua Route Handler/Server Action; MIME + magic bytes di unggahan
- [ ] Turnstile + honeypot + rate limit pada `/api/aduan` dan `/api/cek-status`
- [ ] Pesan login generik; tidak ada pintasan "masuk sebagai" di produksi
- [ ] Bucket privat; hanya signed URL berumur ≤ 5 menit
- [ ] Nama/telepon pelapor tidak pernah dikirim ke endpoint publik
- [ ] `.env.local` di `.gitignore`; tidak ada kunci di riwayat git
- [ ] Backup harian Supabase aktif

---

## 9. Pengujian

### 9.1 Skenario UAT
| # | Skenario | Hasil yang diharapkan |
|---|---|---|
| 1 | Warga kirim aduan valid | Kode tiket tampil; baris di `aduan`; foto di bucket |
| 2 | Aduan telepon salah / foto 6 MB / file `.exe` diganti nama `.jpg` | Ditolak, pesan layar 04b, isian tetap |
| 3 | 6 aduan dalam 1 jam dari IP sama | Aduan ke-6 ditolak (429) |
| 4 | Cek status kode benar / salah | Status + riwayat / layar 06b |
| 5 | Login benar / salah / akun nonaktif | Redirect sesuai peran / pesan generik |
| 6 | Sopir buka `/admin/armada` | Dialihkan |
| 7 | Sopir mulai perjalanan dengan armada `perawatan` | Ditolak |
| 8 | Dua sopir memulai armada yang sama bersamaan | Hanya satu berhasil |
| 9 | Sopir akhiri tanpa foto | Ditolak dengan pesan jelas |
| 10 | Unggah foto 6 MB | Layar 09b |
| 11 | Kabid merespon aduan | Status berubah; muncul di cek status publik bila ditandai publik |
| 12 | Ekspor Excel rentang sah / tanpa data / terbalik | File terunduh / layar 15b |
| 13 | Admin tambah armada kosong / plat duplikat | Layar 17b / pesan plat sudah ada |
| 14 | Admin hapus armada beriwayat | Dinonaktifkan, riwayat utuh |
| 15 | Admin hapus akunnya sendiri | Ditolak |
| 16 | Anon `select` langsung ke tabel lewat REST | Kosong/ditolak |

### 9.2 Perintah rutin
`npm run lint && npm run build` pada setiap akhir fase. Tambahkan tes RLS sederhana (skrip yang login sebagai tiap peran dan mencoba query terlarang).

---

## 10. Deploy

1. Push repo ke GitHub; impor `frontend/` ke Vercel (Root Directory = `frontend`).
2. Isi semua environment variable (§3) di Vercel; `SUPABASE_SERVICE_ROLE_KEY` dan `TURNSTILE_SECRET_KEY` sebagai *secret*.
3. Supabase: Site URL + Redirect URL ke domain produksi; jalankan Advisors; aktifkan backup.
4. Buat admin pertama (§4), lalu admin membuat akun Kabid dan sopir.
5. Pasang domain, uji ulang UAT 1–16 di produksi, serahkan panduan singkat per peran.

---

## 11. Masalah umum

| Gejala | Penyebab/solusi |
|---|---|
| `new row violates row-level security policy` | Policy insert belum ada untuk peran itu; sopir hanya boleh insert jika perjalanan miliknya `berjalan` |
| Realtime tidak memicu | Tabel belum di publication `supabase_realtime`, atau RLS menolak peran tersebut |
| Leaflet error `window is not defined` | Impor dengan `dynamic(..., { ssr: false })`; impor CSS `leaflet/dist/leaflet.css` |
| Ikon marker Leaflet hilang | Set ulang `L.Icon.Default` atau pakai ikon kustom |
| Gambar signed URL diblokir `next/image` | Tambahkan host Supabase ke `images.remotePatterns` |
| Tipe TS kedaluwarsa setelah migrasi | Jalankan `npm run supabase:types` |
| Geolocation selalu ditolak | Hanya jalan di HTTPS atau `localhost`; periksa izin situs |
| Email sintetis ditolak Supabase | Ganti domain di `lib/auth/username.ts` dan buat ulang akun |
