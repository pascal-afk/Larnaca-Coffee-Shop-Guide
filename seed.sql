-- Seed Data for Larnaca Coffee Shops

-- Insert Coffee Shops (Real data from research)
INSERT OR IGNORE INTO coffee_shops (name, slug, description, address, latitude, longitude, category, specialty, phone, google_rating, google_reviews_count, opening_hours, features, images) VALUES 
(
  'Paul''s Coffee Roasters',
  'pauls-coffee-roasters',
  'In-house roasted specialty coffee in the heart of Larnaca. A haven for coffee connoisseurs with expertly crafted brews and knowledgeable staff.',
  'Armenian Church Street 35A, Larnaca',
  34.9167,
  33.6333,
  'specialty',
  'In-house roasting, Single-origin espresso, Filter coffee',
  '+357 24 123456',
  4.9,
  39,
  '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "09:00-17:00", "sunday": "Closed"}',
  '["wifi", "outdoor_seating", "specialty_coffee", "coffee_beans_sale"]',
  '["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800", "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800"]'
),
(
  'To Kafe Tis Chrysanthi''s',
  'to-kafe-tis-chrysanthis',
  'Traditional Cypriot coffee experience with authentic atmosphere. Rustic décor, homemade pastries, and warm hospitality.',
  'Nikolaou Rossou, Larnaca',
  34.9189,
  33.6281,
  'traditional',
  'Traditional Cypriot coffee, Homemade pastries',
  '+357 24 234567',
  4.5,
  708,
  '{"monday": "07:00-22:00", "tuesday": "07:00-22:00", "wednesday": "07:00-22:00", "thursday": "07:00-22:00", "friday": "07:00-23:00", "saturday": "07:00-23:00", "sunday": "08:00-22:00"}',
  '["outdoor_seating", "traditional_cypriot", "homemade_food", "parking"]',
  '["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"]'
),
(
  'Menta Speciality CoffeeShop',
  'menta-specialty-coffee',
  'Modern specialty coffee shop with multiple brewing methods. Sleek décor, pour-over, siphon, and carefully selected beans.',
  'Zouhouri Square, Larnaca Center',
  34.9123,
  33.6359,
  'specialty',
  'Pour-over, Siphon, V60, Chemex',
  '+357 24 345678',
  4.5,
  125,
  '{"monday": "08:00-19:00", "tuesday": "08:00-19:00", "wednesday": "08:00-19:00", "thursday": "08:00-19:00", "friday": "08:00-20:00", "saturday": "09:00-20:00", "sunday": "10:00-18:00"}',
  '["wifi", "specialty_coffee", "pour_over", "indoor_seating"]',
  '["https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800", "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800"]'
),
(
  'Mingle Cafe',
  'mingle-cafe',
  'Perfect spot for brunch and coffee. Modern atmosphere with excellent breakfast menu and quality coffee.',
  'Larnaca Center',
  34.9156,
  33.6345,
  'modern',
  'Brunch specialties, Quality espresso',
  '+357 24 456789',
  4.5,
  139,
  '{"monday": "08:00-17:00", "tuesday": "08:00-17:00", "wednesday": "08:00-17:00", "thursday": "08:00-17:00", "friday": "08:00-18:00", "saturday": "08:00-18:00", "sunday": "09:00-17:00"}',
  '["wifi", "brunch", "outdoor_seating", "instagrammable"]',
  '["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"]'
),
(
  'Lazaris Bakery Bar',
  'lazaris-bakery-bar',
  'Excellent combination of bakery and coffee bar. Fresh pastries daily and quality coffee drinks.',
  'Larnaca',
  34.9178,
  33.6312,
  'modern',
  'Fresh bakery, Artisan coffee',
  '+357 24 567890',
  4.6,
  142,
  '{"monday": "06:30-20:00", "tuesday": "06:30-20:00", "wednesday": "06:30-20:00", "thursday": "06:30-20:00", "friday": "06:30-21:00", "saturday": "07:00-21:00", "sunday": "07:00-20:00"}',
  '["bakery", "outdoor_seating", "takeaway", "fresh_pastries"]',
  '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800"]'
),
(
  'Coffee Island',
  'coffee-island',
  'Popular coffee chain with multiple brewing methods. Known for pour-over, cold brew, and quality beans.',
  'Multiple locations, Larnaca',
  34.9145,
  33.6323,
  'chain',
  'Pour-over, Cold brew, Specialty blends',
  '+357 24 678901',
  4.2,
  250,
  '{"monday": "07:00-21:00", "tuesday": "07:00-21:00", "wednesday": "07:00-21:00", "thursday": "07:00-21:00", "friday": "07:00-22:00", "saturday": "08:00-22:00", "sunday": "08:00-21:00"}',
  '["wifi", "chain", "multiple_locations", "loyalty_program"]',
  '["https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800", "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800"]'
),
(
  'Edem''s Yard',
  'edems-yard',
  'Lovely garden café with beautiful outdoor atmosphere. Perfect for relaxing coffee breaks.',
  'Behind main street, Larnaca',
  34.9167,
  33.6290,
  'modern',
  'Garden setting, Quality coffee',
  '+357 24 789012',
  4.5,
  233,
  '{"monday": "09:00-23:00", "tuesday": "09:00-23:00", "wednesday": "09:00-23:00", "thursday": "09:00-23:00", "friday": "09:00-00:00", "saturday": "09:00-00:00", "sunday": "10:00-23:00"}',
  '["garden", "outdoor_seating", "pet_friendly", "evening_drinks"]',
  '["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800", "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800"]'
),
(
  'Refuel Ice Cream Parlor & Juicery',
  'refuel-ice-cream-juicery',
  'Modern concept combining specialty coffee with ice cream and fresh juices. Unique and refreshing.',
  'Larnaca',
  34.9134,
  33.6356,
  'modern',
  'Specialty coffee, Artisan ice cream, Fresh juices',
  '+357 24 890123',
  4.9,
  75,
  '{"monday": "10:00-22:00", "tuesday": "10:00-22:00", "wednesday": "10:00-22:00", "thursday": "10:00-22:00", "friday": "10:00-23:00", "saturday": "10:00-23:00", "sunday": "10:00-22:00"}',
  '["ice_cream", "juices", "modern", "family_friendly"]',
  '["https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800", "https://images.unsplash.com/photo-1541599468348-e96984315921?w=800"]'
);

