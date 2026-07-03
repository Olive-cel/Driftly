# Déploiement & DevOps

# Table des Matières

- [Vue Générale](#vue-générale)
- [Déploiement Vercel](#déploiement-vercel)
- [Déploiement GitHub Pages](#déploiement-github-pages)
- [Docker & Kubernetes](#docker--kubernetes)
- [Variables d'Environnement](#variables-denvironnement)
- [Monitoring](#monitoring)
- [Checklist](#checklist-pré-déploiement)

## Vue Générale

### Stratégies Supportées


| Plateforme       | Type         | Coût     | Setup  | Auto |
| ---------------- | ------------ | -------- | ------ | ---- |
| **Vercel**       | Serverless   | Free~$20 | 5 min  | ✅    |
| **GitHub Pages** | Static       | Free     | 10 min | ✅    |
| **Docker**       | Container    | Custom   | 15 min | ❌    |
| **Kubernetes**   | Orchestrated | Custom   | 30 min | ❌    |


### Recommandé pour RNCP

**Vercel** est recommandé pour la démo (free tier, déploiement facile)

## Déploiement Vercel

### 1. Setup Initial

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel (or use GitHub OAuth)
vercel login

# Deploy
vercel
```

### 2. Configuration

**Lors du premier déploiement**:

```
? Set up and deploy? Yes
? Which scope? Your user/organization
? Link to existing project? No (create new)
? Project name? driftly
? Framework? Next.js
? Root directory? ./ (current)
? Build command? npm run build
? Output directory? .next
? Install dependencies? Yes
```

### 3. Environment Variables

Via Vercel Dashboard:

```
Project Settings > Environment Variables
```

Ajouter:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY
AMADEUS_CLIENT_ID
AMADEUS_CLIENT_SECRET
PEXELS_API_KEY
NODE_ENV = production
```

### 4. Git Integration (Recommended)

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
```

### Déploiement automatique

- **main branch** → Production (https://driftly-two.vercel.app)
- **PR branches** → Preview URLs ([https://driftly-pr-1.vercel.app](https://driftly-pr-1.vercel.app))

## Docker & Kubernetes

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000
CMD ["npm", "start"]
```

### Build Docker Image

```bash
docker build -t driftly:latest .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="..." \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
  driftly:latest
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: driftly
spec:
  replicas: 3
  selector:
    matchLabels:
      app: driftly
  template:
    metadata:
      labels:
        app: driftly
    spec:
      containers:
      - name: driftly
        image: driftly:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: driftly-secrets
              key: supabase-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: driftly-service
spec:
  type: LoadBalancer
  selector:
    app: driftly
  ports:
  - port: 80
    targetPort: 3000
```

### Deploy to K8s

```bash
# Create namespace
kubectl create namespace driftly

# Create secrets
kubectl create secret generic driftly-secrets \
  --from-literal=supabase-url="..." \
  -n driftly

# Deploy
kubectl apply -f k8s/deployment.yaml -n driftly

# Check status
kubectl get pods -n driftly
kubectl get svc -n driftly
```

## Variables d'Environnement

### Environment Variables Table


| Variable                        | Source   | Type   | Scope  | Required |
| ------------------------------- | -------- | ------ | ------ | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase | Public | Client | ✅        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public | Client | ✅        |
| `OPENAI_API_KEY`                | OpenAI   | Secret | Server | ✅        |
| `AMADEUS_CLIENT_ID`             | Amadeus  | Secret | Server | ✅        |
| `AMADEUS_CLIENT_SECRET`         | Amadeus  | Secret | Server | ✅        |
| `PEXELS_API_KEY`                | Pexels   | Secret | Server | ✅        |
| `NODE_ENV`                      | System   | String | Server | ✅        |


### Production .env

**Never commit!**

```bash
# .env.production (for reference only)
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
OPENAI_API_KEY=sk-proj-...
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
PEXELS_API_KEY=...
```

## Monitoring

### Prometheus Metrics

Driftly expose des métriques sur:

```
GET /api/metrics
```

Format Prometheus:

```
# HELP requests_total Total API requests
# TYPE requests_total counter
requests_total{path="/api/trips",method="GET"} 1250
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "healthy",
  "database": "connected",
  "external_apis": {
    "openai": "ok",
    "amadeus": "ok",
    "pexels": "ok"
  }
}
```

### Logs

**Production logs** via platform:

- **Vercel**: Deployments > View Function Logs
- **Kubernetes**: `kubectl logs <pod-name>`
- **Docker**: `docker logs <container-id>`

## Checklist Pré-Déploiement

### Code Quality

- [ ] `npm run lint` - 0 errors
- [ ] `npx tsc --noEmit` - 0 errors
- [ ] `npm run test:unit` - all pass
- [ ] `npm run build` - success

### Configuration

- [ ] `.env` variables configured
- [ ] Supabase migrations applied
- [ ] Database RLS policies verified
- [ ] Secrets in GitHub/Vercel

### Security

- [ ] No hardcoded secrets
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] API rate limiting (if needed)

### Performance

- [ ] Build size < 10MB
- [ ] Lighthouse score > 90
- [ ] API response time < 1s
- [ ] Database queries optimized

### Monitoring

- [ ] Health check working
- [ ] Metrics endpoint active
- [ ] Error tracking configured
- [ ] Logs aggregation ready

## Deployment Commands

### Vercel

```bash
# Deploy
vercel deploy --prod

# View logs
vercel logs <app-name> --tail

# Rollback
vercel rollback
```

### Docker

```bash
# Build
docker build -t driftly:v1.0.0 .

# Push to registry
docker tag driftly:v1.0.0 registry.example.com/driftly:v1.0.0
docker push registry.example.com/driftly:v1.0.0

# Run
docker run -d -p 3000:3000 \
  --env-file .env \
  registry.example.com/driftly:v1.0.0
```

### Kubernetes

```bash
# Deploy
kubectl apply -f k8s/

# Check status
kubectl get deployments -n driftly

# Scale
kubectl scale deployment driftly --replicas=5 -n driftly

# Update image
kubectl set image deployment/driftly \
  driftly=registry.example.com/driftly:v1.0.1 \
  -n driftly
```

