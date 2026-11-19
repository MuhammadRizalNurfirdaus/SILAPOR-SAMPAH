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
import { formatWIBShort } from '@/lib/format/date';
import {
  tambahPenggunaAction,
  ubahPenggunaAction,
  hapusPenggunaAction,
} from '@/app/admin/actions';

export interface ProfileItem {
  id: string;
  username: string;
  nama_lengkap: string;
  role: 'sopir' | 'kabid' | 'admin';
  is_active: boolean;
  created_at: string;
}

interface KelolaPenggunaClientProps {
  initialUsers: ProfileItem[];
  currentAdminId: string;
}

export function KelolaPenggunaClient({
  initialUsers,
  currentAdminId,
}: KelolaPenggunaClientProps) {
  const router = useRouter();

  // State Dialog Tambah (Layar 21 / 21b)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [addNama, setAddNama] = useState('');
  const [addRole, setAddRole] = useState<'sopir' | 'kabid' | 'admin'>('sopir');
  const [addPassword, setAddPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // State Dialog Edit (Layar 22)
  const [editingUser, setEditingUser] = useState<ProfileItem | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editRole, setEditRole] = useState<'sopir' | 'kabid' | 'admin'>('sopir');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPassword, setEditPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // State Dialog Hapus (Layar 23)
  const [deletingUser, setDeletingUser] = useState<ProfileItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Global flash notification
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const openEdit = (user: ProfileItem) => {
    setEditingUser(user);
    setEditNama(user.nama_lengkap);
    setEditRole(user.role);
    setEditIsActive(user.is_active);
    setEditPassword('');
    setEditError(null);
  };

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    setAddLoading(true);
    try {
      const res = await tambahPenggunaAction({
        username: addUsername.trim().toLowerCase(),
        nama_lengkap: addNama.trim(),
        role: addRole,
        password: addPassword,
      });

      if (!res.success) {
        setAddError(res.error || 'Gagal membuat akun.');
      } else {
        setFlashMessage(res.message || null);
        setIsAddOpen(false);
        setAddUsername('');
        setAddNama('');
        setAddPassword('');
        setAddRole('sopir');
        router.refresh();
      }
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setAddLoading(false);
    }
  };

  const handleUbah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    setEditLoading(true);
    try {
      const res = await ubahPenggunaAction(editingUser.id, {
        nama_lengkap: editNama.trim(),
        role: editRole,
        is_active: editIsActive,
        password: editPassword.trim() ? editPassword.trim() : undefined,
      });

      if (!res.success) {
        setEditError(res.error || 'Gagal mengubah data pengguna.');
      } else {
        setFlashMessage(res.message || null);
        setEditingUser(null);
        router.refresh();
      }
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setEditLoading(false);
    }
  };

  const handleHapus = async () => {
    if (!deletingUser) return;
    setDeleteError(null);

    // Proteksi akun sendiri (UAT 15)
    if (deletingUser.id === currentAdminId) {
      setDeleteError('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await hapusPenggunaAction(deletingUser.id);
      if (!res.success) {
        setDeleteError(res.error || 'Gagal menghapus pengguna.');
      } else {
        setFlashMessage(res.message || null);
        setDeletingUser(null);
        router.refresh();
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge status="danger" size="sm">Admin</Badge>;
      case 'kabid':
        return <Badge status="primary" size="sm">Kabid</Badge>;
      case 'sopir':
        return <Badge status="info" size="sm">Sopir</Badge>;
      default:
        return <Badge status="gray" size="sm">{role}</Badge>;
    }
  };

  const columns: Column<ProfileItem>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (u) => (
        <span className="font-mono font-bold text-gray-900 tracking-tight">
          @{u.username}
        </span>
      ),
    },
    {
      key: 'nama_lengkap',
      header: 'Nama Lengkap',
      render: (u) => <span className="font-medium text-gray-800">{u.nama_lengkap}</span>,
    },
    {
      key: 'role',
      header: 'Hak Akses / Peran',
      render: (u) => getRoleBadge(u.role),
    },
    {
      key: 'is_active',
      header: 'Status Akun',
      render: (u) => (
        <Badge status={u.is_active ? 'primary' : 'gray'} size="sm">
          {u.is_active ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Terdaftar Sejak',
      isSecondary: true,
      render: (u) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {formatWIBShort(u.created_at)}
        </span>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openEdit(u)}
            className="min-h-[34px]"
          >
            Ubah
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={u.id === currentAdminId}
            onClick={() => {
              setDeletingUser(u);
              setDeleteError(null);
            }}
            className="min-h-[34px]"
            title={u.id === currentAdminId ? 'Tidak dapat menghapus akun sendiri' : 'Hapus akun'}
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
            Kelola Akun Pengguna
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Daftar petugas operasional (Sopir armada, Kepala Bidang, dan Administrator sistem).
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
          + Tambah Pengguna
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

      {/* Tabel Pengguna (Desktop) / Kartu Pengguna (Mobile < 768px) */}
      <TableCard
        data={initialUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        emptyMessage="Belum ada data pengguna internal yang terdaftar."
        renderCard={(u) => (
          <Card className="p-4 space-y-3 border border-gray-200 shadow-2xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-base text-gray-900 tracking-tight block">
                  @{u.username}
                </span>
                <span className="text-sm font-medium text-gray-800 block">
                  {u.nama_lengkap}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                {getRoleBadge(u.role)}
                {!u.is_active && (
                  <Badge status="gray" size="sm">
                    Nonaktif
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-1 border-t border-gray-100 flex items-center justify-between">
              <span>Terdaftar: {formatWIBShort(u.created_at)}</span>
              {u.id === currentAdminId && (
                <span className="text-danger font-semibold text-[11px]">(Akun Anda)</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openEdit(u)}
                className="w-full min-h-[44px]"
              >
                Ubah
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={u.id === currentAdminId}
                onClick={() => {
                  setDeletingUser(u);
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

      {/* DIALOG TAMBAH PENGGUNA (Layar 21 / 21b) */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Pengguna Baru (Layar 21)"
        description="Buat akun staf DLH Kuningan untuk mengakses modul sistem SILAPOR."
      >
        <form onSubmit={handleTambah} className="p-5 sm:p-6 space-y-4">
          {addError && (
            <Alert type="error" title="Gagal Menambahkan (Layar 21b)">
              {addError}
            </Alert>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Username <span className="text-danger">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: sopir3 / stafdlh"
              value={addUsername}
              onChange={(e) => setAddUsername(e.target.value.toLowerCase())}
              disabled={addLoading}
              className="text-sm font-mono lowercase"
              required
            />
            <span className="text-[11px] text-gray-400 block mt-1">
              3-30 karakter huruf kecil, angka, titik, underscore, atau minus.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Lengkap Petugas <span className="text-danger">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Asep Saepudin"
              value={addNama}
              onChange={(e) => setAddNama(e.target.value)}
              disabled={addLoading}
              className="text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Peran / Hak Akses <span className="text-danger">*</span>
              </label>
              <Select
                value={addRole}
                onChange={(e) => setAddRole(e.target.value as 'sopir' | 'kabid' | 'admin')}
                disabled={addLoading}
                className="text-sm"
              >
                <option value="sopir">Sopir (Pengemudi Armada)</option>
                <option value="kabid">Kabid (Kepala Bidang)</option>
                <option value="admin">Admin (Administrator)</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password Awal <span className="text-danger">*</span>
              </label>
              <Input
                type="password"
                placeholder="Minimal 8 karakter"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                disabled={addLoading}
                className="text-sm"
                required
              />
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
              Buat Akun Pengguna
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG UBAH PENGGUNA (Layar 22) */}
      <Dialog
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title="Ubah Data Pengguna (Layar 22)"
        description={`Perbarui profil atau reset password untuk @${editingUser?.username || ''}.`}
      >
        <form onSubmit={handleUbah} className="p-5 sm:p-6 space-y-4">
          {editError && (
            <Alert type="error" title="Gagal Memperbarui">
              {editError}
            </Alert>
          )}

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
            <span className="text-[11px] text-gray-400 block mt-1">
              Username akun tidak dapat diubah setelah dibuat.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Lengkap Petugas <span className="text-danger">*</span>
            </label>
            <Input
              type="text"
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
              disabled={editLoading}
              className="text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Peran / Hak Akses <span className="text-danger">*</span>
              </label>
              <Select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as 'sopir' | 'kabid' | 'admin')}
                disabled={editLoading || editingUser?.id === currentAdminId}
                className="text-sm"
              >
                <option value="sopir">Sopir</option>
                <option value="kabid">Kabid</option>
                <option value="admin">Admin</option>
              </Select>
              {editingUser?.id === currentAdminId && (
                <span className="text-[11px] text-amber-600 block mt-1">
                  Peran akun sendiri tidak dapat diubah.
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Ganti Password Baru
              </label>
              <Input
                type="password"
                placeholder="Kosongkan jika tetap"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                disabled={editLoading}
                className="text-sm"
              />
              <span className="text-[11px] text-gray-400 block mt-1">
                Isi minimal 8 karakter untuk mengganti password.
              </span>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                disabled={editLoading || editingUser?.id === currentAdminId}
                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-xs text-gray-700 font-semibold">
                Akun Berstatus Aktif
              </span>
            </label>
            {editingUser?.id === currentAdminId ? (
              <span className="text-[11px] text-amber-600 block ml-6">
                Anda tidak dapat menonaktifkan akun Anda sendiri.
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 block ml-6">
                Jika dinonaktifkan, akun tidak dapat login dan sesi aktif akan segera diputus.
              </span>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingUser(null)}
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
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG KONFIRMASI HAPUS PENGGUNA (Layar 23 / Bottom Sheet di HP) */}
      <Dialog
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        title="Konfirmasi Hapus Akun Pengguna (Layar 23)"
        description={`Apakah Anda yakin ingin menghapus akun @${deletingUser?.username || ''} (${deletingUser?.nama_lengkap || ''})?`}
      >
        <div className="p-5 sm:p-6 space-y-4">
          {deleteError && (
            <Alert type="error" title="Gagal Menghapus">
              {deleteError}
            </Alert>
          )}

          {deletingUser?.id === currentAdminId ? (
            <Alert type="warning" title="Tindakan Ditolak (UAT 15)">
              Sistem melarang Administrator menghapus atau menonaktifkan akun miliknya sendiri demi mencegah kehilangan akses pengelola sistem.
            </Alert>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <strong className="block font-semibold">Ketentuan Integritas Data:</strong>
              <p>
                Jika akun pengguna ini telah memiliki riwayat operasional (seperti perjalanan armada, unggahan bukti foto, atau respon aduan), akun akan <strong>dinonaktifkan (arsip)</strong> dan sesi langsung dicabut demi menjaga jejak audit sistem.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingUser(null)}
              disabled={deleteLoading}
              className="min-h-[44px]"
            >
              Batalkan
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleteLoading || deletingUser?.id === currentAdminId}
              onClick={handleHapus}
              isLoading={deleteLoading}
              className="min-h-[44px] font-semibold"
            >
              Ya, Hapus Akun
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
