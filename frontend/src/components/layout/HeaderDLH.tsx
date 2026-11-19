import Image from "next/image";

interface HeaderDLHProps {
  className?: string;
}

export default function HeaderDLH({ className = "" }: HeaderDLHProps) {
  return (
    <header className={`w-full flex flex-col items-start relative select-none ${className}`}>
      {/* Bar Instansi Utama */}
      <div className="w-full bg-gradient-to-r from-[#14532D] via-[#15803D] via-[55%] to-[#65A30D] flex items-center overflow-hidden px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-surface rounded-[10px] px-3.5 py-1 sm:py-1.5 flex items-center shadow-xs">
          {/* Logo DLH Kuningan - Fluid Height: 34px (HP) -> 40px (Tablet) -> 44px (Desktop) */}
          <div className="h-[34px] sm:h-[40px] lg:h-[44px] w-auto relative flex items-center">
            <Image
              src="/logo-dlh-kuningan.png"
              alt="Dinas Lingkungan Hidup Kabupaten Kuningan"
              width={292}
              height={44}
              priority
              className="h-full w-auto object-contain pointer-events-none"
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
