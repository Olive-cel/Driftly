# Driftly — Plateforme de planification de voyages intelligente

Driftly est une application web qui utilise l'intelligence artificielle pour générer des itinéraires de voyage personnalisés. Ce dépôt contient le code applicatif ainsi que l'ensemble de la configuration DevOps (Docker, Kubernetes, Terraform, monitoring) 

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Cluster Kubernetes (kind)                  │
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────────┐  │
│  │  driftly-app │     │  driftly-app │     │   PostgreSQL   │  │
│  │  (replica 1) │     │  (replica 2) │     │   (replica 1)  │  │
│  │  Next.js 14  │     │  Next.js 14  │     │   port 5432    │  │
│  │  port 3000   │     │  port 3000   │     └───────┬────────┘  │
│  └──────┬───────┘     └──────┬───────┘             │           │
│         │                    │              ClusterIP (interne) │
│         └────────┬───────────┘                                  │
│           Service NodePort :30000                               │
│                  │                                              │
│  ┌───────────────┴───────────────────┐                         │
│  │   HPA (2 → 5 pods, CPU > 70%)    │                         │

│  └───────────────────────────────────┘                         │
│                                                                 │
│  ┌─────────────────────────────────────┐                       │
│  │  Prometheus + Grafana (monitoring)  │                       │
│  │  namespace: monitoring              │                       │
│  └─────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
         │
    localhost:30000 (app)
    localhost:3001  (Grafana)
```


| Composant           | Rôle                                       | Technologie                           |
| ------------------- | ------------------------------------------ | ------------------------------------- |
| **Frontend + API**  | Interface utilisateur et routes API        | Next.js 14, TypeScript, Tailwind CSS  |
| **Base de données** | Stockage des profils, voyages, itinéraires | PostgreSQL 16                         |
| **IA**              | Génération d'itinéraires personnalisés     | Anthropic Claude (optionnel en local) |
| **Orchestration**   | Déploiement et scaling des conteneurs      | Kubernetes via kind                   |
| **Autoscaling**     | Ajustement automatique du nombre de pods   | HPA (CPU 70%)                         |
| **Provisioning**    | Création de l'infrastructure locale        | Terraform                             |
| **Monitoring**      | Visualisation des métriques en temps réel  | Prometheus + Grafana                  |


---

## 2. Structure du projet

```
driftly/
├── src/                          # Code applicatif Next.js
│   ├── app/                      # Pages et routes API (App Router)
│   ├── components/               # Composants React
│   ├── lib/                      # Utilitaires, clients Supabase, env
│   ├── services/ai/              # Intégration Anthropic Claude
│   └── types/                    # Types TypeScript
├── k8s/                          # Manifestes Kubernetes
│   ├── namespace.yaml            # Namespace driftly
│   ├── configmap.yaml            # Variables non sensibles
│   ├── secret.yaml               # Variables sensibles
│   ├── postgres-deployment.yaml  # Deployment PostgreSQL
│   ├── postgres-service.yaml     # Service ClusterIP PostgreSQL
│   ├── app-deployment.yaml       # Deployment Next.js (2 replicas)
│   ├── app-service.yaml          # Service NodePort :30000
│   └── app-hpa.yaml              # HorizontalPodAutoscaler
├── terraform/                    # Provisioning infrastructure
│   ├── main.tf                   # Cluster kind, namespace, Helm releases
│   ├── variables.tf              # Variables paramétrables
│   └── outputs.tf                # Sorties (endpoint, namespace, next steps)
├── monitoring/                   # Documentation monitoring
│   └── README.md                 # Guide Grafana / Prometheus
├── supabase/migrations/          # Schéma SQL de la base de données
├── Dockerfile                    # Image multi-stage Next.js
├── .dockerignore                 # Exclusions du build Docker
└── package.json                  # Dépendances Node.js
```

---

## 3. Prérequis


| Outil                | Version | Installation (macOS)                              |
| -------------------- | ------- | ------------------------------------------------- |
| Docker Desktop       | 24+     | [docker.com](https://docs.docker.com/get-docker/) |
| kubectl              | 1.28+   | `brew install kubectl`                            |
| kind                 | 0.20+   | `brew install kind`                               |
| Terraform            | 1.5+    | `brew install terraform`                          |
| Helm                 | 3.12+   | `brew install helm`                               |
| hey (test de charge) | -       | `brew install hey`                                |
| k6 (test de charge)  | -       | `brew install k6`                                 |


---

## 4. Installation et lancement

### Option A — Avec Terraform 

Terraform provisionne automatiquement le cluster, le namespace, metrics-server et le monitoring.

```bash
# 1. Builder l'image Docker
docker build -t driftly:latest .

