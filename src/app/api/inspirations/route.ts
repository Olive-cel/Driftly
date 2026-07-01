import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getInspirations, type Inspiration } from "@/lib/inspirations-service";
import { searchImage } from "@/lib/pexels";

/**
 * GET /api/inspirations
 * 
 * Returns personalized inspirations enriched with Pexels images.
 * 
 * Flow:
 * 1. Verify user is authenticated
 * 2. Load user profile
 * 3. Get filtered inspirations based on profile
 * 4. Enrich each inspiration with Pexels image
 * 5. Return complete list
 */
export async function GET() {
  try {
    const supabase = createClient();

    // 1. Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Load user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("travel_style, budget_preference, interests")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[API] Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Failed to load profile" },
        { status: 500 }
      );
    }

    // 3. Get filtered inspirations
    const baseInspirations = getInspirations(profile);

    // 4. Enrich with Pexels images
    const enrichedInspirations: Inspiration[] = await Promise.all(
      baseInspirations.map(async (inspiration) => {
        try {
          // Search for image
          const imageData = await searchImage(inspiration.imageQuery);

          return {
            ...inspiration,
            imageUrl: imageData?.imageUrl || undefined,
          };
        } catch (err) {
          console.error(`[API] Failed to enrich inspiration ${inspiration.id}:`, err);
          // Return without image - client will use fallback
          return inspiration;
        }
      })
    );

    return NextResponse.json({
      success: true,
      count: enrichedInspirations.length,
      inspirations: enrichedInspirations,
    });
  } catch (error) {
    console.error("[API] GET /api/inspirations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspirations" },
      { status: 500 }
    );
  }
}
