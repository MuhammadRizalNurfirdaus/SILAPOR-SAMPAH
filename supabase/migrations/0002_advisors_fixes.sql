-- =====================================================================
-- SILAPOR SAMPAH — Migrasi 0002: Perbaikan Penasihat Keamanan & Performa
-- =====================================================================

-- 1. Keamanan: Tetapkan search_path eksplisit pada fungsi publik
alter function public.set_updated_at() set search_path = public;
alter function public.generate_kode_tiket() set search_path = public;

-- 2. Keamanan: Cabut hak eksekusi langsung dari anon & public untuk fungsi internal / trigger
revoke execute on function public.apply_respon_aduan() from public, anon, authenticated;
revoke execute on function public.has_role(public.user_role[]) from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon, authenticated;
revoke execute on function public.is_kabid_or_admin() from public, anon, authenticated;

-- 3. Performa: Indeks penutup untuk foreign key
create index if not exists idx_aduan_ditangani_oleh on public.aduan(ditangani_oleh);
create index if not exists idx_audit_log_actor_id on public.audit_log(actor_id);
create index if not exists idx_bukti_sopir_id on public.bukti_pengangkutan(sopir_id);
create index if not exists idx_lokasi_perjalanan_id on public.lokasi_armada(perjalanan_id);
create index if not exists idx_respon_aduan_petugas_id on public.respon_aduan(petugas_id);

-- 4. Performa: Konsolidasi RLS dan optimalisasi auth.uid() initplan
-- 4.1 profiles
drop policy if exists profiles_select_self on public.profiles;
drop policy if exists profiles_select_staff on public.profiles;
drop policy if exists profiles_admin_write on public.profiles;

create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_kabid_or_admin());
create policy profiles_admin_insert on public.profiles for insert to authenticated with check (public.is_admin());
create policy profiles_admin_update on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy profiles_admin_delete on public.profiles for delete to authenticated using (public.is_admin());

-- 4.2 armada
drop policy if exists armada_admin_write on public.armada;
create policy armada_admin_insert on public.armada for insert to authenticated with check (public.is_admin());
create policy armada_admin_update on public.armada for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy armada_admin_delete on public.armada for delete to authenticated using (public.is_admin());

-- 4.3 perjalanan
drop policy if exists perjalanan_select_own on public.perjalanan;
drop policy if exists perjalanan_select_staff on public.perjalanan;

create policy perjalanan_select on public.perjalanan for select to authenticated
  using (sopir_id = (select auth.uid()) or public.is_kabid_or_admin());

-- 4.4 lokasi_armada
drop policy if exists lokasi_select_own on public.lokasi_armada;
drop policy if exists lokasi_select_staff on public.lokasi_armada;
drop policy if exists lokasi_insert_sopir on public.lokasi_armada;

create policy lokasi_select on public.lokasi_armada for select to authenticated
  using (public.is_kabid_or_admin() or exists (
    select 1 from public.perjalanan p where p.id = perjalanan_id and p.sopir_id = (select auth.uid())
  ));
create policy lokasi_insert_sopir on public.lokasi_armada for insert to authenticated
  with check (exists (
    select 1 from public.perjalanan p
    where p.id = perjalanan_id and p.sopir_id = (select auth.uid())
      and p.status = 'berjalan' and p.armada_id = lokasi_armada.armada_id
  ));

-- 4.5 bukti_pengangkutan
drop policy if exists bukti_select_own on public.bukti_pengangkutan;
drop policy if exists bukti_select_staff on public.bukti_pengangkutan;
drop policy if exists bukti_insert_sopir on public.bukti_pengangkutan;

create policy bukti_select on public.bukti_pengangkutan for select to authenticated
  using (sopir_id = (select auth.uid()) or public.is_kabid_or_admin());
create policy bukti_insert_sopir on public.bukti_pengangkutan for insert to authenticated
  with check (
    sopir_id = (select auth.uid())
    and exists (
      select 1 from public.perjalanan p
      where p.id = perjalanan_id and p.sopir_id = (select auth.uid()) and p.status = 'berjalan'
    )
  );

-- 4.6 respon_aduan
drop policy if exists respon_insert_staff on public.respon_aduan;
create policy respon_insert_staff on public.respon_aduan for insert to authenticated
  with check (public.is_kabid_or_admin() and petugas_id = (select auth.uid()));
