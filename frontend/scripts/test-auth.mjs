import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('Checking existing users in auth.users and public.profiles...');
  const { data: users, error: usersErr } = await admin.auth.admin.listUsers();
  if (usersErr) {
    console.error('Error listing users:', usersErr);
    return;
  }

  console.log(`Found ${users.users.length} auth user(s):`);
  for (const u of users.users) {
    console.log(` - [${u.id}] ${u.email}`);
  }

  const { data: profiles, error: profErr } = await admin.from('profiles').select('*');
  if (profErr) {
    console.error('Error querying profiles:', profErr);
    return;
  }

  console.log(`Found ${profiles.length} profile(s):`);
  for (const p of profiles) {
    console.log(` - [${p.id}] ${p.username} (${p.nama_lengkap}) -> role: ${p.role}, active: ${p.is_active}`);
  }
}

main().catch(console.error);
