import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'
import { isDemoMode } from '@/utils/mockDb'

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', message: 'New enquiry received from Rahul Sharma (9876543210)', type: 'enquiry', reference_id: 'e1', reference_table: 'enquiries', is_read: false, created_at: new Date().toISOString() },
  { id: 'n2', message: 'New resident Sneha Reddy added. Rent record created.', type: 'resident', reference_id: 'res1', reference_table: 'residents', is_read: true, created_at: new Date().toISOString() },
]

export const notificationsApi = {
  async getAll(limit = 50): Promise<Notification[]> {
    if (isDemoMode()) return MOCK_NOTIFICATIONS.slice(0, limit)
    const { data, error } = await (supabase as any)
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as unknown as Notification[]
  },

  async getUnreadCount(): Promise<number> {
    if (isDemoMode()) return MOCK_NOTIFICATIONS.filter(n => !n.is_read).length
    const { count, error } = await (supabase as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
    if (error) return 0
    return count ?? 0
  },

  async markRead(id: string): Promise<void> {
    if (isDemoMode()) {
      const idx = MOCK_NOTIFICATIONS.findIndex(n => n.id === id)
      if (idx > -1) MOCK_NOTIFICATIONS[idx].is_read = true
      return
    }
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    if (error) throw error
  },

  async markAllRead(): Promise<void> {
    if (isDemoMode()) {
      MOCK_NOTIFICATIONS.forEach(n => n.is_read = true)
      return
    }
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) return
    const { error } = await (supabase as any).from('notifications').delete().eq('id', id)
    if (error) throw error
  },
}
