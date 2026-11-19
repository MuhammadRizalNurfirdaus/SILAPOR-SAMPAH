'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ClientSuccessCardProps {
  kode: string;
}

export function ClientSuccessCard({ kode }: ClientSuccessCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(kode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy ticket code:', err);
    }
  };

  return (
    <Card className="w-full max-w-lg p-6 sm:p-8 text-center space-y-6 shadow-md border-emerald-200">
      {/* Icon Centang Sukses */}
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-primary flex items-center justify-center">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Aduan Berhasil Dikirim!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          Terima kasih atas kepedulian Anda terhadap kebersihan lingkungan di Kabupaten Kuningan. Laporan Anda telah masuk ke sistem operasional DLH.
        </p>
      </div>

      {/* Box Kode Tiket */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 sm:p-5 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-dark">
          Kode Tiket Pelacakan
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary tracking-wider break-all select-all">
          {kode}
        </div>
        <div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors py-1 px-3 rounded-md hover:bg-emerald-100 min-h-[36px]"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Salin Kode Tiket</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 text-left space-y-1">
        <p className="font-semibold text-gray-700">Catatan untuk Pelapor:</p>
        <p>
          Simpan kode tiket di atas untuk mengecek perkembangan penanganan dan respon resmi petugas pengangkut sampah.
        </p>
      </div>

      {/* Navigasi Aksi */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link href={`/cek-status?kode=${kode}`} className="flex-1">
          <Button variant="primary" fullWidth className="min-h-[44px]">
            Cek Status Aduan
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button variant="outline" fullWidth className="min-h-[44px]">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </Card>
  );
}
