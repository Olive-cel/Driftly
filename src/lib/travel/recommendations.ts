/**
 * Personalized Travel Recommendations
 * Generates destination recommendations based on user profile and travel history
 * 
 * TODO: This can be enhanced with:
 * - Machine learning algorithms
 * - User behavioral data
 * - Weather patterns
 * - Travel trends
 * - Dynamic pricing integration
 */

import type { Database } from "@/types/database";
import { getDestinationImageSmall } from "./destination-images";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] | null;
type Trip = Database["public"]["Tables"]["trips"]["Row"];

export interface Recommendation {
  destination: string;
  country: string;
  priceFrom: number;
  reason: string;
  imageUrl: string;
  tags: string[];
  rating: number;
  travelStyle?: string;
}

const recommendationDatabase: Record<string, Recommendation> = {
  "Bali": {
    destination: "Bali",
    country: "Indonésie",
    priceFrom: 890,
    reason: "Plages paradisiaques et temples ancestraux",
    imageUrl: getDestinationImageSmall("Bali"),
    tags: ["Plage", "Relaxation", "Culture"],
    rating: 4.8,
    travelStyle: "relaxation",
  },
  "Santorin": {
    destination: "Santorin",
    country: "Grèce",
    priceFrom: 1200,
    reason: "Couchers de soleil spectaculaires",
    imageUrl: getDestinationImageSmall("Santorin"),
    tags: ["Plage", "Romance", "Luxe"],
    rating: 4.9,
    travelStyle: "relaxation",
  },
  "Zanzibar": {
    destination: "Zanzibar",
    country: "Tanzanie",
    priceFrom: 750,
    reason: "Îles tropicales avec culture swahili",
    imageUrl: "https://source.unsplash.com/400x300/?zanzibar,beach",
    tags: ["Plage", "Aventure", "Culturel"],
    rating: 4.7,
    travelStyle: "relaxation",
  },
  "Seychelles": {
    destination: "Seychelles",
    country: "Seychelles",
    priceFrom: 2500,
    reason: "Îles privées et récifs de classe mondiale",
    imageUrl: "https://source.unsplash.com/400x300/?seychelles",
    tags: ["Luxe", "Plage", "Lune de miel"],
    rating: 4.9,
    travelStyle: "relaxation",
  },
  "Lisbonne": {
    destination: "Lisbonne",
    country: "Portugal",
    priceFrom: 650,
    reason: "Capitale historique avec ambiance bohème",
    imageUrl: getDestinationImageSmall("Lisbonne"),
    tags: ["Ville", "Culture", "Gastronomie"],
    rating: 4.7,
    travelStyle: "city_trip",
  },
  "Prague": {
    destination: "Prague",
    country: "République Tchèque",
    priceFrom: 600,
    reason: "Architecture gothique et vie nocturne",
    imageUrl: getDestinationImageSmall("Prague"),
    tags: ["Ville", "Histoire", "Vie nocturne"],
    rating: 4.8,
    travelStyle: "city_trip",
  },
  "Amsterdam": {
    destination: "Amsterdam",
    country: "Pays-Bas",
    priceFrom: 800,
    reason: "Canaux pittoresques et musées renommés",
    imageUrl: getDestinationImageSmall("Amsterdam"),
    tags: ["Ville", "Culture", "Vélo"],
    rating: 4.7,
    travelStyle: "city_trip",
  },
  "Rome": {
    destination: "Rome",
    country: "Italie",
    priceFrom: 900,
    reason: "La Ville Éternelle pleine de charme",
    imageUrl: getDestinationImageSmall("Rome"),
    tags: ["Ville", "Histoire", "Gastronomie"],
    rating: 4.8,
    travelStyle: "city_trip",
  },
  "Islande": {
    destination: "Islande",
    country: "Islande",
    priceFrom: 1500,
    reason: "Glaciers, geysers et aurores boréales",
    imageUrl: "https://source.unsplash.com/400x300/?iceland,waterfall",
    tags: ["Nature", "Aventure", "Photographie"],
    rating: 4.9,
    travelStyle: "aventure",
  },
  "Costa Rica": {
    destination: "Costa Rica",
    country: "Costa Rica",
    priceFrom: 1200,
    reason: "Forêts tropicales et biodiversité",
    imageUrl: "https://source.unsplash.com/400x300/?costarica,jungle",
    tags: ["Aventure", "Nature", "Animaux"],
    rating: 4.8,
    travelStyle: "aventure",
  },
  "Pérou": {
    destination: "Pérou",
    country: "Pérou",
    priceFrom: 1100,
    reason: "Machu Picchu et culture inca",
    imageUrl: "https://source.unsplash.com/400x300/?peru,mountain",
    tags: ["Aventure", "Histoire", "Randonnée"],
    rating: 4.7,
    travelStyle: "aventure",
  },
  "Maroc": {
    destination: "Maroc",
    country: "Maroc",
    priceFrom: 700,
    reason: "Déserts, medinas et montagnes de l'Atlas",
    imageUrl: getDestinationImageSmall("Marrakech"),
    tags: ["Aventure", "Culturel", "Budget"],
    rating: 4.6,
    travelStyle: "aventure",
  },
  "Tokyo": {
    destination: "Tokyo",
    country: "Japon",
    priceFrom: 1800,
    reason: "Fusion de tradition et modernité",
    imageUrl: getDestinationImageSmall("Tokyo"),
    tags: ["Gastronomie", "Ville", "Technologie"],
    rating: 4.8,
    travelStyle: "gastronomie",
  },
  "Lyon": {
    destination: "Lyon",
    country: "France",
    priceFrom: 850,
    reason: "Capitale mondiale de la gastronomie",
    imageUrl: "https://source.unsplash.com/400x300/?lyon,restaurant",
    tags: ["Gastronomie", "Ville", "Vin"],
    rating: 4.7,
    travelStyle: "gastronomie",
  },
  "Barcelone": {
    destination: "Barcelone",
    country: "Espagne",
    priceFrom: 850,
    reason: "Architecture unique de Gaudí et plages",
    imageUrl: getDestinationImageSmall("Barcelone"),
    tags: ["Gastronomie", "Plage", "Architecture"],
    rating: 4.7,
    travelStyle: "gastronomie",
  },
  "Maldives": {
    destination: "Maldives",
    country: "Maldives",
    priceFrom: 3500,
    reason: "Bungalows sur l'eau et plongée",
    imageUrl: "https://source.unsplash.com/400x300/?maldives,resort",
    tags: ["Luxe", "Plongée", "Lune de miel"],
    rating: 4.9,
  },
  "Japon": {
    destination: "Japon",
    country: "Japon",
    priceFrom: 2200,
    reason: "Culture, temples et paysages",
    imageUrl: getDestinationImageSmall("Tokyo"),
    tags: ["Culturel", "Luxe", "Gastronomie"],
    rating: 4.8,
  },
  "Polynésie": {
    destination: "Bora Bora",
    country: "Polynésie française",
    priceFrom: 2600,
    reason: "Lagons cristallins et îles privées",
    imageUrl: "https://source.unsplash.com/400x300/?borabora",
    tags: ["Luxe", "Plage", "Lune de miel"],
    rating: 4.9,
  },
};

