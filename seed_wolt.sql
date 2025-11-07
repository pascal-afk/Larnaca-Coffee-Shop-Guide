-- Update Coffee Shops with Wolt Deep Links and Delivery Info

-- Note: These are example Wolt URLs. Real URLs need to be verified with actual Wolt listings.
-- Format: https://wolt.com/en/cyp/larnaca/restaurant/[slug]

UPDATE coffee_shops SET 
    wolt_url = 'https://wolt.com/en/cyp/larnaca/restaurant/pauls-coffee-roasters',
    has_delivery = 1,
    delivery_radius_km = 3
WHERE slug = 'pauls-coffee-roasters';

UPDATE coffee_shops SET 
    wolt_url = 'https://wolt.com/en/cyp/larnaca/restaurant/to-kafe-tis-chrysanthis',
    has_delivery = 1,
    delivery_radius_km = 2
WHERE slug = 'to-kafe-tis-chrysanthis';

UPDATE coffee_shops SET 
    wolt_url = 'https://wolt.com/en/cyp/larnaca/restaurant/menta-specialty-coffee',
    has_delivery = 1,
    delivery_radius_km = 3
WHERE slug = 'menta-specialty-coffee';

UPDATE coffee_shops SET 
    wolt_url = 'https://wolt.com/en/cyp/larnaca/restaurant/mingle-cafe',
    has_delivery = 1,
    delivery_radius_km = 3
WHERE slug = 'mingle-cafe';

UPDATE coffee_shops SET 
    wolt_url = 'https://wolt.com/en/cyp/larnaca/restaurant/lazaris-bakery-bar',
    has_delivery = 1,
    delivery_radius_km = 4
WHERE slug = 'lazaris-bakery-bar';

UPDATE coffee_shops SET 
    wolt_url = 'https://wolt.com/en/cyp/larnaca/restaurant/coffee-island-larnaca',
    has_delivery = 1,
    delivery_radius_km = 5
WHERE slug = 'coffee-island';

UPDATE coffee_shops SET 
    wolt_url = 'https://wolt.com/en/cyp/larnaca/restaurant/edems-yard',
    has_delivery = 1,
    delivery_radius_km = 2
WHERE slug = 'edems-yard';

UPDATE coffee_shops SET 
    wolt_url = 'https://wolt.com/en/cyp/larnaca/restaurant/refuel-ice-cream',
    has_delivery = 1,
    delivery_radius_km = 3
WHERE slug = 'refuel-ice-cream-juicery';
