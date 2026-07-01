/**
 * Client-side helper pour appeler l'API Pexels.
 * Attention : Ne JAMAIS envoyer la clé API au client.
 * Cette fonction appelle UNIQUEMENT /api/images/search (route serveur).
 */

export interface PexelsImage {
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
}

/**
 * Récupère une image pour une requête depuis l'API Pexels (via serveur).
 *
 * @param query Requête de recherche (ex: "Rome travel")
 * @returns Image data ou null si erreur
 *
 * @example
 * const image = await getPexelsImage("Paris");
 * // { imageUrl: "https://...", photographer: "...", ... }
 */
export async function getPexelsImage(query: string): Promise<PexelsImage | null> {
  try {
    const response = await fetch(
      `/api/images/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      console.warn(
        `[Pexels Client] Failed to fetch image for "${query}": ${response.status}`
      );
      return null;
    }

    const data: PexelsImage = await response.json();
    return data;
  } catch (error) {
    console.error(
      `[Pexels Client] Error fetching image for "${query}":`,
      error
    );
    return null;
  }
}

/**
 * URL d'image de secours si Pexels échoue.
 */
export const FALLBACK_IMAGE_URL = "/images/fallback-destination.svg";
