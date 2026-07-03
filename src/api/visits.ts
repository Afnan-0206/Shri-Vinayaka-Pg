import { supabase } from '@/lib/supabase'
import type { Visit, VisitFormData, VisitStatus } from '@/types'
import { isDemoMode, mockDb } from '@/utils/mockDb'

export const visitsApi = {
  async getAll(): Promise<Visit[]> {
    if (isDemoMode()) return mockDb.visits.getAll() as Visit[]
    const { data, error } = await (supabase as any)
      .from('visits')
      .select('*')
      .order('visit_date', { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as Visit[]
  },

  async getUpcoming(limit = 5): Promise<Visit[]> {
    if (isDemoMode()) return (mockDb.visits.getAll() as Visit[]).filter(v => v.status === 'scheduled').slice(0, limit)
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await (supabase as any)
      .from('visits')
      .select('*')
      .eq('status', 'scheduled')
      .gte('visit_date', today)
      .order('visit_date')
      .limit(limit)
    if (error) throw error
    return (data ?? []) as unknown as Visit[]
  },

  async create(data: VisitFormData): Promise<Visit> {
    if (isDemoMode()) return mockDb.visits.create(data) as Visit
    const { data: visit, error } = await (supabase as any)
      .from('visits')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return visit as unknown as Visit
  },

  async updateStatus(id: string, status: VisitStatus): Promise<void> {
    if (isDemoMode()) {
      mockDb.visits.updateStatus(id, status)
      return
    }
    const { error } = await (supabase as any)
      .from('visits')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  },

  async update(id: string, data: Partial<VisitFormData>): Promise<void> {
    if (isDemoMode()) {
      mockDb.visits.update(id, data)
      return
    }
    const { error } = await (supabase as any)
      .from('visits')
      .update(data)
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) return mockDb.visits.delete(id)
    const { error } = await (supabase as any).from('visits').delete().eq('id', id)
    if (error) throw error
  },
}
