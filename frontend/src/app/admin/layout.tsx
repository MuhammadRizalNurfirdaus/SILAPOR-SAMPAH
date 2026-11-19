import { Metadata } from 'next';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guard';
import { Badge } from '@/components/ui/Badge';
import HeaderDLH from '@/components/layout/HeaderDLH';
import { AdminNav } from '@/components/layout/AdminNav';

export const metadata: Metadata = {
  title: 'Panel Administrasi | SILAPOR SAMPAH DLH Kuningan',
  description: 'Pengelolaan data armada sampah dan pengguna sistem DLH Kabupaten Kuningan.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(['admin']);

  return (
    <div className="min-h-dvh bg-bg flex flex-col antialiased">
      {/* Official DLH Header Banner */}
      <HeaderDLH />

      {/* Top Bar Informasi Administrator */}
      <header className="bg-surface border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger font-bold text-xs shrink-0">
              ADM
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-gray-900 leading-tight truncate">
                  {profile.nama_lengkap}
                </span>
                <Badge status="danger" size="sm">
                  Admin
                </Badge>
              </div>
              <span className="text-[11px] text-gray-500 block leading-tight truncate">
                @{profile.username} &bull; DLH Kuningan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/kabid"
              className="hidden sm:flex text-xs font-semibold text-gray-700 hover:text-primary hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300 min-h-[38px] items-center transition-colors"
            >
              Mode Kabid
            </Link>
            <Link
              href="/api/auth/logout"
              className="text-xs font-semibold text-danger hover:bg-danger-bg px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-200 min-h-[36px] sm:min-h-[38px] flex items-center transition-colors text-center"
            >
              Keluar
            </Link>
          </div>
        </div>
      </header>

      {/* Navigasi Modul Admin */}
      <AdminNav />

      {/* Konten Halaman Admin */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
