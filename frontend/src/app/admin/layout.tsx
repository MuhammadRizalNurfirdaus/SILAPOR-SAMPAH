import { Metadata } from 'next';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guard';
import HeaderDLH from '@/components/layout/HeaderDLH';
import { AdminNav } from '@/components/layout/AdminNav';
import { AdminUserMenu } from '@/components/layout/AdminUserMenu';

export const metadata: Metadata = {
  title: 'Data Armada dan Pengguna | SILAPOR SAMPAH DLH Kuningan',
  description: 'Kelola data armada operasional dan akun pengguna sistem DLH Kabupaten Kuningan.',
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

      {/* Navbar Admin Figma (SILAPOR SAMPAH | Data Armada dan Pengguna | U Admin DLH ▾) */}
      <header className="w-full bg-surface border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="w-full px-4 sm:px-8 md:px-10 lg:px-12 xl:px-16 flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link
              href="/"
              className="font-bold text-primary text-base sm:text-lg tracking-tight hover:opacity-90 shrink-0"
            >
              SILAPOR SAMPAH
            </Link>
            <div className="overflow-x-auto">
              <AdminNav />
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <AdminUserMenu
              name={profile.nama_lengkap || 'Admin DLH'}
              username={profile.username}
            />
          </div>
        </div>
      </header>

      {/* Konten Halaman Admin */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
