import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { AdminLayout } from '@/layouts/AdminLayout'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { ROUTES } from '@/constants'

// Lazy-loaded pages
const Home         = lazy(() => import('@/pages/public/Home'))
const AdminLogin   = lazy(() => import('@/pages/admin/Login'))
const Dashboard    = lazy(() => import('@/pages/admin/Dashboard'))
const AdminRooms   = lazy(() => import('@/pages/admin/Rooms'))
const Enquiries    = lazy(() => import('@/pages/admin/Enquiries'))
const Visits       = lazy(() => import('@/pages/admin/Visits'))
const Residents    = lazy(() => import('@/pages/admin/Residents'))
const Rent         = lazy(() => import('@/pages/admin/Rent'))
const AdminGallery = lazy(() => import('@/pages/admin/Gallery'))
const Facilities   = lazy(() => import('@/pages/admin/Facilities'))
const Notifications = lazy(() => import('@/pages/admin/Notifications'))
const Settings     = lazy(() => import('@/pages/admin/Settings'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

function AdminPage({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<PublicLayout><Home /></PublicLayout>} />

            {/* Admin Login */}
            <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
              <Route path={ROUTES.ADMIN_DASHBOARD}    element={<AdminPage><Dashboard /></AdminPage>} />
              <Route path={ROUTES.ADMIN_ROOMS}         element={<AdminPage><AdminRooms /></AdminPage>} />
              <Route path={ROUTES.ADMIN_ENQUIRIES}     element={<AdminPage><Enquiries /></AdminPage>} />
              <Route path={ROUTES.ADMIN_VISITS}        element={<AdminPage><Visits /></AdminPage>} />
              <Route path={ROUTES.ADMIN_RESIDENTS}     element={<AdminPage><Residents /></AdminPage>} />
              <Route path={ROUTES.ADMIN_RENT}          element={<AdminPage><Rent /></AdminPage>} />
              <Route path={ROUTES.ADMIN_GALLERY}       element={<AdminPage><AdminGallery /></AdminPage>} />
              <Route path={ROUTES.ADMIN_FACILITIES}    element={<AdminPage><Facilities /></AdminPage>} />
              <Route path={ROUTES.ADMIN_NOTIFICATIONS} element={<AdminPage><Notifications /></AdminPage>} />
              <Route path={ROUTES.ADMIN_SETTINGS}      element={<AdminPage><Settings /></AdminPage>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
