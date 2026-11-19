'use client';

import { useState } from 'react';
import { mulaiPerjalananAction } from './actions';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';

interface ArmadaOption {
  id: string;
  plat_nomor: string;
  jenis: string;
  wilayah: string | null;
}

export function FormMulaiPerjalanan({ armadaList }: { armadaList: ArmadaOption[] }) {
  const [selectedId, setSelectedId] = useState(armadaList[0]?.id ?? '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setErrorMsg('Silakan pilih salah satu armada terlebih dahulu');
      return;
    }

    setIsPending(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('armada_id', selectedId);

    try {
      const res = await mulaiPerjalananAction(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        setIsPending(false);
      }
    } catch (err: unknown) {
      // In Next.js, redirect() throws an error that should be re-thrown
      if (err && typeof err === 'object' && 'digest' in err) {
        throw err;
      }
      setErrorMsg('Terjadi kesalahan saat memulai perjalanan');
      setIsPending(false);
    }
  };

  const options = armadaList.map((a) => ({
    value: a.id,
    label: `${a.plat_nomor} — ${a.jenis} (${a.wilayah || 'Kuningan'})`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <Alert type="error" title="Gagal Memulai Perjalanan">
          {errorMsg}
        </Alert>
      )}

      {armadaList.length === 0 ? (
        <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-center text-sm text-amber-800 space-y-1">
          <p className="font-bold">Tidak ada unit armada di garasi saat ini.</p>
          <p className="text-xs text-amber-700">
            Semua armada sedang bertugas atau dalam perawatan berkala.
          </p>
        </div>
      ) : (
        <>
          <div>
            <Select
              label="Pilih Unit Armada (Status: Di Garasi)"
              id="armada_id"
              name="armada_id"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              options={options}
              requiredIndicator
              required
              disabled={isPending}
              helperText="Hanya armada yang siap jalan dan berada di garasi yang ditampilkan"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isPending}
              disabled={!selectedId || isPending}
              className="min-h-[56px] text-base font-bold shadow-md"
            >
              {isPending ? 'Menyiapkan Perjalanan...' : 'Mulai Perjalanan Armada'}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
