'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { Turnstile } from '@marsidev/react-turnstile';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface FormErrors {
  global?: string;
  nama_pelapor?: string[];
  no_telepon?: string[];
  deskripsi_lokasi?: string[];
  foto?: string;
  pernyataan?: string;
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
  const [pernyataanBenar, setPernyataanBenar] = useState(false);

  // TPS (lokasi)
  interface TpsItem {
    id: string;
    nama: string;
    kecamatan: string;
    alamat: string | null;
  }
  const [tpsList, setTpsList] = useState<TpsItem[]>([]);
  const [isLoadingTps, setIsLoadingTps] = useState(true);
  const [selectedKecamatan, setSelectedKecamatan] = useState('');
  const [selectedTpsId, setSelectedTpsId] = useState('');

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [duplicateTps, setDuplicateTps] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/tps');
        if (!res.ok) throw new Error('gagal');
        const data = (await res.json()) as TpsItem[];
        if (!cancelled) setTpsList(data ?? []);
      } catch {
        if (!cancelled) setTpsList([]);
      } finally {
        if (!cancelled) setIsLoadingTps(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    setDuplicateTps(false);
    setTriedSubmit(true);

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

    if (!pernyataanBenar) {
      setErrors({
        global: 'Pernyataan keabsahan wajib disetujui',
        pernyataan: 'Centang kotak pernyataan bahwa data dan foto yang Anda kirimkan adalah benar.',
      });
      setIsLoading(false);
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!selectedTpsId) {
      setErrors({
        global: 'Pilih TPS lokasi tumpukan sampah terlebih dahulu.',
      });
      setIsLoading(false);
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const formData = new FormData();
    formData.append('nama_pelapor', namaPelapor);
    formData.append('no_telepon', noTelepon);
    formData.append('deskripsi_lokasi', deskripsiLokasi);
    formData.append('tps_id', selectedTpsId);
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
        if (data.code === 'TPS_AKTIF') {
          setDuplicateTps(true);
          setErrors({
            global: data.message || 'Masih ada aduan aktif di TPS ini. Silakan cek status penanganannya.',
          });
          errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth' });
          setIsLoading(false);
          return;
        }
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

  const kecamatanOptions = Array.from(new Set(tpsList.map((t) => t.kecamatan))).sort(
    (a, b) => a.localeCompare(b, 'id')
  );
  const filteredTps = tpsList.filter((t) => t.kecamatan === selectedKecamatan);

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

      {/* Field: Kecamatan & TPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div className="space-y-1.5">
          <Select
            label="Kecamatan"
            id="kecamatan"
            value={selectedKecamatan}
            onChange={(e) => {
              setSelectedKecamatan(e.target.value);
              setSelectedTpsId('');
            }}
            requiredIndicator
            required
            disabled={isLoading || isLoadingTps}
            error={triedSubmit && !selectedKecamatan ? 'Pilih kecamatan' : undefined}
            helperText={isLoadingTps ? 'Memuat data TPS...' : 'Pilih kecamatan lokasi TPS'}
          >
            <option value="">Pilih kecamatan</option>
            {kecamatanOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Select
            label="Lokasi TPS"
            id="tps_id"
            name="tps_id"
            value={selectedTpsId}
            onChange={(e) => setSelectedTpsId(e.target.value)}
            requiredIndicator
            required
            disabled={isLoading || isLoadingTps || !selectedKecamatan}
            error={triedSubmit && !selectedTpsId ? 'Pilih TPS' : undefined}
            helperText={
              !selectedKecamatan
                ? 'Pilih kecamatan terlebih dahulu'
                : filteredTps.length === 0
                ? 'Belum ada TPS terdaftar di kecamatan ini'
                : selectedTpsId
                ? filteredTps.find((t) => t.id === selectedTpsId)?.alamat || 'Pilih TPS lokasi tumpukan sampah'
                : 'Tempat Pembuangan Sementara di kecamatan terpilih'
            }
          >
            <option value="">Pilih TPS</option>
            {filteredTps.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nama}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Pesan khusus jika TPS masih punya aduan aktif */}
      {duplicateTps && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-900">
            {errors.global || 'Masih ada aduan aktif di TPS ini. Silakan cek status penanganannya.'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/cek-status')}
            className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            Cek Status Aduan
          </button>
        </div>
      )}

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

      {/* Pernyataan Keabsahan Laporan */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5 text-gray-800 space-y-3 text-xs sm:text-[13px]">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <svg className="w-4 h-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-semibold">Pernyataan Keabsahan Laporan</span>
        </div>

        <p className="leading-relaxed text-gray-700">
          Pastikan data dan foto yang Anda kirim sesuai dengan kondisi sebenarnya di lapangan. Laporan palsu, foto rekayasa, atau aduan fiktif menghambat petugas menangani laporan warga lain, dan dapat ditolak atau diabaikan. Pemberian keterangan palsu kepada instansi pemerintah dapat dikenai sanksi sesuai peraturan perundang-undangan yang berlaku.
        </p>

        <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            name="pernyataan_keabsahan"
            id="pernyataan_keabsahan"
            checked={pernyataanBenar}
            onChange={(e) => {
              setPernyataanBenar(e.target.checked);
              if (errors.pernyataan) {
                setErrors((prev) => ({ ...prev, pernyataan: undefined }));
              }
            }}
            disabled={isLoading || isCompressing}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
            required
          />
          <span className="font-semibold text-gray-900 text-xs sm:text-sm">
            Saya menyatakan data dan foto yang saya kirim benar.
          </span>
        </label>

        {errors.pernyataan && (
          <p className="text-xs text-danger font-medium">{errors.pernyataan}</p>
        )}

        <p className="text-[11px] sm:text-xs text-gray-500 italic pt-0.5">
          * Nama dan nomor telepon Anda hanya digunakan untuk menindaklanjuti aduan ini.
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
