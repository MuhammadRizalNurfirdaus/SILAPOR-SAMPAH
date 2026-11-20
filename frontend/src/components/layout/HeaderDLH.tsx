import Image from "next/image";

interface HeaderDLHProps {
  className?: string;
}

export default function HeaderDLH({ className = "" }: HeaderDLHProps) {
  return (
    <header className={`w-full bg-white border-b border-gray-200 select-none ${className}`}>
      {/* Banner Instansi Resmi DLH Kuningan */}
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Kiri: Logo DLH Kuningan */}
        <div className="shrink-0 flex items-center">
          <Image
            src="/logodlh.png"
            alt="Logo Dinas Lingkungan Hidup Kabupaten Kuningan"
            width={72}
            height={72}
            priority
            className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain pointer-events-none"
          />
        </div>

        {/* Tengah: Teks Nama Instansi (DINAS LINGKUNGAN HIDUP KABUPATEN KUNINGAN) */}
        <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0 px-1 sm:px-4">
          <h1 className="font-extrabold text-gray-900 tracking-tight sm:tracking-normal uppercase text-xs sm:text-base md:text-xl lg:text-2xl leading-tight">
            DINAS LINGKUNGAN HIDUP
          </h1>
          <p className="font-bold text-gray-900 tracking-wider uppercase text-[10px] sm:text-xs md:text-base lg:text-lg leading-tight mt-0.5 sm:mt-1">
            KABUPATEN KUNINGAN
          </p>
        </div>

        {/* Kanan: Logo Kabupaten Kuningan */}
        <div className="shrink-0 flex items-center">
          <Image
            src="/logokuningan.png"
            alt="Logo Kabupaten Kuningan"
            width={72}
            height={72}
            priority
            className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Garis Aksen Bawah (Hijau Tua - Hijau Terang - Emas Khas Kuningan) */}
      <div
        className="w-full h-[3px] sm:h-[4px] bg-gradient-to-r from-[#14532D] via-[#15803D] via-1/2 to-[#F59E0B]"
        aria-hidden="true"
      />
    </header>
  );
}
