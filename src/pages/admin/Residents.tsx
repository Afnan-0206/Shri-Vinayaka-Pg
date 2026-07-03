import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react'
import { residentsApi } from '@/api/residents'
import { roomsApi } from '@/api/rooms'
import type { Resident, ResidentFormData, ResidentStatus, Room } from '@/types'
import { RESIDENT_STATUS_CONFIG } from '@/constants'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select, TextArea } from '@/components/ui/Input'
import { EmptyState, ErrorState, SkeletonTable } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'

const EMPTY_FORM: ResidentFormData = {
  full_name: '', phone: '', email: '', occupation: '',
  room_id: '', joining_date: new Date().toISOString().split('T')[0],
  monthly_rent: 0, deposit_paid: 0, emergency_contact: '',
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'notice_period', label: 'Notice Period' },
  { value: 'left', label: 'Left' },
]

export default function AdminResidents() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Resident | null>(null)
  const [form, setForm] = useState<ResidentFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteResident, setDeleteResident] = useState<Resident | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [r, allRooms] = await Promise.all([residentsApi.getAll(), roomsApi.getAll()])
      setResidents(r)
      setRooms(allRooms)
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = residents.filter(r => {
    const s = search.toLowerCase()
    const matchSearch = !search || r.full_name.toLowerCase().includes(s) || r.phone.includes(s)
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (r: Resident) => {
    setEditing(r)
    setForm({
      full_name: r.full_name, phone: r.phone, email: r.email ?? '',
      occupation: r.occupation ?? '', room_id: r.room_id ?? '',
      joining_date: r.joining_date, monthly_rent: r.monthly_rent,
      deposit_paid: r.deposit_paid, emergency_contact: r.emergency_contact ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.full_name || !form.phone) { toast.error('Name and phone are required'); return }
    setSaving(true)
    try {
      if (editing) {
        await residentsApi.update(editing.id, form)
        toast.success('Resident updated')
      } else {
        await residentsApi.create(form)
        toast.success('Resident added. Rent record created automatically.')
      }
      setModalOpen(false)
      await load()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteResident) return
    setDeleting(true)
    try {
      await residentsApi.delete(deleteResident.id)
      toast.success('Resident deleted')
      setDeleteResident(null)
      await load()
    } catch (e) { toast.error((e as Error).message) }
    finally { setDeleting(false) }
  }

  const handleStatusChange = async (id: string, status: ResidentStatus) => {
    try {
      await residentsApi.updateStatus(id, status)
      toast.success('Status updated')
      await load()
    } catch (e) { toast.error((e as Error).message) }
  }

  const availableRooms = rooms.filter(r => r.status === 'available' || r.id === (editing?.room_id ?? ''))

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Residents</h1>
          <p className="text-sm text-gray-500">{residents.filter(r => r.status === 'active').length} active residents</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Resident</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
          : error ? <ErrorState message={error} onRetry={load} />
          : filtered.length === 0 ? (
            <EmptyState icon={<Users className="w-8 h-8" />} title="No residents found"
              description="Add residents after they confirm their stay"
              action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Resident</Button>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Resident', 'Contact', 'Room', 'Joining Date', 'Rent', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(r => (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {r.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{r.full_name}</p>
                            <p className="text-xs text-gray-400">{r.occupation ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><p className="text-sm text-gray-700">{r.phone}</p><p className="text-xs text-gray-400">{r.email ?? ''}</p></td>
                      <td className="px-5 py-4 text-sm text-gray-700">{r.room ? `Room ${r.room.room_number}` : '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{formatDate(r.joining_date)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(r.monthly_rent)}</td>
                      <td className="px-5 py-4">
                        <select
                          value={r.status}
                          onChange={e => handleStatusChange(r.id, e.target.value as ResidentStatus)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                        >
                          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(r)} className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteResident(r)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Resident' : 'Add Resident'} size="lg"
        footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button><Button loading={saving} onClick={handleSave}>{editing ? 'Update' : 'Add Resident'}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required />
          <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Occupation" value={form.occupation} onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))} />
          <Select
            label="Assign Room"
            value={form.room_id}
            onChange={e => setForm(p => ({ ...p, room_id: e.target.value }))}
            placeholder="No room assigned"
            options={availableRooms.map(r => ({ value: r.id, label: `Room ${r.room_number} (${r.sharing_type}) — ${formatCurrency(r.rent)}/mo` }))}
          />
          <Input label="Joining Date" type="date" value={form.joining_date} onChange={e => setForm(p => ({ ...p, joining_date: e.target.value }))} required />
          <Input label="Monthly Rent (₹)" type="number" value={form.monthly_rent} onChange={e => setForm(p => ({ ...p, monthly_rent: Number(e.target.value) }))} required />
          <Input label="Deposit Paid (₹)" type="number" value={form.deposit_paid} onChange={e => setForm(p => ({ ...p, deposit_paid: Number(e.target.value) }))} />
          <div className="col-span-2">
            <Input label="Emergency Contact" value={form.emergency_contact} onChange={e => setForm(p => ({ ...p, emergency_contact: e.target.value }))} placeholder="Name & Phone" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteResident} onClose={() => setDeleteResident(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Resident" message={`Delete ${deleteResident?.full_name}? All rent records will also be deleted.`} confirmLabel="Delete" danger />
    </div>
  )
}
