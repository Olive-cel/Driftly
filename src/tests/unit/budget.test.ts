import { describe, it, expect } from "vitest";

interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
}

// Helper pour calculer le budget journalier
function calculateDailyBudget(
  totalBudget: number | null,
  duration: number | null,
  estimatedCost?: number
): { estimatedBudget: number } {
  if (!totalBudget || !duration || duration <= 0) {
    return { estimatedBudget: 0 };
  }

  const dailyBudget = totalBudget / duration;

  if (estimatedCost && estimatedCost > 0) {
    return { estimatedBudget: Math.round(estimatedCost) };
  }

  return { estimatedBudget: Math.round(dailyBudget) };
}

// Helper pour répartir le budget
function calculateBudgetBreakdown(
  totalBudget: number | null
): BudgetBreakdown {
  if (!totalBudget || totalBudget <= 0) {
    return {
      accommodation: 0,
      food: 0,
      activities: 0,
      transport: 0,
    };
  }

  return {
    accommodation: Math.round(totalBudget * 0.4),
    food: Math.round(totalBudget * 0.3),
    activities: Math.round(totalBudget * 0.2),
    transport: Math.round(totalBudget * 0.1),
  };
}

describe("Budget Helpers", () => {
  describe("calculateDailyBudget", () => {
    it("devrait calculer le budget journalier", () => {
      const result = calculateDailyBudget(2100, 7);
      expect(result.estimatedBudget).toBe(300);
    });

    it("devrait retourner 0 si pas de budget total", () => {
      const result = calculateDailyBudget(null, 7);
      expect(result.estimatedBudget).toBe(0);
    });

    it("devrait retourner 0 si pas de durée", () => {
      const result = calculateDailyBudget(2100, null);
      expect(result.estimatedBudget).toBe(0);
    });

    it("devrait utiliser le coût estimé s'il est fourni", () => {
      const result = calculateDailyBudget(2100, 7, 350);
      expect(result.estimatedBudget).toBe(350);
    });

    it("devrait ignorer un coût estimé négatif", () => {
      const result = calculateDailyBudget(2100, 7, -100);
      expect(result.estimatedBudget).toBe(300);
    });
  });

  describe("calculateBudgetBreakdown", () => {
    it("devrait répartir le budget correctement", () => {
      const breakdown = calculateBudgetBreakdown(1000);
      expect(breakdown.accommodation).toBe(400); // 40%
      expect(breakdown.food).toBe(300); // 30%
      expect(breakdown.activities).toBe(200); // 20%
      expect(breakdown.transport).toBe(100); // 10%
    });

    it("devrait retourner 0 pour tous si pas de budget", () => {
      const breakdown = calculateBudgetBreakdown(null);
      expect(breakdown.accommodation).toBe(0);
      expect(breakdown.food).toBe(0);
      expect(breakdown.activities).toBe(0);
      expect(breakdown.transport).toBe(0);
    });

    it("devrait retourner 0 pour tous si budget négatif", () => {
      const breakdown = calculateBudgetBreakdown(-1000);
      expect(breakdown.accommodation).toBe(0);
      expect(breakdown.food).toBe(0);
      expect(breakdown.activities).toBe(0);
      expect(breakdown.transport).toBe(0);
    });

    it("devrait gérer les petits budgets", () => {
      const breakdown = calculateBudgetBreakdown(100);
      // 40 + 30 + 20 + 10 = 100
      expect(
        breakdown.accommodation +
          breakdown.food +
          breakdown.activities +
          breakdown.transport
      ).toBe(100);
    });
  });
});
