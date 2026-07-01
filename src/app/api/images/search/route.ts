import { NextRequest, NextResponse } from "next/server";
import { searchImage } from "@/lib/pexels";

/**
 * GET /api/images/search?query=Rome+plage
 * 
 * Cherche une image Pexels via requête personnalisée.
 * Utilise PEXELS_API_KEY (côté serveur, jamais exposé).
 * 
 * Réponse:
 * {
 *   imageUrl: "https://...",
 *   photographer: "Name",
 *   photographerUrl: "https://...",
 *   alt: "description"
 * }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "query parameter is required" },
      { status: 400 }
    );
  }

  try {
    console.log(`[API] Image search: "${query}"`);

    const result = await searchImage(query);

    if (!result) {
      console.warn(`[API] No image found for: "${query}"`);
      return NextResponse.json(
        { error: "No images found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API] Image search failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
