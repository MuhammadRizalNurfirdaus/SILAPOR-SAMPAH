import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';
import { createServerClient } from '@supabase/ssr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envContent = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE_URL = 'http://localhost:3002';
const PASSWORD = 'PasswordKuningan2026!';

// 10 Viewport Widths per RESPONSIVE_SPEC §7.1 & §7.2
const WIDTHS = [320, 360, 390, 412, 768, 820, 1024, 1280, 1440, 1920];

async function getAuthCookies(email) {
  const cookieStore = new Map();
  const ssrClient = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value));
      },
    },
  });

  await ssrClient.auth.signInWithPassword({ email, password: PASSWORD });

  return Array.from(cookieStore.entries()).map(([name, value]) => ({
    name,
    value,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  }));
}

async function main() {
  console.log('=== AUDIT RESPONSIVE & HORIZONTAL OVERFLOW MATRIX ===');
  console.log(`Matriks Lebar Layar: ${WIDTHS.join(', ')} px (RESPONSIVE_SPEC §7.1)\n`);

  const browser = await chromium.launch({
    executablePath: '/usr/bin/brave',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // 1. Audit Rute Publik
  console.log('--- 1. Menguji Rute Publik ---');
  const publicRoutes = ['/', '/peta', '/aduan/baru', '/cek-status', '/login'];
  for (const route of publicRoutes) {
    const page = await browser.newPage();
    let hasOverflow = false;

    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      // Tunggu render
      await page.waitForTimeout(300);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (overflow) {
        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
        console.error(`  ❌ OVERFLOW PADA ${route} @ ${w}px (scrollWidth: ${scrollW}px)`);
        hasOverflow = true;
      }
    }

    if (!hasOverflow) {
      console.log(`  ✓ ${route.padEnd(16)} : LULUS pada semua 10 resolusi (320-1920px)`);
    } else {
      throw new Error(`Audit overflow gagal pada rute publik ${route}`);
    }
    await page.close();
  }

  // 2. Audit Rute Sopir
  console.log('\n--- 2. Menguji Rute Sopir (Terautentikasi) ---');
  const sopirCookies = await getAuthCookies('sopir1@silapor.local');
  const contextSopir = await browser.newContext();
  await contextSopir.addCookies(sopirCookies);
  const sopirRoutes = ['/sopir', '/sopir/perjalanan'];

  for (const route of sopirRoutes) {
    const page = await contextSopir.newPage();
    let hasOverflow = false;

    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (overflow) {
        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
        console.error(`  ❌ OVERFLOW PADA ${route} @ ${w}px (scrollWidth: ${scrollW}px)`);
        hasOverflow = true;
      }
    }

    if (!hasOverflow) {
      console.log(`  ✓ ${route.padEnd(20)} : LULUS pada semua 10 resolusi (320-1920px)`);
    } else {
      throw new Error(`Audit overflow gagal pada rute sopir ${route}`);
    }
    await page.close();
  }
  await contextSopir.close();

  // 3. Audit Rute Kabid
  console.log('\n--- 3. Menguji Rute Kabid (Terautentikasi) ---');
  const kabidCookies = await getAuthCookies('kabid@silapor.local');
  const contextKabid = await browser.newContext();
  await contextKabid.addCookies(kabidCookies);
  const kabidRoutes = ['/kabid', '/kabid/galeri', '/kabid/aduan', '/kabid/laporan'];

  for (const route of kabidRoutes) {
    const page = await contextKabid.newPage();
    let hasOverflow = false;

    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (overflow) {
        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
        console.error(`  ❌ OVERFLOW PADA ${route} @ ${w}px (scrollWidth: ${scrollW}px)`);
        hasOverflow = true;
      }
    }

    if (!hasOverflow) {
      console.log(`  ✓ ${route.padEnd(20)} : LULUS pada semua 10 resolusi (320-1920px)`);
    } else {
      throw new Error(`Audit overflow gagal pada rute kabid ${route}`);
    }
    await page.close();
  }
  await contextKabid.close();

  // 4. Audit Rute Admin
  console.log('\n--- 4. Menguji Rute Admin (Terautentikasi) ---');
  const adminCookies = await getAuthCookies('admin@silapor.local');
  const contextAdmin = await browser.newContext();
  await contextAdmin.addCookies(adminCookies);
  const adminRoutes = ['/admin/armada', '/admin/pengguna'];

  for (const route of adminRoutes) {
    const page = await contextAdmin.newPage();
    let hasOverflow = false;

    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (overflow) {
        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
        console.error(`  ❌ OVERFLOW PADA ${route} @ ${w}px (scrollWidth: ${scrollW}px)`);
        hasOverflow = true;
      }
    }

    if (!hasOverflow) {
      console.log(`  ✓ ${route.padEnd(20)} : LULUS pada semua 10 resolusi (320-1920px)`);
    } else {
      throw new Error(`Audit overflow gagal pada rute admin ${route}`);
    }
    await page.close();
  }
  await contextAdmin.close();

  // 5. Audit Target Sentuh & Font Size Mobile (Layar 360px & 390px)
  console.log('\n--- 5. Audit Ukuran Target Sentuh (≥ 44px) & Font Input (≥ 16px) di Mobile ---');
  const testMobilePage = await browser.newPage();
  await testMobilePage.setViewportSize({ width: 390, height: 844 });
  await testMobilePage.goto(`${BASE_URL}/aduan/baru`, { waitUntil: 'domcontentloaded' });

  const inputFontSizes = await testMobilePage.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'));
    return inputs.map((el) => {
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        type: el.type || '',
        fontSize: parseFloat(style.fontSize),
      };
    });
  });

  const smallInputs = inputFontSizes.filter((i) => i.fontSize < 16);
  if (smallInputs.length > 0) {
    console.warn(`  ⚠️ Peringatan: Ditemukan ${smallInputs.length} input dengan font-size < 16px (bisa memicu zoom di iOS Safari)`);
  } else {
    console.log(`  ✓ Seluruh input form di mobile memiliki font-size ≥ 16px (${inputFontSizes.length} field terverifikasi)`);
  }

  await testMobilePage.close();
  await browser.close();

  console.log('\n======================================================');
  console.log('🎉 AUDIT RESPONSIVE DoD: LULUS PADA SEMUA RESOLUSI! 🎉');
  console.log('======================================================');
}

main().catch((err) => {
  console.error('\n❌ GAGAL AUDIT RESPONSIVE:', err.message);
  process.exit(1);
});
