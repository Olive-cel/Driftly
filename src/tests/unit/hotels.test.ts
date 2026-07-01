import { describe, it, expect, vi } from "vitest";
import { generateHotelRecommendations, getMockHotels, type HotelRecommendation } from "@/lib/hotels";

// Mock Pexels searchImage
vi.mock("@/lib/pexels", () => ({
  searchImage: vi.fn().mockResolvedValue({
    imageUrl: "https://example.com/hotel.jpg",
  }),
}));

describe("Hotels Service", () => {
  const mockParams = {
    destination: "Paris",
    start_date: "2026-07-01",
    end_date: "2026-07-04",
    travelers_count: 2,
    budget: 200,
    travel_style: "moderate",
  };

  describe("getMockHotels", () => {
    it("should generate hotels for given destination and dates", () => {
      const hotels = getMockHotels(mockParams);

      expect(hotels).toBeDefined();
      expect(hotels.length).toBeGreaterThan(0);
      expect(hotels[0]).toHaveProperty("id");
      expect(hotels[0]).toHaveProperty("name");
      expect(hotels[0]).toHaveProperty("price_per_night");
      expect(hotels[0]).toHaveProperty("total_price");
    });

    it("should calculate correct nights", () => {
      const hotels = getMockHotels(mockParams);
      const nights = Math.ceil(
        (new Date(mockParams.end_date).getTime() - new Date(mockParams.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      hotels.forEach((hotel) => {
        expect(hotel.nights).toBe(nights);
        expect(hotel.total_price).toBe(hotel.price_per_night * nights);
      });
    });

    it("should include required hotel fields", () => {
      const hotels = getMockHotels(mockParams);

      hotels.forEach((hotel) => {
        expect(hotel).toHaveProperty("id");
        expect(hotel).toHaveProperty("name");
        expect(hotel).toHaveProperty("location");
        expect(hotel).toHaveProperty("rating");
        expect(hotel).toHaveProperty("price_per_night");
        expect(hotel).toHaveProperty("total_price");
        expect(hotel).toHaveProperty("currency", "EUR");
        expect(hotel).toHaveProperty("amenities");
        expect(hotel).toHaveProperty("badge");
        expect(hotel).toHaveProperty("description");
        expect(hotel).toHaveProperty("nights");

        // Validate types
        expect(typeof hotel.name).toBe("string");
        expect(typeof hotel.rating).toBe("number");
        expect(typeof hotel.price_per_night).toBe("number");
        expect(Array.isArray(hotel.amenities)).toBe(true);
      });
    });

    it("should set appropriate badge based on travel style", () => {
      const budgetHotels = getMockHotels({
        ...mockParams,
        travel_style: "budget",
      });

      const premiumHotels = getMockHotels({
        ...mockParams,
        travel_style: "premium",
      });

      // Budget hotels should have lower prices
      const budgetAvg =
        budgetHotels.reduce((sum, h) => sum + h.price_per_night, 0) / budgetHotels.length;
      const premiumAvg =
        premiumHotels.reduce((sum, h) => sum + h.price_per_night, 0) / premiumHotels.length;

      expect(budgetAvg).toBeLessThan(premiumAvg);
    });

    it("should handle single night stays", () => {
      const singleNightParams = {
        ...mockParams,
        start_date: "2026-07-01",
        end_date: "2026-07-02",
      };

      const hotels = getMockHotels(singleNightParams);
      hotels.forEach((hotel) => {
        expect(hotel.nights).toBe(1);
        expect(hotel.total_price).toBe(hotel.price_per_night);
      });
    });

    it("should include amenities for all hotels", () => {
      const hotels = getMockHotels(mockParams);

      hotels.forEach((hotel) => {
        expect(Array.isArray(hotel.amenities)).toBe(true);
        expect(hotel.amenities.length).toBeGreaterThan(0);
        hotel.amenities.forEach((amenity) => {
          expect(typeof amenity).toBe("string");
          expect(amenity.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have valid rating values", () => {
      const hotels = getMockHotels(mockParams);

      hotels.forEach((hotel) => {
        expect(hotel.rating).toBeGreaterThanOrEqual(3.5);
        expect(hotel.rating).toBeLessThanOrEqual(5.0);
      });
    });

    it("should generate different names for each hotel", () => {
      const hotels = getMockHotels(mockParams);

      const names = hotels.map((h) => h.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe("generateHotelRecommendations", () => {
    it("should attempt to generate hotels with images", async () => {
      const hotels = await generateHotelRecommendations(mockParams);

      expect(hotels).toBeDefined();
      expect(Array.isArray(hotels)).toBe(true);
      expect(hotels.length).toBeGreaterThan(0);
    });

    it("should maintain hotel structure consistency", async () => {
      const hotels = await generateHotelRecommendations(mockParams);

      hotels.forEach((hotel: HotelRecommendation) => {
        expect(hotel).toHaveProperty("id");
        expect(hotel).toHaveProperty("name");
        expect(hotel).toHaveProperty("rating");
        expect(hotel).toHaveProperty("price_per_night");
        expect(hotel).toHaveProperty("total_price");
        expect(hotel).toHaveProperty("currency", "EUR");
      });
    });
  });
});
