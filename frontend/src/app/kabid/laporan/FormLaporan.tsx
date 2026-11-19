'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export function FormLaporan() {
  // Hitung default tanggal (30 hari terakhir sampai hari ini dalam WIB)
  const today = new Date();
  const past30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const formatIsoDate = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(d);

  const [jenis, setJenis] = useState<'semua' | 'aduan' | 'perjalanan'>('semua');
  const [from, setFrom] = useState(formatIsoDate(past30));
  const [to, setTo] = useState(formatIsoDate(today));
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState(null);
    setSuccessInfo(null);

    if (!from || !to) {
      setErrorState('Tanggal awal dan tanggal akhir wajib diisi.');
      return;
    }

    if (from > to) {
      setErrorState(
        'Rentang tanggal tidak valid. Tanggal awal tidak boleh melebihi tanggal akhir. Silakan periksa kembali rentang tanggal Anda.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const url = `/api/laporan?jenis=${encodeURIComponent(jenis)}&from=${encodeURIComponent(
        from
      )}&to=${encodeURIComponent(to)}`;

      const res = await fetch(url, {
        method: 'GET',
      });

      if (!res.ok) {
        // Layar 15b: Tangani response error JSON
        const contentType = res.headers.get('content-type') || '';
        let errorMsg = 'Gagal membuat file laporan.';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          errorMsg = json.error || errorMsg;
        } else {
          errorMsg = `Gagal mengunduh laporan (Status ${res.status})`;
        }
        setErrorState(errorMsg);
        return;
      }

      // Ambil blob file Excel
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `laporan-${jenis}-${from}_${to}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccessInfo(
        `Laporan berhasil dibuat dan diunduh (laporan-${jenis}-${from}_${to}.xlsx).`
      );
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Terjadi gangguan jaringan saat mengunduh laporan. Periksa koneksi internet Anda.';
      setErrorState(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* State Layar 15b: Error Banner yang dapat ditindaklanjuti */}
      {errorState && (
        <Alert
          type="error"
          title="Laporan Gagal Dibuat (Layar 15b)"
          className="border-red-300 bg-red-50"
        >
          <div className="space-y-2 mt-1">
            <p className="text-sm font-medium text-red-900">{errorState}</p>
            <div className="text-xs text-red-700 bg-red-100/60 p-2.5 rounded-lg border border-red-200">
              <strong className="block font-semibold mb-1">Saran Perbaikan:</strong>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Pastikan tanggal awal tidak melebihi tanggal akhir.</li>
                <li>Pilih rentang tanggal yang memiliki data aktivitas operasional/aduan.</li>
                <li>Jika data terlalu banyak (&gt;10.000 baris), perpendek rentang tanggal menjadi mingguan atau bulanan.</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setErrorState(null)}
              className="text-xs font-semibold text-red-800 underline hover:text-red-950 mt-1 block"
            >
              Tutup Pesan Peringatan
            </button>
          </div>
        </Alert>
      )}

      {/* State Berhasil */}
      {successInfo && (
        <Alert type="success" title="Ekspor Selesai">
          <p className="text-sm text-emerald-900">{successInfo}</p>
        </Alert>
      )}

      {/* Form Layar 15: Ekspor Laporan */}
      <Card className="p-5 sm:p-6 border border-gray-200 shadow-2xs">
        <form onSubmit={handleDownload} className="space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">
              Parameter Laporan Operasional
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tentukan jenis data dan rentang waktu laporan yang ingin diekspor ke format spreadsheet Microsoft Excel (.xlsx).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Jenis Laporan */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Jenis Laporan <span className="text-danger">*</span>
              </label>
              <Select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as 'semua' | 'aduan' | 'perjalanan')}
                disabled={isLoading}
                className="text-sm"
              >
                <option value="semua">Semua (Aduan &amp; Perjalanan)</option>
                <option value="aduan">Aduan Masyarakat Saja</option>
                <option value="perjalanan">Perjalanan Armada &amp; Bukti Saja</option>
              </Select>
              <span className="text-[11px] text-gray-400 block mt-1">
                {jenis === 'semua'
                  ? 'Menghasilkan 2 sheet: Aduan & Perjalanan'
                  : jenis === 'aduan'
                  ? 'Sheet berisi daftar aduan, status, dan respon'
                  : 'Sheet berisi ritasi perjalanan armada & bukti'}
              </span>
            </div>

            {/* 2. Tanggal Mulai */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Tanggal Mulai (Dari) <span className="text-danger">*</span>
              </label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                disabled={isLoading}
                className="text-sm"
                required
              />
              <span className="text-[11px] text-gray-400 block mt-1">
                Waktu awal 00:00:00 WIB
              </span>
            </div>

            {/* 3. Tanggal Selesai */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Tanggal Selesai (Sampai) <span className="text-danger">*</span>
              </label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={isLoading}
                className="text-sm"
                required
              />
              <span className="text-[11px] text-gray-400 block mt-1">
                Waktu akhir 23:59:59 WIB
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              Maksimal 10.000 baris data per unduhan file Excel.
            </span>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full sm:w-auto min-w-[200px] min-h-[46px] font-semibold text-sm shadow-xs"
            >
              {isLoading ? 'Menyiapkan Excel...' : 'Unduh Laporan (.xlsx)'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Panduan & Struktur Kolom Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
        <Card className="p-4 border border-gray-200">
          <div className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Sheet 1: Aduan Masyarakat
          </div>
          <p className="text-gray-500 mb-2 text-[11px]">
            Memuat data seluruh aduan masyarakat dalam rentang tanggal terpilih:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-gray-700 font-mono text-[11px]">
            <li>Kode Tiket</li>
            <li>Tanggal &amp; Waktu (WIB)</li>
            <li>Nama Pelapor &amp; Telepon</li>
            <li>Deskripsi Lokasi Sampah</li>
            <li>Status (BARU / DIPROSES / SELESAI / DITOLAK)</li>
            <li>Petugas Penanggung Jawab</li>
          </ul>
        </Card>

        <Card className="p-4 border border-gray-200">
          <div className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Sheet 2: Perjalanan &amp; Bukti
          </div>
          <p className="text-gray-500 mb-2 text-[11px]">
            Memuat data ritasi pengangkutan sampah oleh armada DLH:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-gray-700 font-mono text-[11px]">
            <li>Plat Nomor &amp; Jenis Armada</li>
            <li>Nama Sopir / Pengemudi</li>
            <li>Waktu Mulai &amp; Selesai (WIB)</li>
            <li>Status Perjalanan (BERJALAN / SELESAI)</li>
            <li>Jumlah Foto Bukti Diunggah</li>
            <li>Ringkasan Akhir Perjalanan</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
