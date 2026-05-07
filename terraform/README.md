# Terraform — Infrastructure locale Driftly

Configuration Terraform pour provisionner l'environnement Kubernetes local.

## Terraform vs Kubernetes : quelle différence ?

| | Terraform | Kubernetes (kubectl) |
|---|---|---|
| **Rôle** | **Provisioning** — crée l'infrastructure | **Orchestration** — déploie les conteneurs |
| **Ce qu'il gère ici** | Cluster kind, namespace, metrics-server, Prometheus/Grafana | Deployments, Services, HPA, ConfigMaps, Secrets |
| **Quand l'exécuter** | Une seule fois pour préparer l'environnement | À chaque déploiement ou mise à jour de l'app |

Terraform prépare le terrain (le cluster, le monitoring), Kubernetes y déploie l'application.

## Prérequis

- [Docker](https://docs.docker.com/get-docker/)
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- [Helm](https://helm.sh/docs/intro/install/)

## Utilisation

```bash
cd terraform/

# 1. Initialiser les providers
terraform init

# 2. Valider la syntaxe
terraform validate

# 3. Prévisualiser les changements
terraform plan

# 4. Créer l'infrastructure
terraform apply
```

Terraform va :
1. Créer un cluster kind `driftly` (1 control-plane + 1 worker)
2. Créer le namespace `driftly`
3. Installer metrics-server (requis pour le HPA)
4. Installer Prometheus + Grafana (si `enable_monitoring = true`)
5. Charger l'image Docker `driftly:latest` dans le cluster

## Déployer l'application

Une fois `terraform apply` terminé, déployer les manifestes Kubernetes :

```bash
kubectl apply -f ../k8s/
kubectl get pods -n driftly -w
```

## Tester

```bash
curl http://localhost:30000/api/health
```

## Grafana

```bash
kubectl port-forward svc/monitoring-grafana 3001:80 -n monitoring
```

http://localhost:3001 — admin / (voir `kubectl get secret` dans le README principal)

## Désactiver le monitoring

```bash
terraform apply -var="enable_monitoring=false"
```

## Tout détruire

```bash
terraform destroy
```

## Ce que Terraform ne gère pas

Les fichiers `k8s/*.yaml` (Deployments, Services, HPA, Secrets, ConfigMap) restent gérés par `kubectl apply`. C'est un choix volontaire : Terraform gère l'infrastructure, Kubernetes gère l'applicatif.
