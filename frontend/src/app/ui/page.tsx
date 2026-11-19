"use client";

import { useState } from "react";
import HeaderDLH from "@/components/layout/HeaderDLH";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Dialog } from "@/components/ui/Dialog";
import { TableCard, Column } from "@/components/ui/TableCard";

interface SampleAduan {
  id: string;
  kode_tiket: string;
  lokasi: string;
  status: "baru" | "diproses" | "selesai" | "ditolak";
  tanggal: string;
}

const sampleData: SampleAduan[] = [
  {
    id: "1",
    kode_tiket: "SLP-2611-AB12CD34",
    lokasi: "Jl. Siliwangi No. 45, Kuningan",
    status: "baru",
    tanggal: "19 Nov 2026, 08:30 WIB",
  },
  {
    id: "2",
    kode_tiket: "SLP-2611-EF56GH78",
    lokasi: "Pasar Baru Kuningan, Blok B",
    status: "diproses",
    tanggal: "18 Nov 2026, 14:15 WIB",
  },
  {
    id: "3",
    kode_tiket: "SLP-2611-IJ90KL12",
    lokasi: "Dekat Taman Kota Kuningan",
    status: "selesai",
    tanggal: "17 Nov 2026, 11:00 WIB",
  },
];

export default function UITestPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const columns: Column<SampleAduan>[] = [
    {
      key: "kode_tiket",
      header: "Kode Tiket",
      render: (item) => (
        <span className="font-mono font-bold text-primary">{item.kode_tiket}</span>
      ),
    },
    {
      key: "lokasi",
      header: "Lokasi Timbulan",
      render: (item) => <span className="font-medium">{item.lokasi}</span>,
    },
    {
      key: "tanggal",
      header: "Waktu Lapor",
      isSecondary: true, // Disembunyikan di layar tablet
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <Badge status={item.status} />,
    },
    {
      key: "action",
      header: "Aksi",
      className: "text-right",
      render: () => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline">
            Detail
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-dvh bg-bg flex flex-col pb-16">
      {/* 1. Header DLH Instansi Fluid */}
      <HeaderDLH />

      {/* 2. Navbar Responsif */}
      <Navbar />

      {/* Kontainer Utama */}
      <main className="max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-dark tracking-tight">
            Katalog Komponen UI — SILAPOR SAMPAH
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Uji responsivitas komponen pada 3 breakpoint utama (390px Mobile, 768px Tablet, 1280px Desktop).
          </p>
        </div>

        {/* 3. Section Alerts */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-800">Alerts & Notifikasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Alert type="error" title="Data Tidak Valid (04b)">
              Foto bukti belum diunggah atau ukuran berkas melebihi batas 5 MB.
            </Alert>
            <Alert type="warning" title="Peringatan Operasional">
              Izin GPS ditolak oleh perangkat. Lokasi tidak dapat diperbarui otomatis.
            </Alert>
            <Alert type="success" title="Aduan Berhasil Terkirim (05)">
              Laporan Anda telah tercatat dengan kode tiket <strong>SLP-2611-AB12CD34</strong>.
            </Alert>
            <Alert type="info" title="Informasi Jadwal">
              Armada E 1234 AB saat ini sedang melayani wilayah Kuningan Kota.
            </Alert>
          </div>
        </section>

        {/* 4. Section Buttons */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-800">Buttons & Interaksi (Touch Target ≥ 44px)</h2>
          <Card>
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="primary">Primary (Default)</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Bahaya / Hapus</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" isLoading>
                Memproses
              </Button>
              <Button variant="primary" disabled>
                Nonaktif
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="w-full sm:w-auto">
                Tombol Besar / Sopir (≥ 52px)
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                Buka Dialog / Bottom Sheet
              </Button>
            </div>
          </Card>
        </section>

        {/* 5. Section Badges */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-800">Status Badges</h2>
          <Card>
            <div className="flex flex-wrap gap-2.5 items-center">
              <Badge status="baru" />
              <Badge status="diproses" />
              <Badge status="selesai" />
              <Badge status="ditolak" />
              <Badge status="garasi" />
              <Badge status="beroperasi" />
              <Badge status="perawatan" />
              <Badge status="berjalan" />
              <Badge status="dibatalkan" />
            </div>
          </Card>
        </section>

        {/* 6. Section Formulir */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-800">Komponen Form (Input ≥ 16px, Min-H 44px)</h2>
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Formulir Uji Input</CardTitle>
            </CardHeader>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <Input
                label="Nama Pelapor"
                placeholder="Masukkan nama lengkap"
                requiredIndicator
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Nomor Telepon / WhatsApp"
                placeholder="Contoh: 08123456789"
                type="tel"
                helperText="Nomor aktif untuk konfirmasi petugas jika diperlukan."
              />
              <Input
                label="Input dengan Error"
                defaultValue="Data salah"
                error="Format nomor telepon tidak sesuai standar Indonesia."
              />
              <Select
                label="Jenis Armada"
                options={[
                  { value: "dump", label: "Dump Truck (8 m³)" },
                  { value: "armroll", label: "Armroll (6 m³)" },
                  { value: "pickup", label: "Pickup (2 m³)" },
                ]}
              />
              <Textarea
                label="Deskripsi Lokasi Sampah"
                placeholder="Patokan jalan, ciri-ciri lokasi..."
                rows={3}
              />
              <Button type="submit" fullWidth size="md">
                Kirim Laporan
              </Button>
            </form>
          </Card>
        </section>

        {/* 7. Section Table to Card Responsif */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              Table → Card (Desktop: Tabel, Mobile: Kartu)
            </h2>
            <span className="text-xs text-gray-500 hidden sm:inline">
              Ubah ukuran layar untuk melihat adaptasi layout
            </span>
          </div>

          <TableCard
            data={sampleData}
            columns={columns}
            keyExtractor={(item) => item.id}
            renderCard={(item) => (
              <Card className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono font-bold text-primary text-sm sm:text-base">
                    {item.kode_tiket}
                  </span>
                  <Badge status={item.status} size="sm" />
                </div>
                <p className="text-sm text-gray-800 font-medium">{item.lokasi}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>{item.tanggal}</span>
                  <Button size="sm" variant="outline">
                    Detail
                  </Button>
                </div>
              </Card>
            )}
          />
        </section>

        {/* 8. Dialog Native Modal / Mobile Bottom Sheet */}
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Konfirmasi Hapus Armada"
          description="Apakah Anda yakin ingin menonaktifkan unit armada E 1234 AB?"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Armada yang memiliki riwayat perjalanan tidak dapat dihapus permanen, melainkan akan dinonaktifkan statusnya.
            </p>
            <div className="flex flex-col sm:flex-row-reverse gap-2.5 pt-2">
              <Button
                variant="danger"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Hapus Armada
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
            </div>
          </div>
        </Dialog>
      </main>
    </div>
  );
}
