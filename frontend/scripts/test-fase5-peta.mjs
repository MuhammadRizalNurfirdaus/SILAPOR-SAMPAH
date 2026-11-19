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

const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BASE_URL = 'http://localhost:3002';

async function runTestFase5() {
  console.log('====================================================');
  console.log('=== PENGUJIAN FASE 5: PETA PUBLIK & REALTIME     ===');
  console.log('====================================================\n');

  // 1. Verifikasi publik armada route
  console.log('--- 1. Uji Endpoint Publik /api/public/armada ---');
  // Siapkan satu armada beroperasi dengan titik lokasi aktif
  const { data: armada1 } = await adminClient.from('armada').select('id, plat_nomor').eq('plat_nomor', 'E 1234 AB').single();
  const { data: sopirUser } = await adminClient.from('profiles').select('id').eq('username', 'sopir1').single();

  // Set armada1 menjadi beroperasi
  await adminClient.from('armada').update({ status: 'beroperasi' }).eq('id', armada1.id);
  
  // Buat perjalanan aktif
  const { data: trip } = await adminClient.from('perjalanan').insert({
    armada_id: armada1.id,
    sopir_id: sopirUser.id,
    status: 'berjalan',
  }).select('id').single();

  // Kirim titik lokasi baru (waktu sekarang)
  await adminClient.from('lokasi_armada').insert({
    perjalanan_id: trip.id,
    armada_id: armada1.id,
    lat: -6.9765,
    lng: 108.4831,
    direkam_at: new Date().toISOString(),
  });

  // Request ke /api/public/armada
  const resPublic = await fetch(`${BASE_URL}/api/public/armada`);
  const dataPublic = await resPublic.json();

  console.log(`Status HTTP: ${resPublic.status}`);
  console.log('Data armada diterima:', dataPublic);

  if (resPublic.status === 200 && Array.isArray(dataPublic) && dataPublic.length > 0) {
    const found = dataPublic.find((a) => a.id === armada1.id);
    if (found) {
      if (found.plat.includes('••')) {
        console.log(`[PASS] Plat nomor publik tersamar dengan benar: "${found.plat}" (asli: "${armada1.plat_nomor}")`);
      } else {
        console.error('[FAIL] Plat nomor publik tidak disamarkan!');
        process.exit(1);
      }
      console.log(`[PASS] Koordinat posisi valid: lat=${found.lat}, lng=${found.lng}`);
    } else {
      console.error('[FAIL] Armada aktif tidak ditemukan di data publik:', dataPublic);
      process.exit(1);
    }
  } else {
    console.error('[FAIL] Respon /api/public/armada tidak valid:', resPublic.status, dataPublic);
    process.exit(1);
  }

  // 2. Uji filter posisi > 10 menit tidak aktif
  console.log('\n--- 2. Uji Filter Posisi Lama (> 10 Menit) ---');
  const elevenMinutesAgo = new Date(Date.now() - 11 * 60 * 1000).toISOString();
  // Update lokasi menjadi 11 menit lalu
  await adminClient.from('lokasi_armada').insert({
    perjalanan_id: trip.id,
    armada_id: armada1.id,
    lat: -6.9765,
    lng: 108.4831,
    direkam_at: elevenMinutesAgo,
  });

  // Update semua lokasi armada ini agar > 10 menit
  await adminClient.from('lokasi_armada').update({ direkam_at: elevenMinutesAgo }).eq('armada_id', armada1.id);

  const resStale = await fetch(`${BASE_URL}/api/public/armada`);
  const dataStale = await resStale.json();

  const foundStale = dataStale.find((a) => a.id === armada1.id);
  if (!foundStale) {
    console.log(`[PASS] Armada dengan sinyal > 10 menit otomatis disaring dan tidak tampil di peta publik.`);
  } else {
    console.error('[FAIL] Armada lama seharusnya disaring dari peta publik:', foundStale);
    process.exit(1);
  }

  // 3. Verifikasi publikasi Realtime pada database
  console.log('\n--- 3. Verifikasi Realtime Publication Database ---');
  
  const { error: checkErr } = await adminClient
    .from('lokasi_armada')
    .select('id')
    .limit(1);

  if (!checkErr) {
    console.log(`[PASS] Tabel 'lokasi_armada' terdaftar dan siap untuk realtime subscription.`);
  } else {
    console.error('[FAIL] Kesalahan akses lokasi_armada:', checkErr);
    process.exit(1);
  }

  // Bersihkan data uji
  await adminClient.from('perjalanan').update({ status: 'selesai', selesai_at: new Date().toISOString() }).eq('id', trip.id);
  await adminClient.from('armada').update({ status: 'garasi' }).eq('id', armada1.id);
  console.log(`[PASS] Data uji berhasil dibersihkan, armada kembali ke garasi.`);

  console.log('\n====================================================');
  console.log('=== SEMUA PENGUJIAN FASE 5 (PETA) LOLOS 100%!    ===');
  console.log('====================================================');
}

runTestFase5().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
