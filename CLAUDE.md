# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (hot reload)
npm run build        # Type-check + build production bundle
npm run preview      # Preview production build at localhost:4173
npm run type-check   # Run vue-tsc type checking only

npm run test:unit           # Run unit tests (Vitest, watch mode)
npm run test:e2e:dev        # Run Cypress E2E tests interactively against dev server
npm run test:e2e            # Run Cypress E2E tests headless against production build

npm run lint         # Run oxlint then eslint (both with --fix)
npm run format       # Format src/ with Prettier
```

To run a single unit test file:
```bash
npx vitest run src/__tests__/App.spec.ts
```

## Stack

- **Vue 3** with `<script setup>` Composition API and TypeScript
- **Vite** for build/dev server; path alias `@/` maps to `./src/`
- **Vitest** + `@vue/test-utils` for unit tests (jsdom environment)
- **Cypress** for E2E tests (base URL: `http://localhost:4173`)
- **Two linters**: Oxlint runs first (fast Rust linter), then ESLint; both auto-fix
- **Prettier**: `semi: false`, `singleQuote: true`, `printWidth: 100`

## Architecture

The project is a Vue 3 SPA scaffolded from the official Vite template. Currently minimal — `src/App.vue` is the root component and the domain records explorer functionality is to be built out.

- `src/main.ts` — creates the Vue app and mounts it to `#app`
- `src/App.vue` — root component (currently placeholder)
- `src/__tests__/` — unit tests co-located in src
- `cypress/e2e/` — E2E tests, run against the preview server on port 4173

TypeScript is configured in three separate `tsconfig` files: `tsconfig.app.json` (app source), `tsconfig.node.json` (build config files), and `tsconfig.vitest.json` (test files). `noUncheckedIndexedAccess` is enabled in the app config.

The requirements specification lives at `requirements/Frontend_Engineering_Take-Home_Exercise.pdf`.

## Rules

- **Always read the requirements** from `requirements/Frontend_Engineering_Take-Home_Exercise.pdf` before starting any implementation work.
- **Log every prompt** — after completing each user request, append a single line to `PROMPTS.md` summarizing what was asked and what was done. Format: `- [YYYY-MM-DD] <summary>`.
