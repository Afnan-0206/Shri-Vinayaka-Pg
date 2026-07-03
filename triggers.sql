-- ============================================================
-- Sri Vinayaka PG — SQL Triggers & Functions
-- Run AFTER database_schema.sql
-- ============================================================

-- ============================================================
-- FUNCTION: Auto-create notification on new enquiry
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_enquiry_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (message, type, reference_id, reference_table)
  VALUES (
    'New enquiry received from ' || NEW.full_name || ' (' || NEW.phone || ')',
    'enquiry',
    NEW.id,
    'enquiries'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_enquiry_notification
  AFTER INSERT ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.fn_enquiry_notification();

-- ============================================================
-- FUNCTION: Auto-update room status when resident assigned
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_update_room_on_resident_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- If a room is newly assigned or changed, mark it occupied
  IF NEW.room_id IS NOT NULL AND (OLD.room_id IS DISTINCT FROM NEW.room_id OR TG_OP = 'INSERT') THEN
    UPDATE public.rooms SET status = 'occupied', updated_at = now()
    WHERE id = NEW.room_id;
  END IF;

  -- If previous room is released (resident left or room changed), mark it available
  IF TG_OP = 'UPDATE' AND OLD.room_id IS NOT NULL AND OLD.room_id IS DISTINCT FROM NEW.room_id THEN
    -- Only set available if no other active resident is in that room
    IF NOT EXISTS (
      SELECT 1 FROM public.residents
      WHERE room_id = OLD.room_id AND status = 'active' AND id != NEW.id
    ) THEN
      UPDATE public.rooms SET status = 'available', updated_at = now()
      WHERE id = OLD.room_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_resident_room_update
  AFTER INSERT OR UPDATE OF room_id, status ON public.residents
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_room_on_resident_change();

-- ============================================================
-- FUNCTION: Auto-release room when resident leaves
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_resident_left_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'left' AND OLD.status != 'left' THEN
    INSERT INTO public.notifications (message, type, reference_id, reference_table)
    VALUES (
      'Resident ' || NEW.full_name || ' has left the PG.',
      'resident',
      NEW.id,
      'residents'
    );
  END IF;

  IF NEW.status = 'notice_period' AND OLD.status != 'notice_period' THEN
    INSERT INTO public.notifications (message, type, reference_id, reference_table)
    VALUES (
      'Resident ' || NEW.full_name || ' is in notice period.',
      'resident',
      NEW.id,
      'residents'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_resident_left
  AFTER UPDATE OF status ON public.residents
  FOR EACH ROW EXECUTE FUNCTION public.fn_resident_left_notification();

-- ============================================================
-- FUNCTION: Auto-create first month rent when resident is added
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_create_initial_rent()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_month integer;
  v_year  integer;
  v_due   date;
BEGIN
  v_month := EXTRACT(MONTH FROM NEW.joining_date)::integer;
  v_year  := EXTRACT(YEAR FROM NEW.joining_date)::integer;
  v_due   := (v_year || '-' || LPAD(v_month::text, 2, '0') || '-05')::date;

  INSERT INTO public.rent_payments (resident_id, month, year, amount_due, due_date, status)
  VALUES (NEW.id, v_month, v_year, NEW.monthly_rent, v_due, 'pending')
  ON CONFLICT (resident_id, month, year) DO NOTHING;

  INSERT INTO public.notifications (message, type, reference_id, reference_table)
  VALUES (
    'New resident ' || NEW.full_name || ' added. Rent record created for ' ||
    TO_CHAR(NEW.joining_date, 'Month YYYY') || '.',
    'resident',
    NEW.id,
    'residents'
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_create_initial_rent
  AFTER INSERT ON public.residents
  FOR EACH ROW EXECUTE FUNCTION public.fn_create_initial_rent();

-- ============================================================
-- FUNCTION: Notification when rent is marked paid
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_rent_paid_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_resident_name text;
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    SELECT full_name INTO v_resident_name FROM public.residents WHERE id = NEW.resident_id;
    INSERT INTO public.notifications (message, type, reference_id, reference_table)
    VALUES (
      v_resident_name || ' paid rent for ' ||
      TO_CHAR(make_date(NEW.year, NEW.month, 1), 'Month YYYY') || '.',
      'rent',
      NEW.id,
      'rent_payments'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_rent_paid
  AFTER UPDATE OF status ON public.rent_payments
  FOR EACH ROW EXECUTE FUNCTION public.fn_rent_paid_notification();

-- ============================================================
-- FUNCTION: Auto-mark overdue rent
-- Run via pg_cron: '0 1 * * *' (daily at 1am)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_mark_overdue_rent()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.rent_payments
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$;

-- ============================================================
-- FUNCTION: Auto-generate next month rent for all active residents
-- Run via pg_cron: '0 0 1 * *' (1st of every month)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_generate_monthly_rent()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_month integer := EXTRACT(MONTH FROM CURRENT_DATE)::integer;
  v_year  integer := EXTRACT(YEAR FROM CURRENT_DATE)::integer;
  v_due   date    := (v_year || '-' || LPAD(v_month::text, 2, '0') || '-05')::date;
  r       record;
BEGIN
  FOR r IN
    SELECT id, monthly_rent FROM public.residents WHERE status = 'active'
  LOOP
    INSERT INTO public.rent_payments (resident_id, month, year, amount_due, due_date, status)
    VALUES (r.id, v_month, v_year, r.monthly_rent, v_due, 'pending')
    ON CONFLICT (resident_id, month, year) DO NOTHING;
  END LOOP;
END;
$$;

-- ============================================================
-- FUNCTION: auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_residents_updated_at
  BEFORE UPDATE ON public.residents
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE OR REPLACE TRIGGER trg_visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- ============================================================
-- Schedule cron jobs (requires pg_cron extension)
-- ============================================================
-- SELECT cron.schedule('mark-overdue-rent', '0 1 * * *', 'SELECT public.fn_mark_overdue_rent()');
-- SELECT cron.schedule('generate-monthly-rent', '0 0 1 * *', 'SELECT public.fn_generate_monthly_rent()');
