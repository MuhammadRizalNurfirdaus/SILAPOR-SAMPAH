'use client';

import { useEffect, useState } from 'react';
import { kirimLokasiAction } from '../actions';
import { Alert } from '@/components/ui/Alert';

interface PelacakGPSProps {
  perjalananId: string;
  armadaId: string;
}

export function PelacakGPS({ perjalananId, armadaId }: PelacakGPSProps) {
  const [gpsStatus, setGpsStatus] = useState<'menghubungkan' | 'aktif' | 'ditolak'>('menghubungkan');
  const [lastRecordedAt, setLastRecordedAt] = useState<string | null>(null);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    let isMounted = true;

    // 1. Minta Screen Wake Lock agar layar tidak mati saat pengemudi bertugas
    if ('wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => {
          wakeLock = lock;
        })
        .catch((err) => {
          console.warn('Wake Lock request error:', err);
        });
    }

    // 2. Fungsi pengiriman lokasi GPS
    const kirimLokasi = () => {
      if (!('geolocation' in navigator)) {
        if (isMounted) setGpsStatus('ditolak');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!isMounted) return;
          setGpsStatus('aktif');
          setLastRecordedAt(new Date().toLocaleTimeString('id-ID'));

          await kirimLokasiAction(
            perjalananId,
            armadaId,
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.warn('Geolocation error:', error);
          if (isMounted) setGpsStatus('ditolak');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    // Kirim posisi pertama kali
    kirimLokasi();

    // Kirim berkala tiap 30 detik sesuai PRD FR-S2 & BUILD_GUIDE §6.5
    const interval = setInterval(kirimLokasi, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [perjalananId, armadaId]);

  return (
    <div className="space-y-3">
      {gpsStatus === 'ditolak' ? (
        <Alert type="warning" title="GPS Tidak Aktif">
          Izin lokasi GPS ditolak atau tidak tersedia. Perjalanan Anda tetap dapat dilanjutkan, namun posisi armada tidak akan terlacak di peta pemantauan. Silakan aktifkan izin lokasi di browser jika memungkinkan.
        </Alert>
      ) : (
        <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-900 px-3.5 py-2.5 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="font-semibold">GPS Aktif (Mengirim tiap 30 dtk)</span>
          </div>
          {lastRecordedAt && (
            <span className="text-emerald-700">Terkirim: {lastRecordedAt}</span>
          )}
        </div>
      )}
    </div>
  );
}
