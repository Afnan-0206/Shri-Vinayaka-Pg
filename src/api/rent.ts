import { supabase } from '@/lib/supabase'
import type { RentPayment, PaymentMode } from '@/types'
import { isDemoMode, mockDb } from '@/utils/mockDb'

export const rentApi = {
  async getAll(year?: number, month?: number): Promise<RentPayment[]> {
    if (isDemoMode()) return mockDb.rent.getAll(year, month) as RentPayment[]
    let query = (supabase as any)
      .from('rent_payments')
      .select('*, resident:residents(id,full_name,phone,room_id)')
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (year) query = query.eq('year', year)
    if (month) query = query.eq('month', month)

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as unknown as RentPayment[]
  },

  async getByResident(residentId: string): Promise<RentPayment[]> {
    if (isDemoMode()) return (mockDb.rent.getAll() as RentPayment[]).filter(r => r.resident_id === residentId)
    const { data, error } = await (supabase as any)
      .from('rent_payments')
      .select('*')
      .eq('resident_id', residentId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as RentPayment[]
  },

  async markPaid(
    id: string,
    amount_paid: number,
    payment_mode: PaymentMode,
    remarks?: string
  ): Promise<void> {
    if (isDemoMode()) {
      mockDb.rent.markPaid(id, amount_paid, payment_mode, remarks)
      return
    }
    const { error } = await (supabase as any)
      .from('rent_payments')
      .update({
        status: 'paid',
        amount_paid,
        payment_mode,
        payment_date: new Date().toISOString().split('T')[0],
        ...(remarks ? { remarks } : {}),
      } as any)
      .eq('id', id)
    if (error) throw error
  },

  async getSummary(): Promise<{
    totalDue: number
    totalPaid: number
    totalPending: number
    totalOverdue: number
  }> {
    if (isDemoMode()) {
      const payments = mockDb.rent.getAll() as RentPayment[]
      return {
        totalDue: payments.reduce((s, p) => s + Number(p.amount_due), 0),
        totalPaid: payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount_paid), 0),
        totalPending: payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount_due), 0),
        totalOverdue: payments.filter(p => p.status === 'overdue').reduce((s, p) => s + Number(p.amount_due), 0),
      }
    }
    const { data, error } = await (supabase as any)
      .from('rent_payments')
      .select('amount_due, amount_paid, status')
    if (error) throw error

    const payments = (data ?? []) as { amount_due: number; amount_paid: number; status: string }[]
    return {
      totalDue: payments.reduce((s, p) => s + Number(p.amount_due), 0),
      totalPaid: payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount_paid), 0),
      totalPending: payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount_due), 0),
      totalOverdue: payments.filter(p => p.status === 'overdue').reduce((s, p) => s + Number(p.amount_due), 0),
    }
  },
}
