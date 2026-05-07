import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-16">
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/20 via-violet-400/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-amber-300/15 via-rose-300/10 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Headline */}
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-7xl">
          Planifiez vos voyages{" "}
          <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            comme jamais
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Inspiration, vols, hébergements et itinéraires personnalisés — le tout
          orchestré par une IA qui comprend vos envies de voyageur.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/20" asChild>
            <Link href="/signup">
              Commencer gratuitement
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-12 rounded-full px-8 text-base" asChild>
            <a href="#features">
              Découvrir
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </Button>
        </div>
      </div>

      {/* Dashboard mockup */}
      <div className="relative z-10 mx-auto mt-20 w-full max-w-5xl px-4">
        <div className="rounded-xl border border-border/60 bg-gradient-to-b from-muted/50 to-muted/20 p-1.5 shadow-2xl shadow-black/5 backdrop-blur-sm">
          <div className="rounded-lg border border-border/40 bg-card p-6">
            {/* Fake browser bar */}
            <div className="mb-6 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400/60" />
              <div className="h-3 w-3 rounded-full bg-amber-400/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-400/60" />
              <div className="ml-4 h-6 flex-1 rounded-md bg-muted/60" />
            </div>
            {/* Fake travel cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <TravelCard
                emoji="🗼"
                city="Paris"
                dates="12–18 juin"
                price="245€"
                tag="Vol direct"
              />
              <TravelCard
                emoji="🏝️"
                city="Bali"
                dates="3–14 juil."
                price="489€"
                tag="Recommandé"
                highlighted
              />
              <TravelCard
                emoji="🎌"
                city="Tokyo"
                dates="20–30 sept."
                price="520€"
                tag="Tendance"
              />
            </div>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
    </section>
  );
}

function TravelCard({
  emoji,
  city,
  dates,
  price,
  tag,
  highlighted = false,
}: {
  emoji: string;
  city: string;
  dates: string;
  price: string;
  tag: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md ${
        highlighted
          ? "border-blue-500/30 bg-blue-50/50 ring-1 ring-blue-500/10"
          : "border-border/60 bg-background"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl">{emoji}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            highlighted
              ? "bg-blue-100 text-blue-700"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {tag}
        </span>
      </div>
      <p className="font-semibold">{city}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{dates}</p>
      <p className="mt-2 text-lg font-bold">{price}<span className="text-sm font-normal text-muted-foreground"> /pers.</span></p>
    </div>
  );
}
