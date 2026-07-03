# API Documentation

## Vue d'Ensemble

Driftly expose **14 endpoints API** via Next.js API Routes. Tous les endpoints qui utilisent Supabase/authentification sont marqués `export const dynamic = "force-dynamic"`.

**Base URL**: `http://localhost:3000` (dev) ou `https://driftly-two.vercel.app` (production)

**Authentication**: Supabase session via cookies (automatique)

## Authentication Endpoints

### POST /auth/callback

**Callback OAuth Supabase**

```
Method: POST
URL: /auth/callback
Params: code (query string from Supabase)
Auth: None required
```

**Response Success (302 Redirect)**:

```
Location: /dashboard
Set-Cookie: supabase auth cookies
```

**Response Error**:

```
Location: /login?error=...
```

## User Endpoints

### GET /api/profiles

**Fetch utilisateur connecté profile**

```
Method: GET
URL: /api/profiles
Auth: Required (Supabase session)
Dynamic: YES (force-dynamic)
```

**Response (200)**:

```json
{
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "travel_style": "moderate",
    "budget_preference": 2500,
    "interests": ["culture", "nature"],
    "created_at": "2026-06-01T...",
    "updated_at": "2026-07-02T..."
  }
}
```

**Errors**:

- `401` - Unauthorized (no session)
- `500` - Database error

## Trips Endpoints

### GET /api/trips

**List tous les voyages de l'utilisateur**

```
Method: GET
URL: /api/trips
Auth: Required
Dynamic: YES (force-dynamic)
```

**Response (200)**:

```json
{
  "trips": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "destination": "Paris",
      "departure_city": "Lyon",
      "start_date": "2026-08-01",
      "end_date": "2026-08-07",
      "budget": 2000,
      "travelers_count": 2,
      "travel_style": "cultural",
      "interests": ["museums", "cuisine"],
      "cover_image": "https://...",
      "created_at": "2026-07-01T...",
      "status": "planned"
    }
  ]
}
```

**Errors**:

- `401` - Unauthorized
- `500` - Database error

### POST /api/trips

**Créer nouveau voyage**

```
Method: POST
URL: /api/trips
Auth: Required
Dynamic: YES (force-dynamic)
Content-Type: application/json
```

**Request Body**:

```json
{
  "destination": "Rome",
  "departure_city": "Paris",
  "start_date": "2026-08-15",
  "end_date": "2026-08-22",
  "budget": 2500,
  "travelers_count": 2,
  "travel_style": "cultural",
  "interests": ["history", "art"]
}
```

**Response (201)**:

```json
{
  "success": true,
  "trip": { "id": "uuid", ... }
}
```

**Errors**:

- `400` - Missing/invalid fields
- `401` - Unauthorized
- `500` - Database error

### GET /api/trips/[id]

**Fetch détail d'un voyage**

```
Method: GET
URL: /api/trips/{trip_id}
Auth: Required
Dynamic: YES (force-dynamic)
```

**Response (200)**:

```json
{
  "trip": { ... (same as above) }
}
```

**Errors**:

- `401` - Unauthorized
- `404` - Trip not found or not owned by user
- `500` - Database error

### PATCH /api/trips/[id]

**Modifier un voyage**

```
Method: PATCH
URL: /api/trips/{trip_id}
Auth: Required
Dynamic: YES (force-dynamic)
Content-Type: application/json
```

**Request Body** (tous les champs optionnels):

```json
{
  "destination": "Venice",
  "budget": 3000,
  "interests": ["art", "cuisine"]
}
```

**Response (200)**:

```json
{
  "success": true,
  "trip": { ... updated trip }
}
```

### DELETE /api/trips/[id]

**Supprimer un voyage**

```
Method: DELETE
URL: /api/trips/{trip_id}
Auth: Required
Dynamic: YES (force-dynamic)
```

**Response (200)**:

```json
{
  "success": true,
  "message": "Trip deleted"
}
```

## Itinerary Endpoints

### GET /api/itineraries

**Fetch itinéraire d'un voyage**

```
Method: GET
URL: /api/itineraries?trip_id={trip_id}
Auth: Required
Dynamic: YES (force-dynamic)
```

**Query Params**:

- `trip_id` (required): UUID of trip

**Response (200)**:

```json
{
  "itinerary": {
    "id": "uuid",
    "trip_id": "uuid",
    "title": "Évasion Romantique à Rome",
    "summary": "3 jours de découverte...",
    "days": [
      {
        "day": 1,
        "title": "Arrivée et Colosseum",
        "activities": [
          {
            "name": "Visite Colosseum",
            "description": "...",
            "time": "14:00",
            "duration": 2,
            "location": "Colosseum, Rome"
          }
        ]
      }
    ],
    "generated_content": { ... raw JSON from OpenAI },
    "created_at": "2026-07-01T..."
  }
}
```

