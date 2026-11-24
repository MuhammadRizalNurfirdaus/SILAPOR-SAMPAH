import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envContent = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anonClient = createClient(supabaseUrl, anonKey);

const BASE_URL = 'http://localhost:3002';

// Pastikan ada TPS uji (6 buah, agar uji rate limit tidak kena batas 1 aduan/TPS)
const runId = Date.now();
const tpsPrefix = `TPS UAT ${runId}`;
for (let i = 1; i <= 6; i++) {
  await adminClient
    .from('tps')
    .insert({ nama: `${tpsPrefix} ${i}`, kecamatan: 'Kuningan', alamat: 'UAT', is_active: true })
    .then(() => {})
    .catch(() => {});
}
const { data: tpsRows } = await adminClient
  .from('tps')
  .select('id')
  .eq('kecamatan', 'Kuningan')
  .ilike('nama', `${tpsPrefix}%`)
  .order('nama');
const tpsIds = (tpsRows || []).map((r) => r.id);
const defaultTpsId = tpsIds[0];
const dupTpsId = tpsIds[tpsIds.length - 1] || defaultTpsId;

// 1x1 transparent PNG magic bytes
const VALID_PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82
]);

// MZ magic bytes (.exe) disguised as .jpg
const FAKE_EXE_BYTES = Buffer.from([
  0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00,
  0x04, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00
]);

