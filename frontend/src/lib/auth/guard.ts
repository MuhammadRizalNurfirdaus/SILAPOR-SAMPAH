import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type UserRole = Database['public']['Enums']['user_role'];

export interface UserSession {
  user: {
    id: string;
    email?: string;
  };
  profile: Database['public']['Tables']['profiles']['Row'];
}

/**
 * Memastikan pengguna sudah login, berstatus aktif, dan memiliki salah satu peran yang diizinkan.
 * Digunakan pada Server Component dan Server Action.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<UserSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.is_active || !allowedRoles.includes(profile.role)) {
    redirect('/unauthorized');
  }

  return { user, profile };
}

/**
 * Memastikan pengguna sudah terautentikasi dan akun berstatus aktif.
 */
export async function requireAuth(): Promise<UserSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.is_active) {
    redirect('/login');
  }

  return { user, profile };
}
