"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    departure_city: "",
    destination: "",
    start_date: "",
    end_date: "",
    travelers_count: "1",
    budget: "",
    travel_style: "",
    interests: "",
  });

  // Initialize form from query params (from inspiration page)
  useEffect(() => {
    const destination = searchParams.get("destination");
    const travel_style = searchParams.get("travel_style");

    if (destination) {
      setFormData((prev) => ({
        ...prev,
        destination,
        travel_style: travel_style || prev.travel_style,
      }));
    }
  }, [searchParams]);

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

      // 1. Créer le voyage
      const tripResponse = await fetch("/api/trips", {
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

      if (tripResponse.status === 401) {
        router.push("/login");
        return;
      }

      if (!tripResponse.ok) {
        const data = await tripResponse.json();
        throw new Error(data.error || "Erreur lors de la création du voyage");
      }

      const tripData = await tripResponse.json();
      const tripId = tripData.trip.id;

      // 2. Générer l'itinéraire
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

      console.log("[NewTrip] Starting itinerary generation for trip:", tripId);

      const itineraryResponse = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          destination: formData.destination,
          durationDays,
          budget: budget || 1000,
          travelType: formData.travel_style || "adventure",
          groupType: interests[0] || "solo",
          startDate: formData.start_date,
          endDate: formData.end_date,
        }),
      });

      if (!itineraryResponse.ok) {
        const itinError = await itineraryResponse.json();
        console.error("[NewTrip] Itinerary generation failed:", itinError);
        console.warn("[NewTrip] Proceeding to trip detail (generation may retry)");
        // Continue even if generation fails - user can refresh
      } else {
        console.log("[NewTrip] Itinerary generated successfully");
      }

      // 3. Rediriger
      router.push(`/dashboard/trips/${tripId}`);
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
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard/trips">
            <Button variant="ghost" className="gap-2">
              ← Mes voyages
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Planifiez votre prochain voyage
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Décrivez-nous votre rêve, nous générerons l&apos;itinéraire idéal avec l&apos;IA
            </p>
          </div>

          {/* Main Search Form */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-12 max-w-5xl rounded-2xl bg-white p-8 shadow-lg"
          >
            {/* Error Alert */}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                <p className="font-medium">Erreur</p>
                <p>{error}</p>
              </div>
            )}

            {/* Section 1: Where & When */}
            <div className="mb-8">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Où et quand ?
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Departure City */}
                <div className="flex flex-col">
                  <label
                    htmlFor="departure_city"
                    className="mb-2 text-sm font-medium text-gray-700"
                  >
                    De
                  </label>
                  <Input
                    id="departure_city"
                    name="departure_city"
                    type="text"
                    placeholder="Paris, Rome, Tokyo..."
                    value={formData.departure_city}
                    onChange={handleChange}
                    required
                    className="h-12 border-gray-200"
                  />
                </div>

                {/* Destination */}
                <div className="flex flex-col">
                  <label
                    htmlFor="destination"
                    className="mb-2 text-sm font-medium text-gray-700"
                  >
                    Vers
                  </label>
                  <Input
                    id="destination"
                    name="destination"
                    type="text"
                    placeholder="Tokyo, Bali, NYC..."
                    value={formData.destination}
                    onChange={handleChange}
                    required
                    className="h-12 border-gray-200"
                  />
                </div>

                {/* Start Date */}
                <div className="flex flex-col">
                  <label
                    htmlFor="start_date"
                    className="mb-2 text-sm font-medium text-gray-700"
                  >
                    Départ
                  </label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="h-12 border-gray-200"
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col">
                  <label
                    htmlFor="end_date"
                    className="mb-2 text-sm font-medium text-gray-700"
                  >
                    Retour
                  </label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="h-12 border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-8 border-t border-gray-200" />

            {/* Section 2: Budget & Travelers */}
            <div className="mb-8">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Budget et voyageurs
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Budget */}
                <div className="flex flex-col">
                  <label
                    htmlFor="budget"
                    className="mb-2 text-sm font-medium text-gray-700"
                  >
                    Budget total (€) *
                  </label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="1500"
                    value={formData.budget}
                    onChange={handleChange}
                    min="1"
                    required
                    className="h-12 border-gray-200"
                  />
                </div>

                {/* Travelers */}
                <div className="flex flex-col">
                  <label
                    htmlFor="travelers_count"
                    className="mb-2 text-sm font-medium text-gray-700"
                  >
                    Voyageurs
                  </label>
                  <select
                    id="travelers_count"
                    name="travelers_count"
                    value={formData.travelers_count}
                    onChange={handleChange}
                    className="h-12 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} voyageur{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Travel Style */}
                <div className="flex flex-col">
                  <label
                    htmlFor="travel_style"
                    className="mb-2 text-sm font-medium text-gray-700"
                  >
                    Style de voyage
                  </label>
                  <select
                    id="travel_style"
                    name="travel_style"
                    value={formData.travel_style}
                    onChange={handleChange}
                    className="h-12 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  >
                    <option value="">Choisir...</option>
                    <option value="adventure">🏔️ Aventure</option>
                    <option value="relaxation">🏖️ Détente</option>
                    <option value="cultural">🏛️ Culturel</option>
                    <option value="luxury">✨ Luxe</option>
                    <option value="budget">💰 Budget</option>
                  </select>
                </div>

                {/* Placeholder for grid balance */}
                <div />
              </div>
            </div>

            {/* Divider */}
            <div className="mb-8 border-t border-gray-200" />

            {/* Section 3: Interests */}
            <div className="mb-8">
              <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Vos centres d&apos;intérêt
              </h2>

              <div className="flex flex-col">
                <label
                  htmlFor="interests"
                  className="mb-2 text-sm font-medium text-gray-700"
                >
                  Qu&apos;aimez-vous ? (exemples: plage, musées, gastronomie)
                </label>
                <Input
                  id="interests"
                  name="interests"
                  type="text"
                  placeholder="plage, monuments, gastronomie, nature..."
                  value={formData.interests}
                  onChange={handleChange}
                  className="h-12 border-gray-200"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Séparez vos intérêts par des virgules
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-8 border-t border-gray-200" />

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 py-6 text-base font-semibold hover:from-amber-700 hover:to-orange-700"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Génération en cours...
                  </>
                ) : (
                  "✨ Générer mon voyage avec l&apos;IA"
                )}
              </Button>
              <Link href="/dashboard/trips" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-full w-full py-6 text-base font-semibold"
                >
                  Annuler
                </Button>
              </Link>
            </div>

            {/* Info text */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Nous utilisons l&apos;IA pour générer un itinéraire personnalisé selon vos préférences.
            </p>
          </form>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="py-12" />
    </main>
  );
}
