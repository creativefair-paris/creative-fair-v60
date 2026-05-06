/**
 * Stub des types Supabase. Sera remplacé par les types générés
 * automatiquement après application des migrations :
 *
 *   npx supabase gen types typescript \
 *     --project-id ugfnokdxdqaqapylafeq > types/database.ts
 *
 * En attendant ce stub permet aux helpers Supabase de typecheck.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    >
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
