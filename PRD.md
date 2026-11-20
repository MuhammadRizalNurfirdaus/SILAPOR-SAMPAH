# PRD — SILAPOR SAMPAH

**Sistem Lapor dan Pemantauan Pengangkutan Sampah**
Dinas Lingkungan Hidup (DLH) Kabupaten Kuningan

| | |
|---|---|
| Versi | 1.0 (MVP) |
| Status | Draf untuk implementasi |
| Desain | Figma: https://www.figma.com/design/Tqb4iSo8Xo5D0cis2WwWuj/Untitled?node-id=3-2 (page "SILAPOR Prototype", 29 layar) |
| Database | Supabase, project ref `wymulanaxgbbccbcbjnn` |
| Dokumen pendamping | `BUILD_GUIDE.md`, `RESPONSIVE_SPEC.md`, `MASTER_PROMPT.md`, `0001_init_schema.sql` |

---

## 1. Ringkasan

### 1.1 Masalah
- Warga tidak punya kanal resmi yang mudah untuk melaporkan tumpukan sampah, dan tidak bisa tahu laporannya sudah ditangani atau belum.
- Kepala Bidang tidak punya gambaran real-time: armada mana yang sedang bertugas, apakah pengangkutan benar-benar dilakukan, dan aduan mana yang belum direspon.
- Bukti pengangkutan (foto) tersebar di grup chat, sulit dicari, dan pelaporan bulanan dibuat manual.

### 1.2 Solusi
Aplikasi web (mobile-first untuk sopir) dengan empat jenis pengguna:
1. **Publik** (tanpa login): melihat peta armada, mengirim aduan, mengecek status aduan.
2. **Sopir**: memulai/mengakhiri perjalanan armada, mengunggah foto bukti pengangkutan.
3. **Kepala Bidang (Kabid)**: memantau operasional, melihat galeri bukti, merespon aduan, mengekspor laporan Excel.
4. **Admin**: mengelola data armada dan akun pengguna.

### 1.3 Tujuan produk
| # | Tujuan | Indikator (usulan, perlu disepakati dengan DLH) |
|---|---|---|
| G1 | Aduan warga tercatat dan dapat dilacak | 100% aduan memiliki kode tiket; status dapat dicek publik |
| G2 | Respon aduan lebih cepat | Median waktu respon pertama ≤ 48 jam |
| G3 | Pengangkutan terbukti | ≥ 90% perjalanan selesai memiliki ≥ 1 foto bukti |
| G4 | Pelaporan tidak manual | Laporan Excel bulanan dibuat < 1 menit |
| G5 | Data aman | Tidak ada akses anonim ke data pribadi; semua tabel dilindungi RLS |

### 1.4 Di luar cakupan v1
Notifikasi WhatsApp/SMS, aplikasi native, optimasi rute otomatis, integrasi timbangan/IoT, pembayaran retribusi, multi-dinas/multi-kabupaten, login warga, pelacakan GPS di latar belakang saat layar mati (batasan browser).

---

## 2. Peran dan Hak Akses

| Kemampuan | Publik | Sopir | Kabid | Admin |
|---|:-:|:-:|:-:|:-:|
| Lihat beranda, peta armada | ✅ | ✅ | ✅ | ✅ |
| Kirim aduan, cek status aduan | ✅ | – | – | – |
| Mulai/akhiri perjalanan, kirim lokasi | – | ✅ | – | – |
| Unggah foto bukti (perjalanan miliknya) | – | ✅ | – | – |
| Pantau operasional & galeri bukti | – | – | ✅ | ✅ |
| Lihat daftar & detail aduan, beri respon | – | – | ✅ | ✅ |
| Laporan & ekspor Excel | – | – | ✅ | ✅ |
| CRUD armada | – | – | – | ✅ |
| CRUD akun pengguna (sopir/kabid/admin) | – | – | – | ✅ |