/**
 * Get personalized recommendations for a user
 */
export function getPersonalizedRecommendations(
  profile: Profile,
  trips: Trip[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const visitedDestinations = new Set(trips.map((t) => t.destination?.toLowerCase()));

  // Get recommendations based on travel style
  if (profile?.travel_style) {
    const styleRecs = Object.values(recommendationDatabase).filter(
      (rec) => rec.travelStyle === profile.travel_style
    );
    recommendations.push(...styleRecs);
  }

  // Get recommendations based on budget
  if (profile?.budget_preference) {
    const budget = profile.budget_preference;
    const budgetRecs = Object.values(recommendationDatabase).filter((rec) => {
      // If high budget, show luxury destinations
      if (budget >= 3000) {
        return rec.priceFrom >= 2000;
      }
      // If low budget, show affordable destinations
      if (budget < 1000) {
        return rec.priceFrom < 1200;
      }
      return true;
    });
    recommendations.push(...budgetRecs);
  }

  // Add recommendations based on interests
  if (profile?.interests && Array.isArray(profile.interests)) {
    const interests = profile.interests as string[];
    // You can add more sophisticated matching here
    // For now, just mark recommendations with relevant tags
  }

  // Remove duplicates and visited destinations
  const uniqueRecs = Array.from(
    new Map(recommendations.map((rec) => [rec.destination.toLowerCase(), rec])).values()
  ).filter((rec) => !visitedDestinations.has(rec.destination.toLowerCase()));

  // Sort by rating and return top 8
  return uniqueRecs.sort((a, b) => b.rating - a.rating).slice(0, 8);
}

/**
 * Get a specific recommendation by destination name
 */
export function getRecommendation(destination: string): Recommendation | undefined {
  const lower = destination.toLowerCase();
  return Object.values(recommendationDatabase).find(
    (rec) => rec.destination.toLowerCase() === lower
  );
}

/**
 * Get all available recommendations (for admin/reference)
 */
export function getAllRecommendations(): Recommendation[] {
  return Object.values(recommendationDatabase);
}
