'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNav() {
  const pathname = usePathname();
  const isDataArmadaDanPengguna =
    pathname === '/admin' ||
    pathname.startsWith('/admin/armada') ||
    pathname.startsWith('/admin/pengguna');
  const isRetensi = pathname.startsWith('/admin/retensi');

  return (
    <nav className="flex items-center gap-1.5 sm:gap-2">
      <Link
        href="/admin"
        className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[38px] flex items-center ${
          isDataArmadaDanPengguna
            ? 'bg-primary-light text-primary-dark font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        Data Armada dan Pengguna
      </Link>
      <Link
        href="/admin/retensi"
        className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[38px] flex items-center ${
          isRetensi
            ? 'bg-primary-light text-primary-dark font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        Retensi UU PDP
      </Link>
    </nav>
  );
}
