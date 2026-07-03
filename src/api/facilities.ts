import { supabase } from '@/lib/supabase'
import type { Facility } from '@/types'
import { isDemoMode, mockDb } from '@/utils/mockDb'

export const facilitiesApi = {
  async getAll(): Promise<Facility[]> {
    if (isDemoMode()) return mockDb.facilities.getAll() as Facility[]
    const { data, error } = await (supabase as any)
      .from('facilities')
      .select('*')
      .order('sort_order')
    if (error) throw error
    return (data ?? []) as unknown as Facility[]
  },

  async getActive(): Promise<Facility[]> {
    if (isDemoMode()) return (mockDb.facilities.getAll() as Facility[]).filter(f => f.is_active)
    const { data, error } = await (supabase as any)
      .from('facilities')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw error
    return (data ?? []) as unknown as Facility[]
  },

  async create(data: Omit<Facility, 'id' | 'created_at'>): Promise<Facility> {
    if (isDemoMode()) return mockDb.facilities.create(data) as Facility
    const { data: facility, error } = await (supabase as any)
      .from('facilities')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return facility as unknown as Facility
  },

  async update(id: string, data: Partial<Facility>): Promise<void> {
    if (isDemoMode()) {
      mockDb.facilities.update(id, data)
      return
    }
    const { error } = await (supabase as any).from('facilities').update(data).eq('id', id)
    if (error) throw error
  },

  async toggle(id: string, is_active: boolean): Promise<void> {
    if (isDemoMode()) {
      mockDb.facilities.update(id, { is_active })
      return
    }
    const { error } = await (supabase as any).from('facilities').update({ is_active }).eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) return mockDb.facilities.delete(id)
    const { error } = await (supabase as any).from('facilities').delete().eq('id', id)
    if (error) throw error
  },
}
