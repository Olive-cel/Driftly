"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  departure_city: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers_count: string;
  budget: string;
  travel_style: string;
  interests: string;
}

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    departure_city: "",
    destination: "",
    start_date: "",
    end_date: "",
    travelers_count: "",
    budget: "",
    travel_style: "",
    interests: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const travelersCount = formData.travelers_count
        ? parseInt(formData.travelers_count, 10)
        : null;

      const budget = formData.budget ? parseInt(formData.budget, 10) : null;

      const interests = formData.interests
        ? formData.interests.split(",").map((i) => i.trim())
        : [];

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departure_city: formData.departure_city,
          destination: formData.destination,
          start_date: formData.start_date,
          end_date: formData.end_date,
          travelers_count: travelersCount,
          budget,
          travel_style: formData.travel_style || null,
          interests,
          status: "draft",
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la création du voyage");
      }

      const data = await response.json();
      router.push(`/dashboard/trips/${data.trip.id}`);
    } catch (err) {
      console.error("[NewTrip] Erreur lors de la création:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création du voyage"
      );
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="w-full max-w-2xl">
        <Link href="/dashboard/trips">
          <Button variant="outline" className="mb-6">
            ← Retour à mes voyages
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Créer un nouveau voyage</CardTitle>
            <CardDescription>
              Remplissez les informations de votre voyage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="departure_city">Ville de départ *</Label>
                <Input
                  id="departure_city"
                  name="departure_city"
                  placeholder="Ex: Paris"
                  value={formData.departure_city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  name="destination"
                  placeholder="Ex: Tokyo"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="start_date">Date de départ *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">Date de retour *</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="budget">Budget (€) *</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="Ex: 3000"
                  value={formData.budget}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="travelers_count">Nombre de voyageurs</Label>
                <Input
                  id="travelers_count"
                  name="travelers_count"
                  type="number"
                  placeholder="Ex: 2"
                  value={formData.travelers_count}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="travel_style">Style de voyage</Label>
                <select
                  id="travel_style"
                  name="travel_style"
                  value={formData.travel_style}
                  onChange={handleChange}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sélectionner un style</option>
                  <option value="adventure">Aventure</option>
                  <option value="relaxation">Détente</option>
                  <option value="cultural">Culturel</option>
                  <option value="luxury">Luxe</option>
                  <option value="budget">Budget</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interests">Centres d'intérêt (séparés par virgule)</Label>
                <Input
                  id="interests"
                  name="interests"
                  placeholder="Ex: plage, monuments, gastronomie"
                  value={formData.interests}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Création en cours..." : "Créer le voyage"}
                </Button>
                <Link href="/dashboard/trips" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
