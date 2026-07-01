/**
 * Client-side helper pour appeler l'API Unsplash.
 * Attention : Ne JAMAIS envoyer la clé API au client.
 * Cette fonction appelle UNIQUEMENT /api/unsplash (route serveur).
 */

export interface UnsplashImage {
  imageUrl: string;
  author: string;
  authorUrl: string | null;
  unsplashUrl: string;
}

/**
 * Récupère une image pour une destination depuis l'API Unsplash (via serveur).
 *
 * @param destination Nom de la destination (ex: "Paris", "Tokyo")
 * @returns Image data ou null si erreur
 *
 * @example
 * const image = await getUnsplashImage("Paris");
 * // { imageUrl: "https://...", author: "...", authorUrl: "...", unsplashUrl: "..." }
 */
export async function getUnsplashImage(
  destination: string
): Promise<UnsplashImage | null> {
  try {
    const response = await fetch(
      `/api/unsplash?destination=${encodeURIComponent(destination)}`
    );

    if (!response.ok) {
      console.warn(
        `[Unsplash Client] Failed to fetch image for "${destination}": ${response.status}`
      );
      return null;
    }

    const data: UnsplashImage = await response.json();
    return data;
  } catch (error) {
    console.error(
      `[Unsplash Client] Error fetching image for "${destination}":`,
      error
    );
    return null;
  }
}

/**
 * URL d'image de secours si Unsplash échoue.
 * À mettre dans /public/images/
 */
export const FALLBACK_IMAGE_URL = "/images/fallback-destination.svg";
