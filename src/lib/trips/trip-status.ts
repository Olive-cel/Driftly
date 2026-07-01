import type { Database } from "@/types/database";

type Trip = Database["public"]["Tables"]["trips"]["Row"];
type Itinerary = Database["public"]["Tables"]["itineraries"]["Row"] | null | undefined;

export type TripStatus = "draft" | "generated" | "upcoming" | "ongoing" | "completed";

export interface TripStatusInfo {
  status: TripStatus;
  label: string;
  icon: string;
  color: string;
  badgeColor: string;
  message: string;
  daysBeforeDeparture: number;
  daysRemaining: number;
  duration: number;
  progress: number;
}

/**
 * Calcule le statut d'un voyage basé sur :
 * - La date du jour
 * - Les dates de départ et retour
 * - L'existence d'un itinéraire IA
 *
 * @param trip Le voyage
 * @param itinerary L'itinéraire (optionnel)
 * @returns TripStatusInfo avec tous les calculs
 */
export function getTripStatus(trip: Trip, itinerary?: Itinerary | null): TripStatusInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = trip.start_date ? new Date(trip.start_date as string) : null;
  const endDate = trip.end_date ? new Date(trip.end_date as string) : null;

  // Normaliser les dates (0h 0m 0s)
  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(0, 0, 0, 0);

  // Calculs de base
  const daysBeforeDeparture = startDate ? Math.max(0, Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const duration = startDate && endDate ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))) + 1 : 0;

  // Déterminer le statut
  let status: TripStatus;
  let progress: number;
  let label: string;
  let icon: string;
  let color: string;
  let badgeColor: string;
  let message: string;

  // 1. BROUILLON : pas d'itinéraire
  if (!itinerary) {
    status = "draft";
    progress = 0;
    label = "Brouillon";
    icon = "📝";
    color = "gray";
    badgeColor = "bg-gray-100 text-gray-700";
    message = "Itinéraire en attente";
  }
  // 2. ITINÉRAIRE PRÊT : itinéraire existe mais pas encore démarré
  else if (itinerary && startDate && today < startDate) {
    status = "generated";
    progress = 20;
    label = "Itinéraire prêt";
    icon = "🤖";
    color = "purple";
    badgeColor = "bg-purple-100 text-purple-700";
    message = `Départ dans ${daysBeforeDeparture} jour${daysBeforeDeparture !== 1 ? "s" : ""}`;
  }
  // 3. À VENIR : moins de 30 jours avant départ (ou départ futur)
  else if (startDate && today < startDate) {
    status = "upcoming";
    progress = 40;
    label = "À venir";
    icon = "🚀";
    color = "orange";
    badgeColor = "bg-orange-100 text-orange-700";
    message = `Départ dans ${daysBeforeDeparture} jour${daysBeforeDeparture !== 1 ? "s" : ""}`;
  }
  // 4. EN COURS : entre la date de départ et de retour
  else if (startDate && endDate && today >= startDate && today <= endDate) {
    status = "ongoing";
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    progress = Math.round((daysElapsed / duration) * 100);
    label = "En cours";
    icon = "🌍";
    color = "green";
    badgeColor = "bg-green-100 text-green-700";
    message = `Jour ${daysElapsed} sur ${duration}`;
  }
  // 5. TERMINÉ : après la date de retour
  else if (endDate && today > endDate) {
    status = "completed";
    progress = 100;
    label = "Terminé";
    icon = "✓";
    color = "gray-dark";
    badgeColor = "bg-gray-200 text-gray-800";
    message = "Voyage terminé • Revivez vos souvenirs";
  }
  // Fallback si les dates ne sont pas définies
  else {
    status = "draft";
    progress = 0;
    label = "Brouillon";
    icon = "📝";
    color = "gray";
    badgeColor = "bg-gray-100 text-gray-700";
    message = "Dates non définies";
  }

  return {
    status,
    label,
    icon,
    color,
    badgeColor,
    message,
    daysBeforeDeparture,
    daysRemaining,
    duration,
    progress,
  };
}

/**
 * Retourne la couleur Tailwind pour un statut
 */
export function getStatusTailwindColor(status: TripStatus): {
  bg: string;
  border: string;
  text: string;
} {
  const colors: Record<
    TripStatus,
    { bg: string; border: string; text: string }
  > = {
    draft: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-700",
    },
    generated: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
    },
    upcoming: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
    },
    ongoing: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
    completed: {
      bg: "bg-gray-100",
      border: "border-gray-300",
      text: "text-gray-800",
    },
  };

  return colors[status];
}

/**
 * Compte les voyages par statut
 */
export function countTripsByStatus(trips: Trip[], itineraries?: Record<string, Itinerary>) {
  const counts = {
    total: trips.length,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
  };

  trips.forEach((trip) => {
    const itinerary = itineraries?.[trip.id];
    const statusInfo = getTripStatus(trip, itinerary);

    if (statusInfo.status === "upcoming") counts.upcoming++;
    if (statusInfo.status === "ongoing") counts.ongoing++;
    if (statusInfo.status === "completed") counts.completed++;
  });

  return counts;
}
