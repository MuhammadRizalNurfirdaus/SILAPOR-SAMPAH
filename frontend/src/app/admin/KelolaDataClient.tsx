'use client';

import { useState } from 'react';
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
  tambahPenggunaAction,
  ubahPenggunaAction,
  hapusPenggunaAction,
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

export interface ProfileItem {
  id: string;
  username: string;
  nama_lengkap: string;
  role: 'sopir' | 'kabid' | 'admin';
  is_active: boolean;
  created_at: string;
}

interface KelolaDataClientProps {
  initialArmada: ArmadaItem[];
  initialUsers: ProfileItem[];
  currentAdminId: string;
  initialTab?: 'armada' | 'pengguna';
}

export function KelolaDataClient({
  initialArmada,
  initialUsers,
  currentAdminId,
  initialTab = 'armada',
}: KelolaDataClientProps) {
  // Tab Switcher state: 'armada' | 'pengguna'
  const [activeTab, setActiveTab] = useState<'armada' | 'pengguna'>(initialTab);

  // Global flash notification
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  // ==========================================
  // STATE ARMADA
  // ==========================================
  // Dialog Tambah Armada (Layar 17 / 17b)
  const [isAddArmadaOpen, setIsAddArmadaOpen] = useState(false);
  const [addPlat, setAddPlat] = useState('');
  const [addJenis, setAddJenis] = useState('Dump Truck');
  const [addKapasitas, setAddKapasitas] = useState('');
  const [addArmadaLoading, setAddArmadaLoading] = useState(false);
  const [addArmadaError, setAddArmadaError] = useState<string | null>(null);

  // Dialog Ubah Armada (Layar 18)
  const [editingArmada, setEditingArmada] = useState<ArmadaItem | null>(null);
  const [editPlat, setEditPlat] = useState('');
  const [editJenis, setEditJenis] = useState('');
  const [editKapasitas, setEditKapasitas] = useState('');
  const [editStatus, setEditStatus] = useState<'garasi' | 'beroperasi' | 'perawatan'>('garasi');
  const [editArmadaLoading, setEditArmadaLoading] = useState(false);
  const [editArmadaError, setEditArmadaError] = useState<string | null>(null);

  // Dialog Hapus Armada (Layar 19)
  const [deletingArmada, setDeletingArmada] = useState<ArmadaItem | null>(null);
  const [deleteArmadaLoading, setDeleteArmadaLoading] = useState(false);
  const [deleteArmadaError, setDeleteArmadaError] = useState<string | null>(null);

  // ==========================================
  // STATE PENGGUNA
  // ==========================================
  // Dialog Tambah Pengguna (Layar 21 / 21b)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addNama, setAddNama] = useState('');
  const [addTelepon, setAddTelepon] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<'sopir' | 'kabid' | 'admin'>('sopir');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  // Dialog Ubah Pengguna (Layar 22)
  const [editingUser, setEditingUser] = useState<ProfileItem | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editTelepon, setEditTelepon] = useState('');
  const [editUserRole, setEditUserRole] = useState<'sopir' | 'kabid' | 'admin'>('sopir');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState<string | null>(null);

  // Dialog Hapus Pengguna (Layar 23)
  const [deletingUser, setDeletingUser] = useState<ProfileItem | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState<string | null>(null);

  // ==========================================
  // HANDLERS ARMADA
  // ==========================================
  const openEditArmada = (item: ArmadaItem) => {
    setEditingArmada(item);
    setEditPlat(item.plat_nomor);
    setEditJenis(item.jenis);
    setEditKapasitas(item.kapasitas_m3 ? `${item.kapasitas_m3} ton` : '');
    setEditStatus(item.status);
    setEditArmadaError(null);
  };

  const handleTambahArmada = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddArmadaError(null);

    // Validasi Layar 17b: Data belum lengkap
    if (!addPlat.trim() || !addJenis.trim() || !addKapasitas.trim()) {
      setAddArmadaError('Data belum lengkap');
      return;
    }

    const parsedKapasitas = parseFloat(addKapasitas.replace(/[^\d.]/g, '')) || null;

    setAddArmadaLoading(true);
    try {
      const res = await tambahArmadaAction({
        plat_nomor: addPlat.trim().toUpperCase(),
        jenis: addJenis.trim(),
        kapasitas_m3: parsedKapasitas,
        wilayah: null,
        status: 'garasi',
      });

      if (!res.success) {
        setAddArmadaError(res.error || 'Data belum lengkap');
      } else {
        setFlashMessage(res.message || 'Armada berhasil ditambahkan.');
        setIsAddArmadaOpen(false);
        setAddPlat('');
        setAddKapasitas('');
      }
    } catch {
      setAddArmadaError('Data belum lengkap');
    } finally {
      setAddArmadaLoading(false);
    }
  };

  const handleUbahArmada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArmada) return;
    setEditArmadaError(null);

    if (!editPlat.trim() || !editJenis.trim() || !editKapasitas.trim()) {
      setEditArmadaError('Data belum lengkap');
      return;
    }

    const parsedKapasitas = parseFloat(editKapasitas.replace(/[^\d.]/g, '')) || null;

    setEditArmadaLoading(true);
    try {
      const res = await ubahArmadaAction(editingArmada.id, {
        plat_nomor: editPlat.trim().toUpperCase(),
        jenis: editJenis.trim(),
        kapasitas_m3: parsedKapasitas,
        wilayah: editingArmada.wilayah,
        status: editStatus,
        is_active: editingArmada.is_active,
      });

      if (!res.success) {
        setEditArmadaError(res.error || 'Gagal memperbarui armada.');
      } else {
        setFlashMessage(res.message || 'Data armada berhasil diperbarui.');
        setEditingArmada(null);
      }
    } catch {
      setEditArmadaError('Terjadi kesalahan saat memperbarui.');
    } finally {
      setEditArmadaLoading(false);
    }
  };

  const handleHapusArmada = async () => {
    if (!deletingArmada) return;
    setDeleteArmadaError(null);
    setDeleteArmadaLoading(true);

    try {
      const res = await hapusArmadaAction(deletingArmada.id);
      if (!res.success) {
        setDeleteArmadaError(res.error || 'Gagal menghapus armada.');
      } else {
        setFlashMessage(res.message || 'Data armada berhasil dihapus.');
        setDeletingArmada(null);
      }
    } catch {
      setDeleteArmadaError('Terjadi kesalahan sistem.');
    } finally {
      setDeleteArmadaLoading(false);
    }
  };

  // ==========================================
  // HANDLERS PENGGUNA
  // ==========================================
  const openEditUser = (user: ProfileItem) => {
    setEditingUser(user);
    setEditNama(user.nama_lengkap);
    setEditTelepon('08xx-xxxx-xxxx');
    setEditUserRole(user.role);
    setEditUserPassword('');
    setEditUserError(null);
  };

  const handleTambahPengguna = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);

    if (!addNama.trim() || !addUsername.trim() || !addPassword) {
      setAddUserError('Data belum lengkap');
      return;
    }

    setAddUserLoading(true);
    try {
      const res = await tambahPenggunaAction({
        nama_lengkap: addNama.trim(),
        username: addUsername.trim().toLowerCase(),
        password: addPassword,
        role: addRole,
      });

      if (!res.success) {
        setAddUserError(res.error || 'Data belum lengkap');
      } else {
        setFlashMessage(res.message || 'Akun pengguna berhasil dibuat.');
        setIsAddUserOpen(false);
        setAddNama('');
        setAddTelepon('');
        setAddUsername('');
        setAddPassword('');
      }
    } catch {
      setAddUserError('Data belum lengkap');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleUbahPengguna = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditUserError(null);

    if (!editNama.trim()) {
      setEditUserError('Data belum lengkap');
      return;
    }

    setEditUserLoading(true);
    try {
      const res = await ubahPenggunaAction(editingUser.id, {
        nama_lengkap: editNama.trim(),
        role: editUserRole,
        is_active: editingUser.is_active,
        password: editUserPassword.trim() || undefined,
      });

      if (!res.success) {
        setEditUserError(res.error || 'Gagal memperbarui akun.');
      } else {
        setFlashMessage(res.message || 'Data akun pengguna berhasil diperbarui.');
        setEditingUser(null);
      }
    } catch {
      setEditUserError('Terjadi kesalahan saat memperbarui akun.');
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleHapusPengguna = async () => {
    if (!deletingUser) return;
    setDeleteUserError(null);
    setDeleteUserLoading(true);

    try {
      const res = await hapusPenggunaAction(deletingUser.id);
      if (!res.success) {
        setDeleteUserError(res.error || 'Gagal menghapus pengguna.');
      } else {
        setFlashMessage(res.message || 'Akun pengguna berhasil dihapus.');
        setDeletingUser(null);
      }
    } catch {
      setDeleteUserError('Terjadi kesalahan sistem.');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  // ==========================================
  // TABEL COLUMNS & RENDER
  // ==========================================
  const formatArmadaStatus = (status: 'garasi' | 'beroperasi' | 'perawatan') => {
    switch (status) {
      case 'beroperasi':
        return { label: 'Dalam Operasional', tone: 'success' as const };
      case 'garasi':
        return { label: 'Di Garasi', tone: 'neutral' as const };
      case 'perawatan':
        return { label: 'Dalam Perawatan', tone: 'warning' as const };
    }
  };

  const armadaColumns: Column<ArmadaItem>[] = [
    {
      key: 'no',
      header: 'No',
      className: 'w-16 text-center',
      render: (_, index) => <span className="text-sm text-gray-600">{(index ?? 0) + 1}</span>,
    },
    {
      key: 'plat_nomor',
      header: 'No. Plat',
      render: (item) => (
        <span className="font-mono font-bold text-sm text-gray-900">
          {item.plat_nomor}
        </span>
      ),
    },
    {
      key: 'jenis',
      header: 'Jenis Kendaraan',
      render: (item) => <span className="text-sm text-gray-900">{item.jenis}</span>,
    },
    {
      key: 'kapasitas_m3',
      header: 'Kapasitas Angkut',
      render: (item) => (
        <span className="text-sm text-gray-900">
          {item.kapasitas_m3 ? `${item.kapasitas_m3} ton` : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const s = formatArmadaStatus(item.status);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              s.tone === 'success'
                ? 'bg-[#dcfce7] text-[#166534]'
                : s.tone === 'warning'
                ? 'bg-[#fef3c7] text-[#92400e]'
                : 'bg-[#e5e7eb] text-[#374151]'
            }`}
          >
            {s.label}
          </span>
        );
      },
    },
    {
      key: 'aksi',
      header: 'Aksi',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-3 text-sm font-medium">
          <button
            type="button"
            onClick={() => openEditArmada(item)}
            className="text-primary hover:underline cursor-pointer"
          >
            Ubah
          </button>
          <button
            type="button"
            onClick={() => {
              setDeletingArmada(item);
              setDeleteArmadaError(null);
            }}
            className="text-danger hover:underline cursor-pointer"
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  const formatRoleLabel = (role: 'sopir' | 'kabid' | 'admin') => {
    switch (role) {
      case 'sopir':
        return 'Sopir/Kru';
      case 'kabid':
        return 'Kepala Bidang';
      case 'admin':
        return 'Admin DLH';
    }
  };

  const penggunaColumns: Column<ProfileItem>[] = [
    {
      key: 'no',
      header: 'No',
      className: 'w-16 text-center',
      render: (_, index) => <span className="text-sm text-gray-600">{(index ?? 0) + 1}</span>,
    },
    {
      key: 'nama_lengkap',
      header: 'Nama Lengkap',
      render: (user) => (
        <span className="font-semibold text-sm text-gray-900">
          {user.nama_lengkap}
        </span>
      ),
    },
    {
      key: 'telepon',
      header: 'No. Telepon',
      render: () => <span className="text-sm text-gray-600 font-mono">08xx-xxxx-xxxx</span>,
    },
    {
      key: 'username',
      header: 'Username',
      render: (user) => (
        <span className="text-sm text-gray-800 font-mono">
          {user.username}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <Badge status={user.role === 'admin' ? 'danger' : user.role === 'kabid' ? 'primary' : 'gray'} size="sm">
          {formatRoleLabel(user.role)}
        </Badge>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      className: 'text-right',
      render: (user) => {
        const isSelf = user.id === currentAdminId;
        return (
          <div className="flex items-center justify-end gap-3 text-sm font-medium">
            <button
              type="button"
              onClick={() => openEditUser(user)}
              className="text-primary hover:underline cursor-pointer"
            >
              Ubah
            </button>
            {!isSelf && (
              <button
                type="button"
                onClick={() => {
                  setDeletingUser(user);
                  setDeleteUserError(null);
                }}
                className="text-danger hover:underline cursor-pointer"
              >
                Hapus
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Judul Halaman (Figma Layar 16 & 20) */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Kelola Data Armada dan Pengguna
        </h1>
      </div>

      {flashMessage && (
        <Alert type="success" title="Informasi Sistem">
          <div className="flex items-center justify-between gap-2">
            <span>{flashMessage}</span>
            <button
              type="button"
              onClick={() => setFlashMessage(null)}
              className="text-xs underline font-semibold text-emerald-800 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </Alert>
      )}

      {/* Tab Switcher & Action Button (Sesuai Figma) */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200/90 pb-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tab Armada */}
          <button
            type="button"
            onClick={() => setActiveTab('armada')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer min-h-[40px] flex items-center ${
              activeTab === 'armada'
                ? 'bg-primary-light text-primary-dark font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Armada
          </button>

          {/* Tab Pengguna */}
          <button
            type="button"
            onClick={() => setActiveTab('pengguna')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer min-h-[40px] flex items-center ${
              activeTab === 'pengguna'
                ? 'bg-primary-light text-primary-dark font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Pengguna
          </button>
        </div>

        {/* Tombol Tambah (Kanan) */}
        {activeTab === 'armada' ? (
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setIsAddArmadaOpen(true);
              setAddArmadaError(null);
            }}
            className="font-semibold shadow-xs min-h-[42px]"
          >
            + Tambah Armada
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setIsAddUserOpen(true);
              setAddUserError(null);
            }}
            className="font-semibold shadow-xs min-h-[42px]"
          >
            + Tambah Pengguna
          </Button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* KONTEN TAB ARMADA */}
      {/* ========================================================================= */}
      {activeTab === 'armada' && (
        <div className="space-y-4">
          <TableCard
            data={initialArmada}
            columns={armadaColumns}
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
                  <div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === 'beroperasi'
                          ? 'bg-[#dcfce7] text-[#166534]'
                          : item.status === 'perawatan'
                          ? 'bg-[#fef3c7] text-[#92400e]'
                          : 'bg-[#e5e7eb] text-[#374151]'
                      }`}
                    >
                      {formatArmadaStatus(item.status).label}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 pt-1 border-t border-gray-100 flex items-center justify-between">
                  <span>Kapasitas Angkut:</span>
                  <span className="font-medium text-gray-900">
                    {item.kapasitas_m3 ? `${item.kapasitas_m3} ton` : '-'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEditArmada(item)}
                    className="w-full min-h-[40px]"
                  >
                    Ubah
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setDeletingArmada(item);
                      setDeleteArmadaError(null);
                    }}
                    className="w-full min-h-[40px]"
                  >
                    Hapus
                  </Button>
                </div>
              </Card>
            )}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* KONTEN TAB PENGGUNA */}
      {/* ========================================================================= */}
      {activeTab === 'pengguna' && (
        <div className="space-y-4">
          <TableCard
            data={initialUsers}
            columns={penggunaColumns}
            keyExtractor={(user) => user.id}
            emptyMessage="Belum ada data akun pengguna yang terdaftar."
            renderCard={(user) => {
              const isSelf = user.id === currentAdminId;
              return (
                <Card className="p-4 space-y-3 border border-gray-200 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-base text-gray-900 block">
                        {user.nama_lengkap}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        @{user.username}
                      </span>
                    </div>
                    <div>
                      <Badge
                        status={user.role === 'admin' ? 'danger' : user.role === 'kabid' ? 'primary' : 'gray'}
                        size="sm"
                      >
                        {formatRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 pt-1 border-t border-gray-100 flex items-center justify-between">
                    <span>No. Telepon:</span>
                    <span className="font-mono text-gray-800">08xx-xxxx-xxxx</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditUser(user)}
                      className="w-full min-h-[40px]"
                    >
                      Ubah
                    </Button>
                    {!isSelf && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setDeletingUser(user);
                          setDeleteUserError(null);
                        }}
                        className="w-full min-h-[40px]"
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                </Card>
              );
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 17: TAMBAH DATA ARMADA */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isAddArmadaOpen}
        onClose={() => setIsAddArmadaOpen(false)}
        title="Tambah Data Armada"
      >
        <form onSubmit={handleTambahArmada} noValidate className="p-5 sm:p-6 space-y-4">
          {addArmadaError && (
            <Alert type="error" title="Gagal Menyimpan">
              {addArmadaError}
            </Alert>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              No. Plat
            </label>
            <Input
              type="text"
              placeholder="Contoh: E 1234 AB"
              value={addPlat}
              onChange={(e) => setAddPlat(e.target.value.toUpperCase())}
              disabled={addArmadaLoading}
              className="text-sm font-mono uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Jenis Kendaraan
            </label>
            <Select
              value={addJenis}
              onChange={(e) => setAddJenis(e.target.value)}
              disabled={addArmadaLoading}
              className="text-sm"
            >
              <option value="Dump Truck">Dump Truck</option>
              <option value="Arm Roll Truck">Arm Roll Truck</option>
              <option value="Compactor">Compactor</option>
              <option value="Pickup">Pickup</option>
              <option value="Truk Roda 3">Truk Roda 3</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Kapasitas Angkut
            </label>
            <Input
              type="text"
              placeholder="Contoh: 6 ton"
              value={addKapasitas}
              onChange={(e) => setAddKapasitas(e.target.value)}
              disabled={addArmadaLoading}
              className="text-sm"
              required
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddArmadaOpen(false)}
              disabled={addArmadaLoading}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={addArmadaLoading}
              className="min-h-[44px] px-6 font-semibold"
            >
              Simpan
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 18: UBAH DATA ARMADA */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={Boolean(editingArmada)}
        onClose={() => setEditingArmada(null)}
        title="Ubah Data Armada"
        description={`Data yang diubah : ${editingArmada?.plat_nomor || ''}`}
      >
        <form onSubmit={handleUbahArmada} noValidate className="p-5 sm:p-6 space-y-4">
          {editArmadaError && (
            <Alert type="error" title="Gagal Memperbarui">
              {editArmadaError}
            </Alert>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              No. Plat
            </label>
            <Input
              type="text"
              value={editPlat}
              onChange={(e) => setEditPlat(e.target.value.toUpperCase())}
              disabled={editArmadaLoading}
              className="text-sm font-mono uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Jenis Kendaraan
            </label>
            <Select
              value={editJenis}
              onChange={(e) => setEditJenis(e.target.value)}
              disabled={editArmadaLoading}
              className="text-sm"
            >
              <option value="Dump Truck">Dump Truck</option>
              <option value="Arm Roll Truck">Arm Roll Truck</option>
              <option value="Compactor">Compactor</option>
              <option value="Pickup">Pickup</option>
              <option value="Truk Roda 3">Truk Roda 3</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Kapasitas Angkut
            </label>
            <Input
              type="text"
              value={editKapasitas}
              onChange={(e) => setEditKapasitas(e.target.value)}
              disabled={editArmadaLoading}
              className="text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Status Operasional
            </label>
            <Select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as 'garasi' | 'beroperasi' | 'perawatan')}
              disabled={editArmadaLoading}
              className="text-sm"
            >
              <option value="beroperasi">Dalam Operasional</option>
              <option value="garasi">Di Garasi</option>
              <option value="perawatan">Dalam Perawatan</option>
            </Select>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingArmada(null)}
              disabled={editArmadaLoading}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={editArmadaLoading}
              className="min-h-[44px] px-6 font-semibold"
            >
              Simpan
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 19: KONFIRMASI HAPUS ARMADA */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={Boolean(deletingArmada)}
        onClose={() => setDeletingArmada(null)}
        title="Konfirmasi Hapus Data"
      >
        <div className="p-5 sm:p-6 space-y-4">
          {deleteArmadaError && (
            <Alert type="error" title="Gagal Menghapus">
              {deleteArmadaError}
            </Alert>
          )}

          <div className="space-y-1">
            <p className="font-bold text-gray-900 text-base">
              Hapus data armada {deletingArmada?.plat_nomor}?
            </p>
            <p className="text-sm text-gray-500">
              Data yang dihapus tidak dapat dikembalikan.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingArmada(null)}
              disabled={deleteArmadaLoading}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleHapusArmada}
              isLoading={deleteArmadaLoading}
              className="min-h-[44px] px-6 font-semibold"
            >
              Hapus
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 21: TAMBAH AKUN PENGGUNA */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Tambah Akun Pengguna"
      >
        <form onSubmit={handleTambahPengguna} noValidate className="p-5 sm:p-6 space-y-4">
          {addUserError && (
            <Alert type="error" title="Gagal Menyimpan">
              {addUserError}
            </Alert>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Lengkap
            </label>
            <Input
              type="text"
              placeholder="Nama lengkap petugas"
              value={addNama}
              onChange={(e) => setAddNama(e.target.value)}
              disabled={addUserLoading}
              className="text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              No. Telepon
            </label>
            <Input
              type="tel"
              placeholder="08xx-xxxx-xxxx"
              value={addTelepon}
              onChange={(e) => setAddTelepon(e.target.value)}
              disabled={addUserLoading}
              className="text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Username
            </label>
            <Input
              type="text"
              placeholder="Username login"
              value={addUsername}
              onChange={(e) => setAddUsername(e.target.value.toLowerCase())}
              disabled={addUserLoading}
              className="text-sm font-mono lowercase"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={addPassword}
              onChange={(e) => setAddPassword(e.target.value)}
              disabled={addUserLoading}
              className="text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Role
            </label>
            <Select
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as 'sopir' | 'kabid' | 'admin')}
              disabled={addUserLoading}
              className="text-sm"
            >
              <option value="sopir">Sopir/Kru</option>
              <option value="kabid">Kepala Bidang</option>
              <option value="admin">Admin DLH</option>
            </Select>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddUserOpen(false)}
              disabled={addUserLoading}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={addUserLoading}
              className="min-h-[44px] px-6 font-semibold"
            >
              Simpan
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 22: UBAH AKUN PENGGUNA */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title="Ubah Akun Pengguna"
        description={`Akun yang diubah : ${editingUser?.username || ''}`}
      >
        <form onSubmit={handleUbahPengguna} noValidate className="p-5 sm:p-6 space-y-4">
          {editUserError && (
            <Alert type="error" title="Gagal Memperbarui">
              {editUserError}
            </Alert>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Lengkap
            </label>
            <Input
              type="text"
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
              disabled={editUserLoading}
              className="text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              No. Telepon
            </label>
            <Input
              type="tel"
              value={editTelepon}
              onChange={(e) => setEditTelepon(e.target.value)}
              disabled={editUserLoading}
              className="text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Username
            </label>
            <Input
              type="text"
              value={editingUser?.username || ''}
              disabled
              className="text-sm font-mono bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <Input
              type="password"
              placeholder="Kosongkan jika tidak diubah"
              value={editUserPassword}
              onChange={(e) => setEditUserPassword(e.target.value)}
              disabled={editUserLoading}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Role
            </label>
            <Select
              value={editUserRole}
              onChange={(e) => setEditUserRole(e.target.value as 'sopir' | 'kabid' | 'admin')}
              disabled={editUserLoading || editingUser?.id === currentAdminId}
              className="text-sm"
            >
              <option value="sopir">Sopir/Kru</option>
              <option value="kabid">Kepala Bidang</option>
              <option value="admin">Admin DLH</option>
            </Select>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingUser(null)}
              disabled={editUserLoading}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={editUserLoading}
              className="min-h-[44px] px-6 font-semibold"
            >
              Simpan
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 23: KONFIRMASI HAPUS PENGGUNA */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        title="Konfirmasi Hapus Data"
      >
        <div className="p-5 sm:p-6 space-y-4">
          {deleteUserError && (
            <Alert type="error" title="Gagal Menghapus">
              {deleteUserError}
            </Alert>
          )}

          <div className="space-y-1">
            <p className="font-bold text-gray-900 text-base">
              Hapus akun pengguna {deletingUser?.username}?
            </p>
            <p className="text-sm text-gray-500">
              Data yang dihapus tidak dapat dikembalikan.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingUser(null)}
              disabled={deleteUserLoading}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleHapusPengguna}
              isLoading={deleteUserLoading}
              className="min-h-[44px] px-6 font-semibold"
            >
              Hapus
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
