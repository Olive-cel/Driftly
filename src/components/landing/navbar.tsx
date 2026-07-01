import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="text-xl">{BRAND.logo}</span>
          {BRAND.name}
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Fonctionnalités
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            Comment ça marche
          </a>
          <a href="#why-us" className="transition-colors hover:text-foreground">
            Pourquoi {BRAND.name}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Commencer gratuitement</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
