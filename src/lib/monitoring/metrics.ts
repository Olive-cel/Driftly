import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from "prom-client";

// ────────────────────────────────────────────────────────────────
// Éviter les doublons lors du hot reload en développement
// ────────────────────────────────────────────────────────────────

function getOrCreateMetric<T>(
  name: string,
  createMetric: () => T
): T {
  const existing = register.getSingleMetric(name);
  if (existing) {
    return existing as T;
  }
  return createMetric();
}

// ────────────────────────────────────────────────────────────────
// Collecte les métriques par défaut Node.js
// ────────────────────────────────────────────────────────────────

collectDefaultMetrics({ register });

// ────────────────────────────────────────────────────────────────
// 1. Compteur HTTP total
// ────────────────────────────────────────────────────────────────

export const httpRequestsTotal = getOrCreateMetric(
  "driftly_http_requests_total",
  () =>
    new Counter({
      name: "driftly_http_requests_total",
      help: "Nombre total de requêtes HTTP",
      labelNames: ["method", "route", "status"],
      registers: [register],
    })
);

// ────────────────────────────────────────────────────────────────
// 2. Histogramme temps de réponse HTTP
// ────────────────────────────────────────────────────────────────

export const httpRequestDurationSeconds = getOrCreateMetric(
  "driftly_http_request_duration_seconds",
  () =>
    new Histogram({
      name: "driftly_http_request_duration_seconds",
      help: "Durée des requêtes HTTP en secondes",
      labelNames: ["method", "route", "status"],
      buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
      registers: [register],
    })
);

// ────────────────────────────────────────────────────────────────
// 3. Compteur génération itinéraires
// ────────────────────────────────────────────────────────────────

export const itineraryGeneratedTotal = getOrCreateMetric(
  "driftly_itinerary_generated_total",
  () =>
    new Counter({
      name: "driftly_itinerary_generated_total",
      help: "Nombre total d'itinéraires générés",
      labelNames: ["status"],
      registers: [register],
    })
);

// ────────────────────────────────────────────────────────────────
// 4. Histogramme durée génération itinéraire
// ────────────────────────────────────────────────────────────────

export const itineraryGenerationDurationSeconds = getOrCreateMetric(
  "driftly_itinerary_generation_duration_seconds",
  () =>
    new Histogram({
      name: "driftly_itinerary_generation_duration_seconds",
      help: "Durée de génération d'itinéraire en secondes",
      labelNames: ["status"],
      buckets: [1, 3, 5, 10, 20, 30, 60],
      registers: [register],
    })
);

// ────────────────────────────────────────────────────────────────
// 5. Compteur appels OpenAI
// ────────────────────────────────────────────────────────────────

export const openaiRequestsTotal = getOrCreateMetric(
  "driftly_openai_requests_total",
  () =>
    new Counter({
      name: "driftly_openai_requests_total",
      help: "Nombre total d'appels à l'API OpenAI",
      labelNames: ["status"],
      registers: [register],
    })
);

// ────────────────────────────────────────────────────────────────
// 6. Compteur appels Pexels
// ────────────────────────────────────────────────────────────────

export const pexelsRequestsTotal = getOrCreateMetric(
  "driftly_pexels_requests_total",
  () =>
    new Counter({
      name: "driftly_pexels_requests_total",
      help: "Nombre total d'appels à l'API Pexels",
      labelNames: ["status"],
      registers: [register],
    })
);

// ────────────────────────────────────────────────────────────────
// 7. Compteur erreurs applicatives
// ────────────────────────────────────────────────────────────────

export const appErrorsTotal = getOrCreateMetric(
  "driftly_app_errors_total",
  () =>
    new Counter({
      name: "driftly_app_errors_total",
      help: "Nombre total d'erreurs applicatives",
      labelNames: ["source", "type"],
      registers: [register],
    })
);

// ────────────────────────────────────────────────────────────────
// Export du register pour l'endpoint metrics
// ────────────────────────────────────────────────────────────────

export { register };
