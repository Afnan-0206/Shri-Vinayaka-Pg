import { supabase } from '@/lib/supabase'
import type { Resident, ResidentFormData } from '@/types'
import { isDemoMode, mockDb } from '@/utils/mockDb'

export const residentsApi = {
  async getAll(): Promise<Resident[]> {
    if (isDemoMode()) return mockDb.residents.getAll() as Resident[]
    const { data, error } = await (supabase as any)
      .from('residents')
      .select('*, room:rooms(id,room_number,room_type)')
      .order('full_name')
    if (error) throw error
    return (data ?? []) as unknown as Resident[]
  },

  async getActive(): Promise<Resident[]> {
    if (isDemoMode()) return mockDb.residents.getAll().filter(r => ['active', 'notice_period'].includes(r.status)) as Resident[]
    const { data, error } = await (supabase as any)
      .from('residents')
      .select('*, room:rooms(id,room_number,room_type)')
      .in('status', ['active', 'notice_period'])
      .order('full_name')
    if (error) throw error
    return (data ?? []) as unknown as Resident[]
  },

  async getById(id: string): Promise<Resident | null> {
    if (isDemoMode()) return (mockDb.residents.getAll().find(r => r.id === id) as Resident) || null
    const { data, error } = await (supabase as any)
      .from('residents')
      .select('*, room:rooms(id,room_number,room_type)')
      .eq('id', id)
      .single()
    if (error) return null
    return data as unknown as Resident
  },

  async create(formData: ResidentFormData): Promise<Resident> {
    if (isDemoMode()) return mockDb.residents.create(formData) as Resident
    const { data, error } = await (supabase as any)
      .from('residents')
      .insert(formData)
      .select()
      .single()
    if (error) throw error
    return data as unknown as Resident
  },

  async update(id: string, formData: Partial<ResidentFormData>): Promise<Resident> {
    if (isDemoMode()) return mockDb.residents.update(id, formData) as Resident
    const { data, error } = await (supabase as any)
      .from('residents')
      .update(formData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as unknown as Resident
  },

  async updateStatus(id: string, status: string, notice_date?: string): Promise<void> {
    if (isDemoMode()) {
      mockDb.residents.updateStatus(id, status)
      return
    }
    const { error } = await (supabase as any)
      .from('residents')
      .update({ status, ...(notice_date ? { notice_date } : {}) })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) return mockDb.residents.delete(id)
    const { error } = await (supabase as any).from('residents').delete().eq('id', id)
    if (error) throw error
  },
}
