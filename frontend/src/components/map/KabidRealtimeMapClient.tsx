'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatWIBShort } from '@/lib/format/date';

interface ArmadaRealtime {
  id: string;
  plat_nomor: string;
  jenis: string;
  lat: number;
  lng: number;
  direkam_at: string;
}

const KUNINGAN_CENTER: [number, number] = [-6.9765, 108.4831];
const emptySubscribe = () => () => {};

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    const handleResize = () => map.invalidateSize();
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

export default function KabidRealtimeMapClient() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [armadaList, setArmadaList] = useState<ArmadaRealtime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeActive, setRealtimeActive] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    // 1. Muat posisi awal armada beroperasi
    async function fetchInitialPositions() {
      try {
        const res = await fetch('/api/kabid/armada-posisi');
        if (res.ok && active) {
          const data = await res.json();
          setArmadaList(data);
        }
      } catch (err) {
        console.error('Error fetching initial kabid map positions:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchInitialPositions();

    // 2. Berlangganan Supabase Realtime (INSERT ke tabel lokasi_armada)
    const channel = supabase
      .channel('kabid-lokasi-armada')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lokasi_armada',
        },
        (payload) => {
          const newLoc = payload.new as {
            armada_id: string;
            lat: number;
            lng: number;
            direkam_at: string;
          };

          setArmadaList((prev) =>
            prev.map((item) =>
              item.id === newLoc.armada_id
                ? {
                    ...item,
                    lat: newLoc.lat,
                    lng: newLoc.lng,
                    direkam_at: newLoc.direkam_at,
                  }
                : item
            )
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && active) {
          setRealtimeActive(true);
        }
      });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[60dvh] lg:h-[65vh] rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500 font-medium">
        Memuat peta operasional Realtime...
      </div>
    );
  }

  const truckIcon = L.divIcon({
    className: 'kabid-truck-pin',
    html: `
      <div style="background-color: #15803D; color: white; border-radius: 9999px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15), 0 2px 4px -2px rgba(0,0,0,0.1); border: 2px solid white;">
        <svg style="width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2" />
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Peta Interaktif Leaflet Realtime */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative h-[60dvh] lg:h-[65vh] min-h-[320px]">
        {/* Indikator Realtime Status */}
        <div className="absolute top-3 right-3 z-[1000] bg-surface/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-gray-200 shadow-xs flex items-center gap-2 text-xs font-semibold text-gray-800">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                realtimeActive ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                realtimeActive ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
            ></span>
          </span>
          <span>{realtimeActive ? 'Realtime Terhubung' : 'Sinkronisasi...'}</span>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-[1000] flex items-center justify-center text-sm font-semibold text-gray-700">
            Memuat posisi armada...
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
                  <div className="font-mono font-bold text-sm text-gray-900">
                    {a.plat_nomor}
                  </div>
                  <div className="text-xs text-gray-600">{a.jenis}</div>
                  <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                    Posisi terkini: {formatWIBShort(a.direkam_at)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Panel Daftar Armada Aktif (Samping pada desktop, Bawah pada mobile) */}
      <Card className="w-full lg:w-80 p-5 shrink-0 flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Armada Bertugas ({armadaList.length})
            </h2>
            <p className="text-xs text-gray-500">
              Diperbarui seketika (Supabase Realtime)
            </p>
          </div>
        </div>

        {armadaList.length === 0 ? (
          <div className="text-xs text-gray-500 italic text-center py-6">
            Tidak ada armada yang sedang melakukan tugas perjalanan saat ini.
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
                    {a.plat_nomor}
                  </span>
                  <Badge status="beroperasi" size="sm">
                    Bergerak
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 capitalize">
                  {a.jenis}
                </div>
                <div className="text-[10px] text-gray-400">
                  Update sinyal: {formatWIBShort(a.direkam_at)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
