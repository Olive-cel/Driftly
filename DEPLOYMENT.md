# Déploiement Driftly

Guide complet pour déployer Driftly en production.

## Prérequis

- Compte Vercel
- Compte GitHub
- Compte Supabase configuré
- Clés API (Openai, Pexels, Amadeus)

## Déploiement sur Vercel

### 1. Préparation du repository

```bash
# Assurer que tout est committé
git status
git add .
git commit -m "Final deployment preparation"
git push origin main
```

### 2. Connexion à Vercel

- Aller sur https://vercel.com
- Sign up/Login avec GitHub
- Import project depuis GitHub

### 3. Configuration des variables d'environnement

Dans Vercel Settings → Environment Variables, ajouter:

**Production:**
```
NEXT_PUBLIC_SUPABASE_URL=<votre-url-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre-clé-anon-supabase>
OPENAI_API_KEY=<votre-clé-openai>
PEXELS_API_KEY=<votre-clé-pexels>
AMADEUS_CLIENT_ID=<optionnel-amadeus>
AMADEUS_CLIENT_SECRET=<optionnel-amadeus>
```

### 4. Déploiement

- Cliquer sur "Deploy"
- Vercel va builder et déployer automatiquement
- URL de production sera disponible après build complet

## Validations pré-déploiement

### Local

```bash
# Tests
npm run test:unit

# TypeScript strict
npx tsc --noEmit

# Lint
npm run lint

# Build production
npm run build

# Start production
npm start
```

### Vérifications

- ✅ Auth signup/login/logout fonctionne
- ✅ Création voyage fonctionne
- ✅ Génération itinéraire fonctionne
- ✅ Images chargent correctement
- ✅ /api/health retourne status OK
- ✅ /api/metrics accessible

## Variables d'environnement

### .env.local (développement)

Copier `.env.local.example` et remplir:

```env
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
OPENAI_API_KEY=sk-proj-...
PEXELS_API_KEY=...
AMADEUS_CLIENT_ID=<optionnel>
AMADEUS_CLIENT_SECRET=<optionnel>
```

### Variables Vercel (production)

Identiques à `.env.local` sauf:
- Pas de SUPABASE_SERVICE_ROLE_KEY
- Pas de secrets sensibles côté client

## Post-déploiement

### 1. Vérifier la santé

```bash
curl https://votre-app-vercel.vercel.app/api/health
```

Doit retourner:
```json
{
  "status": "ok",
  "supabase": "connected",
  "openai": "configured",
  "pexels": "configured"
}
```

### 2. Tester le flux complet

- Sign up avec nouvel email
- Créer un voyage
- Générer itinéraire
- Consulter détails

### 3. Monitoring

- Vérifier logs Vercel
- Vérifier logs Supabase
- Vérifier usage OpenAI/Pexels

## Rollback

Si problème en production:

```bash
# Sur Vercel dashboard
- Aller à Deployments
- Cliquer sur deployment précédent
- Cliquer "Rollback"
```

## Support

- Logs Vercel: https://vercel.com/dashboard
- Logs Supabase: https://supabase.com/dashboard
- Contact: support@driftly.app (à créer)

## Checklist pré-launch

- [ ] Build local réussi
- [ ] Tests passent
- [ ] TypeScript strict OK
- [ ] Variables Vercel configurées
- [ ] Déploiement Vercel réussi
- [ ] Health check OK
- [ ] Auth fonctionne
- [ ] Trip creation fonctionne
- [ ] Itinerary generation fonctionne
- [ ] Images chargent
- [ ] Monitoring accessi le
- [ ] Documentation à jour
