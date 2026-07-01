import { NextResponse } from "next/server";
import { register } from "@/lib/monitoring/metrics";

/**
 * GET /api/metrics
 *
 * Endpoint exposant les métriques Prometheus au format texte standard.
 * Ne jamais exposer de secrets.
 * Utilisé par Prometheus pour scraper les métriques de l'application.
 */
export async function GET() {
  try {
    const metrics = await register.metrics();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        "Content-Type": register.contentType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[Metrics] Erreur lors de la génération des métriques:", error);

    return new NextResponse(
      "# HELP error Erreur lors de la génération des métriques Prometheus\n" +
        "# TYPE error gauge\n" +
        "error 1\n",
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      }
    );
  }
}

/**
 * Les autres méthodes HTTP ne sont pas supportées.
 */
export async function POST() {
  return new NextResponse("Méthode non supportée", { status: 405 });
}

export async function PUT() {
  return new NextResponse("Méthode non supportée", { status: 405 });
}

export async function DELETE() {
  return new NextResponse("Méthode non supportée", { status: 405 });
}
