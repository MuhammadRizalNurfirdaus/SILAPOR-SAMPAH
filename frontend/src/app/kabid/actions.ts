'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';

const responAduanSchema = z.object({
  aduan_id: z.string().uuid('ID aduan tidak valid'),
  status_baru: z.enum(['diproses', 'selesai', 'ditolak'], {
    message: 'Status baru harus salah satu dari: diproses, selesai, atau ditolak',
  }),
  catatan: z
    .string()
    .trim()
    .min(3, 'Catatan minimal 3 karakter')
    .max(1000, 'Catatan maksimal 1000 karakter'),
  tampil_ke_publik: z.boolean().default(true),
});

export async function kirimResponAduanAction(input: unknown) {
  try {
    const { user } = await requireRole(['kabid', 'admin']);
    const validated = responAduanSchema.parse(input);

    const supabase = await createClient();

    // Insert ke tabel respon_aduan
    // Trigger trg_respon_apply akan otomatis memperbarui status & ditangani_oleh di aduan
    const { error: insertError } = await supabase.from('respon_aduan').insert({
      aduan_id: validated.aduan_id,
      petugas_id: user.id,
      status_baru: validated.status_baru,
      catatan: validated.catatan,
      tampil_ke_publik: validated.tampil_ke_publik,
    });

    if (insertError) {
      console.error('Error insert respon_aduan:', insertError);
      if (insertError.code === '23505') {
        return {
          success: false,
          error: 'TPS ini sudah memiliki aduan aktif lain. Selesaikan aduan tersebut terlebih dahulu sebelum mengubah status ini.',
        };
      }
      return {
        success: false,
        error: 'Gagal menyimpan respon aduan: ' + insertError.message,
      };
    }

    revalidatePath('/kabid/aduan');
    revalidatePath(`/kabid/aduan/${validated.aduan_id}`);
    revalidatePath('/kabid');

    return {
      success: true,
      message: 'Respon aduan berhasil dikirim dan status aduan telah diperbarui.',
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || 'Validasi input tidak sesuai',
      };
    }
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat memproses respon';
    return {
      success: false,
      error: errorMsg,
    };
  }
}
