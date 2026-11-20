import { Suspense } from 'react';
import { Metadata } from 'next';
import HeaderDLH from '@/components/layout/HeaderDLH';
import Navbar from '@/components/layout/Navbar';
import { ClientSuccessCard } from './ClientSuccessCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Aduan Berhasil Dikirim | SILAPOR SAMPAH DLH Kuningan',
  description: 'Aduan sampah Anda telah berhasil dicatat ke dalam sistem.',
};

type Props = {
  params: Promise<{ kode: string }>;
};

async function SuccessContent({ params }: Props) {
  const { kode } = await params;
  return <ClientSuccessCard kode={kode} />;
}

export default function AduanBerhasilPage({ params }: Props) {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <HeaderDLH />
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex-1 w-full flex items-center justify-center">
        <Suspense
          fallback={
            <div className="text-center text-sm text-gray-500">
              Memuat nomor laporan aduan...
            </div>
          }
        >
          <SuccessContent params={params} />
        </Suspense>
      </main>
    </div>
  );
}
