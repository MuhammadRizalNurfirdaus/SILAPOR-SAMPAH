'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { formatWIB } from '@/lib/format/date';

export interface BuktiItem {
  id: string;
  foto_path: string;
  signed_url: string;
  created_at: string;
  keterangan: string | null;
  lat: number | null;
  lng: number | null;
  plat_nomor: string;
  jenis: string;
  sopir_nama: string;
}

interface GaleriClientProps {
  items: BuktiItem[];
  armadaList: { id: string; plat_nomor: string; jenis: string }[];
  sopirList: { id: string; nama_lengkap: string }[];
  initialFilters: {
    tanggal?: string;
    armadaId?: string;
    sopirId?: string;
  };
}

export function GaleriClient({
  items,
  armadaList,
  sopirList,
  initialFilters,
}: GaleriClientProps) {
  const router = useRouter();

  const [tanggal, setTanggal] = useState(initialFilters.tanggal || '');
  const [armadaId, setArmadaId] = useState(initialFilters.armadaId || '');
  const [sopirId, setSopirId] = useState(initialFilters.sopirId || '');

  // Lightbox state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (tanggal) params.set('tanggal', tanggal);
    if (armadaId) params.set('armadaId', armadaId);
    if (sopirId) params.set('sopirId', sopirId);
    router.push(`/kabid/galeri?${params.toString()}`);
  };

  const resetFilters = () => {
    setTanggal('');
    setArmadaId('');
    setSopirId('');
    router.push('/kabid/galeri');
  };

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
  }, [selectedIndex, items.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
  }, [selectedIndex, items.length]);

  // Keyboard navigation untuk lightbox
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handlePrev();
      else handleNext();
    }
    touchStartX.current = null;
  };

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tanggal Pengambilan
            </label>
            <Input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Armada
            </label>
            <Select
              value={armadaId}
              onChange={(e) => setArmadaId(e.target.value)}
              className="text-xs"
            >
              <option value="">Semua Armada</option>
              {armadaList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.plat_nomor} ({a.jenis})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Sopir / Petugas
            </label>
            <Select
              value={sopirId}
              onChange={(e) => setSopirId(e.target.value)}
              className="text-xs"
            >
              <option value="">Semua Sopir</option>
              {sopirList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_lengkap}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-end gap-2 sm:col-span-3 lg:col-span-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={applyFilters}
              className="flex-1 min-h-[42px]"
            >
              Terapkan
            </Button>
            {(tanggal || armadaId || sopirId) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="min-h-[42px]"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-1 flex items-center justify-between">
          <span>Menampilkan {items.length} foto bukti pengangkutan</span>
          <span className="text-[11px] text-gray-400">Tautan foto aman (signed URL 5 menit)</span>
        </div>
      </div>

      {/* Grid Foto Bukti */}
      {items.length === 0 ? (
        <div className="text-center py-16 px-4 bg-surface rounded-xl border border-gray-200">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-semibold text-gray-700">Tidak ada foto bukti ditemukan</p>
          <p className="text-xs text-gray-500 mt-1">Coba sesuaikan tanggal atau pilihan armada di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedIndex(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedIndex(idx);
                }
              }}
              className="group relative bg-surface rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="aspect-square w-full relative bg-gray-100 overflow-hidden">
                <Image
                  src={item.signed_url}
                  alt={`Bukti armada ${item.plat_nomor}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                  <span className="font-bold block tracking-wide truncate">
                    {item.plat_nomor}
                  </span>
                  <span className="text-[10px] text-gray-200 block truncate">
                    {item.sopir_nama}
                  </span>
                </div>
              </div>

              <div className="p-2 text-[11px] text-gray-600 bg-surface flex items-center justify-between">
                <span className="truncate">{formatWIB(item.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar Lightbox */}
          <div className="flex items-center justify-between text-white/90 pb-2">
            <span className="text-xs sm:text-sm font-medium">
              {selectedIndex! + 1} dari {items.length} foto
            </span>
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="p-2 rounded-full hover:bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Tutup lightbox"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Image with Navigation Buttons */}
          <div className="relative flex-1 flex items-center justify-center my-auto min-h-0">
            {/* Prev Button */}
            {items.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/75 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Foto sebelumnya"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div className="relative w-full h-full max-h-[70vh] sm:max-h-[75vh] flex items-center justify-center">
              <Image
                src={selectedItem.signed_url}
                alt={`Foto bukti ${selectedItem.plat_nomor}`}
                fill
                priority
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Next Button */}
            {items.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/75 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Foto selanjutnya"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Detail Keterangan Bukti */}
          <div className="bg-gray-900/90 text-white p-3 sm:p-4 rounded-xl max-w-2xl mx-auto w-full text-xs sm:text-sm space-y-1.5 mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div>
                <span className="font-bold text-base text-emerald-400 mr-2">
                  {selectedItem.plat_nomor}
                </span>
                <span className="text-gray-300">({selectedItem.jenis})</span>
              </div>
              <span className="text-gray-300 text-xs">
                {formatWIB(selectedItem.created_at)}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 pt-1">
              <span>Sopir: <strong className="text-white">{selectedItem.sopir_nama}</strong></span>
              {selectedItem.lat && selectedItem.lng ? (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedItem.lat}&mlon=${selectedItem.lng}#map=16/${selectedItem.lat}/${selectedItem.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 min-h-[36px]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedItem.lat.toFixed(5)}, {selectedItem.lng.toFixed(5)}
                </a>
              ) : (
                <span className="text-gray-500">Koordinat tidak tersedia</span>
              )}
            </div>

            {selectedItem.keterangan && (
              <p className="text-gray-200 text-xs pt-1 italic bg-white/5 p-2 rounded">
                &ldquo;{selectedItem.keterangan}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
