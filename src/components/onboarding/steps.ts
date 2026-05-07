export interface OnboardingOption {
  value: string;
  label: string;
  emoji: string;
}

export interface OnboardingStep {
  key: "travel_type" | "budget" | "group_type";
  title: string;
  subtitle: string;
  options: OnboardingOption[];
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key: "travel_type",
    title: "Quel type de voyage vous inspire ?",
    subtitle: "Choisissez ce qui vous fait rêver",
    options: [
      { value: "plage", label: "Plage", emoji: "🏖️" },
      { value: "city_trip", label: "City trip", emoji: "🏙️" },
      { value: "nature", label: "Nature", emoji: "🌿" },
      { value: "aventure", label: "Aventure", emoji: "🧗" },
      { value: "gastronomie", label: "Gastronomie", emoji: "🍷" },
      { value: "luxe", label: "Luxe", emoji: "✨" },
    ],
  },
  {
    key: "budget",
    title: "Quel est votre budget moyen ?",
    subtitle: "On s'adapte à tous les budgets",
    options: [
      { value: "economique", label: "Économique", emoji: "💰" },
      { value: "moyen", label: "Moyen", emoji: "💳" },
      { value: "eleve", label: "Élevé", emoji: "💎" },
    ],
  },
  {
    key: "group_type",
    title: "Avec qui voyagez-vous ?",
    subtitle: "On personnalise vos recommandations",
    options: [
      { value: "solo", label: "Solo", emoji: "🧑" },
      { value: "couple", label: "En couple", emoji: "💑" },
      { value: "amis", label: "Entre amis", emoji: "👯" },
      { value: "famille", label: "En famille", emoji: "👨‍👩‍👧‍👦" },
    ],
  },
];

export type OnboardingAnswers = Record<OnboardingStep["key"], string>;
