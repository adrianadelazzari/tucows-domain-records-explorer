# Domain Records Explorer — Implementation Plan

## Stack & Constraints

- Vue 3, `<script setup>`, Composition API, Vite
- Plain CSS only — no Tailwind, Bootstrap, or UI frameworks
- Minimal dependencies — no Pinia, no Vue Router

---

## File Structure

```
src/
├── main.ts
├── App.vue
├── api/
│   └── domains.ts                 # Mock API module
├── types/
│   └── domain.ts                  # Domain interface + DomainStatus type
├── composables/
│   └── useDomains.ts              # Fetch, filter, and sort state
├── components/
│   ├── DomainTable.vue            # Table with sortable columns
│   ├── DomainTableRow.vue         # Single row + expiry highlight
│   ├── DomainFilters.vue          # Search + dropdowns + clear
│   ├── DomainDetail.vue           # Slide-in detail panel
│   ├── StatusBadge.vue            # Coloured status pill
│   ├── LoadingSpinner.vue         # CSS animated spinner
│   └── EmptyState.vue             # No-results / error / empty states
├── assets/
│   └── styles/
│       ├── base.css               # Reset + CSS custom properties
│       └── utilities.css          # sr-only, flex helpers
└── __tests__/
    ├── useDomains.spec.ts
    ├── DomainTable.spec.ts
    ├── DomainFilters.spec.ts
    ├── DomainDetail.spec.ts
    └── StatusBadge.spec.ts

cypress/e2e/
├── example.cy.ts                  # Repurposed smoke test
└── domain-explorer.cy.ts          # Main E2E flow

README.md
AI_USAGE.md
```

---

## Phase 1 — Foundation

### Step 1: `src/types/domain.ts`

Define the `Domain` interface and `DomainStatus` union type. Every subsequent file imports from here.

```ts
export type DomainStatus = 'active' | 'clientHold' | 'pendingTransfer'

export interface Domain {
  domain: string
  registrar: string
  status: DomainStatus
  created_at: string   // ISO date string
  expires_at: string
  updated_at: string
  nameservers: string[]
}
```

### Step 2: `src/api/domains.ts`

Mock API with 25+ realistic records spanning:
- Registrars: Tucows, Namecheap, GoDaddy, Cloudflare Registrar, Porkbun
- TLDs: .com, .net, .org, .io, .ca, .co
- Status mix: ~15 active, 5 clientHold, 5 pendingTransfer
- Expiry range: some past (expired), some near (within 30 days), most future

Behaviour:
- Simulates 400–1200ms random network delay
- `VITE_API_FAIL=true` env var triggers a rejected promise (for error state testing)
- Returns `structuredClone` of the data so tests can mutate safely

```ts
export async function fetchDomains(): Promise<Domain[]>
```

### Step 3: `src/composables/useDomains.ts`

All reactive state. Write `useDomains.spec.ts` immediately after — this is the highest-value test.

State:
```ts
const domains = ref<Domain[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Filter refs
const searchQuery = ref('')
const selectedRegistrar = ref('')
const selectedStatus = ref<DomainStatus | ''>('')

// Derived
const filteredDomains = computed(() => /* apply all three filters */)
const registrarOptions = computed(() => /* unique registrars from domains.value */)
```

Actions: `loadDomains()`, `clearFilters()`

Instantiated once in `App.vue`; props/events flow down. No `provide/inject` needed.

---

## Phase 2 — Core UI Components

### Step 4: Global CSS

`src/assets/styles/base.css` imported once in `main.ts`. Defines:
- Minimal reset (`box-sizing`, margins)
- CSS custom properties on `:root`:
  ```css
  --color-bg, --color-surface, --color-border
  --color-text, --color-text-muted
  --color-primary
  --color-active, --color-hold, --color-pending, --color-warning
  --radius-sm, --radius-md
  --shadow-panel
  ```

### Step 5: `StatusBadge.vue`

Colored pill for each status value. Maps to human-readable labels:
- `active` → "Active"
- `clientHold` → "Client Hold"
- `pendingTransfer` → "Pending Transfer"

