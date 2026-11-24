-- Seed database lokal SILAPOR SAMPAH.
-- Akun staf (admin/kabid/sopir) dibuat lewat Supabase Auth, bukan SQL:
--   node frontend/scripts/seed-and-test-auth.mjs
-- Data armada contoh dapat ditambahkan manual dari panel /admin/armada.

-- Contoh TPS lokal (untuk uji). Data resmi DLH diisi lewat /admin/tps.
insert into public.tps (nama, kecamatan, alamat, is_active) values
  ('TPS Kuningan Kota', 'Kuningan', 'Jl. Siliwangi, Kuningan Kota', true),
  ('TPS Cilimus', 'Cilimus', 'Dekat pasar Cilimus', true),
  ('TPS Ciawigebang', 'Ciawigebang', 'Samping alun-alun Ciawigebang', true)
on conflict (kecamatan, lower(nama)) do nothing;
