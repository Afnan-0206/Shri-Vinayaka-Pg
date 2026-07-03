// Supabase generated types placeholder
// In production: run `npx supabase gen types typescript --project-id YOUR_PROJECT_ID`
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      facilities: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      gallery: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      enquiries: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      visits: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      residents: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      rent_payments: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      notifications: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      site_settings: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      user_profiles: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      audit_logs: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
