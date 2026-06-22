import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateItineraryRequest } from "@/types/itinerary";
import { generateItinerary } from "@/services/ai/generate-itinerary";

export async function POST(request: Request) {
  try {
    // 1. Auth
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 2. Parse & validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const validation = validateItineraryRequest(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 3. Fetch user preferences
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

    // 4. Generate itinerary
    const itinerary = await generateItinerary({
      request: validation.data,
      userPreferences,
    });

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("[itinerary/generate]", error);

    const message = error instanceof Error ? error.message : "Erreur interne";
    const isAiError = message.includes("Claude") || message.includes("parse") || message.includes("schema");

    return NextResponse.json(
      { error: isAiError ? "Erreur de génération IA — réessayez" : "Erreur serveur" },
      { status: isAiError ? 502 : 500 }
    );
  }
}
