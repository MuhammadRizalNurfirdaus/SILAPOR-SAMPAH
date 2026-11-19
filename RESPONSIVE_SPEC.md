# RESPONSIVE SPEC — SILAPOR SAMPAH

Spesifikasi agar seluruh layar tampil baik di **semua perangkat**: HP kecil, HP besar, tablet (portrait/landscape), laptop, monitor lebar. Dokumen ini melengkapi `PRD.md` §6 dan `BUILD_GUIDE.md`.

## 1. Prinsip

1. **Mobile-first, satu codebase.** Tulis gaya dasar untuk layar kecil, tambah untuk layar lebih besar (`sm:`, `md:`, `lg:`…). Tidak ada halaman "versi mobile" terpisah.
2. **Figma hanya punya dua titik acuan: 390 px (mobile) dan 1280 px (desktop).** Tablet (640–1023 px) tidak digambar, jadi *diinterpolasi*: ikuti pola mobile sambil memakai ruang ekstra (2 kolom, margin lebih lega). Pada 390 dan 1280 px, **Figma yang menang**.
3. **Konten dulu, bukan perangkat.** Pakai breakpoint untuk perubahan tata letak yang memang perlu, dan *container query* untuk komponen yang harus menyesuaikan lebar wadahnya sendiri.
4. **Tidak boleh ada scroll horizontal** pada lebar 320 px ke atas (kecuali area yang sengaja bisa digeser, mis. tabel lebar di dalam wadahnya).
5. **Sopir memakai HP di lapangan**: tombol besar, kontras tinggi, satu tangan, koneksi tidak stabil.

## 2. Breakpoint dan perangkat sasaran

| Nama | Lebar | Contoh perangkat | Mode tata letak |
|---|---|---|---|
| base | 320–639 | iPhone SE, Android 360, iPhone 14 (390) | 1 kolom, navigasi ringkas |
| `sm` | ≥ 640 | HP landscape, HP besar | 1–2 kolom |
| `md` | ≥ 768 | iPad portrait (768/820) | 2 kolom, tabel mulai tampil |
| `lg` | ≥ 1024 | iPad landscape, laptop kecil | navigasi horizontal penuh, sidebar |
| `xl` | ≥ 1280 | Laptop/desktop (acuan Figma) | tata letak desktop penuh |
| `2xl` | ≥ 1536 | Monitor lebar | konten dibatasi lebar maksimum, tidak melar |

Lebar konten maksimum: `max-w-screen-xl` (1280) dengan padding horizontal `px-4 sm:px-6 lg:px-8`. Di monitor 1920 px, latar `bg` mengisi penuh dan konten tetap di tengah.

## 3. Aturan global

| Hal | Aturan |
|---|---|
| Meta viewport | `width=device-width, initial-scale=1, viewport-fit=cover` (Next.js: `export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }`). **Jangan** menonaktifkan zoom |
| Tinggi layar penuh | Pakai `min-h-dvh` / `100dvh`, bukan `100vh` (bilah alamat HP bergeser) |
| Area aman (notch/home bar) | `padding-bottom: env(safe-area-inset-bottom)` pada bar bawah/tombol lekat; `env(safe-area-inset-top)` pada header lekat |
| Target sentuh | ≥ 44×44 px untuk semua tombol/tautan di layar sentuh; jarak antar target ≥ 8 px |
| Input form | `font-size ≥ 16px` agar iOS tidak auto-zoom; tinggi ≥ 44 px; pakai `inputmode`/`autocomplete` yang tepat (`tel`, `username`, `current-password`) |
| Tipografi | Skala fluid dengan `clamp()` untuk judul (mis. `clamp(1.5rem, 1.1rem + 1.5vw, 2rem)`); teks isi 16 px; jangan ada teks < 12 px |
| Gambar | `max-width:100%; height:auto`; `aspect-ratio` tetap untuk foto agar tidak melompat; `next/image` dengan `sizes` yang benar; `loading="lazy"` di bawah lipatan |
| Hover | Jangan bergantung pada hover; semua info/aksi tersedia lewat tap & fokus keyboard |
| Gerak | Hormati `prefers-reduced-motion` |
| Orientasi | Layar sopir tetap berfungsi di landscape (tombol utama tidak tertutup) |
| Teks panjang | `overflow-wrap:anywhere` untuk kode tiket/URL/deskripsi; `text-wrap: balance` untuk judul |
| Teks Indonesia | Label bisa lebih panjang dari Inggris: jangan kunci lebar tombol/tab, biarkan wrap atau `min-w` |

## 4. Pola per komponen

