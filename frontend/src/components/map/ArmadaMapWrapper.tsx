'use client';

import dynamic from 'next/dynamic';

const ArmadaMapClient = dynamic(
  () => import('./ArmadaMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[60dvh] lg:h-[65vh] rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500 font-medium">
        Memuat peta pemantauan...
      </div>
    ),
  }
);

export default function ArmadaMapWrapper() {
  return <ArmadaMapClient />;
}
