import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  await requireRole(['kabid', 'admin']);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('posisi_armada_terbaru');

  if (error) {
    console.error('Error fetching kabid armada positions:', error);
    return NextResponse.json([], { status: 500 });
  }

  // Untuk Kabid dan Admin, plat nomor ditampilkan utuh/resmi
  const formatted = (data ?? []).map((a) => ({
    id: a.armada_id,
    plat_nomor: a.plat_nomor,
    jenis: a.jenis,
    lat: a.lat,
    lng: a.lng,
    direkam_at: a.direkam_at,
  }));

  return NextResponse.json(formatted);
}
