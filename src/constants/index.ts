import type { RoomType, RoomStatus, EnquiryStatus, VisitStatus, ResidentStatus, RentStatus, PaymentMode } from '@/types'

// ============================================================
// Route Constants
// ============================================================
export const ROUTES = {
  HOME: '/',
  ROOMS: '/rooms',
  GALLERY: '/gallery',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ROOMS: '/admin/rooms',
  ADMIN_ENQUIRIES: '/admin/enquiries',
  ADMIN_VISITS: '/admin/visits',
  ADMIN_RESIDENTS: '/admin/residents',
  ADMIN_RENT: '/admin/rent',
  ADMIN_GALLERY: '/admin/gallery',
  ADMIN_FACILITIES: '/admin/facilities',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_SETTINGS: '/admin/settings',
} as const

// ============================================================
// Status Labels & Colors
// ============================================================
export const ROOM_STATUS_CONFIG: Record<RoomStatus, { label: string; color: string }> = {
  available:   { label: 'Available',   color: 'green'  },
  occupied:    { label: 'Occupied',    color: 'red'    },
  maintenance: { label: 'Maintenance', color: 'yellow' },
}

export const ENQUIRY_STATUS_CONFIG: Record<EnquiryStatus, { label: string; color: string }> = {
  new:              { label: 'New',              color: 'blue'   },
  contacted:        { label: 'Contacted',        color: 'yellow' },
  visit_scheduled:  { label: 'Visit Scheduled',  color: 'purple' },
  converted:        { label: 'Converted',        color: 'green'  },
  not_interested:   { label: 'Not Interested',   color: 'gray'   },
}

export const VISIT_STATUS_CONFIG: Record<VisitStatus, { label: string; color: string }> = {
  scheduled:  { label: 'Scheduled',  color: 'blue'   },
  completed:  { label: 'Completed',  color: 'green'  },
  cancelled:  { label: 'Cancelled',  color: 'red'    },
}

export const RESIDENT_STATUS_CONFIG: Record<ResidentStatus, { label: string; color: string }> = {
  active:        { label: 'Active',         color: 'green'  },
  left:          { label: 'Left',           color: 'gray'   },
  notice_period: { label: 'Notice Period',  color: 'yellow' },
}

export const RENT_STATUS_CONFIG: Record<RentStatus, { label: string; color: string }> = {
  paid:    { label: 'Paid',    color: 'green'  },
  pending: { label: 'Pending', color: 'yellow' },
  overdue: { label: 'Overdue', color: 'red'    },
}

// ============================================================
// Dropdown Option Lists
// ============================================================
export const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'single',  label: 'Single Sharing'  },
  { value: 'double',  label: 'Two Sharing'      },
  { value: 'triple',  label: 'Three Sharing'    },
  { value: 'premium', label: 'Premium Room'     },
]

export const ROOM_STATUSES: { value: RoomStatus; label: string }[] = [
  { value: 'available',   label: 'Available'   },
  { value: 'occupied',    label: 'Occupied'    },
  { value: 'maintenance', label: 'Maintenance' },
]

export const ENQUIRY_STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: 'new',              label: 'New'              },
  { value: 'contacted',        label: 'Contacted'        },
  { value: 'visit_scheduled',  label: 'Visit Scheduled'  },
  { value: 'converted',        label: 'Converted'        },
  { value: 'not_interested',   label: 'Not Interested'   },
]

export const PAYMENT_MODES: { value: PaymentMode; label: string }[] = [
  { value: 'cash',          label: 'Cash'          },
  { value: 'upi',           label: 'UPI'           },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card',          label: 'Card'          },
  { value: 'other',         label: 'Other'         },
]

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export const COMMON_FACILITIES = [
  'Wi-Fi', 'Food', 'Hot Water', 'CCTV', 'Housekeeping',
  'Power Backup', 'Parking', 'Study Area', 'AC', 'Washing Machine',
]

export const GALLERY_CATEGORIES = [
  { value: 'rooms',    label: 'Rooms'    },
  { value: 'dining',   label: 'Dining'   },
  { value: 'common',   label: 'Common'   },
  { value: 'building', label: 'Building' },
  { value: 'kitchen',  label: 'Kitchen'  },
  { value: 'study',    label: 'Study'    },
  { value: 'general',  label: 'General'  },
]

// ============================================================
// Testimonials (static content)
// ============================================================
export const TESTIMONIALS = [
  {
    name: 'Arjun Mehta',
    occupation: 'Software Engineer at Infosys',
    rating: 5,
    text: 'Sri Vinayaka PG has been my home for 2 years. The food is delicious, the rooms are clean, and the management is very supportive. Highly recommended!',
    avatar: 'AM',
  },
  {
    name: 'Pooja Rao',
    occupation: 'MBA Student, Christ University',
    rating: 5,
    text: 'As a student, safety was my top priority. This PG has excellent CCTV, strict entry rules, and very friendly staff. The Wi-Fi speed is also great for online classes.',
    avatar: 'PR',
  },
  {
    name: 'Karthik Nair',
    occupation: 'Data Analyst at Wipro',
    rating: 4,
    text: 'Great value for money. The premium room is spacious and comfortable. Location is very convenient — close to Metro and IT hub. Would definitely recommend.',
    avatar: 'KN',
  },
  {
    name: 'Divya Krishnan',
    occupation: 'BCA Student, Bangalore University',
    rating: 5,
    text: 'The study area is quiet and well-lit — perfect for exam preparation. The meals are home-style and nutritious. Feels like staying at home!',
    avatar: 'DK',
  },
]

export const FAQS = [
  {
    question: 'Is food included in the rent?',
    answer: 'Yes! We provide 3 nutritious home-cooked meals daily — breakfast, lunch, and dinner. All meals are included in the rent at no extra charge.',
  },
  {
    question: 'Is Wi-Fi available in all rooms?',
    answer: 'Yes, high-speed broadband Wi-Fi is available throughout the PG — in all rooms, common areas, and the study area — at no extra cost.',
  },
  {
    question: 'Is the PG safe for women?',
    answer: 'Absolutely. We have 24/7 CCTV surveillance, secure entry with biometric access, and strict visitor management policies. Safety is our top priority.',
  },
  {
    question: 'What is the monthly rent?',
    answer: 'Rent starts from ₹4,500/month for triple sharing, ₹5,500 for double sharing, ₹8,500 for single rooms, and ₹12,000 for premium AC rooms. All include food and Wi-Fi.',
  },
  {
    question: 'Can I visit the PG before booking?',
    answer: 'Yes, we encourage in-person visits! Simply click "Book a Visit" on our website, fill in your details, and our team will schedule a convenient time for you.',
  },
  {
    question: 'What is the notice period for vacating?',
    answer: 'We require a 30-day written notice before vacating. The security deposit is refunded within 7 days after the room is cleared and any pending dues are settled.',
  },
  {
    question: 'What is the security deposit?',
    answer: 'The security deposit is typically 2 months\' rent and is fully refundable when you leave, subject to no damages or outstanding dues.',
  },
  {
    question: 'Are there any restrictions on timings?',
    answer: 'We have a reasonable entry/exit policy. Residents are expected to inform the management about late arrivals. Guest visits are allowed only in common areas until 9 PM.',
  },
]
