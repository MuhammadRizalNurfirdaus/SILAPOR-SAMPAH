'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/guard';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { toEmail } from '@/lib/auth/username';

// --- SCHEMA VALIDASI ARMADA ---
const armadaSchema = z.object({
  plat_nomor: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'Plat nomor minimal 3 karakter')
    .max(15, 'Plat nomor maksimal 15 karakter'),
  jenis: z
    .string()
    .trim()
    .min(2, 'Jenis armada minimal 2 karakter')
    .max(50, 'Jenis armada maksimal 50 karakter'),
  kapasitas_m3: z
    .number()
    .positive('Kapasitas harus lebih besar dari 0')
    .nullable()
    .optional(),
  wilayah: z.string().trim().nullable().optional(),
  status: z.enum(['garasi', 'beroperasi', 'perawatan']).default('garasi'),
});

// --- SCHEMA VALIDASI PENGGUNA ---
const penggunaSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9._-]{3,30}$/,
      'Username harus 3-30 karakter berupa huruf kecil, angka, titik, underscore, atau minus'
    ),
  nama_lengkap: z
    .string()
    .trim()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),
  role: z.enum(['sopir', 'kabid', 'admin'], {
    message: 'Peran harus salah satu dari: sopir, kabid, atau admin',
  }),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter'),
});

// ==========================================
// 1. ACTIONS ARMADA
// ==========================================

export async function tambahArmadaAction(input: unknown) {
  try {
    const { user: admin } = await requireRole(['admin']);
    const v = armadaSchema.parse(input);

    // Cek plat nomor duplikat (Layar 17b / UAT 13)
    const { data: existing } = await supabaseAdmin
      .from('armada')
      .select('id, plat_nomor')
      .ilike('plat_nomor', v.plat_nomor)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: `Plat nomor "${v.plat_nomor}" sudah terdaftar dalam sistem.`,
      };
    }

    const { data, error } = await supabaseAdmin
      .from('armada')
      .insert({
        plat_nomor: v.plat_nomor,
        jenis: v.jenis,
        kapasitas_m3: v.kapasitas_m3 ?? null,
        wilayah: v.wilayah || null,
        status: v.status,
        is_active: true,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: 'Gagal menambahkan armada: ' + error?.message };
    }

    // Catat audit log
    await supabaseAdmin.from('audit_log').insert({
      actor_id: admin.id,
      aksi: 'armada.buat',
      entitas: 'armada',
      entitas_id: data.id,
      detail: { plat_nomor: data.plat_nomor, jenis: data.jenis },
    });

    revalidatePath('/admin/armada');
    revalidatePath('/kabid');
    return { success: true, message: `Armada ${data.plat_nomor} berhasil ditambahkan.` };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || 'Data tidak valid' };
    }
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return { success: false, error: msg };
  }
}

export async function ubahArmadaAction(id: string, input: unknown) {
  try {
    const { user: admin } = await requireRole(['admin']);
    const updateSchema = armadaSchema.extend({
      is_active: z.boolean().default(true),
    });
    const v = updateSchema.parse(input);

    // Cek plat nomor duplikat pada armada lain
    const { data: duplicate } = await supabaseAdmin
      .from('armada')
      .select('id')
      .ilike('plat_nomor', v.plat_nomor)
      .neq('id', id)
      .maybeSingle();

    if (duplicate) {
      return {
        success: false,
        error: `Plat nomor "${v.plat_nomor}" sudah digunakan oleh armada lain.`,
      };
    }

    const { error } = await supabaseAdmin
      .from('armada')
      .update({
        plat_nomor: v.plat_nomor,
        jenis: v.jenis,
        kapasitas_m3: v.kapasitas_m3 ?? null,
        wilayah: v.wilayah || null,
        status: v.status,
        is_active: v.is_active,
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: 'Gagal memperbarui armada: ' + error.message };
    }

    await supabaseAdmin.from('audit_log').insert({
      actor_id: admin.id,
      aksi: 'armada.ubah',
      entitas: 'armada',
      entitas_id: id,
      detail: { plat_nomor: v.plat_nomor, status: v.status, is_active: v.is_active },
    });

    revalidatePath('/admin/armada');
    revalidatePath('/kabid');
    return { success: true, message: `Armada ${v.plat_nomor} berhasil diperbarui.` };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || 'Data tidak valid' };
    }
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return { success: false, error: msg };
  }
}

