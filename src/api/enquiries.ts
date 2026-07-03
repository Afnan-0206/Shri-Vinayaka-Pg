import { supabase } from '@/lib/supabase'
import type { Enquiry, EnquiryFormData, EnquiryStatus } from '@/types'
import { isDemoMode, mockDb } from '@/utils/mockDb'

export const enquiriesApi = {
  async getAll(page = 0, pageSize = 20): Promise<{ data: Enquiry[]; count: number }> {
    if (isDemoMode()) {
      const all = mockDb.enquiries.getAll() as Enquiry[]
      const from = page * pageSize
      const to = from + pageSize
      return { data: all.slice(from, to), count: all.length }
    }
    const from = page * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await (supabase as any)
      .from('enquiries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    return { data: (data ?? []) as unknown as Enquiry[], count: count ?? 0 }
  },

  async getByStatus(status: EnquiryStatus): Promise<Enquiry[]> {
    if (isDemoMode()) return (mockDb.enquiries.getAll() as Enquiry[]).filter(e => e.status === status)
    const { data, error } = await (supabase as any)
      .from('enquiries')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as Enquiry[]
  },

  async getRecent(limit = 5): Promise<Enquiry[]> {
    if (isDemoMode()) return (mockDb.enquiries.getAll() as Enquiry[]).slice(0, limit)
    const { data, error } = await (supabase as any)
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as unknown as Enquiry[]
  },

  async create(data: EnquiryFormData): Promise<Enquiry> {
    if (isDemoMode()) return mockDb.enquiries.create(data) as Enquiry
    const { data: enquiry, error } = await (supabase as any)
      .from('enquiries')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return enquiry as unknown as Enquiry
  },

  async updateStatus(id: string, status: EnquiryStatus, notes?: string): Promise<void> {
    if (isDemoMode()) {
      mockDb.enquiries.updateStatus(id, status, notes || '')
      return
    }
    const { error } = await (supabase as any)
      .from('enquiries')
      .update({ status, ...(notes ? { notes } : {}) })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) return mockDb.enquiries.delete(id)
    const { error } = await (supabase as any).from('enquiries').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string): Promise<Enquiry[]> {
    if (isDemoMode()) {
      const q = query.toLowerCase()
      return (mockDb.enquiries.getAll() as Enquiry[]).filter(e =>
        e.full_name.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        (e.email && e.email.toLowerCase().includes(q))
      )
    }
    const { data, error } = await (supabase as any)
      .from('enquiries')
      .select('*')
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return (data ?? []) as unknown as Enquiry[]
  },
}