async function runUAT() {
  console.log('====================================================');
  console.log('=== PENGUJIAN OTOMATIS END-TO-END UAT FASE 3     ===');
  console.log('====================================================\n');

  let testTicketCode = '';

  // ----------------------------------------------------
  // UAT 1: Warga kirim aduan valid
  // ----------------------------------------------------
  console.log('--- UAT 1: Kirim Aduan Valid ---');
  const form1 = new FormData();
  form1.append('nama_pelapor', 'UAT Pelapor');
  form1.append('no_telepon', '081234567890');
  form1.append('deskripsi_lokasi', 'Jalan Veteran No. 10 Kuningan, depan pertigaan');
  form1.append('tps_id', defaultTpsId);
  form1.append('foto', new Blob([VALID_PNG_BYTES], { type: 'image/png' }), 'bukti.png');
  form1.append('cf-turnstile-response', 'XXXX.DUMMY.TOKEN.XXXX');

  const res1 = await fetch(`${BASE_URL}/api/aduan`, {
    method: 'POST',
    body: form1,
    headers: { 'x-forwarded-for': '192.168.1.100' },
  });
  const data1 = await res1.json();

  if (res1.status === 200 && data1.ok && data1.kode) {
    testTicketCode = data1.kode;
    console.log(`[PASS] Aduan valid berhasil disimpan.`);
    console.log(`       Kode Tiket: ${testTicketCode} (format: SLP-YYMM-XXXXXXXX)`);

    // Verifikasi di database Supabase via service role
    const { data: dbAduan, error: dbErr } = await adminClient
      .from('aduan')
      .select('*')
      .eq('kode_tiket', testTicketCode)
      .single();

    if (dbErr || !dbAduan) {
      console.error('[FAIL] Baris aduan tidak ditemukan di tabel Supabase!');
      process.exit(1);
    }
    console.log(`[PASS] Terverifikasi di tabel 'aduan': ID=${dbAduan.id}, foto_path=${dbAduan.foto_path}`);

    // Verifikasi file ada di storage bucket 'aduan-foto'
    const { data: fileData, error: fileErr } = await adminClient.storage
      .from('aduan-foto')
      .download(dbAduan.foto_path);

    if (fileErr || !fileData) {
      console.error('[FAIL] File foto tidak ditemukan di storage bucket aduan-foto!');
      process.exit(1);
    }
    console.log(`[PASS] Terverifikasi file foto tersimpan di bucket 'aduan-foto'.`);

  // ----------------------------------------------------
  // UAT TPS: Aduan kedua di TPS sama ditolak (409)
  // ----------------------------------------------------
  console.log('\\n--- UAT TPS: Duplikat aduan aktif per TPS ---');

  // Buat aduan pertama di TPS khusus duplikat
  const dupFirstForm = new FormData();
  dupFirstForm.append('nama_pelapor', 'UAT Duplikat Pertama');
  dupFirstForm.append('no_telepon', '081234567890');
  dupFirstForm.append('deskripsi_lokasi', 'Lokasi TPS duplikat pertama');
  dupFirstForm.append('tps_id', dupTpsId);
  dupFirstForm.append('foto', new Blob([VALID_PNG_BYTES], { type: 'image/png' }), 'bukti.png');
  dupFirstForm.append('cf-turnstile-response', 'XXXX.DUMMY.TOKEN.XXXX');

  const dupFirstRes = await fetch(`${BASE_URL}/api/aduan`, {
    method: 'POST',
    body: dupFirstForm,
    headers: { 'x-forwarded-for': '192.168.1.199' },
  });
  const dupFirstData = await dupFirstRes.json();
  if (!(dupFirstRes.status === 200 && dupFirstData.ok && dupFirstData.kode)) {
    console.error('[FAIL] Aduan pertama TPS duplikat gagal:', dupFirstRes.status, dupFirstData);
    process.exit(1);
  }
  const dupFirstTicket = dupFirstData.kode;

  // Kirim kedua ke TPS yang sama -> harus 409
  const dupForm = new FormData();
  dupForm.append('nama_pelapor', 'UAT Duplikat');
  dupForm.append('no_telepon', '081234567890');
  dupForm.append('deskripsi_lokasi', 'Lokasi duplikat TPS yang sama');
  dupForm.append('tps_id', dupTpsId);
  dupForm.append('foto', new Blob([VALID_PNG_BYTES], { type: 'image/png' }), 'bukti.png');
  dupForm.append('cf-turnstile-response', 'XXXX.DUMMY.TOKEN.XXXX');

  const dupRes = await fetch(`${BASE_URL}/api/aduan`, {
    method: 'POST',
    body: dupForm,
    headers: { 'x-forwarded-for': '192.168.1.200' },
  });
  const dupData = await dupRes.json();

  if (dupRes.status === 409 && dupData.code === 'TPS_AKTIF') {
    console.log(`[PASS] Aduan kedua di TPS sama ditolak dengan HTTP 409: "${dupData.message}"`);
  } else {
    console.error('[FAIL] Duplikat TPS tidak ditolak sesuai:', dupRes.status, dupData);
    process.exit(1);
  }

  // Set aduan pertama menjadi selesai, lalu kirim lagi harus sukses
  await adminClient.from('aduan').update({ status: 'selesai' }).eq('kode_tiket', dupFirstTicket);

  const dupForm2 = new FormData();
  dupForm2.append('nama_pelapor', 'UAT Setelah Selesai');
  dupForm2.append('no_telepon', '081234567890');
  dupForm2.append('deskripsi_lokasi', 'Lokasi setelah aduan selesai');
  dupForm2.append('tps_id', dupTpsId);
  dupForm2.append('foto', new Blob([VALID_PNG_BYTES], { type: 'image/png' }), 'bukti.png');
  dupForm2.append('cf-turnstile-response', 'XXXX.DUMMY.TOKEN.XXXX');

  const dupRes2 = await fetch(`${BASE_URL}/api/aduan`, {
    method: 'POST',
    body: dupForm2,
    headers: { 'x-forwarded-for': '192.168.1.201' },
  });
  const dupData2 = await dupRes2.json();

  if (dupRes2.status === 200 && dupData2.ok && dupData2.kode) {
    console.log(`[PASS] Setelah aduan selesai, aduan baru di TPS yang sama berhasil: ${dupData2.kode}`);
    // bersihkan agar TPS bebas untuk uji berikutnya
    await adminClient.from('aduan').update({ status: 'selesai' }).eq('kode_tiket', dupData2.kode);
  } else {
    console.error('[FAIL] Aduan setelah selesai tidak berhasil:', dupRes2.status, dupData2);
    process.exit(1);
  }
  } else {
    console.error('[FAIL] UAT 1 gagal:', res1.status, data1);
    process.exit(1);
  }

  // ----------------------------------------------------
  // UAT 2: Validasi Telepon Salah / File EXE Palsu
  // ----------------------------------------------------
  console.log('\n--- UAT 2: Aduan dengan Validasi Gagal (Layar 04b) ---');
  
  // Kasus 2a: Format nomor telepon salah
  const formBadPhone = new FormData();
  formBadPhone.append('nama_pelapor', 'Budi');
  formBadPhone.append('no_telepon', '12345'); // Format salah
  formBadPhone.append('deskripsi_lokasi', 'Jalan Ahmad Yani No 5 Kuningan');
  formBadPhone.append('tps_id', defaultTpsId);
  formBadPhone.append('foto', new Blob([VALID_PNG_BYTES], { type: 'image/png' }), 'foto.png');
  formBadPhone.append('cf-turnstile-response', 'XXXX.DUMMY.TOKEN.XXXX');

  const resBadPhone = await fetch(`${BASE_URL}/api/aduan`, {
    method: 'POST',
    body: formBadPhone,
    headers: { 'x-forwarded-for': '192.168.1.101' },
  });
  const dataBadPhone = await resBadPhone.json();

  if (resBadPhone.status === 422 && dataBadPhone.fields?.no_telepon) {
    console.log(`[PASS] Nomor telepon tidak valid ditolak (HTTP 422 Layar 04b): "${dataBadPhone.fields.no_telepon[0]}"`);
  } else {
    console.error('[FAIL] Validasi nomor telepon salah tidak sesuai:', resBadPhone.status, dataBadPhone);
    process.exit(1);
  }

  // Kasus 2b: File .exe diganti nama menjadi .jpg (Magic Bytes Check)
  const formFakeExe = new FormData();
  formFakeExe.append('nama_pelapor', 'Attacker');
  formFakeExe.append('no_telepon', '081299998888');
  formFakeExe.append('deskripsi_lokasi', 'Jalan Linggajati No 1 Kuningan');
  formFakeExe.append('tps_id', defaultTpsId);
  formFakeExe.append('foto', new Blob([FAKE_EXE_BYTES], { type: 'image/jpeg' }), 'malicious.jpg');
  formFakeExe.append('cf-turnstile-response', 'XXXX.DUMMY.TOKEN.XXXX');

  const resFakeExe = await fetch(`${BASE_URL}/api/aduan`, {
    method: 'POST',
    body: formFakeExe,
    headers: { 'x-forwarded-for': '192.168.1.102' },
  });
  const dataFakeExe = await resFakeExe.json();

  if (resFakeExe.status === 422 && dataFakeExe.foto) {
    console.log(`[PASS] File berbahaya (magic bytes non-image) ditolak (HTTP 422): "${dataFakeExe.foto}"`);
  } else {
    console.error('[FAIL] Magic bytes check gagal mendeteksi file berbahaya:', resFakeExe.status, dataFakeExe);
    process.exit(1);
  }

  // ----------------------------------------------------
  // UAT 3: Pembatasan Laju (Rate Limit) 5 Aduan / Jam per IP
  // ----------------------------------------------------
  // Bebaskan TPS UAT 1 (dipakai UAT 1) agar uji rate limit tidak terblokir aturan TPS
  await adminClient.from('aduan').update({ status: 'selesai' }).eq('kode_tiket', testTicketCode);

  console.log('\n--- UAT 3: Pembatasan Laju (5 aduan/jam per IP) ---');
  const spamIp = '10.99.99.99';
  console.log(`Mengirim 5 aduan cepat dari IP ${spamIp}...`);

  for (let i = 1; i <= 5; i++) {
    const f = new FormData();
    f.append('nama_pelapor', `Pelapor ${i}`);
    f.append('no_telepon', '081234567890');
    f.append('deskripsi_lokasi', `Lokasi penanganan sampah pengujian ke-${i}`);
    f.append('tps_id', tpsIds[i - 1] || defaultTpsId);
    f.append('foto', new Blob([VALID_PNG_BYTES], { type: 'image/png' }), 'foto.png');
    f.append('cf-turnstile-response', 'XXXX.DUMMY.TOKEN.XXXX');

    const r = await fetch(`${BASE_URL}/api/aduan`, {
      method: 'POST',
      body: f,
      headers: { 'x-forwarded-for': spamIp },
    });
    const d = await r.json();
    if (!d.ok) {
      console.error(`Gagal pada pengiriman ke-${i}:`, d);
    }
  }

  // Kirim aduan ke-6 dari IP yang sama
  const formSpam6 = new FormData();
  formSpam6.append('nama_pelapor', 'Pelapor Spam 6');
  formSpam6.append('no_telepon', '081234567890');
  formSpam6.append('deskripsi_lokasi', 'Lokasi penanganan sampah pengujian ke-6');
  formSpam6.append('tps_id', tpsIds[5] || defaultTpsId);
  formSpam6.append('foto', new Blob([VALID_PNG_BYTES], { type: 'image/png' }), 'foto.png');
  formSpam6.append('cf-turnstile-response', 'XXXX.DUMMY.TOKEN.XXXX');

  const resSpam6 = await fetch(`${BASE_URL}/api/aduan`, {
    method: 'POST',
    body: formSpam6,
    headers: { 'x-forwarded-for': spamIp },
  });
  const dataSpam6 = await resSpam6.json();

  if (resSpam6.status === 429) {
    console.log(`[PASS] Aduan ke-6 dari IP sama berhasil ditolak dengan HTTP 429: "${dataSpam6.message}"`);
  } else {
    console.error('[FAIL] Rate limit 5 aduan/jam tidak memblokir pengiriman ke-6:', resSpam6.status, dataSpam6);
    process.exit(1);
  }

  // ----------------------------------------------------
  // UAT 4: Cek Status Aduan (Kode Benar & Kode Salah)
  // ----------------------------------------------------
  console.log('\n--- UAT 4: Cek Status Aduan ---');

  // 4a: Kode Benar
  const resStatusOk = await fetch(`${BASE_URL}/api/cek-status?kode=${testTicketCode}`);
  const dataStatusOk = await resStatusOk.json();

  if (resStatusOk.status === 200 && dataStatusOk.found && dataStatusOk.aduan?.kode_tiket === testTicketCode) {
    console.log(`[PASS] Cek status kode tiket sah '${testTicketCode}' ditemukan.`);
    console.log(`       Status: ${dataStatusOk.aduan.status}, Dibuat: ${dataStatusOk.aduan.created_at}`);
    // Pastikan nama_pelapor dan no_telepon TIDAK ADA
    if (dataStatusOk.aduan.nama_pelapor || dataStatusOk.aduan.no_telepon) {
      console.error('[FAIL] Privasi bocor: nama atau no_telepon muncul di respon cek status!');
      process.exit(1);
    }
    console.log(`[PASS] Data sensitif pelapor (nama/telepon) terbukti aman dan tidak bocor ke publik.`);
  } else {
    console.error('[FAIL] Cek status kode benar gagal:', resStatusOk.status, dataStatusOk);
    process.exit(1);
  }

  // 4b: Kode Salah / Tidak Terdaftar (Layar 06b)
  const resStatusBad = await fetch(`${BASE_URL}/api/cek-status?kode=SLP-9999-NOTFOUND1`);
  const dataStatusBad = await resStatusBad.json();

  if (resStatusBad.status === 404 && !dataStatusBad.found) {
    console.log(`[PASS] Cek status kode salah menghasilkan HTTP 404 Layar 06b: "${dataStatusBad.message}"`);
  } else {
    console.error('[FAIL] Respon kode salah tidak sesuai:', resStatusBad.status, dataStatusBad);
    process.exit(1);
  }

  // ----------------------------------------------------
  // UAT 16: Anon Select Langsung ke Tabel Lewat REST
  // ----------------------------------------------------
  console.log('\n--- UAT 16: Anon Select Langsung ke Tabel Lewat REST ---');
  const { data: anonAduan, error: anonErr } = await anonClient.from('aduan').select('*');
  if (!anonErr && anonAduan && anonAduan.length === 0) {
    console.log(`[PASS] Anon REST select pada tabel 'aduan' mengembalikan 0 baris (RLS memblokir akses).`);
  } else {
    console.error('[FAIL] Anon berhasil membaca tabel aduan:', anonAduan);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('=== SEMUA SKENARIO UAT 1–4 DAN 16 LOLOS 100%!     ===');
  console.log('====================================================');
}

runUAT().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