**Errors**:

- `401` - Unauthorized
- `404` - Itinerary not found
- `500` - Database error

### POST /api/itinerary/generate

**Générer nouvel itinéraire IA**

```
Method: POST
URL: /api/itinerary/generate
Auth: Required
Dynamic: YES (force-dynamic)
Content-Type: application/json
```

**Request Body**:

```json
{
  "trip_id": "uuid",
  "num_days": 3,
  "budget": 2500,
  "travel_style": "cultural",
  "interests": ["history", "museums", "restaurants"]
}
```

**Response (200)**:

```json
{
  "success": true,
  "itinerary": { ... (same structure as GET) }
}
```

**Errors**:

- `400` - Invalid request
- `401` - Unauthorized
- `404` - Trip not found
- `500` - OpenAI API error

## Hotels & Flights

### GET /api/trips/[id]/hotels

**Fetch hôtels recommandés pour un voyage**

```
Method: GET
URL: /api/trips/{trip_id}/hotels
Auth: Required
Dynamic: YES (force-dynamic)
```

**Response (200)**:

```json
{
  "hotels": [
    {
      "id": "hotel-paris-0",
      "name": "Paris Hotel Central",
      "location": "Paris",
      "rating": 4.5,
      "price_per_night": 120,
      "total_price": 360,
      "currency": "EUR",
      "image_url": "https://pexels.com/...",
      "amenities": ["WiFi", "Breakfast", "Pool"],
      "badge": "Meilleur choix",
      "description": "Hôtel 3-4 étoiles idéal...",
      "nights": 3
    }
  ]
}
```

### POST /api/trips/[id]/hotels

**Générer nouvelles recommandations hôtels**

```
Method: POST
URL: /api/trips/{trip_id}/hotels
Auth: Required
Dynamic: YES (force-dynamic)
```

**Request Body**: Empty (utilise données trip)

**Response (200)**:

```json
{
  "success": true,
  "count": 3,
  "hotels": [ ... ]
}
```

### GET /api/trips/[id]/travel-options

**Fetch vols recommandés**

```
Method: GET
URL: /api/trips/{trip_id}/travel-options
Auth: Required
Dynamic: YES (force-dynamic)
```

**Response (200)**:

```json
{
  "flights": [
    {
      "airline": "AF",
      "departure_airport": "CDG",
      "arrival_airport": "FCO",
      "departure_time": "2026-08-15T08:00:00Z",
      "arrival_time": "2026-08-15T10:00:00Z",
      "duration": "2h",
      "stops": 0,
      "price": 150,
      "currency": "EUR",
      "booking_source": "Amadeus"
    }
  ]
}
```

### POST /api/trips/[id]/travel-options

**Rechercher nouveaux vols (Amadeus)**

```
Method: POST
URL: /api/trips/{trip_id}/travel-options
Auth: Required
Dynamic: YES (force-dynamic)
```

**Request Body**: Empty

**Response (200)**:

```json
{
  "success": true,
  "count": 5,
  "flights": [ ... ]
}
```

**Note**: Si Amadeus échoue, fallback mock data

## Inspirations Endpoint

### GET /api/inspirations

**Fetch destinations inspirantes personnalisées**

```
Method: GET
URL: /api/inspirations
Auth: Required
Dynamic: YES (force-dynamic)
```

**Response (200)**:

```json
{
  "success": true,
  "count": 10,
  "inspirations": [
    {
      "id": "inspiration-1",
      "destination": "Santorini",
      "country": "Greece",
      "title": "Paradise Island",
      "description": "Beautiful white-washed...",
      "travel_style": "romantic",
      "interests": ["beaches", "sunset"],
      "estimated_price_per_day": 200,
      "rating": 4.8,
      "image_query": "Santorini Greece travel",
      "image_url": "https://pexels.com/...",
      "reason": "Perfect romantic getaway"
    }
  ]
}
```

## Favorites Endpoints

### GET /api/favorites

**List tous les favoris de l'utilisateur**

```
Method: GET
URL: /api/favorites
Auth: Required
Dynamic: YES (force-dynamic)
```

**Response (200)**:

```json
{
  "favorites": [
    {
      "id": "uuid",
      "type": "inspiration",
      "item_id": "inspiration-1",
      "title": "Paradise Island",
      "destination": "Santorini",
      "country": "Greece",
      "image_url": "https://...",
      "metadata": { "interests": ["beaches"] },
      "created_at": "2026-07-01T..."
    }
  ]
}
```

