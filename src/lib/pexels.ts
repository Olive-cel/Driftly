/**
 * Service pour récupérer des images via l'API officielle Pexels.
 * 
 * Remplace l'intégration Unsplash.
 * Utilise PEXELS_API_KEY (jamais exposé au client).
 */

import { pexelsRequestsTotal, appErrorsTotal } from "@/lib/monitoring/metrics";

export interface PexelsImage {
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
}

/**
 * Récupère une image depuis Pexels.
 * 
 * @param query Requête de recherche (ex: "Rome Italy travel")
 * @returns Image data ou null si erreur/pas de résultat
 */
export async function searchImage(query: string): Promise<PexelsImage | null> {
  try {
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
      console.error("[Pexels] PEXELS_API_KEY not configured");
      appErrorsTotal.labels("pexels", "not_configured").inc();
      throw new Error("Pexels API key not configured");
    }

    console.log(`[Pexels] Searching for: "${query}"`);

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        method: "GET",
        headers: {
          "Authorization": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Pexels] API error:", {
        status: response.status,
        error: errorData,
      });
      pexelsRequestsTotal.labels("error").inc();
      appErrorsTotal.labels("pexels", "api_error").inc();
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      console.warn(`[Pexels] No results for: "${query}"`);
      pexelsRequestsTotal.labels("empty").inc();
      return null;
    }

    const photo = data.photos[0];

    // Préférer large2x, sinon large
    const imageUrl = photo.src.large2x || photo.src.large;

    if (!imageUrl) {
      console.warn(`[Pexels] No image URL for: "${query}"`);
      pexelsRequestsTotal.labels("empty").inc();
      return null;
    }

    const result: PexelsImage = {
      imageUrl,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      alt: photo.alt || query,
    };

    console.log(`[Pexels] Found image for "${query}" by ${result.photographer}`);
    pexelsRequestsTotal.labels("success").inc();

    return result;
  } catch (error) {
    console.error("[Pexels] Request failed:", error);
    if (!(error instanceof Error) || error.message.startsWith("Pexels API")) {
      // Erreur API déjà enregistrée
    } else {
      pexelsRequestsTotal.labels("error").inc();
      appErrorsTotal.labels("pexels", "unknown_error").inc();
    }
    return null;
  }
}
