# ☕ Larnaca Coffee Guide

## Project Overview
- **Name**: Larnaca Coffee Guide
- **Goal**: Comprehensive coffee shop discovery and booking platform for Larnaca, Cyprus
- **Features**: 
  - Browse and discover coffee shops with ratings and reviews
  - Interactive map with location markers (focused on Larnaca city center)
  - Real-time table booking system (OpenTable-style)
  - **Wolt food delivery integration** with deep links
  - Multi-language support (English, German, Greek)
  - Google Reviews integration
  - Filter by category (Specialty, Traditional, Modern, Chain)
  - User reviews and ratings system
  - Owner interviews section showcasing coffee shop proprietors
  - "My Bookings" dashboard for reservation management

## URLs
- **Production**: https://larnacacoffeeguide.com ⭐⭐⭐
- **Alternate**: https://www.larnacacoffeeguide.com
- **Cloudflare Pages**: https://larnaca-coffee-guide.pages.dev
- **Local Development**: http://localhost:3000
- **GitHub**: https://github.com/pascal-afk/Larnaca-Coffee-Shop-Guide

## Data Architecture

### Database Schema (Cloudflare D1 - SQLite)

**Coffee Shops Table:**
- Shop information (name, address, coordinates, description)
- Categories: specialty, traditional, modern, chain
- Ratings aggregation (avg_rating, total_reviews)
- Google integration (google_place_id, google_rating)
- **Wolt integration** (wolt_url, has_delivery, delivery_radius_km)
- Features (JSON): wifi, outdoor seating, parking, etc.
- Opening hours (JSON)

**Bookings Table:**
- Real-time reservations with confirmation codes
- Booking status: pending, confirmed, cancelled, completed
- User information and party size
- Date/time slots with availability tracking

**Reviews Table:**
- User-generated reviews with ratings (1-5 stars)
- Review verification system
- Helpful votes tracking
- Photos support

**Users Table:**
- User profiles with email authentication
- Booking and review statistics
- Verification status

**Owner Interviews Table:**
- Coffee shop owner profiles
- Owner quotes and philosophy
- Signature drinks and fun facts

**Email Notifications Table:**
- Booking confirmation tracking
- Reminder notifications
- Status updates

**Shop Availability Table:**
- Per-weekday operating hours
- Special closure dates
- Capacity management

**Favorites Table:**
- User's favorite coffee shops
- Quick access to preferred locations

### Storage Services
- **Cloudflare D1**: Main relational database
- **Future**: Cloudflare R2 for user-uploaded photos

## Features Implemented

### ✅ Currently Completed
1. **Coffee Shop Discovery**
   - Grid and list views with filtering
   - Category filters (Specialty, Traditional, Modern, Chain)
   - Sort by name, rating, or review count
   - Real-time search functionality
   - **Top 10 Trading Cards** with horizontally scrollable carousel

2. **Interactive Map**
   - Leaflet.js integration
   - **Focused on Larnaca city center** (Lazarus Church ±1km radius)
   - Lazarus Church reference point marker
   - Color-coded pins by category
   - Popup information on markers
   - Zoom restrictions and boundary limits

3. **Booking System**
   - Real-time availability checking
   - Time slot selection (8:00 - 18:00, 30-min intervals)
   - Party size selection (1-8 people)
   - Instant confirmation with unique codes
   - Guest booking (no registration required)
   - **"My Bookings" dashboard** with email-based lookup
   - View upcoming and past bookings
   - Cancel bookings functionality

4. **Wolt Food Delivery Integration** ⭐ NEW
   - Deep links to Wolt restaurant pages
   - Delivery availability badges
   - Blue Wolt branding with shield icons
   - Delivery radius information (default 3km)
   - Integrated in coffee shop cards, Top 10 cards, and details pages

5. **Multi-Language Support** (i18n) ⭐
   - English, German, Greek language options
   - Language switcher in header
   - LocalStorage preference persistence
   - Complete translation coverage for all UI elements

6. **Owner Interviews Section** ⭐
   - Showcase coffee shop proprietors
   - Owner quotes and philosophy
   - Signature drinks and fun facts
   - Professional presentation with photos

7. **Rating & Review System**
   - 5-star rating system
   - Written reviews with timestamps
   - Verified visit badges
   - Google Reviews integration

8. **Database & API**
   - RESTful API with Hono
   - D1 database with 3 migrations applied
   - Seed data with 8 real Larnaca coffee shops
   - Owner interviews data
   - Wolt URLs and delivery info