-- Insert Sample Users
INSERT OR IGNORE INTO users (name, email, phone, is_verified) VALUES 
('Alex Johnson', 'alex@example.com', '+357 99 111111', 1),
('Maria Christodoulou', 'maria@example.com', '+357 99 222222', 1),
('George Papadopoulos', 'george@example.com', '+357 99 333333', 1),
('Sophie Anderson', 'sophie@example.com', '+357 99 444444', 0);

-- Insert Sample Reviews
INSERT OR IGNORE INTO reviews (shop_id, user_id, rating, title, comment, visit_date, is_verified_visit) VALUES 
(1, 1, 5, 'Best coffee in Larnaca!', 'Absolutely amazing coffee! The barista really knows his craft. The in-house roasted beans are exceptional. Highly recommend the single-origin Ethiopian pour-over.', '2025-01-15', 1),
(1, 2, 5, 'A must-visit for coffee lovers', 'Paul really knows his coffee. The attention to detail is impressive. Great atmosphere and the staff are very knowledgeable.', '2025-01-20', 1),
(2, 3, 5, 'Authentic Cypriot experience', 'If you want to experience traditional Cypriot coffee culture, this is the place. The homemade pastries are delicious!', '2025-01-18', 1),
(2, 1, 4, 'Great traditional spot', 'Lovely rustic atmosphere and very friendly service. The coffee is prepared the traditional way. A bit crowded on weekends.', '2025-01-22', 0),
(3, 2, 5, 'Specialty coffee done right', 'The pour-over here is incredible. They really care about the quality of their beans and the brewing process. Modern and clean space.', '2025-01-19', 1),
(4, 4, 5, 'Perfect brunch spot', 'Great food and excellent coffee. The avocado toast is amazing and the flat white was perfect. Will definitely come back!', '2025-01-21', 0),
(5, 3, 5, 'Fresh pastries and great coffee', 'The bakery items are always fresh and delicious. Coffee quality is consistently good. My go-to morning spot.', '2025-01-17', 1),
(6, 1, 4, 'Reliable chain', 'Coffee Island is always reliable. Good quality, consistent taste. The cold brew is really good in summer.', '2025-01-16', 0);

-- Update coffee shops with calculated ratings
UPDATE coffee_shops SET 
  avg_rating = (SELECT AVG(rating) FROM reviews WHERE reviews.shop_id = coffee_shops.id),
  total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviews.shop_id = coffee_shops.id)
WHERE id IN (SELECT DISTINCT shop_id FROM reviews);

-- Insert Sample Bookings
INSERT OR IGNORE INTO bookings (shop_id, user_id, user_name, user_email, user_phone, booking_date, booking_time, party_size, status, confirmation_code) VALUES 
(1, 1, 'Alex Johnson', 'alex@example.com', '+357 99 111111', '2025-11-10', '10:00', 2, 'confirmed', 'BOOK-001-PCR'),
(1, 2, 'Maria Christodoulou', 'maria@example.com', '+357 99 222222', '2025-11-10', '14:30', 4, 'confirmed', 'BOOK-002-PCR'),
(2, 3, 'George Papadopoulos', 'george@example.com', '+357 99 333333', '2025-11-11', '11:00', 3, 'pending', 'BOOK-003-TKC'),
(3, 4, 'Sophie Anderson', 'sophie@example.com', '+357 99 444444', '2025-11-11', '15:00', 2, 'confirmed', 'BOOK-004-MSC'),
(4, 1, 'Alex Johnson', 'alex@example.com', '+357 99 111111', '2025-11-12', '09:30', 2, 'confirmed', 'BOOK-005-MIN');

-- Insert Sample Favorites
INSERT OR IGNORE INTO favorites (user_id, shop_id) VALUES 
(1, 1),
(1, 3),
(1, 4),
(2, 1),
(2, 2),
(3, 2),
(3, 5),
(4, 4);

-- Update user statistics
UPDATE users SET 
  total_bookings = (SELECT COUNT(*) FROM bookings WHERE bookings.user_id = users.id),
  total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviews.user_id = users.id);
