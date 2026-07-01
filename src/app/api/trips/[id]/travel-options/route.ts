import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchFlightOffers, getCityCode, type NormalizedFlightOffer } from "@/lib/amadeus";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type FlightSearchInsert = Database["public"]["Tables"]["flight_searches"]["Insert"];

interface RouteParams {
  params: {
    id: string;
  };
}

interface TravelOptionsRequest {
  departure_city?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  travelers_count?: number;
}

/**
 * POST /api/trips/[id]/travel-options
 * Search for flights using Amadeus API and save results to flight_searches table.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const tripId = params.id;

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify trip belongs to user
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Parse request body for overrides
    let requestData: TravelOptionsRequest = {};
    try {
      requestData = await request.json();
    } catch {
      // If no body, use trip data
    }

    // Use request data or fall back to trip data
    const departure_city = requestData.departure_city || trip.departure_city;
    const destination = requestData.destination || trip.destination;
    const start_date = requestData.start_date || trip.start_date;
    const end_date = requestData.end_date || trip.end_date;
    const travelers_count = requestData.travelers_count || trip.travelers_count || 1;

    // Validate required fields
    if (!departure_city || !destination || !start_date) {
      return NextResponse.json(
        {
          error: "Missing required fields: departure_city, destination, start_date",
        },
        { status: 400 }
      );
    }

    // Convert city names to IATA codes
    const originCode = getCityCode(departure_city);
    const destinationCode = getCityCode(destination);

    console.log("[Travel Options] Searching flights:", {
      trip_id: tripId,
      origin: originCode,
      destination: destinationCode,
      date: start_date,
      travelers: travelers_count,
    });

    // Search flights via Amadeus
    const flights = await searchFlightOffers({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: start_date,
      returnDate: end_date || undefined,
      adults: travelers_count,
      currencyCode: "EUR",
      max: 5,
    });

    if (flights.length === 0) {
      console.warn("[Travel Options] No flights found, returning mock data");
      // Return mock data as fallback
      const mockFlights = getMockFlights(originCode, destinationCode);
      return NextResponse.json(
        {
          message: "No real flights found, using mock data",
          flights: mockFlights,
          saved: false,
        },
        { status: 200 }
      );
    }

    // Find cheapest price
    const cheapestPrice = Math.min(...flights.map((f) => f.price));

    // Prepare flight search record with serialized flights
    const flightSearchData: FlightSearchInsert = {
      trip_id: tripId,
      provider: "Amadeus",
      search_params: {
        origin: originCode,
        destination: destinationCode,
        departure_date: start_date,
        return_date: end_date || undefined,
        travelers: travelers_count,
      },
      results: flights as unknown as Database["public"]["Tables"]["flight_searches"]["Insert"]["results"],
      cheapest_price: cheapestPrice,
      currency: "EUR",
    };

    // Save to database
    const { data: savedSearch, error: saveError } = await supabase
      .from("flight_searches")
      .insert([flightSearchData])
      .select()
      .single();

    if (saveError) {
      console.error("[Travel Options] Failed to save flight search:", saveError);
      // Don't fail the request, just return the flights without saving
      return NextResponse.json(
        {
          message: "Flights found but could not save to database",
          flights,
          saved: false,
        },
        { status: 200 }
      );
    }

    console.log(
      "[Travel Options] Saved flight search:",
      savedSearch.id,
      `(${flights.length} flights)`
    );

    return NextResponse.json(
      {
        message: "Flight search completed",
        flights,
        saved: true,
        search_id: savedSearch.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Travel Options] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Failed to search flights",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trips/[id]/travel-options
 * Retrieve the latest flight search for a trip.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const tripId = params.id;

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify trip belongs to user
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id")
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Get latest flight search for this trip
    const { data: searches, error: searchError } = await supabase
      .from("flight_searches")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (searchError) {
      console.error("[Travel Options] Failed to fetch flight searches:", searchError);
      return NextResponse.json(
        { error: "Failed to fetch flight searches" },
        { status: 500 }
      );
    }

    if (!searches || searches.length === 0) {
      return NextResponse.json(
        { message: "No flight searches found", flights: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { flights: searches[0].results || [], search: searches[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Travel Options] GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Mock flight data as fallback
 */
function getMockFlights(origin: string, destination: string): NormalizedFlightOffer[] {
  return [
    {
      airline: "AF",
      departure_airport: origin,
      arrival_airport: destination,
      departure_time: new Date(Date.now() + 86400000).toISOString(),
      arrival_time: new Date(Date.now() + 86400000 + 7200000).toISOString(),
      duration: "2h",
      stops: 0,
      price: 150,
      currency: "EUR",
      booking_source: "Amadeus",
    },
    {
      airline: "LH",
      departure_airport: origin,
      arrival_airport: destination,
      departure_time: new Date(Date.now() + 86400000 + 14400).toISOString(),
      arrival_time: new Date(Date.now() + 86400000 + 21600000).toISOString(),
      duration: "2h 30m",
      stops: 1,
      price: 120,
      currency: "EUR",
      booking_source: "Amadeus",
    },
    {
      airline: "KL",
      departure_airport: origin,
      arrival_airport: destination,
      departure_time: new Date(Date.now() + 86400000 + 28800).toISOString(),
      arrival_time: new Date(Date.now() + 86400000 + 36000000).toISOString(),
      duration: "2h 45m",
      stops: 0,
      price: 165,
      currency: "EUR",
      booking_source: "Amadeus",
    },
  ];
}