# 2. Provisionner l'infrastructure
cd terraform/
terraform init
terraform plan
terraform apply

# 3. Déployer l'application
kubectl apply -f ../k8s/

# 4. Vérifier
kubectl get pods -n driftly -w
```

### Option B — Manuelle (sans Terraform)

```bash
# 1. Créer le cluster kind
kind create cluster --name driftly

# 2. Builder et charger l'image
docker build -t driftly:latest .
kind load docker-image driftly:latest --name driftly

# 3. Installer metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system \
  --type='json' \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

# 4. Déployer l'application
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/

# 5. Vérifier
kubectl get pods -n driftly -w
```

### Vérification du déploiement

```bash
kubectl get pods -n driftly
kubectl get svc -n driftly
kubectl get hpa -n driftly
```

### Accéder a l'application

```bash
# Via NodePort
curl http://localhost:30000/api/health

# Via port-forward
kubectl port-forward -n driftly svc/driftly-app 3000:3000
curl http://localhost:3000/api/health
```

### Variables d'environnement

Les secrets ne sont jamais embarqués dans l'image Docker. Ils sont gérés via :

- `k8s/configmap.yaml` pour les variables non sensibles
- `k8s/secret.yaml` pour les variables sensibles (credentials DB, clés API)

Modifier ces fichiers avant le déploiement avec vos propres valeurs.

---

## 5. Monitoring avec Grafana

### Installation de Prometheus + Grafana

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace
```

### Acceder a Grafana

```bash
kubectl port-forward svc/monitoring-grafana 3001:80 -n monitoring
```

- **URL** : [http://localhost:3001](http://localhost:3001)
- **Utilisateur** : `admin`
- **Mot de passe** :

```bash
kubectl get secret monitoring-grafana -n monitoring \
  -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

### Dashboards recommandes


| Dashboard                                         | Ce qu'il montre                                        |
| ------------------------------------------------- | ------------------------------------------------------ |
| Kubernetes / Compute Resources / Namespace (Pods) | CPU et memoire de tous les pods du namespace `driftly` |
| Kubernetes / Compute Resources / Pod              | Detail par pod, utile pour comparer les replicas       |
| Node Exporter / Nodes                             | Ressources globales du noeud kind                      |


---

## 6. Tests de charge

### Avec hey

```bash
# 200 requetes en parallele pendant 1 minute
hey -z 1m -c 100 http://localhost:3000/api/health
```

### Avec k6

```bash
k6 run --vus 50 --duration 30s - <<'EOF'
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get('http://localhost:3000/api/health');
  check(res, { 'status 200': (r) => r.status === 200 });
}
EOF
```

### Observer les metriques pendant le test

```bash
# Terminal 1 — Observer les pods
kubectl get pods -n driftly -w

# Terminal 2 — Observer le HPA
kubectl get hpa -n driftly -w

