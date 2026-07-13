import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { settingsApi } from '@/api/settings'

interface SettingsContextType {
  settings: Record<string, string>
  loading: boolean
  refreshSettings: () => Promise<void>
}

const DEFAULT_SETTINGS: Record<string, string> = {
  pg_name: 'Sri Vinayaka PG',
  tagline: 'Safe, Clean & Affordable PG Accommodation',
  phone: '+91 98765 43210',
  whatsapp: '+919876543210',
  email: 'info@srivinayakapg.com',
  address: '123, 5th Cross, Koramangala 4th Block, Bengaluru - 560034',
  maps_url: 'https://maps.google.com/?q=Koramangala,Bengaluru',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const refreshSettings = useCallback(async () => {
    try {
      const publicSettings = await settingsApi.getPublic()
      setSettings(prev => ({
        ...prev,
        ...publicSettings
      }))
    } catch (e) {
      console.error('Failed to load settings:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshSettings()
  }, [refreshSettings])

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
