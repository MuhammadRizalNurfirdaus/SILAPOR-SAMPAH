import Link from "next/link";
import HeaderDLH from "@/components/layout/HeaderDLH";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col scroll-smooth">
      {/* Header Instansi DLH Kuningan */}
      <HeaderDLH />

      {/* Navbar Navigasi */}
      <Navbar />

      {/* Konten Beranda */}
      <main className="w-full flex flex-col flex-1">
        {/* ===================== HERO SECTION ===================== */}
        <section className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16 flex flex-col items-center">
          {/* Badge Pengumuman Layanan */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-dark text-xs sm:text-sm font-semibold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Portal Resmi Pelayanan Pengangkutan Sampah Kab. Kuningan</span>
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-primary-dark tracking-tight leading-tight">
              Selamat Datang di SILAPOR SAMPAH
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Sistem Lapor dan Pemantauan Pengangkutan Sampah — Dinas Lingkungan Hidup Kabupaten Kuningan.
              Mewujudkan Kuningan asri, bersih, dan sehat lewat pelaporan terbuka dan pengawasan armada real-time.
            </p>

            {/* Quick Action Anchor */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href="#alur-layanan"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark hover:underline transition-colors py-1 px-3 rounded-lg hover:bg-primary/5"
              >
                <span>Pelajari Alur & Informasi Layanan</span>
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* 3 Fitur Utama (Layar 02 Figma) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
            {/* Card 1: Peta Armada */}
            <Card className="flex flex-col justify-between p-6 sm:p-7 hover:shadow-lg transition-all border-gray-200/80 bg-surface">
              <div className="flex flex-col gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary-dark shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Peta Armada</h2>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                    Pantau pergerakan posisi armada pengangkut sampah secara real-time di seluruh wilayah Kabupaten Kuningan.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Link href="/peta" className="w-full block">
                  <Button variant="outline" fullWidth className="font-semibold">
                    Lihat Peta
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Card 2: Buat Aduan (Utama) */}
            <Card className="flex flex-col justify-between p-6 sm:p-7 border-2 border-primary/50 shadow-md hover:shadow-xl transition-all bg-surface">
              <div className="flex flex-col gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Buat Aduan</h2>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                    Laporkan TPS yang belum diangkut dengan melampirkan foto kondisi terkini secara langsung.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Link href="/aduan/baru" className="w-full block">
                  <Button variant="primary" fullWidth className="font-bold shadow-xs">
                    Buat Aduan Sekarang
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Card 3: Cek Status */}
            <Card className="flex flex-col justify-between p-6 sm:p-7 hover:shadow-lg transition-all border-gray-200/80 bg-surface">
              <div className="flex flex-col gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary-dark shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Cek Status Aduan</h2>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                    Pantau perkembangan tindak lanjut aduan yang telah dikirimkan menggunakan nomor laporan aduan Anda.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Link href="/cek-status" className="w-full block">
                  <Button variant="outline" fullWidth className="font-semibold">
                    Cek Status
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* ===================== SECTION 1: ALUR KERJA ===================== */}
        <section id="alur-layanan" className="w-full bg-white border-y border-gray-200/80 py-12 sm:py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-primary">
                Transparan & Akuntabel
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                Alur Penanganan Laporan Sampah
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Setiap aduan warga diproses secara terstruktur dan dapat dipantau perkembangannya kapan saja.
              </p>
            </div>

            {/* 4 Langkah Alur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-bg/50 border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative hover:bg-bg/80 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Warga
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">Foto & Lokasi</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Warga memilih TPS, mengambil foto kondisi, dan mengirim aduan tanpa login.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] text-gray-500 font-medium">
                  Nomor laporan aduan langsung diterbitkan otomatis.
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-bg/50 border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative hover:bg-bg/80 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    2
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    DLH Kuningan
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">Verifikasi Petugas</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Kepala Bidang memeriksa keabsahan aduan, memberikan catatan tindak lanjut, dan mengabari warga via WA.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] text-gray-500 font-medium">
                  Respon pertama maksimal 48 jam.
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-bg/50 border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative hover:bg-bg/80 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    3
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Armada Truk
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">Penjadwalan Armada</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Armada truk pengangkut sampah ditugaskan ke lokasi titik aduan sesuai rute operasional terdekat.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] text-gray-500 font-medium">
                  Posisi truk terpantau di Peta Armada.
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-bg/50 border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative hover:bg-bg/80 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    ✓
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Selesai
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">Bukti Terangkut</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Sopir mengunggah foto lokasi bersih pasca-pengangkutan sebagai bukti valid penanganan tuntas.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] text-gray-500 font-medium">
                  Foto bukti tampil di portal status warga.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 2: NILAI & TRANSPARANSI ===================== */}
        <section className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Komitmen Keterbukaan Pelayanan
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Prinsip integritas DLH Kabupaten Kuningan dalam pengelolaan sampah daerah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-2xl p-6 border border-gray-200/90 shadow-xs flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">100% Bebas Biaya</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Pelaporan TPS yang belum diangkut melalui SILAPOR SAMPAH tidak dipungut biaya apapun bagi warga Kuningan.
              </p>
            </div>

            <div className="bg-surface rounded-2xl p-6 border border-gray-200/90 shadow-xs flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">GPS Armada Terbuka</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Semua warga dapat melihat armada truk yang sedang beroperasi di peta interaktif untuk memastikan pemerataan rute.
              </p>
            </div>

            <div className="bg-surface rounded-2xl p-6 border border-gray-200/90 shadow-xs flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Kabar Respon Cepat</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Petugas dibekali fitur respon resmi satu klik via WhatsApp sehingga warga langsung mendapat kepastian penanganan.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 3: FAQ ===================== */}
        <section className="w-full bg-white border-y border-gray-200/80 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-primary">
                Bantuan & Panduan
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h2>
            </div>

            <div className="space-y-4">
              <details className="group bg-bg/40 border border-gray-200 rounded-xl p-4 sm:p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 text-sm sm:text-base">
                  <span>Apakah saya harus membuat akun untuk melaporkan sampah?</span>
                  <span className="ml-4 shrink-0 transition-transform duration-200 group-open:rotate-180">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-200/60">
                  Tidak perlu. Pelaporan sampah di SILAPOR SAMPAH terbuka untuk umum tanpa harus mendaftar atau login.
                  Setelah mengirim laporan, Anda akan langsung menerima <strong>Nomor Laporan Aduan</strong> resmi.
                </p>
              </details>

              <details className="group bg-bg/40 border border-gray-200 rounded-xl p-4 sm:p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 text-sm sm:text-base">
                  <span>Berapa lama laporan aduan akan ditindaklanjuti?</span>
                  <span className="ml-4 shrink-0 transition-transform duration-200 group-open:rotate-180">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-200/60">
                  Petugas DLH Kuningan melakukan verifikasi awal maksimal dalam <strong>1x24 jam hingga 48 jam</strong> kerja.
                  Pengangkutan fisik sampah di lapangan dijadwalkan berdasarkan zona rute armada aktif terdekat.
                </p>
              </details>

              <details className="group bg-bg/40 border border-gray-200 rounded-xl p-4 sm:p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 text-sm sm:text-base">
                  <span>Jenis sampah apa saja yang dapat dilaporkan di sini?</span>
                  <span className="ml-4 shrink-0 transition-transform duration-200 group-open:rotate-180">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-200/60">
                  Aduan difokuskan pada TPS (Tempat Pembuangan Sementara) resmi yang belum diangkut
                  atau mengalami kelebihan kapasitas.
                </p>
              </details>

              <details className="group bg-bg/40 border border-gray-200 rounded-xl p-4 sm:p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 text-sm sm:text-base">
                  <span>Bagaimana cara saya membuktikan bahwa sampah sudah terangkut?</span>
                  <span className="ml-4 shrink-0 transition-transform duration-200 group-open:rotate-180">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-200/60">
                  Setiap kali sopir armada menyelesaikan pengangkutan, mereka wajib mengunggah <strong>foto bukti penanganan</strong>.
                  Foto bukti ini dapat Anda lihat secara transparan pada menu <strong>Cek Status Aduan</strong> dengan memasukkan nomor laporan aduan Anda.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 4: KONTAK & INFORMASI KANTOR ===================== */}
        <section className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-surface rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-primary">
                  Layanan Pengaduan & Informasi
                </span>
                <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1 mb-4">
                  Dinas Lingkungan Hidup Kabupaten Kuningan
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Jika Anda membutuhkan bantuan mendesak terkait pengangkutan atau ingin berkonsultasi mengenai pengelolaan sampah wilayah, tim pelayanan kami siap membantu.
                </p>

                <div className="space-y-3.5 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">📍</span>
                    <div>
                      <strong className="text-gray-900 block">Alamat Kantor:</strong>
                      <span>Jl. Moch. Yamin No. 27, Babakanreuma, Kec. Jalaksana, Kabupaten Kuningan, Jawa Barat 45554</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">⏰</span>
                    <div>
                      <strong className="text-gray-900 block">Jam Operasional Pelayanan:</strong>
                      <span>Senin – Jumat: 07.30 – 16.00 WIB | Armada Lapangan: Setiap Hari 06.00 – 17.00 WIB</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">✉️</span>
                    <div>
                      <strong className="text-gray-900 block">Email Resmi:</strong>
                      <span>dlh@kuningankab.go.id</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Callout Box Aksi Cepat */}
              <div className="bg-bg/60 border border-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 text-center lg:text-left">
                <div>
                  <h3 className="text-lg font-bold text-primary-dark">
                    Ada TPS yang Belum Diangkut di Sekitar Anda?
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Jangan biarkan TPS penuh menumpuk. Laporkan segera agar tim armada DLH Kuningan dapat menjadwalkan pengangkutan.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/aduan/baru">
                    <Button variant="primary" className="w-full sm:w-auto font-bold px-6">
                      Kirim Laporan Sekarang
                    </Button>
                  </Link>
                  <Link href="/peta">
                    <Button variant="outline" className="w-full sm:w-auto font-semibold px-6">
                      Pantau Armada
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER RESMI INSTANSI ===================== */}
      <footer className="w-full bg-slate-900 text-gray-300 border-t border-slate-800 pt-10 pb-8 select-none">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs sm:text-sm">
            {/* Kolom 1: Profil Singkat */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="font-black text-white text-base tracking-tight">
                  SILAPOR SAMPAH
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  v1.0 MVP
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed max-w-md">
                Sistem Lapor dan Pemantauan Pengangkutan Sampah — Dinas Lingkungan Hidup Kabupaten Kuningan.
                Inovasi pelayanan publik digital demi terwujudnya Kabupaten Kuningan yang bersih, sehat, dan berkelanjutan.
              </p>
              <div className="text-[11px] text-gray-500 font-medium mt-1">
                Rapih Winangun Kerta Raharja
              </div>
            </div>

            {/* Kolom 2: Navigasi Warga */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                Layanan Warga
              </h4>
              <Link href="/peta" className="text-gray-400 hover:text-white transition-colors">
                Peta Armada Real-Time
              </Link>
              <Link href="/aduan/baru" className="text-gray-400 hover:text-white transition-colors">
                Buat Laporan Baru
              </Link>
              <Link href="/cek-status" className="text-gray-400 hover:text-white transition-colors">
                Lacak Nomor Laporan
              </Link>
              <a href="#alur-layanan" className="text-gray-400 hover:text-white transition-colors">
                Alur Penanganan
              </a>
            </div>

            {/* Kolom 3: Akses Khusus Petugas */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                Akses Petugas
              </h4>
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                Masuk Portal Petugas
              </Link>
              <span className="text-xs text-gray-500">
                Khusus Sopir Armada, Kepala Bidang, & Administrator DLH Kuningan.
              </span>
            </div>
          </div>

          {/* Baris Bawah: Copyright & Waktu WIB */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
            <p>
              © 2026 Pemerintah Kabupaten Kuningan — Dinas Lingkungan Hidup. Hak Cipta Dilindungi Undang-Undang.
            </p>
            <p className="font-mono text-gray-400">
              Waktu Server: WIB (UTC+7)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
