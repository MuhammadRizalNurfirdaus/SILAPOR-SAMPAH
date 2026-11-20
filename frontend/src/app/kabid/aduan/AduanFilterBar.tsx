'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

interface AduanFilterBarProps {
  initialStatus?: string;
  initialFrom?: string;
  initialTo?: string;
  initialQ?: string;
}

export function AduanFilterBar({
  initialStatus = 'semua',
  initialFrom = '',
  initialTo = '',
  initialQ = '',
}: AduanFilterBarProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [q, setQ] = useState(initialQ);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (status && status !== 'semua') params.set('status', status);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (q.trim()) params.set('q', q.trim());
    params.set('page', '1');
    router.push(`/kabid/aduan?${params.toString()}`);
  };

  const handleReset = () => {
    setStatus('semua');
    setFrom('');
    setTo('');
    setQ('');
    router.push('/kabid/aduan');
  };

  return (
    <form
      onSubmit={handleApply}
      className="bg-surface p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Cari Nomor Laporan */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Cari Nomor Laporan
          </label>
          <Input
            type="text"
            placeholder="Mis: SLP-2611-..."
            value={q}
            onChange={(e) => setQ(e.target.value.toUpperCase())}
            className="text-xs uppercase"
          />
        </div>

        {/* Filter Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Status Aduan
          </label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs"
          >
            <option value="semua">Semua Status</option>
            <option value="baru">Baru</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </Select>
        </div>

        {/* Tanggal Dari */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Dari Tanggal
          </label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Tanggal Sampai */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Sampai Tanggal
          </label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="flex-1 min-h-[42px]"
          >
            Filter
          </Button>
          {(status !== 'semua' || from || to || q) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="min-h-[42px]"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
