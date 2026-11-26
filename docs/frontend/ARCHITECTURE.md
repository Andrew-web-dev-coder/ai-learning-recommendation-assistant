# Frontend architecture

FE-01 starts from `7825b53f14fe916b5f1e0992fc97c2afba2650c2`, the merge of the baseline audit. The frontend presents the existing Python and Lithuanian diagnostics as a routed SPA. Express and PostgreSQL still own classification, recommendation generation, and persistence. [Baseline audit](BASELINE_AUDIT.md) · [API architecture](../api/ARCHITECTURE.md)

## Stack and module boundaries

React 19 keeps the existing rendering model and component ecosystem. TypeScript makes route parameters, assessment variants and decisions explicit. Vite bundles the existing SPA and emits separate page chunks from dynamic imports. React Router 8.5.3 is compatible with the project's React 19 and Node 24 setup and provides URL matching, history navigation, nested layouts and lazy route modules. Existing CSS styles the shared shell, panels and native controls. Redux Toolkit centralizes the workflow and RTK Query owns request lifecycles and shared catalog caches. React Redux provides typed store access. [State management](STATE_MANAGEMENT.md) [Dependencies](../../package.json) · [Router entry](../../src/main.tsx) · [Vite configuration](../../vite.config.ts)

```mermaid
flowchart TD
    Main["main.tsx · React root, Provider and browser router"] --> App["app · routes, shell, store, styles"]
    App --> Pages["pages · catalog, course, diagnostic, result, not found"]
    App --> Learning["features/learning · workflow, form, result UI and RTK Query"]
    Pages --> Learning
    Pages --> Shared["shared · status UI, typed hooks and ID guards"]
    App --> Shared
    Learning --> Shared
    Learning --> API["Express REST API"]
    Legacy["src/data · archived JavaScript module and tests"]
```

- `app/` composes the store, route tree and shell. The shell provides the header, catalog navigation, main outlet, loading feedback and footer.
- `pages/` binds routes to catalog, course, diagnostic and result content, with back links and recovery states.
- `features/learning/` contains the RTK Query service, workflow slice and thunks, answer form and assessment result. The nested diagnostic outlet supplies validated route IDs.
- `shared/` provides domain-independent route ID guards and reusable status UI and typed store hooks. `src/data/` remains a standalone historical module and test suite.

Imports run from app to pages or features, and from pages to features or shared. Features can use shared code. The shared Redux hooks import store types only. Runtime dependencies point down the layers. Pages compose features without importing other pages, and the feature layer does not depend on app composition. [Route tree](../../src/app/routes.tsx) · [App shell](../../src/app/AppShell.tsx) · [Learning feature](../../src/features/learning) · [Shared components and guards](../../src/shared)

## Routes and navigation

| Path | Screen and behavior |
| --- | --- |
| `/` | History-replacing redirect to the catalog. |
| `/courses` | Course links from the courses collection. |
| `/courses/:courseId` | Course title, ordered topics, and links to active exercises with prompts. |
| `/courses/:courseId/exercises/:exerciseId` | Selected exercise from the course's active collection, with an answer form and a link back to the course. Uncertainty stays on the form with the draft intact. |
| `/courses/:courseId/exercises/:exerciseId/result` | Confirmed correct or incorrect result for the current route session. An incorrect result can show a recommendation and its decision controls. Without a session result, link back to the diagnostic. |
| `*` | Not Found screen with a link to the catalog. |

```mermaid
flowchart TD
    Root["Root"] -->|Replace| Catalog["Course catalog"]
    Catalog --> Course["Course topics and active exercises"]
    Course --> Diagnostic["Diagnostic form"]
    Diagnostic -->|Confirmed assessment| Result["Assessment result"]
    Diagnostic -->|Uncertain or recoverable failure| Diagnostic
    Result -->|Back link or missing session| Diagnostic
    Result -->|Accept or reject recommendation| Decision["Show confirmed decision"]
    Unknown["Unmatched URL"] --> Missing["Not Found"]
    Missing --> Catalog
```

Path IDs are positive decimal strings within PostgreSQL BIGINT range. The diagnostic form checks that its exercise belongs to the active collection for the route's course. The POST boundary further limits the exercise ID to a positive safe JavaScript integer, per contract. The app can open a catalog, course or diagnostic URL directly. A result refresh or direct entry in a fresh tab starts without in-memory state and exposes recovery without writes. [ID guards](../../src/shared/ids.ts) · [Course page](../../src/pages/CoursePage.tsx) · [Diagnostic page](../../src/pages/DiagnosticPage.tsx) · [Result page](../../src/pages/ResultPage.tsx)

### Hosting and lazy loading

Vite dev and preview serve the SPA at local routes. A production static host must serve existing assets normally and fall back to `index.html` for frontend navigation requests. Missing assets should retain their HTTP error, and any reverse-proxied `/api/` traffic must bypass that fallback. The browser router assumes the app is served at the origin root. The catch-all renders a client-side Not Found screen after the HTML document loads.

The build defaults to `http://localhost:3001` for API calls. Set public build-time `VITE_API_URL` for another origin. An empty value uses same-origin `/api/`. The existing backend CORS configuration allows `http://localhost:5173`. A shared deployment would need a compatible origin or proxy arrangement. Frontend environment variables are public.

