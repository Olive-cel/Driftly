import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>✈️</span>
          VoyageAI
        </div>

        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">Fonctionnalités</a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">Comment ça marche</a>
          <a href="#why-us" className="transition-colors hover:text-foreground">Pourquoi VoyageAI</a>
          <Link href="/login" className="transition-colors hover:text-foreground">Connexion</Link>
        </nav>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} VoyageAI. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
