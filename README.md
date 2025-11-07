# ☕ Larnaca Coffee Guide

## Project Overview
- **Name**: Larnaca Coffee Guide
- **Goal**: Comprehensive coffee shop discovery and booking platform for Larnaca, Cyprus
- **Features**: 
  - Browse and discover coffee shops with ratings and reviews
  - Interactive map with location markers
  - Real-time table booking system (OpenTable-style)
  - Google Reviews integration
  - Filter by category (Specialty, Traditional, Modern, Chain)
  - User reviews and ratings system

## URLs
- **Local Development**: http://localhost:3000
- **Public Demo**: https://3000-ixmtfhydx813rubg7j9bb-18e660f9.sandbox.novita.ai
- **Production**: TBD (ready to deploy to Cloudflare Pages)
- **GitHub**: TBD

## Data Architecture

### Database Schema (Cloudflare D1 - SQLite)

**Coffee Shops Table:**
- Shop information (name, address, coordinates, description)
- Categories: specialty, traditional, modern, chain
- Ratings aggregation (avg_rating, total_reviews)
- Google integration (google_place_id, google_rating)
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

2. **Interactive Map**
   - Leaflet.js integration
   - Color-coded pins by category
   - Popup information on markers
   - Zoom and pan controls

3. **Booking System**
   - Real-time availability checking
   - Time slot selection (8:00 - 18:00, 30-min intervals)
   - Party size selection (1-8 people)
   - Instant confirmation with unique codes
   - Guest booking (no registration required)

4. **Rating & Review System**
   - 5-star rating system
   - Written reviews with timestamps
   - Verified visit badges
   - Google Reviews integration

5. **Database & API**
   - RESTful API with Hono
   - D1 database with migrations
   - Seed data with 8 real Larnaca coffee shops
   - Sample bookings and reviews

### 🔄 Features Not Yet Implemented
1. User authentication (Sign In/Sign Up)
2. User profile management
3. Booking management (view/cancel bookings)
4. Review photos upload
5. Email notifications for bookings
6. Admin panel for shop owners
7. Advanced filtering (price range, amenities)
8. Mobile app version
9. Social media sharing
10. Loyalty program

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
- `GET /api/shops/:slug` - Get single coffee shop with reviews

### Bookings
- `GET /api/bookings/availability/:shopId?date=YYYY-MM-DD` - Check availability
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:confirmationCode` - Get booking details
- `DELETE /api/bookings/:confirmationCode` - Cancel booking

### Reviews
- `GET /api/reviews/:shopId` - Get reviews for a shop
- `POST /api/reviews` - Create new review

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
│   └── index.tsx          # Main Hono application + API routes
├── migrations/
│   └── 0001_initial_schema.sql  # Database schema
├── public/                # Static assets (future)
├── dist/                  # Build output
├── ecosystem.config.cjs   # PM2 configuration
├── seed.sql               # Sample data
├── wrangler.jsonc         # Cloudflare configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Contributing

This project is in active development. Contributions are welcome!

## License

MIT License

## Contact

For questions or suggestions, please open an issue on GitHub.

---

**Last Updated**: 2025-11-07
**Status**: ✅ Active Development
**Version**: 1.0.0
