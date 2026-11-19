import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { KelolaArmadaClient, ArmadaItem } from './KelolaArmadaClient';

export const metadata: Metadata = {
  title: 'Kelola Armada | SILAPOR SAMPAH DLH Kuningan',
  description: 'Manajemen unit kendaraan operasional pengangkutan sampah DLH Kabupaten Kuningan.',
};

export const dynamic = 'force-dynamic';

export default async function AdminArmadaPage() {
  const supabase = await createClient();

  const { data: armadaRows, error } = await supabase
    .from('armada')
    .select('*')
    .order('plat_nomor', { ascending: true });

  if (error) {
    console.error('Error fetching armada list:', error);
  }

  const items = (armadaRows || []) as ArmadaItem[];

  return <KelolaArmadaClient initialArmada={items} />;
}
