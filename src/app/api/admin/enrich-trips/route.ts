import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/enrich-trips-images
 * 
 * Enrichit tous les voyages sans cover_image avec les images Unsplash.
 * À appeler UNE SEULE FOIS pour migrer les vieux voyages.
 * 
 * Protected: Peut être appelé localement seulement
 */
export async function POST(request: NextRequest) {
  try {
    // Simple protection: vérifier que c'est un appel local
    const origin = request.headers.get("origin");
    const isLocal = origin?.includes("localhost") || origin?.includes("127.0.0.1");
    
    if (!isLocal && process.env.NODE_ENV === "production") {
      console.warn("[Enrich] Tentative d'appel depuis origine non-autorisée:", origin);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    console.log("[Enrich] Début de l'enrichissement des voyages...");

    // Créer le client admin (vérifie les env vars)
    let supabase;
    try {
      supabase = createSupabaseAdmin();
    } catch (envError) {
      console.error("[Enrich] Env error:", envError);
      return NextResponse.json(
        {
          error: "Admin client not configured",
          details: (envError as Error).message,
        },
        { status: 500 }
      );
    }

    // 1. Récupérer tous les voyages SANS cover_image
    const { data: trips, error: fetchError } = await supabase
      .from("trips")
      .select("id, destination")
      .is("cover_image", null)
      .limit(100); // Sécurité: limiter à 100 à la fois

    if (fetchError) {
      console.error("[Enrich] Erreur fetch trips:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch trips", details: fetchError },
        { status: 500 }
      );
    }

    if (!trips || trips.length === 0) {
      console.log("[Enrich] Aucun voyage à enrichir");
      return NextResponse.json(
        { message: "No trips to enrich", count: 0 },
        { status: 200 }
      );
    }

    console.log(`[Enrich] Found ${trips.length} trips to enrich`);

    const results = {
      success: [] as Array<{ id: string; destination: string; author: string }>,
      failed: [] as Array<{ id: string; destination: string; error: string }>,
      skipped: [] as Array<{ id: string; destination: string }>,
    };

    // 2. Pour chaque voyage, appeler Unsplash
    for (const trip of trips) {
      if (!trip.destination) {
        results.skipped.push({
          id: trip.id,
          destination: "unknown",
        });
        continue;
      }

      try {
        console.log(
          `[Enrich] Processing trip ${trip.id}: "${trip.destination}"`
        );

        // Appeler notre propre API Unsplash
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const unsplashUrl = new URL(
          `/api/unsplash?destination=${encodeURIComponent(trip.destination)}`,
          baseUrl
        );

        const unsplashResponse = await fetch(unsplashUrl.toString());

        if (!unsplashResponse.ok) {
          throw new Error(
            `Unsplash returned ${unsplashResponse.status}`
          );
        }

        const imageData = await unsplashResponse.json();
        const imageUrl = imageData.imageUrl;
        const author = imageData.author;

        if (!imageUrl) {
          throw new Error("No imageUrl in response");
        }

        // 3. Mettre à jour cover_image dans la BD
        const { error: updateError } = await supabase
          .from("trips")
          .update({ cover_image: imageUrl })
          .eq("id", trip.id);

        if (updateError) {
          throw new Error(`Update failed: ${updateError.message}`);
        }

        console.log(
          `[Enrich] ✅ Updated trip ${trip.id} with image by ${author}`
        );
        results.success.push({
          id: trip.id,
          destination: trip.destination,
          author,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`[Enrich] ❌ Failed for trip ${trip.id}:`, errorMsg);
        results.failed.push({
          id: trip.id,
          destination: trip.destination,
          error: errorMsg,
        });
      }

      // Petit délai entre les requêtes Unsplash (courtoisie)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("[Enrich] Enrichissement terminé", results);

    return NextResponse.json(
      {
        message: "Enrich complete",
        ...results,
        summary: {
          total: trips.length,
          successCount: results.success.length,
          failedCount: results.failed.length,
          skippedCount: results.skipped.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Enrich] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
