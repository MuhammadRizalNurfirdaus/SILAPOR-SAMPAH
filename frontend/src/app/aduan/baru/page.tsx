import { Metadata } from 'next';
import Link from 'next/link';
import HeaderDLH from '@/components/layout/HeaderDLH';
import Navbar from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { FormAduan } from './FormAduan';

export const metadata: Metadata = {
  title: 'Buat Aduan Sampah | SILAPOR SAMPAH DLH Kuningan',
  description:
    'Laporkan TPS yang belum diangkut di lingkungan Anda kepada Dinas Lingkungan Hidup Kabupaten Kuningan.',
};

export default function BuatAduanPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <HeaderDLH />
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full flex flex-col items-center">
        <div className="w-full max-w-xl">
          {/* Breadcrumb ringkas */}
          <div className="mb-4 text-xs sm:text-sm text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Buat Aduan</span>
          </div>

          <Card className="p-6 sm:p-8 shadow-sm border-gray-200">
            <div className="mb-6 space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Formulir Aduan Sampah
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Pilih TPS yang belum diangkut dan lampirkan foto kondisinya agar armada pengangkut dapat segera menindaklanjuti.
              </p>
            </div>

            <FormAduan />
          </Card>
        </div>
      </main>
    </div>
  );
}
