// Daftar kecamatan di Kabupaten Kuningan.
// Dipakai untuk menjaga konsistensi penulisan pada modul TPS (admin + form warga).
// Bila ada perbedaan nama resmi, sesuaikan daftar ini.
export const KECAMATAN_KUNINGAN: string[] = [
  'Ciawigebang',
  'Cibeureum',
  'Cibingbin',
  'Cidahu',
  'Cigandamekar',
  'Cigugur',
  'Cilebak',
  'Cilimus',
  'Cimahi',
  'Ciniru',
  'Cipicung',
  'Ciwaru',
  'Darma',
  'Garawangi',
  'Hantara',
  'Jalaksana',
  'Japara',
  'Kadugede',
  'Kalimanggis',
  'Karangkancana',
  'Kramatmulya',
  'Kuningan',
  'Lebakwangi',
  'Luragung',
  'Maleber',
  'Mandirancan',
  'Nusaherang',
  'Pancalang',
  'Pasawahan',
  'Sindangagung',
  'Sindangjawa',
  'Subang',
];

export const KECAMATAN_OPTIONS = [...KECAMATAN_KUNINGAN].sort((a, b) =>
  a.localeCompare(b, 'id')
);
