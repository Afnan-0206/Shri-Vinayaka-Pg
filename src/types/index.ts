// ============================================================
// Application-wide TypeScript types
// ============================================================

export type RoomType = 'single' | 'double' | 'triple' | 'premium'
export type RoomStatus = 'available' | 'occupied' | 'maintenance'
export type EnquiryStatus = 'new' | 'contacted' | 'visit_scheduled' | 'converted' | 'not_interested'
export type VisitStatus = 'scheduled' | 'completed' | 'cancelled'
export type ResidentStatus = 'active' | 'left' | 'notice_period'
export type RentStatus = 'paid' | 'pending' | 'overdue'
export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'other'
export type NotificationType = 'enquiry' | 'resident' | 'rent' | 'visit' | 'system'
export type UserRole = 'super_admin' | 'manager' | 'receptionist'

// ============================================================
// Database row types
// ============================================================

export interface Room {
  id: string
  room_number: string
  room_type: RoomType
  sharing_type: string
  rent: number
  deposit: number
  status: RoomStatus
  description: string | null
  image_url: string | null
  facilities: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Facility {
  id: string
  name: string
  description: string | null
  icon: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface GalleryImage {
  id: string
  title: string | null
  image_url: string
  category: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Enquiry {
  id: string
  full_name: string
  phone: string
  email: string | null
  occupation: string | null
  room_type: string | null
  move_in_date: string | null
  message: string | null
  status: EnquiryStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Visit {
  id: string
  enquiry_id: string | null
  enquiry_name: string
  phone: string
  room_type: string | null
  visit_date: string
  visit_time: string | null
  notes: string | null
  status: VisitStatus
  created_at: string
  updated_at: string
}

export interface Resident {
  id: string
  full_name: string
  phone: string
  email: string | null
  occupation: string | null
  room_id: string | null
  joining_date: string
  monthly_rent: number
  deposit_paid: number
  status: ResidentStatus
  notice_date: string | null
  emergency_contact: string | null
  id_proof_type: string | null
  id_proof_url: string | null
  created_at: string
  updated_at: string
  // joined
  room?: Room
}

export interface RentPayment {
  id: string
  resident_id: string
  month: number
  year: number
  amount_due: number
  amount_paid: number
  payment_date: string | null
  due_date: string | null
  payment_mode: PaymentMode | null
  status: RentStatus
  remarks: string | null
  created_at: string
  // joined
  resident?: Resident
}

export interface Notification {
  id: string
  message: string
  type: NotificationType
  reference_id: string | null
  reference_table: string | null
  is_read: boolean
  created_at: string
}

export interface SiteSetting {
  key: string
  value: string | null
  is_public: boolean
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// Dashboard stats type
// ============================================================
export interface DashboardStats {
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  maintenanceRooms: number
  occupancyPercent: number
  totalResidents: number
  newEnquiries: number
  scheduledVisits: number
  monthlyRevenue: number
  pendingRent: number
  overdueRent: number
  unreadNotifications: number
}

// ============================================================
// Form types
// ============================================================
export interface EnquiryFormData {
  full_name: string
  phone: string
  email: string
  occupation: string
  room_type: string
  move_in_date: string
  message: string
}

export interface RoomFormData {
  room_number: string
  room_type: RoomType
  sharing_type: string
  rent: number
  deposit: number
  status: RoomStatus
  description: string
  image_url: string
  facilities: string[]
}

export interface ResidentFormData {
  full_name: string
  phone: string
  email: string
  occupation: string
  room_id: string
  joining_date: string
  monthly_rent: number
  deposit_paid: number
  emergency_contact: string
}

export interface VisitFormData {
  enquiry_id?: string
  enquiry_name: string
  phone: string
  room_type: string
  visit_date: string
  visit_time: string
  notes: string
}