# Terminal 3 — Metriques CPU/memoire
kubectl top pods -n driftly
```

Simultanement, observer les courbes dans Grafana (dashboard Namespace Pods).

---

## 7. Scalabilite et HPA

Le Horizontal Pod Autoscaler ajuste dynamiquement le nombre de replicas de l'application.


| Parametre     | Valeur        | Justification                           |
| ------------- | ------------- | --------------------------------------- |
| `minReplicas` | 2             | Haute disponibilite minimale            |
| `maxReplicas` | 5             | Plafond adapte a un cluster local       |
| `CPU target`  | 70%           | Marge suffisante avant saturation       |
| Scale up      | +1 pod / 60s  | Montee progressive, evite l'emballement |
| Scale down    | -1 pod / 120s | Descente lente, evite le flapping       |


**Fonctionnement** : toutes les 15 secondes, le HPA calcule `replicas = actuelles x (CPU moyenne / cible)`. Si les pods consomment en moyenne plus de 70% de leurs `requests.cpu` (100m), Kubernetes ajoute des pods. Quand la charge diminue, il redescend progressivement vers 2 replicas.

### Ressources configurees


| Service         | Requests             | Limits               |
| --------------- | -------------------- | -------------------- |
| **driftly-app** | 100m CPU / 256Mi RAM | 500m CPU / 512Mi RAM |
| **PostgreSQL**  | 250m CPU / 512Mi RAM | 500m CPU / 1Gi RAM   |


---

## 8. Analyse GreenOps

L'analyse GreenOps evalue l'efficacite energetique et le dimensionnement des ressources.

### Dimensionnement des ressources

Les `requests` sont calibrees au plus juste :

- **App Next.js** : 100m CPU en idle, ce qui correspond au comportement observe au repos. Les `limits` a 500m laissent de la marge pour les pics sans surprovisionnement permanent.
- **PostgreSQL** : 250m CPU en requests car les requetes SQL necessitent plus de CPU de base. Les limits a 500m evitent la competition avec les pods applicatifs.

### Absence de surprovisionnement

- Le HPA demarre a 2 replicas (pas 5) — les pods supplementaires ne sont crees que sous charge reelle.
- La politique de scale down lente (120s de stabilisation) evite les cycles de creation/destruction inutiles qui consomment des ressources.
- Le monitoring ne tourne pas dans le namespace applicatif, ses ressources sont isolees.

### Stabilite sous charge

Les tests de charge montrent que :

- Le systeme absorbe les pics via le HPA sans crash ni restart.
- La consommation CPU redescend au niveau de base apres la charge.
- Les readiness/liveness probes evitent de router du trafic vers des pods non prets.

### Pistes d'amelioration

- Ajouter un VPA (Vertical Pod Autoscaler) pour ajuster automatiquement les requests/limits.
- Utiliser des images `distroless` au lieu de `node:alpine` pour reduire la surface d'attaque et la taille de l'image.
- Mettre en place des quotas de namespace pour limiter la consommation globale.

---

## 9. Nettoyage

```bash
# Supprimer l'application uniquement
kubectl delete namespace driftly

# Tout detruire (cluster + monitoring) via Terraform
cd terraform/
terraform destroy

# Ou supprimer le cluster kind manuellement
kind delete cluster --name driftly
```

---

## 10. Conclusion

Ce projet demontre la mise en place d'une infrastructure conteneurisee complete pour une application web reelle :

1. **Conteneurisation** — Image Docker multi-stage optimisee (~150 Mo) avec separation build/runtime.
2. **Orchestration** — Deploiement Kubernetes avec Deployments, Services, ConfigMaps et Secrets.
3. **Scalabilite** — HPA qui ajuste automatiquement les replicas en fonction de la charge CPU.
4. **Provisioning** — Terraform pour creer l'infrastructure locale de maniere reproductible.
5. **Observabilite** — Prometheus et Grafana pour visualiser les metriques en temps reel.
6. **GreenOps** — Ressources dimensionnees au juste necessaire, scaling progressif, pas de surprovisionnement.

L'ensemble fonctionne en local sur kind, sans aucune dependance a des services cloud payants.