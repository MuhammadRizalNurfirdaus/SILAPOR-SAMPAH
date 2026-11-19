-- =====================================================================
-- SILAPOR SAMPAH — Migrasi awal (Supabase / PostgreSQL)
-- Simpan sebagai: supabase/migrations/0001_init_schema.sql
-- Jalankan: supabase db push   (atau tempel di SQL Editor Supabase)
-- Dokumen terkait: PRD.md, BUILD_GUIDE.md
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENUM
-- ---------------------------------------------------------------------
create type public.user_role         as enum ('sopir', 'kabid', 'admin');
create type public.armada_status     as enum ('garasi', 'beroperasi', 'perawatan');
create type public.perjalanan_status as enum ('berjalan', 'selesai', 'dibatalkan');
create type public.aduan_status      as enum ('baru', 'diproses', 'selesai', 'ditolak');

-- ---------------------------------------------------------------------
-- 2. FUNGSI UMUM
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Kode tiket aduan: SLP-YYMM-XXXXXXXX (8 hex acak, tidak mudah ditebak)
create or replace function public.generate_kode_tiket()
returns text language sql volatile as $$
  select 'SLP-'
         || to_char(now() at time zone 'Asia/Jakarta', 'YYMM')
         || '-'
         || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

-- ---------------------------------------------------------------------
-- 3. TABEL
-- ---------------------------------------------------------------------

-- 3.1 Profil pengguna internal (sopir, kabid, admin). Publik TIDAK punya akun.
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null unique check (username ~ '^[a-z0-9._-]{3,30}$'),
  nama_lengkap text not null check (char_length(nama_lengkap) between 2 and 100),
  role         public.user_role not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- 3.2 Armada
