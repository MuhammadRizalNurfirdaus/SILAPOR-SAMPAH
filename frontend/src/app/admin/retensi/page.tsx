import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/guard';
import { supabaseAdmin } from '@/lib/supabase/admin';
import RetensiClient from './RetensiClient';

export const metadata: Metadata = {
  title: 'Retensi Data Identitas Warga (UU PDP) | SILAPOR SAMPAH',
  description:
    'Pengelolaan retensi dan anonimisasi data identitas pelapor aduan sesuai UU No. 27/2022 tentang Pelindungan Data Pribadi.',
};

export const dynamic = 'force-dynamic';

export default async function AdminRetensiPage() {
  await requireRole(['admin']);

  // Hitung metrik data aduan
  // eslint-disable-next-line react-hooks/purity
  const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();

  const [selesaiRes, sudahAnonimRes, perluAnonimRes, auditRes] = await Promise.all([
    supabaseAdmin.from('aduan').select('id', { count: 'exact', head: true }).eq('status', 'selesai'),
    supabaseAdmin
      .from('aduan')
      .select('id', { count: 'exact', head: true })
      .eq('nama_pelapor', 'Masyarakat (Anonim UU PDP)'),
    supabaseAdmin
      .from('aduan')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'selesai')
      .lt('updated_at', twoYearsAgo)
      .neq('nama_pelapor', 'Masyarakat (Anonim UU PDP)'),
    supabaseAdmin
      .from('audit_log')
      .select('id, actor_id, aksi, detail, created_at')
      .ilike('aksi', 'aduan.retensi%')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const stats = {
    totalSelesai: selesaiRes.count ?? 0,
    sudahAnonim: sudahAnonimRes.count ?? 0,
    perluAnonim: perluAnonimRes.count ?? 0,
  };

  const auditLogs = auditRes.data ?? [];

  return (
    <div className="space-y-6">
      <RetensiClient initialStats={stats} initialLogs={auditLogs} />
    </div>
  );
}
