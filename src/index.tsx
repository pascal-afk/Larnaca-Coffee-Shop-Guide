import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// ============================================
// API ROUTES - Coffee Shops
// ============================================

// Get all coffee shops
app.get('/api/shops', async (c) => {
  try {
    const { category, sort } = c.req.query()
    
    let query = 'SELECT * FROM coffee_shops WHERE is_active = 1'
    const params: any[] = []
    
    if (category && category !== 'all') {
      query += ' AND category = ?'
      params.push(category)
    }
    
    // Sort options
    if (sort === 'rating') {
      query += ' ORDER BY avg_rating DESC, total_reviews DESC'
    } else if (sort === 'reviews') {
      query += ' ORDER BY total_reviews DESC'
    } else {
      query += ' ORDER BY name ASC'
    }
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    
    return c.json({
      success: true,
      data: results,
      count: results.length
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get single coffee shop by slug
app.get('/api/shops/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')
    
    const shop = await c.env.DB.prepare(
      'SELECT * FROM coffee_shops WHERE slug = ? AND is_active = 1'
    ).bind(slug).first()
    
    if (!shop) {
      return c.json({ success: false, error: 'Coffee shop not found' }, 404)
    }
    
    // Get reviews for this shop
    const { results: reviews } = await c.env.DB.prepare(`
      SELECT r.*, u.name as user_name, u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.shop_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `).bind(shop.id).all()
    
    return c.json({
      success: true,
      data: {
        ...shop,
        reviews
      }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ============================================
// API ROUTES - Bookings
// ============================================

// Get available time slots for a shop on a specific date
app.get('/api/bookings/availability/:shopId', async (c) => {
  try {
    const shopId = c.req.param('shopId')
    const { date } = c.req.query()
    
    if (!date) {
      return c.json({ success: false, error: 'Date is required' }, 400)
    }
    
    // Get existing bookings for this date
    const { results: bookings } = await c.env.DB.prepare(
      `SELECT booking_time, party_size FROM bookings 
       WHERE shop_id = ? AND booking_date = ? AND status != 'cancelled'`
    ).bind(shopId, date).all()
    
    // Generate time slots (8:00 - 18:00, every 30 minutes)
    const slots = []
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Check if slot is taken (simple logic - max 20 people per slot)
        const bookedCount = bookings
          .filter((b: any) => b.booking_time === time)
          .reduce((sum: number, b: any) => sum + b.party_size, 0)
        
        slots.push({
          time,
          available: bookedCount < 20,
          remaining: Math.max(0, 20 - bookedCount)
        })
      }
    }
    
    return c.json({ success: true, data: slots })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Create a booking
app.post('/api/bookings', async (c) => {
  try {
    const body = await c.req.json()
    const { shopId, userName, userEmail, userPhone, date, time, partySize, specialRequests } = body
    
    // Validation
    if (!shopId || !userName || !userEmail || !userPhone || !date || !time || !partySize) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    // Generate confirmation code
    const confirmationCode = `BOOK-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`
    
    // Create user if doesn't exist (guest booking)
    let userId = 1 // Default guest user
    
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(userEmail).first()
    
    if (!existingUser) {
      const userResult = await c.env.DB.prepare(
        'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)'
      ).bind(userName, userEmail, userPhone).run()
      userId = userResult.meta.last_row_id as number
    } else {
      userId = existingUser.id as number
    }
    
    // Insert booking
    const result = await c.env.DB.prepare(`
      INSERT INTO bookings (shop_id, user_id, user_name, user_email, user_phone, 
                           booking_date, booking_time, party_size, status, 
                           confirmation_code, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)
    `).bind(
      shopId, userId, userName, userEmail, userPhone,
      date, time, partySize, confirmationCode, specialRequests || null
    ).run()
    
    return c.json({
      success: true,
      data: {
        bookingId: result.meta.last_row_id,
        confirmationCode,
        status: 'confirmed'
      }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get booking by confirmation code
app.get('/api/bookings/:confirmationCode', async (c) => {
  try {
    const confirmationCode = c.req.param('confirmationCode')
    
    const booking = await c.env.DB.prepare(`
      SELECT b.*, s.name as shop_name, s.address, s.phone as shop_phone
      FROM bookings b
      JOIN coffee_shops s ON b.shop_id = s.id
      WHERE b.confirmation_code = ?
    `).bind(confirmationCode).first()
    
    if (!booking) {
      return c.json({ success: false, error: 'Booking not found' }, 404)
    }
    
    return c.json({ success: true, data: booking })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Cancel booking
app.delete('/api/bookings/:confirmationCode', async (c) => {
  try {
    const confirmationCode = c.req.param('confirmationCode')
    
    const result = await c.env.DB.prepare(
      'UPDATE bookings SET status = \'cancelled\' WHERE confirmation_code = ?'
    ).bind(confirmationCode).run()
    
    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Booking not found' }, 404)
    }
    
    return c.json({ success: true, message: 'Booking cancelled successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ============================================
// API ROUTES - Reviews
// ============================================

// Get reviews for a shop
app.get('/api/reviews/:shopId', async (c) => {
  try {
    const shopId = c.req.param('shopId')
    const { limit = '10', offset = '0' } = c.req.query()
    
    const { results: reviews } = await c.env.DB.prepare(`
      SELECT r.*, u.name as user_name, u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.shop_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(shopId, parseInt(limit), parseInt(offset)).all()
    
    return c.json({ success: true, data: reviews })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Create a review
app.post('/api/reviews', async (c) => {
  try {
    const body = await c.req.json()
    const { shopId, userId, rating, title, comment, visitDate } = body
    
    if (!shopId || !userId || !rating || !comment) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    if (rating < 1 || rating > 5) {
      return c.json({ success: false, error: 'Rating must be between 1 and 5' }, 400)
    }
    
    // Insert review
    const result = await c.env.DB.prepare(`
      INSERT INTO reviews (shop_id, user_id, rating, title, comment, visit_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(shopId, userId, rating, title || null, comment, visitDate || null).run()
    
    // Update shop's average rating
    await c.env.DB.prepare(`
      UPDATE coffee_shops SET 
        avg_rating = (SELECT AVG(rating) FROM reviews WHERE shop_id = ?),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE shop_id = ?)
      WHERE id = ?
    `).bind(shopId, shopId, shopId).run()
    
    return c.json({
      success: true,
      data: { reviewId: result.meta.last_row_id }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ============================================
// API ROUTES - User Dashboard
// ============================================

// Get user bookings by email
app.get('/api/user/bookings', async (c) => {
  try {
    const { email } = c.req.query()
    
    if (!email) {
      return c.json({ success: false, error: 'Email is required' }, 400)
    }
    
    const { results: bookings } = await c.env.DB.prepare(`
      SELECT b.*, s.name as shop_name, s.address, s.phone as shop_phone, s.slug
      FROM bookings b
      JOIN coffee_shops s ON b.shop_id = s.id
      WHERE b.user_email = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `).bind(email).all()
    
    return c.json({ success: true, data: bookings })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ============================================
// API ROUTES - Owner Interviews
// ============================================

// Get all published interviews
app.get('/api/interviews', async (c) => {
  try {
    const { results: interviews } = await c.env.DB.prepare(`
      SELECT i.*, s.name as shop_name, s.slug as shop_slug
      FROM owner_interviews i
      JOIN coffee_shops s ON i.shop_id = s.id
      WHERE i.is_published = 1
      ORDER BY i.display_order ASC
    `).all()
    
    return c.json({ success: true, data: interviews })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ============================================
// MAIN PAGE - HTML
// ============================================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>☕ Larnaca Coffee Guide - Discover & Book Best Coffee Shops</title>
        <meta name="description" content="Discover and book the best coffee shops in Larnaca, Cyprus. Browse specialty cafes, read reviews, and make instant reservations.">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
            .hero-gradient { background: linear-gradient(135deg, #3E2723 0%, #5D4037 100%); }
            .card-hover { transition: all 0.3s ease; }
            .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
            .rating-star { color: #FF6F00; }
            #mapContainer { height: 500px; width: 100%; border-radius: 12px; }
            
            /* Trading Card Styles */
            .trading-card {
                min-width: 320px;
                max-width: 320px;
                height: 480px;
                background: white;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                cursor: pointer;
                position: relative;
                scroll-snap-align: center;
            }
            
            .trading-card:hover {
                transform: translateY(-12px) scale(1.02);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
            }
            
            .trading-card-image {
                width: 100%;
                height: 280px;
                object-fit: cover;
                position: relative;
            }
            
            .trading-card-rank {
                position: absolute;
                top: 16px;
                left: 16px;
                background: linear-gradient(135deg, #FF6F00 0%, #FF8F00 100%);
                color: white;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(255, 111, 0, 0.4);
            }
            
            .trading-card-badge {
                position: absolute;
                top: 16px;
                right: 16px;
                background: rgba(255, 255, 255, 0.95);
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            
            .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-mug-hot text-3xl" style="color: #3E2723"></i>
                        <h1 class="text-2xl font-bold" style="color: #3E2723">Larnaca Coffee Guide</h1>
                    </div>
                    <nav class="hidden md:flex space-x-6">
                        <a href="#discover" class="text-gray-700 hover:text-orange-600 font-medium">Discover</a>
                        <a href="#map" class="text-gray-700 hover:text-orange-600 font-medium">Map</a>
                        <a href="/my-bookings" class="text-gray-700 hover:text-orange-600 font-medium">My Bookings</a>
                    </nav>
                    <button class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                        <i class="fas fa-user mr-2"></i>Sign In
                    </button>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <section class="hero-gradient text-white py-20">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <h2 class="text-5xl font-bold mb-4">Entdecke Larnacas Beste Coffee Spots</h2>
                <p class="text-xl mb-8 text-gray-200">Tisch buchen, Favoriten bewerten, Specialty Coffee Kultur erleben</p>
                <div class="flex justify-center gap-4">
                    <a href="#map" class="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold text-lg">
                        <i class="fas fa-map-marked-alt mr-2"></i>Explore Map
                    </a>
                    <a href="#discover" class="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg">
                        Browse All Cafes
                    </a>
                </div>
                
                <!-- Search Bar -->
                <div class="mt-10 max-w-2xl mx-auto">
                    <div class="bg-white rounded-full shadow-lg p-2 flex items-center">
                        <i class="fas fa-search text-gray-400 ml-4"></i>
                        <input type="text" id="searchInput" placeholder="Suche nach Coffee Shops, Specialty Coffee, Atmosphäre..." 
                               class="flex-1 px-4 py-2 text-gray-900 outline-none">
                        <select id="categoryFilter" class="px-4 py-2 text-gray-900 border-l outline-none">
                            <option value="all">Alle Kategorien</option>
                            <option value="specialty">Specialty</option>
                            <option value="traditional">Traditional</option>
                            <option value="modern">Modern</option>
                            <option value="chain">Chain</option>
                        </select>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features -->
        <section class="py-8 bg-white border-b">
            <div class="max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                    <div>
                        <i class="fas fa-star text-3xl text-orange-600 mb-2"></i>
                        <p class="font-semibold text-gray-700">Top Rated</p>
                    </div>
                    <div>
                        <i class="fas fa-map-marker-alt text-3xl text-orange-600 mb-2"></i>
                        <p class="font-semibold text-gray-700">Map View</p>
                    </div>
                    <div>
                        <i class="fas fa-calendar-check text-3xl text-orange-600 mb-2"></i>
                        <p class="font-semibold text-gray-700">Easy Booking</p>
                    </div>
                    <div>
                        <i class="fas fa-trophy text-3xl text-orange-600 mb-2"></i>
                        <p class="font-semibold text-gray-700">Verified Reviews</p>
                    </div>
                    <div>
                        <i class="fas fa-coffee text-3xl text-orange-600 mb-2"></i>
                        <p class="font-semibold text-gray-700">Specialty Focus</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Top 10 Trading Cards Section -->
        <section class="py-16 bg-gradient-to-b from-white to-gray-50">
            <div class="max-w-7xl mx-auto px-4">
                <div class="text-center mb-12">
                    <h2 class="text-4xl font-bold text-gray-900 mb-2">Top 10 Coffee Spots</h2>
                    <p class="text-xl text-gray-600">Scroll through Larnaca's finest coffee experiences</p>
                </div>
                
                <div class="relative">
                    <!-- Scroll Container -->
                    <div id="top10Container" class="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide" style="scroll-behavior: smooth;">
                        <!-- Cards will be loaded here via JavaScript -->
                    </div>
                    
                    <!-- Navigation Arrows -->
                    <button onclick="scrollTop10('left')" class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-xl rounded-full p-4 hover:bg-gray-100 z-10">
                        <i class="fas fa-chevron-left text-2xl text-gray-800"></i>
                    </button>
                    <button onclick="scrollTop10('right')" class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-xl rounded-full p-4 hover:bg-gray-100 z-10">
                        <i class="fas fa-chevron-right text-2xl text-gray-800"></i>
                    </button>
                </div>
            </div>
        </section>

        <!-- Coffee Shops Grid -->
        <section id="discover" class="py-16">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-900">Featured Coffee Shops</h2>
                    <select id="sortFilter" class="px-4 py-2 border rounded-lg">
                        <option value="name">Sortieren: Name</option>
                        <option value="rating">Sortieren: Bewertung</option>
                        <option value="reviews">Sortieren: Anzahl Reviews</option>
                    </select>
                </div>
                
                <div id="shopsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Coffee shops will be loaded here via JavaScript -->
                    <div class="text-center py-12 col-span-full">
                        <i class="fas fa-spinner fa-spin text-4xl text-orange-600"></i>
                        <p class="mt-4 text-gray-600">Loading coffee shops...</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Owner Interviews Section -->
        <section class="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
            <div class="max-w-7xl mx-auto px-4">
                <div class="text-center mb-16">
                    <span class="text-orange-600 font-semibold text-sm uppercase tracking-wide">Behind the Beans</span>
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">Meet the Coffee Makers</h2>
                    <p class="text-xl text-gray-600 max-w-3xl mx-auto">Discover the stories, passion, and philosophy behind Larnaca's best coffee spots</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <!-- Interview 1: Paul's Coffee Roasters -->
                    <div class="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                        <div class="relative h-64">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800" alt="Paul - Owner" class="w-full h-full object-cover">
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <h3 class="text-2xl font-bold text-white">Paul Georgiou</h3>
                                <p class="text-orange-300 font-semibold">Owner, Paul's Coffee Roasters</p>
                            </div>
                        </div>
                        <div class="p-8">
                            <div class="mb-6">
                                <div class="flex items-center gap-2 mb-3">
                                    <i class="fas fa-quote-left text-orange-600 text-2xl"></i>
                                    <span class="font-semibold text-gray-900">Why specialty coffee?</span>
                                </div>
                                <p class="text-gray-700 italic">"For me, coffee is more than a drink—it's a craft. Every bean tells a story of its origin, and I want our customers to taste that journey in every cup. We roast in-house because freshness makes all the difference."</p>
                            </div>
                            <div class="mb-6">
                                <div class="flex items-center gap-2 mb-3">
                                    <i class="fas fa-coffee text-orange-600 text-xl"></i>
                                    <span class="font-semibold text-gray-900">Signature Drink</span>
                                </div>
                                <p class="text-gray-700">Ethiopian Single-Origin Pour-Over - Fruity, floral, and unforgettable</p>
                            </div>
                            <div class="mb-6">
                                <div class="flex items-center gap-2 mb-3">
                                    <i class="fas fa-heart text-orange-600 text-xl"></i>
                                    <span class="font-semibold text-gray-900">Coffee Philosophy</span>
                                </div>
                                <p class="text-gray-700">"Quality over quantity. Every cup we serve must meet our high standards."</p>
                            </div>
                            <button onclick="showShopDetails('pauls-coffee-roasters')" class="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors">
                                Visit Paul's Coffee Roasters
                            </button>
                        </div>
                    </div>

                    <!-- Interview 2: To Kafe Tis Chrysanthi's -->
                    <div class="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                        <div class="relative h-64">
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800" alt="Chrysanthi - Owner" class="w-full h-full object-cover">
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <h3 class="text-2xl font-bold text-white">Chrysanthi Papadopoulos</h3>
                                <p class="text-orange-300 font-semibold">Owner, To Kafe Tis Chrysanthi's</p>
                            </div>
                        </div>
                        <div class="p-8">
                            <div class="mb-6">
                                <div class="flex items-center gap-2 mb-3">
                                    <i class="fas fa-quote-left text-orange-600 text-2xl"></i>
                                    <span class="font-semibold text-gray-900">Traditional Cypriot Coffee</span>
                                </div>
                                <p class="text-gray-700 italic">"We've been serving traditional Cypriot coffee for three generations. My grandmother taught me that coffee is about community—bringing people together, sharing stories, and creating memories."</p>
                            </div>
                            <div class="mb-6">
                                <div class="flex items-center gap-2 mb-3">
                                    <i class="fas fa-cookie-bite text-orange-600 text-xl"></i>
                                    <span class="font-semibold text-gray-900">Must-Try</span>
                                </div>
                                <p class="text-gray-700">Traditional Cypriot Coffee with homemade Loukoumades (honey donuts)</p>
                            </div>
                            <div class="mb-6">
                                <div class="flex items-center gap-2 mb-3">
                                    <i class="fas fa-users text-orange-600 text-xl"></i>
                                    <span class="font-semibold text-gray-900">What Makes Us Special</span>
                                </div>
                                <p class="text-gray-700">"Our rustic atmosphere and authentic recipes passed down through generations."</p>
                            </div>
                            <button onclick="showShopDetails('to-kafe-tis-chrysanthis')" class="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors">
                                Visit To Kafe Tis Chrysanthi's
                            </button>
                        </div>
                    </div>
                </div>

                <!-- More Interviews Coming Soon -->
                <div class="text-center bg-white rounded-2xl shadow-lg p-12">
                    <i class="fas fa-microphone-alt text-5xl text-orange-600 mb-4"></i>
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">More Stories Coming Soon</h3>
                    <p class="text-gray-600 mb-6">We're interviewing more coffee shop owners to bring you their unique stories and perspectives on Larnaca's coffee culture.</p>
                    <div class="flex flex-wrap justify-center gap-4">
                        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">Menta Specialty</span>
                        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">Mingle Cafe</span>
                        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">Lazaris Bakery</span>
                        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">Edem's Yard</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Map Section -->
        <section id="map" class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-gray-900 mb-8">Explore on Map</h2>
                <div id="mapContainer" class="shadow-lg"></div>
                <div class="mt-4 flex gap-4 justify-center">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-blue-600 rounded-full"></div>
                        <span class="text-sm">Specialty</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-orange-600 rounded-full"></div>
                        <span class="text-sm">Traditional</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-green-600 rounded-full"></div>
                        <span class="text-sm">Modern</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-purple-600 rounded-full"></div>
                        <span class="text-sm">Chain</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white py-8">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <p class="text-lg font-semibold mb-2">☕ Larnaca Coffee Guide</p>
                <p class="text-gray-400">Discover the best coffee culture in Larnaca, Cyprus</p>
                <p class="text-gray-500 text-sm mt-4">© 2025 Larnaca Coffee Guide. All rights reserved.</p>
            </div>
        </footer>

        <!-- Booking Modal -->
        <div id="bookingModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-bold">Book a Table</h3>
                    <button onclick="closeBookingModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div id="bookingContent">
                    <!-- Booking form will be loaded here -->
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Global state
            let allShops = [];
            let map = null;
            let markers = [];
            
            // Load coffee shops on page load
            window.addEventListener('DOMContentLoaded', async () => {
                await loadCoffeeShops();
                initializeMap();
                renderTop10Cards();
            });
            
            // Load coffee shops
            async function loadCoffeeShops() {
                try {
                    const category = document.getElementById('categoryFilter').value;
                    const sort = document.getElementById('sortFilter').value;
                    
                    const response = await axios.get(\`/api/shops?category=\${category}&sort=\${sort}\`);
                    allShops = response.data.data;
                    
                    renderShops(allShops);
                    renderTop10Cards();
                    updateMapMarkers(allShops);
                } catch (error) {
                    console.error('Error loading shops:', error);
                    document.getElementById('shopsGrid').innerHTML = 
                        '<div class="col-span-full text-center text-red-600">Error loading coffee shops. Please try again.</div>';
                }
            }
            
            // Render Top 10 Trading Cards
            function renderTop10Cards() {
                const container = document.getElementById('top10Container');
                if (!container || !allShops || allShops.length === 0) return;
                
                // Sort by rating and get top 10
                const top10 = [...allShops]
                    .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
                    .slice(0, 10);
                
                const categoryColors = {
                    specialty: { bg: 'bg-blue-500', text: 'Specialty' },
                    traditional: { bg: 'bg-orange-500', text: 'Traditional' },
                    modern: { bg: 'bg-green-500', text: 'Modern' },
                    chain: { bg: 'bg-purple-500', text: 'Chain' }
                };
                
                container.innerHTML = top10.map((shop, index) => {
                    const images = JSON.parse(shop.images || '[]');
                    const features = JSON.parse(shop.features || '[]');
                    const category = categoryColors[shop.category] || { bg: 'bg-gray-500', text: shop.category };
                    
                    return \`
                        <div class="trading-card" onclick="showShopDetails('\${shop.slug}')">
                            <div class="relative">
                                <img src="\${images[0] || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800'}" 
                                     alt="\${shop.name}" class="trading-card-image">
                                <div class="trading-card-rank">#\${index + 1}</div>
                                <div class="trading-card-badge \${category.bg} text-white">\${category.text}</div>
                            </div>
                            
                            <div class="p-5">
                                <h3 class="text-xl font-bold text-gray-900 mb-2 line-clamp-1">\${shop.name}</h3>
                                
                                <div class="flex items-center mb-3">
                                    <span class="text-2xl font-bold text-yellow-500">\${shop.avg_rating ? shop.avg_rating.toFixed(1) : 'N/A'}</span>
                                    <i class="fas fa-star text-yellow-500 ml-2"></i>
                                    <span class="text-gray-600 text-sm ml-2">(\${shop.total_reviews || 0})</span>
                                </div>
                                
                                <p class="text-gray-600 text-sm mb-3 line-clamp-2">\${shop.description || ''}</p>
                                
                                <div class="flex items-center text-sm text-gray-500 mb-3">
                                    <i class="fas fa-map-marker-alt mr-2"></i>
                                    <span class="line-clamp-1">\${shop.address}</span>
                                </div>
                                
                                <div class="flex flex-wrap gap-2">
                                    \${features.slice(0, 2).map(f => \`
                                        <span class="text-xs bg-gray-100 px-2 py-1 rounded-full">\${f}</span>
                                    \`).join('')}
                                </div>
                            </div>
                        </div>
                    \`;
                }).join('');
            }
            
            // Scroll Top 10 Cards
            function scrollTop10(direction) {
                const container = document.getElementById('top10Container');
                const scrollAmount = 340; // Card width + gap
                
                if (direction === 'left') {
                    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                } else {
                    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
            
            // Render coffee shops
            function renderShops(shops) {
                const grid = document.getElementById('shopsGrid');
                
                if (shops.length === 0) {
                    grid.innerHTML = '<div class="col-span-full text-center text-gray-600">No coffee shops found.</div>';
                    return;
                }
                
                grid.innerHTML = shops.map(shop => {
                    const images = JSON.parse(shop.images || '[]');
                    const features = JSON.parse(shop.features || '[]');
                    const categoryColors = {
                        specialty: 'bg-blue-100 text-blue-800',
                        traditional: 'bg-orange-100 text-orange-800',
                        modern: 'bg-green-100 text-green-800',
                        chain: 'bg-purple-100 text-purple-800'
                    };
                    
                    return \`
                        <div class="bg-white rounded-lg shadow-md overflow-hidden card-hover cursor-pointer" onclick="showShopDetails('\${shop.slug}')">
                            <img src="\${images[0] || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800'}" 
                                 alt="\${shop.name}" class="w-full h-48 object-cover">
                            <div class="p-5">
                                <div class="flex items-start justify-between mb-2">
                                    <h3 class="text-xl font-bold text-gray-900">\${shop.name}</h3>
                                    <span class="px-2 py-1 text-xs rounded-full \${categoryColors[shop.category] || 'bg-gray-100'}">\${shop.category}</span>
                                </div>
                                <div class="flex items-center mb-2">
                                    <span class="text-yellow-500 font-semibold">\${shop.avg_rating ? shop.avg_rating.toFixed(1) : 'N/A'}</span>
                                    <i class="fas fa-star rating-star ml-1"></i>
                                    <span class="text-gray-600 text-sm ml-2">(\${shop.total_reviews || 0} reviews)</span>
                                </div>
                                <p class="text-gray-600 text-sm mb-3">\${shop.description ? shop.description.substring(0, 100) + '...' : ''}</p>
                                <div class="text-sm text-gray-500 mb-3">
                                    <i class="fas fa-map-marker-alt mr-1"></i>\${shop.address}
                                </div>
                                <div class="flex flex-wrap gap-2 mb-4">
                                    \${features.slice(0, 3).map(f => \`<span class="text-xs bg-gray-100 px-2 py-1 rounded">\${f}</span>\`).join('')}
                                </div>
                                <button onclick="event.stopPropagation(); openBookingModal('\${shop.id}', '\${shop.name}')" 
                                        class="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-semibold">
                                    <i class="fas fa-calendar-check mr-2"></i>Book Now
                                </button>
                            </div>
                        </div>
                    \`;
                }).join('');
            }
            
            // Initialize map
            function initializeMap() {
                map = L.map('mapContainer').setView([34.9156, 33.6323], 14);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
            }
            
            // Update map markers
            function updateMapMarkers(shops) {
                // Clear existing markers
                markers.forEach(marker => marker.remove());
                markers = [];
                
                const colorMap = {
                    specialty: 'blue',
                    traditional: 'orange',
                    modern: 'green',
                    chain: 'purple'
                };
                
                shops.forEach(shop => {
                    const color = colorMap[shop.category] || 'gray';
                    const icon = L.divIcon({
                        html: \`<div style="background-color: \${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>\`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });
                    
                    const marker = L.marker([shop.latitude, shop.longitude], { icon })
                        .addTo(map)
                        .bindPopup(\`
                            <div class="text-center">
                                <strong>\${shop.name}</strong><br>
                                <span class="text-yellow-500">\${shop.avg_rating ? shop.avg_rating.toFixed(1) : 'N/A'}</span> ⭐<br>
                                <button onclick="showShopDetails('\${shop.slug}')" class="mt-2 bg-orange-600 text-white px-3 py-1 rounded text-sm">View Details</button>
                            </div>
                        \`);
                    
                    markers.push(marker);
                });
            }
            
            // Open booking modal
            function openBookingModal(shopId, shopName) {
                document.getElementById('bookingModal').classList.remove('hidden');
                document.getElementById('bookingContent').innerHTML = \`
                    <form id="bookingForm" onsubmit="submitBooking(event, '\${shopId}', '\${shopName}')">
                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2">Datum</label>
                            <input type="date" name="date" required min="\${new Date().toISOString().split('T')[0]}" 
                                   class="w-full px-4 py-2 border rounded-lg">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2">Zeit</label>
                            <select name="time" required class="w-full px-4 py-2 border rounded-lg">
                                <option value="">Zeit wählen...</option>
                                <option value="08:00">08:00</option>
                                <option value="08:30">08:30</option>
                                <option value="09:00">09:00</option>
                                <option value="09:30">09:30</option>
                                <option value="10:00">10:00</option>
                                <option value="10:30">10:30</option>
                                <option value="11:00">11:00</option>
                                <option value="11:30">11:30</option>
                                <option value="12:00">12:00</option>
                                <option value="12:30">12:30</option>
                                <option value="13:00">13:00</option>
                                <option value="13:30">13:30</option>
                                <option value="14:00">14:00</option>
                                <option value="14:30">14:30</option>
                                <option value="15:00">15:00</option>
                                <option value="15:30">15:30</option>
                                <option value="16:00">16:00</option>
                                <option value="16:30">16:30</option>
                                <option value="17:00">17:00</option>
                                <option value="17:30">17:30</option>
                                <option value="18:00">18:00</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2">Personenanzahl</label>
                            <select name="partySize" required class="w-full px-4 py-2 border rounded-lg">
                                <option value="1">1 Person</option>
                                <option value="2">2 Personen</option>
                                <option value="3">3 Personen</option>
                                <option value="4">4 Personen</option>
                                <option value="5">5 Personen</option>
                                <option value="6">6 Personen</option>
                                <option value="7">7 Personen</option>
                                <option value="8">8 Personen</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2">Name</label>
                            <input type="text" name="userName" required class="w-full px-4 py-2 border rounded-lg">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2">Email</label>
                            <input type="email" name="userEmail" required class="w-full px-4 py-2 border rounded-lg">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2">Telefon</label>
                            <input type="tel" name="userPhone" required class="w-full px-4 py-2 border rounded-lg">
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2">Besondere Wünsche (optional)</label>
                            <textarea name="specialRequests" rows="3" class="w-full px-4 py-2 border rounded-lg"></textarea>
                        </div>
                        <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold">
                            <i class="fas fa-check mr-2"></i>Buchung bestätigen
                        </button>
                    </form>
                \`;
            }
            
            // Submit booking
            async function submitBooking(event, shopId, shopName) {
                event.preventDefault();
                const form = event.target;
                const formData = new FormData(form);
                
                try {
                    const response = await axios.post('/api/bookings', {
                        shopId: parseInt(shopId),
                        userName: formData.get('userName'),
                        userEmail: formData.get('userEmail'),
                        userPhone: formData.get('userPhone'),
                        date: formData.get('date'),
                        time: formData.get('time'),
                        partySize: parseInt(formData.get('partySize')),
                        specialRequests: formData.get('specialRequests')
                    });
                    
                    if (response.data.success) {
                        document.getElementById('bookingContent').innerHTML = \`
                            <div class="text-center py-8">
                                <i class="fas fa-check-circle text-6xl text-green-600 mb-4"></i>
                                <h3 class="text-2xl font-bold text-gray-900 mb-2">Buchung Bestätigt!</h3>
                                <p class="text-gray-600 mb-4">Ihre Buchung bei <strong>\${shopName}</strong> wurde erfolgreich bestätigt.</p>
                                <div class="bg-gray-100 p-4 rounded-lg mb-4">
                                    <p class="font-semibold text-lg">Confirmation Code:</p>
                                    <p class="text-2xl font-mono text-orange-600">\${response.data.data.confirmationCode}</p>
                                </div>
                                <p class="text-sm text-gray-600">Bitte notieren Sie Ihren Bestätigungscode für Ihre Unterlagen.</p>
                                <button onclick="closeBookingModal()" class="mt-6 bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-lg">
                                    Schließen
                                </button>
                            </div>
                        \`;
                    }
                } catch (error) {
                    alert('Fehler bei der Buchung. Bitte versuchen Sie es erneut.');
                    console.error('Booking error:', error);
                }
            }
            
            // Close booking modal
            function closeBookingModal() {
                document.getElementById('bookingModal').classList.add('hidden');
            }
            
            // Show shop details (placeholder)
            function showShopDetails(slug) {
                window.location.href = \`/shop/\${slug}\`;
            }
            
            // Event listeners for filters
            document.getElementById('categoryFilter').addEventListener('change', loadCoffeeShops);
            document.getElementById('sortFilter').addEventListener('change', loadCoffeeShops);
            
            // Search functionality
            document.getElementById('searchInput').addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = allShops.filter(shop => 
                    shop.name.toLowerCase().includes(searchTerm) ||
                    shop.description.toLowerCase().includes(searchTerm) ||
                    shop.specialty.toLowerCase().includes(searchTerm)
                );
                renderShops(filtered);
                updateMapMarkers(filtered);
            });
        </script>
    </body>
    </html>
  `)
})

// My Bookings page
app.get('/my-bookings', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meine Buchungen - Larnaca Coffee Guide</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <header class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <a href="/" class="flex items-center space-x-2">
                        <i class="fas fa-mug-hot text-3xl" style="color: #3E2723"></i>
                        <h1 class="text-2xl font-bold" style="color: #3E2723">Larnaca Coffee Guide</h1>
                    </a>
                    <a href="/" class="text-orange-600 hover:text-orange-700">
                        <i class="fas fa-arrow-left mr-2"></i>Zurück
                    </a>
                </div>
            </div>
        </header>

        <main class="max-w-5xl mx-auto px-4 py-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-8">Meine Buchungen</h1>
            
            <!-- Email Input -->
            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <label class="block text-gray-700 font-semibold mb-3">Email-Adresse eingeben:</label>
                <div class="flex gap-3">
                    <input type="email" id="userEmail" placeholder="ihre-email@beispiel.com" 
                           class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                    <button onclick="loadUserBookings()" class="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold">
                        <i class="fas fa-search mr-2"></i>Suchen
                    </button>
                </div>
            </div>

            <!-- Bookings Container -->
            <div id="bookingsContainer">
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-calendar text-6xl mb-4"></i>
                    <p class="text-lg">Geben Sie Ihre Email-Adresse ein, um Ihre Buchungen zu sehen</p>
                </div>
            </div>
        </main>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            async function loadUserBookings() {
                const email = document.getElementById('userEmail').value.trim();
                const container = document.getElementById('bookingsContainer');
                
                if (!email) {
                    alert('Bitte geben Sie eine Email-Adresse ein');
                    return;
                }
                
                container.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-4xl text-orange-600"></i></div>';
                
                try {
                    const response = await axios.get(\`/api/user/bookings?email=\${encodeURIComponent(email)}\`);
                    const bookings = response.data.data;
                    
                    if (bookings.length === 0) {
                        container.innerHTML = \`
                            <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                                <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                                <h3 class="text-2xl font-bold text-gray-900 mb-2">Keine Buchungen gefunden</h3>
                                <p class="text-gray-600 mb-6">Sie haben noch keine Reservierungen mit dieser Email-Adresse.</p>
                                <a href="/" class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg inline-block font-semibold">
                                    Coffee Shop finden & buchen
                                </a>
                            </div>
                        \`;
                        return;
                    }
                    
                    const now = new Date();
                    const upcoming = bookings.filter(b => new Date(b.booking_date + ' ' + b.booking_time) >= now);
                    const past = bookings.filter(b => new Date(b.booking_date + ' ' + b.booking_time) < now);
                    
                    container.innerHTML = \`
                        <div class="mb-8">
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Kommende Buchungen (\${upcoming.length})</h2>
                            <div class="space-y-4">
                                \${upcoming.length > 0 ? upcoming.map(booking => renderBookingCard(booking, false)).join('') : 
                                  '<p class="text-gray-600 bg-white p-6 rounded-lg">Keine kommenden Buchungen</p>'}
                            </div>
                        </div>
                        
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Vergangene Buchungen (\${past.length})</h2>
                            <div class="space-y-4">
                                \${past.length > 0 ? past.map(booking => renderBookingCard(booking, true)).join('') : 
                                  '<p class="text-gray-600 bg-white p-6 rounded-lg">Keine vergangenen Buchungen</p>'}
                            </div>
                        </div>
                    \`;
                } catch (error) {
                    container.innerHTML = \`
                        <div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                            <i class="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
                            <h3 class="text-xl font-bold text-red-900 mb-2">Fehler beim Laden</h3>
                            <p class="text-red-700">Bitte versuchen Sie es erneut.</p>
                        </div>
                    \`;
                }
            }
            
            function renderBookingCard(booking, isPast) {
                const statusColors = {
                    confirmed: 'bg-green-100 text-green-800',
                    pending: 'bg-yellow-100 text-yellow-800',
                    cancelled: 'bg-red-100 text-red-800',
                    completed: 'bg-gray-100 text-gray-800'
                };
                
                const statusIcons = {
                    confirmed: 'fa-check-circle',
                    pending: 'fa-clock',
                    cancelled: 'fa-times-circle',
                    completed: 'fa-flag-checkered'
                };
                
                return \`
                    <div class="bg-white rounded-xl shadow-lg p-6 \${isPast ? 'opacity-75' : ''}">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 mb-1">\${booking.shop_name}</h3>
                                <p class="text-gray-600 text-sm"><i class="fas fa-map-marker-alt mr-1"></i>\${booking.address}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-sm font-semibold \${statusColors[booking.status]}">
                                <i class="fas \${statusIcons[booking.status]} mr-1"></i>\${booking.status}
                            </span>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-gray-600 text-sm mb-1"><i class="fas fa-calendar mr-2"></i>Datum</p>
                                <p class="font-semibold text-gray-900">\${new Date(booking.booking_date).toLocaleDateString('de-DE')}</p>
                            </div>
                            <div>
                                <p class="text-gray-600 text-sm mb-1"><i class="fas fa-clock mr-2"></i>Zeit</p>
                                <p class="font-semibold text-gray-900">\${booking.booking_time}</p>
                            </div>
                            <div>
                                <p class="text-gray-600 text-sm mb-1"><i class="fas fa-users mr-2"></i>Personen</p>
                                <p class="font-semibold text-gray-900">\${booking.party_size}</p>
                            </div>
                            <div>
                                <p class="text-gray-600 text-sm mb-1"><i class="fas fa-hashtag mr-2"></i>Code</p>
                                <p class="font-semibold text-gray-900 font-mono text-sm">\${booking.confirmation_code}</p>
                            </div>
                        </div>
                        
                        <div class="flex gap-3">
                            <a href="/shop/\${booking.slug}" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold text-center">
                                <i class="fas fa-info-circle mr-2"></i>Details
                            </a>
                            \${!isPast && booking.status !== 'cancelled' ? \`
                                <button onclick="cancelBooking('\${booking.confirmation_code}')" 
                                        class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold">
                                    <i class="fas fa-times mr-2"></i>Stornieren
                                </button>
                            \` : ''}
                        </div>
                        
                        \${booking.special_requests ? \`
                            <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p class="text-sm text-gray-600"><strong>Besondere Wünsche:</strong> \${booking.special_requests}</p>
                            </div>
                        \` : ''}
                    </div>
                \`;
            }
            
            async function cancelBooking(confirmationCode) {
                if (!confirm('Möchten Sie diese Buchung wirklich stornieren?')) {
                    return;
                }
                
                try {
                    await axios.delete(\`/api/bookings/\${confirmationCode}\`);
                    alert('Buchung erfolgreich storniert!');
                    loadUserBookings();
                } catch (error) {
                    alert('Fehler beim Stornieren. Bitte versuchen Sie es erneut.');
                }
            }
            
            // Auto-load if email in URL
            const urlParams = new URLSearchParams(window.location.search);
            const emailParam = urlParams.get('email');
            if (emailParam) {
                document.getElementById('userEmail').value = emailParam;
                loadUserBookings();
            }
        </script>
    </body>
    </html>
  `)
})

// Shop details page
app.get('/shop/:slug', async (c) => {
  const slug = c.req.param('slug')
  
  try {
    // Get shop from database directly
    const shop = await c.env.DB.prepare(
      'SELECT * FROM coffee_shops WHERE slug = ? AND is_active = 1'
    ).bind(slug).first()
    
    if (!shop) {
      return c.html('<h1>Shop not found</h1>', 404)
    }
    
    // Get reviews
    const { results: reviews } = await c.env.DB.prepare(`
      SELECT r.*, u.name as user_name, u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.shop_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `).bind(shop.id).all()
    
    const images = JSON.parse(shop.images || '[]')
    const features = JSON.parse(shop.features || '[]')
    const hours = JSON.parse(shop.opening_hours || '{}')
    
    const hoursHtml = Object.entries(hours).map(([day, time]) => 
      `<div class="flex justify-between py-2 border-b">
        <span class="font-semibold capitalize">${day}</span>
        <span>${time}</span>
      </div>`
    ).join('')
    
    const reviewsHtml = reviews && reviews.length > 0 
      ? reviews.map((review: any) => 
          `<div class="border-b py-4">
            <div class="flex items-center mb-2">
              <span class="font-semibold">${review.user_name}</span>
              <span class="ml-4 text-yellow-500">${'⭐'.repeat(review.rating)}</span>
            </div>
            ${review.title ? `<h3 class="font-semibold mb-1">${review.title}</h3>` : ''}
            <p class="text-gray-700">${review.comment}</p>
            <p class="text-sm text-gray-500 mt-2">${new Date(review.created_at).toLocaleDateString('de-DE')}</p>
          </div>`
        ).join('')
      : '<p class="text-gray-600">Noch keine Bewertungen</p>'
    
    const featuresHtml = features.map((f: string) => 
      `<span class="bg-gray-100 px-3 py-1 rounded-full text-sm">${f}</span>`
    ).join('')
    
    return c.html(`
      <!DOCTYPE html>
      <html lang="de">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${shop.name} - Larnaca Coffee Guide</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-50">
          <header class="bg-white shadow-sm">
              <div class="max-w-7xl mx-auto px-4 py-4">
                  <a href="/" class="text-orange-600 hover:text-orange-700">
                      <i class="fas fa-arrow-left mr-2"></i>Zurück zur Übersicht
                  </a>
              </div>
          </header>
          
          <main class="max-w-7xl mx-auto px-4 py-8">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div class="lg:col-span-2">
                      <img src="${images[0]}" alt="${shop.name}" class="w-full h-96 object-cover rounded-lg shadow-lg mb-6">
                      
                      <h1 class="text-4xl font-bold mb-2">${shop.name}</h1>
                      <div class="flex items-center mb-4">
                          <span class="text-2xl font-semibold text-yellow-500">${shop.avg_rating ? (shop.avg_rating as number).toFixed(1) : 'N/A'}</span>
                          <i class="fas fa-star text-yellow-500 ml-2"></i>
                          <span class="text-gray-600 ml-2">(${shop.total_reviews || 0} Bewertungen)</span>
                      </div>
                      
                      <p class="text-lg text-gray-700 mb-6">${shop.description}</p>
                      
                      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                          <h2 class="text-2xl font-bold mb-4">Öffnungszeiten</h2>
                          ${hoursHtml}
                      </div>
                      
                      <div class="bg-white p-6 rounded-lg shadow-md">
                          <h2 class="text-2xl font-bold mb-4">Bewertungen</h2>
                          ${reviewsHtml}
                      </div>
                  </div>
                  
                  <div class="lg:col-span-1">
                      <div class="bg-white p-6 rounded-lg shadow-lg sticky top-4">
                          <h2 class="text-2xl font-bold mb-4">Buchung</h2>
                          <button onclick="openBooking()" class="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold mb-4">
                              <i class="fas fa-calendar-check mr-2"></i>Tisch reservieren
                          </button>
                          
                          <div class="mb-4">
                              <h3 class="font-semibold mb-2"><i class="fas fa-map-marker-alt mr-2"></i>Adresse</h3>
                              <p class="text-gray-700">${shop.address}</p>
                          </div>
                          
                          ${shop.phone ? `
                              <div class="mb-4">
                                  <h3 class="font-semibold mb-2"><i class="fas fa-phone mr-2"></i>Telefon</h3>
                                  <p class="text-gray-700">${shop.phone}</p>
                              </div>
                          ` : ''}
                          
                          <div class="mb-4">
                              <h3 class="font-semibold mb-2"><i class="fas fa-tag mr-2"></i>Features</h3>
                              <div class="flex flex-wrap gap-2">
                                  ${featuresHtml}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </main>
          
          <script>
              function openBooking() {
                  window.location.href = '/#bookings';
              }
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    return c.html('<h1>Error loading shop details</h1>', 500)
  }
})

export default app
