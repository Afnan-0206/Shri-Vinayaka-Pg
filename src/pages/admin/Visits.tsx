import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, CalendarCheck, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { visitsApi } from '@/api/visits'
import type { Visit, VisitStatus } from '@/types'
import { VISIT_STATUS_CONFIG, ROOM_TYPES } from '@/constants'
import { formatDate } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select, TextArea } from '@/components/ui/Input'
import { EmptyState, ErrorState, SkeletonTable } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'

const EMPTY_FORM = { enquiry_name: '', phone: '', room_type: '', visit_date: '', visit_time: '', notes: '' }

export default function AdminVisits() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Visit | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteVisit, setDeleteVisit] = useState<Visit | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setVisits(await visitsApi.getAll())
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = visits.filter(v => !filterStatus || v.status === filterStatus)

  const handleSave = async () => {
    if (!form.enquiry_name || !form.phone || !form.visit_date) {
      toast.error('Name, phone, and visit date are required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await visitsApi.update(editing.id, form)
        toast.success('Visit updated')
      } else {
        await visitsApi.create(form)
        toast.success('Visit scheduled')
      }
      setModalOpen(false)
      await load()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleStatus = async (id: string, status: VisitStatus) => {
    try {
      await visitsApi.updateStatus(id, status)
      toast.success(`Visit marked as ${status}`)
      await load()
    } catch (e) { toast.error((e as Error).message) }
  }

  const handleDelete = async () => {
    if (!deleteVisit) return
    setDeleting(true)
    try {
      await visitsApi.delete(deleteVisit.id)
      toast.success('Visit deleted')
      setDeleteVisit(null)
      await load()
    } catch (e) { toast.error((e as Error).message) }
    finally { setDeleting(false) }
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (v: Visit) => {
    setEditing(v)
    setForm({ enquiry_name: v.enquiry_name, phone: v.phone, room_type: v.room_type ?? '', visit_date: v.visit_date, visit_time: v.visit_time ?? '', notes: v.notes ?? '' })
    setModalOpen(true)
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Visits</h1>
          <p className="text-sm text-gray-500">{visits.length} total visit records</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Schedule Visit</Button>
      </div>

      <div className="flex gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
          : error ? <ErrorState message={error} onRetry={load} />
          : filtered.length === 0 ? (
            <EmptyState icon={<CalendarCheck className="w-8 h-8" />} title="No visits" description="Schedule visits from the Enquiries page" action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Schedule Visit</Button>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Visitor', 'Phone', 'Room Type', 'Visit Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(v => (
                    <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">{v.enquiry_name}</p>
                        {v.notes && <p className="text-xs text-gray-400 mt-0.5">{v.notes}</p>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{v.phone}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 capitalize">{v.room_type ?? '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{formatDate(v.visit_date)} {v.visit_time ? `at ${v.visit_time}` : ''}</td>
                      <td className="px-5 py-4">
                        <Badge label={VISIT_STATUS_CONFIG[v.status].label} color={VISIT_STATUS_CONFIG[v.status].color as Parameters<typeof Badge>[0]['color']} dot />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {v.status === 'scheduled' && (
                            <>
                              <button onClick={() => handleStatus(v.id, 'completed')} title="Mark Complete" className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleStatus(v.id, 'cancelled')} title="Cancel" className="p-1.5 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => openEdit(v)} className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors text-xs font-medium">Edit</button>
                          <button onClick={() => setDeleteVisit(v)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Visit' : 'Schedule Visit'} size="md"
        footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button><Button loading={saving} onClick={handleSave}>{editing ? 'Update' : 'Schedule'}</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Visitor Name" value={form.enquiry_name} onChange={e => setForm(p => ({ ...p, enquiry_name: e.target.value }))} required />
            <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
          </div>
          <Select label="Room Type Interest" value={form.room_type} onChange={e => setForm(p => ({ ...p, room_type: e.target.value }))} options={ROOM_TYPES} placeholder="Any room" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Visit Date" type="date" value={form.visit_date} onChange={e => setForm(p => ({ ...p, visit_date: e.target.value }))} required min={new Date().toISOString().split('T')[0]} />
            <Input label="Visit Time" type="time" value={form.visit_time} onChange={e => setForm(p => ({ ...p, visit_time: e.target.value }))} />
          </div>
          <TextArea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Any special requirements..." />
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteVisit} onClose={() => setDeleteVisit(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Visit" message={`Delete visit for ${deleteVisit?.enquiry_name}?`} confirmLabel="Delete" danger />
    </div>
  )
}
