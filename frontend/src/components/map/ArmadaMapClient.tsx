'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatWIBShort } from '@/lib/format/date';

interface ArmadaData {
  id: string;
  plat: string;
  jenis: string;
  lat: number;
  lng: number;
  waktu: string;
}

// Koordinat pusat Kabupaten Kuningan
const KUNINGAN_CENTER: [number, number] = [-6.9765, 108.4831];

const emptySubscribe = () => () => {};

// Handler untuk merespons perubahan ukuran layar (RESPONSIVE_SPEC §4.6)
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [map]);

  return null;
}

export default function ArmadaMapClient() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [armadaList, setArmadaList] = useState<ArmadaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadArmada() {
      try {
        const res = await fetch('/api/public/armada');
        if (res.ok && active) {
          const data = await res.json();
          setArmadaList(data);
        }
      } catch (err) {
        console.error('Error fetching armada:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadArmada();
    // Polling tiap 15 detik sesuai spesifikasi Fase 5
    const interval = setInterval(loadArmada, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[60dvh] lg:h-[65vh] rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500 font-medium">
        Memuat peta pemantauan...
      </div>
    );
  }

  // Buat icon kustom aman di browser
  const truckIcon = L.divIcon({
    className: 'custom-truck-pin',
    html: `
      <div style="background-color: #15803D; color: white; border-radius: 9999px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); border: 2px solid white;">
        <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2" />
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Peta Interaktif Leaflet */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative h-[60dvh] lg:h-[65vh] min-h-[320px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-[1000] flex items-center justify-center text-sm font-semibold text-gray-700">
            Memuat data posisi armada...
          </div>
        )}
        <MapContainer
          center={KUNINGAN_CENTER}
          zoom={12}
          scrollWheelZoom={false}
          touchZoom={true}
          className="w-full h-full"
        >
          <MapResizeHandler />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {armadaList.map((a) => (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={truckIcon}>
              <Popup>
                <div className="space-y-1 p-1">
                  <div className="font-bold text-sm text-gray-900">{a.plat}</div>
                  <div className="text-xs text-gray-600 capitalize">{a.jenis}</div>
                  <div className="text-[10px] text-gray-400">
                    Posisi: {formatWIBShort(a.waktu)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Panel Daftar Armada di Bawah (<1024) atau di Samping (>=1024) per RESPONSIVE_SPEC §4.6 */}
      <Card className="w-full lg:w-80 p-5 shrink-0 flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900">
            Armada Beroperasi ({armadaList.length})
          </h2>
          <p className="text-xs text-gray-500">
            Pembaruan lokasi otomatis tiap 15 detik (Posisi &le; 10 menit)
          </p>
        </div>

        {armadaList.length === 0 ? (
          <div className="text-xs text-gray-500 italic text-center py-6">
            Saat ini belum ada armada aktif dengan pembaruan sinyal dalam 10 menit terakhir.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {armadaList.map((a) => (
              <li
                key={a.id}
                className="p-3 rounded-lg border border-gray-100 bg-gray-50/70 hover:bg-emerald-50/50 transition-colors flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-gray-900">
                    {a.plat}
                  </span>
                  <Badge status="beroperasi" size="sm">
                    Aktif
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 capitalize">
                  {a.jenis}
                </div>
                <div className="text-[10px] text-gray-400">
                  Update: {formatWIBShort(a.waktu)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
