-- ============================================================
-- Sri Vinayaka PG — Row Level Security Policies
-- Run AFTER database_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_payments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: Check if current user is authenticated admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
$$;

-- ============================================================
-- ROOMS
-- Public: read active rooms
-- Admin: full CRUD
-- ============================================================
CREATE POLICY "rooms_public_read" ON public.rooms
  FOR SELECT USING (is_active = true);

CREATE POLICY "rooms_admin_all" ON public.rooms
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- FACILITIES
-- Public: read active facilities
-- Admin: full CRUD
-- ============================================================
CREATE POLICY "facilities_public_read" ON public.facilities
  FOR SELECT USING (is_active = true);

CREATE POLICY "facilities_admin_all" ON public.facilities
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- GALLERY
-- Public: read active images
-- Admin: full CRUD
-- ============================================================
CREATE POLICY "gallery_public_read" ON public.gallery
  FOR SELECT USING (is_active = true);

CREATE POLICY "gallery_admin_all" ON public.gallery
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- ENQUIRIES
-- Public: insert only (submit enquiry form)
-- Admin: full CRUD
-- ============================================================
CREATE POLICY "enquiries_public_insert" ON public.enquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "enquiries_admin_all" ON public.enquiries
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- VISITS
-- Admin only
-- ============================================================
CREATE POLICY "visits_admin_all" ON public.visits
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- RESIDENTS
-- Admin only
-- ============================================================
CREATE POLICY "residents_admin_all" ON public.residents
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- RENT PAYMENTS
-- Admin only
-- ============================================================
CREATE POLICY "rent_admin_all" ON public.rent_payments
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- NOTIFICATIONS
-- Admin only
-- ============================================================
CREATE POLICY "notifications_admin_all" ON public.notifications
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- AUDIT LOGS
-- Super admin read only
-- ============================================================
CREATE POLICY "audit_super_admin_read" ON public.audit_logs
  FOR SELECT USING (public.is_super_admin());

-- ============================================================
-- SITE SETTINGS
-- Public: read public settings
-- Super admin: full CRUD
-- ============================================================
CREATE POLICY "settings_public_read" ON public.site_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "settings_admin_all" ON public.site_settings
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- USER PROFILES
-- Self read/update
-- Super admin: full access
-- ============================================================
CREATE POLICY "profiles_self_read" ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_self_update" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_super_admin_all" ON public.user_profiles
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ============================================================
-- AUTO-CREATE user_profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'receptionist')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_user();