export async function hapusArmadaAction(id: string) {
  try {
    const { user: admin } = await requireRole(['admin']);

    // Ambil info armada
    const { data: armada } = await supabaseAdmin
      .from('armada')
      .select('id, plat_nomor')
      .eq('id', id)
      .single();

    if (!armada) {
      return { success: false, error: 'Armada tidak ditemukan.' };
    }

    // Cek apakah armada memiliki riwayat perjalanan (UAT 14)
    const { count: riwayatCount } = await supabaseAdmin
      .from('perjalanan')
      .select('id', { count: 'exact', head: true })
      .eq('armada_id', id);

    if (riwayatCount && riwayatCount > 0) {
      // Soft delete: armada dinonaktifkan agar riwayat tetap utuh
      const { error: updateErr } = await supabaseAdmin
        .from('armada')
        .update({ is_active: false })
        .eq('id', id);

      if (updateErr) {
        return { success: false, error: 'Gagal menonaktifkan armada: ' + updateErr.message };
      }

      await supabaseAdmin.from('audit_log').insert({
        actor_id: admin.id,
        aksi: 'armada.hapus',
        entitas: 'armada',
        entitas_id: id,
        detail: { plat_nomor: armada.plat_nomor, soft_delete: true, riwayat_perjalanan: riwayatCount },
      });

      revalidatePath('/admin/armada');
      revalidatePath('/kabid');
      return {
        success: true,
        message: `Armada ${armada.plat_nomor} memiliki riwayat operasional, sehingga dinonaktifkan (arsip) dan riwayat tetap utuh.`,
      };
    }

    // Jika belum ada riwayat, boleh dihapus fisik
    const { error: deleteErr } = await supabaseAdmin
      .from('armada')
      .delete()
      .eq('id', id);

    if (deleteErr) {
      return { success: false, error: 'Gagal menghapus armada: ' + deleteErr.message };
    }

    await supabaseAdmin.from('audit_log').insert({
      actor_id: admin.id,
      aksi: 'armada.hapus',
      entitas: 'armada',
      entitas_id: id,
      detail: { plat_nomor: armada.plat_nomor, soft_delete: false },
    });

    revalidatePath('/admin/armada');
    revalidatePath('/kabid');
    return {
      success: true,
      message: `Armada ${armada.plat_nomor} berhasil dihapus permanen.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return { success: false, error: msg };
  }
}

// ==========================================
// 2. ACTIONS PENGGUNA
// ==========================================

export async function tambahPenggunaAction(input: unknown) {
  try {
    const { user: admin } = await requireRole(['admin']);
    const v = penggunaSchema.parse(input);

    // Cek username unik di profiles (Layar 21b)
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', v.username)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: `Username "${v.username}" sudah digunakan oleh akun lain.`,
      };
    }

    // Buat akun auth di Supabase Auth
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: toEmail(v.username),
      password: v.password,
      email_confirm: true,
      user_metadata: { role: v.role, username: v.username },
    });

    if (authErr || !authUser.user) {
      return {
        success: false,
        error: 'Gagal membuat akun auth: ' + (authErr?.message || 'Username mungkin sudah ada'),
      };
    }

    // Insert profil ke public.profiles
    const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
      id: authUser.user.id,
      username: v.username,
      nama_lengkap: v.nama_lengkap,
      role: v.role,
      is_active: true,
    });

    if (profileErr) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return {
        success: false,
        error: 'Gagal menyimpan profil pengguna: ' + profileErr.message,
      };
    }

    // Catat audit log
    await supabaseAdmin.from('audit_log').insert({
      actor_id: admin.id,
      aksi: 'pengguna.buat',
      entitas: 'profiles',
      entitas_id: authUser.user.id,
      detail: { username: v.username, nama_lengkap: v.nama_lengkap, role: v.role },
    });

    revalidatePath('/admin/pengguna');
    return {
      success: true,
      message: `Akun @${v.username} (${v.nama_lengkap}) berhasil dibuat.`,
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || 'Data tidak valid' };
    }
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return { success: false, error: msg };
  }
}

export async function ubahPenggunaAction(
  id: string,
  input: {
    nama_lengkap: string;
    role: 'sopir' | 'kabid' | 'admin';
    is_active: boolean;
    password?: string;
  }
) {
  try {
    const { user: admin } = await requireRole(['admin']);

    if (!input.nama_lengkap || input.nama_lengkap.trim().length < 2) {
      return { success: false, error: 'Nama lengkap minimal 2 karakter.' };
    }

    // Proteksi akun admin sendiri (UAT 15)
    if (id === admin.id) {
      if (!input.is_active) {
        return { success: false, error: 'Anda tidak dapat menonaktifkan akun Anda sendiri.' };
      }
      if (input.role !== 'admin') {
        return { success: false, error: 'Anda tidak dapat mengubah peran akun Anda sendiri.' };
      }
    }

    // Update profil
    const { error: profErr } = await supabaseAdmin
      .from('profiles')
      .update({
        nama_lengkap: input.nama_lengkap.trim(),
        role: input.role,
        is_active: input.is_active,
      })
      .eq('id', id);

    if (profErr) {
      return { success: false, error: 'Gagal memperbarui profil: ' + profErr.message };
    }

    // Jika ganti password
    if (input.password && input.password.trim().length >= 8) {
      const { error: passErr } = await supabaseAdmin.auth.admin.updateUserById(id, {
        password: input.password.trim(),
      });
      if (passErr) {
        return { success: false, error: 'Gagal mengganti password: ' + passErr.message };
      }
    }

    // Jika dinonaktifkan, hentikan sesi login (ban duration)
    if (!input.is_active) {
      await supabaseAdmin.auth.admin.updateUserById(id, {
        ban_duration: '876000h',
      });
    } else {
      // Cabut ban jika diaktifkan kembali
      await supabaseAdmin.auth.admin.updateUserById(id, {
        ban_duration: 'none',
      });
    }

    await supabaseAdmin.from('audit_log').insert({
      actor_id: admin.id,
      aksi: 'pengguna.ubah',
      entitas: 'profiles',
      entitas_id: id,
      detail: { role: input.role, is_active: input.is_active },
    });

    revalidatePath('/admin/pengguna');
    return { success: true, message: 'Data pengguna berhasil diperbarui.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return { success: false, error: msg };
  }
}

export async function hapusPenggunaAction(id: string) {
  try {
    const { user: admin } = await requireRole(['admin']);

    // Proteksi: Admin tidak boleh menghapus dirinya sendiri (UAT 15)
    if (id === admin.id) {
      return {
        success: false,
        error: 'Anda tidak dapat menghapus akun Anda sendiri.',
      };
    }

    // Ambil info profile
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, username, nama_lengkap, role')
      .eq('id', id)
      .single();

    if (!targetProfile) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    // Cek riwayat aktivitas pengguna
    const [perjalananRes, buktiRes, aduanRes, responRes] = await Promise.all([
      supabaseAdmin.from('perjalanan').select('id', { count: 'exact', head: true }).eq('sopir_id', id),
      supabaseAdmin.from('bukti_pengangkutan').select('id', { count: 'exact', head: true }).eq('sopir_id', id),
      supabaseAdmin.from('aduan').select('id', { count: 'exact', head: true }).eq('ditangani_oleh', id),
      supabaseAdmin.from('respon_aduan').select('id', { count: 'exact', head: true }).eq('petugas_id', id),
    ]);

    const hasHistory =
      (perjalananRes.count ?? 0) > 0 ||
      (buktiRes.count ?? 0) > 0 ||
      (aduanRes.count ?? 0) > 0 ||
      (responRes.count ?? 0) > 0;

    if (hasHistory) {
      // Soft delete: nonaktifkan akun dan ban auth agar sesi langsung mati
      await supabaseAdmin.from('profiles').update({ is_active: false }).eq('id', id);
      await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '876000h' });

      await supabaseAdmin.from('audit_log').insert({
        actor_id: admin.id,
        aksi: 'pengguna.hapus',
        entitas: 'profiles',
        entitas_id: id,
        detail: { username: targetProfile.username, soft_delete: true },
      });

      revalidatePath('/admin/pengguna');
      return {
        success: true,
        message: `Akun @${targetProfile.username} memiliki riwayat data operasional, sehingga akun dinonaktifkan (arsip) dan sesi dihentikan.`,
      };
    }

    // Jika tidak punya riwayat apapun, boleh dihapus fisik
    await supabaseAdmin.from('profiles').delete().eq('id', id);
    await supabaseAdmin.auth.admin.deleteUser(id);

    await supabaseAdmin.from('audit_log').insert({
      actor_id: admin.id,
      aksi: 'pengguna.hapus',
      entitas: 'profiles',
      entitas_id: id,
      detail: { username: targetProfile.username, soft_delete: false },
    });

    revalidatePath('/admin/pengguna');
    return {
      success: true,
      message: `Akun @${targetProfile.username} berhasil dihapus permanen.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return { success: false, error: msg };
  }
}

// ==========================================
// 3. ACTIONS RETENSI DATA IDENTITAS WARGA (UU NO. 27/2022 PDP)
// ==========================================

export async function jalankanRetensiAction(tahun: number = 2) {
  try {
    const { user: admin } = await requireRole(['admin']);

    // Validasi parameter tahun (default 2 tahun sesuai UU PDP)
    const tahunValid = Math.max(1, Math.min(10, Math.floor(tahun)));

    // Panggil fungsi database yang menganonimkan aduan selesai > N tahun
    // ponytail: rpc anonimkan_aduan_kadaluwarsa returns table(jumlah_dianonimkan int)
    const { data, error } = await supabaseAdmin.rpc('anonimkan_aduan_kadaluwarsa', {
      p_tahun: tahunValid,
    });

    if (error) {
      return {
        success: false,
        error: 'Gagal menjalankan pembersihan UU PDP: ' + error.message,
      };
    }

    const count =
      data && Array.isArray(data) && data.length > 0
        ? data[0].jumlah_dianonimkan
        : 0;

    // Catat audit log untuk eksekusi manual oleh admin
    await supabaseAdmin.from('audit_log').insert({
      actor_id: admin.id,
      aksi: 'aduan.retensi_uupdp_manual',
      entitas: 'aduan',
      detail: {
        tahun_retensi: tahunValid,
        jumlah_dianonimkan: count,
        dieksekusi_oleh: admin.id,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/retensi');
    revalidatePath('/kabid/aduan');

    return {
      success: true,
      count,
      message:
        count > 0
          ? `Pembersihan berhasil. Sebanyak ${count} data aduan warga (> ${tahunValid} tahun) berhasil dianonimkan sesuai UU PDP.`
          : `Pemeriksaan selesai. Tidak ada data aduan warga (> ${tahunValid} tahun) yang perlu dianonimkan saat ini.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return { success: false, error: msg };
  }
}

// ==========================================
// ACTIONS TPS
// ==========================================

const tpsSchema = z.object({
  nama: z.string().trim().min(2, 'Nama TPS minimal 2 karakter').max(100),
  kecamatan: z.string().trim().min(2, 'Kecamatan minimal 2 karakter').max(100),
  alamat: z.string().trim().max(300).optional().nullable(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  is_active: z.boolean().default(true),
});

export async function tambahTpsAction(input: unknown) {
  try {
    const { user: admin } = await requireRole(['admin']);
    const v = tpsSchema.parse(input);

    const { data, error } = await supabaseAdmin
      .from('tps')
      .insert({
        nama: v.nama,
        kecamatan: v.kecamatan,
        alamat: v.alamat || null,
        lat: v.lat ?? null,
        lng: v.lng ?? null,
        is_active: v.is_active,
      })
      .select()
      .single();

    if (error || !data) {
      if (error?.code === '23505') {
        return { success: false, error: 'TPS dengan nama tersebut sudah terdaftar di kecamatan ini.' };
      }
      return { success: false, error: 'Gagal menambahkan TPS: ' + error?.message };
    }

    await supabaseAdmin.from('audit_log').insert({
      actor_id: admin.id,
      aksi: 'tps.buat',
      entitas: 'tps',
      entitas_id: data.id,
      detail: { nama: data.nama, kecamatan: data.kecamatan },
    });

    revalidatePath('/admin/tps');
    return { success: true, message: `TPS ${data.nama} berhasil ditambahkan.` };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || 'Data tidak valid' };
    }
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return { success: false, error: msg };
  }
}

export async function ubahTpsAction(id: string, input: unknown) {
  try {
    const { user: admin } = await requireRole(['admin']);
    const v = tpsSchema.parse(input);

    const { data, error } = await supabaseAdmin
      .from('tps')
      .update({
        nama: v.nama,
        kecamatan: v.kecamatan,
        alamat: v.alamat || null,
        lat: v.lat ?? null,
        lng: v.lng ?? null,
        is_active: v.is_active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      if (error?.code === '23505') {
        return { success: false, error: 'TPS dengan nama tersebut sudah terdaftar di kecamatan ini.' };
      }
      return { success: false, error: 'Gagal mengubah TPS: ' + error?.message };
    }

    await supabaseAdmin.from('audit_log').insert({
      actor_id: admin.id,
      aksi: 'tps.ubah',
      entitas: 'tps',
      entitas_id: data.id,
      detail: { nama: data.nama, kecamatan: data.kecamatan, is_active: data.is_active },
    });

    revalidatePath('/admin/tps');
    return { success: true, message: `TPS ${data.nama} berhasil diubah.` };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || 'Data tidak valid' };
    }
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return { success: false, error: msg };
  }
}

export async function nonaktifkanTpsAction(id: string) {
  try {
    const { user: admin } = await requireRole(['admin']);
    const { data, error } = await supabaseAdmin
      .from('tps')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: 'Gagal menonaktifkan TPS: ' + error?.message };
    }

    await supabaseAdmin.from('audit_log').insert({
      actor_id: admin.id,
      aksi: 'tps.nonaktif',
      entitas: 'tps',
      entitas_id: data.id,
      detail: { nama: data.nama, kecamatan: data.kecamatan },
    });

    revalidatePath('/admin/tps');
    return { success: true, message: `TPS ${data.nama} dinonaktifkan.` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return { success: false, error: msg };
  }
}

