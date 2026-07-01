/**
 * Unified Inspirations/Recommendations Service
 * Single source of truth for all destination suggestions
 */

export interface Inspiration {
  id: string;
  destination: string;
  country: string;
  description: string;
  estimatedPrice: number;
  travelStyle: string;
  imageQuery: string;
  tags: string[];
  rating?: number;
}

/**
 * Master list of all inspirations
 * Single source of truth - do NOT duplicate elsewhere
 */
export const ALL_INSPIRATIONS: Inspiration[] = [
  {
    id: "bali-1",
    destination: "Bali",
    country: "Indonésie",
    description: "Plages paradisiaques, temples mystiques et rizières vertes",
    estimatedPrice: 40,
    travelStyle: "relaxation",
    imageQuery: "Bali Indonesia beaches temples",
    tags: ["Plage", "Relaxation", "Culture"],
    rating: 4.8,
  },
  {
    id: "santorin-1",
    destination: "Santorin",
    country: "Grèce",
    description: "Îles grecques pittoresques avec maisons blanches et couchers de soleil",
    estimatedPrice: 70,
    travelStyle: "relaxation",
    imageQuery: "Santorini Greece whitewashed houses sunset",
    tags: ["Plage", "Romance", "Luxe"],
    rating: 4.9,
  },
  {
    id: "zanzibar-1",
    destination: "Zanzibar",
    country: "Tanzanie",
    description: "Îles tropicales avec culture swahili",
    estimatedPrice: 50,
    travelStyle: "relaxation",
    imageQuery: "Zanzibar Tanzania islands",
    tags: ["Plage", "Aventure", "Culturel"],
    rating: 4.7,
  },
  {
    id: "seychelles-1",
    destination: "Seychelles",
    country: "Seychelles",
    description: "Îles privées et récifs de classe mondiale",
    estimatedPrice: 250,
    travelStyle: "luxury",
    imageQuery: "Seychelles islands luxury",
    tags: ["Luxe", "Plage", "Lune de miel"],
    rating: 4.9,
  },
  {
    id: "lisbonne-1",
    destination: "Lisbonne",
    country: "Portugal",
    description: "Capitale historique avec ambiance bohème",
    estimatedPrice: 55,
    travelStyle: "cultural",
    imageQuery: "Lisbon Portugal architecture",
    tags: ["Ville", "Culture", "Gastronomie"],
    rating: 4.7,
  },
  {
    id: "prague-1",
    destination: "Prague",
    country: "République Tchèque",
    description: "Architecture gothique et vie nocturne",
    estimatedPrice: 50,
    travelStyle: "cultural",
    imageQuery: "Prague Czech Republic architecture",
    tags: ["Ville", "Histoire", "Vie nocturne"],
    rating: 4.8,
  },
  {
    id: "amsterdam-1",
    destination: "Amsterdam",
    country: "Pays-Bas",
    description: "Canaux pittoresques et musées renommés",
    estimatedPrice: 65,
    travelStyle: "cultural",
    imageQuery: "Amsterdam Netherlands canals",
    tags: ["Ville", "Culture", "Vélo"],
    rating: 4.7,
  },
  {
    id: "rome-1",
    destination: "Rome",
    country: "Italie",
    description: "La Ville Éternelle pleine de charme",
    estimatedPrice: 75,
    travelStyle: "cultural",
    imageQuery: "Rome Italy colosseum",
    tags: ["Ville", "Histoire", "Gastronomie"],
    rating: 4.8,
  },
  {
    id: "islande-1",
    destination: "Islande",
    country: "Islande",
    description: "Aurores boréales, chutes d'eau et paysages dramatiques",
    estimatedPrice: 150,
    travelStyle: "adventure",
    imageQuery: "Iceland northern lights waterfalls",
    tags: ["Nature", "Aventure", "Photographie"],
    rating: 4.9,
  },
  {
    id: "costarica-1",
    destination: "Costa Rica",
    country: "Costa Rica",
    description: "Jungle, volcans et plages sur deux océans",
    estimatedPrice: 85,
    travelStyle: "adventure",
    imageQuery: "Costa Rica jungle volcano beaches",
    tags: ["Aventure", "Nature", "Animaux"],
    rating: 4.8,
  },
  {
    id: "perou-1",
    destination: "Pérou",
    country: "Pérou",
    description: "Machu Picchu et culture inca",
    estimatedPrice: 100,
    travelStyle: "adventure",
    imageQuery: "Peru Machu Picchu",
    tags: ["Aventure", "Histoire", "Randonnée"],
    rating: 4.7,
  },
  {
    id: "marrakech-1",
    destination: "Marrakech",
    country: "Maroc",
    description: "Déserts, medinas et montagnes de l'Atlas",
    estimatedPrice: 45,
    travelStyle: "adventure",
    imageQuery: "Marrakech Morocco medina",
    tags: ["Aventure", "Culturel", "Budget"],
    rating: 4.6,
  },
  {
    id: "tokyo-1",
    destination: "Tokyo",
    country: "Japon",
    description: "Fusion de tradition et modernité",
    estimatedPrice: 120,
    travelStyle: "gastronomie",
    imageQuery: "Tokyo Japan modern city",
    tags: ["Gastronomie", "Ville", "Technologie"],
    rating: 4.8,
  },
  {
    id: "lyon-1",
    destination: "Lyon",
    country: "France",
    description: "Capitale mondiale de la gastronomie",
    estimatedPrice: 70,
    travelStyle: "gastronomie",
    imageQuery: "Lyon France gastronomie",
    tags: ["Gastronomie", "Ville", "Vin"],
    rating: 4.7,
  },
  {
    id: "barcelone-1",
    destination: "Barcelone",
    country: "Espagne",
    description: "Gaudí, plages méditerranéennes et atmosphère catalane",
    estimatedPrice: 65,
    travelStyle: "gastronomie",
    imageQuery: "Barcelona Spain Gaudi architecture",
    tags: ["Gastronomie", "Plage", "Architecture"],
    rating: 4.7,
  },
  {
    id: "maldives-1",
    destination: "Maldives",
    country: "Maldives",
    description: "Bungalows sur l'eau et plongée",
    estimatedPrice: 300,
    travelStyle: "luxury",
    imageQuery: "Maldives luxury bungalows",
    tags: ["Luxe", "Plongée", "Lune de miel"],
    rating: 4.9,
  },
  {
    id: "borabora-1",
    destination: "Bora Bora",
    country: "Polynésie française",
    description: "Lagons cristallins et îles privées",
    estimatedPrice: 200,
    travelStyle: "luxury",
    imageQuery: "Bora Bora Polynesia lagoon",
    tags: ["Luxe", "Plage", "Lune de miel"],
    rating: 4.9,
  },
  {
    id: "dubai-1",
    destination: "Dubaï",
    country: "Émirats Arabes Unis",
    description: "Luxe, gratte-ciel futuristes et désert",
    estimatedPrice: 180,
    travelStyle: "luxury",
    imageQuery: "Dubai luxury city desert",
    tags: ["Luxe", "Shopping", "Moderne"],
    rating: 4.7,
  },
  {
    id: "thailand-1",
    destination: "Thaïlande",
    country: "Thaïlande",
    description: "Temples, plages et jungle tropicale",
    estimatedPrice: 38,
    travelStyle: "budget",
    imageQuery: "Thailand temples beaches jungle",
    tags: ["Plage", "Culture", "Budget"],
    rating: 4.7,
  },
  {
    id: "bangkok-1",
    destination: "Bangkok",
    country: "Thaïlande",
    description: "Temples dorés, gastronomie de rue et vie nocturne",
    estimatedPrice: 35,
    travelStyle: "budget",
    imageQuery: "Bangkok Thailand temples street food",
    tags: ["Gastronomie", "Culture", "Aventure"],
    rating: 4.6,
  },
];

