import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import HeaderDLH from '@/components/layout/HeaderDLH';
import Navbar from '@/components/layout/Navbar';
import { CekStatusForm } from './CekStatusForm';

export const metadata: Metadata = {
  title: 'Cek Status Aduan | SILAPOR SAMPAH DLH Kuningan',
  description:
    'Lacak status tindak lanjut penanganan aduan sampah Anda dengan memasukkan kode tiket laporan.',
};

export default function CekStatusPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <HeaderDLH />
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full flex flex-col items-center">
        <div className="w-full max-w-2xl">
          {/* Breadcrumb ringkas */}
          <div className="mb-4 text-xs sm:text-sm text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Cek Status Aduan</span>
          </div>

          <div className="mb-6 space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Cek Status Aduan Sampah
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Masukkan kode tiket pelacakan Anda untuk melihat perkembangan proses pengangkutan oleh petugas DLH Kuningan.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="p-8 text-center text-sm text-gray-500">
                Memuat formulir pelacakan...
              </div>
            }
          >
            <CekStatusForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
