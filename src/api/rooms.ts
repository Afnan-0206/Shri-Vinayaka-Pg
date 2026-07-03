import { supabase } from '@/lib/supabase'
import type { Room, RoomFormData } from '@/types'
import { isDemoMode, mockDb } from '@/utils/mockDb'

export const roomsApi = {
  async getAll(): Promise<Room[]> {
    if (isDemoMode()) return mockDb.rooms.getAll()
    const { data, error } = await (supabase as any)
      .from('rooms')
      .select('*')
      .order('room_number')
    if (error) throw error
    return (data ?? []) as unknown as Room[]
  },

  async getActive(): Promise<Room[]> {
    if (isDemoMode()) return mockDb.rooms.getAll().filter(r => r.is_active)
    const { data, error } = await (supabase as any)
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('room_type')
    if (error) throw error
    return (data ?? []) as unknown as Room[]
  },

  async create(data: RoomFormData): Promise<Room> {
    if (isDemoMode()) return mockDb.rooms.create(data)
    const { data: room, error } = await (supabase as any)
      .from('rooms')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return room as unknown as Room
  },

  async update(id: string, data: Partial<RoomFormData>): Promise<Room> {
    if (isDemoMode()) return mockDb.rooms.update(id, data)
    const { data: room, error } = await (supabase as any)
      .from('rooms')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return room as unknown as Room
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) return mockDb.rooms.delete(id)
    const { error } = await (supabase as any).from('rooms').delete().eq('id', id)
    if (error) throw error
  },

  async updateStatus(id: string, status: string): Promise<void> {
    if (isDemoMode()) {
      mockDb.rooms.update(id, { status } as any)
      return
    }
    const { error } = await (supabase as any)
      .from('rooms')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  },
}
