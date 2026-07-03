# Architecture de Driftly

## Table des Matières

- [Vue Générale](#vue-générale)
- [Stack Technique](#stack-technique)
- [Architecture Système](#architecture-système)
- [Flux de Données](#flux-de-données)
- [Couches Métier](#couches-métier)

## Vue Générale

Driftly suit une **architecture moderne full-stack** basée sur:

```
┌─────────────────────────────────────────────────┐
│         Frontend (Next.js 14 + React)           │
│  ┌───────────────────────────────────────────┐  │
│  │  Pages / Routes (App Router)              │  │
│  │  - Landing, Auth, Dashboard, Trips        │  │
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│         API Layer (Next.js Routes)              │
│  ┌───────────────────────────────────────────┐  │
│  │  /api/* - 14 endpoints                    │  │
│  │  - force-dynamic pour Supabase            │  │
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│         Service Layer (Business Logic)          │
│  ┌───────────────────────────────────────────┐  │
│  │  - inspirations-service.ts                │  │
│  │  - hotels.ts                              │  │
│  │  - amadeus.ts (flights)                   │  │
│  │  - favorites-service.ts                   │  │
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│         Backend Services (External)             │
│  ┌──────┬──────────┬─────────┬────────────┐    │
│  │OpenAI│ Amadeus  │ Pexels  │ Supabase   │    │
│  │(IA)  │(Flights) │(Images) │(Auth+DB)   │    │
│  └──────┴──────────┴─────────┴────────────┘    │
└─────────────────────────────────────────────────┘
```

### Principes Architecturaux

1. **Separation of Concerns** - Services métier isolés
2. **Type Safety** - TypeScript strict partout
3. **Security First** - RLS, SSR, server components
4. **Performance** - Caching, lazy loading, optimizations
5. **Monitoring** - Prometheus metrics intégrés

## Stack Technique Détaillé

### Frontend


| Couche           | Technology    | Version | Rôle                            |
| ---------------- | ------------- | ------- | ------------------------------- |
| **Framework**    | Next.js       | 14.2.35 | App Router, SSR, API Routes     |
| **UI Library**   | React         | 18      | Components, state management    |
| **Styling**      | Tailwind CSS  | 3.4.1   | Utility-first CSS               |
| **Components**   | shadcn/ui     | latest  | Pre-built accessible components |
| **Animation**    | Framer Motion | 12.41.0 | Smooth animations               |
| **Icon Library** | Lucide React  | 1.8.0   | SVG icons                       |
| **Language**     | TypeScript    | 5       | Type safety                     |


**Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

### Backend / API


| Couche          | Technology | Version | Rôle                  |
| --------------- | ---------- | ------- | --------------------- |
| **Runtime**     | Node.js    | 20.20.2 | JavaScript runtime    |
| **Package Mgr** | npm        | 10.8.2  | Dependency management |
| **Language**    | TypeScript | 5       | Type safety           |
| **API Routes**  | Next.js    | 14.2.35 | Serverless functions  |


**API Design**: RESTful avec `export const dynamic = "force-dynamic"` pour routes dynamiques

### Authentication & Data


| Service          | Provider              | Purpose                   |
| ---------------- | --------------------- | ------------------------- |
| **Auth**         | Supabase Auth         | User management, OAuth2   |
| **Database**     | PostgreSQL (Supabase) | Data persistence          |
| **Row Security** | RLS (Supabase)        | Data-level security       |
| **Session**      | Supabase SSR          | Secure session management |


**Connection**: `@supabase/ssr` pour Next.js + cookies

### External APIs


| API         | Provider | Version     | Purpose                   | Limit     |
| ----------- | -------- | ----------- | ------------------------- | --------- |
| **IA**      | OpenAI   | gpt-4o-mini | Génération itinéraires    | ~         |
| **Flights** | Amadeus  | v2          | Recherche vols temps réel | Test API  |
| **Images**  | Pexels   | v1          | Stock photos              | Free tier |


### Testing Stack


| Framework     | Version               | Scope  | Tests            |
| ------------- | --------------------- | ------ | ---------------- |
| **Unit**      | Vitest                | 4.1.9  | Services, utils  |
| **Component** | React Testing Library | 16.3.2 | React components |
| **E2E**       | Playwright            | 1.61.1 | User flows       |


## Architecture Système

### Dossier Structure

```
driftly/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)                  # Landing, auth pages
│   │   ├── dashboard/                # Protected dashboard
│   │   │   ├── page.tsx              # Home dashboard
│   │   │   ├── trips/                # Trip management
│   │   │   ├── inspiration/          # Destinations explorer
│   │   │   ├── favorites/            # Saved items
│   │   │   └── settings/             # User preferences
│   │   └── api/                      # Backend endpoints
│   │       ├── trips/                # Trip CRUD
│   │       ├── itineraries/          # Itinerary fetch
│   │       ├── inspirations/         # Destination recommendations
│   │       ├── favorites/            # Favorites CRUD
│   │       └── ...
│   ├── lib/                          # Business logic
│   │   ├── supabase/                 # DB clients
│   │   │   ├── server.ts             # Server-side client
│   │   │   └── admin.ts              # Admin client
│   │   ├── amadeus.ts                # Flights integration
│   │   ├── pexels.ts                 # Images service
│   │   ├── hotels.ts                 # Hotel recommendations
│   │   ├── inspirations-service.ts   # Destinations generator
│   │   ├── favorites-service.ts      # Favorites logic
│   │   ├── monitoring/               # Prometheus metrics
│   │   └── travel/                   # Domain logic
│   │       ├── budget-calculator.ts  # Budget operations
│   │       ├── country-info.ts       # Country data
│   │       ├── trip-status.ts        # Trip status logic
│   │       └── activity-images.ts    # Activity images
│   ├── components/                   # React components
│   │   ├── ui/                       # Shadcn UI components
│   │   ├── dashboard/                # Dashboard components
│   │   ├── landing/                  # Landing components
│   │   └── forms/                    # Form components
│   ├── services/                     # External service wrappers
│   │   ├── ai/                       # AI services
│   │   │   └── generate-itinerary.ts # Itinerary generation
│   │   └── ...
│   ├── types/                        # TypeScript types
│   │   ├── database.ts               # Auto-generated from Supabase
│   │   ├── itinerary.ts              # Itinerary structures
│   │   └── ...
│   ├── middleware.ts                 # Auth middleware
│   └── tests/                        # Test files
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD
├── supabase/
│   ├── migrations/                   # Database migrations
│   └── seed.sql                      # Initial data
├── public/                           # Static assets
├── docs/                             # Documentation
└── package.json
```

### Organisation par Couches

#### Couche Présentation (UI)

```typescript
// src/components/dashboard/trip-detail-premium.tsx
- React functional components
- Framer Motion animations
- Tailwind CSS styling
- Client-side state (useState, useEffect)
- Server/Client boundary management
```

#### Couche API (Routes)

```typescript
// src/app/api/trips/route.ts
- export const dynamic = "force-dynamic" 
- POST/GET request handlers
- Authentication check (getUser)
- Service layer calls
- Response formatting + error handling
```

#### Couche Services (Business Logic)

```typescript
// src/lib/amadeus.ts | src/lib/hotels.ts | src/lib/inspirations-service.ts
- Core business logic
- External API integration
- Data transformation
- Validation
- Error handling with fallbacks
```

#### Couche Data (Persistence)

```typescript
// Supabase via src/lib/supabase/server.ts
- PostgreSQL database
- Row Level Security (RLS)
- Authentication
- Session management
```

## Flux de Données

### Exemple: Créer un Voyage + Générer Itinéraire

```
1. User Page (Dashboard)
   └─> Formulaire + Submit
       └─> POST /api/trips

2. API Route (src/app/api/trips/route.ts)
   └─> Verify User (auth)
   └─> Validate Data
   └─> Call Service

3. Service Layer (src/lib/trips/)
   └─> Generate Trip Object
   └─> Insert to DB (Supabase)
   └─> Return Trip with ID

4. API Response
   └─> { success: true, trip_id: "..." }

5. User Page (Refetch)
   └─> Display new Trip

6. Generate Itinerary (User clicks "Generate")
   └─> POST /api/itinerary/generate

7. API Route (itinerary/generate/route.ts)
   └─> Verify User + Trip Ownership
   └─> Call OpenAI (gpt-4o-mini)

8. AI Service (services/ai/generate-itinerary.ts)
   └─> Format Prompt
   └─> Stream Response from OpenAI
   └─> Parse JSON
   └─> Save to DB

9. Itinerary Page
   └─> Display Generated Content
```

### Authentification Flow

```
1. User Signup/Login
   └─> Supabase Auth Form
   └─> POST auth endpoint

2. OAuth Callback
   └─> /auth/callback
   └─> Supabase returns session

3. Session Management
   └─> Middleware (src/middleware.ts)
   └─> Refresh token if needed
   └─> Protect routes

4. Server Components
   └─> Verify session
   └─> Access user context
   └─> Fetch user data

5. Protected Routes
   └─> /dashboard/* require authentication
   └─> Redirect to /login if not auth
```

### Search Flow (Flights/Hotels)

```
Trip Detail Page
  │
  ├─> POST /api/trips/[id]/travel-options
  │   └─> API: Call Amadeus
  │   │   └─> Format Request
  │   │   └─> Handle Errors → Mock Data
  │   │   └─> Return Flights
  │   └─> Save to flight_searches table
  │
  └─> POST /api/trips/[id]/hotels
      └─> API: Call Hotel Generator
      │   └─> Analyze user profile
      │   │   (budget, style, destination)
      │   └─> Generate 3 hotel options
      │   │   - Budget, Moderate, Premium
      │   └─> Fetch images (Pexels)
      │   └─> Return hotels
      └─> Save to hotel_searches table
```

## Couches Métier

### Inspirations Module

**File**: `src/lib/inspirations-service.ts`

```typescript
Interface Inspiration {
  id: string
  destination: string
  country: string
  title: string
  description: string
  travel_style: "budget" | "moderate" | "premium"
  interests: string[]
  estimated_price_per_day: number
  rating: number
  image_query: string
  image_url?: string
}
```

**Logic**:

1. Filter destinations by user profile
2. Match travel_style + budget
3. Enrich with images (Pexels)
4. Return top recommendations

### Hotels Module

**File**: `src/lib/hotels.ts`

```typescript
Interface HotelRecommendation {
  id: string
  name: string
  location: string
  rating: number
  price_per_night: number
  total_price: number
  currency: string
  image_url?: string
  amenities: string[]
  badge: "Meilleur choix" | "Économique" | "Premium" | "Luxe"
  description: string
  nights: number
}
```

**Logic**:

1. Calculate nights from dates
2. Select tier (budget/moderate/premium)
3. Generate 3 hotel options
4. Fetch images per hotel
5. Persist to hotel_searches table

### Flights Module

**File**: `src/lib/amadeus.ts`

```typescript
Interface NormalizedFlightOffer {
  airline: string
  departure_airport: string
  arrival_airport: string
  departure_time: string
  arrival_time: string
  duration: string
  stops: number
  price: number
  currency: string
  booking_source: "Amadeus"
}
```

**Logic**:

1. Get user token from Amadeus
2. Search flights with params
3. Normalize response
4. Fallback to mock if fails
5. Save to flight_searches table

### Favorites Module

**File**: `src/lib/favorites-service.ts`

```typescript
Interface Favorite {
  id: string
  user_id: string
  type: "inspiration" | "trip"
  item_id: string
  title: string
  destination: string
  country?: string
  image_url?: string
  metadata?: Record<string, unknown>
  created_at: string
}
```

**Logic**:

1. Check if already favorited
2. Toggle: add or remove
3. Persist to favorites table
4. RLS ensures user isolation

## Sécurité

### Authentication

- **Supabase Auth**: OAuth2, email/password, magic links
- **Session Management**: Secure cookies via Supabase SSR
- **Middleware**: Verify session at request time

### Database Security

- **RLS Policies**: Every table has row-level security
- **User Isolation**: `auth.uid() = user_id` checks
- **No Secrets**: Credentials never in code

### API Security

- **Auth Required**: All user routes require `getUser()` check
- **Trip Ownership**: Verify user owns trip before returning
- **No Overexposure**: Minimal data returned

### Environment

- **Secrets**: Via `.env.local` (development) or GitHub Secrets
- **No Hardcoded Keys**: All APIs use environment variables
- **Server-side Only**: Pexels, OpenAI, Amadeus keys never reach client

## Monitoring & Observability

### Prometheus Metrics

**Location**: `src/lib/monitoring/`

```typescript
- request_duration_ms         // API response time
- database_queries_count      // DB operations
- ai_api_calls_count         // OpenAI calls
- flights_search_count       // Amadeus searches
- errors_total               // Error tracking
```

### Logging

- **Server Logs**: `console.log/error` with prefixes
  - `[Amadeus]` - Flight API logs
  - `[Hotels]` - Hotel generation logs
  - `[API]` - Route handlers
  - `[Favorites]` - Favorite operations
- **Error Tracking**: Structured error objects

### Health Checks

- **Endpoint**: `GET /api/health`
- **Returns**: System status, DB connection, API availability

## Performance Considerations

1. **Caching**: Next.js automatic caching where appropriate
2. **Images**: Pexels CDN + lazy loading
3. **Bundle Size**: Tree-shaking, code splitting
4. **Database**: Indexed queries on user_id, trip_id
5. **API Calls**: Timeouts + fallbacks for external services

## Extensibility

The architecture supports:

- Adding new external APIs (search, booking, payments)
- New destination recommendation algorithms
- Additional IA providers (Claude, etc.)
- Mobile app via shared API
- Admin dashboard features
- Notifications system

