'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { Turnstile } from '@marsidev/react-turnstile';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface FormErrors {
  global?: string;
  nama_pelapor?: string[];
  no_telepon?: string[];
  deskripsi_lokasi?: string[];
  foto?: string;
}

export function FormAduan() {
  const router = useRouter();

  // Form states
  const [namaPelapor, setNamaPelapor] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [deskripsiLokasi, setDeskripsiLokasi] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [honeypot, setHoneypot] = useState('');

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Kompresi foto otomatis di klien sebelum kirim
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error foto sebelumnya
    setErrors((prev) => ({ ...prev, foto: undefined }));

    // Cek batas kasar awal sebelum kompresi (misal max 15MB file kamera mentah)
    if (file.size > 15 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        foto: 'Ukuran file foto terlalu besar (maksimal 15 MB sebelum kompresi)',
      }));
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
      const processedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
      });

      setFotoFile(processedFile);
      setPreviewUrl(URL.createObjectURL(processedFile));
    } catch (err) {
      console.warn('Gagal melakukan kompresi di klien, menggunakan file asli:', err);
      setFotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validasi dasar klien
    if (!fotoFile) {
      setErrors({
        global: 'Data atau ukuran foto tidak valid',
        foto: 'Foto lokasi sampah wajib dilampirkan',
      });
      setIsLoading(false);
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const formData = new FormData();
    formData.append('nama_pelapor', namaPelapor);
    formData.append('no_telepon', noTelepon);
    formData.append('deskripsi_lokasi', deskripsiLokasi);
    formData.append('foto', fotoFile);
    formData.append('cf-turnstile-response', turnstileToken || 'XXXX.DUMMY.TOKEN.XXXX');
    if (honeypot) {
      formData.append('website', honeypot);
    }

    try {
      const res = await fetch('/api/aduan', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Layar 04b: Data atau ukuran foto tidak valid
        setErrors({
          global: data.message || 'Data atau ukuran foto tidak valid',
          nama_pelapor: data.fields?.nama_pelapor,
          no_telepon: data.fields?.no_telepon,
          deskripsi_lokasi: data.fields?.deskripsi_lokasi,
          foto: data.foto,
        });
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth' });
        setIsLoading(false);
        return;
      }

      // Berhasil -> arahkan ke Layar 05 (Aduan Berhasil)
      if (data.ok && data.kode) {
        router.push(`/aduan/berhasil/${data.kode}`);
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({
        global: 'Gagal menghubungi server. Periksa koneksi internet Anda.',
      });
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth' });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Layar 04b: Ringkasan pesan error di bagian atas formulir */}
      {errors.global && (
        <div ref={errorSummaryRef} tabIndex={-1} className="outline-none">
          <Alert type="error" title="Pengiriman Gagal">
            <p className="font-semibold">{errors.global}</p>
            <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
              {errors.nama_pelapor && <li>{errors.nama_pelapor[0]}</li>}
              {errors.no_telepon && <li>{errors.no_telepon[0]}</li>}
              {errors.deskripsi_lokasi && <li>{errors.deskripsi_lokasi[0]}</li>}
              {errors.foto && <li>{errors.foto}</li>}
            </ul>
          </Alert>
        </div>
      )}

      {/* Honeypot anti-spam (tersembunyi dari warga) */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="website">Website (abaikan field ini)</label>
        <input
          id="website"
          name="website"
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Field: Nama Pelapor */}
      <div>
        <Input
          label="Nama Pelapor"
          id="nama_pelapor"
          name="nama_pelapor"
          type="text"
          value={namaPelapor}
          onChange={(e) => setNamaPelapor(e.target.value)}
          placeholder="Contoh: Ahmad Hidayat"
          requiredIndicator
          required
          minLength={2}
          maxLength={100}
          error={errors.nama_pelapor?.[0]}
          helperText="Nama lengkap Anda untuk verifikasi petugas (tidak dipublikasikan)"
          disabled={isLoading}
        />
      </div>

      {/* Field: No. Telepon */}
      <div>
        <Input
          label="Nomor WhatsApp / Telepon"
          id="no_telepon"
          name="no_telepon"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={noTelepon}
          onChange={(e) => setNoTelepon(e.target.value)}
          placeholder="Contoh: 081234567890"
          requiredIndicator
          required
          error={errors.no_telepon?.[0]}
          helperText="Format nomor Indonesia (08..., 62..., atau +62...)"
          disabled={isLoading}
        />
      </div>

      {/* Field: Deskripsi Lokasi */}
      <div>
        <Textarea
          label="Deskripsi Lokasi Sampah"
          id="deskripsi_lokasi"
          name="deskripsi_lokasi"
          rows={3}
          value={deskripsiLokasi}
          onChange={(e) => setDeskripsiLokasi(e.target.value)}
          placeholder="Tuliskan alamat jelas, patokan terdekat, RT/RW, kelurahan/desa, atau kecamatan di Kuningan..."
          requiredIndicator
          required
          minLength={10}
          maxLength={500}
          error={errors.deskripsi_lokasi?.[0]}
          helperText="Minimal 10 karakter. Berikan patokan agar armada mudah menemukan lokasi."
          disabled={isLoading}
        />
      </div>

      {/* Field: Unggah Foto Sampah */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-1">
          Foto Bukti Tumpukan Sampah
          <span className="text-danger">*</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isLoading || isCompressing}
        />

        {!previewUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isCompressing}
            className={`
              w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2
              text-gray-600 hover:border-primary hover:text-primary transition-colors bg-surface
              ${errors.foto ? 'border-danger bg-danger-bg/20' : 'border-gray-300'}
            `}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-primary flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-center">
              <span className="font-semibold text-sm sm:text-base text-gray-900">
                Pilih atau Ambil Foto
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                Format JPG, PNG, atau WebP (maksimal 5 MB)
              </p>
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative w-full aspect-video sm:aspect-4/3 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
              <Image
                src={previewUrl}
                alt="Pratinjau foto sampah"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 520px"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{fotoFile?.name} ({( (fotoFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB)</span>
              <button
                type="button"
                onClick={() => {
                  setFotoFile(null);
                  setPreviewUrl(null);
                }}
                className="text-danger hover:underline font-medium min-h-[36px] px-2 flex items-center"
              >
                Ganti Foto
              </button>
            </div>
          </div>
        )}

        {errors.foto && (
          <p className="text-xs text-danger font-medium mt-1">{errors.foto}</p>
        )}
      </div>

      {/* Cloudflare Turnstile CAPTCHA */}
      <div className="pt-2 flex justify-center min-h-[65px]">
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
          onSuccess={(token) => setTurnstileToken(token)}
        />
      </div>

      {/* Peringatan Kepatuhan Hukum & Larangan Laporan Palsu */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 sm:p-4 text-amber-950 space-y-1.5 text-xs sm:text-[13px]">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <svg className="w-4 h-4 shrink-0 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Peringatan Hukum & Keabsahan Laporan</span>
        </div>
        <p className="leading-relaxed text-amber-900">
          Data dan foto yang Anda kirimkan <strong>wajib sesuai fakta di lapangan</strong>. Dilarang keras mengirimkan laporan palsu, foto rekayasa, atau aduan fiktif untuk memperdaya petugas.
        </p>
        <p className="leading-relaxed text-amber-800 text-[11px] sm:text-xs">
          <strong>Sanksi Pidana:</strong> Memberikan laporan atau keterangan palsu kepada instansi pemerintah dapat dituntut pidana berdasarkan <strong>Pasal 220 KUHP</strong> (ancaman penjara hingga 1 tahun 4 bulan), <strong>Pasal 378 KUHP</strong> tentang penipuan, serta <strong>Pasal 28 ayat (1) jo Pasal 45A UU ITE</strong> terkait penyebaran informasi bohong dan manipulatif.
        </p>
      </div>

      {/* Tombol Aksi Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading || isCompressing}
          className="min-h-[48px] text-base"
        >
          {isCompressing
            ? 'Mengompres Foto...'
            : isLoading
            ? 'Mengirim Aduan...'
            : 'Kirim Laporan Sampah'}
        </Button>
      </div>
    </form>
  );
}
