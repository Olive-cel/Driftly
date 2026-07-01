/**
 * Unified Inspirations/Recommendations Service
 * Single source of truth for all destination suggestions
 * 
 * Flow:
 * 1. User loads /dashboard/inspiration
 * 2. Page calls GET /api/inspirations (server-side)
 * 3. API fetches base inspirations + enriches with Pexels images
 * 4. Client displays with real images, favorites, action buttons
 */

export interface Inspiration {
  id: string;
  destination: string;
  country: string;
  title: string;
  description: string;
  estimatedPrice: number;
  travelStyle: string;
  imageQuery: string;
  imageUrl?: string;
  tags: string[];
  interests?: string[];
  rating?: number;
}

/**
 * Master list of base inspirations (without images - will be enriched server-side)
 * Single source of truth - do NOT duplicate elsewhere
 */
export const ALL_INSPIRATIONS: Inspiration[] = [
  {
    id: "bali-1",
    destination: "Bali",
    country: "Indonésie",
    title: "Bali - Paradis tropical",
    description: "Découvrez les plages de sable blanc, les temples mystiques de Ubud et les sublimes rizières en terrasses. Un refuge idéal pour la détente et la spiritualité.",
    estimatedPrice: 40,
    travelStyle: "relaxation",
    imageQuery: "Bali Indonesia beach temple tropical",
    tags: ["Plage", "Relaxation", "Culture"],
    interests: ["plage", "spiritualité", "nature"],
    rating: 4.8,
  },
  {
    id: "santorin-1",
    destination: "Santorin",
    country: "Grèce",
    title: "Santorin - Îles grecques pittoresques",
    description: "Admirez les maisons blanches avec portes bleues sur les falaises de la caldera. Couchers de soleil spectaculaires et vin volcanique renommé à déguster.",
    estimatedPrice: 70,
    travelStyle: "relaxation",
    imageQuery: "Santorini Greece whitewashed houses sunset sea",
    tags: ["Plage", "Romance", "Luxe"],
    interests: ["romance", "gastronomie", "photographie"],
    rating: 4.9,
  },
  {
    id: "zanzibar-1",
    destination: "Zanzibar",
    country: "Tanzanie",
    title: "Zanzibar - Îles tropicales épicées",
    description: "Plages de rêve, vieille ville côtière avec architecture swahili traditionnelle. Marché d'épices vibrant et culture riche.",
    estimatedPrice: 50,
    travelStyle: "relaxation",
    imageQuery: "Zanzibar Tanzania beach island tropical",
    tags: ["Plage", "Aventure", "Culturel"],
    interests: ["plage", "culture", "gastronomie"],
    rating: 4.7,
  },
  {
    id: "seychelles-1",
    destination: "Seychelles",
    country: "Seychelles",
    title: "Seychelles - Îles privées de luxe",
    description: "Bungalows privés sur eaux turquoise, récifs de classe mondiale. Lune de miel idéale avec faune et flore uniques.",
    estimatedPrice: 250,
    travelStyle: "luxury",
    imageQuery: "Seychelles luxury islands bungalows ocean",
    tags: ["Luxe", "Plage", "Lune de miel"],
    interests: ["luxe", "plage", "romance"],
    rating: 4.9,
  },
  {
    id: "lisbonne-1",
    destination: "Lisbonne",
    country: "Portugal",
    title: "Lisbonne - Capitale bohème",
    description: "Architecture traditionnelle et moderne, azulejos bleus emblématiques. Atmosphère bohème, vie nocturne dynamique et pâtisseries au pastéis de nata.",
    estimatedPrice: 55,
    travelStyle: "cultural",
    imageQuery: "Lisbon Portugal architecture tiles historic",
    tags: ["Ville", "Culture", "Gastronomie"],
    interests: ["architecture", "histoire", "gastronomie"],
    rating: 4.7,
  },
  {
    id: "prague-1",
    destination: "Prague",
    country: "République Tchèque",
    title: "Prague - Ville gothique enchantée",
    description: "Architecture gothique médiévale spectaculaire, pont Charles historique, bière tchèque de renommée mondiale. Une ville figée dans le temps.",
    estimatedPrice: 50,
    travelStyle: "cultural",
    imageQuery: "Prague Czech Republic gothic architecture bridge",
    tags: ["Ville", "Histoire", "Vie nocturne"],
    interests: ["histoire", "architecture", "bière"],
    rating: 4.8,
  },
  {
    id: "amsterdam-1",
    destination: "Amsterdam",
    country: "Pays-Bas",
    title: "Amsterdam - Villes des canaux",
    description: "Canaux pittoresques bordés de maisons traditionnelles, musées de classe mondiale. Vélo omniprésent, cafés cosy et ambiance relaxante.",
    estimatedPrice: 65,
    travelStyle: "cultural",
    imageQuery: "Amsterdam Netherlands canals bicycles water",
    tags: ["Ville", "Culture", "Vélo"],
    interests: ["architecture", "musées", "vélo"],
    rating: 4.7,
  },
  {
    id: "rome-1",
    destination: "Rome",
    country: "Italie",
    title: "Rome - La Ville Éternelle",
    description: "Colosseum époustouflant, fontaines baroques et musées antiques. Savourez la vraie dolce vita italienne avec pasta fraîche et vin exquis.",
    estimatedPrice: 75,
    travelStyle: "cultural",
    imageQuery: "Rome Italy colosseum history architecture",
    tags: ["Ville", "Histoire", "Gastronomie"],
    interests: ["histoire", "gastronomie", "architecture"],
    rating: 4.8,
  },
  {
    id: "islande-1",
    destination: "Islande",
    country: "Islande",
    title: "Islande - Aventure polaire",
    description: "Aurores boréales dansantes, chutes d'eau majestueuses et paysages lunaires. Sources chaudes, volcans et nature brute à l'état pur.",
    estimatedPrice: 150,
    travelStyle: "adventure",
    imageQuery: "Iceland northern lights waterfalls adventure",
    tags: ["Nature", "Aventure", "Photographie"],
    interests: ["nature", "photographie", "aventure"],
    rating: 4.9,
  },
  {
    id: "costarica-1",
    destination: "Costa Rica",
    country: "Costa Rica",
    title: "Costa Rica - Jungle sauvage",
    description: "Jungles luxuriantes, volcans fumants, plages sur deux océans. Faune incroyable (paresseux, toucans) et accueil chaleureux.",
    estimatedPrice: 85,
    travelStyle: "adventure",
    imageQuery: "Costa Rica jungle volcano wildlife tropical",
    tags: ["Aventure", "Nature", "Animaux"],
    interests: ["nature", "aventure", "animaux"],
    rating: 4.8,
  },
  {
    id: "perou-1",
    destination: "Pérou",
    country: "Pérou",
    title: "Pérou - Machu Picchu légendaire",
    description: "Cité inca perchée dans les nuages, vallée sacrée mystique. Randonnées époustouflantes, culture quechua vivante et cuisine du monde.",
    estimatedPrice: 100,
    travelStyle: "adventure",
    imageQuery: "Peru Machu Picchu mountains hiking",
    tags: ["Aventure", "Histoire", "Randonnée"],
    interests: ["histoire", "aventure", "randonnée"],
    rating: 4.7,
  },
  {
    id: "marrakech-1",
    destination: "Marrakech",
    country: "Maroc",
    title: "Marrakech - Riad exotique",
    description: "Médinas labyrinthiques, palais ornés et souks colorés débordant d'épices. Désert du Sahara à proximité, montagnes de l'Atlas majestueuses.",
    estimatedPrice: 45,
    travelStyle: "adventure",
    imageQuery: "Marrakech Morocco medina souk exotic",
    tags: ["Aventure", "Culturel", "Budget"],
    interests: ["culture", "aventure", "désert"],
    rating: 4.6,
  },
  {
    id: "tokyo-1",
    destination: "Tokyo",
    country: "Japon",
    title: "Tokyo - Mégalopole cosmopolite",
    description: "Gratte-ciel futuristes côtoient temples traditionnels. Gastronomie mondialement réputée, technologie de pointe et culture pop dynamique.",
    estimatedPrice: 120,
    travelStyle: "gastronomie",
    imageQuery: "Tokyo Japan city modern temples neon",
    tags: ["Gastronomie", "Ville", "Technologie"],
    interests: ["gastronomie", "technologie", "culture"],
    rating: 4.8,
  },
  {
    id: "lyon-1",
    destination: "Lyon",
    country: "France",
    title: "Lyon - Capitale gastronomique",
    description: "Capitale mondiale de la gastronomie française. Restaurants renommés, confluent de rivières pittoresque et vins fins de Bourgogne.",
    estimatedPrice: 70,
    travelStyle: "gastronomie",
    imageQuery: "Lyon France gastronomy wine restaurants",
    tags: ["Gastronomie", "Ville", "Vin"],
    interests: ["gastronomie", "vin", "culture"],
    rating: 4.7,
  },
  {
    id: "barcelone-1",
    destination: "Barcelone",
    country: "Espagne",
    title: "Barcelone - Architecture gaudienne",
    description: "Sagrada Familia surréaliste, parc Güell enchanté, plages méditerranéennes. Tapas délicieuses et ambiance catalane festive.",
    estimatedPrice: 65,
    travelStyle: "gastronomie",
    imageQuery: "Barcelona Spain Gaudi Sagrada Familia beach",
    tags: ["Gastronomie", "Plage", "Architecture"],
    interests: ["architecture", "gastronomie", "plage"],
    rating: 4.7,
  },
  {
    id: "maldives-1",
    destination: "Maldives",
    country: "Maldives",
    title: "Maldives - Bungalows sur l'eau",
    description: "Résorts ultra-luxe avec bungalows surélevés, eaux cristallines turquoises. Plongée spectaculaire, lune de miel idéale avec palmiers et poissons tropicaux.",
    estimatedPrice: 300,
    travelStyle: "luxury",
    imageQuery: "Maldives luxury bungalows overwater ocean",
    tags: ["Luxe", "Plongée", "Lune de miel"],
    interests: ["luxe", "plongée", "romance"],
    rating: 4.9,
  },
  {
    id: "borabora-1",
    destination: "Bora Bora",
    country: "Polynésie française",
    title: "Bora Bora - Paradis polynésien",
    description: "Lagon bleu glacier avec îlots de luxe. Randonnée au sommet offrant vues panoramiques, snorkeling avec raies manta.",
    estimatedPrice: 200,
    travelStyle: "luxury",
    imageQuery: "Bora Bora Polynesia lagoon luxury island",
    tags: ["Luxe", "Plage", "Lune de miel"],
    interests: ["luxe", "plage", "romance"],
    rating: 4.9,
  },
  {
    id: "dubai-1",
    destination: "Dubaï",
    country: "Émirats Arabes Unis",
    title: "Dubaï - Luxe moderne",
    description: "Gratte-ciel futuristes, désert doré tout près. Shopping de luxe, plages privées et nuits vibrantes dans la capitale du glamour.",
    estimatedPrice: 180,
    travelStyle: "luxury",
    imageQuery: "Dubai luxury modern desert city skyline",
    tags: ["Luxe", "Shopping", "Moderne"],
    interests: ["luxe", "shopping", "aventure"],
    rating: 4.7,
  },
  {
    id: "thailand-1",
    destination: "Thaïlande",
    country: "Thaïlande",
    title: "Thaïlande - Plages et temples",
    description: "Temples bouddhistes dorés, îles paradisiaques avec plages de sable blanc. Cuisine épicée délicieuse, peuple souriant et budget très économique.",
    estimatedPrice: 38,
    travelStyle: "budget",
    imageQuery: "Thailand temples beaches islands tropical",
    tags: ["Plage", "Culture", "Budget"],
    interests: ["plage", "culture", "gastronomie"],
    rating: 4.7,
  },
  {
    id: "bangkok-1",
    destination: "Bangkok",
    country: "Thaïlande",
    title: "Bangkok - Mégalopole exotique",
    description: "Temples dorés à chaque coin, marchés flottants vibrantes, gastronomie de rue intoxicante. Vie nocturne palpitante, prix défiant la concurrence.",
    estimatedPrice: 35,
    travelStyle: "budget",
    imageQuery: "Bangkok Thailand temples market city night",
    tags: ["Gastronomie", "Culture", "Aventure"],
    interests: ["gastronomie", "culture", "aventure"],
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