create table public.armada (
  id           uuid primary key default gen_random_uuid(),
  plat_nomor   text not null unique check (plat_nomor = upper(plat_nomor)),   -- contoh: 'E 1234 AB'
  jenis        text not null check (char_length(jenis) between 2 and 50),     -- contoh: 'Dump Truck'
  kapasitas_m3 numeric(6,2) check (kapasitas_m3 is null or kapasitas_m3 > 0),
  wilayah      text,
  status       public.armada_status not null default 'garasi',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_armada_updated before update on public.armada
  for each row execute function public.set_updated_at();

-- 3.3 Perjalanan armada
create table public.perjalanan (
  id         uuid primary key default gen_random_uuid(),
  armada_id  uuid not null references public.armada(id),
  sopir_id   uuid not null references public.profiles(id),
  status     public.perjalanan_status not null default 'berjalan',
  mulai_at   timestamptz not null default now(),
  selesai_at timestamptz,
  ringkasan  text check (ringkasan is null or char_length(ringkasan) <= 1000),
  created_at timestamptz not null default now(),
  check (selesai_at is null or selesai_at >= mulai_at)
);
-- Satu armada & satu sopir hanya boleh punya 1 perjalanan aktif
create unique index uq_perjalanan_armada_aktif on public.perjalanan (armada_id) where status = 'berjalan';
create unique index uq_perjalanan_sopir_aktif  on public.perjalanan (sopir_id)  where status = 'berjalan';
create index idx_perjalanan_mulai on public.perjalanan (mulai_at desc);

-- 3.4 Titik lokasi armada (dikirim berkala dari HP sopir)
create table public.lokasi_armada (
  id            bigint generated always as identity primary key,
  perjalanan_id uuid not null references public.perjalanan(id) on delete cascade,
  armada_id     uuid not null references public.armada(id),
  lat           double precision not null check (lat between -90 and 90),
  lng           double precision not null check (lng between -180 and 180),
  direkam_at    timestamptz not null default now()
);
create index idx_lokasi_armada_terbaru on public.lokasi_armada (armada_id, direkam_at desc);

-- 3.5 Foto bukti pengangkutan
create table public.bukti_pengangkutan (
  id            uuid primary key default gen_random_uuid(),
  perjalanan_id uuid not null references public.perjalanan(id) on delete cascade,
  sopir_id      uuid not null references public.profiles(id),
  foto_path     text not null,               -- path di bucket 'bukti-pengangkutan'
  keterangan    text check (keterangan is null or char_length(keterangan) <= 300),
  lat           double precision,
  lng           double precision,
  created_at    timestamptz not null default now()
);
create index idx_bukti_perjalanan on public.bukti_pengangkutan (perjalanan_id);
create index idx_bukti_created    on public.bukti_pengangkutan (created_at desc);

-- 3.6 Aduan masyarakat (diisi publik lewat Route Handler server, bukan langsung dari browser)
create table public.aduan (
  id               uuid primary key default gen_random_uuid(),
  kode_tiket       text not null unique default public.generate_kode_tiket(),
  nama_pelapor     text not null check (char_length(nama_pelapor) between 2 and 100),
  no_telepon       text not null check (no_telepon ~ '^(\+62|62|0)8[1-9][0-9]{6,11}$'),
  deskripsi_lokasi text not null check (char_length(deskripsi_lokasi) between 10 and 500),
  foto_path        text not null,            -- path di bucket 'aduan-foto'
  lat              double precision,
  lng              double precision,
  status           public.aduan_status not null default 'baru',
  ditangani_oleh   uuid references public.profiles(id),
  ip_hash          text,                     -- hash IP untuk pembatasan laju (bukan IP asli)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_aduan_updated before update on public.aduan
  for each row execute function public.set_updated_at();
create index idx_aduan_status_created on public.aduan (status, created_at desc);
create index idx_aduan_ip_created     on public.aduan (ip_hash, created_at desc);

-- 3.7 Respon petugas terhadap aduan
create table public.respon_aduan (
  id               uuid primary key default gen_random_uuid(),
  aduan_id         uuid not null references public.aduan(id) on delete cascade,
  petugas_id       uuid not null references public.profiles(id),
  status_baru      public.aduan_status not null,
  catatan          text not null check (char_length(catatan) between 3 and 1000),
  tampil_ke_publik boolean not null default true,
  created_at       timestamptz not null default now()
);
create index idx_respon_aduan on public.respon_aduan (aduan_id, created_at);

-- 3.8 Log audit tindakan admin (ditulis server dengan service role)
create table public.audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid references public.profiles(id),
  aksi       text not null,                  -- mis. 'armada.hapus', 'pengguna.buat'
  entitas    text not null,
  entitas_id text,
  detail     jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. FUNGSI PERAN (security definer agar tidak rekursif di RLS)
-- ---------------------------------------------------------------------
create or replace function public.has_role(allowed public.user_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active and p.role = any(allowed)
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(array['admin']::public.user_role[]);
$$;

create or replace function public.is_kabid_or_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(array['kabid','admin']::public.user_role[]);
$$;

-- ---------------------------------------------------------------------
-- 5. RPC BISNIS
-- ---------------------------------------------------------------------

-- 5.1 Sopir memulai perjalanan
create or replace function public.mulai_perjalanan(p_armada_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_status public.armada_status;
  v_id     uuid;
begin
  if not public.has_role(array['sopir']::public.user_role[]) then
    raise exception 'Hanya sopir yang dapat memulai perjalanan' using errcode = '42501';
  end if;

  select status into v_status
  from public.armada
  where id = p_armada_id and is_active
  for update;

  if v_status is null then
    raise exception 'Armada tidak ditemukan';
  end if;
  if v_status <> 'garasi' then
    raise exception 'Armada tidak tersedia (status: %)', v_status;
  end if;

  insert into public.perjalanan (armada_id, sopir_id)
  values (p_armada_id, auth.uid())
  returning id into v_id;

  update public.armada set status = 'beroperasi' where id = p_armada_id;
  return v_id;
end $$;

-- 5.2 Sopir mengakhiri perjalanan (wajib sudah ada >= 1 foto bukti)
create or replace function public.akhiri_perjalanan(p_perjalanan_id uuid, p_ringkasan text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_armada uuid;
  v_bukti  int;
begin
  select armada_id into v_armada
  from public.perjalanan
  where id = p_perjalanan_id and sopir_id = auth.uid() and status = 'berjalan'
  for update;

  if v_armada is null then
    raise exception 'Perjalanan aktif tidak ditemukan';
  end if;

  select count(*) into v_bukti from public.bukti_pengangkutan where perjalanan_id = p_perjalanan_id;
  if v_bukti = 0 then
    raise exception 'Unggah minimal satu foto bukti sebelum mengakhiri perjalanan';
  end if;

  update public.perjalanan
     set status = 'selesai', selesai_at = now(), ringkasan = p_ringkasan
   where id = p_perjalanan_id;

  update public.armada set status = 'garasi' where id = v_armada;
end $$;

-- 5.3 Cek status aduan oleh publik (hanya dipanggil server dengan service role)
create or replace function public.cek_status_aduan(p_kode text)
returns table (kode_tiket text, status public.aduan_status, created_at timestamptz, updated_at timestamptz, respon jsonb)
language sql stable security definer set search_path = public as $$
  select a.kode_tiket, a.status, a.created_at, a.updated_at,
         coalesce((
           select jsonb_agg(jsonb_build_object('status', r.status_baru, 'catatan', r.catatan, 'waktu', r.created_at)
                            order by r.created_at)
           from public.respon_aduan r
           where r.aduan_id = a.id and r.tampil_ke_publik
         ), '[]'::jsonb) as respon
  from public.aduan a
  where a.kode_tiket = upper(trim(p_kode));
$$;

-- 5.4 Setiap respon petugas otomatis memperbarui status aduan
create or replace function public.apply_respon_aduan()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.aduan
     set status = new.status_baru, ditangani_oleh = new.petugas_id
   where id = new.aduan_id;
  return new;
end $$;

create trigger trg_respon_apply after insert on public.respon_aduan
  for each row execute function public.apply_respon_aduan();

-- 5.5 Posisi terakhir tiap armada yang sedang beroperasi
--     (publik lewat Route Handler server + penyamaran plat; staf lewat RPC langsung)
create or replace function public.posisi_armada_terbaru()
returns table (armada_id uuid, plat_nomor text, jenis text, lat double precision, lng double precision, direkam_at timestamptz)
language sql stable security definer set search_path = public as $$
  select distinct on (l.armada_id)
         l.armada_id, a.plat_nomor, a.jenis, l.lat, l.lng, l.direkam_at
  from public.lokasi_armada l
  join public.armada a     on a.id = l.armada_id
  join public.perjalanan p on p.id = l.perjalanan_id and p.status = 'berjalan'
  where a.is_active and a.status = 'beroperasi'
  order by l.armada_id, l.direkam_at desc;
$$;

-- Hak eksekusi fungsi
revoke execute on function public.mulai_perjalanan(uuid)           from public, anon;
revoke execute on function public.akhiri_perjalanan(uuid, text)    from public, anon;
revoke execute on function public.cek_status_aduan(text)           from public, anon, authenticated;
grant  execute on function public.mulai_perjalanan(uuid)           to authenticated;
grant  execute on function public.akhiri_perjalanan(uuid, text)    to authenticated;
grant  execute on function public.cek_status_aduan(text)           to service_role;
revoke execute on function public.posisi_armada_terbaru()          from public, anon;
grant  execute on function public.posisi_armada_terbaru()          to authenticated, service_role;

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- Prinsip: anon TIDAK punya akses ke tabel apa pun. Data publik (peta, aduan,
-- cek status) dilayani Route Handler server dengan service role + validasi + rate limit.
-- ---------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.armada             enable row level security;
alter table public.perjalanan         enable row level security;
alter table public.lokasi_armada      enable row level security;
alter table public.bukti_pengangkutan enable row level security;
alter table public.aduan              enable row level security;
alter table public.respon_aduan       enable row level security;
alter table public.audit_log          enable row level security;

-- profiles
create policy profiles_select_self  on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_select_staff on public.profiles for select to authenticated using (public.is_kabid_or_admin());
create policy profiles_admin_write  on public.profiles for all    to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- armada
create policy armada_select on public.armada for select to authenticated
  using (public.has_role(array['sopir','kabid','admin']::public.user_role[]));
create policy armada_admin_write on public.armada for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- perjalanan (insert/update hanya lewat RPC security definer)
create policy perjalanan_select_own   on public.perjalanan for select to authenticated using (sopir_id = auth.uid());
create policy perjalanan_select_staff on public.perjalanan for select to authenticated using (public.is_kabid_or_admin());

-- lokasi_armada
create policy lokasi_select_own on public.lokasi_armada for select to authenticated
  using (exists (select 1 from public.perjalanan p where p.id = perjalanan_id and p.sopir_id = auth.uid()));
create policy lokasi_select_staff on public.lokasi_armada for select to authenticated using (public.is_kabid_or_admin());
create policy lokasi_insert_sopir on public.lokasi_armada for insert to authenticated
  with check (exists (
    select 1 from public.perjalanan p
    where p.id = perjalanan_id and p.sopir_id = auth.uid()
      and p.status = 'berjalan' and p.armada_id = lokasi_armada.armada_id
  ));

-- bukti_pengangkutan
create policy bukti_select_own   on public.bukti_pengangkutan for select to authenticated using (sopir_id = auth.uid());
create policy bukti_select_staff on public.bukti_pengangkutan for select to authenticated using (public.is_kabid_or_admin());
create policy bukti_insert_sopir on public.bukti_pengangkutan for insert to authenticated
  with check (
    sopir_id = auth.uid()
    and exists (select 1 from public.perjalanan p
                where p.id = perjalanan_id and p.sopir_id = auth.uid() and p.status = 'berjalan')
  );

-- aduan (tanpa policy insert: dibuat server dengan service role)
create policy aduan_select_staff on public.aduan for select to authenticated using (public.is_kabid_or_admin());
create policy aduan_update_staff on public.aduan for update to authenticated
  using (public.is_kabid_or_admin()) with check (public.is_kabid_or_admin());

-- respon_aduan
create policy respon_select_staff on public.respon_aduan for select to authenticated using (public.is_kabid_or_admin());
create policy respon_insert_staff on public.respon_aduan for insert to authenticated
  with check (public.is_kabid_or_admin() and petugas_id = auth.uid());

-- audit_log (hanya admin boleh membaca; penulisan lewat service role)
create policy audit_select_admin on public.audit_log for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- 7. REALTIME (pemantauan armada di dashboard Kabid)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.lokasi_armada;
alter publication supabase_realtime add table public.perjalanan;

-- ---------------------------------------------------------------------
-- 8. STORAGE
-- Konvensi path:
--   aduan-foto          : aduan/{aduan_id}/{uuid}.{jpg|png|webp}          (diunggah server/service role)
--   bukti-pengangkutan  : {sopir_id}/{perjalanan_id}/{uuid}.{jpg|png|webp} (diunggah sopir)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('aduan-foto',         'aduan-foto',         false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('bukti-pengangkutan', 'bukti-pengangkutan', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "bukti_sopir_upload" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'bukti-pengangkutan'
    and public.has_role(array['sopir']::public.user_role[])
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "bukti_read" on storage.objects for select to authenticated
  using (
    bucket_id = 'bukti-pengangkutan'
    and (public.is_kabid_or_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "aduan_foto_staff_read" on storage.objects for select to authenticated
  using (bucket_id = 'aduan-foto' and public.is_kabid_or_admin());

-- ---------------------------------------------------------------------
-- 9. DATA CONTOH (opsional — hapus bila tidak perlu)
-- ---------------------------------------------------------------------
-- insert into public.armada (plat_nomor, jenis, kapasitas_m3, wilayah) values
--   ('E 1234 AB', 'Dump Truck', 8.0, 'Kuningan Kota'),
--   ('E 5678 CD', 'Armroll',    6.0, 'Cilimus'),
--   ('E 9012 EF', 'Pickup',     2.0, 'Ciawigebang');
