-- 0003_grant_authenticated_helpers.sql
-- Memberi izin execute ke role authenticated untuk fungsi helper RLS dan trigger

grant execute on function public.has_role(public.user_role[]) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_kabid_or_admin() to authenticated;
grant execute on function public.set_updated_at() to authenticated;
grant execute on function public.generate_kode_tiket() to authenticated, anon;
