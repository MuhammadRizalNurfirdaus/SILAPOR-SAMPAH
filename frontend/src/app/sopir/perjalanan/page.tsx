import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DurasiPerjalanan } from './DurasiPerjalanan';
import { PelacakGPS } from './PelacakGPS';
import { formatWIB } from '@/lib/format/date';

export default async function PerjalananAktifPage() {
  const { user } = await requireRole(['sopir']);
  const supabase = await createClient();

  // 1. Ambil data perjalanan yang sedang berjalan
  const { data: trip } = await supabase
    .from('perjalanan')
    .select('id, mulai_at, armada_id, armada:armada_id(id, plat_nomor, jenis, wilayah)')
    .eq('sopir_id', user.id)
    .eq('status', 'berjalan')
    .maybeSingle();

  if (!trip) {
    redirect('/sopir');
  }

  // Helper typing for joined armada
  interface JoinedArmada {
    id: string;
    plat_nomor: string;
    jenis: string;
    wilayah: string | null;
  }
  const armada = trip.armada as unknown as JoinedArmada | null;

  // 2. Hitung jumlah foto bukti yang sudah diunggah untuk perjalanan ini
  const { count: jumlahBukti } = await supabase
    .from('bukti_pengangkutan')
    .select('id', { count: 'exact', head: true })
    .eq('perjalanan_id', trip.id);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Perjalanan Aktif
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Armada sedang beroperasi di lapangan
          </p>
        </div>
        <Badge status="beroperasi" size="md">
          Beroperasi
        </Badge>
      </div>

      {/* Komponen Pelacak GPS & Screen Wake Lock */}
      <PelacakGPS perjalananId={trip.id} armadaId={trip.armada_id} />

      {/* Kartu Status Kendaraan & Durasi */}
      <Card className="p-6 sm:p-8 shadow-sm border-gray-200 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div>
            <span className="text-xs text-gray-500 uppercase font-semibold">Unit Kendaraan</span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gray-900">
              {armada?.plat_nomor}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              {armada?.jenis} &bull; Wilayah {armada?.wilayah || 'Kuningan'}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-gray-500 uppercase font-semibold">Durasi Bertugas</span>
            <DurasiPerjalanan mulaiAt={trip.mulai_at} />
            <div className="text-[11px] text-gray-400">
              Mulai: {formatWIB(trip.mulai_at)}
            </div>
          </div>
        </div>

        {/* Counter Bukti Foto */}
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-gray-700">Foto Bukti Terunggah</span>
            <p className="text-xs text-gray-500">
              Minimal 1 foto wajib diunggah sebelum mengakhiri perjalanan
            </p>
          </div>
          <div className="text-xl font-bold font-mono text-primary bg-white px-3 py-1 rounded-lg border border-gray-200">
            {jumlahBukti ?? 0} Foto
          </div>
        </div>

        {/* Tombol Aksi Sentuh Ramah HP (≥ 56 px) */}
        <div className="space-y-3 pt-2">
          <Link href="/sopir/perjalanan/bukti" className="block w-full">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              className="min-h-[56px] text-base font-bold shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Unggah Foto Bukti</span>
            </Button>
          </Link>

          <Link href="/sopir/perjalanan/akhiri" className="block w-full">
            <Button
              variant="outline"
              fullWidth
              size="lg"
              className="min-h-[56px] text-base font-bold border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <span>Akhiri Perjalanan</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
