-- Update coffee shop images with AI-generated realistic photos
-- All images are AI-generated specifically for each coffee shop based on their characteristics

-- Paul's Coffee Roasters - Specialty roasting, industrial style
UPDATE coffee_shops SET images = '[
  "https://cdn1.genspark.ai/user-upload-image/5_generated/15c79404-8f3a-4789-b3b4-5224cf1a0685.jpeg",
  "https://cdn1.genspark.ai/user-upload-image/5_generated/f230a72f-e04e-4793-b76c-349095df3c38.jpeg"
]'
WHERE slug = 'pauls-coffee-roasters';

-- To Kafe Tis Chrysanthi's - Traditional Cypriot, rustic charm
UPDATE coffee_shops SET images = '[
  "https://cdn1.genspark.ai/user-upload-image/5_generated/847acc24-8c69-40da-82d5-7fd3fd0ce7fa.jpeg",
  "https://cdn1.genspark.ai/user-upload-image/5_generated/49995bf7-426b-4ea3-baaf-34ff9ca20f9a.jpeg"
]'
WHERE slug = 'to-kafe-tis-chrysanthis';

-- Menta Speciality - Modern minimal, pour-over focus
UPDATE coffee_shops SET images = '[
  "https://cdn1.genspark.ai/user-upload-image/5_generated/9f3fcd41-7a2e-4ae4-8577-572a3ff5ddda.jpeg",
  "https://cdn1.genspark.ai/user-upload-image/5_generated/b1629a89-4622-478b-9a0b-0da8b0ba2d44.jpeg"
]'
WHERE slug = 'menta-specialty-coffee';

-- Mingle Cafe - Bright brunch spot, modern
UPDATE coffee_shops SET images = '[
  "https://cdn1.genspark.ai/user-upload-image/5_generated/4030dee2-42bb-47bb-8f3f-b4c042ab49b3.jpeg",
  "https://cdn1.genspark.ai/user-upload-image/5_generated/e810518d-7b64-47f3-b34f-e3d806a68ebf.jpeg"
]'
WHERE slug = 'mingle-cafe';

-- Lazaris Bakery Bar - Bakery + coffee, warm atmosphere
UPDATE coffee_shops SET images = '[
  "https://cdn1.genspark.ai/user-upload-image/5_generated/69b77ad6-447c-4816-b0b4-62bbbbe01bf1.jpeg",
  "https://cdn1.genspark.ai/user-upload-image/5_generated/78a96f94-f2f1-4db2-9e22-b7d96cfc0d0f.jpeg"
]'
WHERE slug = 'lazaris-bakery-bar';

-- Coffee Island - Chain, clean modern design
UPDATE coffee_shops SET images = '[
  "https://cdn1.genspark.ai/user-upload-image/5_generated/10f1dbee-20e5-411f-844c-728510aa4cc0.jpeg",
  "https://cdn1.genspark.ai/user-upload-image/5_generated/85305267-51b5-46c8-bbe9-e450c035b68f.jpeg"
]'
WHERE slug = 'coffee-island';

-- Edem's Yard - Garden cafe, outdoor focus
UPDATE coffee_shops SET images = '[
  "https://cdn1.genspark.ai/user-upload-image/5_generated/0e8b8378-589a-4ab7-a54d-0716faee47b9.jpeg",
  "https://cdn1.genspark.ai/user-upload-image/5_generated/56c0e27e-0544-445c-8307-b6dc981ff858.jpeg"
]'
WHERE slug = 'edems-yard';

-- Refuel Ice Cream Parlor - Colorful, fun atmosphere
UPDATE coffee_shops SET images = '[
  "https://cdn1.genspark.ai/user-upload-image/5_generated/048e03ed-02db-409c-a223-e03ebf04d6e3.jpeg",
  "https://cdn1.genspark.ai/user-upload-image/5_generated/c520263a-a410-4650-acab-cfb87202a405.jpeg"
]'
WHERE slug = 'refuel-ice-cream';
