import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Wifi, UtensilsCrossed, MapPin, Star, ChevronDown, ChevronUp,
  Phone, MessageCircle, ExternalLink, BedDouble, CheckCircle,
  Droplets, Zap, Wind, Sparkles, GlassWater, ParkingSquare, BookOpen,
  ArrowRight, Send
} from 'lucide-react'
import { roomsApi } from '@/api/rooms'
import { facilitiesApi } from '@/api/facilities'
import { galleryApi } from '@/api/gallery'
import { enquiriesApi } from '@/api/enquiries'
import { useSettings } from '@/contexts/SettingsContext'
import type { Room, Facility, GalleryImage } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { TESTIMONIALS, FAQS, ROOM_TYPES, GALLERY_CATEGORIES } from '@/constants'
import toast from 'react-hot-toast'

const TRUST_BADGES = [
  { icon: <Shield className="w-5 h-5" />, label: 'Safe & Secure' },
  { icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Food Included' },
  { icon: <Wifi className="w-5 h-5" />, label: 'Wi-Fi Available' },
  { icon: <MapPin className="w-5 h-5" />, label: 'Prime Location' },
]

const ICON_MAP: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6" />,
  Wifi: <Wifi className="w-6 h-6" />,
  Droplets: <Droplets className="w-6 h-6" />,
  Wind: <Wind className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  GlassWater: <GlassWater className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  ParkingSquare: <ParkingSquare className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
}

const PRICING_PLANS = [
  {
    name: 'Triple Sharing', price: 4500, popular: false,
    features: ['3-Person Sharing', 'Food Included', 'Wi-Fi', '24/7 Security', 'CCTV', 'Housekeeping'],
    color: 'border-gray-200',
  },
  {
    name: 'Double Sharing', price: 5500, popular: true,
    features: ['2-Person Sharing', 'Food Included', 'Wi-Fi', '24/7 Security', 'CCTV', 'Housekeeping', 'Study Area'],
    color: 'border-indigo-500',
  },
  {
    name: 'Single / Premium', price: 8500, popular: false,
    features: ['Private Room', 'Food Included', 'Wi-Fi', '24/7 Security', 'CCTV', 'Housekeeping', 'Power Backup', 'Parking'],
    color: 'border-gray-200',
  },
]

const NEARBY = {
  colleges: ['Christ University (2.1 km)', 'Jain University (3.5 km)', 'BMS College of Engineering (4.2 km)', 'RV College of Engineering (5.1 km)'],
  companies: ['Wipro Technologies (1.8 km)', 'Infosys Koramangala (2.3 km)', 'Accenture (3.0 km)', 'Bosch (4.5 km)'],
  transport: ['Koramangala Bus Stop (0.3 km)', 'BTM Layout Metro (2.0 km)', 'Indiranagar Metro (3.5 km)', 'Silk Board Junction (4.0 km)'],
}

const EMPTY_ENQUIRY = { full_name: '', phone: '', email: '', occupation: '', room_type: '', move_in_date: '', message: '' }

function fadeInUp(delay = 0) {
  return { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay } }
}