/**
 * Get all inspirations (optionally filtered by profile)
 * Used by /dashboard/inspiration page
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getInspirations(profile?: any | null): Inspiration[] {
  if (!profile) {
    return ALL_INSPIRATIONS;
  }

  let filtered = [...ALL_INSPIRATIONS];

  // Filter by travel style if specified
  if (profile.travel_style) {
    const styleMap: Record<string, string[]> = {
      relaxation: ["relaxation", "luxury"],
      cultural: ["cultural", "gastronomie"],
      adventure: ["adventure", "budget"],
      luxury: ["luxury", "relaxation"],
      gastronomie: ["gastronomie", "cultural"],
      budget: ["budget", "adventure"],
    };

    const allowedStyles = styleMap[profile.travel_style] || [];
    if (allowedStyles.length > 0) {
      filtered = filtered.filter((i) => allowedStyles.includes(i.travelStyle));
    }
  }

  // Filter by budget preference if specified
  if (profile.budget_preference) {
    const budgetNum = typeof profile.budget_preference === "number" 
      ? profile.budget_preference 
      : parseInt(profile.budget_preference, 10);

    const budgetRanges: Record<number, [number, number]> = {
      0: [0, 50],       // budget
      1: [40, 150],     // moderate
      2: [130, 300],    // comfortable
      3: [200, 999],    // luxury
    };

    const range = budgetRanges[budgetNum] || [0, 999];
    const [min, max] = range;
    filtered = filtered.filter((i) => i.estimatedPrice >= min && i.estimatedPrice <= max);
  }

  return filtered.length > 0 ? filtered : ALL_INSPIRATIONS;
}

/**
 * Get recommended inspirations for dashboard (limited count)
 * Used by dashboard to show preview
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRecommendedInspirations(profile?: any | null, limit = 4): Inspiration[] {
  const inspirations = getInspirations(profile);
  // Shuffle and return limited set for dashboard
  return inspirations.sort(() => Math.random() - 0.5).slice(0, limit);
}

/**
 * Get inspiration by ID
 */
export function getInspirationById(id: string): Inspiration | undefined {
  return ALL_INSPIRATIONS.find((i) => i.id === id);
}

/**
 * Get inspiration by destination name
 */
export function getInspirationByDestination(destination: string): Inspiration | undefined {
  return ALL_INSPIRATIONS.find((i) => i.destination.toLowerCase() === destination.toLowerCase());
}
