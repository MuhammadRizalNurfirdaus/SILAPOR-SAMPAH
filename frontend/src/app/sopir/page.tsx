import Link from 'next/link';
import { requireRole } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormMulaiPerjalanan } from './FormMulaiPerjalanan';
import { formatWIB } from '@/lib/format/date';

export default async function SopirDashboardPage() {
  const { user, profile } = await requireRole(['sopir']);
  const supabase = await createClient();

  // 1. Cek apakah sopir ini sudah memiliki perjalanan aktif
  const { data: activeTrip } = await supabase
    .from('perjalanan')
    .select('id, mulai_at, armada:armada_id(id, plat_nomor, jenis, wilayah)')
    .eq('sopir_id', user.id)
    .eq('status', 'berjalan')
    .maybeSingle();

  // 2. Jika tidak ada perjalanan aktif, ambil daftar armada yang ada di garasi
  const { data: armadaGarasi } = await supabase
    .from('armada')
    .select('id, plat_nomor, jenis, wilayah')
    .eq('status', 'garasi')
    .eq('is_active', true)
    .order('plat_nomor');

  // Helper typing for joined armada
  interface JoinedArmada {
    id: string;
    plat_nomor: string;
    jenis: string;
    wilayah: string | null;
  }
  const armada = activeTrip?.armada as unknown as JoinedArmada | null;

  return (
    <div className="space-y-6">
      {/* Header Sambutan */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Dashboard Sopir
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Selamat bertugas, <span className="font-semibold text-gray-800">{profile.nama_lengkap}</span>. Pastikan kondisi armada siap operasi sebelum bertugas.
        </p>
      </div>

      {activeTrip ? (
        /* Jika Ada Perjalanan Aktif yang Sedang Berjalan */
        <Card className="p-6 sm:p-8 border-emerald-300 bg-emerald-50/40 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Tugas Aktif Berjalan
            </span>
            <Badge status="berjalan" size="sm">
              Sedang Bertugas
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gray-900">
              {armada?.plat_nomor ?? 'Armada'}
            </div>
            <p className="text-sm text-gray-700">
              {armada?.jenis} &bull; Wilayah {armada?.wilayah || 'Kuningan'}
            </p>
            <div className="text-xs text-gray-500 pt-1 border-t border-emerald-200">
              Dimulai sejak: {formatWIB(activeTrip.mulai_at)}
            </div>
          </div>

          <div className="pt-2">
            <Link href="/sopir/perjalanan" className="block w-full">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                className="min-h-[56px] text-base font-bold shadow-md"
              >
                Lanjutkan Perjalanan Aktif &rarr;
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Layar 07 Figma: Mulai Perjalanan Baru */
        <Card className="p-6 sm:p-8 shadow-sm border-gray-200 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Mulai Tugas Pengangkutan
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Pilih unit kendaraan dinas yang siap berangkat dari garasi DLH.
            </p>
          </div>

          <FormMulaiPerjalanan armadaList={armadaGarasi ?? []} />
        </Card>
      )}

      {/* Panduan Singkat Operasional */}
      <div className="bg-surface rounded-xl p-4 sm:p-5 border border-gray-200 space-y-2 text-xs text-gray-600">
        <p className="font-bold text-gray-800 text-sm">Ketentuan Petugas Lapangan:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Pastikan GPS pada HP dalam keadaan aktif sebelum memulai perjalanan.</li>
          <li>Ambil foto bukti saat sampah telah dimuat ke armada.</li>
          <li>Perjalanan hanya dapat diakhiri setelah minimal 1 foto bukti terunggah.</li>
        </ul>
      </div>
    </div>
  );
}