Fully self-contained scoped styles referencing CSS custom properties.

### Step 6: `LoadingSpinner.vue` + `EmptyState.vue`

`EmptyState` accepts a `type` prop: `'empty' | 'error' | 'no-results'`. The `error` variant emits a `retry` event bound to `loadDomains()` in `App.vue`.

### Step 7: `DomainTableRow.vue`

- Props: `domain: Domain`
- Emits: `select`
- Uses `StatusBadge`
- Highlights rows where `expires_at` is within 30 days or already past

### Step 8: `DomainTable.vue`

- Props: `domains: Domain[]`
- Emits: `select(domain: Domain)`
- Owns sort state internally (`sortKey`, `sortDir`) — display concern, not shared
- Sortable columns: Domain, Registrar, Status, Created, Expires, Updated
- Table wrapped in `<div class="table-scroll-wrapper">` with `overflow-x: auto` for mobile

### Step 9: `DomainFilters.vue`

Controlled component — no internal state. Inputs: text search, registrar dropdown, status dropdown, Clear button.

Uses Vue 3.4+ `defineModel()` for clean two-way binding or separate props + emits.

---

## Phase 3 — Detail Panel & App Assembly

### Step 10: `DomainDetail.vue`

Right-side slide-in panel (better than modal for data-dense records).

- Props: `domain: Domain | null`, `open: boolean`
- Emits: `close`
- `<Teleport to="body">` to escape overflow clipping
- `<Transition name="slide-fade">` for animation
- Focus trapping when open
- Escape key closes panel (`onKeydown` listener active only when `open`)
- Displays all fields; nameservers as `<ul>`; expiry with colour-coded warning if near/past
- Full-width on mobile via `@media (max-width: 640px)`

### Step 11: `App.vue` Assembly

Wire everything together:
- Call `useDomains()` — single source of truth
- Bind `DomainFilters` to filter refs
- `DomainTable` `select` event → `selectedDomain: Ref<Domain | null>`
- Pass `selectedDomain` to `DomainDetail`
- Conditional rendering: `LoadingSpinner` / `EmptyState` / `DomainTable`

---

## Phase 4 — Tests, Accessibility, Docs

### Step 12: E2E Tests (`cypress/e2e/domain-explorer.cy.ts`)

Scenarios:
1. App loads, table renders with expected rows
2. Text search filters rows
3. Status dropdown filters rows
4. Registrar dropdown filters rows
5. Combined filters (intersection behaviour)
6. Clear filters restores all rows
7. Click row → detail panel opens with correct domain name
8. Escape / close button → panel closes
9. Empty state shown when no results match
10. Error state shown when `VITE_API_FAIL=true`

### Step 13: Accessibility Pass

- `aria-label` on all filter inputs
- `aria-sort` on sortable table headers
- `role="status"` on loading region
- `aria-live="polite"` on empty state
- Full keyboard navigation: Tab through filters → Enter on row opens detail → Escape closes

### Step 14: `README.md`

Required sections: Setup, Approach, Component Structure, Assumptions, Tradeoffs, Backend API Proposal, Future Improvements.

Backend API Proposal to include:
- `GET /api/domains` with query params: `search`, `registrar`, `status`, `sort`, `order`, `page`, `per_page`
- `GET /api/domains/:domain`
- Response envelope: `{ data: Domain[], meta: { total, page, per_page } }`
- Error responses: `{ error: { code, message } }`

### Step 15: `AI_USAGE.md`

---

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Composables only | Single consumer view; no cross-route sharing needed |
| Detail display | Side panel | Better UX for data-dense records vs. modal |
| CSS approach | Scoped + CSS custom properties | Satisfies plain CSS constraint; tokens give consistency |
| Sort state | Local to `DomainTable` | Display concern, not shared with other components |
| Filter state | In composable | Drives derived `filteredDomains`, consumed by multiple components |
| Mock error trigger | `VITE_API_FAIL` env var | Testable in E2E without code changes |
| No Vue Router | Single view SPA | Avoids dependency; trivial to add later without refactoring |
| No Pinia | Composables | One view, one consumer; Pinia pays off at multi-route scale |