React Router's `lazy` imports each page module independently. The root fallback announces the first page load, and the shell announces lazy navigation while the current page remains visible. Data loading uses a separate status at each screen. RTK Query shares catalog data across subscribed routes and revalidates according to the cache policy. [Dynamic imports](../../src/app/routes.tsx) · [Loading feedback](../../src/app/AppShell.tsx) · [RTK Query service](../../src/features/learning/api.ts)

## State and API interaction

```mermaid
flowchart LR
    URL["Router · course and exercise IDs"] --> Read["Pages · RTK Query subscriptions"]
    URL --> Session["Workflow entry · matching course and exercise"]
    Form["Local answer draft"] --> Workflow["Scoped write thunks"]
    Result["Result page"] --> Workflow
    Read --> Transport["learningApi · cache and typed transport"]
    Workflow --> Transport
    Transport <-->|"Existing REST operations"| Express["Express"]
    Express <--> DB["PostgreSQL"]
    Workflow -->|Apply response in originating scope| Session
    Session --> Result
```

URL params own selection and the form owns its draft. Redux Toolkit keeps the latest outcome per course/exercise in memory across route navigation within the tab. RTK Query deduplicates catalog requests by operation and course ID. Refresh clears the tab's result state. Late writes can settle their originating entry without navigating away from the user's new page. Decision conflicts and ambiguous outcomes have explicit recovery without automatically repeating a write. [State and API lifecycle](STATE_MANAGEMENT.md) · [Workflow slice](../../src/features/learning/workflowSlice.ts) · [OpenAPI](../api/openapi.json)

## Rubric evidence and follow-up

| Baseline criteria | Architecture evidence |
| --- | --- |
| D1, D2, D4, D5 | Current module, state and navigation diagrams and stack rationale in this document. |
| A2, A3, A5 | App/pages/features/shared boundaries, four meaningful functional routes and catch-all. [Route tree](../../src/app/routes.tsx) |
| A4, A6, A7, A8, A9 | Explicit route and in-memory state ownership, actual API integration, typed payloads, centralized RTK Query requests and pending/error feedback. [Session](../../src/features/learning/DiagnosticSession.tsx) · [API module](../../src/features/learning/api.ts) · [Workflow and cache evidence](STATE_MANAGEMENT.md#rubric-to-evidence-mapping) |
| I2, I3, I4, I6, I7 | Shared shell and status primitives, feature components, controlled answer form, and mapped course/topic/exercise lists. [Shell](../../src/app/AppShell.tsx) · [Shared status](../../src/shared/Status.tsx) · [Course lists](../../src/pages/CoursePage.tsx) · [Form](../../src/features/learning/AnswerForm.tsx) |
| E2, E4 | Visible pending, uncertainty and failure messages at the affected screen or action. [Form](../../src/features/learning/AnswerForm.tsx) · [Result](../../src/features/learning/AssessmentResult.tsx) |
| Advanced Architecture, Performance | Lazy page modules and production chunk evidence. Browser timing and performance budgets remain to be measured. [Route tree](../../src/app/routes.tsx) |
| Testing | Vitest checks real route matching, the shared session route, catch-all and ID boundaries. Live browser smoke evidence is recorded below. [Route regression tests](../../src/app/routes.test.ts) |

FE-02 state-management evidence, current bundle sizes, and the FE-03 handoff are documented separately. [FE-02 verification](STATE_MANAGEMENT.md#observed-results)

## FE-01 verification record

| Production asset | Raw kB | Gzip kB |
| --- | ---: | ---: |
| Entry JS | 322.51 | 101.99 |
| Catalog route | 0.61 | 0.35 |
| Course route | 1.34 | 0.61 |
| Diagnostic route | 2.48 | 1.20 |
| Result route | 1.78 | 0.74 |
| Not Found route | 0.25 | 0.20 |
| Shared session hook | 0.07 | 0.09 |
| Shared read hook | 0.39 | 0.27 |
| CSS | 1.28 | 0.65 |

Vite 8.3.3 emitted all four functional route chunks and a Not Found chunk. These are build output sizes. The entry bundle is larger than the FE-00 baseline. No browser timing or Lighthouse comparison was performed.

On 2026-11-26, Node 24.22.3 and npm 11.19.1 completed `npm ci`, `npm run lint`, `npm run test` and `npm run build`. Vitest passed 32 cases across three files, including 13 new route and ID cases. The pinned CI OpenAPI validator passed. The HTTP contract suite passed 20 tests against disposable PostgreSQL 17.12.

Headless Chromium 156 smoke checks used the production Vite preview, the existing Express service and synthetic seed data in disposable PostgreSQL. They exercised all four screens, the root redirect, unknown URLs, direct navigation, invalid and missing IDs, cross-course exercise rejection, Python uncertainty and revision, Python acceptance, Lithuanian rejection and a correct Lithuanian result. A result reload showed recovery with no new POST or PATCH. Delayed catalog, attempt and decision responses exposed loading states. An intercepted catalog network failure and HTML 500 write response surfaced readable errors, and the form preserved the failed draft. A late Python response stayed out of the Lithuanian route. A 375px diagnostic viewport smoke check detected no horizontal overflow. The browser run did not measure accessibility compliance or Lighthouse performance.

Mermaid parsed and rendered all three diagrams in Chromium. Local targets and referenced documentation anchors were checked against the checkout.
