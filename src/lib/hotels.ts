/**
 * Hotels Service
 * Generate realistic hotel recommendations based on destination, dates, budget, and travel style
 */

import { searchImage } from "@/lib/pexels";

export interface HotelRecommendation {
  id: string;
  name: string;
  location: string;
  rating: number;
  price_per_night: number;
  total_price: number;
  currency: string;
  image_url?: string;
  amenities: string[];
  badge: "Meilleur choix" | "Économique" | "Premium" | "Luxe";
  description: string;
  nights: number;
}

interface HotelGenerationParams {
  destination: string;
  start_date: string;
  end_date: string;
  travelers_count: number;
  budget?: number;
  travel_style?: string;
}

// Realistic hotel templates by style and price range
const HOTEL_TEMPLATES = {
  budget: [
    {
      nameTemplate: "{destination} Hostel {variant}",
      ratingRange: [3.5, 4.2],
      amenities: ["WiFi", "Cuisine partagée", "Terrasse", "Espace lounge"],
      pricePerNightRange: [40, 80],
      badge: "Économique" as const,
      descriptionTemplate:
        "Auberge confortable et conviviale au cœur de {destination}. Parfait pour les voyageurs en quête d'expériences locales.",
    },
    {
      nameTemplate: "{destination} Budget Hotel",
      ratingRange: [3.8, 4.3],
      amenities: ["WiFi", "Petit-déjeuner", "Réception 24h"],
      pricePerNightRange: [55, 95],
      badge: "Économique" as const,
      descriptionTemplate: "Hôtel budget pratique avec les équipements essentiels.",
    },
  ],
  moderate: [
    {
      nameTemplate: "{destination} Hotel {variant}",
      ratingRange: [4.0, 4.6],
      amenities: [
        "WiFi",
        "Petit-déjeuner",
        "Piscine",
        "Restaurant",
        "Bar",
        "Gym",
      ],
      pricePerNightRange: [90, 180],
      badge: "Meilleur choix" as const,
      descriptionTemplate:
        "Hôtel 3-4 étoiles idéal pour un séjour confortable à {destination}.",
    },
    {
      nameTemplate: "Hotel Boutique {destination}",
      ratingRange: [4.2, 4.7],
      amenities: [
        "WiFi",
        "Petit-déjeuner",
        "Concierge",
        "Spa",
        "Restaurant gastronomique",
      ],
      pricePerNightRange: [120, 220],
      badge: "Meilleur choix" as const,
      descriptionTemplate:
        "Boutique hôtel charmant avec personnalité unique à {destination}.",
    },
  ],
  premium: [
    {
      nameTemplate: "{destination} Luxury Resort",
      ratingRange: [4.5, 4.9],
      amenities: [
        "WiFi",
        "Petit-déjeuner premium",
        "Piscine",
        "Spa complet",
        "Restaurant 5 étoiles",
        "Butler service",
        "Plage privée",
      ],
      pricePerNightRange: [300, 600],
      badge: "Luxe" as const,
      descriptionTemplate:
        "Resort luxueux avec expérience premium à {destination}. Service haut de gamme et équipements exclusifs.",
    },
    {
      nameTemplate: "Palace Hotel {destination}",
      ratingRange: [4.6, 5.0],
      amenities: [
        "WiFi",
        "Concierge 24h",
        "Spa",
        "Multiple restaurants",
        "Piscine chauffée",
        "Salle de cinéma",
        "Valet",
      ],
      pricePerNightRange: [400, 800],
      badge: "Premium" as const,
      descriptionTemplate:
        "Palace emblématique offrant le luxe absolu à {destination}.",
    },
  ],
};

