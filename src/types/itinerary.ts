// ── Request ─────────────────────────────────────────────

export interface GenerateItineraryRequest {
  destination: string;
  durationDays: number;
  budget: string;
  travelType: string;
  groupType: string;
  startDate?: string;
  endDate?: string;
}

// ── Response (strict, frontend-friendly) ────────────────

export interface ItineraryActivity {
  time: "matin" | "après-midi" | "soir";
  name: string;
  description: string;
  category: "visite" | "culture" | "nature" | "shopping" | "sport" | "detente" | "transport" | "autre";
  duration?: string;
  estimatedCost?: string;
}

export interface ItineraryMeal {
  time: "petit-déjeuner" | "déjeuner" | "dîner";
  name: string;
  description: string;
  priceRange?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
  food: ItineraryMeal[];
  tips: string[];
}

export interface GeneratedItinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
}

// ── Validation ──────────────────────────────────────────

export function validateItineraryRequest(body: unknown): {
  ok: true;
  data: GenerateItineraryRequest;
} | {
  ok: false;
  error: string;
} {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Body requis" };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.destination !== "string" || b.destination.trim().length < 2) {
    return { ok: false, error: "destination requise (min 2 caractères)" };
  }
  if (typeof b.durationDays !== "number" || b.durationDays < 1 || b.durationDays > 21) {
    return { ok: false, error: "durationDays requis (1–21)" };
  }
  if (typeof b.budget !== "string" || !b.budget.trim()) {
    return { ok: false, error: "budget requis" };
  }
  if (typeof b.travelType !== "string" || !b.travelType.trim()) {
    return { ok: false, error: "travelType requis" };
  }
  if (typeof b.groupType !== "string" || !b.groupType.trim()) {
    return { ok: false, error: "groupType requis" };
  }

  return {
    ok: true,
    data: {
      destination: b.destination.trim(),
      durationDays: b.durationDays,
      budget: b.budget.trim(),
      travelType: b.travelType.trim(),
      groupType: b.groupType.trim(),
      startDate: typeof b.startDate === "string" ? b.startDate : undefined,
      endDate: typeof b.endDate === "string" ? b.endDate : undefined,
    },
  };
}

// ── Parse & validate AI response ────────────────────────

const VALID_TIMES: ItineraryActivity["time"][] = ["matin", "après-midi", "soir"];
const VALID_CATEGORIES: ItineraryActivity["category"][] = [
  "visite", "culture", "nature", "shopping", "sport", "detente", "transport", "autre",
];
const VALID_MEAL_TIMES: ItineraryMeal["time"][] = ["petit-déjeuner", "déjeuner", "dîner"];

function clampTime(t: unknown): ItineraryActivity["time"] {
  if (typeof t === "string" && VALID_TIMES.includes(t as ItineraryActivity["time"])) {
    return t as ItineraryActivity["time"];
  }
  return "matin";
}

function clampCategory(c: unknown): ItineraryActivity["category"] {
  if (typeof c === "string" && VALID_CATEGORIES.includes(c as ItineraryActivity["category"])) {
    return c as ItineraryActivity["category"];
  }
  return "autre";
}

function clampMealTime(t: unknown): ItineraryMeal["time"] {
  if (typeof t === "string" && VALID_MEAL_TIMES.includes(t as ItineraryMeal["time"])) {
    return t as ItineraryMeal["time"];
  }
  return "déjeuner";
}

export function parseItineraryResponse(raw: unknown, expectedDays: number): GeneratedItinerary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.title !== "string" || typeof r.summary !== "string" || !Array.isArray(r.days)) {
    return null;
  }

  if (r.days.length === 0) return null;

  const days: ItineraryDay[] = r.days.slice(0, expectedDays).map((d: unknown, i: number) => {
    const day = (d && typeof d === "object" ? d : {}) as Record<string, unknown>;

    const activities: ItineraryActivity[] = (
      Array.isArray(day.activities) ? day.activities : []
    ).map((a: unknown) => {
      const act = (a && typeof a === "object" ? a : {}) as Record<string, unknown>;
      return {
        time: clampTime(act.time),
        name: typeof act.name === "string" ? act.name : "Activité",
        description: typeof act.description === "string" ? act.description : "",
        category: clampCategory(act.category),
        ...(typeof act.duration === "string" && { duration: act.duration }),
        ...(typeof act.estimatedCost === "string" && { estimatedCost: act.estimatedCost }),
      };
    });

    const food: ItineraryMeal[] = (
      Array.isArray(day.food) ? day.food : []
    ).map((f: unknown) => {
      const meal = (f && typeof f === "object" ? f : {}) as Record<string, unknown>;
      return {
        time: clampMealTime(meal.time),
        name: typeof meal.name === "string" ? meal.name : "Restaurant",
        description: typeof meal.description === "string" ? meal.description : "",
        ...(typeof meal.priceRange === "string" && { priceRange: meal.priceRange }),
      };
    });

    const tips: string[] = (
      Array.isArray(day.tips) ? day.tips : []
    ).filter((t): t is string => typeof t === "string").slice(0, 5);

    return {
      day: i + 1,
      title: typeof day.title === "string" ? day.title : `Jour ${i + 1}`,
      activities,
      food,
      tips,
    };
  });

  return {
    title: r.title as string,
    summary: r.summary as string,
    days,
  };
}
