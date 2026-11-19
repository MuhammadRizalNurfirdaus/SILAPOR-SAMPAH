/**
 * Memvalidasi token Cloudflare Turnstile dari sisi server.
 */
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  // Bypass saat testing / pengembangan lokal jika memakai test dummy keys
  if (
    token === 'XXXX.DUMMY.TOKEN.XXXX' ||
    secret.startsWith('1x0000000000000000000000000000000AA')
  ) {
    return true;
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
      }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return process.env.NODE_ENV !== 'production';
  }
}
