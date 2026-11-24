'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { Alert } from '@/components/ui/Alert';
import { TableCard, Column } from '@/components/ui/TableCard';
import {
  tambahTpsAction,
  ubahTpsAction,
  nonaktifkanTpsAction,
} from '@/app/admin/actions';
import { KECAMATAN_OPTIONS } from '@/lib/wilayah/kecamatan';

export interface TpsItem {
  id: string;
  nama: string;
  kecamatan: string;
  alamat: string | null;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  created_at: string;
}

interface Props {
  initialTps: TpsItem[];
}

export function KelolaTpsClient({ initialTps }: Props) {
  const [items] = useState<TpsItem[]>(initialTps);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tambah
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addNama, setAddNama] = useState('');
  const [addKecamatan, setAddKecamatan] = useState('');
  const [addAlamat, setAddAlamat] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Ubah
  const [editing, setEditing] = useState<TpsItem | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editKecamatan, setEditKecamatan] = useState('');
  const [editAlamat, setEditAlamat] = useState('');
  const [editAktif, setEditAktif] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

  // Nonaktifkan
  const [deleting, setDeleting] = useState<TpsItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const columns: Column<TpsItem>[] = [
    { key: 'nama', header: 'Nama TPS' },
    { key: 'kecamatan', header: 'Kecamatan' },
    {
      key: 'alamat',
      header: 'Alamat / Patokan',
      render: (t) => t.alamat || '-',
      isSecondary: true,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (t) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            t.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {t.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
  ];

  const renderCard = (t: TpsItem) => (
    <Card className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{t.nama}</p>
          <p className="text-sm text-gray-600">{t.kecamatan}</p>
          {t.alamat && <p className="text-xs text-gray-500">{t.alamat}</p>}
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            t.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {t.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditing(t);
            setEditNama(t.nama);
            setEditKecamatan(t.kecamatan);
            setEditAlamat(t.alamat || '');
            setEditAktif(t.is_active);
            setError(null);
          }}
        >
          Ubah
        </Button>
        {t.is_active && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setDeleting(t);
              setError(null);
            }}
          >
            Nonaktifkan
          </Button>
        )}
      </div>
    </Card>
  );

  const handleAdd = async () => {
    setAddLoading(true);
    setError(null);
    const res = await tambahTpsAction({
      nama: addNama,
      kecamatan: addKecamatan,
      alamat: addAlamat || null,
      is_active: true,
    });
    setAddLoading(false);
    if (!res.success) {
      setError(res.error || 'Gagal menambahkan TPS');
      return;
    }
    // refresh via reload sederhana: optimistik append tidak punya id; reload halaman
    setFlash(res.message || 'TPS berhasil ditambahkan.');
    setIsAddOpen(false);
    setAddNama('');
    setAddKecamatan('');
    setAddAlamat('');
    window.location.reload();
  };

  const handleEdit = async () => {
    if (!editing) return;
    setEditLoading(true);
    setError(null);
    const res = await ubahTpsAction(editing.id, {
      nama: editNama,
      kecamatan: editKecamatan,
      alamat: editAlamat || null,
      is_active: editAktif,
    });
    setEditLoading(false);
    if (!res.success) {
      setError(res.error || 'Gagal mengubah TPS');
      return;
    }
    setFlash(res.message || 'TPS berhasil diubah.');
    setEditing(null);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setError(null);
    const res = await nonaktifkanTpsAction(deleting.id);
    setDeleteLoading(false);
    if (!res.success) {
      setError(res.error || 'Gagal menonaktifkan TPS');
      return;
    }
    setFlash(res.message || 'TPS dinonaktifkan.');
    setDeleting(null);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {flash && <Alert type="success" title="Berhasil">{flash}</Alert>}
      {error && <Alert type="error" title="Gagal">{error}</Alert>}

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Data TPS</h2>
        <Button onClick={() => { setIsAddOpen(true); setError(null); }}>Tambah TPS</Button>
      </div>

      <TableCard
        data={items}
        columns={columns}
        keyExtractor={(t) => t.id}
        renderCard={renderCard}
        emptyMessage="Belum ada TPS terdaftar. Tambahkan TPS terlebih dahulu."
      />

      {/* Dialog Tambah */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Tambah TPS">
        <div className="space-y-4">
          <Input
            label="Nama TPS"
            value={addNama}
            onChange={(e) => setAddNama(e.target.value)}
            required
          />
          <Select
            label="Kecamatan"
            value={addKecamatan}
            onChange={(e) => setAddKecamatan(e.target.value)}
            required
          >
            <option value="">Pilih kecamatan</option>
            {KECAMATAN_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
          <Input
            label="Alamat / Patokan"
            value={addAlamat}
            onChange={(e) => setAddAlamat(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAdd} disabled={addLoading}>
              {addLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog Ubah */}
      <Dialog isOpen={!!editing} onClose={() => setEditing(null)} title="Ubah TPS">
        <div className="space-y-4">
          <Input
            label="Nama TPS"
            value={editNama}
            onChange={(e) => setEditNama(e.target.value)}
            required
          />
          <Select
            label="Kecamatan"
            value={editKecamatan}
            onChange={(e) => setEditKecamatan(e.target.value)}
            required
          >
            <option value="">Pilih kecamatan</option>
            {KECAMATAN_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
          <Input
            label="Alamat / Patokan"
            value={editAlamat}
            onChange={(e) => setEditAlamat(e.target.value)}
          />
          <Select
            label="Status"
            value={editAktif ? 'aktif' : 'nonaktif'}
            onChange={(e) => setEditAktif(e.target.value === 'aktif')}
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={handleEdit} disabled={editLoading}>
              {editLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog Nonaktifkan */}
      <Dialog isOpen={!!deleting} onClose={() => setDeleting(null)} title="Nonaktifkan TPS">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Nonaktifkan TPS <span className="font-semibold">{deleting?.nama}</span>? TPS nonaktif
            tidak akan muncul di form warga, tetapi riwayat aduan tetap tersimpan.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Batal
            </Button>
            <Button onClick={handleDelete} disabled={deleteLoading} variant="danger">
              {deleteLoading ? 'Memproses...' : 'Nonaktifkan'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
