-- Inisialisasi Storage Bucket Bukti Pengangkutan (Bab 2.6 & 3.6 framework.md)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bukti-pengangkutan',
  'bukti-pengangkutan',
  false,
  5242880, -- 5 MB (Bab 4.3.2a)
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
