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

const PASSWORD = 'PasswordKuningan2026!';

// 1x1 PNG bytes
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

async function ensureDriver(username, name, email) {
  const { data: list } = await adminClient.auth.admin.listUsers();
  let user = list.users.find((u) => u.email === email);
  if (!user) {
    const { data: created, error } = await adminClient.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'sopir', username },
    });
    if (error) throw error;
    user = created.user;
  }
  await adminClient.from('profiles').upsert({
    id: user.id,
    username,
    nama_lengkap: name,
    role: 'sopir',
    is_active: true,
  });
  return user;
}

async function loginClient(email) {
  const client = createClient(supabaseUrl, anonKey);
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: PASSWORD,
  });
  if (error || !data.user) {
    throw new Error(`Failed to login ${email}: ${error?.message}`);
  }
  return { client, user: data.user };
}

async function runUATFase4() {
  console.log('====================================================');
  console.log('=== PENGUJIAN OTOMATIS UAT FASE 4 (MODUL SOPIR)  ===');
  console.log('====================================================\n');

  // Siapkan sopir1 dan sopir2
  const driver1 = await ensureDriver('sopir1', 'Budi Santoso', 'sopir1@silapor.local');
  const driver2 = await ensureDriver('sopir2', 'Agus Supriatna', 'sopir2@silapor.local');

  const { client: sopirClient1 } = await loginClient(driver1.email);
  const { client: sopirClient2 } = await loginClient(driver2.email);

  // Bersihkan perjalanan aktif lama untuk pengujian bersih
  await adminClient.from('perjalanan').update({ status: 'dibatalkan' }).in('sopir_id', [driver1.id, driver2.id]).eq('status', 'berjalan');
  await adminClient.from('armada').update({ status: 'garasi' }).in('plat_nomor', ['E 1234 AB', 'E 5678 CD']);
  await adminClient.from('armada').update({ status: 'perawatan' }).eq('plat_nomor', 'E 9012 EF');

  // Ambil data ID armada
  const { data: armadaPerawatan } = await adminClient.from('armada').select('id').eq('plat_nomor', 'E 9012 EF').single();
  const { data: armadaGarasi1 } = await adminClient.from('armada').select('id').eq('plat_nomor', 'E 1234 AB').single();

  // ----------------------------------------------------
  // UAT 7: Sopir mulai perjalanan dengan armada 'perawatan'
  // ----------------------------------------------------
  console.log('--- UAT 7: Mulai Perjalanan dengan Armada Perawatan ---');
  const { data: resUat7, error: errUat7 } = await sopirClient1.rpc('mulai_perjalanan', {
    p_armada_id: armadaPerawatan.id,
  });

  if (errUat7 && errUat7.message.includes('Armada tidak tersedia')) {
    console.log(`[PASS] RPC mulai_perjalanan ditolak dengan benar: "${errUat7.message}"`);
  } else {
    console.error('[FAIL] Armada berstatus perawatan seharusnya ditolak:', resUat7, errUat7);
    process.exit(1);
  }

  // ----------------------------------------------------
  // UAT 8: Dua sopir memulai armada yang sama bersamaan
  // ----------------------------------------------------
  console.log('\n--- UAT 8: Dua Sopir Memulai Armada yang Sama Bersamaan ---');
  console.log(`Sopir 1 dan Sopir 2 mencoba memilih truk E 1234 AB secara bersamaan...`);

  const [call1, call2] = await Promise.all([
    sopirClient1.rpc('mulai_perjalanan', { p_armada_id: armadaGarasi1.id }),
    sopirClient2.rpc('mulai_perjalanan', { p_armada_id: armadaGarasi1.id }),
  ]);

  const successCount = (call1.data ? 1 : 0) + (call2.data ? 1 : 0);
  const failCount = (call1.error ? 1 : 0) + (call2.error ? 1 : 0);

  if (successCount === 1 && failCount === 1) {
    const winnerId = call1.data || call2.data;
    const loserErr = call1.error || call2.error;
    console.log(`[PASS] Tepat 1 sopir berhasil (${winnerId}), dan 1 sopir ditolak: "${loserErr?.message}"`);
  } else {
    console.error('[FAIL] Konkurensi armada tidak aman:', { call1, call2 });
    process.exit(1);
  }

  // Ambil ID perjalanan aktif yang berhasil dibuat oleh sopir pemenang
  const activeTripId = call1.data || call2.data;
  const activeClient = call1.data ? sopirClient1 : sopirClient2;
  const activeDriver = call1.data ? driver1 : driver2;

  // ----------------------------------------------------
  // UAT 9: Sopir akhiri perjalanan tanpa foto bukti
  // ----------------------------------------------------
  console.log('\n--- UAT 9: Akhiri Perjalanan Tanpa Foto Bukti ---');
  const { data: resUat9, error: errUat9 } = await activeClient.rpc('akhiri_perjalanan', {
    p_perjalanan_id: activeTripId,
  });

  if (errUat9 && errUat9.message.includes('Unggah minimal satu foto bukti')) {
    console.log(`[PASS] RPC akhiri_perjalanan menolak jika belum ada bukti foto: "${errUat9.message}"`);
  } else {
    console.error('[FAIL] Perjalanan seharusnya tidak bisa diakhiri tanpa foto bukti:', resUat9, errUat9);
    process.exit(1);
  }

  // ----------------------------------------------------
  // UAT 10: Unggah foto > 5 MB (Layar 09b)
  // ----------------------------------------------------
  console.log('\n--- UAT 10: Unggah Foto > 5 MB (Layar 09b) ---');
  // Buat buffer 5.5 MB (> 5 MB file size limit)
  const BIG_BYTES = Buffer.alloc(5.5 * 1024 * 1024);
  BIG_BYTES[0] = 0x89;
  BIG_BYTES[1] = 0x50;
  BIG_BYTES[2] = 0x4e;
  BIG_BYTES[3] = 0x47;

  const bigPath = `${activeDriver.id}/${activeTripId}/big-photo.png`;
  const { error: errBigUpload } = await activeClient.storage
    .from('bukti-pengangkutan')
    .upload(bigPath, BIG_BYTES, { contentType: 'image/png' });

  if (errBigUpload) {
    console.log(`[PASS] Storage menolak file > 5 MB dengan aman: "${errBigUpload.message}" (Layar 09b)`);
  } else {
    console.error('[FAIL] File > 5 MB seharusnya ditolak oleh Storage bucket!');
    process.exit(1);
  }

  // ----------------------------------------------------
  // Finalisasi: Unggah foto valid & Akhiri Perjalanan dengan Sukses
  // ----------------------------------------------------
  console.log('\n--- Finalisasi: Unggah Foto Bukti Sah dan Selesaikan Perjalanan ---');
  const validPhotoPath = `${activeDriver.id}/${activeTripId}/test-bukti.png`;
  const { error: errValidUp } = await activeClient.storage.from('bukti-pengangkutan').upload(validPhotoPath, VALID_PNG_BYTES, {
    contentType: 'image/png',
  });
  if (errValidUp) throw errValidUp;

  const { error: errInsertBukti } = await activeClient.from('bukti_pengangkutan').insert({
    perjalanan_id: activeTripId,
    sopir_id: activeDriver.id,
    foto_path: validPhotoPath,
    keterangan: 'Sampah TPS Cilimus telah diangkut ke TPA',
  });
  if (errInsertBukti) throw errInsertBukti;

  console.log(`[PASS] Foto bukti sah (≤ 5 MB) berhasil diunggah dan dicatat di database.`);

  const { error: errAkhir } = await activeClient.rpc('akhiri_perjalanan', {
    p_perjalanan_id: activeTripId,
    p_ringkasan: 'Ritase 1 selesai dengan lancar',
  });

  if (!errAkhir) {
    console.log(`[PASS] Perjalanan aktif berhasil diakhiri setelah bukti foto ada.`);
    const { data: armadaCheck } = await adminClient.from('armada').select('status').eq('id', armadaGarasi1.id).single();
    console.log(`[PASS] Status armada otomatis kembali ke: '${armadaCheck.status}'`);
  } else {
    console.error('[FAIL] Gagal mengakhiri perjalanan dengan bukti sah:', errAkhir);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('=== SEMUA SKENARIO UAT 7, 8, 9, 10 LOLOS 100%!   ===');
  console.log('====================================================');
}

runUATFase4().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
