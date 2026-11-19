'use client';

import { useState } from 'react';
import Link from 'next/link';
import { akhiriPerjalananAction } from '../../actions';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';

interface FormAkhiriProps {
  perjalananId: string;
  jumlahBukti: number;
}

export function FormAkhiriPerjalanan({ perjalananId, jumlahBukti }: FormAkhiriProps) {
  const [ringkasan, setRingkasan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi syarat bukti foto (UAT 9)
    if (jumlahBukti <= 0) {
      setErrorMsg('Unggah minimal satu foto bukti sebelum mengakhiri perjalanan');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('perjalanan_id', perjalananId);
    formData.append('ringkasan', ringkasan);

    try {
      const res = await akhiriPerjalananAction(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'digest' in err) {
        throw err;
      }
      setErrorMsg('Terjadi kesalahan saat mengakhiri perjalanan');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alert Error jika belum ada bukti foto atau gagal */}
      {errorMsg && (
        <Alert type="error" title="Gagal Mengakhiri Perjalanan">
          {errorMsg}
        </Alert>
      )}

      {/* Peringatan jika belum ada foto bukti */}
      {jumlahBukti <= 0 && (
        <Alert type="warning" title="Belum Ada Foto Bukti">
          <p className="text-sm">
            Sistem mewajibkan minimal 1 foto bukti pengangkutan sampah terunggah sebelum tugas perjalanan dapat diselesaikan.
          </p>
          <div className="pt-3">
            <Link href="/sopir/perjalanan/bukti">
              <Button size="sm" variant="primary">
                + Unggah Foto Bukti Sekarang
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      <div>
        <Textarea
          label="Ringkasan / Laporan Tugas (Opsional)"
          id="ringkasan"
          name="ringkasan"
          rows={3}
          value={ringkasan}
          onChange={(e) => setRingkasan(e.target.value)}
          placeholder="Tuliskan catatan kondisi lapangan, ritase, atau kendala selama pengangkutan..."
          maxLength={500}
          disabled={isLoading}
          helperText="Catatan ini akan tersimpan pada riwayat operasional armada"
        />
      </div>

      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          variant="danger"
          fullWidth
          size="lg"
          isLoading={isLoading}
          disabled={jumlahBukti <= 0 || isLoading}
          className="min-h-[56px] text-base font-bold shadow-md"
        >
          {isLoading ? 'Menyelesaikan Perjalanan...' : 'Konfirmasi Selesai & Kembali ke Garasi'}
        </Button>

        <Link href="/sopir/perjalanan" className="block w-full">
          <Button
            type="button"
            variant="outline"
            fullWidth
            size="md"
            className="min-h-[44px]"
            disabled={isLoading}
          >
            Batal
          </Button>
        </Link>
      </div>
    </form>
  );
}
