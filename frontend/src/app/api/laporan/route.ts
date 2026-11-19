import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import { formatWIB } from '@/lib/format/date';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verifikasi Sesi dan Peran (Kabid atau Admin)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Harap masuk terlebih dahulu untuk mengunduh laporan.' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (
      !profile ||
      !profile.is_active ||
      (profile.role !== 'kabid' && profile.role !== 'admin')
    ) {
      return NextResponse.json(
        { error: 'Hanya Kepala Bidang dan Admin yang memiliki izin mengunduh laporan.' },
        { status: 403 }
      );
    }

    // 2. Ambil parameter query
    const searchParams = request.nextUrl.searchParams;
    const jenis = searchParams.get('jenis') || 'semua'; // 'aduan' | 'perjalanan' | 'semua'
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Tanggal awal dan tanggal akhir wajib diisi.' },
        { status: 400 }
      );
    }

    // Validasi format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return NextResponse.json(
        { error: 'Format tanggal harus berupa YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const startDate = new Date(`${from}T00:00:00+07:00`);
    const endDate = new Date(`${to}T23:59:59.999+07:00`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Nilai tanggal tidak valid.' },
        { status: 400 }
      );
    }

    // Validasi tanggal terbalik (UAT 12)
    if (startDate > endDate) {
      return NextResponse.json(
        {
          error:
            'Rentang tanggal tidak valid. Tanggal awal tidak boleh lebih baru daripada tanggal akhir.',
        },
        { status: 400 }
      );
    }

    // Batas rentang maksimal 366 hari
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 366) {
      return NextResponse.json(
        { error: 'Rentang tanggal maksimal yang dapat diekspor adalah 1 tahun (366 hari).' },
        { status: 400 }
      );
    }

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    const wb = new ExcelJS.Workbook();
    wb.creator = 'SILAPOR SAMPAH DLH Kuningan';
    wb.created = new Date();

    let totalRowsCount = 0;

    // 3. Ambil data Aduan jika diminta
    if (jenis === 'aduan' || jenis === 'semua') {
      const { data: aduanRows, error: aduanErr } = await supabase
        .from('aduan')
        .select(`
          kode_tiket,
          created_at,
          nama_pelapor,
          no_telepon,
          deskripsi_lokasi,
          status,
          ditangani_oleh,
          petugas:ditangani_oleh (nama_lengkap)
        `)
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: false })
        .limit(10001); // cek batas 10.000

      if (aduanErr) {
        console.error('Error fetching aduan for export:', aduanErr);
        return NextResponse.json(
          { error: 'Gagal mengambil data aduan dari database.' },
          { status: 500 }
        );
      }

      interface AduanExportRow {
        kode_tiket: string;
        created_at: string;
        nama_pelapor: string;
        no_telepon: string;
        deskripsi_lokasi: string;
        status: string;
        petugas: { nama_lengkap: string } | null;
      }

      const rows = (aduanRows || []) as unknown as AduanExportRow[];
      totalRowsCount += rows.length;

      const wsAduan = wb.addWorksheet('Aduan');
      wsAduan.columns = [
        { header: 'Kode Tiket', key: 'kode_tiket', width: 22 },
        { header: 'Tanggal (WIB)', key: 'created_at', width: 26 },
        { header: 'Pelapor', key: 'nama_pelapor', width: 24 },
        { header: 'Telepon', key: 'no_telepon', width: 18 },
        { header: 'Lokasi Sampah', key: 'deskripsi_lokasi', width: 50 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Ditangani Oleh', key: 'petugas', width: 24 },
      ];

      rows.forEach((r) => {
        wsAduan.addRow({
          kode_tiket: r.kode_tiket,
          created_at: formatWIB(r.created_at),
          nama_pelapor: r.nama_pelapor,
          no_telepon: r.no_telepon,
          deskripsi_lokasi: r.deskripsi_lokasi,
          status: r.status.toUpperCase(),
          petugas: r.petugas?.nama_lengkap || '-',
        });
      });

      // Style header
      wsAduan.getRow(1).font = { bold: true };
      wsAduan.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' },
      };
    }

    // 4. Ambil data Perjalanan jika diminta
    if (jenis === 'perjalanan' || jenis === 'semua') {
      const { data: perjalananRows, error: perjalanErr } = await supabase
        .from('perjalanan')
        .select(`
          id,
          mulai_at,
          selesai_at,
          status,
          ringkasan,
          armada:armada_id (plat_nomor, jenis),
          sopir:sopir_id (nama_lengkap),
          bukti_pengangkutan (id)
        `)
        .gte('mulai_at', startIso)
        .lte('mulai_at', endIso)
        .order('mulai_at', { ascending: false })
        .limit(10001);

      if (perjalanErr) {
        console.error('Error fetching perjalanan for export:', perjalanErr);
        return NextResponse.json(
          { error: 'Gagal mengambil data perjalanan dari database.' },
          { status: 500 }
        );
      }

      interface PerjalananExportRow {
        plat_nomor?: string;
        jenis?: string;
        sopir?: string;
        mulai_at: string;
        selesai_at: string | null;
        status: string;
        ringkasan: string | null;
        armada: { plat_nomor: string; jenis: string } | null;
        sopir_profile: { nama_lengkap: string } | null;
        bukti_pengangkutan: { id: string }[] | null;
      }

      const rows = (perjalananRows || []) as unknown as PerjalananExportRow[];
      totalRowsCount += rows.length;

      const wsPerjalanan = wb.addWorksheet('Perjalanan & Bukti');
      wsPerjalanan.columns = [
        { header: 'Plat Nomor', key: 'plat_nomor', width: 18 },
        { header: 'Jenis Armada', key: 'jenis', width: 18 },
        { header: 'Sopir / Pengemudi', key: 'sopir', width: 24 },
        { header: 'Waktu Mulai (WIB)', key: 'mulai_at', width: 26 },
        { header: 'Waktu Selesai (WIB)', key: 'selesai_at', width: 26 },
        { header: 'Status Perjalanan', key: 'status', width: 16 },
        { header: 'Jumlah Bukti Foto', key: 'jumlah_bukti', width: 18 },
        { header: 'Ringkasan / Catatan', key: 'ringkasan', width: 45 },
      ];

      rows.forEach((p) => {
        wsPerjalanan.addRow({
          plat_nomor: p.armada?.plat_nomor || '-',
          jenis: p.armada?.jenis || '-',
          sopir: p.sopir_profile?.nama_lengkap || '-',
          mulai_at: formatWIB(p.mulai_at),
          selesai_at: p.selesai_at ? formatWIB(p.selesai_at) : 'Sedang Berjalan',
          status: p.status.toUpperCase(),
          jumlah_bukti: Array.isArray(p.bukti_pengangkutan) ? p.bukti_pengangkutan.length : 0,
          ringkasan: p.ringkasan || '-',
        });
      });

      wsPerjalanan.getRow(1).font = { bold: true };
      wsPerjalanan.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' },
      };
    }

    // 5. Validasi batas 10.000 baris (BUILD_GUIDE §6.9)
    if (totalRowsCount > 10000) {
      return NextResponse.json(
        {
          error: `Data laporan melebihi batas maksimal 10.000 baris (total ${totalRowsCount} baris). Harap perpendek rentang tanggal pencarian Anda.`,
        },
        { status: 400 }
      );
    }

    // 6. Validasi jika tidak ada data sama sekali (UAT 12)
    if (totalRowsCount === 0) {
      return NextResponse.json(
        {
          error: `Tidak ada data ${
            jenis === 'aduan'
              ? 'aduan'
              : jenis === 'perjalanan'
              ? 'perjalanan'
              : 'operasional'
          } yang ditemukan pada rentang tanggal ${from} sampai ${to}.`,
        },
        { status: 404 }
      );
    }

    // 7. Tulis buffer dan kirim response file Excel
    const buffer = await wb.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="laporan-${jenis}-${from}_${to}.xlsx"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: unknown) {
    console.error('Unhandled error in /api/laporan:', error);
    const errorMsg =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan sistem saat mengekspor laporan.';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
