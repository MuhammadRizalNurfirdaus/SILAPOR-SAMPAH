'use client';

import { useState, useTransition } from 'react';
import type { Json } from '@/types/database.types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Dialog } from '@/components/ui/Dialog';
import { jalankanRetensiAction } from '@/app/admin/actions';

interface RetensiClientProps {
  initialStats: {
    totalSelesai: number;
    sudahAnonim: number;
    perluAnonim: number;
  };
  initialLogs: Array<{
    id: number;
    actor_id: string | null;
    aksi: string;
    detail: Json;
    created_at: string;
  }>;
}

export default function RetensiClient({
  initialStats,
  initialLogs,
}: RetensiClientProps) {
  const [tahun, setTahun] = useState<number>(2);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleEksekusi = () => {
    setShowConfirm(false);
    startTransition(async () => {
      const res = await jalankanRetensiAction(tahun);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || 'Pembersihan data UU PDP berhasil dijalankan.',
        });
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Gagal menjalankan pembersihan data.',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              Retensi Data Identitas Warga
            </h1>
            <Badge status="primary" size="sm">
              UU PDP No. 27/2022
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
            Pembersihan dan anonimisasi data pribadi pelapor (nama, nomor telepon, dan IP hash)
            pada aduan yang telah berstatus selesai lebih dari 2 tahun guna menjamin kepatuhan
            terhadap Undang-Undang Pelindungan Data Pribadi.
          </p>
        </div>
      </div>

      {/* Banner Feedback / Notifikasi */}
      {notification && (
        <Alert
          type={notification.type}
          title={notification.type === 'success' ? 'Berhasil' : 'Informasi'}
        >
          {notification.message}
        </Alert>
      )}

      {/* 4 Kartu Metrik Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Total Aduan Selesai
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center text-xs font-bold">
              ∑
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {initialStats.totalSelesai}
            </span>
            <span className="text-xs text-gray-500">aduan</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Seluruh aduan yang telah dituntaskan
          </p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Perlu Anonimisasi (&gt; 2 Thn)
            </span>
            <Badge
              status={initialStats.perluAnonim > 0 ? 'warning' : 'gray'}
              size="sm"
            >
              {initialStats.perluAnonim > 0 ? 'Perlu Tindakan' : 'Nihil'}
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                initialStats.perluAnonim > 0 ? 'text-amber-600' : 'text-gray-900'
              }`}
            >
              {initialStats.perluAnonim}
            </span>
            <span className="text-xs text-gray-500">aduan</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Aduan selesai berusia lebih dari 2 tahun
          </p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Telah Dianonimkan
            </span>
            <Badge status="selesai" size="sm">
              Terlindungi
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-success">
              {initialStats.sudahAnonim}
            </span>
            <span className="text-xs text-gray-500">aduan</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Data pribadi disamarkan (Anonim UU PDP)
          </p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Otomatisasi Cron
            </span>
            <Badge status="beroperasi" size="sm">
              Aktif
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              09:00 WIB
            </span>
            <span className="text-xs text-gray-500">Harian</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Vercel Cron: <code className="text-primary font-mono">0 2 * * *</code>
          </p>
        </Card>
      </div>

      {/* Panel Aksi Eksekusi Manual */}
      <Card className="p-4 sm:p-6 border border-gray-200">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
          Pembersihan Manual &amp; Penyesuaian Kebijakan
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
          Selain pembersihan otomatis harian melalui background cron, administrator dapat
          menjalankan anonimisasi seketika untuk aduan yang telah memenuhi ambang batas usia.
        </p>

        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 sm:p-4 mb-5 text-xs sm:text-sm text-blue-900 space-y-2">
          <div className="font-semibold flex items-center gap-1.5 text-primary">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Dampak Pembersihan Data Pelapor:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs text-blue-800">
            <li>
              <strong>Nama Pelapor</strong> diubah menjadi:{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px]">
                Masyarakat (Anonim UU PDP)
              </code>
            </li>
            <li>
              <strong>Nomor Kontak</strong> diubah menjadi:{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px]">
                080000000000
              </code>
            </li>
            <li>
              <strong>Hash Alamat IP</strong> dikosongkan (<code>null</code>).
            </li>
            <li>
              <strong>Data Statistik &amp; Audit</strong>: Foto bukti timbunan, titik koordinat peta (lat/lng), waktu aduan, dan riwayat penanganan DLH tetap dipertahankan untuk kebutuhan pelaporan tahunan.
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="sm:w-64">
            <label
              htmlFor="ambang-tahun"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Batas Usia Aduan Selesai
            </label>
            <select
              id="ambang-tahun"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              disabled={isPending}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              <option value={2}>2 Tahun (Standar UU PDP No. 27/2022)</option>
              <option value={1}>1 Tahun (Pengujian Cepat)</option>
              <option value={3}>3 Tahun (Arsip Ekstra)</option>
            </select>
          </div>

          <div className="sm:self-end">
            <Button
              type="button"
              variant="primary"
              disabled={isPending}
              onClick={() => setShowConfirm(true)}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {isPending ? 'Memproses...' : 'Jalankan Anonimisasi Sekarang'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Riwayat Audit Retensi */}
      <Card className="p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Riwayat Audit Pembersihan Data Pribadi
            </h2>
            <p className="text-xs text-gray-500">
              Log kepatuhan eksekusi retensi (otomatis cron maupun manual admin)
            </p>
          </div>
          <Badge status="info" size="sm">
            Tercatat Sistem
          </Badge>
        </div>

        {initialLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs sm:text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Belum ada catatan pembersihan data pribadi yang tercatat di audit log.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-700 font-semibold">
                  <tr>
                    <th scope="col" className="px-4 py-3">Waktu (WIB)</th>
                    <th scope="col" className="px-4 py-3">Metode</th>
                    <th scope="col" className="px-4 py-3">Jumlah Baris</th>
                    <th scope="col" className="px-4 py-3">Keterangan / Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {initialLogs.map((log) => {
                    const isManual = log.aksi.includes('manual');
                    const waktu = new Date(log.created_at).toLocaleString('id-ID', {
                      timeZone: 'Asia/Jakarta',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    });

                    const detailObj =
                      log.detail && typeof log.detail === 'object' && !Array.isArray(log.detail)
                        ? (log.detail as Record<string, unknown>)
                        : {};

                    const count = Number(
                      detailObj.jumlah_baris ?? detailObj.jumlah_dianonimkan ?? 0
                    );

                    const keterangan =
                      typeof detailObj.keterangan === 'string'
                        ? detailObj.keterangan
                        : `Pembersihan retensi ${typeof detailObj.tahun_retensi === 'number' ? detailObj.tahun_retensi : 2} tahun`;

                    return (
                      <tr key={log.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-600">
                          {waktu} WIB
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            status={isManual ? 'warning' : 'beroperasi'}
                            size="sm"
                          >
                            {isManual ? 'Manual Admin' : 'Cron Otomatis'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-900">
                          {count} aduan
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">
                          {keterangan}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Dialog Konfirmasi Eksekusi */}
      <Dialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Konfirmasi Anonimisasi Data UU PDP"
        description="Tindakan ini akan menghapus/menyamarkan data identitas pelapor (nama, nomor telepon, IP) pada seluruh aduan berstatus selesai yang berusia lebih dari batas yang dipilih. Tindakan ini bersifat permanen demi kepatuhan UU PDP."
      >
        <div className="space-y-4 pt-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
            <strong>Batas Usia:</strong> Aduan berstatus <em>selesai</em> yang diselesaikan sebelum{' '}
            <strong>{tahun} tahun lalu</strong> akan dianonimkan.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleEksekusi}
              className="min-h-[44px]"
            >
              Ya, Jalankan Sekarang
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
