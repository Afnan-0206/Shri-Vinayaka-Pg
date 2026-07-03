-- ============================================================
-- Sri Vinayaka PG — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================
-- TABLE: user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  role        text NOT NULL DEFAULT 'receptionist'
                CHECK (role IN ('super_admin', 'manager', 'receptionist')),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number   text NOT NULL UNIQUE,
  room_type     text NOT NULL CHECK (room_type IN ('single','double','triple','premium')),
  sharing_type  text NOT NULL,
  rent          numeric(10,2) NOT NULL CHECK (rent >= 0),
  deposit       numeric(10,2) NOT NULL DEFAULT 0 CHECK (deposit >= 0),
  status        text NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available','occupied','maintenance')),
  description   text,
  image_url     text,
  facilities    text[] DEFAULT '{}',
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rooms_status   ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type     ON public.rooms(room_type);

-- ============================================================
-- TABLE: facilities
-- ============================================================
CREATE TABLE IF NOT EXISTS public.facilities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  icon        text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: gallery
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text,
  image_url   text NOT NULL,
  category    text NOT NULL DEFAULT 'general',
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: enquiries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enquiries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL,
  phone         text NOT NULL,
  email         text,
  occupation    text,
  room_type     text,
  move_in_date  date,
  message       text,
  status        text NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','contacted','visit_scheduled','converted','not_interested')),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status  ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone   ON public.enquiries(phone);

-- ============================================================
-- TABLE: visits
-- ============================================================
CREATE TABLE IF NOT EXISTS public.visits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id    uuid REFERENCES public.enquiries(id) ON DELETE SET NULL,
  enquiry_name  text NOT NULL,
  phone         text NOT NULL,
  room_type     text,
  visit_date    date NOT NULL,
  visit_time    time,
  notes         text,
  status        text NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled','completed','cancelled')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visits_status     ON public.visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_date       ON public.visits(visit_date);

-- ============================================================
-- TABLE: residents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.residents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         text NOT NULL,
  phone             text NOT NULL,
  email             text,
  occupation        text,
  room_id           uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  joining_date      date NOT NULL DEFAULT CURRENT_DATE,
  monthly_rent      numeric(10,2) NOT NULL DEFAULT 0,
  deposit_paid      numeric(10,2) NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','left','notice_period')),
  notice_date       date,
  emergency_contact text,
  id_proof_type     text,
  id_proof_url      text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_residents_status  ON public.residents(status);
CREATE INDEX IF NOT EXISTS idx_residents_room    ON public.residents(room_id);

-- ============================================================
-- TABLE: rent_payments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rent_payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id   uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  month         integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year          integer NOT NULL CHECK (year >= 2020),
  amount_due    numeric(10,2) NOT NULL DEFAULT 0,
  amount_paid   numeric(10,2) NOT NULL DEFAULT 0,
  payment_date  date,
  due_date      date,
  payment_mode  text CHECK (payment_mode IN ('cash','upi','bank_transfer','card','other')),
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('paid','pending','overdue')),
  remarks       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (resident_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_rent_status    ON public.rent_payments(status);
CREATE INDEX IF NOT EXISTS idx_rent_resident  ON public.rent_payments(resident_id);
CREATE INDEX IF NOT EXISTS idx_rent_year_month ON public.rent_payments(year DESC, month DESC);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message         text NOT NULL,
  type            text NOT NULL DEFAULT 'system'
                    CHECK (type IN ('enquiry','resident','rent','visit','system')),
  reference_id    uuid,
  reference_table text,
  is_read         boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_read    ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created ON public.notifications(created_at DESC);

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action          text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  table_name      text NOT NULL,
  record_id       uuid,
  old_values      jsonb,
  new_values      jsonb,
  ip_address      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_table   ON public.audit_logs(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user    ON public.audit_logs(user_id);

-- ============================================================
-- TABLE: site_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key         text PRIMARY KEY,
  value       text,
  is_public   boolean NOT NULL DEFAULT false,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
