'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { formatWIB } from '@/lib/format/date';

interface ResponItem {
  status: string;
  catatan: string;
  waktu: string;
}

interface AduanDetail {
  kode_tiket: string;
  status: 'baru' | 'diproses' | 'selesai' | 'ditolak';
  created_at: string;
  updated_at: string;
  respon: ResponItem[];
}

export function CekStatusForm() {
  const searchParams = useSearchParams();
  const initialKode = searchParams.get('kode') ?? '';

  const [kode, setKode] = useState(initialKode);
  const [isLoading, setIsLoading] = useState(Boolean(initialKode));
  const [result, setResult] = useState<AduanDetail | null>(null);
  const [errorNotFound, setErrorNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialKode) return;

    let isMounted = true;
    async function loadInitial() {
      try {
        const res = await fetch(
          `/api/cek-status?kode=${encodeURIComponent(initialKode.trim().toUpperCase())}`
        );
        const data = await res.json();

        if (!isMounted) return;

        if (res.status === 429) {
          setErrorMessage('Terlalu banyak permintaan. Silakan tunggu 1 menit.');
        } else if (!res.ok || !data.found) {
          setErrorNotFound(true);
        } else {
          setResult(data.aduan);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching status:', err);
          setErrorMessage('Terjadi gangguan jaringan saat menghubungi server.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [initialKode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = kode.trim().toUpperCase();
    if (!trimmed) return;

    setIsLoading(true);
    setErrorNotFound(false);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await fetch(`/api/cek-status?kode=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (res.status === 429) {
        setErrorMessage('Terlalu banyak permintaan. Silakan tunggu 1 menit.');
        return;
      }

      if (!res.ok || !data.found) {
        // Layar 06b: Tidak ditemukan
        setErrorNotFound(true);
        return;
      }

      setResult(data.aduan);
    } catch (err) {
      console.error('Error fetching status:', err);
      setErrorMessage('Terjadi gangguan jaringan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: AduanDetail['status']) => {
    switch (status) {
      case 'baru':
        return <Badge status="baru">Baru Dilaporkan</Badge>;
      case 'diproses':
        return <Badge status="diproses">Sedang Ditangani</Badge>;
      case 'selesai':
        return <Badge status="selesai">Selesai Diangkut</Badge>;
      case 'ditolak':
        return <Badge status="ditolak">Laporan Ditolak</Badge>;
      default:
        return <Badge status="gray">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulir Pencarian Kode Tiket (Layar 06 Figma) */}
      <Card className="p-6 sm:p-8 shadow-sm border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1 w-full">
              <Input
                label="Nomor Laporan Aduan"
                id="kode_tiket"
                name="kode_tiket"
                type="text"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                placeholder="Contoh: SLP-2611-XXXXXXXX"
                requiredIndicator
                required
                helperText="Format: SLP-YYMM-XXXXXXXX (didapatkan saat laporan berhasil dikirim)"
                disabled={isLoading}
                className="font-mono uppercase tracking-wider"
              />
            </div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full sm:w-auto min-h-[44px] px-6 shrink-0"
            >
              Cek Status
            </Button>
          </div>
        </form>
      </Card>

      {/* Alert Error / Limit */}
      {errorMessage && (
        <Alert type="error" title="Gagal Memeriksa">
          {errorMessage}
        </Alert>
      )}

      {/* Layar 06b: Aduan Tidak Ditemukan */}
      {errorNotFound && (
        <Card className="p-6 sm:p-8 border-amber-200 bg-amber-50/50 text-center space-y-3 animate-in fade-in">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
            ?
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Aduan Tidak Ditemukan
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Nomor laporan aduan <span className="font-mono font-bold text-gray-800">{kode}</span> tidak terdaftar dalam sistem.
            Pastikan tidak ada kesalahan ketik huruf/angka pada nomor laporan aduan Anda.
          </p>
        </Card>
      )}

      {/* Layar 06: Hasil Status Aduan & Riwayat Respon Publik */}
      {result && (
        <Card className="p-6 sm:p-8 shadow-sm border-gray-200 space-y-6 animate-in fade-in">
          {/* Header Aduan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
            <div>
              <span className="text-xs uppercase font-semibold text-gray-500">
                Nomor Laporan Aduan
              </span>
              <h2 className="text-2xl font-mono font-bold text-gray-900">
                {result.kode_tiket}
              </h2>
            </div>
            <div>
              {getStatusBadge(result.status)}
            </div>
          </div>

          {/* Info Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-xs text-gray-500 block">Waktu Dilaporkan</span>
              <span className="font-semibold text-gray-800">{formatWIB(result.created_at)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Terakhir Diperbarui</span>
              <span className="font-semibold text-gray-800">{formatWIB(result.updated_at)}</span>
            </div>
          </div>

          {/* Timeline Riwayat Respon Petugas */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Riwayat Tindak Lanjut Petugas
            </h3>

            {result.respon && result.respon.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                {result.respon.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Titik timeline */}
                    <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-xs" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-primary border border-emerald-200">
                          {item.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatWIB(item.waktu)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                        {item.catatan}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                Belum ada catatan tindak lanjut dari petugas operasional. Aduan Anda telah terdaftar dan sedang dalam antrean verifikasi.
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
