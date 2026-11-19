'use server';

import { redirect } from 'next/navigation';
import { randomUUID } from 'node:crypto';
import { requireRole } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { detectImage } from '@/lib/image-check';

const MAX_FOTO_SIZE = 5 * 1024 * 1024; // 5 MB

export async function mulaiPerjalananAction(formData: FormData) {
  await requireRole(['sopir']);
  const armadaId = String(formData.get('armada_id') ?? '').trim();

  if (!armadaId) {
    return { error: 'Silakan pilih armada terlebih dahulu' };
  }

  const supabase = await createClient();
  const { data: perjalananId, error } = await supabase.rpc('mulai_perjalanan', {
    p_armada_id: armadaId,
  });

  if (error || !perjalananId) {
    return { error: error?.message || 'Gagal memulai perjalanan armada' };
  }

  redirect('/sopir/perjalanan');
}

export async function akhiriPerjalananAction(formData: FormData) {
  await requireRole(['sopir']);
  const perjalananId = String(formData.get('perjalanan_id') ?? '').trim();
  const ringkasan = String(formData.get('ringkasan') ?? '').trim();

  if (!perjalananId) {
    return { error: 'ID perjalanan tidak valid' };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('akhiri_perjalanan', {
    p_perjalanan_id: perjalananId,
    p_ringkasan: ringkasan || undefined,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/sopir');
}

export async function unggahBuktiAction(formData: FormData) {
  const { user } = await requireRole(['sopir']);
  const perjalananId = String(formData.get('perjalanan_id') ?? '').trim();
  const keterangan = String(formData.get('keterangan') ?? '').trim();
  const latStr = formData.get('lat');
  const lngStr = formData.get('lng');
  const lat = latStr ? parseFloat(String(latStr)) : null;
  const lng = lngStr ? parseFloat(String(lngStr)) : null;

  const foto = formData.get('foto');

  if (!perjalananId) {
    return { error: 'ID perjalanan tidak valid' };
  }

  if (!(foto instanceof File) || foto.size === 0) {
    return { error: 'Foto bukti wajib dilampirkan' };
  }

  // Layar 09b: Ukuran melebihi batas 5 MB
  if (foto.size > MAX_FOTO_SIZE) {
    return { error: 'Ukuran foto melebihi batas maksimal 5 MB (Layar 09b)' };
  }

  // Validasi magic bytes
  const headerBytes = new Uint8Array(await foto.slice(0, 16).arrayBuffer());
  const ext = detectImage(headerBytes);
  if (!ext) {
    return { error: 'Format file tidak valid. Gunakan format JPG, PNG, atau WebP' };
  }

  const supabase = await createClient();

  // Storage path: {sopir_id}/{perjalanan_id}/{uuid}.{ext}
  const filePath = `${user.id}/${perjalananId}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('bukti-pengangkutan')
    .upload(filePath, foto, {
      contentType: foto.type || (ext === 'jpg' ? 'image/jpeg' : `image/${ext}`),
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return { error: 'Gagal mengunggah foto bukti ke server' };
  }

  // Insert ke database tabel bukti_pengangkutan
  const { error: insertError } = await supabase.from('bukti_pengangkutan').insert({
    perjalanan_id: perjalananId,
    sopir_id: user.id,
    foto_path: filePath,
    keterangan: keterangan || null,
    lat,
    lng,
  });

  if (insertError) {
    console.error('Database insert error:', insertError);
    // Rollback file di storage
    await supabase.storage.from('bukti-pengangkutan').remove([filePath]);
    return { error: insertError.message || 'Gagal mencatat bukti ke database' };
  }

  redirect('/sopir/perjalanan');
}

export async function kirimLokasiAction(
  perjalananId: string,
  armadaId: string,
  lat: number,
  lng: number
) {
  await requireRole(['sopir']);
  const supabase = await createClient();

  const { error } = await supabase.from('lokasi_armada').insert({
    perjalanan_id: perjalananId,
    armada_id: armadaId,
    lat,
    lng,
  });

  if (error) {
    console.error('Gagal mencatat titik lokasi armada:', error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
