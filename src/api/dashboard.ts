import { supabase } from '@/lib/supabase'
import type { DashboardStats } from '@/types'
import { isDemoMode, mockDb } from '@/utils/mockDb'

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    if (isDemoMode()) {
      const roomList = mockDb.rooms.getAll()
      const totalRooms = roomList.length
      const availableRooms = roomList.filter(r => r.status === 'available').length
      const occupiedRooms = roomList.filter(r => r.status === 'occupied').length
      const maintenanceRooms = roomList.filter(r => r.status === 'maintenance').length
      const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

      const residentList = mockDb.residents.getAll()
      const totalResidents = residentList.filter(r => r.status === 'active').length
      const monthlyRevenue = residentList
        .filter(r => r.status === 'active')
        .reduce((s, r) => s + Number(r.monthly_rent), 0)

      const enquiries = mockDb.enquiries.getAll()
      const visits = mockDb.visits.getAll()
      const payments = mockDb.rent.getAll()

      const pendingRent = payments
        .filter(p => p.status === 'pending')
        .reduce((s, p) => s + Number(p.amount_due), 0)
      const overdueRent = payments
        .filter(p => p.status === 'overdue')
        .reduce((s, p) => s + Number(p.amount_due), 0)

      return {
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        occupancyPercent,
        totalResidents,
        newEnquiries: enquiries.filter(e => e.status === 'new').length,
        scheduledVisits: visits.filter(v => v.status === 'scheduled').length,
        monthlyRevenue,
        pendingRent,
        overdueRent,
        unreadNotifications: 1, // static count
      }
    }

    const [
      { data: rooms },
      { data: residents },
      { count: newEnquiries },
      { count: scheduledVisits },
      { data: rentData },
      { count: unreadNotif },
    ] = await Promise.all([
      (supabase as any).from('rooms').select('status').eq('is_active', true),
      (supabase as any).from('residents').select('id, monthly_rent, status'),
      (supabase as any).from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      (supabase as any).from('visits').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
      (supabase as any).from('rent_payments').select('status, amount_due, amount_paid'),
      (supabase as any).from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false),
    ])

    const roomList = (rooms ?? []) as { status: string }[]
    const totalRooms = roomList.length
    const availableRooms = roomList.filter(r => r.status === 'available').length
    const occupiedRooms = roomList.filter(r => r.status === 'occupied').length
    const maintenanceRooms = roomList.filter(r => r.status === 'maintenance').length
    const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    const residentList = (residents ?? []) as { id: string; monthly_rent: number; status: string }[]
    const totalResidents = residentList.filter(r => r.status === 'active').length
    const monthlyRevenue = residentList
      .filter(r => r.status === 'active')
      .reduce((s, r) => s + Number(r.monthly_rent), 0)

    const payments = (rentData ?? []) as { status: string; amount_due: number; amount_paid: number }[]
    const pendingRent = payments
      .filter(p => p.status === 'pending')
      .reduce((s, p) => s + Number(p.amount_due), 0)
    const overdueRent = payments
      .filter(p => p.status === 'overdue')
      .reduce((s, p) => s + Number(p.amount_due), 0)

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      occupancyPercent,
      totalResidents,
      newEnquiries: newEnquiries ?? 0,
      scheduledVisits: scheduledVisits ?? 0,
      monthlyRevenue,
      pendingRent,
      overdueRent,
      unreadNotifications: unreadNotif ?? 0,
    }
  },

  async getMonthlyRevenue(): Promise<{ month: string; revenue: number; collected: number }[]> {
    const now = new Date()
    const results = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      if (isDemoMode()) {
        const payments = mockDb.rent.getAll(y, m)
        results.push({
          month: d.toLocaleString('default', { month: 'short' }) + ' ' + y,
          revenue: payments.reduce((s, p) => s + Number(p.amount_due), 0),
          collected: payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount_paid), 0),
        })
      } else {
        const { data } = await (supabase as any)
          .from('rent_payments')
          .select('amount_due, amount_paid, status')
          .eq('month', m)
          .eq('year', y)
        const payments = (data ?? []) as { amount_due: number; amount_paid: number; status: string }[]
        results.push({
          month: d.toLocaleString('default', { month: 'short' }) + ' ' + y,
          revenue: payments.reduce((s, p) => s + Number(p.amount_due), 0),
          collected: payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount_paid), 0),
        })
      }
    }
    return results
  },

  async getEnquiryTrend(): Promise<{ month: string; count: number }[]> {
    const now = new Date()
    const results = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = d.toISOString().split('T')[0]
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
      if (isDemoMode()) {
        const count = (mockDb.enquiries.getAll() as any[]).filter(e => {
          const date = e.created_at.split('T')[0]
          return date >= start && date <= end
        }).length
        results.push({
          month: d.toLocaleString('default', { month: 'short' }),
          count,
        })
      } else {
        const { count } = await (supabase as any)
          .from('enquiries')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', start)
          .lte('created_at', end + 'T23:59:59')
        results.push({
          month: d.toLocaleString('default', { month: 'short' }),
          count: count ?? 0,
        })
      }
    }
    return results
  },
}
