"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type Trip = Database["public"]["Tables"]["trips"]["Row"];

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/trips");

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Impossible de charger les voyages");
        }

        const data = await response.json();
        setTrips(data.trips || []);
      } catch (err) {
        console.error("[Trips] Erreur lors du chargement:", err);
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-muted-foreground">Chargement des voyages...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <Card className="w-full max-w-md border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
        <Link href="/dashboard">
          <Button variant="outline">Retour au tableau de bord</Button>
        </Link>
      </main>
    );
  }

  if (trips.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Aucun voyage</CardTitle>
            <CardDescription>Vous n'avez pas encore créé de voyage</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/dashboard/trips/new">
              <Button className="w-full">Créer mon premier voyage</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Retour au tableau de bord
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-6 px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Mes voyages</h1>
          <Link href="/dashboard/trips/new">
            <Button>+ Nouveau voyage</Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-4">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/dashboard/trips/${trip.id}`}
              className="block"
            >
              <Card className="cursor-pointer transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>
                        {trip.departure_city} → {trip.destination}
                      </CardTitle>
                      <CardDescription>
                        {trip.start_date && trip.end_date
                          ? `${new Date(trip.start_date).toLocaleDateString(
                              "fr-FR"
                            )} au ${new Date(trip.end_date).toLocaleDateString(
                              "fr-FR"
                            )}`
                          : "Dates non définies"}
                      </CardDescription>
                    </div>
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      {trip.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold">{trip.budget}€</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Durée</p>
                      <p className="font-semibold">{trip.duration} jours</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Voyageurs</p>
                      <p className="font-semibold">{trip.travelers_count || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Style</p>
                      <p className="font-semibold">{trip.travel_style || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <Link href="/dashboard">
            <Button variant="outline">← Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
