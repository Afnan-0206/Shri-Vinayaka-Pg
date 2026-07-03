import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BedDouble, Users, MessageSquare, CalendarCheck,
  IndianRupee, TrendingUp, AlertTriangle, Bell,
  Home, CheckCircle, Clock, Wrench
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import { enquiriesApi } from '@/api/enquiries'
import { visitsApi } from '@/api/visits'
import type { DashboardStats, Enquiry, Visit } from '@/types'
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/formatters'
import { ENQUIRY_STATUS_CONFIG, VISIT_STATUS_CONFIG } from '@/constants'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Feedback'

function StatCard({
  title, value, subtitle, icon, color, delay = 0
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </motion.div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; collected: number }[]>([])
  const [enquiryTrend, setEnquiryTrend] = useState<{ month: string; count: number }[]>([])
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([])
  const [upcomingVisits, setUpcomingVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, rev, enqTrend, enquiries, visits] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getMonthlyRevenue(),
        dashboardApi.getEnquiryTrend(),
        enquiriesApi.getRecent(5),
        visitsApi.getUpcoming(5),
      ])
      setStats(s)
      setRevenueData(rev)
      setEnquiryTrend(enqTrend)
      setRecentEnquiries(enquiries)
      setUpcomingVisits(visits)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const rentDonutData = stats ? [
    { name: 'Collected', value: stats.monthlyRevenue - stats.pendingRent - stats.overdueRent, color: '#22c55e' },
    { name: 'Pending', value: stats.pendingRent, color: '#eab308' },
    { name: 'Overdue', value: stats.overdueRent, color: '#ef4444' },
  ].filter(d => d.value > 0) : []

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards Row 1 — Rooms */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          title="Total Rooms" value={stats?.totalRooms ?? 0} subtitle="All room units"
          icon={<BedDouble className="w-4 h-4 text-indigo-600" />}
          color="bg-indigo-50" delay={0}
        />
        <StatCard
          title="Available" value={stats?.availableRooms ?? 0} subtitle="Ready to allocate"
          icon={<CheckCircle className="w-4 h-4 text-green-600" />}
          color="bg-green-50" delay={0.05}
        />
        <StatCard
          title="Occupied" value={stats?.occupiedRooms ?? 0} subtitle={`${stats?.occupancyPercent ?? 0}% occupancy`}
          icon={<Home className="w-4 h-4 text-blue-600" />}
          color="bg-blue-50" delay={0.1}
        />
        <StatCard
          title="Maintenance" value={stats?.maintenanceRooms ?? 0} subtitle="Under repair"
          icon={<Wrench className="w-4 h-4 text-yellow-600" />}
          color="bg-yellow-50" delay={0.15}
        />
      </div>

      {/* Stat Cards Row 2 — Business */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          title="Monthly Revenue" value={formatCurrency(stats?.monthlyRevenue ?? 0)} subtitle="Expected this month"
          icon={<IndianRupee className="w-4 h-4 text-emerald-600" />}
          color="bg-emerald-50" delay={0.2}
        />
        <StatCard
          title="Pending Rent" value={formatCurrency(stats?.pendingRent ?? 0)} subtitle="To be collected"
          icon={<Clock className="w-4 h-4 text-yellow-600" />}
          color="bg-yellow-50" delay={0.25}
        />
        <StatCard
          title="New Enquiries" value={stats?.newEnquiries ?? 0} subtitle="Last 7 days"
          icon={<MessageSquare className="w-4 h-4 text-purple-600" />}
          color="bg-purple-50" delay={0.3}
        />
        <StatCard
          title="Scheduled Visits" value={stats?.scheduledVisits ?? 0} subtitle="Upcoming"
          icon={<CalendarCheck className="w-4 h-4 text-pink-600" />}
          color="bg-pink-50" delay={0.35}
        />
      </div>

      {/* Stat Cards Row 3 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          title="Active Residents" value={stats?.totalResidents ?? 0} subtitle="Currently staying"
          icon={<Users className="w-4 h-4 text-indigo-600" />}
          color="bg-indigo-50" delay={0.4}
        />
        <StatCard
          title="Overdue Rent" value={formatCurrency(stats?.overdueRent ?? 0)} subtitle="Needs attention"
          icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
          color="bg-red-50" delay={0.45}
        />
        <StatCard
          title="Occupancy %" value={`${stats?.occupancyPercent ?? 0}%`} subtitle="Rooms filled"
          icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
          color="bg-blue-50" delay={0.5}
        />
        <StatCard
          title="Notifications" value={stats?.unreadNotifications ?? 0} subtitle="Unread alerts"
          icon={<Bell className="w-4 h-4 text-orange-600" />}
          color="bg-orange-50" delay={0.55}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Revenue (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="revenue" name="Expected" fill="#e0e7ff" radius={[4,4,0,0]} />
              <Bar dataKey="collected" name="Collected" fill="#4f46e5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rent Donut */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Rent Collection</h3>
          {rentDonutData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={rentDonutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {rentDonutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
              No rent data yet
            </div>
          )}
        </div>
      </div>

      {/* Enquiry Trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Enquiries per Month</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={enquiryTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" name="Enquiries" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Enquiries */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Recent Enquiries</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentEnquiries.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No enquiries yet</p>
            ) : recentEnquiries.map(e => (
              <div key={e.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                  {e.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{e.full_name}</p>
                  <p className="text-xs text-gray-400">{e.room_type || 'Any room'} · {formatRelativeTime(e.created_at)}</p>
                </div>
                <Badge
                  label={ENQUIRY_STATUS_CONFIG[e.status].label}
                  color={ENQUIRY_STATUS_CONFIG[e.status].color as Parameters<typeof Badge>[0]['color']}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Visits */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Upcoming Visits</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingVisits.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No upcoming visits</p>
            ) : upcomingVisits.map(v => (
              <div key={v.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CalendarCheck className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{v.enquiry_name}</p>
                  <p className="text-xs text-gray-400">{v.room_type || 'Any'} · {formatDate(v.visit_date)} {v.visit_time ?? ''}</p>
                </div>
                <Badge
                  label={VISIT_STATUS_CONFIG[v.status].label}
                  color={VISIT_STATUS_CONFIG[v.status].color as Parameters<typeof Badge>[0]['color']}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
