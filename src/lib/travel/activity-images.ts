/**
 * Helper pour trouver des images Unsplash contextuelles par activité/destination.
 * 
 * Stratégie:
 * 1. Analyser le type d'activité (plage, marché, musée, etc.)
 * 2. Construire une requête Unsplash appropriée
 * 3. Appeler /api/images/search côté serveur
 * 4. Fallback si pas d'image ou erreur
 */

export interface ActivityImage {
  imageUrl: string;
  photographer: string;
  fallbackType: string;
}

/**
 * Détecte le type d'activité à partir du titre/description.
 */
function detectActivityType(title: string, description?: string): string {
  const text = (title + " " + (description || "")).toLowerCase();

  if (
    text.includes("plage") ||
    text.includes("beach") ||
    text.includes("mer") ||
    text.includes("piscine")
  ) {
    return "beach";
  }
  if (
    text.includes("marché") ||
    text.includes("market") ||
    text.includes("bazaar")
  ) {
    return "market";
  }
  if (
    text.includes("musée") ||
    text.includes("museum") ||
    text.includes("galerie") ||
    text.includes("art")
  ) {
    return "museum";
  }
  if (
    text.includes("restaurant") ||
    text.includes("cuisine") ||
    text.includes("gastronomie") ||
    text.includes("food") ||
    text.includes("dinner") ||
    text.includes("lunch")
  ) {
    return "food";
  }
  if (
    text.includes("randonnée") ||
    text.includes("hiking") ||
    text.includes("trek") ||
    text.includes("montagne") ||
    text.includes("mountain")
  ) {
    return "hiking";
  }
  if (
    text.includes("temple") ||
    text.includes("église") ||
    text.includes("mosquée") ||
    text.includes("religieux")
  ) {
    return "temple";
  }
  if (
    text.includes("nature") ||
    text.includes("paysage") ||
    text.includes("landscape") ||
    text.includes("parc") ||
    text.includes("jardin")
  ) {
    return "landscape";
  }
  if (
    text.includes("ville") ||
    text.includes("city") ||
    text.includes("urban") ||
    text.includes("rue") ||
    text.includes("street")
  ) {
    return "city";
  }

  return "travel"; // Par défaut
}

/**
 * Construit une requête Unsplash contextualisée.
 */
function buildActivityQuery(
  destination: string,
  title: string,
  description?: string
): string {
  const activityType = detectActivityType(title, description);

  // Exemples de requêtes contextuelles
  const queryTemplates: Record<string, string> = {
    beach: `${destination} plage beach`,
    market: `${destination} marché market`,
    museum: `${destination} musée museum art`,
    food: `${destination} restaurant cuisine gastronomie`,
    hiking: `${destination} randonnée hiking montagne`,
    temple: `${destination} temple architecture`,
    landscape: `${destination} paysage nature landscape`,
    city: `${destination} ville city urbain`,
    travel: `${destination} travel destination`,
  };

  return queryTemplates[activityType] || queryTemplates.travel;
}

/**
 * Récupère une image pour une activité/jour donné.
 * Appelle /api/images/search côté client → serveur → Unsplash.
 * 
 * Stratégie:
 * 1. Essayer avec destination + type
 * 2. Si 404, essayer avec juste le type
 * 3. Si toujours 404, utiliser fallback
 */
export async function getActivityImage(
  destination: string,
  dayTitle: string,
  dayDescription?: string
): Promise<ActivityImage | null> {
  try {
    const activityType = detectActivityType(dayTitle, dayDescription);
    
    // 1. Essayer avec destination + type
    const query1 = buildActivityQuery(destination, dayTitle, dayDescription);
    console.log(`[ActivityImages] Trying query: "${query1}"`);
    
    let response = await fetch(
      `/api/images/search?query=${encodeURIComponent(query1)}`
    );

    // 2. Si 404, fallback sur juste le type d'activité
    if (response.status === 404) {
      console.warn(`[ActivityImages] No results for destination-specific query, trying activity type only`);
      const typeQueries: Record<string, string> = {
        beach: "beach tropical vacation",
        market: "market bazaar shopping",
        museum: "museum art gallery",
        food: "restaurant cuisine dining",
        hiking: "hiking trekking mountains",
        temple: "temple architecture sacred",
        landscape: "landscape nature scenery",
        city: "city urban street",
        travel: "travel adventure exploration",
      };
      
      const query2 = typeQueries[activityType] || typeQueries.travel;
      console.log(`[ActivityImages] Fallback query: "${query2}"`);
      response = await fetch(
        `/api/images/search?query=${encodeURIComponent(query2)}`
      );
    }

    if (!response.ok) {
      console.warn(
        `[ActivityImages] Failed to fetch image for "${dayTitle}": ${response.status}`
      );
      return null;
    }

    const data = await response.json();

    if (!data.imageUrl) {
      console.warn(`[ActivityImages] No imageUrl for "${dayTitle}"`);
      return null;
    }

    return {
      imageUrl: data.imageUrl,
      photographer: data.photographer || "Photographer",
      fallbackType: activityType,
    };
  } catch (error) {
    console.error(`[ActivityImages] Error for "${dayTitle}":`, error);
    return null;
  }
}

/**
 * Retourne une image fallback par type d'activité.
 */
export function getActivityFallbackImage(
  activityType: string
): string {
  const fallbacks: Record<string, string> = {
    beach: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?w=600&h=400&fit=crop",
    market: "https://images.pexels.com/photos/4551832/pexels-photo-4551832.jpeg?w=600&h=400&fit=crop",
    museum: "https://images.pexels.com/photos/3220360/pexels-photo-3220360.jpeg?w=600&h=400&fit=crop",
    food: "https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?w=600&h=400&fit=crop",
    hiking: "https://images.pexels.com/photos/3714896/pexels-photo-3714896.jpeg?w=600&h=400&fit=crop",
    temple: "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=600&h=400&fit=crop",
    landscape: "https://images.pexels.com/photos/3714896/pexels-photo-3714896.jpeg?w=600&h=400&fit=crop",
    city: "https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?w=600&h=400&fit=crop",
    travel: "/images/fallback-destination.svg",
  };

  return fallbacks[activityType] || fallbacks.travel;
}
