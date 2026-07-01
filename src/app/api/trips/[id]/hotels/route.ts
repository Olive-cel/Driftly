import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateHotelRecommendations, getMockHotels, type HotelRecommendation } from "@/lib/hotels";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type HotelSearchInsert = Database["public"]["Tables"]["hotel_searches"]["Insert"];

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/trips/[id]/hotels
 * Search for hotels and save results to hotel_searches table.
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
      console.log("[Hotels API] POST: Unauthorized");
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
      console.log("[Hotels API] POST: Trip not found");
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    console.log(`[Hotels API] POST: userId=${user.id}, tripId=${tripId}`);

    // Generate hotels
    let hotels: HotelRecommendation[];
    try {
      console.log("[Hotels API] Attempting to generate hotels with images");
      hotels = await generateHotelRecommendations({
        destination: trip.destination || "Destination",
        start_date: trip.start_date || new Date().toISOString(),
        end_date: trip.end_date || new Date(Date.now() + 86400000).toISOString(),
        travelers_count: trip.travelers_count || 1,
        budget: trip.budget || undefined,
        travel_style: trip.travel_style || undefined,
      });
    } catch (err) {
      console.warn("[Hotels API] Failed to generate with images, using mock:", err);
      hotels = getMockHotels({
        destination: trip.destination || "Destination",
        start_date: trip.start_date || new Date().toISOString(),
        end_date: trip.end_date || new Date(Date.now() + 86400000).toISOString(),
        travelers_count: trip.travelers_count || 1,
        budget: trip.budget || undefined,
        travel_style: trip.travel_style || undefined,
      });
    }

    // Save to Supabase
    const hotelSearchData: HotelSearchInsert = {
      user_id: user.id,
      trip_id: tripId,
      destination: trip.destination || "Destination",
      checkin_date: trip.start_date ? new Date(trip.start_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      checkout_date: trip.end_date ? new Date(trip.end_date).toISOString().split("T")[0] : new Date(Date.now() + 86400000).toISOString().split("T")[0],
      guests: trip.travelers_count || 1,
      rooms: Math.ceil((trip.travelers_count || 1) / 2),
      results: hotels as unknown as Database["public"]["Tables"]["hotel_searches"]["Insert"]["results"],
      currency: "EUR",
    };

    const { error: saveError } = await supabase.from("hotel_searches").insert([hotelSearchData]);

    if (saveError) {
      console.warn("[Hotels API] Failed to save hotel search:", saveError);
      // Don't fail the request, just return the hotels without saving
    }

    console.log(`[Hotels API] Generated ${hotels.length} hotels successfully`);

    return NextResponse.json({
      success: true,
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    console.error("[POST /api/trips/[id]/hotels] Error:", error);
    return NextResponse.json(
      { error: "Failed to search hotels" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trips/[id]/hotels
 * Retrieve the latest hotel search for a trip.
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
      console.log("[Hotels API] GET: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Hotels API] GET: userId=${user.id}, tripId=${tripId}`);

    // Get latest hotel search for this trip
    const { data: searches, error: searchError } = await supabase
      .from("hotel_searches")
      .select("*")
      .eq("user_id", user.id)
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (searchError) {
      console.error("[Hotels API] Failed to fetch hotel searches:", searchError);
      return NextResponse.json(
        { error: "Failed to fetch hotel searches" },
        { status: 500 }
      );
    }

    if (!searches || searches.length === 0) {
      console.log("[Hotels API] No hotel searches found");
      return NextResponse.json(
        { message: "No hotel searches found", hotels: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { hotels: searches[0].results || [], search: searches[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/trips/[id]/hotels] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
