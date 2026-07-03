import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Home, BedDouble, Users, MessageSquare,
  CalendarCheck, IndianRupee, Image, Sparkles, Settings,
  Bell, LogOut, Menu, X, ChevronRight, Building2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants'
import toast from 'react-hot-toast'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    to: ROUTES.ADMIN_DASHBOARD,   icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Rooms',        to: ROUTES.ADMIN_ROOMS,        icon: <BedDouble className="w-4 h-4" /> },
  { label: 'Enquiries',    to: ROUTES.ADMIN_ENQUIRIES,    icon: <MessageSquare className="w-4 h-4" /> },
  { label: 'Visits',       to: ROUTES.ADMIN_VISITS,       icon: <CalendarCheck className="w-4 h-4" /> },
  { label: 'Residents',    to: ROUTES.ADMIN_RESIDENTS,    icon: <Users className="w-4 h-4" /> },
  { label: 'Rent',         to: ROUTES.ADMIN_RENT,         icon: <IndianRupee className="w-4 h-4" /> },
  { label: 'Gallery',      to: ROUTES.ADMIN_GALLERY,      icon: <Image className="w-4 h-4" /> },
  { label: 'Facilities',   to: ROUTES.ADMIN_FACILITIES,   icon: <Sparkles className="w-4 h-4" /> },
  { label: 'Notifications',to: ROUTES.ADMIN_NOTIFICATIONS,icon: <Bell className="w-4 h-4" /> },
  { label: 'Settings',     to: ROUTES.ADMIN_SETTINGS,     icon: <Settings className="w-4 h-4" /> },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    toast.success('Logged out successfully')
    navigate(ROUTES.ADMIN_LOGIN)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Sri Vinayaka</p>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition-colors lg:hidden">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        {/* Website link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>View Website</span>
        </a>
        {/* Profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-800">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
            {(profile?.full_name || profile?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
