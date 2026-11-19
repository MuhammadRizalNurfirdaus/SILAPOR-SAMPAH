import { NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { aduanSchema } from '@/lib/validation/aduan';
import { detectImage } from '@/lib/image-check';
import { verifyTurnstile } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

const MAX = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // 1. Honeypot check (jika terisi oleh bot, kembalikan respons sukses palsu tanpa simpan)
    if (form.get('website')) {
      return NextResponse.json({ ok: true });
    }

    // 2. Turnstile verification
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const turnstileToken = String(form.get('cf-turnstile-response') ?? '');
    const isTurnstileValid = await verifyTurnstile(turnstileToken, ip);

    if (!isTurnstileValid) {
      return NextResponse.json(
        { ok: false, message: 'Verifikasi keamanan gagal' },
        { status: 400 }
      );
    }

    // 3. Validasi field teks dengan Zod
    const parsed = aduanSchema.safeParse({
      nama_pelapor: form.get('nama_pelapor'),
      no_telepon: form.get('no_telepon'),
      deskripsi_lokasi: form.get('deskripsi_lokasi'),
    });

    // 4. Validasi file foto (ukuran & magic bytes)
    const foto = form.get('foto');
    const isFile = foto instanceof File && foto.size > 0 && foto.size <= MAX;
    let ext: 'jpg' | 'png' | 'webp' | null = null;

    if (isFile) {
      const headerBytes = new Uint8Array(await foto.slice(0, 16).arrayBuffer());
      ext = detectImage(headerBytes);
    }

    // Layar 04b: jika validasi gagal, kembalikan status 422 dengan pesan spesifik
    if (!parsed.success || !isFile || !ext) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Data atau ukuran foto tidak valid',
          fields: parsed.success ? {} : parsed.error.flatten().fieldErrors,
          foto: !ext ? 'Foto wajib, format JPG/PNG/WebP, maksimal 5 MB' : undefined,
        },
        { status: 422 }
      );
    }

    // 5. Rate limit: maksimal 5 aduan per jam dari IP yang sama
    const salt = process.env.IP_HASH_SALT ?? '';
    const ipHash = createHash('sha256').update(ip + salt).digest('hex');

    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from('aduan')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if (!countError && (count ?? 0) >= 5) {
      return NextResponse.json(
        { ok: false, message: 'Terlalu banyak aduan dari perangkat Anda. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    // 6. Unggah foto ke private bucket 'aduan-foto'
    const id = randomUUID();
    const filePath = `aduan/${id}/${randomUUID()}.${ext}`;

    const up = await supabaseAdmin.storage
      .from('aduan-foto')
      .upload(filePath, foto, {
        contentType: foto.type || (ext === 'jpg' ? 'image/jpeg' : `image/${ext}`),
        upsert: false,
      });

    if (up.error) {
      console.error('Storage upload error:', up.error);
      return NextResponse.json(
        { ok: false, message: 'Gagal mengunggah foto ke sistem penyimpanan' },
        { status: 500 }
      );
    }

    // 7. Simpan baris aduan ke database
    const { data, error } = await supabaseAdmin
      .from('aduan')
      .insert({
        id,
        nama_pelapor: parsed.data.nama_pelapor,
        no_telepon: parsed.data.no_telepon,
        deskripsi_lokasi: parsed.data.deskripsi_lokasi,
        foto_path: filePath,
        ip_hash: ipHash,
      })
      .select('kode_tiket')
      .single();

    if (error) {
      console.error('Database insert error:', error);
      // Rollback file jika insert database gagal
      await supabaseAdmin.storage.from('aduan-foto').remove([filePath]);
      return NextResponse.json(
        { ok: false, message: 'Gagal menyimpan aduan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, kode: data.kode_tiket });
  } catch (err) {
    console.error('Unhandled aduan POST error:', err);
    return NextResponse.json(
      { ok: false, message: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
