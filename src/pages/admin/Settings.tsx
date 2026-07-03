import React, { useState, useEffect, useCallback } from 'react'
import { Settings, Save } from 'lucide-react'
import { settingsApi } from '@/api/settings'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'
import { SkeletonCard } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'

interface SettingsForm {
  pg_name: string
  tagline: string
  phone: string
  whatsapp: string
  email: string
  address: string
  maps_url: string
  instagram_url: string
  facebook_url: string
  twitter_url: string
}

const DEFAULT: SettingsForm = {
  pg_name: '', tagline: '', phone: '', whatsapp: '',
  email: '', address: '', maps_url: '',
  instagram_url: '', facebook_url: '', twitter_url: '',
}

export default function AdminSettings() {
  const [form, setForm] = useState<SettingsForm>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const settings = await settingsApi.getAll()
      const map: Record<string, string> = {}
      settings.forEach(s => { map[s.key] = s.value ?? '' })
      setForm({
        pg_name: map['pg_name'] ?? '',
        tagline: map['tagline'] ?? '',
        phone: map['phone'] ?? '',
        whatsapp: map['whatsapp'] ?? '',
        email: map['email'] ?? '',
        address: map['address'] ?? '',
        maps_url: map['maps_url'] ?? '',
        instagram_url: map['instagram_url'] ?? '',
        facebook_url: map['facebook_url'] ?? '',
        twitter_url: map['twitter_url'] ?? '',
      })
    } catch (e) { toast.error((e as Error).message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsApi.bulkUpdate(form as unknown as Record<string, string>)
      toast.success('Settings saved successfully!')
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  const set = (key: keyof SettingsForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  if (loading) {
    return <div className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Update PG information displayed on the public website</p>
        </div>
        <Button icon={<Save className="w-4 h-4" />} loading={saving} onClick={handleSave}>Save Changes</Button>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-600" /> Basic Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="PG Name" value={form.pg_name} onChange={set('pg_name')} required />
          <Input label="Tagline" value={form.tagline} onChange={set('tagline')} />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Contact Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone Number" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          <Input label="WhatsApp Number" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+919876543210" />
          <Input label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="info@srivinayakapg.com" />
        </div>
        <TextArea label="Full Address" value={form.address} onChange={set('address')} rows={3} placeholder="Door No, Street, Area, City, Pincode" />
        <Input label="Google Maps URL" value={form.maps_url} onChange={set('maps_url')} placeholder="https://maps.google.com/..." />
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Social Media Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Instagram URL" value={form.instagram_url} onChange={set('instagram_url')} placeholder="https://instagram.com/..." />
          <Input label="Facebook URL" value={form.facebook_url} onChange={set('facebook_url')} placeholder="https://facebook.com/..." />
          <Input label="Twitter/X URL" value={form.twitter_url} onChange={set('twitter_url')} placeholder="https://twitter.com/..." />
        </div>
      </div>

      <div className="flex justify-end">
        <Button icon={<Save className="w-4 h-4" />} loading={saving} onClick={handleSave} size="lg">Save All Changes</Button>
      </div>
    </div>
  )
}
