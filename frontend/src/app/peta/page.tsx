import { Metadata } from 'next';
import Link from 'next/link';
import HeaderDLH from '@/components/layout/HeaderDLH';
import Navbar from '@/components/layout/Navbar';
import ArmadaMapWrapper from '@/components/map/ArmadaMapWrapper';

export const metadata: Metadata = {
  title: 'Peta Pemantauan Armada | SILAPOR SAMPAH DLH Kuningan',
  description:
    'Pantau pergerakan armada pengangkut sampah DLH Kabupaten Kuningan yang sedang beroperasi.',
};

export default function PetaArmadaPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <HeaderDLH />
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full flex flex-col">
        {/* Breadcrumb ringkas */}
        <div className="mb-4 text-xs sm:text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Peta Armada</span>
        </div>

        <div className="mb-6 space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Peta Pemantauan Armada Beroperasi
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Keterbukaan informasi posisi terkini armada pengangkut sampah Dinas Lingkungan Hidup Kabupaten Kuningan.
          </p>
        </div>

        <ArmadaMapWrapper />
      </main>
    </div>
  );
}