export default function Home() {
  const { settings } = useSettings()
  const [rooms, setRooms] = useState<Room[]>([])

  const getShortLocation = () => {
    const parts = (settings.address || '').split(',').map(p => p.trim()).filter(Boolean)
    if (parts.length >= 2) {
      const cityPart = parts[parts.length - 1].split('-')[0].trim()
      const areaPart = parts[parts.length - 2]
      return `${areaPart}, ${cityPart}`
    }
    return settings.address || 'Koramangala, Bengaluru'
  }
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [galleryCategory, setGalleryCategory] = useState('')
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [enquiryForm, setEnquiryForm] = useState(EMPTY_ENQUIRY)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    roomsApi.getActive().then(setRooms).catch(() => {})
    facilitiesApi.getActive().then(setFacilities).catch(() => {})
    galleryApi.getActive().then(setGallery).catch(() => {})
  }, [])

  const filteredGallery = galleryCategory ? gallery.filter(g => g.category === galleryCategory) : gallery

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enquiryForm.full_name || !enquiryForm.phone) { toast.error('Name and phone are required'); return }
    setSubmitting(true)
    try {
      await enquiriesApi.create(enquiryForm)
      setSubmitted(true)
      setEnquiryForm(EMPTY_ENQUIRY)
      toast.success('Enquiry submitted! We will contact you soon.')
    } catch (e) { toast.error('Failed to submit enquiry. Please try again.') }
    finally { setSubmitting(false) }
  }

  const scrollTo = (id: string) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">

      {/* ==================== HERO ==================== */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80"
            alt="Sri Vinayaka PG Building"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-indigo-900/70 to-gray-900/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5" /> {getShortLocation()}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Comfortable PG Rooms<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">for Students</span> &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Professionals</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              {settings.pg_name} offers safe, clean, and affordable accommodation with home-cooked food, 
              high-speed Wi-Fi, 24/7 security, housekeeping, and a peaceful environment to thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <button
                onClick={() => scrollTo('#contact')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-full transition-all shadow-xl hover:shadow-indigo-500/30 text-sm"
              >
                Book a Visit →
              </button>
              <button
                onClick={() => scrollTo('#rooms')}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-full transition-all backdrop-blur-sm text-sm"
              >
                View Rooms
              </button>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {TRUST_BADGES.map(b => (
              <div key={b.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm">
                <span className="text-indigo-300">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ==================== ABOUT ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp()}>
              <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-6 leading-tight">
                Your Home Away<br />From Home in Bengaluru
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {settings.pg_name} has been providing quality accommodation in Koramangala, Bengaluru since 2015. 
                We understand what students and working professionals need — a safe, clean, and comfortable place to call home.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our experienced management team ensures that every resident feels at home. From freshly cooked meals 
                to spotless rooms, we take care of every detail so you can focus on what matters most.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Clean Rooms', sub: 'Daily housekeeping' },
                  { label: 'Home-cooked Food', sub: '3 meals daily' },
                  { label: 'Safe Environment', sub: '24/7 CCTV & security' },
                  { label: 'Friendly Management', sub: 'Always available' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeInUp(0.2)} className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" alt="Common area" loading="lazy"
                className="rounded-2xl shadow-lg object-cover h-48 w-full" />
              <img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80" alt="Room" loading="lazy"
                className="rounded-2xl shadow-lg object-cover h-48 w-full mt-6" />
              <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80" alt="Dining" loading="lazy"
                className="rounded-2xl shadow-lg object-cover h-48 w-full -mt-6" />
              <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80" alt="Study area" loading="lazy"
                className="rounded-2xl shadow-lg object-cover h-48 w-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== ROOMS ==================== */}
      <section id="rooms" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp()} className="text-center mb-14">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Accommodation</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Choose Your Perfect Room</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">From budget-friendly sharing to premium private rooms, we have the right option for you.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.slice(0, 4).map((room, i) => (
              <motion.div key={room.id} {...fadeInUp(i * 0.1)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  {room.image_url ? (
                    <img src={room.image_url} alt={`Room ${room.room_number}`} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <BedDouble className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{room.sharing_type}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {room.status === 'available' ? 'Available' : 'Occupied'}
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-indigo-600 mb-1">
                    {formatCurrency(room.rent)}<span className="text-sm text-gray-400 font-normal">/month</span>
                  </p>
                  <p className="text-xs text-gray-400 mb-3">Deposit: {formatCurrency(room.deposit)}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(room.facilities ?? []).slice(0, 4).map(f => (
                      <span key={f} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => scrollTo('#contact')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Enquire Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FACILITIES ==================== */}
      <section id="facilities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp()} className="text-center mb-14">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">What We Offer</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">World-Class Facilities</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Everything you need for a comfortable and productive stay.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {(facilities.length > 0 ? facilities : [
              { id: '1', name: 'Home-cooked Food', icon: 'UtensilsCrossed', description: '3 meals daily', is_active: true, sort_order: 1, created_at: '' },
              { id: '2', name: 'High-Speed Wi-Fi', icon: 'Wifi', description: 'Unlimited internet', is_active: true, sort_order: 2, created_at: '' },
              { id: '3', name: '24/7 Hot Water', icon: 'Droplets', description: 'All bathrooms', is_active: true, sort_order: 3, created_at: '' },
              { id: '4', name: 'CCTV Security', icon: 'Shield', description: '24/7 surveillance', is_active: true, sort_order: 4, created_at: '' },
              { id: '5', name: 'Housekeeping', icon: 'Sparkles', description: 'Daily cleaning', is_active: true, sort_order: 5, created_at: '' },
              { id: '6', name: 'Power Backup', icon: 'Zap', description: 'UPS & Generator', is_active: true, sort_order: 6, created_at: '' },
              { id: '7', name: 'Washing Machine', icon: 'Wind', description: 'Common area', is_active: true, sort_order: 7, created_at: '' },
              { id: '8', name: 'Drinking Water', icon: 'GlassWater', description: 'RO purified', is_active: true, sort_order: 8, created_at: '' },
              { id: '9', name: 'Parking', icon: 'ParkingSquare', description: 'Two-wheeler', is_active: true, sort_order: 9, created_at: '' },
              { id: '10', name: 'Study Area', icon: 'BookOpen', description: 'Quiet & well-lit', is_active: true, sort_order: 10, created_at: '' },
            ] as Facility[]).map((f, i) => (
              <motion.div key={f.id} {...fadeInUp(i * 0.05)}
                className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-5 text-center hover:shadow-md hover:border-indigo-300 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-white group-hover:scale-110 transition-transform">
                  {ICON_MAP[f.icon ?? ''] ?? <Sparkles className="w-6 h-6" />}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{f.name}</p>
                {f.description && <p className="text-xs text-gray-400 mt-1">{f.description}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-indigo-950 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp()} className="text-center mb-14">
            <span className="text-indigo-400 text-sm font-semibold uppercase tracking-wider">Transparent Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Simple, No Hidden Charges</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">All prices include food, Wi-Fi, and security. No surprises.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING_PLANS.map((plan, i) => (
              <motion.div key={plan.name} {...fadeInUp(i * 0.1)}
                className={`bg-white rounded-2xl p-7 border-2 relative ${plan.popular ? 'border-indigo-500 scale-105 shadow-2xl shadow-indigo-500/20' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                <p className="text-3xl font-extrabold text-indigo-600 mt-2 mb-1">
                  {formatCurrency(plan.price)}<span className="text-sm font-normal text-gray-400">/month</span>
                </p>
                <ul className="space-y-2.5 mt-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => scrollTo('#contact')}
                  className={`w-full mt-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Book This Room
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== GALLERY ==================== */}
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp()} className="text-center mb-10">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Gallery</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">See It for Yourself</h2>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button onClick={() => setGalleryCategory('')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!galleryCategory ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'}`}>All</button>
            {GALLERY_CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setGalleryCategory(c.value)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${galleryCategory === c.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'}`}>{c.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(filteredGallery.length > 0 ? filteredGallery : gallery).slice(0, 12).map((img, i) => (
              <motion.div key={img.id} {...fadeInUp(i * 0.05)} className="rounded-2xl overflow-hidden bg-gray-100 aspect-square group cursor-pointer">
                <img src={img.image_url} alt={img.title ?? 'Gallery'} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== LOCATION ==================== */}
      <section id="location" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp()} className="text-center mb-14">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Location</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Perfectly Located in Bengaluru</h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div {...fadeInUp()} className="space-y-6">
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">{settings.pg_name}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{settings.address}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <a href={settings.maps_url || `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors justify-center">
                    <ExternalLink className="w-4 h-4" /> Get Directions
                  </a>
                  <a href={`tel:${(settings.phone || '').replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 bg-gray-100 text-gray-800 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors justify-center">
                    <Phone className="w-4 h-4" /> Call Owner
                  </a>
                  <a href={`https://wa.me/${(settings.whatsapp || '').replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${encodeURIComponent(settings.pg_name || '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors justify-center">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Nearby Colleges', items: NEARBY.colleges },
                  { label: 'IT Companies', items: NEARBY.companies },
                  { label: 'Transport', items: NEARBY.transport },
                ].map(group => (
                  <div key={group.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{group.label}</p>
                    <ul className="space-y-2">
                      {group.items.map(item => (
                        <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeInUp(0.2)} className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 h-80 lg:h-full min-h-[350px] bg-gray-100 flex items-center justify-center">
              <iframe
                title="Sri Vinayaka PG Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.address || 'Koramangala,Bengaluru')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp()} className="text-center mb-14">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">What Our Residents Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} {...fadeInUp(i * 0.1)} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.occupation}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp()} className="text-center mb-14">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} {...fadeInUp(i * 0.05)} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                  {faqOpen === i ? <ChevronUp className="w-4 h-4 text-indigo-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {faqOpen === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== ENQUIRY FORM ==================== */}
      <section id="contact" className="py-20 bg-gradient-to-br from-indigo-950 to-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp()} className="text-center mb-10">
            <span className="text-indigo-400 text-sm font-semibold uppercase tracking-wider">Get in Touch</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Book a Visit or Send Enquiry</h2>
            <p className="text-gray-400 mt-3">Fill in your details and we'll get back to you within 24 hours.</p>
          </motion.div>

          <motion.div {...fadeInUp(0.2)} className="bg-white rounded-3xl p-8 shadow-2xl">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">We will contact you soon at the number provided.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-indigo-600 text-sm font-medium hover:text-indigo-800">
                  Submit another enquiry →
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input required value={enquiryForm.full_name} onChange={e => setEnquiryForm(p => ({ ...p, full_name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input required type="tel" value={enquiryForm.phone} onChange={e => setEnquiryForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={enquiryForm.email} onChange={e => setEnquiryForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      placeholder="you@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <input value={enquiryForm.occupation} onChange={e => setEnquiryForm(p => ({ ...p, occupation: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                      placeholder="Student / Software Engineer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type Interested</label>
                    <select value={enquiryForm.room_type} onChange={e => setEnquiryForm(p => ({ ...p, room_type: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
                      <option value="">Select room type</option>
                      {ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Move-in Date</label>
                    <input type="date" value={enquiryForm.move_in_date} onChange={e => setEnquiryForm(p => ({ ...p, move_in_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={3} value={enquiryForm.message} onChange={e => setEnquiryForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none transition-all"
                    placeholder="Any specific requirements or questions?" />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/30"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Enquiry</>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
