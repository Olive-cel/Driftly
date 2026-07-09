# Monitoring — Grafana & Prometheus

Stack complète de monitoring pour Kubernetes et l'application Driftly.

## 1. Prérequis

```bash
brew install helm
```

## 2. Installation de kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace
```

Vérifier les pods:

```bash
kubectl get pods -n monitoring
```

## 3. Accéder à Grafana

```bash
kubectl port-forward svc/monitoring-grafana 3001:80 -n monitoring
```

URL: [http://localhost:3001](http://localhost:3001)  
User: `admin`  
Password: 

```bash
kubectl get secret monitoring-grafana -n monitoring \
  -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

## 4. Dashboards disponibles

### Dashboards Kubernetes pré-installés

- **Kubernetes / Compute Resources / Namespace (Pods)** - CPU & mémoire pods
- **Kubernetes / Compute Resources / Pod** - Détails par pod
- **Node Exporter / Nodes** - Ressources nœud

### Dashboard Driftly applicatif (NEW)

Importer depuis `monitoring/grafana-dashboards/driftly-dashboard.json`:

1. **Dashboards → New → Import**
2. Upload JSON ou copy-paste le contenu
3. Sélectionner Prometheus
4. Importer

Affiche: Requêtes HTTP, latence, erreurs, itinéraires générés, appels OpenAI/Pexels, CPU, mémoire, uptime.

## 5. Vérifier les métriques Prometheus

### Endpoint /api/metrics

```bash
# Localement
curl http://localhost:3000/api/metrics

# Production (avec port-forward)
kubectl port-forward -n driftly svc/driftly-app 3000:3000
curl http://localhost:3000/api/metrics
```

Doit retourner du texte Prometheus avec les métriques Driftly.

### Prometheus UI

```bash
kubectl port-forward -n monitoring svc/prometheus-operated 9090:9090
```

URL: [http://localhost:9090](http://localhost:9090)  
Aller à **Status → Targets** pour vérifier que `driftly-app` est **UP**.

## 6. Appliquer ServiceMonitor et PrometheusRules

```bash
# ServiceMonitor: permettre à Prometheus de scraper /api/metrics
kubectl apply -f k8s/app-servicemonitor.yaml

# PrometheusRules: alertes Prometheus
kubectl apply -f k8s/prometheus-rules.yaml

# Vérifier
kubectl get servicemonitor -n driftly
kubectl get prometheusrule -n driftly
```

## 7. Requêtes PromQL utiles

```promql
# Requêtes HTTP par seconde
sum(rate(driftly_http_requests_total[5m])) by (status)

# Taux erreurs (%)
(sum(rate(driftly_http_requests_total{status=~"5.."}[5m])) / sum(rate(driftly_http_requests_total[5m]))) * 100

# Latence p95
histogram_quantile(0.95, sum(rate(driftly_http_request_duration_seconds_bucket[5m])) by (le))

# Itinéraires générés
sum(rate(driftly_itinerary_generated_total[5m])) by (status)

# Erreurs OpenAI
sum(rate(driftly_openai_requests_total{status="error"}[5m]))

# Mémoire Heap (MB)
nodejs_heap_size_used_bytes / 1024 / 1024

# Uptime (jours)
process_uptime_seconds / 86400
```

## 8. Alertes Prometheus

Configurées dans `k8s/prometheus-rules.yaml`:


| Alerte                               | Condition                         | Sévérité    |
| ------------------------------------ | --------------------------------- | ----------- |
| **DriftlyHighErrorRate**             | Erreurs 5xx > 5% (5min)           | ⚠️ Warning  |
| **DriftlyHighLatency**               | p95 latence > 2s (5min)           | ⚠️ Warning  |
| **DriftlyItineraryGenerationErrors** | Erreurs génération > 0.1/s (5min) | ⚠️ Warning  |
| **DriftlyAppDown**                   | App indisponible (2min)           | 🔴 Critical |
| **DriftlyOpenAIErrors**              | Erreurs OpenAI > 0.05/s (5min)    | ⚠️ Warning  |
| **DriftlyPexelsErrors**              | Erreurs Pexels > 0.1/s (5min)     | ℹ️ Info     |


Voir les alertes: [http://localhost:9090/alerts](http://localhost:9090/alerts)

## 9. Scénario test de charge

### Terminal 1: App

```bash
kubectl port-forward -n driftly svc/driftly-app 3000:3000
```

### Terminal 2: Grafana

```bash
kubectl port-forward svc/monitoring-grafana 3001:80 -n monitoring
```

### Terminal 3: Générer charge

```bash
brew install hey
hey -z 30s -c 50 http://localhost:3000/api/health
```

Ou k6:

```bash
brew install k6
k6 run --vus 50 --duration 30s - <<'EOF'
import http from 'k6/http';
import { check } from 'k6';
export default function () {
  const res = http.get('http://localhost:3000/api/health');
  check(res, { 'status 200': (r) => r.status === 200 });
}
EOF
```

### Observer

- Dashboard: Driftly - Application Monitoring
- Prometheus: [http://localhost:9090/graph](http://localhost:9090/graph)
- HPA: `kubectl get hpa -n driftly -w`
- Pods: `kubectl get pods -n driftly -w`

## 10. Désinstaller

```bash
helm uninstall monitoring -n monitoring
kubectl delete namespace monitoring
```

