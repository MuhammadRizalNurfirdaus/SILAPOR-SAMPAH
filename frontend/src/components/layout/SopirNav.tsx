'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SopirBottomNav() {
  const pathname = usePathname();

  const isDashboard = pathname === '/sopir';
  const isPerjalanan = pathname.startsWith('/sopir/perjalanan');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-gray-200 shadow-lg safe-bottom md:hidden">
      <div className="grid grid-cols-2 max-w-md mx-auto h-16">
        <Link
          href="/sopir"
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] transition-colors ${
            isDashboard
              ? 'text-primary font-bold bg-emerald-50/50'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Dashboard</span>
        </Link>

        <Link
          href="/sopir/perjalanan"
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] transition-colors ${
            isPerjalanan
              ? 'text-primary font-bold bg-emerald-50/50'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2" />
          </svg>
          <span className="text-xs">Perjalanan</span>
        </Link>
      </div>
    </nav>
  );
}
