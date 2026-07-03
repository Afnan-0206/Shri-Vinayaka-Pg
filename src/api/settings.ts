import { supabase } from '@/lib/supabase'
import type { SiteSetting } from '@/types'
import { isDemoMode, mockDb } from '@/utils/mockDb'

export const settingsApi = {
  async getPublic(): Promise<Record<string, string>> {
    if (isDemoMode()) {
      const map: Record<string, string> = {}
      ;(mockDb.settings.getAll() as SiteSetting[]).forEach(s => {
        map[s.key] = s.value ?? ''
      })
      return map
    }
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .select('key, value')
      .eq('is_public', true)
    if (error) throw error
    const map: Record<string, string> = {}
    ;(data ?? []).forEach((s: { key: string; value: string | null }) => {
      map[s.key] = s.value ?? ''
    })
    return map
  },

  async getAll(): Promise<SiteSetting[]> {
    if (isDemoMode()) return mockDb.settings.getAll() as SiteSetting[]
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .select('*')
      .order('key')
    if (error) throw error
    return (data ?? []) as unknown as SiteSetting[]
  },

  async update(key: string, value: string): Promise<void> {
    if (isDemoMode()) {
      mockDb.settings.bulkUpdate({ [key]: value })
      return
    }
    const { error } = await (supabase as any)
      .from('site_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
    if (error) throw error
  },

  async upsert(key: string, value: string, is_public = false): Promise<void> {
    if (isDemoMode()) {
      mockDb.settings.bulkUpdate({ [key]: value })
      return
    }
    const { error } = await (supabase as any)
      .from('site_settings')
      .upsert({ key, value, is_public, updated_at: new Date().toISOString() })
    if (error) throw error
  },

  async bulkUpdate(settings: Record<string, string>): Promise<void> {
    if (isDemoMode()) {
      mockDb.settings.bulkUpdate(settings)
      return
    }
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))
    const { error } = await (supabase as any).from('site_settings').upsert(updates)
    if (error) throw error
  },
}
