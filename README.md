# Domain Records Explorer

An internal tool for domain operations teams to search, filter, and inspect domain registration records.

---

## Setup

```sh
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start development server with hot reload       |
| `npm run build`        | Type-check and build for production            |
| `npm run preview`      | Preview production build at port 4173          |
| `npm run test:unit`    | Run unit tests (Vitest)                        |
| `npm run test:e2e:dev` | Run Cypress E2E tests against dev server       |
| `npm run test:e2e`     | Run Cypress E2E tests against production build |
| `npm run lint`         | Lint with Oxlint then ESLint (both auto-fix)   |
| `npm run format`       | Format source files with Prettier              |

---

## Approach

The application is a single-view Vue 3 SPA. All domain data is loaded once on mount from a mock API, filtered client-side in a composable, and rendered in a sortable table. Clicking a row opens a modal with full record details.

State lives in a single `useDomains` composable instantiated in `App.vue`. Filter refs are passed down to `DomainFilters` via `v-model`; the `filteredDomains` computed ref flows down to `DomainTable`.

The mock API is powered by [Mock Service Worker](https://mswjs.io/) (MSW). In development, a service worker intercepts `GET /api/v1/domains` and returns the fixture data with a simulated 400–1200ms delay. In tests, the same handlers run in Node via `msw/node`, so `domainService.ts` uses a real `fetch` call with no simulation logic of its own.

---

## Component Structure

```
App.vue                        — layout shell, owns useDomains(), selected domain state
├── DomainFilters.vue          — controlled filter bar (search, registrar, status, clear)
├── LoadingSpinner.vue         — shown while fetch is in flight
├── EmptyState.vue             — handles empty / no-results / error variants
├── DomainTable.vue            — sortable table, owns sort state internally
│   └── DomainTableRow.vue     — single row, expiry highlighting, emits select
│       └── StatusBadge.vue    — coloured status pill
└── DomainDetail.vue           — modal with full record details (Teleport to body)
    └── StatusBadge.vue
```

**Data flow:**

- `useDomains` → `App` → props down / events up
- Filters: `App` owns refs → bound to `DomainFilters` via `v-model`
- Selection: `DomainTable` emits `select` → `App` sets `selectedDomain` → passed to `DomainDetail`
- Sort state is local to `DomainTable` (display concern, not shared)

---

## Assumptions

- **Single-page, no routing.** The exercise describes one view. Vue Router was omitted to keep dependencies minimal; adding it later requires no refactoring.
- **Client-side filtering.** The exercise explicitly permits this. See _Backend API Proposal_ for how server-side filtering would work at scale.
- **Mock data is representative.** The 29 fixture records cover all status values, multiple registrars, varied expiry dates (past, near, future), and nullable optional fields — including deliberately incomplete records (null registrar, null dates, null nameservers) to exercise graceful degradation.
- **`registrar`, `created_at`, `expires_at`, `updated_at`, `nameservers` are optional/nullable** in the data model to reflect realistic incomplete records from upstream systems. The UI renders `—` for missing values.
- **No authentication.** The exercise describes an internal tool; auth is out of scope.

---

## Tradeoffs

**Composables over Pinia.** One view, one consumer. Pinia pays off when multiple disconnected components or routes need shared reactive state. A composable is just as testable and avoids an extra dependency. The migration path is straightforward if the app grows.

**Modal over side panel.** A centered modal focuses attention on a single record without requiring the user to mentally track a panel anchored to the viewport edge. For a data-dense record with nameservers, the modal provides more vertical space on narrow screens.

**Plain CSS with custom properties over a framework.** Satisfies the constraint, avoids unused rules, and gives full control over the design. CSS custom properties on `:root` act as a design token layer, keeping colours and spacing consistent without a framework's override patterns.

**Sort state local to `DomainTable`.** Sorting is a display concern — no other component needs to know the current sort column or direction. Keeping it local reduces the composable's surface area.

**MSW for API mocking.** Using Mock Service Worker means `domainService.ts` is a plain `fetch` call — no simulation logic, no env-var flags. The same handlers work in both the browser (service worker) and Vitest (Node interceptor), and Cypress uses `cy.intercept` with a fixture for full isolation without a service worker.

---

## Backend API Proposal

The current implementation filters client-side against a static mock. For a production dataset of thousands of domains, filtering and pagination should move to the backend.

### Endpoints

#### List domains

```
GET /api/v1/domains
```

**Query parameters:**

| Parameter   | Type                                                                                | Description                               |
| ----------- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| `search`    | `string`                                                                            | Substring match on `domain` field         |
| `registrar` | `string`                                                                            | Exact match                               |
| `status`    | `active` \| `clientHold` \| `pendingTransfer`                                       | Exact match                               |
| `sort`      | `domain` \| `registrar` \| `status` \| `created_at` \| `expires_at` \| `updated_at` | Sort field (default: `domain`)            |
| `order`     | `asc` \| `desc`                                                                     | Sort direction (default: `asc`)           |
| `page`      | `integer`                                                                           | 1-based page number (default: `1`)        |
| `per_page`  | `integer`                                                                           | Results per page, max 100 (default: `25`) |

**Response:**

```json
{
  "data": [
    {
      "domain": "example.com",
      "registrar": "Tucows",
      "status": "active",
      "created_at": "2015-03-12T00:00:00Z",
      "expires_at": "2027-03-12T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z",
      "nameservers": ["ns1.example.com", "ns2.example.com"]
    }
  ],
  "meta": {
    "total": 4821,
    "page": 1,
    "per_page": 25,
    "total_pages": 193
  }
}
```

#### Get single domain

```
GET /api/v1/domains/:domain
```

**Response:** the domain object directly, or a 404 error.

### Error responses

All errors follow a consistent envelope:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Domain 'example.com' not found."
  }
}
```

| HTTP status | `code`           | Meaning                                       |
| ----------- | ---------------- | --------------------------------------------- |
| `400`       | `INVALID_PARAMS` | Unrecognised query parameter or invalid value |
| `404`       | `NOT_FOUND`      | Domain does not exist                         |
| `500`       | `INTERNAL_ERROR` | Unexpected server error                       |

### Filtering strategy at scale

- `search` on `domain` uses a database index (prefix or full-text depending on requirements). A `LIKE 'query%'` index is sufficient for prefix search; `pg_trgm` or a search service handles arbitrary substring.
- `registrar` and `status` use equality indexes — low cardinality, very fast.
- Combining filters: `WHERE` clause composed server-side from whichever params are present.
- Pagination: keyset (cursor) pagination preferred over `OFFSET` for large datasets, with `OFFSET`/`LIMIT` as a simpler fallback for moderate sizes.

---

## Future Improvements

- **Pagination.** The current implementation loads all records at once. Add page controls or infinite scroll once the backend API supports it.
- **URL-reflected filters.** Sync filter state to query string parameters so filtered views are bookmarkable and shareable.
- **Bulk actions.** Allow selecting multiple domains to perform batch operations (e.g. flag for review).
- **Expiry dashboard.** A summary view showing counts of expired, expiring-soon, and healthy domains, with quick-filter links.
- **Dark mode.** CSS custom properties are already in place; a `prefers-color-scheme` media query or a toggle would be straightforward to add.
- **Real backend integration.** Point `domainService.ts` at a real API base URL, add request cancellation on filter change (`AbortController`), and introduce per-page loading states for paginated results.
- **Pinia migration.** If the app grows to multiple views (e.g. a registrar detail page, an expiry report), migrate `useDomains` state to a Pinia store for cross-route sharing.