Aturan: akun dibuat **hanya oleh Admin**. Tidak ada pendaftaran mandiri. Pengguna nonaktif (`is_active = false`) tidak bisa masuk.

---

## 3. Peta Layar (Figma → Route)

| No | Layar Figma | Route Next.js | Peran |
|---|---|---|---|
| 01 / 01b | Login / Login gagal | `/login` | Publik |
| 02 | Beranda Publik | `/` | Publik |
| 03 | Peta Armada | `/peta` | Publik |
| 04 / 04b | Buat Aduan / Data tidak valid | `/aduan/baru` | Publik |
| 05 | Aduan Berhasil | `/aduan/berhasil/[kode]` | Publik |
| 06 / 06b | Cek Status Aduan / Tidak ditemukan | `/cek-status` | Publik |
| 07 | Dashboard Sopir | `/sopir` | Sopir |
| 08 | Perjalanan Armada Aktif | `/sopir/perjalanan` | Sopir |
| 09 / 09b | Unggah Foto Bukti / Ukuran melebihi batas | `/sopir/perjalanan/bukti` | Sopir |
| 10 | Akhiri Perjalanan | `/sopir/perjalanan/akhiri` | Sopir |
| 11 | Pemantauan Operasional | `/kabid` | Kabid, Admin |
| 12 | Galeri Bukti Pengangkutan | `/kabid/galeri` | Kabid, Admin |
| 13 | Daftar Aduan Masyarakat | `/kabid/aduan` | Kabid, Admin |
| 14 | Detail dan Respon Aduan | `/kabid/aduan/[id]` | Kabid, Admin |
| 15 / 15b | Laporan dan Ekspor Excel / Gagal dibuat | `/kabid/laporan` | Kabid, Admin |
| 16 | Kelola Data — tab Armada | `/admin/armada` | Admin |
| 17 / 17b | Tambah Armada / Belum lengkap | `/admin/armada/baru` | Admin |
| 18 | Ubah Armada | `/admin/armada/[id]/ubah` | Admin |
| 19 | Dialog Hapus Armada | modal di `/admin/armada` | Admin |
| 20 | Kelola Data — tab Pengguna | `/admin/pengguna` | Admin |
| 21 | Tambah Akun Pengguna | `/admin/pengguna/baru` | Admin |
| 22 | Ubah Akun | `/admin/pengguna/[id]/ubah` | Admin |
| 23 | Dialog Hapus Pengguna | modal di `/admin/pengguna` | Admin |

Catatan: layar yang bernomor "b" adalah **state error** dan wajib diimplementasikan, bukan layar terpisah.

---

## 4. Kebutuhan Fungsional

### 4.1 Publik

**FR-P1 Beranda & navigasi.** Header instansi DLH Kuningan, menu: Beranda, Peta Armada, Buat Aduan, Cek Status, Login.

**FR-P2 Peta Armada.**
- Menampilkan posisi terakhir armada berstatus `beroperasi` pada peta (OpenStreetMap).
- Data diperbarui otomatis tiap 15 detik; menampilkan jenis armada dan waktu pembaruan terakhir.
- Data pribadi sopir **tidak** ditampilkan; plat nomor disamarkan sebagian (mis. `E 12•• AB`).
- Posisi yang lebih tua dari 10 menit ditandai "tidak aktif".

**FR-P3 Buat Aduan.** Field: Nama Pelapor, No. Telepon, Deskripsi Lokasi, Foto Lokasi, Pernyataan Keabsahan Laporan.
- Validasi: nama 2–100 karakter; telepon format Indonesia (`08…`, `62…`, `+62…`); deskripsi 10–500 karakter; foto JPG/PNG/WebP maksimal **5 MB** (dicek ukuran, MIME, dan magic bytes di server); pernyataan keabsahan wajib dicentang.
- Pernyataan Keabsahan Laporan: Edukasi etika pelaporan publik dan tanggung jawab hukum (keterangan palsu dapat dikenai sanksi perundang-undangan). Pelapor wajib mencentang persetujuan: *"Saya menyatakan data dan foto yang saya kirim benar."* sebelum pengiriman aduan.
- Privasi: Nama dan nomor telepon pelapor hanya digunakan untuk verifikasi dan tindak lanjut petugas.
- Gagal validasi → tampilkan pesan error "Data atau ukuran foto tidak valid" (layar 04b) dengan detail per field; isian tidak hilang.
- Berhasil → tampil **nomor laporan aduan** (format `SLP-YYMM-XXXXXXXX`) dan tombol salin (layar 05).
- Anti-penyalahgunaan: Cloudflare Turnstile, honeypot field, batas 5 aduan/jam per IP (disimpan sebagai hash).

