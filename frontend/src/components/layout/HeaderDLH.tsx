import Image from "next/image";

interface HeaderDLHProps {
  className?: string;
}

export default function HeaderDLH({ className = "" }: HeaderDLHProps) {
  return (
    <header className={`w-full bg-white border-b border-gray-200/90 shadow-xs select-none ${className}`}>
      {/* Banner Instansi Resmi DLH Kuningan */}
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Kiri: Logo DLH Kuningan (Fixed symmetric box for optical center) */}
        <div className="w-12 sm:w-20 md:w-24 shrink-0 flex items-center justify-start">
          <Image
            src="/logodlh.png"
            alt="Logo Dinas Lingkungan Hidup Kabupaten Kuningan"
            width={84}
            height={84}
            priority
            className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain pointer-events-none drop-shadow-xs"
          />
        </div>

        {/* Tengah: Teks Nama Instansi (DINAS LINGKUNGAN HIDUP KABUPATEN KUNINGAN) */}
        <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0 px-1 sm:px-4">
          <h1 className="font-black text-gray-900 tracking-tight sm:tracking-normal uppercase text-xs sm:text-base md:text-xl lg:text-2xl leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            DINAS LINGKUNGAN HIDUP
          </h1>
          <p className="font-extrabold text-emerald-800 tracking-wider sm:tracking-widest uppercase text-[10px] sm:text-xs md:text-sm lg:text-base leading-tight mt-0.5 sm:mt-1">
            KABUPATEN KUNINGAN
          </p>
        </div>

        {/* Kanan: Logo Lambang Kabupaten Kuningan (Fixed symmetric box for optical center) */}
        <div className="w-12 sm:w-20 md:w-24 shrink-0 flex items-center justify-end">
          <Image
            src="/logokuningan.png"
            alt="Logo Kabupaten Kuningan"
            width={84}
            height={84}
            priority
            className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain pointer-events-none drop-shadow-xs"
          />
        </div>
      </div>

      {/* Garis Aksen Bawah (Hijau Tua - Emerald - Emas Kuningan) */}
      <div
        className="w-full h-[3px] sm:h-[4px] bg-gradient-to-r from-[#14532D] via-[#16A34A] via-60% to-[#EAB308]"
        aria-hidden="true"
      />
    </header>
  );
}
