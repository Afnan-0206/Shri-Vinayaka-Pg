import type { Room, Facility, GalleryImage, Enquiry, Visit, Resident, RentPayment, Notification, SiteSetting, DashboardStats, RoomFormData, ResidentFormData, VisitFormData } from '@/types'

// Helper to check if in demo mode
export function isDemoMode(): boolean {
  return localStorage.getItem('demo_session') !== null
}

const ROOM_SEEDS: Room[] = [
  { id: 'r1', room_number: '101', room_type: 'single', sharing_type: 'Single Sharing', rent: 8500, deposit: 17000, status: 'available', description: 'Spacious single room with attached bath.', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', facilities: ['Wi-Fi', 'Food', 'Hot Water'], is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'r2', room_number: '102', room_type: 'single', sharing_type: 'Single Sharing', rent: 8500, deposit: 17000, status: 'occupied', description: 'Cozy single room with wardrobe.', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', facilities: ['Wi-Fi', 'Food'], is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'r3', room_number: '201', room_type: 'double', sharing_type: 'Two Sharing', rent: 5500, deposit: 11000, status: 'available', description: 'Well-ventilated room for two.', image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80', facilities: ['Wi-Fi', 'Food', 'Study Area'], is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'r4', room_number: '202', room_type: 'double', sharing_type: 'Two Sharing', rent: 5500, deposit: 11000, status: 'occupied', description: 'Quiet sharing room.', image_url: 'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=800&q=80', facilities: ['Wi-Fi', 'Hot Water'], is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'r5', room_number: '301', room_type: 'triple', sharing_type: 'Three Sharing', rent: 4500, deposit: 9000, status: 'available', description: 'Affordable study-friendly room.', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', facilities: ['Wi-Fi', 'Food'], is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const FACILITY_SEEDS: Facility[] = [
  { id: 'f1', name: 'Home-cooked Food', description: '3 meals per day', icon: 'UtensilsCrossed', is_active: true, sort_order: 1, created_at: new Date().toISOString() },
  { id: 'f2', name: 'High-Speed Wi-Fi', description: 'High speed internet', icon: 'Wifi', is_active: true, sort_order: 2, created_at: new Date().toISOString() },
  { id: 'f3', name: '24/7 Hot Water', description: 'Attached bathrooms', icon: 'Droplets', is_active: true, sort_order: 3, created_at: new Date().toISOString() },
  { id: 'f4', name: 'CCTV Security', description: '24/7 CCTV surveillance', icon: 'Shield', is_active: true, sort_order: 4, created_at: new Date().toISOString() },
  { id: 'f5', name: 'Housekeeping', description: 'Daily room cleaning', icon: 'Sparkles', is_active: true, sort_order: 5, created_at: new Date().toISOString() },
]

const GALLERY_SEEDS: GalleryImage[] = [
  { id: 'g1', title: 'Entrance', image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', category: 'building', is_active: true, sort_order: 1, created_at: new Date().toISOString() },
  { id: 'g2', title: 'Lounge', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', category: 'common', is_active: true, sort_order: 2, created_at: new Date().toISOString() },
  { id: 'g3', title: 'Dining Room', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', category: 'dining', is_active: true, sort_order: 3, created_at: new Date().toISOString() },
]

const ENQUIRY_SEEDS: Enquiry[] = [
  { id: 'e1', full_name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@email.com', occupation: 'Software Engineer', room_type: 'single', move_in_date: '2026-08-01', message: 'Looking for a single room.', status: 'new', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'e2', full_name: 'Priya Nair', phone: '9765432109', email: 'priya@email.com', occupation: 'Student', room_type: 'double', move_in_date: '2026-08-05', message: 'Double sharing preferred.', status: 'contacted', notes: 'Spoke on call. Will confirm visit.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'e3', full_name: 'Amit Kumar', phone: '9654321098', email: 'amit@email.com', occupation: 'Data Analyst', room_type: 'premium', move_in_date: '2026-08-10', message: 'Need AC premium room.', status: 'visit_scheduled', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const VISIT_SEEDS: Visit[] = [
  { id: 'v1', enquiry_id: 'e3', enquiry_name: 'Amit Kumar', phone: '9654321098', room_type: 'premium', visit_date: new Date().toISOString().split('T')[0], visit_time: '11:00', notes: 'Wants to view top floor room.', status: 'scheduled', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const RESIDENT_SEEDS: Resident[] = [
  { id: 'res1', full_name: 'Sneha Reddy', phone: '9543210987', email: 'sneha@email.com', occupation: 'Student', room_id: 'r2', joining_date: '2026-01-15', monthly_rent: 8500, deposit_paid: 17000, status: 'active', notice_date: null, emergency_contact: 'Father - 9988776655', id_proof_type: 'Aadhaar', id_proof_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'res2', full_name: 'Vikram Singh', phone: '9432109876', email: 'vikram@email.com', occupation: 'BPO Professional', room_id: 'r4', joining_date: '2026-02-20', monthly_rent: 5500, deposit_paid: 11000, status: 'active', notice_date: null, emergency_contact: 'Mother - 8877665544', id_proof_type: 'Pan Card', id_proof_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const RENT_SEEDS: RentPayment[] = [
  { id: 'rp1', resident_id: 'res1', month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount_due: 8500, amount_paid: 8500, payment_date: new Date().toISOString().split('T')[0], due_date: new Date().toISOString().split('T')[0], payment_mode: 'upi', status: 'paid', remarks: 'Paid via GPay', created_at: new Date().toISOString() },
  { id: 'rp2', resident_id: 'res2', month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount_due: 5500, amount_paid: 0, payment_date: null, due_date: new Date().toISOString().split('T')[0], payment_mode: null, status: 'pending', remarks: '', created_at: new Date().toISOString() },
]

const SETTING_SEEDS: SiteSetting[] = [
  { key: 'pg_name', value: 'Sri Vinayaka PG', is_public: true, updated_at: new Date().toISOString() },
  { key: 'tagline', value: 'Safe, Clean & Affordable PG Accommodation', is_public: true, updated_at: new Date().toISOString() },
  { key: 'phone', value: '+91 98765 43210', is_public: true, updated_at: new Date().toISOString() },
  { key: 'whatsapp', value: '+919876543210', is_public: true, updated_at: new Date().toISOString() },
  { key: 'email', value: 'info@srivinayakapg.com', is_public: true, updated_at: new Date().toISOString() },
  { key: 'address', value: '123, 5th Cross, Koramangala 4th Block, Bengaluru - 560034', is_public: true, updated_at: new Date().toISOString() },
]

function getStore<T>(key: string, seeds: T[]): T[] {
  const data = localStorage.getItem(`mock_${key}`)
  if (!data) {
    localStorage.setItem(`mock_${key}`, JSON.stringify(seeds))
    return seeds
  }
  return JSON.parse(data)
}

function setStore<T>(key: string, data: T[]) {
  localStorage.setItem(`mock_${key}`, JSON.stringify(data))
}

export const mockDb = {
  // Rooms
  rooms: {
    getAll: () => getStore('rooms', ROOM_SEEDS),
    create: (data: RoomFormData) => {
      const rooms = getStore('rooms', ROOM_SEEDS)
      const newRoom: Room = {
        id: Math.random().toString(),
        room_number: data.room_number,
        room_type: data.room_type,
        sharing_type: data.sharing_type,
        rent: data.rent,
        deposit: data.deposit,
        status: data.status,
        description: data.description,
        image_url: data.image_url,
        facilities: data.facilities,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      rooms.push(newRoom)
      setStore('rooms', rooms)
      return newRoom
    },
    update: (id: string, data: Partial<RoomFormData>) => {
      const rooms = getStore('rooms', ROOM_SEEDS)
      const index = rooms.findIndex(r => r.id === id)
      if (index > -1) {
        rooms[index] = { ...rooms[index], ...data, updated_at: new Date().toISOString() } as Room
        setStore('rooms', rooms)
        return rooms[index]
      }
      throw new Error('Room not found')
    },
    delete: (id: string) => {
      const rooms = getStore('rooms', ROOM_SEEDS)
      setStore('rooms', rooms.filter(r => r.id !== id))
    },
  },

  // Residents
  residents: {
    getAll: () => {
      const res = getStore('residents', RESIDENT_SEEDS)
      const rooms = getStore('rooms', ROOM_SEEDS)
      return res.map(r => ({
        ...r,
        room: rooms.find(rm => rm.id === r.room_id)
      }))
    },
    create: (data: ResidentFormData) => {
      const res = getStore('residents', RESIDENT_SEEDS)
      const newRes: Resident = {
        id: Math.random().toString(),
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        occupation: data.occupation,
        room_id: data.room_id,
        joining_date: data.joining_date,
        monthly_rent: data.monthly_rent,
        deposit_paid: data.deposit_paid,
        status: 'active',
        notice_date: null,
        emergency_contact: data.emergency_contact,
        id_proof_type: null,
        id_proof_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      res.push(newRes)
      setStore('residents', res)

      // Auto update room status
      const rooms = getStore('rooms', ROOM_SEEDS)
      const rmIdx = rooms.findIndex(rm => rm.id === data.room_id)
      if (rmIdx > -1) {
        rooms[rmIdx].status = 'occupied'
        setStore('rooms', rooms)
      }

      // Auto create rentpayment
      const rent = getStore('rent', RENT_SEEDS)
      const now = new Date(data.joining_date)
      rent.push({
        id: Math.random().toString(),
        resident_id: newRes.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        amount_due: data.monthly_rent,
        amount_paid: 0,
        payment_date: null,
        due_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`,
        payment_mode: null,
        status: 'pending',
        remarks: '',
        created_at: new Date().toISOString(),
      })
      setStore('rent', rent)

      return newRes
    },
    update: (id: string, data: Partial<ResidentFormData>) => {
      const res = getStore('residents', RESIDENT_SEEDS)
      const index = res.findIndex(r => r.id === id)
      if (index > -1) {
        res[index] = { ...res[index], ...data, updated_at: new Date().toISOString() } as Resident
        setStore('residents', res)
        return res[index]
      }
      throw new Error('Resident not found')
    },
    updateStatus: (id: string, status: any) => {
      const res = getStore('residents', RESIDENT_SEEDS)
      const index = res.findIndex(r => r.id === id)
      if (index > -1) {
        res[index].status = status
        if (status === 'left' && res[index].room_id) {
          // Free room
          const rooms = getStore('rooms', ROOM_SEEDS)
          const rmIdx = rooms.findIndex(rm => rm.id === res[index].room_id)
          if (rmIdx > -1) {
            rooms[rmIdx].status = 'available'
            setStore('rooms', rooms)
          }
        }
        setStore('residents', res)
      }
    },
    delete: (id: string) => {
      const res = getStore('residents', RESIDENT_SEEDS)
      setStore('residents', res.filter(r => r.id !== id))
    },
  },

  // Enquiries
  enquiries: {
    getAll: () => getStore('enquiries', ENQUIRY_SEEDS),
    create: (data: any) => {
      const enqs = getStore('enquiries', ENQUIRY_SEEDS)
      const newEnq: Enquiry = {
        id: Math.random().toString(),
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || '',
        occupation: data.occupation || '',
        room_type: data.room_type || '',
        move_in_date: data.move_in_date || '',
        message: data.message || '',
        status: 'new',
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      enqs.push(newEnq)
      setStore('enquiries', enqs)
      return newEnq
    },
    updateStatus: (id: string, status: any, notes: string) => {
      const enqs = getStore('enquiries', ENQUIRY_SEEDS)
      const index = enqs.findIndex(e => e.id === id)
      if (index > -1) {
        enqs[index].status = status
        enqs[index].notes = notes
        enqs[index].updated_at = new Date().toISOString()
        setStore('enquiries', enqs)
      }
    },
    delete: (id: string) => {
      const enqs = getStore('enquiries', ENQUIRY_SEEDS)
      setStore('enquiries', enqs.filter(e => e.id !== id))
    },
  },

  // Visits
  visits: {
    getAll: () => getStore('visits', VISIT_SEEDS),
    create: (data: VisitFormData) => {
      const visits = getStore('visits', VISIT_SEEDS)
      const newVisit: Visit = {
        id: Math.random().toString(),
        enquiry_id: data.enquiry_id || null,
        enquiry_name: data.enquiry_name,
        phone: data.phone,
        room_type: data.room_type,
        visit_date: data.visit_date,
        visit_time: data.visit_time,
        notes: data.notes,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      visits.push(newVisit)
      setStore('visits', visits)
      return newVisit
    },
    update: (id: string, data: any) => {
      const visits = getStore('visits', VISIT_SEEDS)
      const index = visits.findIndex(v => v.id === id)
      if (index > -1) {
        visits[index] = { ...visits[index], ...data, updated_at: new Date().toISOString() }
        setStore('visits', visits)
      }
    },
    updateStatus: (id: string, status: any) => {
      const visits = getStore('visits', VISIT_SEEDS)
      const index = visits.findIndex(v => v.id === id)
      if (index > -1) {
        visits[index].status = status
        visits[index].updated_at = new Date().toISOString()
        setStore('visits', visits)
      }
    },
    delete: (id: string) => {
      const visits = getStore('visits', VISIT_SEEDS)
      setStore('visits', visits.filter(v => v.id !== id))
    },
  },

  // Rent
  rent: {
    getAll: (year?: number, month?: number) => {
      const rent = getStore('rent', RENT_SEEDS)
      const residents = getStore('residents', RESIDENT_SEEDS)
      return rent
        .filter(r => (!year || r.year === year) && (!month || r.month === month))
        .map(r => ({
          ...r,
          resident: residents.find(res => res.id === r.resident_id)
        }))
    },
    markPaid: (id: string, amount_paid: number, payment_mode: any, remarks?: string) => {
      const rent = getStore('rent', RENT_SEEDS)
      const index = rent.findIndex(r => r.id === id)
      if (index > -1) {
        rent[index].status = 'paid'
        rent[index].amount_paid = amount_paid
        rent[index].payment_mode = payment_mode
        rent[index].remarks = remarks || ''
        rent[index].payment_date = new Date().toISOString().split('T')[0]
        setStore('rent', rent)
      }
    },
  },

  // Settings
  settings: {
    getAll: () => getStore('settings', SETTING_SEEDS),
    bulkUpdate: (settings: Record<string, string>) => {
      const curr = getStore('settings', SETTING_SEEDS)
      Object.entries(settings).forEach(([key, val]) => {
        const idx = curr.findIndex(s => s.key === key)
        if (idx > -1) curr[idx].value = val
        else curr.push({ key, value: val, is_public: true, updated_at: new Date().toISOString() })
      })
      setStore('settings', curr)
    },
  },

  // Facilities
  facilities: {
    getAll: () => getStore('facilities', FACILITY_SEEDS),
    create: (data: any) => {
      const facs = getStore('facilities', FACILITY_SEEDS)
      const newFac: Facility = {
        id: Math.random().toString(),
        name: data.name,
        description: data.description,
        icon: data.icon,
        is_active: data.is_active,
        sort_order: data.sort_order || 0,
        created_at: new Date().toISOString(),
      }
      facs.push(newFac)
      setStore('facilities', facs)
      return newFac
    },
    update: (id: string, data: any) => {
      const facs = getStore('facilities', FACILITY_SEEDS)
      const idx = facs.findIndex(f => f.id === id)
      if (idx > -1) {
        facs[idx] = { ...facs[idx], ...data }
        setStore('facilities', facs)
      }
    },
    delete: (id: string) => {
      const facs = getStore('facilities', FACILITY_SEEDS)
      setStore('facilities', facs.filter(f => f.id !== id))
    },
  },

  // Gallery
  gallery: {
    getAll: () => getStore('gallery', GALLERY_SEEDS),
    create: (data: any) => {
      const imgs = getStore('gallery', GALLERY_SEEDS)
      const newImg: GalleryImage = {
        id: Math.random().toString(),
        title: data.title,
        image_url: data.image_url,
        category: data.category,
        is_active: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
      }
      imgs.push(newImg)
      setStore('gallery', imgs)
      return newImg
    },
    delete: (id: string) => {
      const imgs = getStore('gallery', GALLERY_SEEDS)
      setStore('gallery', imgs.filter(i => i.id !== id))
    },
    toggle: (id: string, is_active: boolean) => {
      const imgs = getStore('gallery', GALLERY_SEEDS)
      const idx = imgs.findIndex(i => i.id === id)
      if (idx > -1) {
        imgs[idx].is_active = is_active
        setStore('gallery', imgs)
      }
    },
  },
}
