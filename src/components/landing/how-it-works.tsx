const STEPS = [
  {
    step: "01",
    title: "Dites-nous ce que vous aimez",
    description:
      "Budget, style de voyage, centres d'intérêt — quelques clics suffisent pour que l'IA comprenne vos attentes.",
  },
  {
    step: "02",
    title: "L'IA explore pour vous",
    description:
      "Notre moteur analyse des milliers d'options en temps réel : vols, logements, activités, météo, événements locaux.",
  },
  {
    step: "03",
    title: "Recevez votre plan personnalisé",
    description:
      "Un itinéraire complet, jour par jour, avec vos réservations prêtes. Modifiez en un clic, partagez avec vos amis.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-32">
      {/* Subtle bg */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 via-muted/60 to-muted/30" />

      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Comment ça marche
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            3 étapes vers votre prochain voyage
          </h2>
        </div>

        <div className="mt-20 grid gap-12 md:grid-cols-3">
          {STEPS.map((item, i) => (
            <div key={item.step} className="relative text-center">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-[calc(50%+40px)] top-8 hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-border to-transparent md:block" />
              )}

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
