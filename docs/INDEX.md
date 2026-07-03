# Documentation Index - Driftly

## Démarrage Rapide

**Vous êtes nouveau sur le projet?** Commencez ici:

1. **[README.md](README.md)** - Vue d'ensemble du projet (cela vous prendra 5 min)
2. **[INSTALLATION.md](INSTALLATION.md)** - Configuration locale (cela vous prendra 10 min)
3. Lancez `npm run dev` et explorez!

## Documentation Complète

### Pour les Utilisateurs


| Document                           | Pour                | Contenu                                                  |
| ---------------------------------- | ------------------- | -------------------------------------------------------- |
| **[USER_GUIDE.md](USER_GUIDE.md)** | Utilisateurs finaux | Comment utiliser Driftly (inscription, voyages, favoris) |


### Pour les Développeurs


| Document                                     | Pour           | Contenu                                                     |
| -------------------------------------------- | -------------- | ----------------------------------------------------------- |
| **[INSTALLATION.md](INSTALLATION.md)**       | Dev setup      | Installation locale, variables d'env, commandes             |
| **[ARCHITECTURE.md](ARCHITECTURE.md)**       | Architectes    | Stack technique, couches, flux de données                   |
| **[TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)** | Dev techniques | Structure projet, services, best practices, English section |
| **[API.md](API.md)**                         | Intégration    | Tous les 14 endpoints API avec exemples                     |


### Pour DevOps & CI/CD


| Document                           | Pour          | Contenu                                      |
| ---------------------------------- | ------------- | -------------------------------------------- |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | DevOps        | Vercel, Docker, Kubernetes, GitHub Secrets   |
| **[CI-CD.md](CI-CD.md)**           | Ingénieurs CI | GitHub Actions pipeline, tests, build, steps |


---

## Structure de la Documentation

```
docs/
├── README.md               ← START HERE (Vue générale)
├── INDEX.md                ← Ce fichier (Navigation)
├── INSTALLATION.md         ← Setup local
├── ARCHITECTURE.md         ← Design système
├── TECHNICAL_GUIDE.md      ← Code & English section
├── API.md                  ← Endpoints documentation
├── DEPLOYMENT.md           ← Production deployment
├── CI-CD.md                ← Pipeline GitHub Actions
├── USER_GUIDE.md           ← End-user guide
└── screenshot/             ← UI mockups/screenshots
```

## RNCP Certification

Cette documentation couvre toutes les compétences requises:

✅ **Conception Architecturale**

- Architecture système (ARCHITECTURE.md)
- Séparation des couches (TECHNICAL_GUIDE.md)
- Patterns design modernes

✅ **Développement Full-Stack**

- Frontend (Next.js 14, React 18)
- Backend (API Routes)
- Base de données (Supabase)
- Tests (Vitest, 56 tests)

✅ **DevOps & Déploiement**

- GitHub Actions CI/CD (CI-CD.md)
- Vercel deployment (DEPLOYMENT.md)
- Docker & Kubernetes (DEPLOYMENT.md)
- Environment configuration

✅ **Intégration APIs Externes**

- OpenAI (IA generation)
- Amadeus (Flights)
- Pexels (Images)
- Supabase (Auth + DB)

✅ **Monitoring & Observabilité**

- Prometheus metrics
- Health checks
- Structured logging

## Recherche Rapide

**Je cherche...**

- Comment démarrer localement? → [INSTALLATION.md](INSTALLATION.md)
- Comment créer un voyage? → [USER_GUIDE.md](USER_GUIDE.md)
- Où est l'endpoint `/api/trips`? → [API.md](API.md)
- Comment deployer en production? → [DEPLOYMENT.md](DEPLOYMENT.md)
- Comment fonctionne le CI/CD? → [CI-CD.md](CI-CD.md)
- Architecture générale? → [ARCHITECTURE.md](ARCHITECTURE.md)
- Structure projet & services? → [TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)
- Code best practices? → [TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md#best-practices-english)

## Statistiques Documentation

- **Fichiers**: 8 documents MD
- **Pages**: ~80 pages équivalent PDF
- **Sections**: 100+ topics couverts
- **Endpoints documentés**: 14 endpoints API
- **Langues**: French + English
- **Screenshots**: 1 dossier

## Commandes Rapides

```bash
# Start local dev
npm run dev

# Quality checks
npm run lint
npx tsc --noEmit
npm run test:unit

# Build production
npm run build

# Deploy to Vercel
vercel deploy --prod
```

## Parcours Recommandé

### Utilisateur (30 min)

1. Read: [README.md](README.md) - Project overview
2. Read: [USER_GUIDE.md](USER_GUIDE.md) - How to use
3. Start: `https://driftly-two.vercel.app` or local dev
4. Create: First trip 

### Developer (1-2 hours)

1. Read: [INSTALLATION.md](INSTALLATION.md) - Setup
2. Run: `npm run dev` - Local server
3. Explore: App in browser
4. Read: [ARCHITECTURE.md](ARCHITECTURE.md) - System design
5. Read: [TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md) - Code structure
6. Run: `npm run test:unit` - Tests
7. Explore: Source code `src/`

### DevOps (1 hour)

1. Read: [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy options
2. Read: [CI-CD.md](CI-CD.md) - GitHub Actions
3. Setup: Environment variables
4. Deploy: `vercel deploy --prod`
5. Monitor: Vercel dashboard

### RNCP Validation (2-3 hours)

1. Review entire [README.md](README.md)
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) - Design
3. Review [TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md) - Implementation
4. Review [API.md](API.md) - Integration
5. Review [CI-CD.md](CI-CD.md) - DevOps
6. Review [DEPLOYMENT.md](DEPLOYMENT.md) - Production
7. Run: All validation scripts
8. Verify: All 56 tests pass, lint clean, build success

## Support & Questions

**Documentation incomplete?**

- Check specific file (each has Table of Contents)
- Search file with browser find (Ctrl+F / Cmd+F)
- Read TECHNICAL_GUIDE.md for comprehensive coverage

**Code questions?**

- See TECHNICAL_GUIDE.md - Best Practices section
- See API.md - Integration Examples
- See source code `src/` with TypeScript strict types

**Deployment questions?**

- See DEPLOYMENT.md for Vercel, Docker, Kubernetes
- See CI-CD.md for GitHub Actions
- Check INSTALLATION.md for environment setup