### POST /api/favorites

**Ajouter/retirer un favori (toggle)**

```
Method: POST
URL: /api/favorites
Auth: Required
Dynamic: YES (force-dynamic)
Content-Type: application/json
```

**Request Body**:

```json
{
  "type": "inspiration",
  "item_id": "inspiration-1",
  "title": "Paradise Island",
  "destination": "Santorini",
  "country": "Greece",
  "image_url": "https://...",
  "metadata": {
    "interests": ["beaches", "sunset"],
    "rating": 4.8
  }
}
```

**Response (200)**:

```json
{
  "action": "added",
  "isFavorite": true
}
```

ou

```json
{
  "action": "removed",
  "isFavorite": false
}
```

### DELETE /api/favorites

**Supprimer un favori explicitement**

```
Method: DELETE
URL: /api/favorites
Auth: Required
Dynamic: YES (force-dynamic)
Content-Type: application/json
```

**Request Body**:

```json
{
  "type": "inspiration",
  "item_id": "inspiration-1"
}
```

**Response (200)**:

```json
{
  "action": "removed",
  "isFavorite": false
}
```

## Health & Metrics

### GET /api/health

**System health check**

```
Method: GET
URL: /api/health
Auth: None required
Dynamic: NO (static allowed)
```

**Response (200)**:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-02T09:39:00Z",
  "database": "connected",
  "external_apis": {
    "openai": "ok",
    "amadeus": "ok",
    "pexels": "ok"
  }
}
```

### GET /api/metrics

**Prometheus metrics endpoint**

```
Method: GET
URL: /api/metrics
Auth: None required (in production: require token)
Dynamic: NO (static allowed)
Content-Type: text/plain
```

**Response**:

```
# HELP requests_total Total API requests
# TYPE requests_total counter
requests_total{path="/api/trips",method="GET"} 1250

# HELP request_duration_ms Request duration in milliseconds
# TYPE request_duration_ms histogram
request_duration_ms_bucket{path="/api/trips",le="100"} 800
```

## Images Search

### GET /api/images/search

**Search images (internal, for admin)**

```
Method: GET
URL: /api/images/search?query={query}&count={count}
Auth: None (internal use)
Dynamic: NO
```

**Query Params**:

- `query` (required): Search term
- `count` (optional, default 5): Number of images

**Response (200)**:

```json
{
  "images": [
    {
      "id": "pexels-123",
      "url": "https://images.pexels.com/...",
      "photographer": "John Doe"
    }
  ]
}
```

## Error Handling

### Standard Error Response

All errors return consistent format:

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2026-07-02T09:39:00Z"
}
```

### Common Status Codes


| Code  | Meaning      | Example                |
| ----- | ------------ | ---------------------- |
| `200` | OK           | Successful request     |
| `201` | Created      | Trip created           |
| `400` | Bad Request  | Invalid parameters     |
| `401` | Unauthorized | No/invalid session     |
| `404` | Not Found    | Trip doesn't exist     |
| `409` | Conflict     | Item already favorited |
| `500` | Server Error | Database error         |


## Authentication Header

Most endpoints require authentication but it's **automatic** via Supabase cookies.

**Manual authentication** (if needed):

```
GET /api/trips
Cookie: sb-access-token=jwt_token; sb-refresh-token=jwt_token
```

Or if implementing custom auth:

```
GET /api/trips
Authorization: Bearer jwt_token
```

## Rate Limiting

Currently: **No rate limiting**

In production, implement:

- Per-user rate limits (e.g., 100 requests/min)
- Per-endpoint limits (e.g., 10 /api/itinerary/generate calls/hour)
- IP-based rate limiting

## Integration Examples

### Create Trip + Generate Itinerary (JavaScript)

```javascript
// 1. Create trip
const tripRes = await fetch('/api/trips', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destination: 'Paris',
    departure_city: 'Lyon',
    start_date: '2026-08-01',
    end_date: '2026-08-07',
    budget: 2000,
    travelers_count: 2,
    travel_style: 'cultural',
    interests: ['museums', 'cuisine']
  })
});
const { trip } = await tripRes.json();

// 2. Generate itinerary
const itRes = await fetch('/api/itinerary/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trip_id: trip.id,
    num_days: 7,
    budget: 2000,
    travel_style: 'cultural',
    interests: ['museums', 'cuisine']
  })
});
const { itinerary } = await itRes.json();
console.log(itinerary);
```

