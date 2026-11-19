import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-[calc(100dvh-130px)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center p-6 sm:p-8 space-y-6 shadow-md border-amber-200">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-2xl">
          !
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            403 — Akses Ditolak
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman ini. Pastikan Anda telah masuk dengan peran pengguna yang sesuai.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/" className="flex-1">
            <Button variant="secondary" fullWidth>
              Beranda Publik
            </Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button fullWidth>
              Masuk Akun Lain
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
