-- Owner Interviews Table
CREATE TABLE IF NOT EXISTS owner_interviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,
  owner_name TEXT NOT NULL,
  owner_title TEXT NOT NULL,
  owner_photo_url TEXT,
  quote TEXT NOT NULL,
  signature_drink TEXT,
  philosophy TEXT,
  fun_fact TEXT,
  interview_date DATE,
  is_published BOOLEAN DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES coffee_shops(id) ON DELETE CASCADE
);

-- Email Notifications Log
CREATE TABLE IF NOT EXISTS email_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER,
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK(notification_type IN ('confirmation', 'reminder', 'cancellation', 'update')),
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  sent_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Booking Modifications Log
CREATE TABLE IF NOT EXISTS booking_modifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  modified_by TEXT NOT NULL CHECK(modified_by IN ('user', 'shop_owner', 'system')),
  modification_type TEXT NOT NULL CHECK(modification_type IN ('created', 'updated', 'cancelled', 'confirmed')),
  old_values TEXT, -- JSON
  new_values TEXT, -- JSON
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Shop Availability Settings
CREATE TABLE IF NOT EXISTS shop_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  is_open BOOLEAN DEFAULT 1,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  max_capacity INTEGER DEFAULT 20,
  booking_interval_minutes INTEGER DEFAULT 30,
  advance_booking_days INTEGER DEFAULT 30,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES coffee_shops(id) ON DELETE CASCADE,
  UNIQUE(shop_id, day_of_week)
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_owner_interviews_shop ON owner_interviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_owner_interviews_published ON owner_interviews(is_published);
CREATE INDEX IF NOT EXISTS idx_email_notifications_booking ON email_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_booking ON booking_modifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_shop_availability_shop ON shop_availability(shop_id);
