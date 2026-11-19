'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { toEmail } from '@/lib/auth/username';

const HOME = {
  sopir: '/sopir',
  kabid: '/kabid',
  admin: '/admin/armada',
} as const;

export type LoginState = {
  error?: string;
};

export async function login(_prevState: LoginState | null, form: FormData): Promise<LoginState> {
  const username = String(form.get('username') ?? '').trim();
  const password = String(form.get('password') ?? '');

  if (!username || !password) {
    return { error: 'Username atau password salah' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  });

  // Layar 01b: pesan generik tanpa membocorkan apakah username atau password yang salah
  if (error || !data.user) {
    return { error: 'Username atau password salah' };
  }

  const { data: p } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single();

  if (!p || !p.is_active) {
    await supabase.auth.signOut();
    return { error: 'Username atau password salah' };
  }

  const destination = HOME[p.role as keyof typeof HOME] ?? '/';
  redirect(destination);
}
