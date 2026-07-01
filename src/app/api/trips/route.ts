import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type TripsInsert = Database["public"]["Tables"]["trips"]["Insert"];

export async function GET() {
  try {
    const supabase = createClient();

    // Vérifier que l'utilisateur est connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les voyages de l'utilisateur
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[API] GET /api/trips error:", error);
      return NextResponse.json(
        { error: "Failed to fetch trips" },
        { status: 500 }
      );
    }

    return NextResponse.json({ trips: data || [] }, { status: 200 });
  } catch (err) {
    console.error("[API] GET /api/trips unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Vérifier que l'utilisateur est connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parser le body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Valider les champs requis
    const { destination, departure_city, start_date, end_date, budget } = body;

    if (!destination || typeof destination !== "string") {
      return NextResponse.json(
        { error: "destination is required and must be a string" },
        { status: 400 }
      );
    }

    if (!departure_city || typeof departure_city !== "string") {
      return NextResponse.json(
        { error: "departure_city is required and must be a string" },
        { status: 400 }
      );
    }

    if (!start_date || typeof start_date !== "string") {
      return NextResponse.json(
        { error: "start_date is required and must be a string (ISO 8601)" },
        { status: 400 }
      );
    }

    if (!end_date || typeof end_date !== "string") {
      return NextResponse.json(
        { error: "end_date is required and must be a string (ISO 8601)" },
        { status: 400 }
      );
    }

    if (budget === undefined || budget === null) {
      return NextResponse.json(
        { error: "budget is required and must be a number" },
        { status: 400 }
      );
    }

    if (typeof budget !== "number" || budget <= 0) {
      return NextResponse.json(
        { error: "budget must be a positive number" },
        { status: 400 }
      );
    }

    // Optionnel : calculer la durée en jours
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const durationMs = endDate.getTime() - startDate.getTime();
    const duration = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

    // Valider les dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "start_date and end_date must be valid ISO 8601 dates" },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "end_date must be after start_date" },
        { status: 400 }
      );
    }

    // Préparer l'insertion
    const tripData: TripsInsert = {
      user_id: user.id,
      departure_city,
      destination,
      start_date: start_date.split("T")[0], // Format YYYY-MM-DD
      end_date: end_date.split("T")[0], // Format YYYY-MM-DD
      duration,
      travelers_count: body.travelers_count
        ? Number(body.travelers_count)
        : null,
      budget,
      travel_style:
        typeof body.travel_style === "string" ? body.travel_style : null,
      interests: Array.isArray(body.interests) ? body.interests : [],
      status: (body.status as TripsInsert["status"]) || "draft",
    };

    // Insérer le voyage
    const { data, error } = await supabase
      .from("trips")
      .insert(tripData)
      .select()
      .single();

    if (error) {
      console.error("[API] POST /api/trips error:", error);
      return NextResponse.json(
        { error: "Failed to create trip" },
        { status: 500 }
      );
    }

    // Appeler l'API Unsplash pour récupérer l'image de couverture
    // C'est un appel asynchrone qui ne bloquera pas la réponse
    const tripId = data.id;
    (async () => {
      try {
        console.log(`[API] Fetching cover image for trip ${tripId}, destination: ${destination}`);
        const unsplashResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/unsplash?destination=${encodeURIComponent(destination)}`
        );

        if (!unsplashResponse.ok) {
          console.warn(
            `[API] Unsplash API returned ${unsplashResponse.status} for ${destination}`
          );
          return;
        }

        const unsplashData = await unsplashResponse.json();
        const coverImageUrl = unsplashData.imageUrl;

        if (!coverImageUrl) {
          console.warn(`[API] No cover image URL returned for ${destination}`);
          return;
        }

        // Mettre à jour le voyage avec l'image de couverture
        const { error: updateError } = await supabase
          .from("trips")
          .update({ cover_image: coverImageUrl })
          .eq("id", tripId);

        if (updateError) {
          console.error(
            `[API] Failed to update cover_image for trip ${tripId}:`,
            updateError
          );
        } else {
          console.log(
            `[API] Successfully updated cover_image for trip ${tripId}`
          );
        }
      } catch (err) {
        console.error(
          `[API] Error fetching/updating cover image for trip ${tripId}:`,
          err
        );
      }
    })();

    return NextResponse.json({ trip: data }, { status: 201 });
  } catch (err) {
    console.error("[API] POST /api/trips unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
