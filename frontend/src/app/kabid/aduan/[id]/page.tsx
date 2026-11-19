import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatWIB } from '@/lib/format/date';
import { FormResponAduan } from './FormResponAduan';

export const metadata: Metadata = {
  title: 'Detail & Respon Aduan | SILAPOR SAMPAH DLH Kuningan',
  description: 'Tindak lanjut laporan aduan tumpukan sampah masyarakat Kabupaten Kuningan.',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KabidDetailAduanPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Ambil data aduan
  const { data: aduan, error: aduanError } = await supabase
    .from('aduan')
    .select(`
      id,
      kode_tiket,
      nama_pelapor,
      no_telepon,
      deskripsi_lokasi,
      foto_path,
      lat,
      lng,
      status,
      created_at,
      updated_at,
      ditangani_oleh,
      petugas:ditangani_oleh (nama_lengkap)
    `)
    .eq('id', id)
    .single();

  if (aduanError || !aduan) {
    notFound();
  }

  // 2. Ambil riwayat respon aduan
  const { data: responRows } = await supabase
    .from('respon_aduan')
    .select(`
      id,
      status_baru,
      catatan,
      tampil_ke_publik,
      created_at,
      petugas:petugas_id (nama_lengkap)
    `)
    .eq('aduan_id', id)
    .order('created_at', { ascending: true });

  interface ResponItem {
    id: string;
    status_baru: 'baru' | 'diproses' | 'selesai' | 'ditolak';
    catatan: string;
    tampil_ke_publik: boolean;
    created_at: string;
    petugas: { nama_lengkap: string } | null;
  }

  const responList = (responRows || []) as unknown as ResponItem[];

  // 3. Generate signed URL untuk foto aduan (300 detik = 5 menit)
  let fotoUrl = '/placeholder-image.png';
  try {
    const { data: signed } = await supabaseAdmin.storage
      .from('aduan-foto')
      .createSignedUrl(aduan.foto_path, 300);
    if (signed?.signedUrl) {
      fotoUrl = signed.signedUrl;
    }
  } catch (err) {
    console.error('Failed to create signed URL for aduan foto:', err);
  }

  return (
    <div className="space-y-6">
      {/* Tombol Kembali & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            href="/kabid/aduan"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-1.5 min-h-[36px]"
          >
            &larr; Kembali ke Daftar Aduan
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-gray-900 tracking-tight">
              {aduan.kode_tiket}
            </h1>
            <Badge status={aduan.status} size="md" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dilaporkan pada {formatWIB(aduan.created_at)}
          </p>
        </div>
      </div>

      {/* Grid 2 Kolom (Desktop >= 1024px) / Ditumpuk di Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Informasi Aduan & Foto (5 kolom) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Foto Aduan */}
          <Card className="overflow-hidden border border-gray-200 shadow-2xs">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Foto Aduan Warga</span>
              <a
                href={fotoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 min-h-[32px]"
              >
                Buka Ukuran Penuh &nearr;
              </a>
            </div>
            <div className="relative aspect-video sm:aspect-4/3 w-full bg-gray-100">
              <Image
                src={fotoUrl}
                alt={`Foto aduan ${aduan.kode_tiket}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </Card>

          {/* Card Informasi Pelapor & Lokasi */}
          <Card className="p-4 sm:p-5 space-y-4 border border-gray-200 shadow-2xs text-xs sm:text-sm">
            <h2 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
              Informasi Pelapor &amp; Lokasi
            </h2>

            <div className="space-y-3">
              <div>
                <span className="text-gray-400 block text-xs">Nama Pelapor:</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {aduan.nama_pelapor}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-xs">Nomor Telepon:</span>
                <a
                  href={`tel:${aduan.no_telepon}`}
                  className="font-medium text-primary hover:underline flex items-center gap-1 min-h-[32px]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {aduan.no_telepon}
                </a>
              </div>

              <div>
                <span className="text-gray-400 block text-xs">Deskripsi Titik Sampah:</span>
                <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-200 leading-relaxed text-xs">
                  {aduan.deskripsi_lokasi}
                </p>
              </div>

              {aduan.lat && aduan.lng && (
                <div>
                  <span className="text-gray-400 block text-xs">Koordinat Lokasi (GPS):</span>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${aduan.lat}&mlon=${aduan.lng}#map=16/${aduan.lat}/${aduan.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs mt-1 min-h-[36px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{aduan.lat.toFixed(5)}, {aduan.lng.toFixed(5)} (Buka di Peta)</span>
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Riwayat Respon & Form Tindak Lanjut (7 kolom) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Form Berikan Respon Baru */}
          <Card className="p-4 sm:p-5 border border-primary/30 shadow-xs bg-surface">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Berikan Respon &amp; Tindak Lanjut
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Respon akan memperbarui status aduan dan tercatat di riwayat tindak lanjut.
              </p>
            </div>

            <FormResponAduan
              aduanId={aduan.id}
              currentStatus={aduan.status}
            />
          </Card>

          {/* Timeline Riwayat Respon */}
          <Card className="p-4 sm:p-5 border border-gray-200 shadow-2xs">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
              Riwayat Respon Petugas ({responList.length})
            </h2>

            {responList.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-500">
                Belum ada respon yang dicatat untuk aduan ini. Gunakan form di atas untuk memberikan respon pertama.
              </div>
            ) : (
              <div className="relative border-l-2 border-primary/30 ml-3 space-y-6 pl-4">
                {responList.map((res) => (
                  <div key={res.id} className="relative group">
                    {/* Bullet marker */}
                    <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-primary shadow-xs" />

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge status={res.status_baru} size="sm" />
                          <span className="text-xs font-semibold text-gray-800">
                            {res.petugas?.nama_lengkap || 'Petugas DLH'}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {formatWIB(res.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200 leading-relaxed whitespace-pre-wrap">
                        {res.catatan}
                      </p>

                      <div className="flex items-center gap-1.5 text-[11px]">
                        {res.tampil_ke_publik ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Tampil di portal warga
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Catatan internal (rahasia)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
