# CI/CD Pipeline

## Overview

Driftly utilise **GitHub Actions** pour CI/CD automatisé sur chaque push et PR.

## Workflow: .github/workflows/ci.yml

### Configuration

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: TypeScript
        run: npx tsc --noEmit
      
      - name: Unit Tests
        run: npm run test:unit
      
      - name: Build
        run: npm run build
```

---

## Pipeline Steps

### 1. Checkout Code

- Récupère le code source
- Prépare l'environment

### 2. Setup Node.js 20

- **Important**: Force Node 20 (obligatoire)
- Cache npm pour speed

### 3. npm ci

- "Clean install"
- Lock file versions exactes

### 4. Lint (`npm run lint`)

- ESLint check
- **Status**: Pass = 0 errors
- **Fail**: 1+ error = pipeline fails

### 5. TypeScript (`npx tsc --noEmit`)

- Type checking strict
- **Status**: Pass = 0 errors
- **Fail**: Type error = pipeline fails

### 6. Unit Tests (`npm run test:unit`)

- Vitest runner
- **Status**: Pass = 56 tests
- **Fail**: 1+ failing = pipeline fails

### 7. Build (`npm run build`)

- Production build
- **Status**:  Pass = ./out generated
- **Fail**: Build error = pipeline fails

## Status Indicators

### On GitHub PR

- All checks passed
  - Green checkmark
  - Safe to merge
-  Check failed
  - Red X
  - Details visible
  - Must fix before merge

### On Commit

- Green - All passing
- Red - Failure
- Yellow - In progress

## Common Failures

### Lint Error

```
Error: src/components/example.tsx
  ESLint error on line 10
  
Fix: npm run lint -- --fix
```

### TypeScript Error

```
Error: src/lib/service.ts(line 25)
  Type 'string | undefined' is not assignable to 'string'

Fix: Add type or null check
```

### Test Failure

```
Error: src/tests/unit/example.test.ts
  Expect 56 tests, got 55

Fix: Check which test failed, run npm run test:unit
```

### Build Error

```
Error: Failed to compile
  Module not found: 'react'

Fix: npm install && npm run build
```

## Local Development

### Before Pushing

Always run locally:

```bash
npm run lint        # 0 errors
npx tsc --noEmit   # 0 errors
npm run test:unit  # all pass
npm run build      # success
```

### Pre-commit Hook (Recommended)

```bash
# Install husky
npm install husky --save-dev
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npx tsc --noEmit"
```

## Deployment Integration

### Post-Build

Once CI passes:

1. **GitHub**: PR ready for merge
2. **Vercel**: Auto-deploys on merge to main
3. **Production**: Live within 2-3 minutes

