-- ============================================================
-- Sri Vinayaka PG — Seed Data
-- Run AFTER all schema, rls, and trigger files
-- ============================================================

-- ============================================================
-- SITE SETTINGS
-- ============================================================
INSERT INTO public.site_settings (key, value, is_public) VALUES
  ('pg_name',         'Sri Vinayaka PG',                              true),
  ('tagline',         'Safe, Clean & Affordable PG Accommodation',   true),
  ('phone',           '+91 98765 43210',                              true),
  ('whatsapp',        '+919876543210',                                true),
  ('email',           'info@srivinayakapg.com',                       true),
  ('address',         '123, 5th Cross, Koramangala 4th Block, Bengaluru, Karnataka - 560034', true),
  ('maps_url',        'https://maps.google.com/?q=Koramangala,Bengaluru', true),
  ('instagram_url',   '',                                             true),
  ('facebook_url',    '',                                             true),
  ('twitter_url',     '',                                             true),
  ('notice_period_days', '30',                                        false),
  ('rent_due_day',    '5',                                            false)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- FACILITIES
-- ============================================================
INSERT INTO public.facilities (name, description, icon, is_active, sort_order) VALUES
  ('Home-cooked Food',     '3 meals per day — breakfast, lunch & dinner',   'UtensilsCrossed', true, 1),
  ('High-Speed Wi-Fi',     'Unlimited internet access in all rooms',         'Wifi',            true, 2),
  ('24/7 Hot Water',       'Instant hot water in all bathrooms',             'Droplets',        true, 3),
  ('Washing Machine',      'Common washing machines available 24/7',         'Wind',            true, 4),
  ('CCTV Security',        '24/7 CCTV surveillance for complete safety',     'Shield',          true, 5),
  ('Housekeeping',         'Daily room cleaning and common area maintenance','Sparkles',        true, 6),
  ('Drinking Water',       'RO purified drinking water available always',    'GlassWater',      true, 7),
  ('Power Backup',         'Full power backup with UPS and generator',       'Zap',             true, 8),
  ('Parking',              'Free two-wheeler parking available',             'ParkingSquare',   true, 9),
  ('Study Area',           'Dedicated quiet study area with good lighting',  'BookOpen',        true, 10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROOMS
-- ============================================================
INSERT INTO public.rooms (room_number, room_type, sharing_type, rent, deposit, status, description, image_url, facilities) VALUES
  ('101', 'single',  'Single Sharing',  8500, 17000, 'available',
   'Spacious single-occupancy room with attached bathroom, study table, and wardrobe.',
   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
   ARRAY['Wi-Fi', 'Food', 'Hot Water', 'CCTV', 'Housekeeping', 'Power Backup']),

  ('102', 'single',  'Single Sharing',  8500, 17000, 'occupied',
   'Comfortable single room with garden view, air circulation, and personal storage.',
   'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
   ARRAY['Wi-Fi', 'Food', 'Hot Water', 'CCTV', 'Housekeeping']),

  ('201', 'double',  'Two Sharing',     5500, 11000, 'available',
   'Well-furnished double sharing room with bunk beds, fans, and ample storage space.',
   'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
   ARRAY['Wi-Fi', 'Food', 'Hot Water', 'CCTV', 'Housekeeping', 'Study Area']),

  ('202', 'double',  'Two Sharing',     5500, 11000, 'occupied',
   'Bright double room with natural light, two study tables, and wardrobe for each.',
   'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=800&q=80',
   ARRAY['Wi-Fi', 'Food', 'Hot Water', 'CCTV']),

  ('301', 'triple',  'Three Sharing',   4500,  9000, 'available',
   'Budget-friendly triple sharing room, ideal for students. Includes all basic amenities.',
   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
   ARRAY['Wi-Fi', 'Food', 'Hot Water', 'CCTV', 'Study Area']),

  ('302', 'triple',  'Three Sharing',   4500,  9000, 'maintenance',
   'Currently under renovation. Will be available soon with upgraded furnishings.',
   'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
   ARRAY['Wi-Fi', 'Food', 'Hot Water']),

  ('401', 'premium', 'Premium Room',   12000, 24000, 'available',
   'Luxury AC premium room with attached bathroom, study table, sofa, and TV point.',
   'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=80',
   ARRAY['Wi-Fi', 'Food', 'Hot Water', 'AC', 'CCTV', 'Housekeeping', 'Power Backup', 'Parking']),

  ('402', 'premium', 'Premium Room',   12000, 24000, 'occupied',
   'Spacious premium suite with premium furniture, large windows, and private feel.',
   'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
   ARRAY['Wi-Fi', 'Food', 'Hot Water', 'AC', 'CCTV', 'Housekeeping', 'Power Backup'])
ON CONFLICT DO NOTHING;

-- ============================================================
-- GALLERY
-- ============================================================
INSERT INTO public.gallery (title, image_url, category, is_active, sort_order) VALUES
  ('Building Entrance',     'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', 'building',  true, 1),
  ('Common Living Area',    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 'common',    true, 2),
  ('Dining Area',           'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 'dining',    true, 3),
  ('Single Room Interior',  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80','rooms',   true, 4),
  ('Double Sharing Room',   'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80','rooms',   true, 5),
  ('Premium Room',          'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=80','rooms',   true, 6),
  ('Kitchen',               'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', 'kitchen',  true, 7),
  ('Study Area',            'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80','study',   true, 8),
  ('Terrace View',          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', 'building', true, 9),
  ('Bathroom',              'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80', 'rooms',    true, 10),
  ('Washing Area',          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80','common',  true, 11),
  ('Parking Area',          'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=800&q=80', 'building', true, 12)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE ENQUIRIES
-- ============================================================
INSERT INTO public.enquiries (full_name, phone, email, occupation, room_type, move_in_date, message, status) VALUES
  ('Rahul Sharma',  '9876543210', 'rahul@email.com',  'Software Engineer', 'single',  '2024-02-01', 'Looking for a single room near Koramangala.', 'new'),
  ('Priya Nair',    '9765432109', 'priya@email.com',  'Student',           'double',  '2024-02-05', 'Need a double sharing room. Budget is around 5500.', 'contacted'),
  ('Amit Kumar',    '9654321098', 'amit@email.com',   'Data Analyst',      'premium', '2024-02-10', 'Interested in the premium room with AC.', 'visit_scheduled'),
  ('Sneha Reddy',   '9543210987', 'sneha@email.com',  'Student',           'triple',  '2024-02-15', 'Budget friendly triple room for 3 months.', 'converted'),
  ('Vikram Singh',  '9432109876', 'vikram@email.com', 'BPO Professional',  'double',  '2024-02-20', 'Night shift job. Need quiet room with good Wi-Fi.', 'new')
ON CONFLICT DO NOTHING;