### 4.1 Header instansi DLH (komponen Figma "Header DLH")
| Lebar | Tampilan |
|---|---|
| < 640 | Logo tinggi 34 px dalam kartu putih, padding 16 px (acuan Figma mobile) |
| 640–1023 | Logo tinggi 40 px, padding 24 px |
| ≥ 1024 | Logo tinggi 44 px, padding 32 px (acuan Figma desktop) |
| Semua | Garis aksen 4 px di bawah; logo tidak boleh terpotong (`object-fit: contain`); jika lebar < 340 px logo mengecil proporsional |

Gunakan satu komponen `HeaderDLH` dengan ukuran fluid, bukan dua komponen.

### 4.2 Navigasi
| Peran | < 1024 px | ≥ 1024 px |
|---|---|---|
| Publik | Brand + tombol menu (hamburger) membuka panel penuh dengan 5 tautan + Login | Navbar horizontal seperti Figma |
| Sopir | **Bar tab bawah** lekat (Dashboard, Perjalanan) dengan safe-area, atau tab atas seperti Figma mobile | Tab atas |
| Kabid / Admin | Hamburger → drawer; tab bagian (Armada/Pengguna) bisa digeser horizontal | Navbar/tab horizontal |

Drawer: fokus terkunci di dalam, tutup dengan Esc/ketuk latar, `aria-expanded` pada tombol.

### 4.3 Tabel → kartu
Tabel (daftar aduan, armada, pengguna, perjalanan) di **< 768 px** berubah menjadi **daftar kartu**: tiap baris = satu kartu dengan judul (kode tiket/plat/nama), badge status, 2–3 info utama, dan tombol aksi penuh lebar. Di ≥ 768 px tampil tabel biasa; di 768–1023 px kolom sekunder disembunyikan (`hidden lg:table-cell`). Jangan membuat tabel yang menggeser seluruh halaman.

### 4.4 Form
- < 640: 1 kolom, label di atas, tombol aksi utama penuh lebar dan lekat di bawah bila formulir panjang.
- ≥ 640: kartu form `max-w-xl` di tengah (Figma ±520 px). Form Admin (armada/pengguna) pakai 2 kolom mulai `md`.
- Pesan error tampil di bawah field dan ringkasan di atas kartu (layar "b"); fokus dipindah ke pesan error pertama.
- Unggah foto: tombol besar "Pilih Foto / Ambil Foto" (`accept="image/*"`, `capture` untuk kamera di sopir), pratinjau mengikuti lebar wadah.

### 4.5 Dialog (hapus armada/pengguna)
Elemen `<dialog>`. < 640: **bottom sheet** (menempel bawah, sudut atas membulat, tombol penuh lebar bertumpuk, aksi berbahaya terpisah). ≥ 640: dialog tengah `max-w-md`. Esc menutup, fokus kembali ke pemicu.

### 4.6 Peta (Leaflet)
Tinggi: `h-[60dvh]` < 768, `h-[65vh]` ≥ 768, min 320 px. Kontrol zoom ≥ 44 px di layar sentuh. `scrollWheelZoom` nonaktif sampai peta difokuskan; gestur dua jari untuk geser di HP agar halaman tidak "terjebak". Panggil `map.invalidateSize()` saat ukuran wadah berubah (drawer/orientasi). Legenda/daftar armada pindah **di bawah peta** pada < 1024, di samping pada ≥ 1024.

### 4.7 Grid dan kartu
| Komponen | < 640 | 640–1023 | ≥ 1024 |
|---|---|---|---|
| Kartu statistik (Kabid) | 1 kolom (atau 2×2 ringkas) | 2 | 4 |
| Galeri bukti | 2 kolom | 3 | 4–5 |
| Filter (tanggal, armada, status) | Terlipat dalam tombol "Filter" (sheet) | Baris wrap | Satu baris |
| Laporan Excel (pilih jenis + tanggal) | Ditumpuk, tombol unduh penuh lebar | 2 kolom | Sebaris |

### 4.8 Halaman login
Kartu `max-w-sm` di tengah, ada padding atas yang cukup di bawah header; di landscape HP pendek pastikan tombol login tetap terlihat tanpa menutupi (gunakan `min-h-dvh` + scroll alami).

## 5. Matriks per layar (ringkas)

