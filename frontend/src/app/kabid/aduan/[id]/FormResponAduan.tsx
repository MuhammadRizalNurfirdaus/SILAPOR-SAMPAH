'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { KabariWAButton } from '@/components/ui/KabariWAButton';
import { kirimResponAduanAction } from '@/app/kabid/actions';

interface FormResponAduanProps {
  aduanId: string;
  currentStatus: 'baru' | 'diproses' | 'selesai' | 'ditolak';
  pelaporNama?: string;
  pelaporPhone?: string;
  kodeTiket?: string;
}

export function FormResponAduan({
  aduanId,
  currentStatus,
  pelaporNama = 'Masyarakat',
  pelaporPhone,
  kodeTiket,
}: FormResponAduanProps) {
  const router = useRouter();

  // Rekomendasi status berikutnya
  const defaultNextStatus: 'diproses' | 'selesai' | 'ditolak' =
    currentStatus === 'baru'
      ? 'diproses'
      : currentStatus === 'diproses'
      ? 'selesai'
      : currentStatus;

  const [statusBaru, setStatusBaru] = useState<'diproses' | 'selesai' | 'ditolak'>(
    defaultNextStatus
  );
  const [catatan, setCatatan] = useState('');
  const [tampilKePublik, setTampilKePublik] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<{
    statusBaru: 'diproses' | 'selesai' | 'ditolak';
    catatan: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (catatan.trim().length < 3) {
      setError('Catatan tindak lanjut minimal 3 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      const submittedCatatan = catatan.trim();
      const res = await kirimResponAduanAction({
        aduan_id: aduanId,
        status_baru: statusBaru,
        catatan: submittedCatatan,
        tampil_ke_publik: tampilKePublik,
      });

      if (!res.success) {
        setError(res.error || 'Gagal mengirim respon aduan.');
      } else {
        setLastSubmitted({
          statusBaru,
          catatan: submittedCatatan,
        });
        setSuccess('Respon berhasil dicatat dan status aduan diperbarui.');
        setCatatan('');
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert type="error" title="Gagal Menyimpan">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" title="Respon Berhasil Disimpan">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-emerald-800">{success}</p>
            {pelaporPhone && lastSubmitted && kodeTiket && (
              <KabariWAButton
                phone={pelaporPhone}
                namaPelapor={pelaporNama}
                kodeTiket={kodeTiket}
                status={lastSubmitted.statusBaru}
                catatan={lastSubmitted.catatan}
                size="sm"
                variant="solid"
                label="Kabari Warga via WA"
              />
            )}
          </div>
        </Alert>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Ubah Status Aduan Menjadi <span className="text-danger">*</span>
        </label>
        <Select
          value={statusBaru}
          onChange={(e) => setStatusBaru(e.target.value as 'diproses' | 'selesai' | 'ditolak')}
          disabled={isLoading}
          className="text-sm font-medium"
        >
          <option value="diproses">Diproses (Armada ditugaskan / dijadwalkan)</option>
          <option value="selesai">Selesai (Sampah telah diangkut &amp; bersih)</option>
          <option value="ditolak">Ditolak (Lokasi bukan kewenangan DLH / laporan palsu)</option>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Catatan Tindak Lanjut Petugas <span className="text-danger">*</span>
        </label>
        <Textarea
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Tuliskan keterangan tindakan, estimasi waktu penjemputan, atau alasan penolakan..."
          disabled={isLoading}
          className="text-sm"
          maxLength={1000}
          required
        />
        <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1">
          <span>Minimal 3 karakter</span>
          <span>{catatan.length}/1000</span>
        </div>
      </div>

      {/* Opsi tampil ke publik */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          id="tampil_ke_publik"
          checked={tampilKePublik}
          onChange={(e) => setTampilKePublik(e.target.checked)}
          disabled={isLoading}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="tampil_ke_publik" className="text-xs text-gray-700 select-none cursor-pointer">
          <strong className="block font-semibold text-gray-900">
            Tampilkan ke Publik (Portal Cek Status)
          </strong>
          <span className="text-gray-500 text-[11px]">
            Jika dicentang, warga dapat membaca catatan ini saat mengecek nomor laporan aduan mereka.
          </span>
        </label>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full min-h-[46px] text-sm font-semibold shadow-xs"
        >
          Kirim Respon &amp; Perbarui Status
        </Button>
      </div>
    </form>
  );
}
