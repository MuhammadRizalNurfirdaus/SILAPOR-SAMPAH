'use client';

import dynamic from 'next/dynamic';

const KabidRealtimeMapClient = dynamic(
  () => import('./KabidRealtimeMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[60dvh] lg:h-[65vh] rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500 font-medium">
        Menghubungkan peta operasional Realtime...
      </div>
    ),
  }
);

export default function KabidRealtimeMapWrapper() {
  return <KabidRealtimeMapClient />;
}
