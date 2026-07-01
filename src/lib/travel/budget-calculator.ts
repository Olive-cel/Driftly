/**
 * Helper pour calcul de budget dynamique.
 * 
 * Pas de valeurs hardcodées:
 * - Budget par jour calculé depuis trip.budget / duration
 * - Répartition budget % basée sur proportions standards
 * - Fallback intelligent si données IA manquent
 */

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
  total: number;
}

export interface DailyBudget {
  dayNumber: number;
  estimatedBudget: number;
  currency: string;
}

/**
 * Calcule le budget estimé pour un jour.
 * 
 * Stratégie:
 * 1. Si day.estimatedCost existe → l'utiliser
 * 2. Sinon calculer: trip.budget / trip.duration
 */
export function calculateDailyBudget(
  tripBudget: number | null | undefined,
  tripDuration: number | null | undefined,
  dayEstimatedCost?: string | number | null,
  dayNumber?: number
): DailyBudget {
  const dayNum = dayNumber || 1;

  // Si le jour a un budget spécifique
  if (dayEstimatedCost) {
    const cost =
      typeof dayEstimatedCost === "string"
        ? parseFloat(dayEstimatedCost.replace(/[^0-9.]/g, ""))
        : dayEstimatedCost;

    if (!isNaN(cost) && cost > 0) {
      return {
        dayNumber: dayNum,
        estimatedBudget: Math.round(cost),
        currency: "€",
      };
    }
  }

  // Fallback: calculer depuis trip
  if (tripBudget && tripBudget > 0 && tripDuration && tripDuration > 0) {
    const dailyBudget = tripBudget / tripDuration;
    return {
      dayNumber: dayNum,
      estimatedBudget: Math.round(dailyBudget),
      currency: "€",
    };
  }

  // Pas de données
  return {
    dayNumber: dayNum,
    estimatedBudget: 0,
    currency: "€",
  };
}

/**
 * Calcule la répartition du budget total.
 * 
 * Pourcentages standards (modifiables):
 * - Hébergement: 40%
 * - Restauration: 30%
 * - Activités: 20%
 * - Transport/local: 10%
 */
export function calculateBudgetBreakdown(
  tripBudget: number | null | undefined,
  breakdownFromAI?: Record<string, number>
): BudgetBreakdown {
  // Si l'IA a fourni une répartition, l'utiliser
  if (breakdownFromAI && Object.keys(breakdownFromAI).length > 0) {
    const total =
      (breakdownFromAI.accommodation || 0) +
      (breakdownFromAI.food || 0) +
      (breakdownFromAI.activities || 0) +
      (breakdownFromAI.transport || 0);

    if (total > 0) {
      return {
        accommodation: Math.round(breakdownFromAI.accommodation || 0),
        food: Math.round(breakdownFromAI.food || 0),
        activities: Math.round(breakdownFromAI.activities || 0),
        transport: Math.round(breakdownFromAI.transport || 0),
        total,
      };
    }
  }

  // Fallback: répartition standard
  if (!tripBudget || tripBudget <= 0) {
    return {
      accommodation: 0,
      food: 0,
      activities: 0,
      transport: 0,
      total: 0,
    };
  }

  const accommodation = Math.round(tripBudget * 0.4);
  const food = Math.round(tripBudget * 0.3);
  const activities = Math.round(tripBudget * 0.2);
  const transport = Math.round(tripBudget * 0.1);

  return {
    accommodation,
    food,
    activities,
    transport,
    total: tripBudget,
  };
}

/**
 * Formate un montant pour affichage.
 */
export function formatBudget(
  amount: number | null | undefined,
  currency: string = "€"
): string {
  if (!amount || amount === 0) {
    return "Non disponible";
  }

  return `${Math.round(amount)}${currency}`;
}

/**
 * Extrait les données de budget du generated_content.
 */
export function extractBudgetFromItinerary(generatedContent: unknown): {
  dailyBudgets?: Record<number, number>;
  totalBudgetBreakdown?: Record<string, number>;
} {
  if (!generatedContent || typeof generatedContent !== "object") {
    return {};
  }

  const result: {
    dailyBudgets?: Record<number, number>;
    totalBudgetBreakdown?: Record<string, number>;
  } = {};

  const content = generatedContent as Record<string, unknown>;

  // Chercher budgets quotidiens
  if (content.days && Array.isArray(content.days)) {
    const dailyBudgets: Record<number, number> = {};
    content.days.forEach((day: unknown) => {
      if (day && typeof day === "object") {
        const dayObj = day as Record<string, unknown>;
        if (dayObj.estimatedBudget || dayObj.estimatedCost) {
          const value = dayObj.estimatedBudget || dayObj.estimatedCost;
          const amount =
            typeof value === "string"
              ? parseFloat(String(value).replace(/[^0-9.]/g, ""))
              : typeof value === "number"
              ? value
              : NaN;
          if (!isNaN(amount) && amount > 0 && dayObj.day) {
            dailyBudgets[dayObj.day as number] = amount;
          }
        }
      }
    });
    if (Object.keys(dailyBudgets).length > 0) {
      result.dailyBudgets = dailyBudgets;
    }
  }

  // Chercher répartition globale
  if (content.budgetBreakdown && typeof content.budgetBreakdown === "object") {
    result.totalBudgetBreakdown = content.budgetBreakdown as Record<
      string,
      number
    >;
  }

  return result;
}