**FR-P4 Cek Status Aduan.** Input kode tiket → tampil status (`baru`, `diproses`, `selesai`, `ditolak`), tanggal, dan riwayat respon yang ditandai publik. Tidak menampilkan nama/telepon pelapor. Tidak ditemukan → layar 06b. Dibatasi laju untuk mencegah tebak-tebakan kode.

### 4.2 Autentikasi (semua peran internal)

**FR-A1 Login** dengan username + password (layar 01). Gagal → pesan generik "Username atau password salah" (layar 01b), tanpa membocorkan mana yang salah.
**FR-A2** Setelah login, arahkan sesuai peran: Sopir → `/sopir`, Kabid → `/kabid`, Admin → `/admin/armada`.
**FR-A3** Logout; sesi kedaluwarsa mengarahkan ke `/login`.
**FR-A4** Akses route di luar peran → halaman 403 / redirect ke beranda peran.
**FR-A5** Tombol "Pintasan prototype — masuk sebagai" di desain Figma **tidak boleh ada di produksi**.

### 4.3 Sopir (mobile-first, lebar acuan 390 px)

**FR-S1 Dashboard (07).** Tampilkan status armada ("Di Garasi") dan dropdown **Pilih Unit Armada** (hanya yang berstatus `garasi`, mis. "E 1234 AB — Dump Truck"). Tombol **Mulai Perjalanan** memanggil RPC `mulai_perjalanan`.
**FR-S2 Perjalanan aktif (08).** Menampilkan armada, waktu mulai, durasi berjalan, jumlah bukti. Selama aktif, aplikasi mengirim lokasi tiap 30 detik (Geolocation API; butuh izin pengguna dan layar tetap menyala). Jika izin ditolak, perjalanan tetap bisa berjalan dengan peringatan.
**FR-S3 Unggah bukti (09).** Ambil foto dari kamera/galeri, maksimal 5 MB, JPG/PNG/WebP, keterangan opsional. Melebihi batas → pesan jelas (layar 09b). Unggah langsung ke Supabase Storage di path `{sopir_id}/{perjalanan_id}/…`.
**FR-S4 Akhiri perjalanan (10).** Ringkasan opsional; wajib ≥ 1 foto bukti. Berhasil → armada kembali `garasi`.
**FR-S5** Satu sopir hanya boleh punya satu perjalanan aktif; satu armada hanya satu perjalanan aktif (dijamin constraint database).

### 4.3 Kabid

**FR-K1 Pemantauan operasional (11).** Kartu ringkasan: jumlah armada beroperasi/garasi/perawatan, perjalanan hari ini, aduan baru. Peta posisi armada (Realtime) dan tabel perjalanan aktif.
**FR-K2 Galeri bukti (12).** Grid foto bukti, filter tanggal, armada, sopir; klik untuk memperbesar; menampilkan waktu dan lokasi. Foto diakses lewat signed URL (kedaluwarsa pendek).
**FR-K3 Daftar aduan (13).** Tabel dengan filter status, rentang tanggal, pencarian kode tiket; urut terbaru; paginasi.
**FR-K4 Detail & respon (14).** Lihat seluruh data aduan + foto; form respon: status baru + catatan; opsi "tampilkan ke publik". Riwayat respon tampil berurutan. Respon otomatis mengubah status aduan.
**FR-K5 Laporan Excel (15).** Pilih jenis laporan (Aduan / Perjalanan & Bukti) dan rentang tanggal → unduh `.xlsx`. Gagal (rentang tak valid, tidak ada data, error server, > 10.000 baris) → layar 15b dengan pesan yang dapat ditindaklanjuti.

