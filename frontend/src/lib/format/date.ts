/**
 * Memformat tanggal string/Date ke format zona waktu Indonesia Barat (WIB).
 * Contoh: "19 November 2026, 14:30 WIB"
 */
export function formatWIB(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';

  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '-';

    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return `${formatter.format(d)} WIB`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Format tanggal ringkas: "19 Nov 2026, 14:30"
 */
export function formatWIBShort(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';

  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '-';

    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return `${formatter.format(d)} WIB`;
  } catch {
    return String(dateInput);
  }
}
