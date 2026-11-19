import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { FormAkhiriPerjalanan } from './FormAkhiriPerjalanan';
import { formatWIB } from '@/lib/format/date';

export default async function AkhiriPerjalananPage() {
  const { user } = await requireRole(['sopir']);
  const supabase = await createClient();

  // Pastikan sopir sedang memiliki perjalanan aktif
  const { data: trip } = await supabase
    .from('perjalanan')
    .select('id, mulai_at, armada:armada_id(plat_nomor, jenis)')
    .eq('sopir_id', user.id)
    .eq('status', 'berjalan')
    .maybeSingle();

  if (!trip) {
    redirect('/sopir');
  }

  interface JoinedArmada {
    plat_nomor: string;
    jenis: string;
  }
  const armada = trip.armada as unknown as JoinedArmada | null;

  // Hitung jumlah foto bukti
  const { count: jumlahBukti } = await supabase
    .from('bukti_pengangkutan')
    .select('id', { count: 'exact', head: true })
    .eq('perjalanan_id', trip.id);

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
        <span className="text-gray-800 font-medium">Akhiri Perjalanan</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Akhiri Tugas Perjalanan
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Armada: <span className="font-mono font-bold text-gray-900">{armada?.plat_nomor}</span> ({armada?.jenis})
        </p>
      </div>

      {/* Ringkasan Perjalanan */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-gray-500 block">Waktu Mulai:</span>
          <span className="font-semibold text-gray-800">{formatWIB(trip.mulai_at)}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Foto Bukti:</span>
          <span className={`font-bold ${Number(jumlahBukti) > 0 ? 'text-primary' : 'text-danger'}`}>
            {jumlahBukti ?? 0} Foto Terunggah
          </span>
        </div>
      </div>

      <Card className="p-6 sm:p-8 shadow-sm border-gray-200">
        <FormAkhiriPerjalanan perjalananId={trip.id} jumlahBukti={jumlahBukti ?? 0} />
      </Card>
    </div>
  );
}