### 🔄 Features Not Yet Implemented
1. User authentication (Sign In/Sign Up)
2. User profile management
3. Review photos upload
4. **Email notifications for bookings** (Resend integration planned)
5. Admin panel for shop owners
6. Advanced filtering (price range, amenities)
7. Mobile app version (PWA planned)
8. Social media sharing
9. Loyalty program
10. Remaining 4 owner interviews (4/8 completed)

## Tech Stack

**Backend:**
- Hono v4.10.4 (Lightweight web framework)
- TypeScript
- Cloudflare Pages/Workers (Edge runtime)
- Cloudflare D1 (SQLite database)

**Frontend:**
- Vanilla JavaScript
- TailwindCSS v3 (CDN)
- Font Awesome icons
- Leaflet.js for maps
- Axios for API calls

**Development:**
- Vite (Build tool)
- Wrangler (Cloudflare CLI)
- PM2 (Process manager for sandbox)

## Development Setup

### Prerequisites
- Node.js 18+
- npm
- Cloudflare account (for deployment)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd webapp

# Install dependencies (already done)
npm install

# Create D1 database (local development)
npm run db:migrate:local

# Seed database with sample data
npm run db:seed
```

### Local Development

```bash
# Build the project first
npm run build

# Start development server with PM2
pm2 start ecosystem.config.cjs

# Check if server is running
npm test  # curl http://localhost:3000

# View logs
pm2 logs larnaca-coffee-guide --nostream

# Stop server
pm2 delete larnaca-coffee-guide
```

### Database Commands

```bash
# Apply migrations to local database
npm run db:migrate:local

# Seed database with sample data
npm run db:seed

# Reset local database (delete and recreate)
npm run db:reset

# Execute SQL commands (local)
npm run db:console:local

# Production database commands
npm run db:migrate:prod
npm run db:console:prod
```

## API Endpoints

### Coffee Shops
- `GET /api/shops` - Get all coffee shops (supports ?category= and ?sort=)
  - Returns: id, name, slug, address, coordinates, avg_rating, total_reviews, category, features, images, **wolt_url, has_delivery, delivery_radius_km**
- `GET /api/shops/:slug` - Get single coffee shop with reviews

### Bookings
- `GET /api/bookings/availability/:shopId?date=YYYY-MM-DD` - Check availability
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:confirmationCode` - Get booking details
- `DELETE /api/bookings/:confirmationCode` - Cancel booking
- `GET /api/user/bookings?email=xxx` - Get all bookings for a user (email-based lookup)

### Reviews
- `GET /api/reviews/:shopId` - Get reviews for a shop
- `POST /api/reviews` - Create new review

### Owner Interviews
- `GET /api/interviews` - Get all owner interviews with coffee shop details

## Deployment

### Cloudflare Pages

```bash
# Build project
npm run build

# Deploy to Cloudflare Pages
npm run deploy:prod

# The dist/ folder contains:
# - _worker.js (compiled Hono app)
# - _routes.json (routing config)
# - static assets
```

### Production Database Setup

```bash
# Create production D1 database
npm run db:create

# Update wrangler.jsonc with database_id

# Apply migrations to production
npm run db:migrate:prod
```

## Coffee Shops Database

### Real Larnaca Coffee Shops (Seeded Data)

1. **Paul's Coffee Roasters** (Specialty) - 4.9★
   - In-house roasting, Single-origin espresso
   - Armenian Church Street 35A

2. **To Kafe Tis Chrysanthi's** (Traditional) - 4.5★
   - Traditional Cypriot coffee, Homemade pastries
   - Nikolaou Rossou

3. **Menta Speciality CoffeeShop** (Specialty) - 4.5★
   - Pour-over, Siphon, V60, Chemex
   - Zouhouri Square

4. **Mingle Cafe** (Modern) - 4.5★
   - Brunch specialties, Quality espresso
   - Larnaca Center

5. **Lazaris Bakery Bar** (Modern) - 4.6★
   - Fresh bakery, Artisan coffee
   - Larnaca

6. **Coffee Island** (Chain) - 4.2★
   - Pour-over, Cold brew, Multiple locations
   - Various locations

7. **Edem's Yard** (Modern) - 4.5★
   - Garden setting, Quality coffee
   - Behind main street

