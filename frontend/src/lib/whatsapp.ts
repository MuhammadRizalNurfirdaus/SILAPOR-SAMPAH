// ponytail: helper utilitas WhatsApp resmi DLH Kuningan - zero external deps

export interface WhatsAppAduanParams {
  phone: string;
  namaPelapor: string;
  kodeTiket: string;
  status: 'baru' | 'diproses' | 'selesai' | 'ditolak';
  catatan?: string | null;
  origin?: string;
}

/**
 * Format nomor telepon Indonesia ke standar internasional WhatsApp (E.164 tanpa tanda +)
 * Contoh: '08123456789' -> '628123456789'
 * Mengembalikan null jika nomor dummy anonim UU PDP ('080000000000') atau tidak valid.
 */
export function formatWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Bersihkan semua karakter selain angka
  const cleaned = phone.replace(/[^0-9]/g, '');

  // Abaikan nomor dummy anonimisasi UU PDP atau terlalu pendek
  if (cleaned === '080000000000' || cleaned.length < 9) {
    return null;
  }

  // Jika diawali 08, ganti 0 dengan 62
  if (cleaned.startsWith('08')) {
    return '62' + cleaned.slice(1);
  }

  // Jika diawali 628, sudah benar
  if (cleaned.startsWith('628')) {
    return cleaned;
  }

  // Jika diawali 8 (misal format 812...), tambahkan 62
  if (cleaned.startsWith('8')) {
    return '62' + cleaned;
  }

  return cleaned;
}

/**
 * Cek apakah nomor telepon warga dapat dikirimi pesan WhatsApp
 */
export function isWhatsAppAvailable(phone: string | null | undefined): boolean {
  return formatWhatsAppNumber(phone) !== null;
}

const statusTextMap: Record<string, string> = {
  baru: 'Baru Diterima (Menunggu Penjadwalan)',
  diproses: 'Sedang Diproses (Armada Ditugaskan)',
  selesai: 'Selesai (Sampah Telah Diangkut)',
  ditolak: 'Tidak Dapat Diproses (Di Luar Kewenangan / Tidak Ditemukan)',
};

/**
 * Hasilkan URL wa.me dengan teks pesan terformat rapi dan sopan dari DLH Kuningan
 */
export function generateWhatsAppAduanUrl({
  phone,
  namaPelapor,
  kodeTiket,
  status,
  catatan,
  origin = 'https://silapor-sampah.kuningankab.go.id',
}: WhatsAppAduanParams): string | null {
  const formattedPhone = formatWhatsAppNumber(phone);
  if (!formattedPhone) return null;

  const statusLabel = statusTextMap[status] || status;
  const trackingUrl = `${origin.replace(/\/$/, '')}/cek-status?kode=${encodeURIComponent(kodeTiket)}`;

  let pesan = `*PEMBERITAHUAN STATUS LAPORAN ADUAN SAMPAH*\n`;
  pesan += `*Dinas Lingkungan Hidup Kabupaten Kuningan*\n\n`;
  pesan += `Halo Bpk/Ibu *${namaPelapor || 'Masyarakat'}*,\n\n`;
  pesan += `Terima kasih atas laporan aduan tumpukan sampah yang Anda sampaikan. Berikut adalah pembaruan status terbaru dari Kepala Bidang Pengelolaan Sampah:\n\n`;
  pesan += `🎫 *Nomor Laporan Aduan:* \`${kodeTiket}\`\n`;
  pesan += `📊 *Status Laporan:* *${statusLabel}*\n`;

  if (catatan && catatan.trim().length > 0) {
    pesan += `💬 *Tindak Lanjut / Catatan Petugas:*\n"${catatan.trim()}"\n`;
  }

  pesan += `\nAnda dapat memantau rincian penanganan dan bukti pengangkutan melalui portal resmi warga:\n`;
  pesan += `🔗 ${trackingUrl}\n\n`;
  pesan += `Mari bersama-sama menjaga Kabupaten Kuningan tetap bersih, asri, dan sehat.\n\n`;
  pesan += `_Bidang Pengelolaan Sampah & Kebersihan_\n`;
  pesan += `_Dinas Lingkungan Hidup Kabupaten Kuningan_`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(pesan)}`;
}