const VARIANTS = [
  "Central",
  "Grand",
  "Royal",
  "Imperial",
  "Plaza",
  "Manor",
  "Court",
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

function selectHotelStyle(
  budget?: number,
  travelStyle?: string
): "budget" | "moderate" | "premium" {
  // If premium travel style, go premium
  if (travelStyle?.toLowerCase().includes("luxe") || travelStyle?.toLowerCase().includes("premium")) {
    return "premium";
  }

  // If budget travel style, go budget
  if (travelStyle?.toLowerCase().includes("budget") || travelStyle?.toLowerCase().includes("économique")) {
    return "budget";
  }

  // If budget is specified, use it to decide
  if (budget) {
    if (budget < 100) return "budget";
    if (budget < 300) return "moderate";
    return "premium";
  }

  // Default to moderate
  return "moderate";
}

/**
 * Generate realistic hotel recommendations
 */
export async function generateHotelRecommendations(
  params: HotelGenerationParams
): Promise<HotelRecommendation[]> {
  const nights = calculateNights(params.start_date, params.end_date);
  const style = selectHotelStyle(params.budget, params.travel_style);
  const templates = HOTEL_TEMPLATES[style] || HOTEL_TEMPLATES.moderate;

  console.log(`[Hotels] Generating ${templates.length} hotels for ${params.destination}`, {
    nights,
    travelers: params.travelers_count,
    style,
  });

  const hotels: HotelRecommendation[] = [];

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    const variant = getRandomElement(VARIANTS);
    const rating =
      template.ratingRange[0] +
      Math.random() * (template.ratingRange[1] - template.ratingRange[0]);
    const pricePerNight = getRandomInRange(
      template.pricePerNightRange[0],
      template.pricePerNightRange[1]
    );

    const totalPrice = Math.round(pricePerNight * nights);

    const hotel: HotelRecommendation = {
      id: `hotel-${params.destination.toLowerCase().replace(/\s+/g, "-")}-${i}`,
      name: template.nameTemplate
        .replace("{destination}", params.destination)
        .replace("{variant}", variant),
      location: params.destination,
      rating: Math.round(rating * 10) / 10,
      price_per_night: pricePerNight,
      total_price: totalPrice,
      currency: "EUR",
      amenities: template.amenities,
      badge: template.badge,
      description: template.descriptionTemplate.replace("{destination}", params.destination),
      nights,
    };

    // Try to fetch image from Pexels
    try {
      const imageQuery = `${params.destination} hotel luxury`;
      const imageData = await searchImage(imageQuery);
      if (imageData?.imageUrl) {
        hotel.image_url = imageData.imageUrl;
      }
    } catch (err) {
      console.warn(`[Hotels] Failed to fetch image for ${hotel.name}:`, err);
    }

    hotels.push(hotel);
  }

  console.log(`[Hotels] Generated ${hotels.length} hotels with images`);
  return hotels;
}

/**
 * Get mock hotels (no Pexels dependency)
 */
export function getMockHotels(params: HotelGenerationParams): HotelRecommendation[] {
  const nights = calculateNights(params.start_date, params.end_date);
  const style = selectHotelStyle(params.budget, params.travel_style);
  const templates = HOTEL_TEMPLATES[style] || HOTEL_TEMPLATES.moderate;

  return templates.map((template, i) => {
    const variant = getRandomElement(VARIANTS);
    const rating =
      template.ratingRange[0] +
      Math.random() * (template.ratingRange[1] - template.ratingRange[0]);
    const pricePerNight = getRandomInRange(
      template.pricePerNightRange[0],
      template.pricePerNightRange[1]
    );
    const totalPrice = Math.round(pricePerNight * nights);

    return {
      id: `hotel-${params.destination.toLowerCase().replace(/\s+/g, "-")}-${i}`,
      name: template.nameTemplate
        .replace("{destination}", params.destination)
        .replace("{variant}", variant),
      location: params.destination,
      rating: Math.round(rating * 10) / 10,
      price_per_night: pricePerNight,
      total_price: totalPrice,
      currency: "EUR",
      amenities: template.amenities,
      badge: template.badge,
      description: template.descriptionTemplate.replace("{destination}", params.destination),
      nights,
    };
  });
}
