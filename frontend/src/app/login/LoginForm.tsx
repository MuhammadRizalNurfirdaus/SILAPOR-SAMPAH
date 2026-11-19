'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login, LoginState } from './actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    {}
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert type="error" title="Gagal Masuk" className="animate-in fade-in duration-200">
          {state.error}
        </Alert>
      )}

      <div>
        <Input
          label="Username"
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          requiredIndicator
          required
          placeholder="Masukkan username staf"
          disabled={isPending}
        />
      </div>

      <div>
        <Input
          label="Kata Sandi"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          requiredIndicator
          required
          placeholder="••••••••"
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isPending}
        className="mt-2 min-h-[44px]"
      >
        {isPending ? 'Memproses...' : 'Masuk'}
      </Button>

      <div className="pt-2 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          ← Kembali ke Beranda Publik
        </Link>
      </div>
    </form>
  );
}
