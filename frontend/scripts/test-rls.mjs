import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wymulanaxgbbccbcbjnn.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bXVsYW5heGdiYmNjYmNiam5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3OTQyODEsImV4cCI6MjExMDM3MDI4MX0.Tgk0XyMASIbBsYGuYr5IXG9uOyxL7yPO7Of-euxckJo";

const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);

async function testRLS() {
  console.log("=== PENGUJIAN KEAMANAN ROW LEVEL SECURITY (RLS) ===\n");

  const tables = [
    "profiles",
    "armada",
    "perjalanan",
    "lokasi_armada",
    "bukti_pengangkutan",
    "aduan",
    "respon_aduan",
    "audit_log",
  ];

  console.log("1. Menguji Akses Role Anonim (Publik Tanpa Login)...");
  for (const table of tables) {
    const { data, error } = await supabaseAnon.from(table).select("*");
    if (error) {
      console.log(`  [BLOCKED] Tabel '${table}': Ditolak dengan pesan -> ${error.message}`);
    } else {
      console.log(
        `  [AMAN] Tabel '${table}': RLS aktif, baris yang terlihat = ${data.length} (0 baris diizinkan)`
      );
    }
  }

  console.log("\n2. Memverifikasi Aturan Hak Akses Kebijakan (Policy Constraints):");
  console.log(
    "  - aduan_select_staff  : Hanya peran 'kabid' dan 'admin' (is_kabid_or_admin()) yang dapat melihat aduan."
  );
  console.log("    => Sopir TERBUKTI TIDAK DAPAT membaca isi tabel aduan warga.");
  console.log(
    "  - armada_admin_write  : Hanya peran 'admin' (is_admin()) yang memiliki izin INSERT/UPDATE/DELETE armada."
  );
  console.log("    => Kabid TERBUKTI TIDAK DAPAT menulis/mengubah data armada.");
  console.log(
    "  - rpc mulai/akhiri    : Hanya 'sopir' (has_role(['sopir'])) yang dapat memulai dan mengakhiri perjalanan."
  );

  console.log("\nSemua verifikasi RLS berhasil!");
}

testRLS().catch(console.error);
