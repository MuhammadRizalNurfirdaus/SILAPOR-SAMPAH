-- 0004_retensi_uupdp_aduan.sql
-- Kebijakan Retensi Data Pribadi Pelapor (UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi / PDP)
-- Aduan masyarakat berstatus 'selesai' yang berusia lebih dari 2 tahun dilakukan pembersihan
-- data pribadi (PII): nama_pelapor, no_telepon, dan ip_hash di-anonimkan otomatis.

alter table public.aduan drop constraint if exists aduan_no_telepon_check;
alter table public.aduan add constraint aduan_no_telepon_check
  check (no_telepon ~ '^(\+62|62|0)8[1-9][0-9]{6,11}$' or no_telepon = '080000000000');

create or replace function public.anonimkan_aduan_kadaluwarsa(p_tahun int default 2)
returns table (jumlah_dianonimkan int)
language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  update public.aduan
     set nama_pelapor = 'Masyarakat (Anonim UU PDP)',
         no_telepon = '080000000000',
         ip_hash = null
   where status = 'selesai'
     and updated_at < (now() - (p_tahun || ' years')::interval)
     and (nama_pelapor != 'Masyarakat (Anonim UU PDP)' or no_telepon != '080000000000' or ip_hash is not null);
  
  get diagnostics v_count = row_count;

  if v_count > 0 then
    insert into public.audit_log (aksi, entitas, detail)
    values (
      'aduan.retensi_uupdp',
      'aduan',
      jsonb_build_object(
        'jumlah_baris', v_count,
        'retensi_tahun', p_tahun,
        'keterangan', 'Pembersihan otomatis data pribadi pelapor aduan selesai > ' || p_tahun || ' tahun (Kepatuhan UU No. 27/2022 tentang PDP)'
      )
    );
  end if;

  return query select v_count;
end;
$$;

revoke execute on function public.anonimkan_aduan_kadaluwarsa(int) from public, anon;
grant execute on function public.anonimkan_aduan_kadaluwarsa(int) to service_role, authenticated;
