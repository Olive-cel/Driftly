import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer le trip_id depuis les query params
    const tripId = request.nextUrl.searchParams.get("trip_id");
    if (!tripId) {
      return NextResponse.json(
        { error: "trip_id requis" },
        { status: 400 }
      );
    }

    // Vérifier que le trip appartient à l'utilisateur
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, user_id")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    if (trip.user_id !== user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Récupérer l'itinéraire le plus récent pour ce voyage
    console.log("[itineraries] Trip ID:", tripId);
    const { data: itinerary, error: itinError } = await supabase
      .from("itineraries")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (itinError) {
      console.log("[itineraries] No itinerary found for trip:", tripId);
      // Pas d'itinéraire trouvé - ce n'est pas une erreur
      return NextResponse.json({ itinerary: null }, { status: 200 });
    }

    console.log("[itineraries] Found itinerary, generated_content preview:", 
      typeof itinerary.generated_content === "string" 
        ? itinerary.generated_content.substring(0, 100)
        : typeof itinerary.generated_content === "object"
        ? JSON.stringify(itinerary.generated_content).substring(0, 100)
        : "unknown type"
    );

    return NextResponse.json({ itinerary }, { status: 200 });
  } catch (err) {
    console.error("[itineraries] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
