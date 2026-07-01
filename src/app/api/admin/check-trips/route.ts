import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/admin/check-trips
 * 
 * Affiche l'état des voyages et des cover_image.
 * Utile pour diagnostiquer l'enrichissement.
 * 
 * Utilise le client admin Supabase (service role) pour contourner RLS.
 */
export async function GET() {
  try {
    // Créer le client admin (vérifie les env vars)
    let supabase;
    try {
      supabase = createSupabaseAdmin();
    } catch (envError) {
      console.error("[Check] Env error:", envError);
      return NextResponse.json(
        {
          error: "Admin client not configured",
          details: (envError as Error).message,
        },
        { status: 500 }
      );
    }

    console.log("[Check] Fetching trips with admin client...");

    // Récupérer tous les voyages
    const { data: trips, error } = await supabase
      .from("trips")
      .select("id, destination, cover_image, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    console.log("[Check] Response:", { tripsCount: trips?.length, error });

    if (error) {
      console.error("[Check] Query error:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch trips",
          details: error.message,
        },
        { status: 500 }
      );
    }

    const stats = {
      total: trips?.length || 0,
      withImage: trips?.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (t: any) => t.cover_image
      ).length || 0,
      withoutImage: trips?.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (t: any) => !t.cover_image
      ).length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      trips: trips?.map((t: any) => ({
        id: t.id,
        destination: t.destination,
        hasImage: !!t.cover_image,
        imageUrl: t.cover_image ? t.cover_image.substring(0, 60) + "..." : null,
        created_at: t.created_at,
      })),
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("[Check] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
