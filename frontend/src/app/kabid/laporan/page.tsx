import { Metadata } from 'next';
import { FormLaporan } from './FormLaporan';

export const metadata: Metadata = {
  title: 'Laporan & Ekspor Excel | SILAPOR SAMPAH DLH Kuningan',
  description: 'Unduh laporan rekapitulasi aduan dan operasional pengangkutan sampah DLH Kuningan dalam format Excel (.xlsx).',
};

export default function KabidLaporanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Laporan Operasional &amp; Ekspor Excel
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Unduh rekapitulasi data aduan masyarakat dan operasional pengangkutan sampah dalam format Microsoft Excel (.xlsx).
        </p>
      </div>

      <FormLaporan />
    </div>
  );
}
