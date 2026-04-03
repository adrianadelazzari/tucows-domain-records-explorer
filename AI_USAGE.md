# AI Usage

This document describes how AI tooling was used during the development of the Domain Records Explorer.

---

## Which AI Tools Were Used

- **Claude Code** (Anthropic, model: claude-sonnet-4-6) — primary AI assistant used throughout the entire development workflow via the CLI and desktop app

---

## What Tasks They Assisted With

### Planning

- Analysed the requirements PDF and produced a structured 4-phase, 15-step implementation plan (`PLAN.md`)
- Recommended architectural decisions: composables over Pinia, modal over side panel, plain CSS with custom properties, MSW for API mocking

### Implementation

- Generated all source files in implementation order: types, mock API data, composable, CSS design tokens, all Vue components, MSW handlers, unit tests, E2E tests, and documentation
- Created 29 mock domain records covering varied registrars, statuses, expiry dates, and edge cases (expired, expiring soon, null registrar, null dates, null nameservers, all-null record)
- `useDomains.ts` — reactive state, computed filtering across three axes, loading/error lifecycle, `clearFilters`
- All Vue components: `StatusBadge`, `LoadingSpinner`, `EmptyState`, `DomainTable`, `DomainFilters`, `DomainDetail` (modal with focus trap and Escape key)
- `App.vue` — wired all components to the composable with `v-model` bindings and conditional rendering
- MSW integration: `handlers.ts`, `browser.ts` (dev), `server.ts` (Vitest node) — replaced the original `VITE_API_FAIL` env-var simulation pattern

### Testing

- Unit test suites for all components, the composable, and the service layer (Vitest + `@vue/test-utils`)
- `withSetup` helper pattern for testing composables that use `onMounted`
- `domainService.spec.ts` rewritten to use the MSW node server with per-test handler overrides for error scenarios
- Cypress E2E tests covering initial load, all filter types, sort, modal open/close interactions, and empty state

### Accessibility

- `scope="col"`, `aria-sort`, keyboard navigation (`tabindex`, Enter/Space) on sortable table headers
- `role="dialog"` and `aria-label` on the modal
- `role="alert"` on the error empty state; `aria-live="polite"` on other async states
- Screen-reader-only live region in `App.vue` announcing the filtered result count

### Documentation

- `PLAN.md`, `README.md`, `CLAUDE.md`, `PROMPTS.md`, `AI_USAGE.md`

---

## What Was Modified or Corrected

### User-directed changes

- **`DomainDetail.vue`**: initially implemented as a right-side slide-in panel; redesigned as a centered modal after user request. Transitions, class names, and tests updated accordingly.
- **`src/types/domain.ts`**: the user updated most fields to `string | null | undefined` after the initial version had all fields required. All subsequent components and tests were written against the updated type.
- **UX/UI refinements**: Clear Filters button restyled with a primary-color outline and hover fill; modal layout alignment adjusted.

### Architecture change

- **MSW replacing `VITE_API_FAIL`**: the original error-simulation approach used a `VITE_API_FAIL` env var checked at runtime in `domainService.ts`. Replaced with MSW so `fetchDomains` is a real `fetch` call with no simulation logic, and network behaviour is controlled entirely through mock handlers in tests and the dev server. `main.ts` was initially changed to start the MSW worker unconditionally (removing the `DEV` guard) as a failed attempt to fix the Cypress timing issue; reverted once `cy.intercept` was adopted for E2E tests.

---

## How I Validated AI Output

### Code review

I reviewed all AI-generated code to ensure it aligned with Vue 3 Composition API best practices, project requirements, and type safety. I refactored parts of the code where needed to improve clarity, structure, and maintainability.

### Manual testing

I tested all core user flows in the browser, including:

- Filtering by domain name, registrar, and status
- Sorting table columns
- Opening and closing the domain details modal
- Handling empty states and edge cases

### State validation

I verified that loading, error, and empty states behaved correctly under different conditions (e.g. simulated API failure using environment variables).

### Unit and component testing

I added tests for key logic (such as filtering and sorting) and core UI interactions to ensure correctness.

### Edge case verification

I validated behaviour with incomplete or missing data (e.g. missing dates, empty nameservers) to ensure graceful handling.

### Iteration and refinement

AI-generated code was often used as a starting point and then refined to better match the intended UX, accessibility requirements, and code quality standards.
