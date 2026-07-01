import { describe, it, expect } from "vitest";

interface ItineraryDay {
  day: number;
  title: string;
  activities?: Array<{
    name: string;
    time: string;
    description: string;
    category?: string;
    estimatedCost?: number;
  }>;
  food?: Array<{
    name: string;
    description: string;
    priceRange?: string;
  }>;
  tips?: string[];
}

interface Itinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
}

// Helper pour parser et valider un itinéraire
function parseItinerary(data: unknown): { valid: boolean; itinerary?: Itinerary; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid itinerary data" };
  }

  const obj = data as Record<string, unknown>;

  if (!obj.days || !Array.isArray(obj.days)) {
    return { valid: false, error: "Missing or invalid days array" };
  }

  if (obj.days.length === 0) {
    return { valid: false, error: "No days in itinerary" };
  }

  // Valider chaque jour
  for (const day of obj.days) {
    if (typeof day !== "object" || !day) {
      return { valid: false, error: "Invalid day object" };
    }

    const dayObj = day as Record<string, unknown>;
    if (typeof dayObj.day !== "number" || typeof dayObj.title !== "string") {
      return { valid: false, error: "Day must have day number and title" };
    }
  }

  return {
    valid: true,
    itinerary: obj as unknown as Itinerary,
  };
}

describe("Itinerary Parsing", () => {
  const validItinerary = {
    title: "Évasion à Bali",
    summary: "Une semaine de détente",
    days: [
      {
        day: 1,
        title: "Arrivée à Bali",
        activities: [
          {
            name: "Transfert aéroport",
            time: "14:00",
            description: "Arrivée et transfert",
          },
        ],
        food: [
          {
            name: "Dîner local",
            description: "Découverte culinaire",
            priceRange: "10-20€",
          },
        ],
        tips: ["Bien vous hydrater après le vol"],
      },
      {
        day: 2,
        title: "Temple Tanah Lot",
        activities: [
          {
            name: "Visite temple",
            time: "09:00",
            description: "Temple iconique",
          },
        ],
        tips: ["Apportez un appareil photo"],
      },
    ],
  };

  describe("parseItinerary", () => {
    it("devrait parser un itinéraire valide", () => {
      const result = parseItinerary(validItinerary);
      expect(result.valid).toBe(true);
      expect(result.itinerary).toBeDefined();
      expect(result.itinerary?.days.length).toBe(2);
    });

    it("devrait rejeter null", () => {
      const result = parseItinerary(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid itinerary data");
    });

    it("devrait rejeter un objet sans jours", () => {
      const result = parseItinerary({ title: "Test" });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Missing or invalid days array");
    });

    it("devrait rejeter un itinéraire vide", () => {
      const result = parseItinerary({ title: "Test", days: [] });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("No days in itinerary");
    });

    it("devrait rejeter un jour sans numéro", () => {
      const invalidItinerary = {
        title: "Test",
        days: [
          {
            title: "Jour 1",
            activities: [],
          },
        ],
      };
      const result = parseItinerary(invalidItinerary);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("day number");
    });

    it("devrait accepter un itinéraire incomplet", () => {
      const minimalItinerary = {
        days: [
          {
            day: 1,
            title: "Jour 1",
          },
        ],
      };
      const result = parseItinerary(minimalItinerary);
      expect(result.valid).toBe(true);
      expect(result.itinerary?.days[0].activities).toBeUndefined();
    });

    it("devrait préserver les données présentes", () => {
      const result = parseItinerary(validItinerary);
      expect(result.itinerary?.title).toBe("Évasion à Bali");
      expect(result.itinerary?.summary).toBe("Une semaine de détente");
      expect(result.itinerary?.days[0].activities?.length).toBe(1);
      expect(result.itinerary?.days[0].food?.length).toBe(1);
    });
  });
});
