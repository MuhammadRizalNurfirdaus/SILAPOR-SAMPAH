-- =====================================================================
-- SILAPOR SAMPAH — Migrasi 0007: TPS (master) + batas 1 aduan aktif per TPS
-- =====================================================================

-- 1. Tabel master TPS
create table public.tps (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null check (char_length(nama) between 2 and 100),
  kecamatan    text not null check (char_length(kecamatan) between 2 and 100),
  alamat       text,
  lat          double precision,
  lng          double precision,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_tps_updated before update on public.tps
  for each row execute function public.set_updated_at();

-- Nama TPS unik dalam satu kecamatan (case-insensitive)
create unique index uq_tps_kecamatan_nama on public.tps (kecamatan, lower(nama));

create index idx_tps_kecamatan on public.tps (kecamatan);

-- 2. RLS
alter table public.tps enable row level security;

create policy tps_select_aktif on public.tps
  for select to anon, authenticated
  using (is_active);

create policy tps_select_staff on public.tps
  for select to authenticated
  using (public.is_kabid_or_admin());

create policy tps_admin_insert on public.tps
  for insert to authenticated
  with check (public.is_admin());

create policy tps_admin_update on public.tps
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy tps_admin_delete on public.tps
  for delete to authenticated
  using (public.is_admin());

grant select on public.tps to anon, authenticated;
grant insert, update, delete on public.tps to authenticated;
grant all on public.tps to authenticator;

-- 3. Relasi aduan -> tps (nullable untuk aduan lama)
alter table public.aduan
  add column tps_id uuid references public.tps(id) on delete restrict;

create index idx_aduan_tps_id on public.aduan (tps_id);

-- 4. Aturan: satu aduan aktif (baru/diproses) per TPS
create unique index uq_aduan_tps_aktif on public.aduan (tps_id)
  where tps_id is not null and status in ('baru', 'diproses');
