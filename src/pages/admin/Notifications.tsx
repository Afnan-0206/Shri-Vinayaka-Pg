import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { notificationsApi } from '@/api/notifications'
import type { Notification } from '@/types'
import { formatRelativeTime } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, SkeletonTable } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'

const TYPE_COLORS: Record<string, string> = {
  enquiry: 'bg-blue-100 text-blue-600',
  resident: 'bg-green-100 text-green-600',
  rent: 'bg-yellow-100 text-yellow-600',
  visit: 'bg-purple-100 text-purple-600',
  system: 'bg-gray-100 text-gray-600',
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setNotifications(await notificationsApi.getAll()) }
    catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleMarkRead = async (id: string) => {
    try { await notificationsApi.markRead(id); await load() }
    catch (e) { toast.error((e as Error).message) }
  }

  const handleMarkAllRead = async () => {
    try { await notificationsApi.markAllRead(); toast.success('All marked as read'); await load() }
    catch (e) { toast.error((e as Error).message) }
  }

  const handleDelete = async (id: string) => {
    try { await notificationsApi.delete(id); await load() }
    catch (e) { toast.error((e as Error).message) }
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">{unread} unread notifications</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" icon={<CheckCheck className="w-4 h-4" />} onClick={handleMarkAllRead}>Mark All Read</Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-6"><SkeletonTable rows={6} cols={3} /></div>
          : error ? <ErrorState message={error} onRetry={load} />
          : notifications.length === 0 ? (
            <EmptyState icon={<Bell className="w-8 h-8" />} title="No notifications" description="Notifications appear here when enquiries, residents, or payments are updated" />
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map(n => (
                <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`flex items-start gap-4 px-5 py-4 ${!n.is_read ? 'bg-blue-50/30' : ''} hover:bg-gray-50/50 transition-colors`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[n.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(n.created_at)} · <span className="capitalize">{n.type}</span></p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.is_read && (
                      <button onClick={() => handleMarkRead(n.id)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Mark read</button>
                    )}
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
