/**
 * Static inspirations data
 * Used by /dashboard/inspiration page
 * Filtered dynamically based on user profile
 */

export interface InspirationDestination {
  id: string;
  destination: string;
  country: string;
  description: string;
  estimatedPrice: number; // par jour
  travelStyle: "adventure" | "relaxation" | "cultural" | "luxury" | "budget";
  interests: string[];
  imageQuery: string; // pour Pexels search
}

export const INSPIRATION_DESTINATIONS: InspirationDestination[] = [
  {
    id: "marrakech-1",
    destination: "Marrakech",
    country: "Maroc",
    description: "Découvrez les marchés colorés et les palais anciens du Maroc",
    estimatedPrice: 45,
    travelStyle: "budget",
    interests: ["culture", "shopping", "histoire"],
    imageQuery: "Marrakech Morocco medina",
  },
  {
    id: "bali-1",
    destination: "Bali",
    country: "Indonésie",
    description: "Plages paradisiaques, temples mystiques et rizières vertes",
    estimatedPrice: 40,
    travelStyle: "budget",
    interests: ["plage", "relaxation", "spirituel"],
    imageQuery: "Bali Indonesia beaches temples",
  },
  {
    id: "tokyo-1",
    destination: "Tokyo",
    country: "Japon",
    description: "Mégalopole moderne mêlant tradition et futurisme",
    estimatedPrice: 80,
    travelStyle: "cultural",
    interests: ["culture", "aventure", "gastronomie"],
    imageQuery: "Tokyo Japan modern city",
  },
  {
    id: "lisbonne-1",
    destination: "Lisbonne",
    country: "Portugal",
    description: "Capitale charmante avec azulejos, miradouros et gastronomie",
    estimatedPrice: 55,
    travelStyle: "cultural",
    interests: ["culture", "architecture", "gastronomie"],
    imageQuery: "Lisbon Portugal architecture",
  },
  {
    id: "andalousie-1",
    destination: "Andalousie",
    country: "Espagne",
    description: "Granada, Séville et la magie de l'Espagne du Sud",
    estimatedPrice: 60,
    travelStyle: "cultural",
    interests: ["culture", "architecture", "histoire"],
    imageQuery: "Andalusia Spain Granada Seville",
  },
  {
    id: "thaïlande-1",
    destination: "Thaïlande",
    country: "Thaïlande",
    description: "Temples, plages et jungle tropicale",
    estimatedPrice: 35,
    travelStyle: "budget",
    interests: ["plage", "culture", "aventure"],
    imageQuery: "Thailand temples beaches jungle",
  },
  {
    id: "islande-1",
    destination: "Islande",
    country: "Islande",
    description: "Aurores boréales, chutes d'eau et paysages dramatiques",
    estimatedPrice: 150,
    travelStyle: "luxury",
    interests: ["nature", "aventure", "photographie"],
    imageQuery: "Iceland northern lights waterfalls",
  },
  {
    id: "costarica-1",
    destination: "Costa Rica",
    country: "Costa Rica",
    description: "Jungle, volcans et plages sur deux océans",
    estimatedPrice: 85,
    travelStyle: "adventure",
    interests: ["nature", "aventure", "plage"],
    imageQuery: "Costa Rica jungle volcano beaches",
  },
  {
    id: "dubai-1",
    destination: "Dubaï",
    country: "Émirats Arabes Unis",
    description: "Luxe, gratte-ciel futuristes et désert",
    estimatedPrice: 120,
    travelStyle: "luxury",
    interests: ["shopping", "luxe", "moderne"],
    imageQuery: "Dubai luxury city desert",
  },
  {
    id: "santorin-1",
    destination: "Santorin",
    country: "Grèce",
    description: "Îles grecques pittoresques avec maisons blanches et couchers de soleil",
    estimatedPrice: 70,
    travelStyle: "relaxation",
    interests: ["plage", "relaxation", "romantique"],
    imageQuery: "Santorini Greece whitewashed houses sunset",
  },
  {
    id: "bangkok-1",
    destination: "Bangkok",
    country: "Thaïlande",
    description: "Temples dorés, gastronomie de rue et vie nocturne",
    estimatedPrice: 38,
    travelStyle: "cultural",
    interests: ["gastronomie", "culture", "aventure"],
    imageQuery: "Bangkok Thailand temples street food",
  },
  {
    id: "barcelona-1",
    destination: "Barcelone",
    country: "Espagne",
    description: "Gaudí, plages méditerranéennes et atmosphère catalane",
    estimatedPrice: 65,
    travelStyle: "cultural",
    interests: ["architecture", "plage", "culture"],
    imageQuery: "Barcelona Spain Gaudi architecture",
  },
];

/**
 * Filtre les inspirations selon le profil utilisateur
 * @param travelStyle Style de voyage du profil
 * @param budgetPreference Budget préféré
 * @returns Destinations filtrées et triées
 */
export function filterInspirationsForProfile(
  travelStyle?: string | null,
  budgetPreference?: string | null
): InspirationDestination[] {
  let filtered = [...INSPIRATION_DESTINATIONS];

  // Filtrer par style de voyage
  if (travelStyle) {
    const styleMap: Record<string, string[]> = {
      adventure: ["adventure", "budget"],
      relaxation: ["relaxation", "budget"],
      cultural: ["cultural", "adventure"],
      luxury: ["luxury", "relaxation"],
      budget: ["budget"],
    };

    const allowedStyles = styleMap[travelStyle] || [];
    filtered = filtered.filter((d) => allowedStyles.includes(d.travelStyle));
  }

  // Filtrer par budget
  if (budgetPreference) {
    const budgetRanges: Record<string, [number, number]> = {
      budget: [0, 50],
      moderate: [40, 150],
      comfortable: [130, 300],
      luxury: [200, 999],
    };

    const [min, max] = budgetRanges[budgetPreference] || [0, 999];
    filtered = filtered.filter((d) => d.estimatedPrice >= min && d.estimatedPrice <= max);
  }

  // Si pas de filtre spécifique, retourner une sélection aléatoire de 6
  if (!travelStyle && !budgetPreference) {
    return filtered.sort(() => Math.random() - 0.5).slice(0, 6);
  }

  // Limiter à 8 résultats
  return filtered.slice(0, 8);
}
