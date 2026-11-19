import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableCard, Column } from '@/components/ui/TableCard';
import KabidRealtimeMapWrapper from '@/components/map/KabidRealtimeMapWrapper';
import { formatWIB } from '@/lib/format/date';

export const metadata: Metadata = {
  title: 'Pemantauan Operasional | SILAPOR SAMPAH DLH Kuningan',
  description: 'Pemantauan realtime posisi armada sampah dan operasional pengangkutan DLH Kuningan.',
};

export const dynamic = 'force-dynamic';

interface ActivePerjalananItem {
  id: string;
  mulai_at: string;
  plat_nomor: string;
  jenis: string;
  sopir_nama: string;
  jumlah_bukti: number;
}

export default async function KabidDashboardPage() {
  const supabase = await createClient();

  // 1. Hitung awal hari ini (WIB)
  const now = new Date();
  const dateStrWIB = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(now);
  const startOfDayWibIso = new Date(`${dateStrWIB}T00:00:00+07:00`).toISOString();

  // 2. Fetch Statistik Ringkasan secara paralel
  const [
    armadaRes,
    perjalananHariIniRes,
    aduanBaruRes,
    activePerjalananRes,
  ] = await Promise.all([
    supabase
      .from('armada')
      .select('status')
      .eq('is_active', true),
    supabase
      .from('perjalanan')
      .select('id', { count: 'exact', head: true })
      .gte('mulai_at', startOfDayWibIso),
    supabase
      .from('aduan')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'baru'),
    supabase
      .from('perjalanan')
      .select(`
        id,
        mulai_at,
        armada:armada_id (plat_nomor, jenis),
        sopir:sopir_id (nama_lengkap),
        bukti_pengangkutan (id)
      `)
      .eq('status', 'berjalan')
      .order('mulai_at', { ascending: false }),
  ]);

  const armadaList = armadaRes.data || [];
  const countBeroperasi = armadaList.filter((a) => a.status === 'beroperasi').length;
  const countGarasi = armadaList.filter((a) => a.status === 'garasi').length;
  const countPerawatan = armadaList.filter((a) => a.status === 'perawatan').length;
  const countPerjalananHariIni = perjalananHariIniRes.count ?? 0;
  const countAduanBaru = aduanBaruRes.count ?? 0;

  // Format active perjalanan
  const nowMs = now.getTime();
  const getDuration = (mulaiAt: string, currentMs: number) => {
    const diff = Math.max(0, currentMs - new Date(mulaiAt).getTime());
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) return `${hours} jam ${remMins} mnt`;
    return `${remMins} menit`;
  };

  interface RawPerjalanan {
    id: string;
    mulai_at: string;
    armada: { plat_nomor: string; jenis: string } | null;
    sopir: { nama_lengkap: string } | null;
    bukti_pengangkutan: { id: string }[] | null;
  }

  const activeRaw = (activePerjalananRes.data || []) as unknown as RawPerjalanan[];
  const activeItems: ActivePerjalananItem[] = activeRaw.map((p) => ({
    id: p.id,
    mulai_at: p.mulai_at,
    plat_nomor: p.armada?.plat_nomor || '-',
    jenis: p.armada?.jenis || 'Truk',
    sopir_nama: p.sopir?.nama_lengkap || 'Pengemudi',
    jumlah_bukti: Array.isArray(p.bukti_pengangkutan) ? p.bukti_pengangkutan.length : 0,
  }));

  const tableColumns: Column<ActivePerjalananItem>[] = [
    {
      key: 'plat_nomor',
      header: 'Plat Nomor',
      render: (item) => (
        <span className="font-bold text-gray-900 tracking-wider">
          {item.plat_nomor}
        </span>
      ),
    },
    {
      key: 'jenis',
      header: 'Jenis Armada',
      render: (item) => (
        <span className="text-gray-600">{item.jenis}</span>
      ),
    },
    {
      key: 'sopir_nama',
      header: 'Sopir / Pengemudi',
      render: (item) => (
        <span className="font-medium text-gray-800">{item.sopir_nama}</span>
      ),
    },
    {
      key: 'mulai_at',
      header: 'Waktu Mulai',
      isSecondary: true,
      render: (item) => (
        <span className="text-xs text-gray-500">{formatWIB(item.mulai_at)}</span>
      ),
    },
    {
      key: 'durasi',
      header: 'Durasi',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {getDuration(item.mulai_at, nowMs)}
        </span>
      ),
    },
    {
      key: 'jumlah_bukti',
      header: 'Foto Bukti',
      render: (item) => (
        <Badge status="info" size="sm">
          {item.jumlah_bukti} Foto
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Pemantauan Operasional DLH
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau sebaran armada sampah, perjalanan pengangkutan aktif, dan status aduan masyarakat.
        </p>
      </div>

      {/* Grid Statistik Ringkasan */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Beroperasi */}
        <Card className="p-4 border-l-4 border-l-primary flex flex-col justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Beroperasi
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-primary">
              {countBeroperasi}
            </span>
            <span className="text-xs font-medium text-gray-500">Unit</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">Sedang jalan mengangkut</div>
        </Card>

        {/* 2. Di Garasi */}
        <Card className="p-4 border-l-4 border-l-gray-400 flex flex-col justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Di Garasi
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-700">
              {countGarasi}
            </span>
            <span className="text-xs font-medium text-gray-500">Unit</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">Siap ditugaskan</div>
        </Card>

        {/* 3. Perawatan */}
        <Card className="p-4 border-l-4 border-l-warning flex flex-col justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Perawatan
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-warning">
              {countPerawatan}
            </span>
            <span className="text-xs font-medium text-gray-500">Unit</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">Dalam perbaikan/bengkel</div>
        </Card>

        {/* 4. Perjalanan Hari Ini */}
        <Card className="p-4 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Perjalanan Hari Ini
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
              {countPerjalananHariIni}
            </span>
            <span className="text-xs font-medium text-gray-500">Ritasi</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">Total mulai sejak 00:00 WIB</div>
        </Card>

        {/* 5. Aduan Baru */}
        <Card className="p-4 border-l-4 border-l-danger flex flex-col justify-between col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Aduan Baru
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-danger">
              {countAduanBaru}
            </span>
            <Link
              href="/kabid/aduan?status=baru"
              className="text-xs font-semibold text-danger hover:underline"
            >
              Lihat &rarr;
            </Link>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">Belum direspon petugas</div>
        </Card>
      </div>

      {/* Peta Realtime Posisi Armada */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Peta Operasional Armada (Realtime)
            </h2>
            <p className="text-xs text-gray-500">
              Posisi terhubung langsung dengan GPS pengemudi lewat Supabase Realtime.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-emerald-700">Realtime Aktif</span>
          </div>
        </div>

        <KabidRealtimeMapWrapper />
      </section>

      {/* Tabel / Daftar Perjalanan Aktif */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Armada Sedang Bertugas ({activeItems.length})
          </h2>
          <Link
            href="/kabid/galeri"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Lihat Semua Foto Bukti &rarr;
          </Link>
        </div>

        <TableCard
          data={activeItems}
          columns={tableColumns}
          keyExtractor={(item) => item.id}
          emptyMessage="Tidak ada armada yang sedang melakukan perjalanan saat ini."
          renderCard={(item) => (
            <Card className="p-4 space-y-3 border border-gray-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-base text-gray-900 tracking-wider block">
                    {item.plat_nomor}
                  </span>
                  <span className="text-xs text-gray-500">{item.jenis}</span>
                </div>
                <Badge status="beroperasi" size="sm">
                  Aktif
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-1 border-t border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[11px]">Sopir:</span>
                  <span className="font-medium text-gray-800">{item.sopir_nama}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Durasi Berjalan:</span>
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {getDuration(item.mulai_at, nowMs)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <span className="text-gray-500">Mulai: {formatWIB(item.mulai_at)}</span>
                <Badge status="info" size="sm">
                  {item.jumlah_bukti} Foto
                </Badge>
              </div>
            </Card>
          )}
        />
      </section>
    </div>
  );
}
