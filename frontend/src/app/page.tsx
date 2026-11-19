import Link from "next/link";
import HeaderDLH from "@/components/layout/HeaderDLH";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      {/* Header Instansi DLH */}
      <HeaderDLH />

      {/* Navbar Navigasi */}
      <Navbar />

      {/* Konten Utama Beranda */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-primary-dark tracking-tight">
            Selamat Datang di SILAPOR SAMPAH
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-700 leading-relaxed">
            Sistem Lapor dan Pemantauan Pengangkutan Sampah — Dinas Lingkungan Hidup Kabupaten Kuningan.
            Layanan keterbukaan informasi penanganan sampah untuk masyarakat yang bersih dan sehat.
          </p>
        </div>

        {/* 3 Fitur Utama (Layar 02 Figma) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {/* Card 1: Peta Armada */}
          <Card className="flex flex-col justify-between p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary-dark">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Peta Armada</h2>
              <p className="text-sm text-gray-600">
                Pantau pergerakan posisi armada pengangkut sampah secara real-time di wilayah Kabupaten Kuningan.
              </p>
            </div>
            <div className="pt-6">
              <Link href="/peta" className="w-full block">
                <Button variant="outline" fullWidth>
                  Lihat Peta
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 2: Buat Aduan */}
          <Card className="flex flex-col justify-between p-6 border-primary/40 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg">
              Utama
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Buat Aduan</h2>
              <p className="text-sm text-gray-600">
                Laporkan tumpukan sampah liar yang belum terangkut beserta foto bukti lokasi penanganan.
              </p>
            </div>
            <div className="pt-6">
              <Link href="/aduan/baru" className="w-full block">
                <Button variant="primary" fullWidth>
                  Buat Aduan
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 3: Cek Status */}
          <Card className="flex flex-col justify-between p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary-dark">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Cek Status Aduan</h2>
              <p className="text-sm text-gray-600">
                Pantau perkembangan penanganan aduan yang telah Anda kirimkan dengan memasukkan kode tiket laporan.
              </p>
            </div>
            <div className="pt-6">
              <Link href="/cek-status" className="w-full block">
                <Button variant="outline" fullWidth>
                  Cek Status
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
