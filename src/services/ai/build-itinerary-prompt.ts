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
- JAMAIS inventer d'informations : pas de langue, devise, ou date fictive.
- Les dates doivent être laissées au format fourni (numéro du jour uniquement).
- Chaque journée doit être équilibrée : 2-4 activités + 2-3 repas + 1-3 tips.
- Les activités doivent être réalistes, avec des noms de lieux réels.
- Les recommandations food doivent être des restaurants ou types de cuisine locaux réels.
- Adapte le contenu au budget, au type de voyage et au groupe.
- Les tips doivent être pratiques et spécifiques à la destination.
- BUDGET : Fournis un estimatedCost réaliste pour CHAQUE jour, cohérent avec le budget total.
- Ne jamais répéter le même chiffre pour tous les jours.
- Utilise le français.`;
}

export function buildItineraryUserPrompt({ request, userPreferences }: PromptContext): string {
  const { destination, durationDays, budget, travelType, groupType, startDate, endDate } = request;

  const dateInfo = startDate && endDate
    ? `Dates : du ${startDate} au ${endDate}. IMPORTANT : Ne génère que les numéros de jours (Jour 1, Jour 2, ...), pas de dates inventées.`
    : `Durée : ${durationDays} jours. Génère exactement ${durationDays} jours numérotés.`;

  const prefsInfo = userPreferences
    ? `Préférences utilisateur : ${JSON.stringify(userPreferences)}.`
    : "";

  return `Génère un itinéraire de voyage complet.

PARAMÈTRES :
- Destination : ${destination}
- ${dateInfo}
- Nombre de jours : ${durationDays}
- Budget TOTAL : ${budget}€ (À RÉPARTIR sur ${durationDays} jours)
- Type de voyage : ${travelType}
- Groupe : ${groupType}
${prefsInfo ? `- ${prefsInfo}` : ""}

IMPORTANT - NE PAS INVENTER :
- Ne JAMAIS générer de langue, devise, ou fuseau horaire. Ces infos seront fournies par le système.
- Ne PAS inventer de dates. Utilise uniquement "Jour 1", "Jour 2", etc.
- Ne PAS inventer de numéros de téléphone, adresses complètes, ou horaires spécifiques.
- Ne PAS utiliser 120€ pour tous les jours. CHAQUE jour a un budget différent et réaliste.
- Ne PAS copier le même budget d'un jour à l'autre.

BUDGET IMPORTANT :
- Budget total à répartir: ${budget}€ sur ${durationDays} jours
- Budget moyen/jour: ~${Math.round((budget as unknown as number) / durationDays)}€
- Fournis un "estimatedCost" réaliste POUR CHAQUE JOUR
- Exemple: Jour 1 = 250€, Jour 2 = 200€, Jour 3 = 180€ (varié!)
- Total des jours ≈ budget total

SCHÉMA JSON À RESPECTER EXACTEMENT :
{
  "title": "string — titre accrocheur pour le voyage",
  "summary": "string — résumé en 1-2 phrases",
  "days": [
    {
      "day": "number — numéro du jour (1, 2, 3, ...)",
      "title": "string — titre du jour (ex: 'Jour 1 — Arrivée et découverte')",
      "activities": [
        {
          "time": "matin" | "après-midi" | "soir",
          "name": "string — nom du lieu ou activité",
          "description": "string — description courte",
          "category": "visite" | "culture" | "nature" | "shopping" | "sport" | "detente" | "transport" | "autre",
          "duration": "string optionnel — ex: 2h",
          "estimatedCost": "string optionnel — ex: 50€ (ce JOUR SEULEMENT)"
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
      "tips": ["string — conseil pratique"],
      "estimatedCost": "string — budget estimé POUR CE JOUR (ex: '250€', très important!)"
    }
  ]
}

Génère exactement ${durationDays} jours avec des budgets VARIÉS et réalistes. Réponds UNIQUEMENT avec le JSON, rien d'autre.`;
}
