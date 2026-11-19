export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      aduan: {
        Row: {
          created_at: string
          deskripsi_lokasi: string
          ditangani_oleh: string | null
          foto_path: string
          id: string
          ip_hash: string | null
          kode_tiket: string
          lat: number | null
          lng: number | null
          nama_pelapor: string
          no_telepon: string
          status: Database["public"]["Enums"]["aduan_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deskripsi_lokasi: string
          ditangani_oleh?: string | null
          foto_path: string
          id?: string
          ip_hash?: string | null
          kode_tiket?: string
          lat?: number | null
          lng?: number | null
          nama_pelapor: string
          no_telepon: string
          status?: Database["public"]["Enums"]["aduan_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deskripsi_lokasi?: string
          ditangani_oleh?: string | null
          foto_path?: string
          id?: string
          ip_hash?: string | null
          kode_tiket?: string
          lat?: number | null
          lng?: number | null
          nama_pelapor?: string
          no_telepon?: string
          status?: Database["public"]["Enums"]["aduan_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aduan_ditangani_oleh_fkey"
            columns: ["ditangani_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      armada: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          jenis: string
          kapasitas_m3: number | null
          plat_nomor: string
          status: Database["public"]["Enums"]["armada_status"]
          updated_at: string
          wilayah: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          jenis: string
          kapasitas_m3?: number | null
          plat_nomor: string
          status?: Database["public"]["Enums"]["armada_status"]
          updated_at?: string
          wilayah?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          jenis?: string
          kapasitas_m3?: number | null
          plat_nomor?: string
          status?: Database["public"]["Enums"]["armada_status"]
          updated_at?: string
          wilayah?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          actor_id: string | null
          aksi: string
          created_at: string
          detail: Json | null
          entitas: string
          entitas_id: string | null
          id: number
        }
        Insert: {
          actor_id?: string | null
          aksi: string
          created_at?: string
          detail?: Json | null
          entitas: string
          entitas_id?: string | null
          id?: never
        }
        Update: {
          actor_id?: string | null
          aksi?: string
          created_at?: string
          detail?: Json | null
          entitas?: string
          entitas_id?: string | null
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bukti_pengangkutan: {
        Row: {
          created_at: string
          foto_path: string
          id: string
          keterangan: string | null
          lat: number | null
          lng: number | null
          perjalanan_id: string
          sopir_id: string
        }
        Insert: {
          created_at?: string
          foto_path: string
          id?: string
          keterangan?: string | null
          lat?: number | null
          lng?: number | null
          perjalanan_id: string
          sopir_id: string
        }
        Update: {
          created_at?: string
          foto_path?: string
          id?: string
          keterangan?: string | null
          lat?: number | null
          lng?: number | null
          perjalanan_id?: string
          sopir_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bukti_pengangkutan_perjalanan_id_fkey"
            columns: ["perjalanan_id"]
            isOneToOne: false
            referencedRelation: "perjalanan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bukti_pengangkutan_sopir_id_fkey"
            columns: ["sopir_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lokasi_armada: {
        Row: {
          armada_id: string
          direkam_at: string
          id: number
          lat: number
          lng: number
          perjalanan_id: string
        }
        Insert: {
          armada_id: string
          direkam_at?: string
          id?: never
          lat: number
          lng: number
          perjalanan_id: string
        }
        Update: {
          armada_id?: string
          direkam_at?: string
          id?: never
          lat?: number
          lng?: number
          perjalanan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lokasi_armada_armada_id_fkey"
            columns: ["armada_id"]
            isOneToOne: false
            referencedRelation: "armada"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lokasi_armada_perjalanan_id_fkey"
            columns: ["perjalanan_id"]
            isOneToOne: false
            referencedRelation: "perjalanan"
            referencedColumns: ["id"]
          },
        ]
      }
      perjalanan: {
        Row: {
          armada_id: string
          created_at: string
          id: string
          mulai_at: string
          ringkasan: string | null
          selesai_at: string | null
          sopir_id: string
          status: Database["public"]["Enums"]["perjalanan_status"]
        }
        Insert: {
          armada_id: string
          created_at?: string
          id?: string
          mulai_at?: string
          ringkasan?: string | null
          selesai_at?: string | null
          sopir_id: string
          status?: Database["public"]["Enums"]["perjalanan_status"]
        }
        Update: {
          armada_id?: string
          created_at?: string
          id?: string
          mulai_at?: string
          ringkasan?: string | null
          selesai_at?: string | null
          sopir_id?: string
          status?: Database["public"]["Enums"]["perjalanan_status"]
        }
        Relationships: [
          {
            foreignKeyName: "perjalanan_armada_id_fkey"
            columns: ["armada_id"]
            isOneToOne: false
            referencedRelation: "armada"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perjalanan_sopir_id_fkey"
            columns: ["sopir_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          nama_lengkap: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean
          nama_lengkap: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          nama_lengkap?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      respon_aduan: {
        Row: {
          aduan_id: string
          catatan: string
          created_at: string
          id: string
          petugas_id: string
          status_baru: Database["public"]["Enums"]["aduan_status"]
          tampil_ke_publik: boolean
        }
        Insert: {
          aduan_id: string
          catatan: string
          created_at?: string
          id?: string
          petugas_id: string
          status_baru: Database["public"]["Enums"]["aduan_status"]
          tampil_ke_publik?: boolean
        }
        Update: {
          aduan_id?: string
          catatan?: string
          created_at?: string
          id?: string
          petugas_id?: string
          status_baru?: Database["public"]["Enums"]["aduan_status"]
          tampil_ke_publik?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "respon_aduan_aduan_id_fkey"
            columns: ["aduan_id"]
            isOneToOne: false
            referencedRelation: "aduan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respon_aduan_petugas_id_fkey"
            columns: ["petugas_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      akhiri_perjalanan: {
        Args: { p_perjalanan_id: string; p_ringkasan?: string }
        Returns: undefined
      }
      cek_status_aduan: {
        Args: { p_kode: string }
        Returns: {
          created_at: string
          kode_tiket: string
          respon: Json
          status: Database["public"]["Enums"]["aduan_status"]
          updated_at: string
        }[]
      }
      generate_kode_tiket: { Args: never; Returns: string }
      has_role: {
        Args: { allowed: Database["public"]["Enums"]["user_role"][] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_kabid_or_admin: { Args: never; Returns: boolean }
      mulai_perjalanan: { Args: { p_armada_id: string }; Returns: string }
      posisi_armada_terbaru: {
        Args: never
        Returns: {
          armada_id: string
          direkam_at: string
          jenis: string
          lat: number
          lng: number
          plat_nomor: string
        }[]
      }
    }
    Enums: {
      aduan_status: "baru" | "diproses" | "selesai" | "ditolak"
      armada_status: "garasi" | "beroperasi" | "perawatan"
      perjalanan_status: "berjalan" | "selesai" | "dibatalkan"
      user_role: "sopir" | "kabid" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      aduan_status: ["baru", "diproses", "selesai", "ditolak"],
      armada_status: ["garasi", "beroperasi", "perawatan"],
      perjalanan_status: ["berjalan", "selesai", "dibatalkan"],
      user_role: ["sopir", "kabid", "admin"],
    },
  },
} as const
