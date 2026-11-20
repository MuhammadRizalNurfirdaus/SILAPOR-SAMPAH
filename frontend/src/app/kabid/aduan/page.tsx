import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableCard, Column } from '@/components/ui/TableCard';
import { AduanFilterBar } from './AduanFilterBar';
import { formatWIBShort } from '@/lib/format/date';
import { KabariWAButton } from '@/components/ui/KabariWAButton';

export const metadata: Metadata = {
  title: 'Daftar Aduan Masyarakat | SILAPOR SAMPAH DLH Kuningan',
  description: 'Pengelolaan dan respon terhadap laporan tumpukan sampah masyarakat Kabupaten Kuningan.',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    from?: string;
    to?: string;
    q?: string;
    page?: string;
  }>;
}

interface AduanListItem {
  id: string;
  kode_tiket: string;
  nama_pelapor: string;
  no_telepon: string;
  deskripsi_lokasi: string;
  status: 'baru' | 'diproses' | 'selesai' | 'ditolak';
  created_at: string;
}

export default async function KabidDaftarAduanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status || 'semua';
  const fromFilter = params.from || '';
  const toFilter = params.to || '';
  const qFilter = params.q || '';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const pageSize = 15;

  const supabase = await createClient();

  let query = supabase
    .from('aduan')
    .select(
      'id, kode_tiket, nama_pelapor, no_telepon, deskripsi_lokasi, status, created_at',
      { count: 'exact' }
    );

  const validStatuses = ['baru', 'diproses', 'selesai', 'ditolak'] as const;
  type AduanStatusType = (typeof validStatuses)[number];
  if (statusFilter && validStatuses.includes(statusFilter as AduanStatusType)) {
    query = query.eq('status', statusFilter as AduanStatusType);
  }

  if (qFilter) {
    query = query.ilike('kode_tiket', `%${qFilter}%`);
  }

  if (fromFilter) {
    const startIso = new Date(`${fromFilter}T00:00:00+07:00`).toISOString();
    query = query.gte('created_at', startIso);
  }

  if (toFilter) {
    const endIso = new Date(`${toFilter}T23:59:59.999+07:00`).toISOString();
    query = query.lte('created_at', endIso);
  }

  const offset = (currentPage - 1) * pageSize;
  const { data: aduanRows, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('Error fetching aduan list:', error);
  }

  const items = (aduanRows || []) as AduanListItem[];
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Build query string helper for pagination
  const buildPageUrl = (targetPage: number) => {
    const p = new URLSearchParams();
    if (statusFilter && statusFilter !== 'semua') p.set('status', statusFilter);
    if (fromFilter) p.set('from', fromFilter);
    if (toFilter) p.set('to', toFilter);
    if (qFilter) p.set('q', qFilter);
    p.set('page', String(targetPage));
    return `/kabid/aduan?${p.toString()}`;
  };

  const columns: Column<AduanListItem>[] = [
    {
      key: 'kode_tiket',
      header: 'Nomor Laporan',
      render: (item) => (
        <span className="font-mono font-bold text-gray-900 tracking-wide">
          {item.kode_tiket}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Tanggal',
      render: (item) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {formatWIBShort(item.created_at)}
        </span>
      ),
    },
    {
      key: 'nama_pelapor',
      header: 'Pelapor',
      render: (item) => (
        <span className="font-medium text-gray-800">{item.nama_pelapor}</span>
      ),
    },
    {
      key: 'no_telepon',
      header: 'Telepon',
      isSecondary: true,
      render: (item) => (
        <span className="text-xs text-gray-500">{item.no_telepon}</span>
      ),
    },
    {
      key: 'deskripsi_lokasi',
      header: 'Lokasi Sampah',
      render: (item) => (
        <span className="text-xs text-gray-600 line-clamp-2 max-w-xs">
          {item.deskripsi_lokasi}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <Badge status={item.status} size="sm" />,
    },
    {
      key: 'aksi',
      header: 'Aksi',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          <KabariWAButton
            phone={item.no_telepon}
            namaPelapor={item.nama_pelapor}
            kodeTiket={item.kode_tiket}
            status={item.status}
            size="sm"
            variant="soft"
          />
          <Link
            href={`/kabid/aduan/${item.id}`}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-colors min-h-[36px]"
          >
            Lihat &amp; Respon
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Daftar Aduan Masyarakat
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola laporan tumpukan sampah dari warga dan berikan respon tindak lanjut.
          </p>
        </div>
        <div className="text-xs font-medium text-gray-600 bg-surface px-3 py-1.5 rounded-lg border border-gray-200 self-start sm:self-auto">
          Total: <strong className="text-gray-900">{totalCount}</strong> aduan
        </div>
      </div>

      {/* Filter Bar */}
      <AduanFilterBar
        initialStatus={statusFilter}
        initialFrom={fromFilter}
        initialTo={toFilter}
        initialQ={qFilter}
      />

      {/* Tabel Aduan (Desktop) / Kartu Aduan (Mobile < 768px) */}
      <TableCard
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="Tidak ada data aduan masyarakat yang sesuai dengan filter."
        renderCard={(item) => (
          <Card className="p-4 space-y-3 border border-gray-200 shadow-2xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-base text-gray-900 tracking-wide block">
                  {item.kode_tiket}
                </span>
                <span className="text-[11px] text-gray-500">
                  {formatWIBShort(item.created_at)}
                </span>
              </div>
              <Badge status={item.status} size="sm" />
            </div>

            <div className="text-xs text-gray-700 space-y-1 pt-1 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block text-[11px]">Pelapor:</span>
                <span className="font-medium text-gray-900">
                  {item.nama_pelapor} ({item.no_telepon})
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Lokasi:</span>
                <p className="text-gray-800 line-clamp-2">{item.deskripsi_lokasi}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
              <KabariWAButton
                phone={item.no_telepon}
                namaPelapor={item.nama_pelapor}
                kodeTiket={item.kode_tiket}
                status={item.status}
                size="md"
                className="flex-1"
              />
              <Link
                href={`/kabid/aduan/${item.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold min-h-[44px] transition-colors shadow-xs text-center"
              >
                <span>Lihat Detail</span>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </Card>
        )}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Halaman <strong className="text-gray-900">{currentPage}</strong> dari{' '}
            <strong className="text-gray-900">{totalPages}</strong> (total {totalCount} data)
          </span>

          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface border border-gray-300 text-gray-700 hover:bg-gray-50 min-h-[40px] flex items-center"
              >
                &larr; Sebelumnya
              </Link>
            ) : (
              <button
                disabled
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed min-h-[40px] flex items-center"
              >
                &larr; Sebelumnya
              </button>
            )}

            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface border border-gray-300 text-gray-700 hover:bg-gray-50 min-h-[40px] flex items-center"
              >
                Selanjutnya &rarr;
              </Link>
            ) : (
              <button
                disabled
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed min-h-[40px] flex items-center"
              >
                Selanjutnya &rarr;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
