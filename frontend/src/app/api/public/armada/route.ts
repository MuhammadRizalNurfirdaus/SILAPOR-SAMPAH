import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin.rpc('posisi_armada_terbaru');

  if (error) {
    console.error('Error fetching armada positions:', error);
    return NextResponse.json([], { status: 500 });
  }

  // Samarkan plat nomor untuk privasi publik: misal E 1234 AB -> E 12•• AB
  const mask = (p: string) => p.replace(/(\d{2})\d{2}/, '$1••');

  const now = Date.now();
  const TEN_MINUTES_MS = 10 * 60 * 1000;

  // Fase 5 rule: posisi > 10 menit dianggap tidak aktif
  const formatted = (data ?? [])
    .filter((a) => {
      const recTime = new Date(a.direkam_at).getTime();
      return now - recTime <= TEN_MINUTES_MS;
    })
    .map((a) => ({
      id: a.armada_id,
      plat: mask(a.plat_nomor),
      jenis: a.jenis,
      lat: a.lat,
      lng: a.lng,
      waktu: a.direkam_at,
    }));

  return NextResponse.json(formatted);
}
