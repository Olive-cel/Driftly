"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getTripStatus } from "@/lib/trips/trip-status";
import {
  AlertCircle,
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";

interface Notification {
  id: string;
  type: "upcoming" | "generated" | "documents" | "budget";
  title: string;
  description: string;
  icon: React.ReactNode;
  timestamp: string;
  trip?: { destination: string | null; start_date: string | null; end_date: string | null; budget: number | null };
}

export default function NotificationsPage() {
  const supabase = createClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: trips, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching trips:", error);
        return;
      }

      const notifs: Notification[] = [];

      for (const trip of trips || []) {
        const status = getTripStatus(trip);

        // Upcoming trip notification
        const now = new Date();
        const startDate = trip.start_date ? new Date(trip.start_date) : null;
        const daysUntil = startDate
          ? Math.ceil(
              (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0;

        if (daysUntil > 0 && daysUntil <= 7 && trip.destination) {
          notifs.push({
            id: `upcoming-${trip.id}`,
            type: "upcoming",
            title: `Prochain départ: ${trip.destination}`,
            description: `Votre voyage à ${trip.destination} commence dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}.`,
            icon: <Plane className="w-5 h-5 text-blue-600" />,
            timestamp: new Date().toISOString(),
            trip: {
              destination: trip.destination,
              start_date: trip.start_date,
              end_date: trip.end_date,
              budget: trip.budget,
            },
          });
        }

        // Generated itinerary notification
        if (status.status === "generated" && trip.destination) {
          notifs.push({
            id: `generated-${trip.id}`,
            type: "generated",
            title: `Itinéraire généré: ${trip.destination}`,
            description: "Votre itinéraire a été généré et est prêt à être consulté.",
            icon: <MapPin className="w-5 h-5 text-green-600" />,
            timestamp: new Date().toISOString(),
            trip: {
              destination: trip.destination,
              start_date: trip.start_date,
              end_date: trip.end_date,
              budget: trip.budget,
            },
          });
        }

        // Documents reminder
        if (status.status === "upcoming" && trip.destination) {
          notifs.push({
            id: `documents-${trip.id}`,
            type: "documents",
            title: `Rappel: documents pour ${trip.destination}`,
            description:
              "N&apos;oubliez pas de préparer votre passeport et vos documents de voyage.",
            icon: <FileText className="w-5 h-5 text-orange-600" />,
            timestamp: new Date().toISOString(),
            trip: {
              destination: trip.destination,
              start_date: trip.start_date,
              end_date: trip.end_date,
              budget: trip.budget,
            },
          });
        }

        // Budget reminder
        if (
          (status.status === "upcoming" || status.status === "ongoing") &&
          trip.destination
        ) {
          notifs.push({
            id: `budget-${trip.id}`,
            type: "budget",
            title: `Budget: ${trip.budget}€ pour ${trip.destination}`,
            description: "Gestion du budget pour ce voyage",
            icon: <DollarSign className="w-5 h-5 text-amber-600" />,
            timestamp: new Date().toISOString(),
            trip: {
              destination: trip.destination,
              start_date: trip.start_date,
              end_date: trip.end_date,
              budget: trip.budget,
            },
          });
        }
      }

      setNotifications(notifs);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "upcoming":
        return "bg-blue-50 border-blue-200";
      case "generated":
        return "bg-green-50 border-green-200";
      case "documents":
        return "bg-orange-50 border-orange-200";
      case "budget":
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-neutral-50 border-neutral-200";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">Notifications</h1>
            <p className="text-neutral-600 mt-2">
              Restez informé de vos voyages et rappels importants
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <AlertCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-900">Aucune notification</p>
              <p className="text-neutral-600 mt-2">
                Vous êtes à jour ! Créez un voyage pour recevoir des notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border p-4 flex gap-4 items-start transition-all hover:shadow-md ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex-shrink-0 mt-1">{notification.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {notification.description}
                    </p>
                    {notification.trip && (
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-neutral-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {notification.trip.start_date &&
                            new Date(notification.trip.start_date).toLocaleDateString("fr-FR")}{" "}
                          -{" "}
                          {notification.trip.end_date &&
                            new Date(notification.trip.end_date).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {notification.trip.budget}€
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          {notifications.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Notifications locales</p>
                  <p className="mt-1 text-xs">
                    Les notifications sont générées localement. Créez des voyages pour recevoir
                    des rappels utiles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
