import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Menu, X, Phone } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '/#home' },
  { label: 'Rooms', href: '/#rooms' },
  { label: 'Facilities', href: '/#facilities' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Gallery', href: '/#gallery' },
  { label: 'Location', href: '/#location' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className={`font-bold text-sm leading-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>Sri Vinayaka PG</p>
              <p className={`text-xs ${scrolled ? 'text-gray-400' : 'text-indigo-200'}`}>Bengaluru</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={e => scrollTo(e, link.href.replace('/', ''))}
                className={`text-sm font-medium transition-colors hover:text-indigo-500 ${scrolled ? 'text-gray-600' : 'text-white/90'}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/admin/login"
              className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-indigo-600' : 'text-white/80 hover:text-white'}`}
            >
              Admin Portal
            </Link>
            <a href="tel:+919876543210" className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-indigo-600' : 'text-white/80 hover:text-white'}`}>
              <Phone className="w-3.5 h-3.5" />
              Call Now
            </a>
            <a
              href="#contact"
              onClick={e => scrollTo(e, '#contact')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-lg hover:shadow-indigo-500/30"
            >
              Book a Visit
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`p-2 rounded-lg md:hidden ${scrolled ? 'text-gray-700' : 'text-white'}`}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 shadow-lg overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={e => scrollTo(e, link.href.replace('/', ''))}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/admin/login"
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Admin Portal
              </Link>
              <a
                href="#contact"
                onClick={e => scrollTo(e, '#contact')}
                className="block mt-3 bg-indigo-600 text-white text-sm font-semibold px-4 py-3 rounded-xl text-center"
              >
                Book a Visit
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
