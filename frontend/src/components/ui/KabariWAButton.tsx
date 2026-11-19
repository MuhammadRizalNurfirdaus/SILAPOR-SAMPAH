'use client';

import { generateWhatsAppAduanUrl, isWhatsAppAvailable } from '@/lib/whatsapp';

export function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 18.06c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a7.89 7.89 0 01-1.22-4.29c0-4.36 3.55-7.91 7.91-7.91 2.11 0 4.09.82 5.58 2.31 1.49 1.49 2.31 3.47 2.31 5.58 0 4.36-3.55 7.91-7.91 7.91zm4.33-5.93c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.41-.54-.41-.14 0-.3 0-.46 0-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

interface KabariWAButtonProps {
  phone: string | null | undefined;
  namaPelapor: string;
  kodeTiket: string;
  status: 'baru' | 'diproses' | 'selesai' | 'ditolak';
  catatan?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function KabariWAButton({
  phone,
  namaPelapor,
  kodeTiket,
  status,
  catatan,
  size = 'sm',
  className = '',
  label = 'Kabari WA',
}: KabariWAButtonProps) {
  if (!isWhatsAppAvailable(phone)) {
    return null;
  }

  // Gunakan window.location.origin jika berada di browser
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : undefined;

  const url = generateWhatsAppAduanUrl({
    phone: phone!,
    namaPelapor,
    kodeTiket,
    status,
    catatan,
    origin,
  });

  if (!url) return null;

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs min-h-[36px] gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm min-h-[44px] gap-2',
    lg: 'px-4 py-2.5 text-sm sm:text-base min-h-[48px] gap-2.5 font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-lg font-semibold bg-[#25D366] text-white hover:bg-[#20bd5a] active:scale-[0.98] transition-all shadow-2xs hover:shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] shrink-0 ${sizeStyles} ${className}`}
      title={`Kabari ${namaPelapor} via WhatsApp (${phone})`}
      aria-label={`Kabari ${namaPelapor} via WhatsApp`}
    >
      <WhatsAppIcon className={iconSizes} />
      <span>{label}</span>
    </a>
  );
}
