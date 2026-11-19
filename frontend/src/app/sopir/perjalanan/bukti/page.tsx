import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { FormUnggahBukti } from './FormUnggahBukti';

export default async function UnggahBuktiPage() {
  const { user } = await requireRole(['sopir']);
  const supabase = await createClient();

  // Pastikan sopir sedang memiliki perjalanan aktif
  const { data: trip } = await supabase
    .from('perjalanan')
    .select('id, armada:armada_id(plat_nomor)')
    .eq('sopir_id', user.id)
    .eq('status', 'berjalan')
    .maybeSingle();

  if (!trip) {
    redirect('/sopir');
  }

  interface JoinedArmada {
    plat_nomor: string;
  }
  const armada = trip.armada as unknown as JoinedArmada | null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb ringkas */}
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <Link href="/sopir" className="hover:text-primary">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/sopir/perjalanan" className="hover:text-primary">
          Perjalanan
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Unggah Bukti</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Unggah Bukti Pengangkutan
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Armada: <span className="font-mono font-bold text-gray-900">{armada?.plat_nomor}</span>
        </p>
      </div>

      <Card className="p-6 sm:p-8 shadow-sm border-gray-200">
        <FormUnggahBukti perjalananId={trip.id} />
      </Card>
    </div>
  );
}
