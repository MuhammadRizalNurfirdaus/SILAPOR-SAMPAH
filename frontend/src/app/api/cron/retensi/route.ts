import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verifikasi CRON_SECRET jika dikonfigurasi di environment Vercel
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Jalankan anonimisasi otomatis untuk aduan selesai > 2 tahun
    // ponytail: pembersihan otomatis kepatuhan UU No. 27/2022 tentang Pelindungan Data Pribadi
    const { data, error } = await supabaseAdmin.rpc('anonimkan_aduan_kadaluwarsa', {
      p_tahun: 2,
    });

    if (error) {
      console.error('[CRON RETENSI UU PDP] Gagal menjalankan anonimisasi:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const count =
      data && Array.isArray(data) && data.length > 0
        ? data[0].jumlah_dianonimkan
        : 0;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      jumlah_dianonimkan: count,
      message: `Retensi UU PDP berhasil dijalankan. ${count} data aduan warga dianonimkan.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
