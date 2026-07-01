import { NextRequest, NextResponse } from "next/server";
import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
  appErrorsTotal,
} from "./metrics";

/**
 * Helper pour wrapper une route API et mesurer les métriques HTTP.
 *
 * Usage:
 * export const GET = withMetrics(async (request) => {
 *   // ... ton handler
 * }, "GET /api/trips");
 *
 * Mesure automatiquement:
 * - Nombre de requêtes (par method, route, status)
 * - Durée (par method, route, status)
 * - Erreurs (avec source et type)
 */
export function withMetrics(
  handler: (request: NextRequest) => Promise<NextResponse>,
  routeName: string
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const method = request.method;
    const start = Date.now();

    try {
      const response = await handler(request);
      const duration = (Date.now() - start) / 1000;
      const status = response.status;

      // Incrémenter le compteur requêtes
      httpRequestsTotal.labels(method, routeName, status.toString()).inc();

      // Incrémenter l'histogramme durée
      httpRequestDurationSeconds
        .labels(method, routeName, status.toString())
        .observe(duration);

      return response;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      const status = 500;

      // Incrémenter le compteur requêtes avec status 500
      httpRequestsTotal.labels(method, routeName, status.toString()).inc();

      // Incrémenter l'histogramme durée
      httpRequestDurationSeconds
        .labels(method, routeName, status.toString())
        .observe(duration);

      // Enregistrer l'erreur
      const errorType =
        error instanceof Error ? error.constructor.name : "UnknownError";
      appErrorsTotal.labels("http_handler", errorType).inc();

      console.error(`[Metrics] Erreur dans ${routeName}:`, error);

      // Retourner une réponse d'erreur
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Alternative: ajouter les métriques manuellement dans une route si le wrapper
 * n'est pas approprié.
 *
 * Usage dans une route:
 * const startTime = Date.now();
 * try {
 *   const result = await someOperation();
 *   recordHttpMetrics("GET /api/trips", 200, (Date.now() - startTime) / 1000);
 *   return NextResponse.json(result);
 * } catch (error) {
 *   recordHttpMetrics("GET /api/trips", 500, (Date.now() - startTime) / 1000);
 *   return NextResponse.json({ error: "..." }, { status: 500 });
 * }
 */
export function recordHttpMetrics(
  route: string,
  status: number,
  durationSeconds: number
): void {
  // Extraire method et route
  const parts = route.split(" ");
  const method = parts[0] || "UNKNOWN";

  httpRequestsTotal.labels(method, route, status.toString()).inc();
  httpRequestDurationSeconds
    .labels(method, route, status.toString())
    .observe(durationSeconds);
}

/**
 * Enregistrer une erreur applicative.
 */
export function recordError(source: string, type: string): void {
  appErrorsTotal.labels(source, type).inc();
}
