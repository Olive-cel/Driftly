import { cache } from "react";

const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

interface AmadeusTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface AmadeusFlightSearchResponse {
  data: unknown[];
  dictionaries?: {
    locations?: Record<string, unknown>;
    aircraft?: Record<string, unknown>;
    currencies?: Record<string, unknown>;
    carriers?: Record<string, unknown>;
  };
}

export interface NormalizedFlightOffer {
  airline: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  booking_source: "Amadeus";
}

// City code mapping
const CITY_CODE_MAP: Record<string, string> = {
  paris: "PAR",
  rome: "ROM",
  accra: "ACC",
  cotonou: "COO",
  tokyo: "TYO",
  bali: "DPS",
  "new york": "NYC",
  nyc: "NYC",
  londres: "LON",
  london: "LON",
  lisbonne: "LIS",
  lisbon: "LIS",
  barcelone: "BCN",
  barcelona: "BCN",
  amsterdam: "AMS",
  marrakech: "RAK",
  marrakesh: "RAK",
};

function getCityCode(cityName: string): string {
  const normalized = cityName.toLowerCase().trim();
  return CITY_CODE_MAP[normalized] || normalized.toUpperCase().slice(0, 3);
}

// Cache token for 50 minutes (expires_in is typically 60 minutes)
const getAmadeusToken = cache(async (): Promise<string> => {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Amadeus credentials: AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET"
    );
  }

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[Amadeus] Token error:", error);
    throw new Error(`Failed to get Amadeus token: ${response.status}`);
  }

  const data = (await response.json()) as AmadeusTokenResponse;
  return data.access_token;
});

export async function searchFlightOffers(params: {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  currencyCode?: string;
  max?: number;
}): Promise<NormalizedFlightOffer[]> {
  try {
    const token = await getAmadeusToken();

    // Build query parameters
    const queryParams = new URLSearchParams({
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDate: params.departureDate,
      adults: params.adults.toString(),
      currencyCode: params.currencyCode || "EUR",
      max: (params.max || 5).toString(),
    });

    if (params.returnDate) {
      queryParams.append("returnDate", params.returnDate);
    }

    const url = `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${queryParams.toString()}`;

    console.log("[Amadeus] Searching flights:", {
      from: params.originLocationCode,
      to: params.destinationLocationCode,
      date: params.departureDate,
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Encoding": "gzip, deflate",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Amadeus] Search error:", response.status, error);
      return [];
    }

    const data = (await response.json()) as AmadeusFlightSearchResponse;

    if (!data.data || data.data.length === 0) {
      console.log("[Amadeus] No flights found");
      return [];
    }

    // Normalize results
    return data.data.map((offer) => normalizeFlightOffer(offer));
  } catch (error) {
    console.error("[Amadeus] Search failed:", error);
    return [];
  }
}

function normalizeFlightOffer(offer: unknown): NormalizedFlightOffer {
  // Type guard - assume offer has the expected structure
  const offerData = offer as Record<string, unknown>;
  const itineraries = offerData.itineraries as Array<{
    duration: string;
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      stops?: Array<{ iataCode: string }>;
    }>;
  }>;
  const price = offerData.price as {
    currency: string;
    total: string;
  };

  const itinerary = itineraries[0];
  const firstSegment = itinerary.segments[0];
  const lastSegment = itinerary.segments[itinerary.segments.length - 1];

  const stops = itinerary.segments.reduce((acc, segment) => {
    return acc + (segment.stops?.length || 0);
  }, 0);

  const durationStr = parseDuration(itinerary.duration);

  return {
    airline: firstSegment.carrierCode,
    departure_airport: firstSegment.departure.iataCode,
    arrival_airport: lastSegment.arrival.iataCode,
    departure_time: firstSegment.departure.at,
    arrival_time: lastSegment.arrival.at,
    duration: durationStr,
    stops,
    price: parseFloat(price.total),
    currency: price.currency,
    booking_source: "Amadeus",
  };
}

function parseDuration(iso8601: string): string {
  // Parse ISO 8601 duration like PT2H30M
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso8601;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;

  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

export { getCityCode };
