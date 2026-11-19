/**
 * Mengonversi username staf internal menjadi format email sintetis untuk Supabase Auth.
 * Format: username@silapor.local
 */
export const toEmail = (username: string): string =>
  `${username.trim().toLowerCase()}@silapor.local`;
