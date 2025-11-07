-- Seed Owner Interviews

INSERT OR IGNORE INTO owner_interviews (shop_id, owner_name, owner_title, owner_photo_url, quote, signature_drink, philosophy, fun_fact, interview_date, is_published, display_order) VALUES 
(
  1, -- Paul's Coffee Roasters
  'Paul Georgiou',
  'Owner & Head Roaster',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  'For me, coffee is more than a drink—it''s a craft. Every bean tells a story of its origin, and I want our customers to taste that journey in every cup. We roast in-house because freshness makes all the difference.',
  'Ethiopian Single-Origin Pour-Over',
  'Quality over quantity. Every cup we serve must meet our high standards. We believe in transparency—from bean sourcing to the final brew, our customers deserve to know what they''re drinking.',
  'I started roasting coffee in my garage 8 years ago. My wife thought I was crazy, but now we serve over 500 customers a week!',
  '2025-01-15',
  1,
  1
),
(
  2, -- To Kafe Tis Chrysanthi's
  'Chrysanthi Papadopoulos',
  'Owner & Traditional Coffee Master',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
  'We''ve been serving traditional Cypriot coffee for three generations. My grandmother taught me that coffee is about community—bringing people together, sharing stories, and creating memories.',
  'Traditional Cypriot Coffee with Loukoumades',
  'Tradition meets hospitality. Every customer is family, and every cup is made with love and respect for our heritage.',
  'Our original coffee pot has been in the family for over 60 years and we still use it today!',
  '2025-01-18',
  1,
  2
),
(
  3, -- Menta Speciality CoffeeShop
  'Andreas Michaelides',
  'Owner & Specialty Coffee Expert',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
  'Specialty coffee is about precision and experimentation. We treat each brewing method as a science and an art form.',
  'V60 Pour-Over with Kenyan AA Beans',
  'Innovation in every cup. We''re always exploring new brewing techniques and rare coffee varieties.',
  'I spent 2 years traveling to coffee farms around the world before opening Menta.',
  '2025-02-01',
  1,
  3
),
(
  4, -- Mingle Cafe
  'Sofia Constantinou',
  'Owner & Creative Director',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
  'Great coffee should come with great food and a welcoming atmosphere. We created Mingle as a space where people can work, relax, and connect.',
  'Signature Flat White with Cinnamon',
  'Community first. We''re more than a cafe—we''re a gathering space for creatives, entrepreneurs, and coffee lovers.',
  'We host open mic nights every Thursday and local art exhibitions monthly!',
  '2025-02-05',
  1,
  4
);

-- Seed default shop availability (Monday-Sunday, 8:00-18:00 for all shops)
INSERT OR IGNORE INTO shop_availability (shop_id, day_of_week, is_open, open_time, close_time, max_capacity) VALUES 
-- Paul's Coffee Roasters
(1, 1, 1, '08:00', '18:00', 25), -- Monday
(1, 2, 1, '08:00', '18:00', 25), -- Tuesday
(1, 3, 1, '08:00', '18:00', 25), -- Wednesday
(1, 4, 1, '08:00', '18:00', 25), -- Thursday
(1, 5, 1, '08:00', '18:00', 25), -- Friday
(1, 6, 1, '09:00', '17:00', 20), -- Saturday
(1, 0, 0, '09:00', '14:00', 0),  -- Sunday (Closed)

-- To Kafe Tis Chrysanthi's
(2, 1, 1, '07:00', '22:00', 35), -- Monday
(2, 2, 1, '07:00', '22:00', 35), -- Tuesday
(2, 3, 1, '07:00', '22:00', 35), -- Wednesday
(2, 4, 1, '07:00', '22:00', 35), -- Thursday
(2, 5, 1, '07:00', '23:00', 35), -- Friday
(2, 6, 1, '07:00', '23:00', 35), -- Saturday
(2, 0, 1, '08:00', '22:00', 30), -- Sunday

-- Menta Speciality CoffeeShop
(3, 1, 1, '08:00', '19:00', 20), -- Monday
(3, 2, 1, '08:00', '19:00', 20), -- Tuesday
(3, 3, 1, '08:00', '19:00', 20), -- Wednesday
(3, 4, 1, '08:00', '19:00', 20), -- Thursday
(3, 5, 1, '08:00', '20:00', 20), -- Friday
(3, 6, 1, '09:00', '20:00', 20), -- Saturday
(3, 0, 1, '10:00', '18:00', 15), -- Sunday

-- Mingle Cafe
(4, 1, 1, '08:00', '17:00', 30), -- Monday
(4, 2, 1, '08:00', '17:00', 30), -- Tuesday
(4, 3, 1, '08:00', '17:00', 30), -- Wednesday
(4, 4, 1, '08:00', '17:00', 30), -- Thursday
(4, 5, 1, '08:00', '18:00', 30), -- Friday
(4, 6, 1, '08:00', '18:00', 30), -- Saturday
(4, 0, 1, '09:00', '17:00', 25); -- Sunday
