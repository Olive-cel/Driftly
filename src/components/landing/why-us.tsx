import Link from "next/link";
import { Button } from "@/components/ui/button";

const DIFFERENTIATORS = [
  {
    emoji: "🧠",
    title: "IA qui apprend",
    description: "Plus vous utilisez VoyageAI, plus les recommandations sont pertinentes. Votre profil voyageur s'affine à chaque interaction.",
  },
  {
    emoji: "⚡",
    title: "Tout-en-un",
    description: "Fini les 15 onglets ouverts. Inspiration, vols, logements, itinéraires — tout est centralisé dans une seule interface.",
  },
  {
    emoji: "💰",
    title: "Meilleur prix garanti",
    description: "Notre moteur compare des centaines de sources en temps réel pour vous trouver les tarifs les plus compétitifs.",
  },
  {
    emoji: "🌍",
    title: "Communauté de voyageurs",
    description: "Découvrez les destinations tendances, partagez vos trips et inspirez-vous des expériences d'autres voyageurs.",
  },
] as const;

export function WhyUs() {
  return (
    <section id="why-us" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Pourquoi VoyageAI
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Pas un énième comparateur de vols
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            VoyageAI est un assistant de voyage intelligent qui pense comme vous — en mieux.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {DIFFERENTIATORS.map((item) => (
            <div
              key={item.title}
              className="flex gap-5 rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-lg hover:shadow-black/[0.03]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                {item.emoji}
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA band */}
        <div className="mt-24 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 p-px">
          <div className="rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 px-8 py-16 text-center text-white sm:px-16">
            <h3 className="text-2xl font-bold sm:text-3xl">
              Prêt à planifier votre prochain voyage ?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-base text-blue-100">
              Rejoignez des milliers de voyageurs qui planifient plus intelligemment avec VoyageAI.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="h-12 rounded-full bg-white px-8 text-base font-semibold text-blue-700 shadow-lg hover:bg-blue-50"
                asChild
              >
                <Link href="/signup">
                  Créer un compte gratuitement
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
