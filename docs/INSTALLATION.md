# Installation & Configuration

## Table des Matières

- [Prérequis](#prérequis)
- [Clonage](#clonage)
- [Installation des Dépendances](#installation-des-dépendances)
- [Variables d'Environnement](#variables-denvironnement)
- [Configuration Supabase](#configuration-supabase)
- [Démarrage Local](#démarrage-local)
- [Vérification](#vérification)
- [Troubleshooting](#troubleshooting)

## Prérequis

### Système

- **macOS**, **Linux**, ou **Windows** (avec WSL2)
- **Git** (pour clonage)
- Permissions pour installer logiciels

### Logiciels


| Logiciel    | Version | Vérification     |
| ----------- | ------- | ---------------- |
| **Node.js** | ≥20.0.0 | `node --version` |
| **npm**     | ≥10.0.0 | `npm --version`  |


### Comptes & APIs

- **Supabase Account** ([https://supabase.com](https://supabase.com)) - Gratuit
- **OpenAI API Key** ([https://platform.openai.com](https://platform.openai.com)) - Payant (~$5 testable)
- **Amadeus API Credentials** ([https://developers.amadeus.com](https://developers.amadeus.com)) - Gratuit (test mode)
- **Pexels API Key** ([https://www.pexels.com/api](https://www.pexels.com/api)) - Gratuit

## Installation Step-by-Step

### 1. Clonage du Repository

```bash
git clone https://github.com/olive-cel/driftly.git
cd driftly
```

### 2. Installation des Dépendances

```bash
npm install
```

Cela installe:

- Next.js 14
- React 18
- Supabase client
- Vitest
- Et 50+ autres dépendances

**Durée estimée**: 2-5 minutes

### 3. Configuration Supabase

#### Créer un projet Supabase

1. Allez à [https://supabase.com](https://supabase.com)
2. Cliquez "New Project"
3. Sélectionnez région (ex: `eu-west-1` pour France)
4. Créez le projet (~2 minutes)
5. Attendez l'initialisation

#### Obtenir les credentials

```
Dashboard > Settings > API
- Trouvez: SUPABASE_URL, SUPABASE_ANON_KEY
```

#### Appliquer les migrations

```bash
# Option 1: Via Supabase UI
# Dashboard > SQL Editor > New Query
# Copier/coller contenu de supabase/migrations/20240423_000_initial_schema.sql

# Option 2: Via CLI (si installé)
supabase db push
```

### 4. Configuration des Variables d'Environnement

```bash
# Créer le fichier .env.local
cp .env.example .env.local
```

**Éditer `.env.local`** et ajouter vos credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# OpenAI
OPENAI_API_KEY=sk-...

# Amadeus (Test API)
AMADEUS_CLIENT_ID=your_client_id
AMADEUS_CLIENT_SECRET=your_client_secret

# Pexels
PEXELS_API_KEY=your_pexels_key
```

**IMPORTANT !!!** :

- Ne jamais commiter `.env.local`
- Git ignore automatically (.gitignore existe)
- Variables publiques: `NEXT_PUBLIC_`* sont exposées au client

### 5. Vérification des Credentials

```bash
# Test Supabase
npx node -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
sb.auth.getUser().then(r => console.log(r)).catch(e => console.error(e));
"
```

## Démarrage Local

### Development Server

```bash
npm run dev
```

Output:

```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
  - Environments: .env.local
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans le navigateur.

### Build Production

```bash
npm run build
```

Output:

```
  ✓ Compiled successfully
  ✓ Linting and checking validity of types
  ✓ Collecting page data
  ✓ Generating static pages (15/15)
  ✓ Finalizing page optimization
✓ Build complete
```

### Start Production Server

```bash
npm start
```

## Commandes Utiles

### Développement

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Production build
npm start            # Start prod server
npm run lint         # ESLint check + fix
npx tsc --noEmit    # TypeScript check (no emit)
npm run test:unit   # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright)
```

### Maintenance

```bash
npm update           # Update all dependencies
npm audit            # Security audit
npm audit fix        # Auto-fix security issues
npm prune            # Remove unused packages
```

## Vérification Post-Installation

Vérifiez que tout fonctionne:

```bash
# 1. Lint check (0 erreurs attendus)
npm run lint

# 2. TypeScript (0 erreurs attendus)
npx tsc --noEmit

# 3. Unit tests (56 tests passants)
npm run test:unit

# 4. Build (succeed)
npm run build

# 5. Dev server
npm run dev
# Attendez "ready - started server" message
# Ouvrez http://localhost:3000
```

## Sécurité

### .env.local

- ✅ Créez AVANT de commiter
- ✅ Ajouté à .gitignore
- ✅ Jamais commitez credentials
- ✅ Rotate keys régulièrement

### Secrets Github

Pour CI/CD et déploiement:

```
Repository Settings > Secrets and variables > Actions
- Add SUPABASE_URL
- Add SUPABASE_ANON_KEY
- Add OPENAI_API_KEY
- etc.
```

## Troubleshooting

### "Module not found"

```bash
# Nettoyez et réinstallez
rm -rf node_modules package-lock.json
npm install
```

### "Cannot find Supabase"

```bash
# Vérifiez .env.local existe
ls -la .env.local

# Vérifiez variables
cat .env.local | grep SUPABASE
```

### "Port 3000 already in use"

```bash
# Tue le processus sur port 3000
lsof -ti:3000 | xargs kill -9

# Ou utilise port différent
npm run dev -- -p 3001
```

### Tests échouent

```bash
# Nettoyez le cache Vitest
npm run test:unit -- --clearCache
```

### Build échoue

```bash
# Vérifiez TypeScript
npx tsc --noEmit

# Vérifiez ESLint
npm run lint -- --fix

# Nettoyez .next
rm -rf .next && npm run build
```

