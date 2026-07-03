import { supabase } from '@/lib/supabase'
import type { GalleryImage } from '@/types'
import { isDemoMode, mockDb } from '@/utils/mockDb'

export const galleryApi = {
  async getAll(): Promise<GalleryImage[]> {
    if (isDemoMode()) return mockDb.gallery.getAll() as GalleryImage[]
    const { data, error } = await (supabase as any)
      .from('gallery')
      .select('*')
      .order('sort_order')
    if (error) throw error
    return (data ?? []) as unknown as GalleryImage[]
  },

  async getActive(category?: string): Promise<GalleryImage[]> {
    if (isDemoMode()) {
      const all = mockDb.gallery.getAll() as GalleryImage[]
      const active = all.filter(img => img.is_active)
      if (category) return active.filter(img => img.category === category)
      return active
    }
    let query = (supabase as any)
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (category) query = query.eq('category', category)
    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as unknown as GalleryImage[]
  },

  async create(data: { title?: string; image_url: string; category: string }): Promise<GalleryImage> {
    if (isDemoMode()) return mockDb.gallery.create(data) as GalleryImage
    const { data: image, error } = await (supabase as any)
      .from('gallery')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return image as unknown as GalleryImage
  },

  async update(id: string, data: Partial<GalleryImage>): Promise<void> {
    if (isDemoMode()) {
      mockDb.gallery.toggle(id, data.is_active ?? true)
      return
    }
    const { error } = await (supabase as any).from('gallery').update(data).eq('id', id)
    if (error) throw error
  },

  async toggle(id: string, is_active: boolean): Promise<void> {
    if (isDemoMode()) {
      mockDb.gallery.toggle(id, is_active)
      return
    }
    const { error } = await (supabase as any).from('gallery').update({ is_active }).eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) return mockDb.gallery.delete(id)
    const { error } = await (supabase as any).from('gallery').delete().eq('id', id)
    if (error) throw error
  },
}
