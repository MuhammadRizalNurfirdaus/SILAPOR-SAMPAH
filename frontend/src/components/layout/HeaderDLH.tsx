import Image from "next/image";

interface HeaderDLHProps {
  className?: string;
}

export default function HeaderDLH({ className = "" }: HeaderDLHProps) {
  return (
    <header className={`w-full flex flex-col items-start relative select-none ${className}`}>
      {/* Bar Instansi Utama */}
      <div className="w-full bg-gradient-to-r from-[#14532D] via-[#15803D] via-[55%] to-[#65A30D] flex items-center overflow-hidden px-3 sm:px-6 lg:px-8 py-2">
        {/* Kontainer Banner Logo & Instansi */}
        <div className="bg-surface rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-4 shadow-xs w-auto max-w-full">
          {/* Kiri: Logo DLH Kuningan */}
          <div className="relative shrink-0 flex items-center">
            <Image
              src="/logodlh.png"
              alt="Logo Dinas Lingkungan Hidup Kabupaten Kuningan"
              width={48}
              height={48}
              priority
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 object-contain pointer-events-none"
            />
          </div>

          {/* Tengah: Teks Nama Instansi (DINAS LINGKUNGAN HIDUP KABUPATEN KUNINGAN) */}
          <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 min-w-0">
            <span className="font-extrabold text-[11px] sm:text-xs md:text-sm lg:text-[15px] text-gray-900 tracking-tight sm:tracking-normal uppercase leading-tight whitespace-nowrap">
              DINAS LINGKUNGAN HIDUP
            </span>
            <span className="font-bold text-[9px] sm:text-[11px] md:text-xs lg:text-[13px] text-gray-800 tracking-wider uppercase leading-tight mt-0.5 whitespace-nowrap">
              KABUPATEN KUNINGAN
            </span>
          </div>

          {/* Kanan: Logo Kabupaten Kuningan */}
          <div className="relative shrink-0 flex items-center">
            <Image
              src="/logokuningan.png"
              alt="Logo Kabupaten Kuningan"
              width={48}
              height={48}
              priority
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 object-contain pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Garis Aksen Bawah (Kuning-Oranye) */}
      <div
        className="w-full h-[4px] bg-gradient-to-r from-[#84CC16] via-[#FACC15] via-1/2 to-[#F59E0B]"
        aria-hidden="true"
      />
    </header>
  );
}
