import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import type { GenerateItineraryRequest, GeneratedItinerary } from "@/types/itinerary";
import { parseItineraryResponse } from "@/types/itinerary";
import { buildItinerarySystemPrompt, buildItineraryUserPrompt } from "./build-itinerary-prompt";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;

interface GenerateOptions {
  request: GenerateItineraryRequest;
  userPreferences: Record<string, unknown> | null;
}

function buildMockItinerary(request: GenerateItineraryRequest): GeneratedItinerary {
  const days = Array.from({ length: request.durationDays }, (_, i) => ({
    day: i + 1,
    title: `Jour ${i + 1} à ${request.destination}`,
    activities: [
      {
        time: "matin" as const,
        name: "Visite guidée (mock)",
        description: `Découverte de ${request.destination} — réponse simulée, Anthropic non configuré.`,
        category: "visite" as const,
        duration: "3h",
      },
      {
        time: "après-midi" as const,
        name: "Temps libre (mock)",
        description: "Exploration personnelle du quartier.",
        category: "detente" as const,
        duration: "3h",
      },
    ],
    food: [
      {
        time: "déjeuner" as const,
        name: "Restaurant local (mock)",
        description: "Cuisine locale recommandée.",
        priceRange: "€€",
      },
    ],
    tips: ["Ceci est un itinéraire de démonstration — configurez ANTHROPIC_API_KEY pour des résultats réels."],
  }));

  return {
    title: `Voyage à ${request.destination} (mock)`,
    summary: `Itinéraire simulé de ${request.durationDays} jour(s) — ANTHROPIC_API_KEY non configurée.`,
    days,
  };
}

export async function generateItinerary({
  request,
  userPreferences,
}: GenerateOptions): Promise<GeneratedItinerary> {
  const apiKey = env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("[AI] ANTHROPIC_API_KEY absent ou placeholder — réponse mockée");
    return buildMockItinerary(request);
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildItinerarySystemPrompt(),
    messages: [
      {
        role: "user",
        content: buildItineraryUserPrompt({ request, userPreferences }),
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Claude response");
  }

  const rawText = textBlock.text.trim();

  let jsonString = rawText;
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonString = fenceMatch[1].trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("Failed to parse Claude response as JSON");
  }

  const itinerary = parseItineraryResponse(parsed, request.durationDays);
  if (!itinerary) {
    throw new Error("Claude response does not match expected itinerary schema");
  }

  return itinerary;
}
