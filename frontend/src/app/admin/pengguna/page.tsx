import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { KelolaDataClient, ArmadaItem, ProfileItem } from '../KelolaDataClient';

export const metadata: Metadata = {
  title: 'Kelola Data Armada dan Pengguna | SILAPOR SAMPAH DLH Kuningan',
  description: 'Manajemen akun pengguna sistem internal Dinas Lingkungan Hidup Kabupaten Kuningan.',
};

export const dynamic = 'force-dynamic';

export default async function AdminPenggunaPage() {
  const { user } = await requireRole(['admin']);
  const supabase = await createClient();

  const [armadaRes, profilesRes] = await Promise.all([
    supabase.from('armada').select('*').order('plat_nomor', { ascending: true }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
  ]);

  const armadaItems = (armadaRes.data || []) as ArmadaItem[];
  const profileItems = (profilesRes.data || []) as ProfileItem[];

  return (
    <KelolaDataClient
      initialArmada={armadaItems}
      initialUsers={profileItems}
      currentAdminId={user.id}
      initialTab="pengguna"
    />
  );
}
