'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { Alert } from '@/components/ui/Alert';
import { TableCard, Column } from '@/components/ui/TableCard';
import {
  tambahArmadaAction,
  ubahArmadaAction,
  hapusArmadaAction,
} from '@/app/admin/actions';

export interface ArmadaItem {
  id: string;
  plat_nomor: string;
  jenis: string;
  kapasitas_m3: number | null;
  wilayah: string | null;
  status: 'garasi' | 'beroperasi' | 'perawatan';
  is_active: boolean;
  created_at: string;
}

interface KelolaArmadaClientProps {
  initialArmada: ArmadaItem[];
}

export function KelolaArmadaClient({ initialArmada }: KelolaArmadaClientProps) {
  const router = useRouter();

  // State Dialog Tambah (Layar 17 / 17b)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addPlat, setAddPlat] = useState('');
  const [addJenis, setAddJenis] = useState('Dump Truck');
  const [addKapasitas, setAddKapasitas] = useState('');
  const [addWilayah, setAddWilayah] = useState('');
  const [addStatus, setAddStatus] = useState<'garasi' | 'beroperasi' | 'perawatan'>('garasi');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // State Dialog Edit (Layar 18)
  const [editingItem, setEditingItem] = useState<ArmadaItem | null>(null);
  const [editPlat, setEditPlat] = useState('');
  const [editJenis, setEditJenis] = useState('');
  const [editKapasitas, setEditKapasitas] = useState('');
  const [editWilayah, setEditWilayah] = useState('');
  const [editStatus, setEditStatus] = useState<'garasi' | 'beroperasi' | 'perawatan'>('garasi');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // State Dialog Hapus (Layar 19)
  const [deletingItem, setDeletingItem] = useState<ArmadaItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Global flash notification
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const openEdit = (item: ArmadaItem) => {
    setEditingItem(item);
    setEditPlat(item.plat_nomor);
    setEditJenis(item.jenis);
    setEditKapasitas(item.kapasitas_m3 ? String(item.kapasitas_m3) : '');
    setEditWilayah(item.wilayah || '');
    setEditStatus(item.status);
    setEditIsActive(item.is_active);
    setEditError(null);
  };

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!addPlat.trim()) {
      setAddError('Plat nomor wajib diisi.');
      return;
    }

    setAddLoading(true);
    try {
      const res = await tambahArmadaAction({
        plat_nomor: addPlat.trim().toUpperCase(),
        jenis: addJenis.trim(),
        kapasitas_m3: addKapasitas ? parseFloat(addKapasitas) : null,
        wilayah: addWilayah.trim() || null,
        status: addStatus,
      });

      if (!res.success) {
        setAddError(res.error || 'Gagal menambahkan armada.');
      } else {
        setFlashMessage(res.message || null);
        setIsAddOpen(false);
        setAddPlat('');
        setAddKapasitas('');
        setAddWilayah('');
        router.refresh();
      }
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setAddLoading(false);
    }
  };

  const handleUbah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditError(null);

    setEditLoading(true);
    try {
      const res = await ubahArmadaAction(editingItem.id, {
        plat_nomor: editPlat.trim().toUpperCase(),
        jenis: editJenis.trim(),
        kapasitas_m3: editKapasitas ? parseFloat(editKapasitas) : null,
        wilayah: editWilayah.trim() || null,
        status: editStatus,
        is_active: editIsActive,
      });

      if (!res.success) {
        setEditError(res.error || 'Gagal mengubah armada.');
      } else {
        setFlashMessage(res.message || null);
        setEditingItem(null);
        router.refresh();
      }
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setEditLoading(false);
    }
  };

  const handleHapus = async () => {
    if (!deletingItem) return;
    setDeleteError(null);
    setDeleteLoading(true);

    try {
      const res = await hapusArmadaAction(deletingItem.id);
      if (!res.success) {
        setDeleteError(res.error || 'Gagal menghapus armada.');
      } else {
        setFlashMessage(res.message || null);
        setDeletingItem(null);
        router.refresh();
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<ArmadaItem>[] = [
    {
      key: 'plat_nomor',
      header: 'Plat Nomor',
      render: (item) => (
        <span className="font-mono font-bold text-gray-900 tracking-wider">
          {item.plat_nomor}
        </span>
      ),
    },
    {
      key: 'jenis',
      header: 'Jenis Unit',
      render: (item) => <span className="text-gray-700 font-medium">{item.jenis}</span>,
    },
    {
      key: 'kapasitas_m3',
      header: 'Kapasitas',
      render: (item) => (
        <span className="text-gray-600 text-xs">
          {item.kapasitas_m3 ? `${item.kapasitas_m3} m³` : '-'}
        </span>
      ),
    },
    {
      key: 'wilayah',
      header: 'Wilayah Layanan',
      isSecondary: true,
      render: (item) => (
        <span className="text-xs text-gray-500">{item.wilayah || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Kondisi Operasional',
      render: (item) => <Badge status={item.status} size="sm" />,
    },
    {
      key: 'is_active',
      header: 'Status Sistem',
      render: (item) => (
        <Badge status={item.is_active ? 'primary' : 'gray'} size="sm">
          {item.is_active ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openEdit(item)}
            className="min-h-[34px]"
          >
            Ubah
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              setDeletingItem(item);
              setDeleteError(null);
            }}
            className="min-h-[34px]"
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Kelola Armada Sampah
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Data kendaraan operasional truk, armroll, dan pickup pengangkut sampah DLH Kuningan.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => {
            setIsAddOpen(true);
            setAddError(null);
          }}
          className="min-h-[44px] self-start sm:self-auto font-semibold shadow-xs"
        >
          + Tambah Armada
        </Button>
      </div>

      {flashMessage && (
        <Alert type="success" title="Informasi Sistem">
          <div className="flex items-center justify-between gap-2">
            <span>{flashMessage}</span>
            <button
              type="button"
              onClick={() => setFlashMessage(null)}
              className="text-xs underline font-semibold text-emerald-800"
            >
              Tutup
            </button>
          </div>
        </Alert>
      )}

      {/* Tabel Armada (Desktop) / Kartu Armada (Mobile < 768px) */}
      <TableCard
        data={initialArmada}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="Belum ada data armada yang terdaftar."
        renderCard={(item) => (
          <Card className="p-4 space-y-3 border border-gray-200 shadow-2xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-base text-gray-900 tracking-wide block">
                  {item.plat_nomor}
                </span>
                <span className="text-xs text-gray-500">{item.jenis}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge status={item.status} size="sm" />
                {!item.is_active && (
                  <Badge status="gray" size="sm">
                    Nonaktif
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-1 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block text-[11px]">Kapasitas:</span>
                <span>{item.kapasitas_m3 ? `${item.kapasitas_m3} m³` : '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Wilayah:</span>
                <span className="truncate block">{item.wilayah || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openEdit(item)}
                className="w-full min-h-[44px]"
              >
                Ubah
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  setDeletingItem(item);
                  setDeleteError(null);
                }}
                className="w-full min-h-[44px]"
              >
                Hapus
              </Button>
            </div>
          </Card>
        )}
      />

      {/* DIALOG TAMBAH ARMADA (Layar 17 / 17b) */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Unit Armada Baru (Layar 17)"
        description="Daftarkan kendaraan pengangkut sampah baru ke dalam sistem DLH."
      >
        <form onSubmit={handleTambah} className="p-5 sm:p-6 space-y-4">
          {addError && (
            <Alert type="error" title="Gagal Menambahkan (Layar 17b)">
              {addError}
            </Alert>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nomor Polisi / Plat Kendaraan <span className="text-danger">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: E 1234 AB"
              value={addPlat}
              onChange={(e) => setAddPlat(e.target.value.toUpperCase())}
              disabled={addLoading}
              className="text-sm font-mono uppercase"
              required
            />
            <span className="text-[11px] text-gray-400 block mt-1">
              Otomatis dikonversi ke huruf kapital dan wajib unik.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Jenis Armada <span className="text-danger">*</span>
              </label>
              <Select
                value={addJenis}
                onChange={(e) => setAddJenis(e.target.value)}
                disabled={addLoading}
                className="text-sm"
              >
                <option value="Dump Truck">Dump Truck</option>
                <option value="Armroll">Armroll</option>
                <option value="Compactor">Compactor</option>
                <option value="Pickup">Pickup</option>
                <option value="Truk Roda 3">Truk Roda 3 (Viar)</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kapasitas Bak (m³)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="Mis: 6.0"
                value={addKapasitas}
                onChange={(e) => setAddKapasitas(e.target.value)}
                disabled={addLoading}
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Wilayah Operasional Rutin
              </label>
              <Input
                type="text"
                placeholder="Mis: Kuningan Kota / Cilimus"
                value={addWilayah}
                onChange={(e) => setAddWilayah(e.target.value)}
                disabled={addLoading}
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Status Kondisi Awal <span className="text-danger">*</span>
              </label>
              <Select
                value={addStatus}
                onChange={(e) => setAddStatus(e.target.value as 'garasi' | 'beroperasi' | 'perawatan')}
                disabled={addLoading}
                className="text-sm"
              >
                <option value="garasi">Di Garasi (Siap Jalan)</option>
                <option value="perawatan">Dalam Perawatan (Bengkel)</option>
              </Select>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={addLoading}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={addLoading}
              className="min-h-[44px]"
            >
              Simpan Armada
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG UBAH ARMADA (Layar 18) */}
      <Dialog
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Ubah Data Armada (Layar 18)"
        description={`Perbarui informasi unit armada ${editingItem?.plat_nomor || ''}.`}
      >
        <form onSubmit={handleUbah} className="p-5 sm:p-6 space-y-4">
          {editError && (
            <Alert type="error" title="Gagal Memperbarui">
              {editError}
            </Alert>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nomor Polisi / Plat Kendaraan <span className="text-danger">*</span>
            </label>
            <Input
              type="text"
              value={editPlat}
              onChange={(e) => setEditPlat(e.target.value.toUpperCase())}
              disabled={editLoading}
              className="text-sm font-mono uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Jenis Armada <span className="text-danger">*</span>
              </label>
              <Select
                value={editJenis}
                onChange={(e) => setEditJenis(e.target.value)}
                disabled={editLoading}
                className="text-sm"
              >
                <option value="Dump Truck">Dump Truck</option>
                <option value="Armroll">Armroll</option>
                <option value="Compactor">Compactor</option>
                <option value="Pickup">Pickup</option>
                <option value="Truk Roda 3">Truk Roda 3 (Viar)</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kapasitas Bak (m³)
              </label>
              <Input
                type="number"
                step="0.1"
                value={editKapasitas}
                onChange={(e) => setEditKapasitas(e.target.value)}
                disabled={editLoading}
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Wilayah Operasional
              </label>
              <Input
                type="text"
                value={editWilayah}
                onChange={(e) => setEditWilayah(e.target.value)}
                disabled={editLoading}
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Status Operasional <span className="text-danger">*</span>
              </label>
              <Select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as 'garasi' | 'beroperasi' | 'perawatan')}
                disabled={editLoading}
                className="text-sm"
              >
                <option value="garasi">Di Garasi</option>
                <option value="beroperasi">Beroperasi</option>
                <option value="perawatan">Dalam Perawatan (Bengkel)</option>
              </Select>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                disabled={editLoading}
                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-xs text-gray-700 font-semibold">
                Status Armada Aktif dalam Sistem
              </span>
            </label>
            <span className="text-[11px] text-gray-400 block ml-6">
              Jika nonaktif, armada tidak akan tampil di daftar penugasan sopir.
            </span>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingItem(null)}
              disabled={editLoading}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={editLoading}
              className="min-h-[44px]"
            >
              Perbarui Armada
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG KONFIRMASI HAPUS ARMADA (Layar 19 / Bottom Sheet di HP) */}
      <Dialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Konfirmasi Hapus Armada (Layar 19)"
        description={`Apakah Anda yakin ingin menghapus atau menonaktifkan armada ${deletingItem?.plat_nomor || ''}?`}
      >
        <div className="p-5 sm:p-6 space-y-4">
          {deleteError && (
            <Alert type="error" title="Gagal Menghapus">
              {deleteError}
            </Alert>
          )}

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <strong className="block font-semibold">Ketentuan Keamanan Riwayat:</strong>
            <p>
              Jika armada ini telah memiliki riwayat perjalanan pengangkutan sampah, armada akan <strong>dinonaktifkan (arsip)</strong> agar integritas data operasional dan bukti foto tetap utuh.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingItem(null)}
              disabled={deleteLoading}
              className="min-h-[44px]"
            >
              Batalkan
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleHapus}
              isLoading={deleteLoading}
              className="min-h-[44px] font-semibold"
            >
              Ya, Hapus / Nonaktifkan
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
