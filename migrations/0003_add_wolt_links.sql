-- Add Wolt integration fields
ALTER TABLE coffee_shops ADD COLUMN wolt_url TEXT;
ALTER TABLE coffee_shops ADD COLUMN has_delivery BOOLEAN DEFAULT 0;
ALTER TABLE coffee_shops ADD COLUMN delivery_radius_km INTEGER DEFAULT 3;
