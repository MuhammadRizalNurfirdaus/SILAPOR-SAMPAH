import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Baca .env.local secara manual tanpa dependency eksternal
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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function runTest() {
  console.log('=== UAT: Retensi Data Identitas Warga (UU No. 27/2022 PDP) ===\n');

  // Siapkan tanggal-tanggal pengujian
  const now = new Date();
  const threeYearsAgo = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const testIds = [];

  try {
    // 1. Buat aduan kadaluwarsa (> 2 tahun, status selesai) -> HARUS DIANONIMKAN
    const kodeTiketOld = 'TKT-TEST-OLD-' + Math.floor(1000 + Math.random() * 9000);
    const { data: aduanOld, error: errOld } = await supabase
      .from('aduan')
      .insert({
        kode_tiket: kodeTiketOld,
        nama_pelapor: 'Budi Santoso Uji Retensi',
        no_telepon: '081234567899',
        deskripsi_lokasi: 'Lokasi Sampah Pengujian Retensi UU PDP',
        foto_path: 'aduan-foto/test.jpg',
        ip_hash: 'hash-test-ip-12345',
        status: 'selesai',
        updated_at: threeYearsAgo,
        created_at: threeYearsAgo,
      })
      .select()
      .single();

    if (errOld || !aduanOld) {
      throw new Error('Gagal membuat aduan kadaluwarsa: ' + errOld?.message);
    }
    testIds.push(aduanOld.id);
    console.log('[1] Berhasil membuat aduan selesai > 2 tahun:', aduanOld.kode_tiket);

    // 2. Buat aduan baru (< 2 tahun, status selesai) -> TIDAK BOLEH DIANONIMKAN
    const kodeTiketRecent = 'TKT-TEST-NEW-' + Math.floor(1000 + Math.random() * 9000);
    const { data: aduanRecent, error: errRecent } = await supabase
      .from('aduan')
      .insert({
        kode_tiket: kodeTiketRecent,
        nama_pelapor: 'Siti Warga Baru',
        no_telepon: '081987654321',
        deskripsi_lokasi: 'Lokasi Sampah Baru',
        foto_path: 'aduan-foto/test.jpg',
        ip_hash: 'hash-test-ip-recent',
        status: 'selesai',
        updated_at: oneMonthAgo,
        created_at: oneMonthAgo,
      })
      .select()
      .single();

    if (errRecent || !aduanRecent) {
      throw new Error('Gagal membuat aduan baru: ' + errRecent?.message);
    }
    testIds.push(aduanRecent.id);
    console.log('[2] Berhasil membuat aduan selesai baru (< 2 tahun):', aduanRecent.kode_tiket);

    // 3. Buat aduan lama tapi status masih 'diproses' -> TIDAK BOLEH DIANONIMKAN (hanya status 'selesai')
    const kodeTiketDiproses = 'TKT-TEST-PRC-' + Math.floor(1000 + Math.random() * 9000);
    const { data: aduanDiproses, error: errDiproses } = await supabase
      .from('aduan')
      .insert({
        kode_tiket: kodeTiketDiproses,
        nama_pelapor: 'Ahmad Masih Diproses',
        no_telepon: '081333333333',
        deskripsi_lokasi: 'Lokasi Sampah Lama Diproses',
        foto_path: 'aduan-foto/test.jpg',
        ip_hash: 'hash-test-ip-diproses',
        status: 'diproses',
        updated_at: threeYearsAgo,
        created_at: threeYearsAgo,
      })
      .select()
      .single();

    if (errDiproses || !aduanDiproses) {
      throw new Error('Gagal membuat aduan lama diproses: ' + errDiproses?.message);
    }
    testIds.push(aduanDiproses.id);
    console.log('[3] Berhasil membuat aduan lama status diproses:', aduanDiproses.kode_tiket);

    // 4. Jalankan RPC anonimkan_aduan_kadaluwarsa(2)
    console.log('\n[4] Menjalankan fungsi anonimkan_aduan_kadaluwarsa(2)...');
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('anonimkan_aduan_kadaluwarsa', {
      p_tahun: 2,
    });

    if (rpcErr) {
      throw new Error('Gagal memanggil RPC anonimkan_aduan_kadaluwarsa: ' + rpcErr.message);
    }

    const dianonimkan = rpcRes && rpcRes.length > 0 ? rpcRes[0].jumlah_dianonimkan : 0;
    console.log(`    Jumlah baris dianonimkan: ${dianonimkan}`);
    if (dianonimkan < 1) {
      throw new Error('Ekspektasi minimal 1 baris dianonimkan, tapi didapat 0');
    }

    // 5. Verifikasi aduan lama (> 2 thn, selesai) -> Telah Dianonimkan
    const { data: checkOld } = await supabase.from('aduan').select('*').eq('id', aduanOld.id).single();
    console.log('\n[5] Verifikasi aduan lama setelah pembersihan:');
    console.log('    Nama Pelapor:', checkOld.nama_pelapor, '(Harus: Masyarakat (Anonim UU PDP))');
    console.log('    No. Telepon:', checkOld.no_telepon, '(Harus: 080000000000)');
    console.log('    IP Hash:', checkOld.ip_hash, '(Harus: null)');

    if (
      checkOld.nama_pelapor !== 'Masyarakat (Anonim UU PDP)' ||
      checkOld.no_telepon !== '080000000000' ||
      checkOld.ip_hash !== null
    ) {
      throw new Error('Data aduan lama TIDAK sesuai standar anonimisasi UU PDP!');
    }
    console.log('    -> PASSED: Data pribadi warga berhasil dianonimkan.');

    // 6. Verifikasi aduan baru (< 2 thn, selesai) -> TIDAK DIUBAH
    const { data: checkRecent } = await supabase.from('aduan').select('*').eq('id', aduanRecent.id).single();
    console.log('\n[6] Verifikasi aduan baru (< 2 thn):');
    console.log('    Nama Pelapor:', checkRecent.nama_pelapor);
    console.log('    No. Telepon:', checkRecent.no_telepon);
    if (checkRecent.nama_pelapor !== 'Siti Warga Baru' || checkRecent.no_telepon !== '081987654321') {
      throw new Error('Aduan baru tidak seharusnya diubah!');
    }
    console.log('    -> PASSED: Aduan baru tidak terpengaruh.');

    // 7. Verifikasi aduan lama tapi status diproses -> TIDAK DIUBAH
    const { data: checkDiproses } = await supabase.from('aduan').select('*').eq('id', aduanDiproses.id).single();
    console.log('\n[7] Verifikasi aduan lama status diproses:');
    console.log('    Nama Pelapor:', checkDiproses.nama_pelapor);
    if (checkDiproses.nama_pelapor !== 'Ahmad Masih Diproses') {
      throw new Error('Aduan berstatus diproses tidak seharusnya dianonimkan!');
    }
    console.log('    -> PASSED: Hanya aduan berstatus selesai yang dianonimkan.');

    // 8. Verifikasi Audit Log
    const { data: auditLogs } = await supabase
      .from('audit_log')
      .select('*')
      .eq('aksi', 'aduan.retensi_uupdp')
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('\n[8] Verifikasi Audit Log:');
    if (!auditLogs || auditLogs.length === 0) {
      throw new Error('Audit log untuk retensi UU PDP tidak ditemukan!');
    }
    console.log('    Aksi:', auditLogs[0].aksi);
    console.log('    Detail:', JSON.stringify(auditLogs[0].detail));
    console.log('    -> PASSED: Audit log kepatuhan tercatat dengan baik.');

    // 9. Uji Idempotensi: Panggil lagi, harus return 0 karena data sudah dianonimkan
    console.log('\n[9] Menguji idempotensi (eksekusi ulang)...');
    const { data: rpcRes2 } = await supabase.rpc('anonimkan_aduan_kadaluwarsa', { p_tahun: 2 });
    const count2 = rpcRes2 && rpcRes2.length > 0 ? rpcRes2[0].jumlah_dianonimkan : 0;
    console.log(`    Jumlah baris dianonimkan putaran 2: ${count2}`);
    if (count2 !== 0) {
      throw new Error('Idempotensi gagal: baris yang sudah dianonimkan diproses kembali!');
    }
    console.log('    -> PASSED: Idempotensi terbukti bekerja.');

    // 10. Uji Endpoint Cron (/api/cron/retensi)
    console.log('\n[10] Menguji Route Handler Cron (/api/cron/retensi)...');
    const resCron = await fetch('http://localhost:3002/api/cron/retensi');
    const jsonCron = await resCron.json();
    console.log('    Response Cron:', JSON.stringify(jsonCron));
    if (!jsonCron.success) {
      throw new Error('Route handler cron mengembalikan status gagal: ' + JSON.stringify(jsonCron));
    }
    console.log('    -> PASSED: Route handler cron berjalan sukses.');

    console.log('\n======================================================');
    console.log('SEMUA PENGUJIAN RETENSI DATA IDENTITAS WARGA (UU PDP) BERHASIL 100%!');
    console.log('======================================================');
  } finally {
    // Pembersihan data uji
    if (testIds.length > 0) {
      console.log('\nMembersihkan data pengujian...');
      await supabase.from('aduan').delete().in('id', testIds);
      console.log('Data uji berhasil dibersihkan.');
    }
  }
}

runTest().catch((err) => {
  console.error('\nTEST GAGAL:', err.message);
  process.exit(1);
});
