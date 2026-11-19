import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { KelolaPenggunaClient, ProfileItem } from './KelolaPenggunaClient';

export const metadata: Metadata = {
  title: 'Kelola Pengguna | SILAPOR SAMPAH DLH Kuningan',
  description: 'Manajemen akun pengguna sistem internal Dinas Lingkungan Hidup Kabupaten Kuningan.',
};

export const dynamic = 'force-dynamic';

export default async function AdminPenggunaPage() {
  const { user } = await requireRole(['admin']);
  const supabase = await createClient();

  const { data: profileRows, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
  }

  const items = (profileRows || []) as ProfileItem[];

  return <KelolaPenggunaClient initialUsers={items} currentAdminId={user.id} />;
}
