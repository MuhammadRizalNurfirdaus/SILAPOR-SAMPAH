import { z } from 'zod';

export const aduanSchema = z.object({
  nama_pelapor: z.string().trim().min(2, 'Minimal 2 karakter').max(100),
  no_telepon: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor telepon tidak valid'),
  deskripsi_lokasi: z.string().trim().min(10, 'Minimal 10 karakter').max(500),
  tps_id: z.string().uuid('Pilih TPS yang belum diangkut'),
});

export type AduanInput = z.infer<typeof aduanSchema>;
