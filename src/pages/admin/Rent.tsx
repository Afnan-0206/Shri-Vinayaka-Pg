import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, CheckCircle, AlertTriangle } from 'lucide-react'
import { rentApi } from '@/api/rent'
import type { RentPayment, PaymentMode } from '@/types'
import { RENT_STATUS_CONFIG, PAYMENT_MODES, MONTH_NAMES } from '@/constants'
import { formatCurrency, formatDate, formatMonthYear } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select, Input, TextArea } from '@/components/ui/Input'
import { EmptyState, ErrorState, SkeletonTable } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'

export default function AdminRent() {
  const [payments, setPayments] = useState<RentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const now = new Date()
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(now.getFullYear())
  const [filterStatus, setFilterStatus] = useState('')

  const [payModal, setPayModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null)
  const [payMode, setPayMode] = useState<PaymentMode>('cash')
  const [amountPaid, setAmountPaid] = useState(0)
  const [remarks, setRemarks] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPayments(await rentApi.getAll(filterYear, filterMonth || undefined))
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [filterMonth, filterYear])

  useEffect(() => { void load() }, [load])

  const filtered = payments.filter(p => !filterStatus || p.status === filterStatus)

  const totalDue = filtered.reduce((s, p) => s + Number(p.amount_due), 0)
  const totalCollected = filtered.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount_paid), 0)
  const totalPending = filtered.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount_due), 0)
  const totalOverdue = filtered.filter(p => p.status === 'overdue').reduce((s, p) => s + Number(p.amount_due), 0)

  const openPayModal = (p: RentPayment) => {
    setSelectedPayment(p)
    setAmountPaid(p.amount_due)
    setPayMode('cash')
    setRemarks('')
    setPayModal(true)
  }

  const handleMarkPaid = async () => {
    if (!selectedPayment) return
    if (amountPaid <= 0) { toast.error('Enter a valid amount'); return }
    setSaving(true)
    try {
      await rentApi.markPaid(selectedPayment.id, amountPaid, payMode, remarks)
      toast.success('Rent marked as paid')
      setPayModal(false)
      await load()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Rent Management</h1>
        <p className="text-sm text-gray-500">Track and collect monthly rent payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Due', value: formatCurrency(totalDue), color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Collected', value: formatCurrency(totalCollected), color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Pending', value: formatCurrency(totalPending), color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Overdue', value: formatCurrency(totalOverdue), color: 'text-red-700', bg: 'bg-red-50' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4 border border-gray-100`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
          <option value={0}>All Months</option>
          {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-6"><SkeletonTable rows={5} cols={6} /></div>
          : error ? <ErrorState message={error} onRetry={load} />
          : filtered.length === 0 ? (
            <EmptyState icon={<IndianRupee className="w-8 h-8" />} title="No rent records" description="Rent records are auto-created when residents are added" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Resident', 'Period', 'Due Amount', 'Paid Amount', 'Due Date', 'Payment Mode', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(p => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`hover:bg-gray-50/50 ${p.status === 'overdue' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">{p.resident?.full_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{p.resident?.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{formatMonthYear(p.month, p.year)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(p.amount_due)}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{p.amount_paid > 0 ? formatCurrency(p.amount_paid) : '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-sm ${p.due_date && new Date(p.due_date) < new Date() && p.status !== 'paid' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {formatDate(p.due_date)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 capitalize">{p.payment_mode?.replace('_', ' ') ?? '—'}</td>
                      <td className="px-5 py-4">
                        <Badge label={RENT_STATUS_CONFIG[p.status].label} color={RENT_STATUS_CONFIG[p.status].color as Parameters<typeof Badge>[0]['color']} dot />
                      </td>
                      <td className="px-5 py-4">
                        {p.status !== 'paid' && (
                          <Button size="sm" variant="outline" icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => openPayModal(p)}>
                            Mark Paid
                          </Button>
                        )}
                        {p.status === 'overdue' && (
                          <span className="ml-2 text-xs text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal isOpen={payModal} onClose={() => setPayModal(false)} title="Mark Rent as Paid" size="sm"
        footer={<><Button variant="outline" onClick={() => setPayModal(false)}>Cancel</Button><Button loading={saving} onClick={handleMarkPaid}>Mark Paid</Button></>}>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{selectedPayment?.resident?.full_name}</p>
            <p className="text-xs text-gray-500">{selectedPayment ? formatMonthYear(selectedPayment.month, selectedPayment.year) : ''} · Due: {formatCurrency(selectedPayment?.amount_due ?? 0)}</p>
          </div>
          <Input label="Amount Received (₹)" type="number" value={amountPaid} onChange={e => setAmountPaid(Number(e.target.value))} required />
          <Select label="Payment Mode" value={payMode} onChange={e => setPayMode(e.target.value as PaymentMode)} options={PAYMENT_MODES} required />
          <TextArea label="Remarks (optional)" value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} placeholder="Receipt number, notes..." />
        </div>
      </Modal>
    </div>
  )
}