### 4.4 Admin

**FR-M1 Armada (16–19).** Daftar, tambah, ubah, hapus armada. Field: plat nomor (unik, otomatis huruf besar), jenis, kapasitas (m³, opsional), wilayah (opsional), status. Belum lengkap → layar 17b. Hapus lewat dialog konfirmasi; armada yang punya riwayat perjalanan **dinonaktifkan** (soft delete), bukan dihapus fisik.
**FR-M2 Pengguna (20–23).** Daftar, tambah, ubah, hapus akun. Field: username (unik, `a-z0-9._-`, 3–30), nama lengkap, peran, password awal (min 8 karakter, wajib diganti oleh admin bila lupa), status aktif. Admin tidak dapat menghapus/menonaktifkan akunnya sendiri. Hapus lewat dialog; akun dengan riwayat dinonaktifkan.
**FR-M3 Audit.** Setiap tindakan admin (tambah/ubah/hapus armada & pengguna) dicatat di `audit_log`.

---

## 5. Aturan Bisnis

1. **Status aduan:** `baru` → `diproses` → `selesai` atau `ditolak`. Kabid boleh mengubah ke status mana pun lewat respon, wajib dengan catatan.
2. **Status armada:** `garasi` ⇄ `beroperasi` (otomatis oleh RPC), `perawatan` hanya diubah Admin. Armada `perawatan` tidak muncul di pilihan sopir.
3. **Perjalanan** tidak bisa diakhiri tanpa bukti foto.
4. **Kode tiket** bersifat acak dan tidak berurutan.
5. **Zona waktu** seluruh tampilan: WIB (Asia/Jakarta); penyimpanan: UTC.
6. **Privasi:** nama dan telepon pelapor hanya terlihat oleh Kabid/Admin. Pertimbangkan retensi aduan selesai > 2 tahun (perlu keputusan DLH).

---

## 6. Kebutuhan Non-Fungsional

| Aspek | Persyaratan |
|---|---|
| Keamanan | RLS aktif di semua tabel; anon tanpa akses langsung ke tabel; service-role key hanya di server; security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy, HSTS); validasi Zod di server; rate limit; unggahan divalidasi magic bytes |
| Privasi | Data pribadi pelapor minimal dan terbatas; patuh prinsip UU PDP (tujuan jelas, akses terbatas, retensi) |
| Performa | Halaman publik < 2,5 detik LCP pada 4G; gambar dikompres di klien sebelum unggah bila > 1,5 MB |
| Perangkat & responsif | **Semua layar responsif 320–1920 px** (HP, tablet, laptop, monitor lebar), mobile-first, tanpa scroll horizontal, target sentuh ≥ 44 px; acuan desain Figma 390 px dan 1280 px; detail di `RESPONSIVE_SPEC.md`. Sopir diprioritaskan di Chrome Android |
| Aksesibilitas | Kontras teks ≥ 4,5:1 (token warna sudah dipilih untuk ini), label form jelas, fokus keyboard terlihat |
| Bahasa | Seluruh UI Bahasa Indonesia |
| Ketersediaan | Mengikuti SLA Supabase + hosting; cadangan database harian |
| Observabilitas | Log error server, Supabase Advisors dijalankan sebelum rilis |

---

## 7. Desain & Branding

- **Tema:** hijau lingkungan, dengan aksen kuning-oranye dari logo DLH.
- **Header instansi:** gradasi hijau tua → lime, kartu putih berisi logo DLH Kuningan (`/logo-dlh-kuningan.png`), garis aksen hijau-kuning-oranye. Ada versi desktop (1280) dan mobile (390).
- **Token warna (dari variabel Figma, koleksi "Colors"):**

