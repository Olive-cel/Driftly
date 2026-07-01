import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateItineraryRequest } from "@/types/itinerary";
import { generateItinerary } from "@/services/ai/generate-itinerary";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

const MODEL = "gpt-4o-mini";
const PROMPT_VERSION = "v1.0";

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    console.log("[itinerary/generate] Request started");

    // 1. Auth
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log("[itinerary/generate] User not found");
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    console.log("[itinerary/generate] User found:", user.id);

    // 2. Parse & validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      console.log("[itinerary/generate] Invalid JSON");
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const validation = validateItineraryRequest(body);
    if (!validation.ok) {
      console.log("[itinerary/generate] Validation failed:", validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 3. If tripId provided, verify ownership
    if (validation.data.tripId) {
      console.log("[itinerary/generate] Verifying trip ownership:", validation.data.tripId);

      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("id, user_id")
        .eq("id", validation.data.tripId)
        .single();

      if (tripError || !trip) {
        console.log("[itinerary/generate] Trip not found:", tripError?.message);
        return NextResponse.json(
          { error: "Voyage non trouvé" },
          { status: 404 }
        );
      }

      if (trip.user_id !== user.id) {
        console.log("[itinerary/generate] Trip ownership mismatch");
        return NextResponse.json(
          { error: "Accès refusé" },
          { status: 403 }
        );
      }

      console.log("[itinerary/generate] Trip verified");
    }

    // 4. Fetch user preferences
    const { data: profile } = await supabase
      .from("profiles")
      .select("budget_preference, travel_style, interests")
      .eq("id", user.id)
      .single();

    const userPreferences = profile
      ? {
          budget_preference: profile.budget_preference,
          travel_style: profile.travel_style,
          interests: profile.interests,
        }
      : null;

    console.log("[itinerary/generate] User preferences fetched");

    // 5. Generate itinerary
    console.log("[itinerary/generate] OpenAI request started for:", validation.data.destination);
    let itinerary: unknown;
    try {
      itinerary = await generateItinerary({
        request: validation.data,
        userPreferences,
      });
      console.log("[itinerary/generate] generateItinerary returned successfully");
    } catch (genErr) {
      console.error("[itinerary/generate] generateItinerary threw error:", genErr);
      throw genErr;
    }
    
    const itineraryWithDays = itinerary as { days?: unknown[] };
    console.log("[itinerary/generate] OpenAI response received, days:", itineraryWithDays?.days?.length);

    // 6. If tripId provided, save to itineraries table
    if (validation.data.tripId) {
      console.log("[itinerary/generate] Saving to database...");

      const insertData: Database["public"]["Tables"]["itineraries"]["Insert"] = {
        trip_id: validation.data.tripId,
        generated_content: itinerary as unknown as Database["public"]["Tables"]["itineraries"]["Insert"]["generated_content"],
        ai_model: MODEL,
        prompt_version: PROMPT_VERSION,
      };

      const { data: savedItinerary, error: saveError } = await supabase
        .from("itineraries")
        .insert(insertData)
        .select()
        .single();

      if (saveError) {
        console.error("[itinerary/generate] Save error:", saveError);
        return NextResponse.json(
          { error: "Erreur lors de la sauvegarde" },
          { status: 500 }
        );
      }

      console.log("[itinerary/generate] Saved successfully in", Date.now() - startTime, "ms");
      return NextResponse.json(savedItinerary.generated_content, { status: 201 });
    }

    // 7. Return itinerary without saving
    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("[itinerary/generate] Error:", error);

    const message = error instanceof Error ? error.message : "Erreur interne";
    const isAiError = message.includes("OpenAI") || message.includes("parse") || message.includes("schema");

    return NextResponse.json(
      { error: isAiError ? "Erreur de génération IA — réessayez" : "Erreur serveur" },
      { status: isAiError ? 502 : 500 }
    );
  }
}
