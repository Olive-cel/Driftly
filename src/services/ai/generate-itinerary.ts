import OpenAI from "openai";
import { env } from "@/lib/env";
import type { GenerateItineraryRequest, GeneratedItinerary } from "@/types/itinerary";
import { parseItineraryResponse } from "@/types/itinerary";
import { buildItinerarySystemPrompt, buildItineraryUserPrompt } from "./build-itinerary-prompt";
import {
  openaiRequestsTotal,
  itineraryGeneratedTotal,
  itineraryGenerationDurationSeconds,
  appErrorsTotal,
} from "@/lib/monitoring/metrics";

const MODEL = "gpt-4o-mini";
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
        description: `Découverte de ${request.destination} — réponse simulée, OpenAI non configuré.`,
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
    tips: ["Ceci est un itinéraire de démonstration — configurez OPENAI_API_KEY pour des résultats réels."],
  }));

  return {
    title: `Voyage à ${request.destination} (mock)`,
    summary: `Itinéraire simulé de ${request.durationDays} jour(s) — OPENAI_API_KEY non configurée.`,
    days,
  };
}

export async function generateItinerary({
  request,
  userPreferences,
}: GenerateOptions): Promise<GeneratedItinerary> {
  const apiKey = env.OPENAI_API_KEY;
  const startTime = Date.now();

  if (!apiKey) {
    console.warn("[AI] OPENAI_API_KEY absent ou placeholder — réponse mockée");
    itineraryGeneratedTotal.labels("mock").inc();
    return buildMockItinerary(request);
  }

  try {
    const client = new OpenAI({ apiKey });

    console.log("[AI] Calling OpenAI API with model:", MODEL);
    console.log("[AI] Request destination:", request.destination, "days:", request.durationDays);
    
    let response;
    try {
      response = await client.chat.completions.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: "system",
            content: buildItinerarySystemPrompt(),
          },
          {
            role: "user",
            content: buildItineraryUserPrompt({ request, userPreferences }),
          },
        ],
      });
      console.log("[AI] OpenAI API call succeeded");
      openaiRequestsTotal.labels("success").inc();
    } catch (apiErr) {
      console.error("[AI] OpenAI API call failed:", apiErr instanceof Error ? apiErr.message : String(apiErr));
      openaiRequestsTotal.labels("error").inc();
      appErrorsTotal.labels("openai", "api_error").inc();
      throw apiErr;
    }

    console.log("[AI] OpenAI response received");

    const textBlock = response.choices[0]?.message?.content;
    if (!textBlock || typeof textBlock !== "string") {
      console.error("[AI] No text content in response", { choices: response.choices });
      appErrorsTotal.labels("itinerary", "no_content").inc();
      throw new Error("No text content in OpenAI response");
    }

    console.log("[AI] Extracting JSON from response");
    const rawText = textBlock.trim();

    let jsonString = rawText;
    const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonString = fenceMatch[1].trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("[AI] JSON parse error", { error: parseErr, rawText: rawText.substring(0, 200) });
      appErrorsTotal.labels("itinerary", "parse_error").inc();
      throw new Error("Failed to parse OpenAI response as JSON");
    }

    console.log("[AI] Parsing itinerary response");
    const itinerary = parseItineraryResponse(parsed, request.durationDays);
    if (!itinerary) {
      console.error("[AI] Response does not match schema", { parsed });
      appErrorsTotal.labels("itinerary", "invalid_schema").inc();
      throw new Error("OpenAI response does not match expected itinerary schema");
    }

    console.log("[AI] Itinerary generated successfully", { days: itinerary.days.length });
    
    // Enregistrer les métriques de succès
    const durationSeconds = (Date.now() - startTime) / 1000;
    itineraryGenerationDurationSeconds.labels("success").observe(durationSeconds);
    itineraryGeneratedTotal.labels("success").inc();
    
    return itinerary;
  } catch (err) {
    console.error("[AI] Error in generateItinerary:", err);
    
    // Enregistrer les métriques d'erreur
    const durationSeconds = (Date.now() - startTime) / 1000;
    itineraryGenerationDurationSeconds.labels("error").observe(durationSeconds);
    itineraryGeneratedTotal.labels("error").inc();
    
    throw err;
  }
}
