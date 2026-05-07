import type { GenerateItineraryRequest } from "@/types/itinerary";

interface PromptContext {
  request: GenerateItineraryRequest;
  userPreferences: Record<string, unknown> | null;
}

export function buildItinerarySystemPrompt(): string {
  return `Tu es un expert en planification de voyages haut de gamme. Tu crées des itinéraires personnalisés, réalistes et inspirants.

RÈGLES STRICTES :
- Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaire, sans texte avant ou après.
- Tu respectes EXACTEMENT le schéma JSON fourni.
- Chaque journée doit être équilibrée : 2-4 activités + 2-3 repas + 1-3 tips.
- Les activités doivent être réalistes, avec des noms de lieux réels.
- Les recommandations food doivent être des restaurants ou types de cuisine locaux réels.
- Adapte le contenu au budget, au type de voyage et au groupe.
- Les tips doivent être pratiques et spécifiques à la destination.
- Utilise le français.`;
}

export function buildItineraryUserPrompt({ request, userPreferences }: PromptContext): string {
  const { destination, durationDays, budget, travelType, groupType, startDate, endDate } = request;

  const dateInfo = startDate && endDate
    ? `Dates : du ${startDate} au ${endDate}.`
    : `Durée : ${durationDays} jours.`;

  const prefsInfo = userPreferences
    ? `Préférences utilisateur : ${JSON.stringify(userPreferences)}.`
    : "";

  return `Génère un itinéraire de voyage complet.

PARAMÈTRES :
- Destination : ${destination}
- ${dateInfo}
- Nombre de jours : ${durationDays}
- Budget : ${budget}
- Type de voyage : ${travelType}
- Groupe : ${groupType}
${prefsInfo ? `- ${prefsInfo}` : ""}

SCHÉMA JSON À RESPECTER EXACTEMENT :
{
  "title": "string — titre accrocheur pour le voyage",
  "summary": "string — résumé en 1-2 phrases",
  "days": [
    {
      "day": "number — numéro du jour (1, 2, ...)",
      "title": "string — titre du jour",
      "activities": [
        {
          "time": "matin" | "après-midi" | "soir",
          "name": "string — nom du lieu ou activité",
          "description": "string — description courte",
          "category": "visite" | "culture" | "nature" | "shopping" | "sport" | "detente" | "transport" | "autre",
          "duration": "string optionnel — ex: 2h",
          "estimatedCost": "string optionnel — ex: 15€"
        }
      ],
      "food": [
        {
          "time": "petit-déjeuner" | "déjeuner" | "dîner",
          "name": "string — nom du restaurant ou type",
          "description": "string — courte description",
          "priceRange": "string optionnel — ex: 15-25€"
        }
      ],
      "tips": ["string — conseil pratique"]
    }
  ]
}

Génère exactement ${durationDays} jours. Réponds UNIQUEMENT avec le JSON, rien d'autre.`;
}
