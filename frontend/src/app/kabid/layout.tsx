import { Metadata } from 'next';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guard';
import { Badge } from '@/components/ui/Badge';
import HeaderDLH from '@/components/layout/HeaderDLH';
import { KabidNav } from '@/components/layout/KabidNav';

export const metadata: Metadata = {
  title: 'Dashboard Pemantauan | SILAPOR SAMPAH DLH Kuningan',
  description: 'Portal pemantauan operasional pengangkutan sampah dan respon aduan masyarakat untuk Kepala Bidang.',
};

export default async function KabidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(['kabid', 'admin']);

  return (
    <div className="min-h-dvh bg-bg flex flex-col antialiased">
      {/* Official DLH Header Banner */}
      <HeaderDLH />

      {/* Top Bar Informasi Petugas */}
      <header className="bg-surface border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs sm:text-sm shrink-0">
              DLH
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-gray-900 leading-tight truncate">
                  {profile.nama_lengkap}
                </span>
                <Badge status={profile.role === 'admin' ? 'danger' : 'primary'} size="sm">
                  {profile.role === 'admin' ? 'Admin' : 'Kabid'}
                </Badge>
              </div>
              <span className="text-[11px] text-gray-500 block leading-tight truncate">
                @{profile.username} &bull; Dinas Lingkungan Hidup
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {profile.role === 'admin' && (
              <Link
                href="/admin/armada"
                className="hidden sm:flex text-xs font-semibold text-gray-700 hover:text-primary hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300 min-h-[38px] items-center transition-colors"
              >
                Panel Admin
              </Link>
            )}
            <Link
              href="/api/auth/logout"
              className="text-xs font-semibold text-danger hover:bg-danger-bg px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-200 min-h-[36px] sm:min-h-[38px] flex items-center transition-colors text-center"
            >
              Keluar
            </Link>
          </div>
        </div>
      </header>

      {/* Navigasi Modul Kabid */}
      <KabidNav />

      {/* Konten Halaman */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