8. **Refuel Ice Cream Parlor & Juicery** (Modern) - 4.9★
   - Specialty coffee, Artisan ice cream, Fresh juices
   - Larnaca

## Recommended Next Steps

1. **User Authentication**
   - Implement sign-up/sign-in with email
   - OAuth integration (Google, Facebook)
   - User session management

2. **Booking Management**
   - User dashboard to view bookings
   - Booking modification and cancellation
   - Email confirmations

3. **Shop Owner Features**
   - Admin panel for coffee shop owners
   - Manage availability and time slots
   - Respond to reviews

4. **Enhanced Reviews**
   - Photo uploads with Cloudflare R2
   - Review moderation
   - Verified purchase badges

5. **Email Notifications**
   - Booking confirmations
   - Reminders
   - Special offers

6. **Mobile Optimization**
   - Progressive Web App (PWA)
   - Native app consideration

7. **Analytics**
   - Tracking popular shops
   - Booking patterns
   - User behavior insights

8. **SEO & Marketing**
   - Meta tags optimization
   - Social media sharing
   - Blog section

## Project Structure

```
webapp/
├── src/
│   └── index.tsx                      # Main Hono application + API routes (900+ lines)
├── migrations/
│   ├── 0001_initial_schema.sql        # Initial database schema
│   ├── 0002_interviews_and_bookings_enhancement.sql  # Owner interviews & booking enhancements
│   └── 0003_add_wolt_links.sql        # Wolt integration columns
├── public/
│   └── static/
│       └── translations.js            # Multi-language translations (EN/DE/EL)
├── dist/                              # Build output
├── ecosystem.config.cjs               # PM2 configuration
├── seed.sql                           # Coffee shops data
├── seed_interviews.sql                # Owner interviews data
├── seed_wolt.sql                      # Wolt URLs and delivery info
├── wrangler.jsonc                     # Cloudflare configuration
├── package.json                       # Dependencies and scripts
└── README.md                          # This file
```

## Contributing

This project is in active development. Contributions are welcome!

## License

MIT License

## Contact

For questions or suggestions, please open an issue on GitHub.

---

## Recent Updates

### Version 1.4.0 (2025-11-07) ⭐ NEW
- ✅ **AI-Generated Coffee Shop Images**: Replaced generic stock photos with 16 custom AI-generated images
- ✅ Each coffee shop has 2 realistic images tailored to their specific character and style
- ✅ Images created with Flux Pro Ultra model for photorealistic quality
- ✅ 100% legal and copyright-free (AI-generated content)
- ✅ Images showcase:
  - Paul's Coffee Roasters: Industrial specialty roasting atmosphere
  - To Kafe Tis Chrysanthi's: Traditional Cypriot rustic charm
  - Menta: Modern minimalist pour-over focus
  - Mingle Cafe: Bright Instagram-worthy brunch aesthetic
  - Lazaris: Warm bakery cafe ambiance
  - Coffee Island: Clean modern chain design
  - Edem's Yard: Bohemian garden outdoor setting
  - Refuel: Colorful playful ice cream parlor

### Version 1.3.0 (2025-11-07)
- ✅ **Wolt Deep Links Integration**: Order food delivery directly from coffee shop pages
- ✅ Delivery badges and radius information
- ✅ Blue Wolt branding with shield icons
- ✅ Integration across coffee shop cards, Top 10 carousel, and details pages

### Version 1.2.0 (2025-11-07)
- ✅ **Multi-Language Support**: English, German, Greek with language switcher
- ✅ LocalStorage language preference persistence
- ✅ Complete translation coverage for all UI elements

### Version 1.1.0 (2025-11-07)
- ✅ **Owner Interviews Section**: Showcase coffee shop proprietors
- ✅ **"My Bookings" Dashboard**: Email-based booking lookup and management
- ✅ **Map Optimization**: Focused on Larnaca city center (±1km radius)
- ✅ Lazarus Church reference point marker

### Version 1.0.0 (2025-11-07)
- ✅ Initial release with coffee shop discovery, booking system, and reviews

---

**Last Updated**: 2025-11-07
**Status**: ✅ Live in Production
**Version**: 1.4.0
**Deployment**: Cloudflare Pages + D1 Database
**Custom Domain**: ✅ larnacacoffeeguide.com (Active)
**Database Migrations**: 4 migrations applied (local + production)
**AI-Generated Images**: 16 custom coffee shop photos (Flux Pro Ultra)
