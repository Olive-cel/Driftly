/**
 * Informations fiables par pays.
 * Source: données officielles, pas d'IA.
 * 
 * Structure: langue(s), devise, fuseau horaire, capitale.
 * Si un pays n'est pas mappé → "Information non disponible"
 */

export interface CountryInfo {
  name: string;
  languages: string[];
  currency: string;
  timezone: string;
  capital?: string;
}

const countryDatabase: Record<string, CountryInfo> = {
  France: {
    name: "France",
    languages: ["Français"],
    currency: "EUR",
    timezone: "UTC+1",
    capital: "Paris",
  },
  Italie: {
    name: "Italie",
    languages: ["Italien"],
    currency: "EUR",
    timezone: "UTC+1",
    capital: "Rome",
  },
  Japon: {
    name: "Japon",
    languages: ["Japonais"],
    currency: "JPY",
    timezone: "UTC+9",
    capital: "Tokyo",
  },
  Indonésie: {
    name: "Indonésie",
    languages: ["Indonésien"],
    currency: "IDR",
    timezone: "UTC+8",
    capital: "Jakarta",
  },
  Bénin: {
    name: "Bénin",
    languages: ["Français"],
    currency: "XOF",
    timezone: "UTC+1",
    capital: "Porto-Novo",
  },
  Ghana: {
    name: "Ghana",
    languages: ["Anglais"],
    currency: "GHS",
    timezone: "UTC+0",
    capital: "Accra",
  },
  Espagne: {
    name: "Espagne",
    languages: ["Espagnol"],
    currency: "EUR",
    timezone: "UTC+1",
    capital: "Madrid",
  },
  Portugal: {
    name: "Portugal",
    languages: ["Portugais"],
    currency: "EUR",
    timezone: "UTC+0",
    capital: "Lisbonne",
  },
  Maroc: {
    name: "Maroc",
    languages: ["Arabe", "Français"],
    currency: "MAD",
    timezone: "UTC+1",
    capital: "Rabat",
  },
  Grèce: {
    name: "Grèce",
    languages: ["Grec"],
    currency: "EUR",
    timezone: "UTC+2",
    capital: "Athènes",
  },
  "République Tchèque": {
    name: "République Tchèque",
    languages: ["Tchèque"],
    currency: "CZK",
    timezone: "UTC+1",
    capital: "Prague",
  },
  "Pays-Bas": {
    name: "Pays-Bas",
    languages: ["Néerlandais"],
    currency: "EUR",
    timezone: "UTC+1",
    capital: "Amsterdam",
  },
  Allemagne: {
    name: "Allemagne",
    languages: ["Allemand"],
    currency: "EUR",
    timezone: "UTC+1",
    capital: "Berlin",
  },
  "Royaume-Uni": {
    name: "Royaume-Uni",
    languages: ["Anglais"],
    currency: "GBP",
    timezone: "UTC+0",
    capital: "Londres",
  },
  Thaïlande: {
    name: "Thaïlande",
    languages: ["Thaï"],
    currency: "THB",
    timezone: "UTC+7",
    capital: "Bangkok",
  },
  Vietnam: {
    name: "Vietnam",
    languages: ["Vietnamien"],
    currency: "VND",
    timezone: "UTC+7",
    capital: "Hanoï",
  },
  Tanzanie: {
    name: "Tanzanie",
    languages: ["Swahili", "Anglais"],
    currency: "TZS",
    timezone: "UTC+3",
    capital: "Dar es-Salaam",
  },
  "Costa Rica": {
    name: "Costa Rica",
    languages: ["Espagnol"],
    currency: "CRC",
    timezone: "UTC-6",
    capital: "San José",
  },
  Pérou: {
    name: "Pérou",
    languages: ["Espagnol", "Quechua"],
    currency: "PEN",
    timezone: "UTC-5",
    capital: "Lima",
  },
  Islande: {
    name: "Islande",
    languages: ["Islandais"],
    currency: "ISK",
    timezone: "UTC+0",
    capital: "Reykjavik",
  },
  Maldives: {
    name: "Maldives",
    languages: ["Dhivehi"],
    currency: "MVR",
    timezone: "UTC+5",
    capital: "Malé",
  },
};

/**
 * Récupère les informations d'un pays.
 * @param countryName Nom du pays (ex: "France", "Japon")
 * @returns Infos du pays ou undefined si non trouvé
 */
export function getCountryInfo(countryName: string): CountryInfo | undefined {
  // Chercher avec normalisation (case-insensitive, trim)
  const normalized = countryName.trim();
  
  // Cherche exact
  const match = Object.entries(countryDatabase).find(
    ([key]) => key.toLowerCase() === normalized.toLowerCase()
  );

  if (match) {
    return match[1];
  }

  // Cherche partial (pour "Rome" → "Italie", etc.)
  // À étendre si besoin
  const partialMap: Record<string, string> = {
    rome: "Italie",
    paris: "France",
    tokyo: "Japon",
    bali: "Indonésie",
    cotonou: "Bénin",
    accra: "Ghana",
    "santorin": "Grèce",
    prague: "République Tchèque",
    amsterdam: "Pays-Bas",
    bangkok: "Thaïlande",
    "dar es-salaam": "Tanzanie",
    lima: "Pérou",
    reykjavik: "Islande",
  };

  const partial = partialMap[normalized.toLowerCase()];
  if (partial) {
    return countryDatabase[partial];
  }

  return undefined;
}

/**
 * Formatte les infos pratiques pour affichage.
 * @param countryName Nom du pays
 * @returns Objet avec infos formatées ou "Information non disponible"
 */
export function getFormattedCountryInfo(countryName: string) {
  const info = getCountryInfo(countryName);

  if (!info) {
    return {
      languages: "Information non disponible",
      currency: "Information non disponible",
      timezone: "Information non disponible",
    };
  }

  return {
    languages: info.languages.join(" / "),
    currency: info.currency,
    timezone: info.timezone,
  };
}
