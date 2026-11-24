import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { KelolaTpsClient, TpsItem } from './KelolaTpsClient';

export const metadata: Metadata = {
  title: 'Kelola TPS | SILAPOR SAMPAH DLH Kuningan',
  description: 'Manajemen daftar Tempat Pembuangan Sementara (TPS) DLH Kabupaten Kuningan.',
};

export const dynamic = 'force-dynamic';

export default async function AdminTpsPage() {
  await requireRole(['admin']);
  const supabase = await createClient();

  const { data } = await supabase
    .from('tps')
    .select('*')
    .order('kecamatan', { ascending: true })
    .order('nama', { ascending: true });

  const items = (data || []) as TpsItem[];
  return <KelolaTpsClient initialTps={items} />;
}
