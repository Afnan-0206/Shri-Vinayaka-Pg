import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Sparkles, Eye, EyeOff } from 'lucide-react'
import { facilitiesApi } from '@/api/facilities'
import type { Facility } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, TextArea } from '@/components/ui/Input'
import { EmptyState, ErrorState, SkeletonCard } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', description: '', icon: '', is_active: true, sort_order: 0 }

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Facility | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteFacility, setDeleteFacility] = useState<Facility | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setFacilities(await facilitiesApi.getAll()) }
    catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (f: Facility) => {
    setEditing(f)
    setForm({ name: f.name, description: f.description ?? '', icon: f.icon ?? '', is_active: f.is_active, sort_order: f.sort_order })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      if (editing) {
        await facilitiesApi.update(editing.id, form)
        toast.success('Facility updated')
      } else {
        await facilitiesApi.create(form)
        toast.success('Facility added')
      }
      setModalOpen(false)
      await load()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleToggle = async (f: Facility) => {
    try {
      await facilitiesApi.toggle(f.id, !f.is_active)
      toast.success(f.is_active ? 'Hidden from website' : 'Visible on website')
      await load()
    } catch (e) { toast.error((e as Error).message) }
  }

  const handleDelete = async () => {
    if (!deleteFacility) return
    setDeleting(true)
    try {
      await facilitiesApi.delete(deleteFacility.id)
      toast.success('Facility deleted')
      setDeleteFacility(null)
      await load()
    } catch (e) { toast.error((e as Error).message) }
    finally { setDeleting(false) }
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Facilities</h1>
          <p className="text-sm text-gray-500">{facilities.filter(f => f.is_active).length} visible on website</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Facility</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? <ErrorState message={error} onRetry={load} />
      : facilities.length === 0 ? (
        <EmptyState icon={<Sparkles className="w-8 h-8" />} title="No facilities" description="Add facilities to display on the public website"
          action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Facility</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map(f => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl border p-5 shadow-sm ${!f.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{f.name}</p>
                    {!f.is_active && <span className="text-xs text-gray-400">Hidden</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleToggle(f)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    {f.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteFacility(f)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {f.description && <p className="text-xs text-gray-500">{f.description}</p>}
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Facility' : 'Add Facility'} size="sm"
        footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button><Button loading={saving} onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button></>}>
        <div className="space-y-4">
          <Input label="Facility Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Hot Water" />
          <TextArea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Brief description..." />
          <Input label="Icon Name (Lucide)" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="e.g. Droplets" />
          <Input label="Sort Order" type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
            <span className="text-sm text-gray-700">Visible on public website</span>
          </label>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteFacility} onClose={() => setDeleteFacility(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Facility" message={`Delete "${deleteFacility?.name}"?`} confirmLabel="Delete" danger />
    </div>
  )
}
