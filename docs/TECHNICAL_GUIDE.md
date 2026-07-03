# Guide Technique

##  Table des Matières

- [Structure du Projet](#structure-du-projet)
- [Services Métier](#services-métier)
- [Flux de Données](#flux-de-données)
- [Authentification](#authentification)
- [Base de Données](#base-de-données)
- [Best Practices](#best-practices)
- [Technical Guide (English)](#technical-guide-english)

## Structure du Projet

### Arborescence Complète

```
src/
├── app/                                # Next.js 14 App Router
│   ├── (auth)/                         # Auth pages (public)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/                      # Protected routes
│   │   ├── layout.tsx                  # Sidebar + nav
│   │   ├── page.tsx                    # Home dashboard
│   │   ├── trips/
│   │   │   ├── page.tsx                # List trips
│   │   │   ├── [id]/page.tsx           # Detail trip + tabs
│   │   │   └── new/page.tsx            # Create trip
│   │   ├── inspiration/page.tsx        # Destinations explorer
│   │   ├── favorites/page.tsx          # Saved items
│   │   ├── notifications/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                            # Backend endpoints
│   │   ├── trips/                      # Trip CRUD
│   │   ├── itineraries/                # Get itinerary
│   │   ├── itinerary/
│   │   │   └── generate/               # AI generation
│   │   ├── inspirations/               # Destinations
│   │   ├── favorites/                  # Like/unlike
│   │   ├── profiles/                   # User profile
│   │   ├── health/                     # Health check
│   │   ├── metrics/                    # Prometheus
│   │   └── admin/                      # Admin utilities
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout
│   └── middleware.ts                   # Auth check
│
├── lib/                                # Business logic & utilities
│   ├── supabase/
│   │   ├── server.ts                   # Server client (SSR)
│   │   └── admin.ts                    # Admin client
│   ├── amadeus.ts                      # Flights API
│   ├── pexels.ts                       # Images search
│   ├── hotels.ts                       # Hotel recommendations
│   ├── inspirations-service.ts         # Destinations generator
│   ├── favorites-service.ts            # Like/unlike logic
│   ├── monitoring/
│   │   └── prometheus.ts               # Metrics collection
│   ├── travel/
│   │   ├── budget-calculator.ts        # Budget logic
│   │   ├── country-info.ts             # Country data
│   │   ├── trip-status.ts              # Trip status calc
│   │   └── activity-images.ts          # Activity images
│   ├── brand.ts                        # Branding constants
│   └── env.ts                          # Environment validation
│
├── components/                         # React components
│   ├── ui/                             # Shadcn UI
│   ├── dashboard/                      # Dashboard components
│   │   ├── dashboard-premium.tsx
│   │   ├── trip-detail-premium.tsx
│   │   ├── trips-list-premium.tsx
│   │   └── ...
│   ├── landing/                        # Landing page
│   └── forms/                          # Form components
│
├── services/                           # External services
│   ├── ai/
│   │   └── generate-itinerary.ts       # OpenAI integration
│   └── ...
│
├── types/                              # TypeScript types
│   ├── database.ts                     # Auto-generated Supabase
│   ├── itinerary.ts                    # Itinerary structures
│   └── ...
│
├── hooks/                              # React hooks
│   └── (custom hooks)
│
├── tests/                              # Test files
│   ├── unit/                           # Unit tests (56 tests)
│   ├── components/                     # Component tests
│   └── e2e/                            # E2E tests
│
└── middleware.ts                       # Auth middleware
```

## Services Métier

### 1. Amadeus Service (`src/lib/amadeus.ts`)

**Rôle**: Intégration API Amadeus pour recherche de vols

```typescript
// Workflow
getAmadeusToken()           // OAuth token
  ↓
searchFlightOffers()        // Search flights
  ↓
normalizeFlightOffer()      // Format response
  ↓
Return NormalizedFlightOffer[]
```

**Fallback**: Si Amadeus échoue → Mock data

### 2. Hotels Service (`src/lib/hotels.ts`)

**Rôle**: Génération intelligente de recommandations hôtels

```typescript
// Workflow
generateHotelRecommendations()
  ├─ selectHotelStyle()     // Budget/Moderate/Premium
  ├─ Generate 3 hotels
  │   ├─ Hotel data
  │   ├─ searchImage()      // Pexels
  │   └─ Return HotelRecommendation
  ↓
Return HotelRecommendation[]
```

### 3. Inspirations Service (`src/lib/inspirations-service.ts`)

**Rôle**: Recommandations de destinations personnalisées

```typescript
// Workflow
getInspirations(profile)
  ├─ Filter by travel_style
  ├─ Filter by budget_preference
  ├─ Match interests
  ↓
Return Inspiration[]
```

### 4. Favorites Service (`src/lib/favorites-service.ts`)

**Rôle**: Gestion des favoris (toggle, fetch, remove)

```typescript
// Workflow
isFavorite()                // Check if favorited
  ↓
toggleFavorite()            // Add or remove
  ├─ If exists: DELETE
  └─ If not: INSERT
```

### 5. AI Service (`src/services/ai/generate-itinerary.ts`)

**Rôle**: Génération d'itinéraires via OpenAI GPT-4o-mini

```typescript
// Workflow
generateItinerary(trip)
  ├─ Format prompt
  ├─ Call OpenAI API
  ├─ Stream response
  ├─ Parse JSON
  └─ Validate structure
```

## Flux de Données

### Créer un Voyage + Itinéraire

```
1. User Form
   ↓
2. POST /api/trips
   ├─ Verify user
   ├─ Validate data
   ├─ Insert to trips table
   └─ Return trip_id
   ↓
3. User sees trip detail
   ↓
4. Click "Generate Itinerary"
   ↓
5. POST /api/itinerary/generate
   ├─ Verify trip ownership
   ├─ Call generateItinerary()
   │   └─ OpenAI GPT-4o-mini
   ├─ Parse response
   ├─ Insert to itineraries table
   └─ Return itinerary
   ↓
6. Display itinerary with tabs
```

### Rechercher Vols

```
1. User on trip detail
   ↓
2. Tab: "Vols Recommandés"
   ↓
3. Click "Rechercher les Vols"
   ↓
4. POST /api/trips/[id]/travel-options
   ├─ Get trip data
   ├─ Call Amadeus
   │   ├─ Get token
   │   ├─ Search
   │   └─ Normalize
   ├─ If error: return mock data
   ├─ Insert to flight_searches table
   └─ Return flights[]
   ↓
5. Display flights with price badge
```

## Authentification

### Workflow Auth

```
1. Signup/Login
   ↓
2. Supabase Auth
   ├─ Email/Password OR OAuth
   ├─ Generate JWT
   └─ Set secure cookie
   ↓
3. Middleware (src/middleware.ts)
   ├─ Check session on each request
   ├─ Refresh token if needed
   └─ Allow/block based on path
   ↓
4. Protected Routes (/dashboard/*)
   ├─ Require valid session
   └─ Redirect to /login if not
   ↓
5. API Routes
   ├─ Check auth.getUser()
   ├─ Verify ownership
   └─ Return 401 if not auth
```

### Session Management

```typescript
// Server-side (src/lib/supabase/server.ts)
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

// Checks cookie automatically
// Refresh token if needed
// Returns current user
```

## Base de Données

### Schema Overview

```sql
-- Users (managed by Supabase Auth)
auth.users (UUID, email, password)

-- Profiles
profiles (id, user_id, travel_style, budget, interests)

-- Trips
trips (id, user_id, destination, dates, budget, status)

-- Itineraries
itineraries (id, trip_id, content, generated_at)

-- Favorites
favorites (id, user_id, type, item_id, title, created_at)

-- Flight Searches (cached)
flight_searches (id, trip_id, origin, destination, results)

-- Hotel Searches (cached)
hotel_searches (id, trip_id, destination, results)
```

### RLS Policies

Every table has RLS:

```sql
-- Example: users can only see their own data
WHERE auth.uid() = user_id
```

## Best Practices

### 1. Type Safety

```typescript
// Good: Full types
async function getTrip(tripId: string): Promise<Trip> {
  // ...
}

// Avoid: Any types
async function getTrip(tripId: any): Promise<any> {
  // ...
}
```

### 2. Error Handling

```typescript
// Good: Explicit errors
try {
  const data = await amadeus.search();
} catch (error) {
  console.error('[Amadeus]', error);
  return mockData; // fallback
}

// Avoid: Silent failures
try {
  const data = await amadeus.search();
} catch (error) {
  // ignore
}
```

### 3. Logging

```typescript
//  Good: Prefixed logs
console.log('[Amadeus] Searching flights:', { from, to });
console.error('[Amadeus] Error:', error);

// Avoid: Generic logs
console.log('searching');
console.log('error');
```

### 4. API Routes

```typescript
// Good: Force dynamic for user routes
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUser(); // Supabase
  // ...
}

// Avoid: Missing dynamic for user-dependent routes
export async function GET() {
  const user = await getUser();
  // Gets pre-rendered → cached forever
}
```

---

---

# Technical Guide 

## Table of Contents

- [Project Architecture](#project-architecture)
- [Deployment Process](#deployment-process)
- [CI/CD Workflow](#cicd-workflow)
- [Folder Structure](#folder-structure)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Database](#database)
- [Best Practices](#best-practices-english)

## Project Architecture

Driftly is a modern full-stack application built with **Next.js 14**, **React 18**, and **Supabase**.

### Technology Stack

```
Frontend:  Next.js 14 + React 18 + TypeScript + Tailwind CSS
Backend:   Next.js API Routes (serverless)
Database:  Supabase (PostgreSQL + Auth)
AI:        OpenAI GPT-4o-mini
APIs:      Amadeus (flights), Pexels (images)
Testing:   Vitest (56 unit tests)
CI/CD:     GitHub Actions
Deploy:    Vercel recommended
```

### Architectural Layers

```
┌─────────────────────────────────────┐
│     Presentation Layer (React)      │ UI Components, Pages
├─────────────────────────────────────┤
│        API Layer (Routes)           │ Next.js endpoints
├─────────────────────────────────────┤
│      Service Layer (Business)       │ Core logic, integrations
├─────────────────────────────────────┤
│         Data Layer (DB)             │ Supabase, PostgreSQL
└─────────────────────────────────────┘
```

## Deployment Process

### Recommended: Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Vercel auto-deploys
# - Build Next.js
# - Run tests
# - Deploy to CDN
# - Get live URL

# 3. Environment variables set in Vercel dashboard
```

### Alternative: Docker + Kubernetes

```yaml
# Build
docker build -t driftly:latest .

# Deploy to K8s
kubectl apply -f k8s/deployment.yaml

# Scale
kubectl scale deployment driftly --replicas=3
```

## CI/CD Workflow

### GitHub Actions Pipeline

```yaml
On: push to main / PR to main
↓
Lint (ESLint)           → 0 errors required
↓
TypeScript Check        → strict mode
↓
Unit Tests (Vitest)     → 56 tests pass
↓
Build (Next.js)         → production build
↓
Deploy (Vercel)         → auto on main
```

**Status**: All green = production ready

## Folder Structure


| Folder                 | Purpose                              |
| ---------------------- | ------------------------------------ |
| `src/app/`             | Next.js 14 App Router pages & routes |
| `src/lib/`             | Business logic & utilities           |
| `src/components/`      | React components                     |
| `src/services/`        | External service integrations        |
| `src/types/`           | TypeScript type definitions          |
| `src/tests/`           | Unit, component, E2E tests           |
| `.github/workflows/`   | CI/CD pipeline                       |
| `supabase/migrations/` | Database schema                      |


## API Overview

### 14 Endpoints


| Endpoint                         | Method           | Purpose                     |
| -------------------------------- | ---------------- | --------------------------- |
| `/api/trips`                     | GET/POST         | List/create trips           |
| `/api/trips/[id]`                | GET/PATCH/DELETE | Trip operations             |
| `/api/itineraries`               | GET              | Fetch itinerary             |
| `/api/itinerary/generate`        | POST             | Generate IA itinerary       |
| `/api/trips/[id]/travel-options` | GET/POST         | Flights search              |
| `/api/trips/[id]/hotels`         | GET/POST         | Hotels search               |
| `/api/inspirations`              | GET              | Destination recommendations |
| `/api/favorites`                 | GET/POST/DELETE  | Like/unlike items           |
| `/api/profiles`                  | GET              | User profile                |
| `/api/health`                    | GET              | System health               |
| `/api/metrics`                   | GET              | Prometheus metrics          |


**All endpoints**: force-dynamic for user routes

## Authentication

### Flow

```
1. User login/signup
2. Supabase Auth (email or OAuth)
3. JWT token + secure cookie
4. Middleware checks session
5. Protected routes verified
6. API routes check user ownership
```

### Implementation

```typescript
// Get current user (server-side)
const { data: { user } } = await supabase.auth.getUser();

// Check authorization
if (!user) return 401;

// Verify ownership
if (trip.user_id !== user.id) return 403;
```

## Database

### Core Tables

- `profiles` - User preferences, budget, interests
- `trips` - Travel plans with dates, budget, status
- `itineraries` - Day-by-day plans, activities, budget
- `favorites` - Liked items (inspirations, trips)
- `flight_searches` - Cached flight search results
- `hotel_searches` - Cached hotel recommendations

### Row Level Security (RLS)

Every table enforces: `auth.uid() = user_id`

Users can only access their own data.

## Best Practices

### 1. Type Safety

- TypeScript strict mode enabled
- No `any` types without reason
- Interfaces for all major structures

### 2. Error Handling

- Explicit try/catch blocks
- Fallback data for API failures
- User-friendly error messages

### 3. Performance

- Database query optimization
- Image lazy loading (Pexels CDN)
- Code splitting (Next.js automatic)
- Caching where appropriate

### 4. Security

- No hardcoded secrets
- Environment variables for all credentials
- RLS on database tables
- HTTPS in production
- CORS configuration

### 5. Monitoring

- Prometheus metrics exported
- Server-side logging with prefixes
- Health check endpoint active
- Error tracking available

### 6. Testing

- Unit tests with Vitest (56 tests)
- Component tests with React Testing Library
- E2E tests with Playwright
- Coverage focused on critical paths

## Performance Metrics

- Build size: < 10MB
- API response time: < 1s (avg)
- Lighthouse score: > 90
- Database queries: indexed

## Development Workflow

```bash
# Start local dev
npm run dev

# Run quality checks
npm run lint          # ESLint
npx tsc --noEmit     # TypeScript
npm run test:unit    # Unit tests

# Build for production
npm run build

# Start production server
npm start
```

## Scaling Considerations

### Current Capacity

- Handles ~1000 concurrent users (Vercel free)
- Database: Supabase free tier (500MB)
- API calls: Rate limited externally (Amadeus, OpenAI, Pexels)

### Scaling Path

- Upgrade Vercel plan (auto-scaling)
- Upgrade Supabase (dedicated DB)
- Implement rate limiting
- Cache more aggressively
- CDN for static assets (included with Vercel)

