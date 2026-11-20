import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// In-memory sliding window fallback untuk pembatas laju (30 req / menit / IP)
const ipRequests = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxReq = 30;

  const timestamps = (ipRequests.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxReq) {
    return false;
  }
  timestamps.push(now);
  ipRequests.set(ip, timestamps);
  return true;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { found: false, message: 'Terlalu banyak permintaan. Silakan coba sesaat lagi.' },
      { status: 429 }
    );
  }

  const kode = (req.nextUrl.searchParams.get('kode') ?? '').trim().toUpperCase();

  // Validasi format nomor laporan: SLP-YYMM-XXXXXXXX (Layar 06b jika tidak valid)
  if (!/^SLP-\d{4}-[A-F0-9]{8}$/i.test(kode)) {
    return NextResponse.json(
      { found: false, message: 'Format nomor laporan aduan tidak sesuai' },
      { status: 404 }
    );
  }

  const { data, error } = await supabaseAdmin.rpc('cek_status_aduan', { p_kode: kode });

  if (error || !data || data.length === 0) {
    return NextResponse.json(
      { found: false, message: 'Aduan tidak ditemukan' },
      { status: 404 }
    );
  }

  return NextResponse.json({ found: true, aduan: data[0] });
}
