import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

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
const BASE_URL = 'http://localhost:3002';
const PASSWORD = 'PasswordKuningan2026!';

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('=== UAT FASE 6: MODUL KABID (UAT 11 & 12) ===\n');

  // 1. Pastikan akun Kabid siap dan login
  console.log('--- Step 1: Login sebagai Kabid ---');
  const kabidClient = createClient(supabaseUrl, anonKey);
  const { data: authData, error: loginErr } = await kabidClient.auth.signInWithPassword({
    email: 'kabid@silapor.local',
    password: PASSWORD,
  });

  if (loginErr || !authData.user) {
    throw new Error('Gagal login sebagai kabid: ' + (loginErr?.message || 'No user'));
  }
  const kabidUser = authData.user;
  console.log(`✓ Kabid login sukses: ${kabidUser.id} (${kabidUser.email})`);

  // 2. Buat aduan uji coba
  console.log('\n--- Step 2: Buat aduan uji coba ---');
  const { data: ticketCode, error: ticketErr } = await adminClient.rpc('generate_kode_tiket');
  if (ticketErr || !ticketCode) {
    throw new Error('Gagal generate kode tiket: ' + (ticketErr?.message || 'No code'));
  }
  const testTicket = ticketCode;

  const { data: aduanData, error: aduanErr } = await adminClient
    .from('aduan')
    .insert({
      kode_tiket: testTicket,
      nama_pelapor: 'Warga Penguji UAT 11',
      no_telepon: '081234567890',
      deskripsi_lokasi: 'Tumpukan sampah pasar dekat trotoar Jl. Siliwangi',
      foto_path: 'aduan/test/sample.jpg',
      status: 'baru',
    })
    .select()
    .single();

  if (aduanErr || !aduanData) {
    throw new Error('Gagal membuat aduan uji: ' + (aduanErr?.message || 'No data'));
  }
  console.log(`✓ Aduan dibuat dengan ID: ${aduanData.id}, Tiket: ${testTicket}, Status awal: ${aduanData.status}`);

  // 3. UAT 11: Kabid merespon aduan dengan tampil_ke_publik = true
  console.log('\n--- Step 3: [UAT 11] Kabid kirim respon (tampil ke publik) ---');
  const { data: resp1, error: resp1Err } = await kabidClient.from('respon_aduan').insert({
    aduan_id: aduanData.id,
    petugas_id: kabidUser.id,
    status_baru: 'diproses',
    catatan: 'Armada Dump Truck E 1234 AB telah ditugaskan menuju lokasi aduan.',
    tampil_ke_publik: true,
  }).select().single();

  if (resp1Err) {
    throw new Error('Gagal menyimpan respon aduan sebagai kabid: ' + resp1Err.message);
  }
  console.log('✓ Respon 1 berhasil disimpan:', resp1.catatan);

  // Verifikasi trigger database memperbarui status aduan
  const { data: aduanAfter1 } = await adminClient
    .from('aduan')
    .select('status, ditangani_oleh')
    .eq('id', aduanData.id)
    .single();

  if (aduanAfter1.status !== 'diproses') {
    throw new Error(`FAIL: Status aduan seharusnya 'diproses', tetapi '${aduanAfter1.status}'`);
  }
  if (aduanAfter1.ditangani_oleh !== kabidUser.id) {
    throw new Error(`FAIL: ditangani_oleh seharusnya kabid, tetapi '${aduanAfter1.ditangani_oleh}'`);
  }
  console.log(`✓ Trigger database berhasil: status aduan berubah menjadi '${aduanAfter1.status}', ditangani oleh Kabid`);

  // Verifikasi muncul di cek status publik
  console.log('\n--- Step 4: [UAT 11] Verifikasi cek status publik melihat respon publik ---');
  const cekRes1 = await fetch(`${BASE_URL}/api/cek-status?kode=${encodeURIComponent(testTicket)}`);

  if (!cekRes1.ok) {
    throw new Error(`FAIL: /api/cek-status return status ${cekRes1.status}`);
  }
  const cekJson1 = await cekRes1.json();
  const aduanPublik1 = cekJson1.aduan;
  if (!aduanPublik1 || aduanPublik1.status !== 'diproses') {
    throw new Error(`FAIL: Cek status publik menampilkan '${aduanPublik1?.status}', harusnya 'diproses'`);
  }
  const foundResp1 = (aduanPublik1.respon || []).some((r) => r.catatan.includes('Armada Dump Truck'));
  if (!foundResp1) {
    throw new Error('FAIL: Respon publik tidak muncul di hasil cek status warga');
  }
  console.log('✓ Respon publik berhasil tampil pada pengecekan warga');

  // Step 5: Kabid kirim respon internal (tampil_ke_publik = false)
  console.log('\n--- Step 5: [UAT 11] Kabid kirim respon internal (tampil_ke_publik = false) ---');
  const { error: resp2Err } = await kabidClient.from('respon_aduan').insert({
    aduan_id: aduanData.id,
    petugas_id: kabidUser.id,
    status_baru: 'selesai',
    catatan: 'CATATAN INTERNAL RAHASIA: Pengangkutan selesai oleh tim piket.',
    tampil_ke_publik: false,
  });

  if (resp2Err) {
    throw new Error('Gagal simpan respon internal: ' + resp2Err.message);
  }

  // Verifikasi status aduan jadi 'selesai'
  const { data: aduanAfter2 } = await adminClient
    .from('aduan')
    .select('status')
    .eq('id', aduanData.id)
    .single();

  if (aduanAfter2.status !== 'selesai') {
    throw new Error(`FAIL: Status aduan seharusnya 'selesai', tetapi '${aduanAfter2.status}'`);
  }
  console.log(`✓ Status aduan berubah menjadi '${aduanAfter2.status}'`);

  // Verifikasi catatan internal TIDAK bocor ke publik
  const cekRes2 = await fetch(`${BASE_URL}/api/cek-status?kode=${encodeURIComponent(testTicket)}`);
  const cekJson2 = await cekRes2.json();
  const aduanPublik2 = cekJson2.aduan;
  const leakedInternal = (aduanPublik2?.respon || []).some((r) => r.catatan.includes('INTERNAL RAHASIA'));
  if (leakedInternal) {
    throw new Error('SECURITY VIOLATION: Catatan internal bocor ke portal cek status publik!');
  }
  console.log('✓ Keamanan terjamin: Catatan internal tidak bocor ke publik.');
  console.log('>>> UAT 11: LULUS (PASS) <<<\n');

  // 6. UAT 12: Ekspor Excel
  console.log('--- Step 6: [UAT 12] Ekspor Excel tanpa auth -> harus 401 ---');
  const unauthRes = await fetch(`${BASE_URL}/api/laporan?jenis=aduan&from=2026-11-01&to=2026-11-30`);
  if (unauthRes.status !== 401) {
    throw new Error(`FAIL: Harusnya 401 unauth, dapat ${unauthRes.status}`);
  }
  console.log('✓ Akses tanpa auth ditolak (401 Unauthorized)');

  // Buat auth cookie lewat @supabase/ssr untuk request ke server
  const cookieStore = new Map();
  const ssrClient = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value));
      },
    },
  });

  await ssrClient.auth.signInWithPassword({
    email: 'kabid@silapor.local',
    password: PASSWORD,
  });

  const cookieHeader = Array.from(cookieStore.entries())
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('; ');

  console.log('\n--- Step 7: [UAT 12] Ekspor Excel rentang terbalik (from > to) -> Layar 15b ---');
  const reversedRes = await fetch(
    `${BASE_URL}/api/laporan?jenis=aduan&from=2026-11-30&to=2026-11-01`,
    {
      headers: {
        Cookie: cookieHeader,
      },
    }
  );

  if (reversedRes.status !== 400) {
    throw new Error(`FAIL: Harusnya 400 untuk rentang terbalik, dapat ${reversedRes.status}`);
  }
  const reversedJson = await reversedRes.json();
  if (!reversedJson.error || !reversedJson.error.includes('tidak boleh lebih baru')) {
    throw new Error(`FAIL: Pesan error tidak sesuai: ${reversedJson.error}`);
  }
  console.log(`✓ Rentang terbalik ditolak (400): "${reversedJson.error}"`);

  console.log('\n--- Step 8: [UAT 12] Ekspor Excel tanpa data (rentang kosong) -> Layar 15b ---');
  const emptyRes = await fetch(
    `${BASE_URL}/api/laporan?jenis=aduan&from=2019-01-01&to=2019-01-02`,
    {
      headers: {
        Cookie: cookieHeader,
      },
    }
  );

  if (emptyRes.status !== 404) {
    throw new Error(`FAIL: Harusnya 404 untuk data kosong, dapat ${emptyRes.status}`);
  }
  const emptyJson = await emptyRes.json();
  if (!emptyJson.error || !emptyJson.error.includes('Tidak ada data')) {
    throw new Error(`FAIL: Pesan error tidak sesuai: ${emptyJson.error}`);
  }
  console.log(`✓ Data kosong ditolak (404): "${emptyJson.error}"`);

  console.log('\n--- Step 9: [UAT 12] Ekspor Excel rentang valid -> File .xlsx terunduh ---');
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const validRes = await fetch(
    `${BASE_URL}/api/laporan?jenis=semua&from=2026-11-01&to=${todayStr}`,
    {
      headers: {
        Cookie: cookieHeader,
      },
    }
  );

  if (validRes.status !== 200) {
    const errText = await validRes.text();
    throw new Error(`FAIL: Ekspor sah gagal (status ${validRes.status}): ${errText}`);
  }

  const contentType = validRes.headers.get('content-type');
  if (!contentType || !contentType.includes('spreadsheetml')) {
    throw new Error(`FAIL: Content-Type tidak sesuai: ${contentType}`);
  }

  const disposition = validRes.headers.get('content-disposition');
  if (!disposition || !disposition.includes('attachment')) {
    throw new Error(`FAIL: Content-Disposition tidak sesuai: ${disposition}`);
  }

  const arrayBuf = await validRes.arrayBuffer();
  const fileBytes = Buffer.from(arrayBuf);
  // Zip/xlsx header magic number: 'PK\x03\x04' (0x50, 0x4B, 0x03, 0x04)
  if (fileBytes[0] !== 0x50 || fileBytes[1] !== 0x4b) {
    throw new Error('FAIL: Output bukan file Excel/ZIP yang valid');
  }

  console.log(`✓ File Excel berhasil diunduh!`);
  console.log(`  - Ukuran file: ${fileBytes.length} bytes`);
  console.log(`  - Content-Type: ${contentType}`);
  console.log(`  - Header Magic Bytes: PK (ZIP/XLSX valid)`);
  console.log(`  - Content-Disposition: ${disposition}`);
  console.log('>>> UAT 12: LULUS (PASS) <<<\n');

  console.log('==============================================');
  console.log('🎉 SEMUA SKENARIO UAT FASE 6 BERHASIL 100%! 🎉');
  console.log('==============================================');
}

main().catch((err) => {
  console.error('\n❌ ERROR DALAM PENGUJIAN:', err.message);
  process.exit(1);
});
