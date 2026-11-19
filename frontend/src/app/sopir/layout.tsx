import { Metadata } from 'next';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guard';
import { Badge } from '@/components/ui/Badge';
import { SopirBottomNav } from '@/components/layout/SopirNav';

export const metadata: Metadata = {
  title: 'Portal Sopir | SILAPOR SAMPAH DLH Kuningan',
  description: 'Aplikasi operasional pengangkutan sampah untuk pengemudi armada DLH Kuningan.',
};

export default async function SopirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole(['sopir']);

  return (
    <div className="min-h-dvh bg-bg flex flex-col antialiased">
      {/* Top Header Khusus Petugas Lapangan */}
      <header className="bg-surface border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-screen-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
              DLH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                  {profile.nama_lengkap}
                </span>
                <Badge status="primary" size="sm">
                  Sopir
                </Badge>
              </div>
              <span className="text-[11px] text-gray-500 block leading-none">
                @{profile.username}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/api/auth/logout"
              className="text-xs font-semibold text-danger hover:bg-danger-bg px-3 py-1.5 rounded-lg border border-red-200 min-h-[38px] flex items-center transition-colors"
            >
              Keluar
            </Link>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-6 pb-24 md:pb-12">
        {children}
      </main>

      {/* Bottom Navigation Lekat di Bawah */}
      <SopirBottomNav />
    </div>
  );
}
