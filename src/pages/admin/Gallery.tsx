import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import { galleryApi } from '@/api/gallery'
import type { GalleryImage } from '@/types'
import { GALLERY_CATEGORIES } from '@/constants'
import { formatDate } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState('')

  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState({ title: '', image_url: '', category: 'rooms' })
  const [saving, setSaving] = useState(false)
  const [deleteImage, setDeleteImage] = useState<GalleryImage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setImages(await galleryApi.getAll()) }
    catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = images.filter(img => !filterCategory || img.category === filterCategory)

  const handleAdd = async () => {
    if (!form.image_url) { toast.error('Image URL is required'); return }
    setSaving(true)
    try {
      await galleryApi.create({ title: form.title, image_url: form.image_url, category: form.category })
      toast.success('Image added')
      setAddModal(false)
      setForm({ title: '', image_url: '', category: 'rooms' })
      await load()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleToggle = async (img: GalleryImage) => {
    try {
      await galleryApi.toggle(img.id, !img.is_active)
      toast.success(img.is_active ? 'Hidden from website' : 'Visible on website')
      await load()
    } catch (e) { toast.error((e as Error).message) }
  }

  const handleDelete = async () => {
    if (!deleteImage) return
    setDeleting(true)
    try {
      await galleryApi.delete(deleteImage.id)
      toast.success('Image deleted')
      setDeleteImage(null)
      await load()
    } catch (e) { toast.error((e as Error).message) }
    finally { setDeleting(false) }
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500">{images.filter(i => i.is_active).length} visible images</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddModal(true)}>Add Image</Button>
      </div>

      <div className="flex gap-3">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Categories</option>
          {GALLERY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : error ? <ErrorState message={error} onRetry={load} />
      : filtered.length === 0 ? (
        <EmptyState icon={<ImageIcon className="w-8 h-8" />} title="No images" description="Add images to show in the public gallery"
          action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setAddModal(true)}>Add Image</Button>} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(img => (
            <motion.div key={img.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`bg-white rounded-xl border overflow-hidden shadow-sm group relative ${!img.is_active ? 'opacity-60' : ''}`}>
              <div className="aspect-video overflow-hidden bg-gray-100">
                <img src={img.image_url} alt={img.title ?? 'Gallery image'} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{img.title || 'Untitled'}</p>
                <p className="text-xs text-gray-400 capitalize">{img.category} · {formatDate(img.created_at)}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleToggle(img)}
                  className="p-1.5 rounded-lg bg-white shadow-md text-gray-600 hover:text-indigo-600 transition-colors">
                  {img.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setDeleteImage(img)}
                  className="p-1.5 rounded-lg bg-white shadow-md text-gray-600 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {!img.is_active && (
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full">Hidden</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Gallery Image" size="sm"
        footer={<><Button variant="outline" onClick={() => setAddModal(false)}>Cancel</Button><Button loading={saving} onClick={handleAdd}>Add Image</Button></>}>
        <div className="space-y-4">
          <Input label="Image URL" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} required placeholder="https://images.unsplash.com/..." />
          {form.image_url && (
            <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={() => {}} />
            </div>
          )}
          <Input label="Title (optional)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Common Living Area" />
          <Select label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} options={GALLERY_CATEGORIES} required />
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteImage} onClose={() => setDeleteImage(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Image" message="Delete this image from the gallery? This cannot be undone." confirmLabel="Delete" danger />
    </div>
  )
}
