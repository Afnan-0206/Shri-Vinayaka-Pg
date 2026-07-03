import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, BedDouble, Search } from 'lucide-react'
import { roomsApi } from '@/api/rooms'
import type { Room, RoomFormData, RoomType, RoomStatus } from '@/types'
import { ROOM_STATUS_CONFIG, ROOM_TYPES, ROOM_STATUSES, COMMON_FACILITIES } from '@/constants'
import { formatCurrency } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select, TextArea } from '@/components/ui/Input'
import { EmptyState, ErrorState, SkeletonTable } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'

const EMPTY_FORM: RoomFormData = {
  room_number: '', room_type: 'single', sharing_type: 'Single Sharing',
  rent: 0, deposit: 0, status: 'available', description: '', image_url: '', facilities: [],
}

const SHARING_TYPE_MAP: Record<RoomType, string> = {
  single: 'Single Sharing', double: 'Two Sharing', triple: 'Three Sharing', premium: 'Premium Room',
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Room | null>(null)
  const [form, setForm] = useState<RoomFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRooms(await roomsApi.getAll())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = rooms.filter(r => {
    const matchSearch = !search || r.room_number.toLowerCase().includes(search.toLowerCase()) ||
      r.room_type.includes(search.toLowerCase())
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (room: Room) => {
    setEditing(room)
    setForm({
      room_number: room.room_number, room_type: room.room_type, sharing_type: room.sharing_type,
      rent: room.rent, deposit: room.deposit, status: room.status,
      description: room.description ?? '', image_url: room.image_url ?? '', facilities: room.facilities,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.room_number || !form.rent) {
      toast.error('Room number and rent are required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await roomsApi.update(editing.id, form)
        toast.success('Room updated')
      } else {
        await roomsApi.create(form)
        toast.success('Room added')
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteRoom) return
    setDeleting(true)
    try {
      await roomsApi.delete(deleteRoom.id)
      toast.success('Room deleted')
      setDeleteRoom(null)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const toggleFacility = (f: string) => {
    setForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(f) ? prev.facilities.filter(x => x !== f) : [...prev.facilities, f],
    }))
  }

  const handleRoomTypeChange = (type: RoomType) => {
    setForm(prev => ({ ...prev, room_type: type, sharing_type: SHARING_TYPE_MAP[type] }))
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Rooms</h1>
          <p className="text-sm text-gray-500">{rooms.length} total rooms</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Room</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Status</option>
          {ROOM_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BedDouble className="w-8 h-8" />}
            title="No rooms found"
            description="Add your first room to get started"
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={openAdd} size="sm">Add Room</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rent</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deposit</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(room => (
                  <motion.tr
                    key={room.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {room.image_url ? (
                          <img src={room.image_url} alt={room.room_number} className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <BedDouble className="w-5 h-5 text-indigo-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Room {room.room_number}</p>
                          <p className="text-xs text-gray-400">{room.sharing_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 capitalize">{room.room_type}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(room.rent)}<span className="text-xs font-normal text-gray-400">/mo</span></td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatCurrency(room.deposit)}</td>
                    <td className="px-5 py-4">
                      <Badge
                        label={ROOM_STATUS_CONFIG[room.status].label}
                        color={ROOM_STATUS_CONFIG[room.status].color as Parameters<typeof Badge>[0]['color']}
                        dot
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(room)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteRoom(room)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit Room ${editing.room_number}` : 'Add New Room'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editing ? 'Update Room' : 'Add Room'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Room Number" value={form.room_number} onChange={e => setForm(p => ({ ...p, room_number: e.target.value }))} required placeholder="101" />
          <Select
            label="Room Type"
            value={form.room_type}
            onChange={e => handleRoomTypeChange(e.target.value as RoomType)}
            options={ROOM_TYPES}
            required
          />
          <Input label="Monthly Rent (₹)" type="number" value={form.rent} onChange={e => setForm(p => ({ ...p, rent: Number(e.target.value) }))} required />
          <Input label="Security Deposit (₹)" type="number" value={form.deposit} onChange={e => setForm(p => ({ ...p, deposit: Number(e.target.value) }))} required />
          <Select
            label="Status"
            value={form.status}
            onChange={e => setForm(p => ({ ...p, status: e.target.value as RoomStatus }))}
            options={ROOM_STATUSES}
            required
          />
          <Input label="Image URL" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
          <div className="col-span-2">
            <TextArea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the room..." />
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Facilities</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_FACILITIES.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFacility(f)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    form.facilities.includes(f)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteRoom}
        onClose={() => setDeleteRoom(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Room"
        message={`Are you sure you want to delete Room ${deleteRoom?.room_number}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