| Layar | Mobile (≤ 639) | Tablet (640–1023) | Desktop (≥ 1024) |
|---|---|---|---|
| 02 Beranda | Hero 1 kolom, tombol aksi bertumpuk | Hero + 2 kartu fitur sebaris | Seperti Figma |
| 03 Peta Armada | Peta 60dvh + daftar di bawah | Peta + daftar di bawah | Peta + panel samping |
| 04/05 Aduan | Form 1 kolom, kode tiket besar + tombol salin | Kartu tengah | Kartu tengah (Figma) |
| 06 Cek Status | Input + tombol bertumpuk, hasil sebagai timeline vertikal | Sebaris | Sebaris |
| 07–10 Sopir | Satu tugas per layar, tombol utama ≥ 56 px, bar tab bawah | Konten `max-w-md` di tengah | Idem tablet |
| 11 Pemantauan | Statistik 1–2 kolom, peta, daftar perjalanan sebagai kartu | Statistik 2 kolom, peta penuh lebar | Statistik 4 kolom + peta + tabel |
| 12 Galeri | Grid 2 kolom, lightbox layar penuh (geser untuk berikutnya) | 3 kolom | 4–5 kolom |
| 13 Daftar Aduan | Kartu + filter sheet | Tabel ringkas | Tabel penuh |
| 14 Detail Aduan | Foto di atas, form respon di bawah | Foto + info 2 kolom | 2 kolom (info kiri, respon kanan) |
| 15 Laporan | Form bertumpuk | 2 kolom | Sebaris |
| 16–23 Admin | Kartu + dialog bottom sheet | Tabel ringkas, form 2 kolom | Tabel penuh |

## 6. Implementasi (Tailwind + CSS modern)

Catatan versi: breakpoint Tailwind bawaan (`sm 640, md 768, lg 1024, xl 1280, 2xl 1536`) sudah cocok. Container query bawaan di Tailwind v4 (`@container`, `@md:`); di v3 perlu plugin `@tailwindcss/container-queries`.

```tsx
// app/layout.tsx
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' as const }
```

```css
/* globals.css */
html { -webkit-text-size-adjust: 100%; }
body { min-height: 100dvh; overflow-x: clip; background: var(--bg); }
.safe-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
h1 { font-size: clamp(1.5rem, 1.1rem + 1.5vw, 2rem); text-wrap: balance; }
input, select, textarea { font-size: 1rem; min-height: 44px; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```

Pola tabel → kartu:

```tsx
<ul className="grid gap-3 md:hidden">{rows.map(r => <KartuAduan key={r.id} {...r} />)}</ul>
<table className="hidden md:table w-full">…</table>
```

Fitur platform modern yang disarankan (aman dipakai bila berstatus Baseline *widely available*; cek di MDN/Chrome sebelum memakai): container queries, `dvh`, `clamp()`, `aspect-ratio`, `:has()`, `<dialog>` dan Popover API untuk dialog/menu, `text-wrap: balance`, `scrollbar-gutter`. Skill **Modern Web Guidance** (lihat `BUILD_GUIDE.md` §0.2) membantu agent memilih pola native ini daripada pustaka tambahan.

## 7. Pengujian responsif

### 7.1 Matriks ukuran wajib
320×640 · 360×800 · 390×844 · 412×915 · 768×1024 · 1024×768 · 1280×800 · 1440×900 · 1920×1080, dan satu uji landscape HP (844×390). Uji juga zoom teks 200% dan mode "teks besar" Android.

### 7.2 Uji otomatis (Playwright)
```ts
import { test, expect } from '@playwright/test'
const sizes = [[320,640],[360,800],[390,844],[768,1024],[1024,768],[1280,800],[1440,900],[1920,1080]]
const paths = ['/', '/peta', '/aduan/baru', '/cek-status', '/login']

for (const [w, h] of sizes) for (const p of paths) {
  test(`tanpa scroll horizontal ${p} @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h })
    await page.goto(p)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow).toBe(false)
    await page.screenshot({ path: `shots/${p.replace(/\//g, '_') || 'home'}-${w}.png`, fullPage: true })
  })
}
```
Halaman berperan (sopir/kabid/admin) diuji dengan login terautentikasi (`storageState`) per peran.

### 7.3 Uji manual
- Chrome DevTools → Device Mode untuk matriks di atas; **Lighthouse (Mobile)**: Performance ≥ 85, Accessibility ≥ 95.
- Minimal satu **HP Android asli** (Chrome) dan satu iPhone/Safari bila ada: unggah foto dari kamera, GPS, safe-area, keyboard virtual tidak menutupi tombol kirim.
- Navigasi hanya dengan keyboard (Tab) di desktop; fokus selalu terlihat.

### 7.4 Definition of Done responsif (per layar)
- [ ] Tidak ada scroll horizontal pada 320–1920 px
- [ ] Sesuai Figma pada 390 dan 1280 px; wajar pada 768 px
- [ ] Semua target sentuh ≥ 44 px, teks ≥ 16 px pada input
- [ ] Tabel menjadi kartu < 768 px; dialog menjadi bottom sheet < 640 px
- [ ] Header DLH tidak terpotong; logo tajam
- [ ] Peta bisa dipakai di HP tanpa "menjebak" scroll halaman
- [ ] Lolos matriks ukuran §7.1 dan uji Playwright §7.2
