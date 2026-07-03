# Driftly - Plateforme de Planification de Voyages Intelligente

## Présentation

**Driftly** est une plateforme web de planification de voyages propulsée par l'IA. Elle permet aux utilisateurs de :

- **Planifier** leurs voyages simplement et rapidement
- **Générer** automatiquement des itinéraires personnalisés via OpenAI GPT-4o-mini
- **Découvrir** des inspirations de destinations avec images et ratings
- **Gérer** leurs favoris et comparer les options
- **Rechercher** des vols en temps réel via l'API Amadeus
- **Recommander** les meilleurs hôtels basés sur le profil utilisateur
- **Suivre** l'avancement de leurs voyages en temps réel

### Objectif Principal

Driftly résout le problème de la planification de voyage complexe en automatisant les tâches répétitives (recherche de destinations, création d'itinéraires) et en fournissant des recommendations intelligentes et personnalisées.

## Fonctionnalités

### Authentification & Profil Utilisateur

- ✅ Inscription et connexion via Supabase Auth
- ✅ Récupération de mot de passe par email
- ✅ Profil utilisateur personnalisable
- ✅ Préférences de voyage (budget, style, intérêts)
- ✅ Gestion des cookies et sessions sécurisées

### Tableau de Bord

- ✅ Vue d'ensemble des voyages actifs
- ✅ Statistiques personnalisées (budget, durée, destination)
- ✅ Conseil du jour + suggestions IA
- ✅ Lien vers inspirations et favoris

### Gestion des Voyages

- ✅ Création de voyage avec pré-remplissage optionnel
- ✅ Affichage détaillé avec statut dynamique
- ✅ Modification et suppression de voyage
- ✅ Tri et filtrage (par statut, destination)
- ✅ Visualisation sur carte (Mapbox)

### Génération d'Itinéraires IA

- ✅ Création automatique d'itinéraires JSON complets
- ✅ Suggestions d'activités par jour
- ✅ Estimations budgétaires détaillées
- ✅ Calcul de durée de trajet
- ✅ Fallback gracieux si API fails

### Recherche de Vols

- ✅ Intégration Amadeus API en temps réel
- ✅ Affichage des options (compagnie, horaires, durée, prix)
- ✅ Identification du meilleur prix
- ✅ Persistance de l'historique des recherches

### Recommandations d'Hôtels

- ✅ Génération intelligente basée sur budget/style
- ✅ 3 niveaux de qualité (Budget, Modéré, Premium)
- ✅ Images via Pexels API
- ✅ Ratings réalistes et amenities variés
- ✅ Calcul automatique du prix total

### Système d'Inspirations

- ✅ Destination d'inspiration avec descriptions
- ✅ Images de haute qualité (Pexels)
- ✅ Ratings et informations pratiques
- ✅ "Créer Trip" pré-rempli depuis inspiration
- ✅ Générateur réaliste basé sur profil utilisateur

### Favoris

- ✅ Ajout/suppression rapide (heart button)
- ✅ Persistance en Supabase
- ✅ Page dédiée avec filtres
- ✅ Cache-busting on window focus
- ✅ Support des deux types (inspiration, trip)

### Notifications

- ✅ Vue des notifications utilisateur
- ✅ Structure pour notifications futures
- ✅ Design responsive

### Paramètres

- ✅ Gestion des préférences utilisateur
- ✅ Mise à jour du profil
- ✅ Structure pour futurs réglages

## Public Visé

### Utilisateurs Primaires

- **Voyageurs individuels** (18-65 ans)
- **Couples et petits groupes** planifiant des vacances
- **Voyageurs d'affaires** optimisant leurs déplacements
- **Backpackers** cherchant des inspirations économiques

### Niveaux de Compétence

- Aucune compétence technique requise
- Interface intuitive et guidée
- Support et aide intégrés

### Cas d'Usage

1. **Voyageur indécis**: "Je veux partir mais ne sais pas où" → Inspirations + IA génère itinéraire
2. **Voyageur rationnel**: "Je dois trouver les meilleurs vols et hôtels" → Recherche + Comparaison
3. **Voyageur aventureux**: "Surprends-moi!" → Inspirations aléatoires + Plans détaillés
4. **Planificateur groupe**: "Organisons un trip en commun" → Favoris partagés + Budget tracké

## Technologies

### Frontend

- **Next.js 14** - Framework React with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **React Testing Library** - Component tests

### Backend

- **Next.js API Routes** - Serverless functions
- **Node.js 20** - Runtime
- **TypeScript** - Type safety

### Base de Données & Auth

- **Supabase** - PostgreSQL + Auth + RLS
- **Supabase SSR** - Session management
- **Row Level Security (RLS)** - Data security

### API Externes

- **OpenAI GPT-4o-mini** - Génération d'itinéraires IA
- **Amadeus API** - Recherche de vols en temps réel
- **Pexels API** - Bibliothèque d'images
- **Anthropic SDK** - Alternative/fallback IA

### DevOps & Monitoring

- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization

### Testing

- **Vitest** - Unit tests (56 tests)
- **React Testing Library** - Component tests
- **Playwright** - E2E tests

### Tools & Utilities

- **npm** - Package management (v10+)
- **ESLint** - Code linting
- **Prettier** - Code formatting (implicit)
- **Git** - Version control

## Démarrage Rapide

### Prérequis

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- Compte **Supabase**
- Clés API pour: **OpenAI**, **Amadeus**, **Pexels**

### Installation

```bash
# Clone le repository
git clone https://github.com/yourusername/driftly.git
cd driftly

# Install dependencies
npm install

# Configure environment variables (voir INSTALLATION.md)
cp .env.example .env.local

# Run dev server
npm run dev

# Ouvre http://localhost:3000
```

### Commandes Essentielles

```bash
# Development
npm run dev              # Start dev server (port 3000)

# Build & Production
npm run build            # Production build
npm start                # Start production server

# Quality
npm run lint             # Run ESLint
npx tsc --noEmit        # TypeScript check
npm run test:unit       # Unit tests
npm run test:e2e        # E2E tests

# Other
npm run metrics:check    # Check metrics endpoint
npm run health:check     # Health check
```

## Documentation

Consultez la documentation complète:


| Document                                     | Contenu                                        |
| -------------------------------------------- | ---------------------------------------------- |
| **[INSTALLATION.md](INSTALLATION.md)**       | Configuration locale, variables d'env          |
| **[ARCHITECTURE.md](ARCHITECTURE.md)**       | Architecture système, tech stack détaillé      |
| **[API.md](API.md)**                         | Toutes les routes API, paramètres, exemples    |
| **[DEPLOYMENT.md](DEPLOYMENT.md)**           | Déploiement GitHub, Docker, Kubernetes, Vercel |
| **[CI-CD.md](CI-CD.md)**                     | Pipeline GitHub Actions, tests, build          |
| **[USER_GUIDE.md](USER_GUIDE.md)**           | Guide utilisateur complet (flows, screenshots) |
| **[TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)** | Architecture technique, dossiers, services     |


## URLs Importantes


| Service        | URL                                                                          |
| -------------- | ---------------------------------------------------------------------------- |
| App Production | [https://driftly-two.vercel.app](https://driftly-two.vercel.app)                     |
| Repository     | [https://github.com/Olive-cel/Driftly](https://github.com/Olive-cel/Driftly) |
| Supabase       | [https://supabase.com](https://supabase.com)                                 |
| OpenAI         | [https://platform.openai.com](https://platform.openai.com)                   |
| Amadeus        | [https://developers.amadeus.com](https://developers.amadeus.com)             |


## Statistiques du Projet

- **Lignes de code**: ~15,000+ TypeScript/TSX
- **Tests**: 56 unit tests passants
- **Routes API**: 14 endpoints
- **Pages**: 15 pages/routes
- **Composants**: 50+ React components
- **Services**: 8 services métier
- **Couverture**: Lint + TypeScript strict + Unit tests

## Checklist de Déploiement

Avant de déployer en production:

- [ ] Variables d'environnement configurées (voir DEPLOYMENT.md)
- [ ] Tests passants: `npm run test:unit`
- [ ] Lint clean: `npm run lint`
- [ ] Build réussi: `npm run build`
- [ ] TypeScript strict: `npx tsc --noEmit`
- [ ] GitHub Actions passant (tous les workflows)
- [ ] Supabase RLS policies vérifiées
- [ ] Secrets ajoutés à GitHub/Vercel

## Support

### Issues et Bugs

Reportez les bugs via [GitHub Issues](https://github.com/yourusername/driftly/issues)

### Discussions

Discussions générales: [GitHub Discussions](https://github.com/yourusername/driftly/discussions)

### Contact

- Email: [contact@driftly.io](mailto:contact@driftly.io) 
- Documentation: Voir docs/ folder

## Auteurs & Contributeurs

**Développement Principal**: Olive (Alternante développeur fullstack)

