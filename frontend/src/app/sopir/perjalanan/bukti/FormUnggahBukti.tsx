'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { unggahBuktiAction } from '../../actions';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';

export function FormUnggahBukti({ perjalananId }: { perjalananId: string }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [keterangan, setKeterangan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Layar 09b: Cek jika file mentah melebihi batas (misal 20 MB sebelum kompresi)
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto terlalu besar (maksimal 20 MB)');
      return;
    }

    try {
      setIsCompressing(true);
      const options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedBlob = await imageCompression(file, options);

      // Cek apakah hasil kompresi masih melebihi 5 MB
      if (compressedBlob.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran foto melebihi batas maksimal 5 MB. Silakan gunakan foto lain (Layar 09b).');
        return;
      }

      const processed = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
      });

      setSelectedFile(processed);
      setPreviewUrl(URL.createObjectURL(processed));
    } catch (err) {
      console.warn('Gagal kompresi, memakai file asli:', err);
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran foto melebihi batas maksimal 5 MB (Layar 09b).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMsg('Silakan ambil atau pilih foto bukti terlebih dahulu');
      return;
    }

    // Layar 09b: Verifikasi ukuran file
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran foto melebihi batas maksimal 5 MB (Layar 09b)');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('perjalanan_id', perjalananId);
    formData.append('foto', selectedFile);
    formData.append('keterangan', keterangan);

    // Ambil koordinat GPS saat unggah jika tersedia
    if ('geolocation' in navigator) {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            formData.append('lat', String(pos.coords.latitude));
            formData.append('lng', String(pos.coords.longitude));
            resolve();
          },
          () => resolve(),
          { timeout: 3000 }
        );
      });
    }

    try {
      const res = await unggahBuktiAction(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'digest' in err) {
        throw err;
      }
      setErrorMsg('Gagal mengunggah foto bukti');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Layar 09b: Error banner jika ukuran melebihi batas */}
      {errorMsg && (
        <Alert type="error" title="Gagal Mengunggah Foto">
          {errorMsg}
        </Alert>
      )}

      {/* Input Foto Kamera */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-1">
          Ambil Foto Bukti Pengangkutan
          <span className="text-danger">*</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading || isCompressing}
        />

        {!previewUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isCompressing}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-surface hover:border-primary transition-colors text-gray-600"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-primary flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-center">
              <span className="font-bold text-base text-gray-900 block">
                Buka Kamera / Pilih Foto
              </span>
              <span className="text-xs text-gray-500 mt-1 block">
                Format JPG/PNG/WebP, maksimal 5 MB
              </span>
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
              <Image
                src={previewUrl}
                alt="Pratinjau foto bukti"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 600px"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{((selectedFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="text-danger hover:underline font-semibold min-h-[36px] px-2 flex items-center"
              >
                Ambil Ulang Foto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Keterangan Opsional */}
      <div>
        <Textarea
          label="Catatan / Keterangan (Opsional)"
          id="keterangan"
          name="keterangan"
          rows={2}
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder="Contoh: Pengangkutan sampah TPS Pasar Cilimus selesai"
          maxLength={300}
          helperText="Maksimal 300 karakter"
          disabled={isLoading || isCompressing}
        />
      </div>

      {/* Tombol Aksi */}
      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading || isCompressing}
          disabled={!selectedFile || isLoading || isCompressing}
          className="min-h-[56px] text-base font-bold shadow-md"
        >
          {isCompressing
            ? 'Mengompres Foto...'
            : isLoading
            ? 'Mengunggah Foto Bukti...'
            : 'Simpan Foto Bukti'}
        </Button>

        <Link href="/sopir/perjalanan" className="block w-full">
          <Button
            type="button"
            variant="outline"
            fullWidth
            size="md"
            className="min-h-[44px]"
            disabled={isLoading || isCompressing}
          >
            Batal
          </Button>
        </Link>
      </div>
    </form>
  );
}
