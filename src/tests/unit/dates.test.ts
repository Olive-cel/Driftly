import { describe, it, expect } from "vitest";

// Helper pour calculer la durée entre deux dates
function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

type TripStatus = "draft" | "upcoming" | "ongoing" | "completed";

function getTripStatus(
  startDate: string | null,
  endDate: string | null,
  hasItinerary: boolean
): TripStatus {
  if (!startDate || !endDate) return "draft";
  if (!hasItinerary) return "draft";

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  if (now > end) return "completed";

  return "draft";
}

describe("Date Helpers", () => {
  describe("calculateDuration", () => {
    it("devrait calculer la durée entre deux dates", () => {
      const start = "2026-07-01";
      const end = "2026-07-08";
      const duration = calculateDuration(start, end);
      expect(duration).toBe(7);
    });

    it("devrait retourner 1 pour une durée d'un jour", () => {
      const start = "2026-07-01";
      const end = "2026-07-02";
      const duration = calculateDuration(start, end);
      expect(duration).toBe(1);
    });

    it("devrait gérer les dates à cheval sur plusieurs mois", () => {
      const start = "2026-06-28";
      const end = "2026-07-08";
      const duration = calculateDuration(start, end);
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe("getTripStatus", () => {
    it("devrait retourner 'draft' si pas de dates", () => {
      const status = getTripStatus(null, null, true);
      expect(status).toBe("draft");
    });

    it("devrait retourner 'draft' si pas d'itinéraire", () => {
      const status = getTripStatus("2026-07-01", "2026-07-08", false);
      expect(status).toBe("draft");
    });

    it("devrait retourner 'upcoming' si le voyage est dans le futur", () => {
      const futureStart = new Date();
      futureStart.setDate(futureStart.getDate() + 30);
      const futureEnd = new Date(futureStart);
      futureEnd.setDate(futureEnd.getDate() + 7);

      const status = getTripStatus(
        futureStart.toISOString().split("T")[0],
        futureEnd.toISOString().split("T")[0],
        true
      );
      expect(status).toBe("upcoming");
    });

    it("devrait retourner 'ongoing' si le voyage est en cours", () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const status = getTripStatus(
        yesterday.toISOString().split("T")[0],
        tomorrow.toISOString().split("T")[0],
        true
      );
      expect(status).toBe("ongoing");
    });

    it("devrait retourner 'completed' si le voyage est passé", () => {
      const pastStart = new Date();
      pastStart.setDate(pastStart.getDate() - 30);
      const pastEnd = new Date(pastStart);
      pastEnd.setDate(pastEnd.getDate() + 7);

      const status = getTripStatus(
        pastStart.toISOString().split("T")[0],
        pastEnd.toISOString().split("T")[0],
        true
      );
      expect(status).toBe("completed");
    });
  });
});
