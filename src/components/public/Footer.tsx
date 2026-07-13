import { Building2, Phone, Mail, MapPin, Share2, Globe, MessageCircle } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

export default function Footer() {
  const { settings } = useSettings()
  
  const scrollTo = (id: string) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">{settings.pg_name}</p>
                <p className="text-xs text-gray-400">{settings.tagline || 'Safe & Affordable Accommodation'}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              A trusted PG accommodation in the heart of Bengaluru, offering clean rooms, nutritious food, 
              high-speed Wi-Fi, and 24/7 security for students and working professionals.
            </p>
            <div className="flex gap-3 mt-5">
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-colors">
                  <Share2 className="w-4 h-4" />
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                ['Home', '#home'], ['Rooms', '#rooms'], ['Facilities', '#facilities'],
                ['Pricing', '#pricing'], ['Gallery', '#gallery'], ['Location', '#location'],
              ].map(([label, id]) => (
                <li key={label}>
                  <button
                    onClick={() => scrollTo(id)}
                    className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400 whitespace-pre-line">{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <a href={`tel:${(settings.phone || '').replace(/\s+/g, '')}`} className="text-sm text-gray-400 hover:text-white transition-colors">{settings.phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="text-sm text-gray-400 hover:text-white transition-colors">{settings.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} {settings.pg_name}. All rights reserved.</p>
          <a href="/admin/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Admin Portal</a>
        </div>
      </div>
    </footer>
  )
}
