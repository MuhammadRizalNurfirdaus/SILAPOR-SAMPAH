import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
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

if (!supabaseUrl || !serviceKey || !anonKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(supabaseUrl, anonKey);

const TEST_PASSWORD = 'PasswordKuningan2026!';

const USERS = [
  {
    username: 'admin',
    nama_lengkap: 'Administrator DLH',
    role: 'admin',
    email: 'admin@silapor.local',
  },
  {
    username: 'kabid',
    nama_lengkap: 'Kepala Bidang Pengelolaan Sampah',
    role: 'kabid',
    email: 'kabid@silapor.local',
  },
  {
    username: 'sopir1',
    nama_lengkap: 'Budi Santoso',
    role: 'sopir',
    email: 'sopir1@silapor.local',
  },
];

async function seedUser(u) {
  console.log(`\n--- Seeding user: ${u.username} (${u.role}) ---`);
  // Cek apakah user auth sudah ada
  const { data: listData } = await adminClient.auth.admin.listUsers();
  let existingUser = listData.users.find((x) => x.email === u.email);

  if (!existingUser) {
    console.log(`Creating auth user ${u.email}...`);
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email: u.email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { role: u.role, username: u.username },
    });
    if (createErr) throw createErr;
    existingUser = newUser.user;
  } else {
    console.log(`Auth user ${u.email} already exists (id: ${existingUser.id}), updating password...`);
    await adminClient.auth.admin.updateUserById(existingUser.id, {
      password: TEST_PASSWORD,
      email_confirm: true,
    });
  }

  // Upsert profile
  const { error: profErr } = await adminClient.from('profiles').upsert({
    id: existingUser.id,
    username: u.username,
    nama_lengkap: u.nama_lengkap,
    role: u.role,
    is_active: true,
  });

  if (profErr) throw profErr;
  console.log(`Profile for ${u.username} upserted successfully.`);
  return existingUser;
}

async function testLogin(username, password) {
  const email = `${username.trim().toLowerCase()}@silapor.local`;
  const { data, error } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { ok: false, error: 'Username atau password salah' };
  }

  // Ambil profil
  const { data: p } = await anonClient
    .from('profiles')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single();

  await anonClient.auth.signOut();

  if (!p || !p.is_active) {
    return { ok: false, error: 'Username atau password salah' };
  }

  return { ok: true, role: p.role };
}

async function run() {
  console.log('=== FASE 2: UJI AUTENTIKASI DAN GUARD PERAN ===');

  for (const u of USERS) {
    await seedUser(u);
  }

  console.log('\n--- UJI LOGIN DENGAN 3 AKUN PERAN ---');
  for (const u of USERS) {
    const res = await testLogin(u.username, TEST_PASSWORD);
    if (res.ok && res.role === u.role) {
      console.log(`[PASS] Login '${u.username}' berhasil -> peran: '${res.role}'`);
    } else {
      console.error(`[FAIL] Login '${u.username}' gagal:`, res);
      process.exit(1);
    }
  }

  console.log('\n--- UJI KREDENSIAL TIDAK VALID (Layar 01b) ---');
  const wrongPass = await testLogin('admin', 'wrong_pass');
  if (!wrongPass.ok && wrongPass.error === 'Username atau password salah') {
    console.log(`[PASS] Password salah menghasilkan pesan generik: "${wrongPass.error}"`);
  } else {
    console.error(`[FAIL] Respon password salah tidak sesuai:`, wrongPass);
    process.exit(1);
  }

  const wrongUser = await testLogin('usernametidakada', TEST_PASSWORD);
  if (!wrongUser.ok && wrongUser.error === 'Username atau password salah') {
    console.log(`[PASS] Username tidak ada menghasilkan pesan generik: "${wrongUser.error}"`);
  } else {
    console.error(`[FAIL] Respon username tidak ada tidak sesuai:`, wrongUser);
    process.exit(1);
  }

  console.log('\n--- UJI PENGGUNA NONAKTIF ---');
  // Nonaktifkan sopir1 sementara
  const { data: sopirProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('username', 'sopir1')
    .single();

  await adminClient.from('profiles').update({ is_active: false }).eq('id', sopirProfile.id);
  const inactiveRes = await testLogin('sopir1', TEST_PASSWORD);
  if (!inactiveRes.ok) {
    console.log(`[PASS] Pengguna nonaktif ditolak dengan aman: "${inactiveRes.error}"`);
  } else {
    console.error(`[FAIL] Pengguna nonaktif seharusnya ditolak:`, inactiveRes);
    process.exit(1);
  }

  // Kembalikan ke aktif
  await adminClient.from('profiles').update({ is_active: true }).eq('id', sopirProfile.id);
  console.log(`[PASS] Status sopir1 dikembalikan ke aktif.`);

  console.log('\n=== SEMUA PENGUJIAN FASE 2 BERHASIL! ===');
}

run().catch((err) => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
