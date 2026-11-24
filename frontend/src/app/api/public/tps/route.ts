import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('tps')
    .select('id, nama, kecamatan, alamat')
    .eq('is_active', true)
    .order('kecamatan', { ascending: true })
    .order('nama', { ascending: true });

  if (error) {
    console.error('Error fetching tps list:', error);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
  });
}
