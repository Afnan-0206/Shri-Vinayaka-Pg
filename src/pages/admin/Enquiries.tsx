import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Search, CalendarCheck, Trash2, ChevronDown } from 'lucide-react'
import { enquiriesApi } from '@/api/enquiries'
import { visitsApi } from '@/api/visits'
import type { Enquiry, EnquiryStatus } from '@/types'
import { ENQUIRY_STATUS_CONFIG, ENQUIRY_STATUSES, ROOM_TYPES } from '@/constants'
import { formatDate, formatRelativeTime } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select, TextArea } from '@/components/ui/Input'
import { EmptyState, ErrorState, SkeletonTable, Pagination } from '@/components/ui/Feedback'
import { useDebounce, usePagination } from '@/hooks/useUtils'
import toast from 'react-hot-toast'

const PAGE_SIZE = 20

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRoomType, setFilterRoomType] = useState('')

  const debouncedSearch = useDebounce(search, 300)
  const pagination = usePagination(totalCount, PAGE_SIZE)

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [statusModal, setStatusModal] = useState(false)
  const [visitModal, setVisitModal] = useState(false)
  const [deleteEnquiry, setDeleteEnquiry] = useState<Enquiry | null>(null)

  const [newStatus, setNewStatus] = useState<EnquiryStatus>('contacted')
  const [notes, setNotes] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [visitTime, setVisitTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (debouncedSearch) {
        const data = await enquiriesApi.search(debouncedSearch)
        setEnquiries(data.filter(e =>
          (!filterStatus || e.status === filterStatus) &&
          (!filterRoomType || e.room_type === filterRoomType)
        ))
        setTotalCount(data.length)
      } else {
        const { data, count } = await enquiriesApi.getAll(pagination.page, PAGE_SIZE)
        const filtered = data.filter(e =>
          (!filterStatus || e.status === filterStatus) &&
          (!filterRoomType || e.room_type === filterRoomType)
        )
        setEnquiries(filtered)
        setTotalCount(count)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filterStatus, filterRoomType, pagination.page])

  useEffect(() => { void load() }, [load])

  const openStatusModal = (e: Enquiry) => {
    setSelectedEnquiry(e)
    setNewStatus(e.status)
    setNotes(e.notes ?? '')
    setStatusModal(true)
  }

  const openVisitModal = (e: Enquiry) => {
    setSelectedEnquiry(e)
    setVisitDate('')
    setVisitTime('')
    setVisitModal(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedEnquiry) return
    setSaving(true)
    try {
      await enquiriesApi.updateStatus(selectedEnquiry.id, newStatus, notes)
      toast.success('Status updated')
      setStatusModal(false)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleScheduleVisit = async () => {
    if (!selectedEnquiry || !visitDate) {
      toast.error('Please select a visit date')
      return
    }
    setSaving(true)
    try {
      await visitsApi.create({
        enquiry_id: selectedEnquiry.id,
        enquiry_name: selectedEnquiry.full_name,
        phone: selectedEnquiry.phone,
        room_type: selectedEnquiry.room_type ?? '',
        visit_date: visitDate,
        visit_time: visitTime,
        notes: '',
      })
      await enquiriesApi.updateStatus(selectedEnquiry.id, 'visit_scheduled')
      toast.success('Visit scheduled')
      setVisitModal(false)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteEnquiry) return
    setDeleting(true)
    try {
      await enquiriesApi.delete(deleteEnquiry.id)
      toast.success('Enquiry deleted')
      setDeleteEnquiry(null)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Enquiries</h1>
          <p className="text-sm text-gray-500">{totalCount} total enquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Status</option>
          {ENQUIRY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterRoomType} onChange={e => setFilterRoomType(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Rooms</option>
          {ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : enquiries.length === 0 ? (
          <EmptyState icon={<MessageSquare className="w-8 h-8" />} title="No enquiries found" description="New enquiries from the website will appear here" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Room Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Move-in</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Received</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {enquiries.map(e => (
                    <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{e.full_name}</p>
                          <p className="text-xs text-gray-400">{e.occupation ?? '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">{e.phone}</p>
                        <p className="text-xs text-gray-400">{e.email ?? ''}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 capitalize">{e.room_type ?? '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{formatDate(e.move_in_date)}</td>
                      <td className="px-5 py-4">
                        <Badge
                          label={ENQUIRY_STATUS_CONFIG[e.status].label}
                          color={ENQUIRY_STATUS_CONFIG[e.status].color as Parameters<typeof Badge>[0]['color']}
                          dot
                        />
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">{formatRelativeTime(e.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openStatusModal(e)} title="Update Status" className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button onClick={() => openVisitModal(e)} title="Schedule Visit" className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                            <CalendarCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteEnquiry(e)} title="Delete" className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!debouncedSearch && (
              <Pagination
                page={pagination.page} totalPages={pagination.totalPages}
                onPrev={pagination.prevPage} onNext={pagination.nextPage}
                isFirst={pagination.isFirst} isLast={pagination.isLast}
                totalCount={totalCount} pageSize={PAGE_SIZE}
              />
            )}
          </>
        )}
      </div>

      {/* Status Modal */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Enquiry Status" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setStatusModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleUpdateStatus}>Update</Button>
        </>}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Updating status for <strong>{selectedEnquiry?.full_name}</strong></p>
          <Select label="New Status" value={newStatus} onChange={e => setNewStatus(e.target.value as EnquiryStatus)} options={ENQUIRY_STATUSES} />
          <TextArea label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add any follow-up notes..." />
        </div>
      </Modal>

      {/* Schedule Visit Modal */}
      <Modal isOpen={visitModal} onClose={() => setVisitModal(false)} title="Schedule Visit" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setVisitModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleScheduleVisit}>Schedule</Button>
        </>}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Schedule a visit for <strong>{selectedEnquiry?.full_name}</strong></p>
          <Input label="Visit Date" type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
          <Input label="Visit Time" type="time" value={visitTime} onChange={e => setVisitTime(e.target.value)} />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteEnquiry} onClose={() => setDeleteEnquiry(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Enquiry" danger confirmLabel="Delete"
        message={`Delete enquiry from ${deleteEnquiry?.full_name}? This action cannot be undone.`}
      />
    </div>
  )
}
