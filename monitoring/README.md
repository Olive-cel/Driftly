# Monitoring — Grafana & Prometheus

Stack de monitoring pour observer les métriques Kubernetes pendant les tests de charge Driftly.

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

Vérifier que tous les pods sont Running :

```bash
kubectl get pods -n monitoring
```

## 3. Accéder à Grafana

```bash
kubectl port-forward svc/monitoring-grafana 3001:80 -n monitoring
```

Ouvrir http://localhost:3001

- **User** : `admin`
- **Password** :

```bash
kubectl get secret monitoring-grafana -n monitoring \
  -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

## 4. Dashboards à utiliser

Une fois connecté, aller dans **Dashboards → Browse**. Les dashboards suivants sont pré-installés :

| Dashboard | Ce qu'il montre |
|---|---|
| **Kubernetes / Compute Resources / Namespace (Pods)** | Vue d'ensemble CPU & mémoire de tous les pods du namespace `driftly` |
| **Kubernetes / Compute Resources / Pod** | Détail CPU/mémoire par pod, utile pour comparer les replicas |
| **Node Exporter / Nodes** | Ressources globales du noeud kind (CPU, RAM, disque) |

Filtrer par namespace `driftly` dans les sélecteurs en haut des dashboards.

## 5. Scénario de test de charge

### Étape 1 — Ouvrir 3 terminaux

**Terminal 1** — Port-forward de l'app :

```bash
kubectl port-forward -n driftly svc/driftly-app 3000:3000
```

**Terminal 2** — Port-forward de Grafana :

```bash
kubectl port-forward svc/monitoring-grafana 3001:80 -n monitoring
```

**Terminal 3** — Lancer le test de charge.

### Étape 2 — Générer la charge avec hey

```bash
brew install hey

# 200 requêtes, 50 en parallèle, pendant 30 secondes
hey -z 30s -c 50 http://localhost:3000/api/health
```

Ou avec k6 :

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

### Étape 3 — Observer dans Grafana

1. Ouvrir le dashboard **Kubernetes / Compute Resources / Namespace (Pods)**
2. Sélectionner le namespace `driftly`
3. Observer la montée du CPU pendant le test
4. Vérifier si le HPA déclenche un scaling :

```bash
kubectl get hpa -n driftly -w
kubectl get pods -n driftly -w
```

### Étape 4 — Comparer avec kubectl

```bash
kubectl top pods -n driftly
kubectl top nodes
```

## 6. Désinstaller

```bash
helm uninstall monitoring -n monitoring
kubectl delete namespace monitoring
```