| Token | Nilai | Pemakaian |
|---|---|---|
| primary | `#15803D` | Tombol, link aktif |
| primary-dark | `#166534` | Brand teks, hover |
| primary-light | `#DCFCE7` | Menu aktif, badge |
| bg | `#E3F3E8` | Latar halaman |
| surface | `#FFFFFF` | Kartu, input, navbar |
| danger / bg / teks | `#DC2626` / `#FEE2E2` / `#991B1B` | Error |
| warning bg / teks | `#FEF3C7` / `#92400E` | Peringatan |
| info bg / teks | `#DBEAFE` / `#1E40AF` | Informasi |
| Gradasi header | `#14532D → #15803D → #65A30D` | Header instansi |
| Aksen | `#84CC16 → #FACC15 → #F59E0B` | Garis bawah header |

- **Font:** Inter. Sumber kebenaran desain adalah file Figma; jika ada selisih dengan dokumen ini, **Figma yang menang**.

---

## 8. Alur Utama

**Aduan warga:** isi form → server validasi (Turnstile, rate limit, Zod, magic bytes) → unggah foto ke bucket privat → simpan aduan → tampil kode tiket → Kabid melihat di daftar → merespon → status berubah → warga cek status dengan kode tiket.

**Perjalanan armada:** sopir login → pilih unit → Mulai (RPC) → lokasi terkirim berkala → unggah foto bukti → Akhiri (RPC, wajib ada bukti) → armada kembali ke garasi → Kabid melihat di pemantauan & galeri.

**Laporan:** Kabid pilih jenis & rentang → server membuat `.xlsx` → unduh; gagal → layar 15b.

---

## 9. Rencana Rilis

| Fase | Isi | Hasil yang bisa diuji |
|---|---|---|
| 0 | Setup, MCP, token desain, header | Proyek berjalan di `localhost:3002` |
| 1 | Database, RLS, storage, tipe TS | Migrasi terpasang, Advisors bersih |
| 2 | Auth & guard peran | Login 3 peran, redirect benar |
| 3 | Halaman publik (beranda, aduan, cek status) | Aduan end-to-end |
| 4 | Modul Sopir | Perjalanan + bukti end-to-end |
| 5 | Peta armada (publik & Kabid, Realtime) | Marker bergerak |
| 6 | Modul Kabid (aduan, galeri, laporan) | Respon & ekspor Excel |
| 7 | Modul Admin | CRUD armada & pengguna |
| 8 | Hardening, UAT, deploy | Rilis ke produksi |

---

## 10. Risiko & Asumsi

| Risiko / asumsi | Mitigasi |
|---|---|
| Browser tidak mengirim GPS saat layar mati | Beri instruksi layar tetap menyala; pertimbangkan PWA/aplikasi native di v2 |
| Spam aduan | Turnstile, honeypot, rate limit per IP |
| Foto besar menghabiskan kuota Storage | Batas 5 MB, kompres di klien, kebijakan retensi |
| Sopir tidak punya data seluler stabil | Antrian unggah ulang sederhana; pesan error jelas |
| Asumsi: foto aduan **wajib** | Konfirmasi ke DLH; mudah dijadikan opsional |
| Asumsi: bukti minimal 1 foto per perjalanan | Konfirmasi ke DLH |
| Asumsi: Supabase cloud boleh dipakai untuk data instansi | Konfirmasi kebijakan data DLH/Diskominfo |

## 11. Pertanyaan Terbuka untuk DLH
1. Apakah foto aduan wajib, dan perlukah penanda titik di peta selain deskripsi teks?
2. Berapa target waktu respon aduan yang resmi?
3. Kategori/wilayah (kecamatan) apa yang perlu ada untuk laporan?
4. Berapa lama data aduan dan foto harus disimpan?
5. Siapa yang menjadi admin awal dan siapa yang berhak membuat akun Kabid?
