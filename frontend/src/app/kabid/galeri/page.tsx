import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { GaleriClient, BuktiItem } from './GaleriClient';

export const metadata: Metadata = {
  title: 'Galeri Bukti Pengangkutan | SILAPOR SAMPAH DLH Kuningan',
  description: 'Dokumentasi foto bukti pengangkutan sampah oleh armada DLH Kuningan.',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    tanggal?: string;
    armadaId?: string;
    sopirId?: string;
  }>;
}

export default async function KabidGaleriPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tanggal = params.tanggal || '';
  const armadaId = params.armadaId || '';
  const sopirId = params.sopirId || '';

  const supabase = await createClient();

  // 1. Fetch data armada & sopir untuk filter
  const [armadaRes, sopirRes] = await Promise.all([
    supabase
      .from('armada')
      .select('id, plat_nomor, jenis')
      .eq('is_active', true)
      .order('plat_nomor'),
    supabase
      .from('profiles')
      .select('id, nama_lengkap')
      .eq('role', 'sopir')
      .eq('is_active', true)
      .order('nama_lengkap'),
  ]);

  const armadaList = armadaRes.data || [];
  const sopirList = sopirRes.data || [];

  // 2. Query bukti pengangkutan
  let query = supabase
    .from('bukti_pengangkutan')
    .select(`
      id,
      foto_path,
      created_at,
      keterangan,
      lat,
      lng,
      perjalanan:perjalanan_id!inner (
        id,
        armada:armada_id!inner (
          id,
          plat_nomor,
          jenis
        )
      ),
      sopir:sopir_id (
        nama_lengkap
      )
    `)
    .order('created_at', { ascending: false })
    .limit(60);

  if (armadaId) {
    query = query.eq('perjalanan.armada_id', armadaId);
  }

  if (sopirId) {
    query = query.eq('sopir_id', sopirId);
  }

  if (tanggal) {
    const startIso = new Date(`${tanggal}T00:00:00+07:00`).toISOString();
    const endIso = new Date(`${tanggal}T23:59:59.999+07:00`).toISOString();
    query = query.gte('created_at', startIso).lte('created_at', endIso);
  }

  const { data: buktiRows, error } = await query;

  if (error) {
    console.error('Error fetching bukti:', error);
  }

  interface RawBuktiRow {
    id: string;
    foto_path: string;
    created_at: string;
    keterangan: string | null;
    lat: number | null;
    lng: number | null;
    perjalanan: {
      id: string;
      armada: {
        id: string;
        plat_nomor: string;
        jenis: string;
      } | null;
    } | null;
    sopir: {
      nama_lengkap: string;
    } | null;
  }

  const rows = (buktiRows || []) as unknown as RawBuktiRow[];

  // 3. Generate signed URL (300 detik = 5 menit) untuk setiap foto
  const items: BuktiItem[] = await Promise.all(
    rows.map(async (row) => {
      let signedUrl = '/placeholder-image.png';
      try {
        const { data: signed } = await supabaseAdmin.storage
          .from('bukti-pengangkutan')
          .createSignedUrl(row.foto_path, 300);
        if (signed?.signedUrl) {
          signedUrl = signed.signedUrl;
        }
      } catch (err) {
        console.error('Failed to create signed URL for:', row.foto_path, err);
      }

      return {
        id: row.id,
        foto_path: row.foto_path,
        signed_url: signedUrl,
        created_at: row.created_at,
        keterangan: row.keterangan,
        lat: row.lat,
        lng: row.lng,
        plat_nomor: row.perjalanan?.armada?.plat_nomor || '-',
        jenis: row.perjalanan?.armada?.jenis || 'Truk',
        sopir_nama: row.sopir?.nama_lengkap || 'Sopir',
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Galeri Bukti Pengangkutan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Dokumentasi visual foto hasil kerja pengangkutan sampah oleh armada DLH Kuningan.
        </p>
      </div>

      <GaleriClient
        items={items}
        armadaList={armadaList}
        sopirList={sopirList}
        initialFilters={{ tanggal, armadaId, sopirId }}
      />
    </div>
  );
}
