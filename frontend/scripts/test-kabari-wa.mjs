import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServerClient } from '@supabase/ssr';
import {
  formatWhatsAppNumber,
  isWhatsAppAvailable,
  generateWhatsAppAduanUrl,
} from '../src/lib/whatsapp.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Baca .env.local
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
const BASE_URL = 'http://localhost:3002';
const PASSWORD = 'PasswordKuningan2026!';

async function getKabidCookies() {
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

  return Array.from(cookieStore.entries())
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
}

async function runTests() {
  console.log('=== UAT: Tombol "Kabari WA" 1-Klik Modul Kabid ===\n');

  // 1. Uji Normalisasi Nomor WhatsApp
  console.log('[1] Menguji normalisasi nomor telepon ke format internasional WhatsApp:');
  const testCases = [
    { input: '081234567890', expected: '6281234567890' },
    { input: '+6281234567890', expected: '6281234567890' },
    { input: '6281234567890', expected: '6281234567890' },
    { input: '0812-3456-7890', expected: '6281234567890' },
    { input: '080000000000', expected: null }, // Anonim UU PDP tidak boleh dikirimi WA
    { input: null, expected: null },
    { input: '', expected: null },
    { input: '123', expected: null }, // Nomor tidak valid
  ];

  for (const tc of testCases) {
    const actual = formatWhatsAppNumber(tc.input);
    if (actual !== tc.expected) {
      throw new Error(`Format WA gagal untuk input "${tc.input}": didapat "${actual}", ekspektasi "${tc.expected}"`);
    }
    console.log(`    ✓ Input "${tc.input}" -> "${actual}"`);
  }

  // 2. Uji Helper isWhatsAppAvailable
  console.log('\n[2] Menguji ketersediaan tombol WhatsApp:');
  if (!isWhatsAppAvailable('081234567890')) {
    throw new Error('Nomor HP warga valid harusnya available');
  }
  if (isWhatsAppAvailable('080000000000')) {
    throw new Error('Nomor dummy anonim UU PDP tidak boleh available');
  }
  if (isWhatsAppAvailable(null)) {
    throw new Error('Nomor null tidak boleh available');
  }
  console.log('    ✓ isWhatsAppAvailable validasi sukses.');

  // 3. Uji Pembuatan Pesan WhatsApp Otomatis yang Rapi
  console.log('\n[3] Menguji format pesan otomatis WhatsApp:');
  const waUrl = generateWhatsAppAduanUrl({
    phone: '081234567890',
    namaPelapor: 'Budi Santoso',
    kodeTiket: 'SLP-2611-TEST1234',
    status: 'diproses',
    catatan: 'Armada Truk Dump No. Plat E 8001 YA sedang meluncur ke lokasi.',
    origin: 'http://localhost:3002',
  });

  if (!waUrl || !waUrl.startsWith('https://wa.me/6281234567890?text=')) {
    throw new Error('Format wa.me URL salah: ' + waUrl);
  }

  const decodedMessage = decodeURIComponent(waUrl.replace('https://wa.me/6281234567890?text=', ''));
  console.log('--- Isi Pesan Otomatis WhatsApp ---');
  console.log(decodedMessage);
  console.log('-----------------------------------');

  if (!decodedMessage.includes('Budi Santoso')) throw new Error('Pesan harus memuat nama pelapor');
  if (!decodedMessage.includes('SLP-2611-TEST1234')) throw new Error('Pesan harus memuat kode tiket');
  if (!decodedMessage.includes('Sedang Diproses')) throw new Error('Pesan harus memuat label status');
  if (!decodedMessage.includes('Armada Truk Dump')) throw new Error('Pesan harus memuat catatan petugas');
  if (!decodedMessage.includes('http://localhost:3002/cek-status?kode=SLP-2611-TEST1234')) {
    throw new Error('Pesan harus memuat tautan pelacakan resmi');
  }
  console.log('    ✓ Struktur pesan otomatis terverifikasi lengkap dan rapi.');

  // 4. Uji Render Live di Halaman /kabid/aduan
  console.log('\n[4] Menguji render tombol "Kabari WA" di server live (/kabid/aduan)...');
  const cookieHeader = await getKabidCookies();
  const res = await fetch(`${BASE_URL}/kabid/aduan`, {
    headers: { Cookie: cookieHeader },
  });

  if (!res.ok) {
    throw new Error(`/kabid/aduan mengembalikan status HTTP ${res.status}`);
  }

  const html = await res.text();
  if (!html.includes('Kabari WA') || !html.includes('https://wa.me/')) {
    throw new Error('Tombol "Kabari WA" tidak ditemukan pada markup halaman /kabid/aduan');
  }
  console.log('    ✓ Tombol "Kabari WA" berhasil ter-render pada daftar aduan Kabid.');

  console.log('\n======================================================');
  console.log('🎉 SEMUA PENGUJIAN TOMBOL "KABARI WA" 1-KLIK BERHASIL 100%! 🎉');
  console.log('======================================================');
}

runTests().catch((err) => {
  console.error('\nTEST GAGAL:', err.message);
  process.exit(1);
});
