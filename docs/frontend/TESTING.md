# FE-04 frontend testing

FE-04 starts at `1ef871307c79e33cda9d79a6b872107b0336f7b0`, the merge of PR #14. The starting history includes PR #13 at `fd3d977`, PR #12 at `a9caa88`, and PR #11 at `7825b53`. The rubric below uses the criteria recorded in FE-00. [Baseline audit](BASELINE_AUDIT.md) · [Architecture](ARCHITECTURE.md) · [State management](STATE_MANAGEMENT.md) · [UI requirements](UI_REQUIREMENTS.md)

## Test layers

| Layer | Responsibility and entry point |
| --- | --- |
| Unit | Vitest exercises route ID guards, catalog search, answer validation, transport error mapping, the deterministic classifier, and the archived JavaScript prototype. [Routes and IDs](../../src/app/routes.test.ts) · [Classifier](../../server/assessment.test.ts) |
| Component | Vitest renders catalog and result components to check semantic structure and feedback variants. [UI requirements tests](../../src/features/learning/uiRequirements.test.tsx) |
| Frontend integration | Vitest drives the real Redux store and RTK Query against controlled HTTP responses to check cache, selectors, scoped writes and response handling. [Learning integration tests](../../src/features/learning/learning.integration.test.ts) |
| HTTP contract | Node’s test runner checks OpenAPI response examples, live Express responses, and their database side effects. [Contract tests](../../tests/api.contract.mjs) · [API testing](../api/TESTING.md) |
| Browser E2E | Playwright drives the built React app, confirms user-facing behaviors in Chromium, and queries PostgreSQL for write assertions. [Config](../../playwright.config.mjs) · [E2E tests](../../tests/e2e) |

```mermaid
flowchart LR
    Runner["Playwright desktop and mobile projects"] --> Browser["Chromium browser context per test"]
    Browser --> Preview["Vite preview serves dist and proxies API requests"]
    Preview --> Express["Real Express instance per test"]
    Express --> Postgres["Fresh PostgreSQL database per test"]
    Runner --> Postgres
```

The E2E command builds once with a same-origin API URL. Each case starts Express using the existing contract harness, then serves the compiled assets through a loopback Vite preview server on an ephemeral port. The harness checks API readiness and database identity. It applies the same schema, indexes and reference seed as the contract suite, using a unique database for every test. Playwright creates a fresh browser context for each case. Test teardown stops preview and Express, closes connections, and drops the database. A disposable PostgreSQL service also makes it possible to discard residual test data after a forced process stop. The only learner and answers are synthetic. Correct and misconception inputs come from the published OpenAPI examples. [Browser fixtures](../../tests/e2e/fixtures.mjs) · [Database harness](../../tests/contract-environment.mjs) · [OpenAPI](../api/openapi.json)

## Run locally

Use Node 24, npm and Docker. Run the commands from the repository root in a POSIX shell. Use a dedicated local database service with permission to create and drop databases. The sample credentials are confined to the disposable loopback container.

```bash
npm ci
npx playwright install chromium

(
  set -eu
  container=$(docker run --rm -d -p 127.0.0.1::5432 \
    --health-cmd='pg_isready -h 127.0.0.1 -U e2e -d postgres' \
    --health-interval=1s --health-timeout=3s --health-retries=30 \
    -e POSTGRES_USER=e2e -e POSTGRES_PASSWORD=e2e_local_only postgres:17)
  trap 'docker stop "$container" >/dev/null' EXIT
  for attempt in $(seq 1 40); do
    status=$(docker inspect -f '{{.State.Health.Status}}' "$container")
    [ "$status" = healthy ] && break
    sleep 1
  done
  [ "$status" = healthy ] || { docker logs "$container"; exit 1; }
  port=$(docker port "$container" 5432/tcp)
  export CONTRACT_DB_URL="postgresql://e2e:e2e_local_only@127.0.0.1:${port##*:}/postgres"
  npm run test:contract
  npm run test:e2e
)
```

On Linux hosts missing browser libraries, install them with `npx playwright install --with-deps chromium` using an account with system package access.

Add `-- --project=mobile-chromium` to the E2E command to run just the mobile project. Use `-- --grep 'committed PATCH'` to select a scenario. Open the generated report with `npx playwright show-report` or open a retained trace with `npx playwright show-trace <trace.zip>`.

The `frontend-e2e` Actions job provisions PostgreSQL 17, installs the locked npm dependencies and Chromium with system packages, and runs both Chromium projects. On failure it uploads the HTML report and available error context, screenshots and traces for seven days. Browser failures fail the job. The independent `verify` and `http-contract` jobs continue to run. [CI workflow](../../.github/workflows/ci.yml)

## Browser scenarios

| Test name or group | Evidence |
| --- | --- |
| `PYTHON learner journey` and `LITHUANIAN learner journey` | Live catalog, course and exercise selection, whitespace validation and focus, uncertainty without a write, revised misconception, error category, topic and explanation, then a decision verified in PostgreSQL. Python accepts and Lithuanian rejects. Both make a separate correct attempt with no recommendation and check diagnostic viewport overflow. [Journey tests](../../tests/e2e/learning.e2e.mjs) |
| `catalog search and route navigation reuse fresh GET cache entries` | Search with case and surrounding whitespace, no matches, clear and refocus. Browser back/forward traverses catalog, course and diagnostic, with one catalog and one exercise collection request. [Navigation tests](../../tests/e2e/navigation.e2e.mjs) |
| `deep links, invalid IDs, and Not Found recover without writes` and `refresh expires in-memory result and recovers without replaying writes` | Direct course, exercise and result URLs, invalid IDs, real missing-course 404, cross-course exercise mismatch, catch-all, and result reload with diagnostic recovery and unchanged write counts. [Navigation tests](../../tests/e2e/navigation.e2e.mjs) |
| `delayed exercise read populates only its original course cache` and `delayed POST stays in its original route scope and blocks duplicate submits` | Browser-controlled release of a real read or POST after route navigation. Checks draft isolation, scoped cache or session recovery, pending form controls, and a single POST while pending. [Navigation tests](../../tests/e2e/navigation.e2e.mjs) · [Recovery tests](../../tests/e2e/recovery.e2e.mjs) |
| `injected catalog failure` and `injected diagnostic rejection` | Browser substitutes 500 and 400 responses for the first request. Catalog retry and manual answer correction go to live Express. Checks pending catalog state, safe messages, draft preservation, and write counts. [Recovery tests](../../tests/e2e/recovery.e2e.mjs) |
| `real PATCH conflict leaves the competing decision intact and closes controls` | A separate HTTP client commits the decision first. Browser PATCH receives an actual Express 409 and shows no confirmed winner. PostgreSQL retains the competing decision. [Recovery tests](../../tests/e2e/recovery.e2e.mjs) |
| `committed POST with a dropped response` and `committed PATCH with a dropped response` | Playwright forwards the original write and aborts delivery after Express returns success. SQL verifies the commit. UI shows an ambiguous outcome and closes the affected controls. Browser write counts stay at one, including during duplicate decision interaction or in-tab return to the affected diagnostic. [Recovery tests](../../tests/e2e/recovery.e2e.mjs) |

The injected paths simulate browser-observable failures. The contract suite separately exercises actual server errors and transaction rollbacks. PostgreSQL checks in the lost-response scenarios are test observations. The API exposes neither idempotency keys nor a read endpoint that can reconcile an attempt or a decision. In-tab write locks and confirmed outcomes expire on refresh. [API retry design](../api/API_DESIGN.md#idempotency-and-retry-safety) · [Workflow ownership](STATE_MANAGEMENT.md#writes-errors-and-recovery)

## Observed results

Local verification on 2026-11-26 used Node 24.22.3, npm 11.19.1, PostgreSQL 17.12 and Playwright 1.65.1 with its pinned Chromium. The documented Docker setup ran both the contract and browser suites.

| Suite | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Vitest | 76 | 0 | 0 |
| Live HTTP contract and schema examples | 20 | 0 | 0 |
| Playwright desktop Chromium | 12 | 0 | 0 |
| Playwright mobile Chromium | 12 | 0 | 0 |
| Playwright total | 24 | 0 | 0 |

`npm ci`, ESLint, the production TypeScript/Vite build and OpenAPI validation with swagger-cli 4.0.4 passed. Validation also passed for 117 local Markdown link targets and applicable anchors in this guide and README, the Mermaid diagram rendered to SVG, and `git diff --check` passed.

## FE-05 verification

Node 24.22.3, PostgreSQL 17.12 and Playwright 1.65.1 with its pinned Chromium verified the production-build test setup. The FE-04 tests and assertions remain in the suite.

| Suite | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Vitest | 77 | 0 | 0 |
| Live HTTP contract and schema examples | 20 | 0 | 0 |
| Playwright desktop Chromium | 18 | 0 | 0 |
| Playwright mobile Chromium | 18 | 0 | 0 |

This is 133 passing test executions, including all 120 baseline executions. Four Playwright tests performed 32 axe scans with zero violations. The other eight new browser executions cover theme persistence and restricted storage, keyboard focus and validation, and responsive reflow. [Verification methods and screenshots](ACCESSIBILITY.md) · [Design, tooling and bundle sizes](DESIGN_SYSTEM.md)

## Exact Stage 3 rubric mapping

The requirement column reproduces all 33 FE-00 criteria. Verified means the cited repository or test evidence demonstrates the stated requirement. Partially verified means a named portion still needs evidence or reviewer judgment. Unverified marks work without the required measurement. These are project evidence statuses. [FE-00 criteria](BASELINE_AUDIT.md#minimum-rubric-traceability)

| ID | Requirement | Status | Evidence and limits |
| --- | --- | --- | --- |
| D1 | Frontend architecture diagram covering modules, components, routes and state | Verified | [Architecture diagrams](ARCHITECTURE.md) and the [test topology](#test-layers). |
| D2 | Architecture approach description | Verified | [Architecture](ARCHITECTURE.md) and [state ownership](STATE_MANAGEMENT.md). |
| D3 | API schemas, methods and request/response examples | Verified | [OpenAPI](../api/openapi.json), [API walkthrough](../api/README.md) and [live contract tests](../../tests/api.contract.mjs). |
| D4 | User flow and navigation diagrams | Verified | [Route and navigation diagram](ARCHITECTURE.md#routes-and-navigation) and [browser navigation cases](../../tests/e2e/navigation.e2e.mjs). |
| D5 | Technology stack justification | Verified | [Frontend stack rationale](ARCHITECTURE.md#stack-and-module-boundaries) and [test-layer responsibilities](#test-layers). |
| A1 | Modern SPA framework | Verified | [React entry point](../../src/main.tsx), exercised through its built assets. |
| A2 | Components, pages, services and hooks separated | Verified | [Module boundaries](ARCHITECTURE.md#stack-and-module-boundaries). |
| A3 | At least 3–4 routes | Verified | [Route tree](../../src/app/routes.tsx) and [deep links, invalid IDs, and Not Found recover without writes](../../tests/e2e/navigation.e2e.mjs). |
| A4 | Local and global state, or justified absence of global state | Verified | [State ownership](STATE_MANAGEMENT.md#store-and-ownership) and the [delayed POST](../../tests/e2e/recovery.e2e.mjs) and [refresh recovery](../../tests/e2e/navigation.e2e.mjs) cases. |
| A5 | Clear project structure | Verified | [Frontend module structure](ARCHITECTURE.md#stack-and-module-boundaries). |
| A6 | Real API or mock integration | Verified | [Both live browser journeys](../../tests/e2e/learning.e2e.mjs) and the [HTTP contract suite](../../tests/api.contract.mjs). |
| A7 | Typed data interfaces | Verified | [Typed RTK Query service](../../src/features/learning/api.ts) and [OpenAPI](../api/openapi.json). |
| A8 | Centralized request handling | Verified | [RTK Query service](../../src/features/learning/api.ts) and [request-count browser assertions](../../tests/e2e/navigation.e2e.mjs). |
| A9 | Loading and error states | Verified | [Loading, retry and mutation recovery](../../tests/e2e/recovery.e2e.mjs). |
| I1 | Modern bundler | Verified | [Vite config](../../vite.config.ts) and the production build in [CI](../../.github/workflows/ci.yml). |
| I2 | Component-based UI | Verified | [UI requirements](UI_REQUIREMENTS.md) and [component tests](../../src/features/learning/uiRequirements.test.tsx). |
| I3 | Reusable components | Verified | [Shared components](../../src/shared) and [UI requirements](UI_REQUIREMENTS.md). |
| I4 | Layout components | Verified | [Shared shell](../../src/app/AppShell.tsx). |
| I5 | UI library or custom UI components | Verified | [Custom UI components](../../src/shared) and [recommendation card](../../src/features/learning/RecommendationCard.tsx). |
| I6 | Controlled forms and validation | Verified | [Answer form](../../src/features/learning/AnswerForm.tsx), [validation boundary tests](../../src/features/learning/uiRequirements.test.tsx) and [both learner journeys](../../tests/e2e/learning.e2e.mjs). |
| I7 | Data tables or lists | Verified | [Course lists](../../src/pages/CoursePage.tsx) and [both learner journeys](../../tests/e2e/learning.e2e.mjs). |
| I8 | Filtering, searching or sorting | Verified | [Catalog search and route navigation reuse fresh GET cache entries](../../tests/e2e/navigation.e2e.mjs). |
| I9 | Desktop and mobile responsiveness | Verified | [Five viewport widths, 200% root text and Chromium page zoom](ACCESSIBILITY.md), plus both Chromium browser projects. |
| I10 | Clean/readable code | Partially verified | [Frontend module structure](ARCHITECTURE.md#stack-and-module-boundaries) and passing ESLint. Readability remains subject to review. |
| I11 | ESLint and Prettier or equivalent formatter | Verified | [ESLint config](../../eslint.config.js), [scoped Prettier configuration and commands](DESIGN_SYSTEM.md#formatting-and-logging) and [CI](../../.github/workflows/ci.yml). |
| I12 | Basic frontend logging | Verified | [Structured development logging](../../src/app/frontendLogging.ts) and [its verification](../../src/app/frontendLogging.test.ts). |
| E1 | Global handler or Error Boundary | Verified | [Router boundary](../../src/app/RouteError.tsx). |
| E2 | Clear user-facing errors | Verified | [Browser recovery cases](../../tests/e2e/recovery.e2e.mjs) for read and write feedback. |
| E3 | Correct HTTP 401/403/404/500 handling | Partially verified | [Error normalization](../../src/features/learning/learning.integration.test.ts) covers 401/403 with synthetic inputs. Browser evidence includes live 404 and injected 500. The current API has no authentication paths. |
| E4 | Loading for all async operations | Partially verified | [Exercise loading](../../tests/e2e/navigation.e2e.mjs) and [pending catalog, POST and PATCH](../../tests/e2e/recovery.e2e.mjs). The [course loading branch](../../src/pages/CoursePage.tsx) has implementation evidence. |
| T1 | Unit tests for at least three key current frontend units | Verified | [UI unit tests](../../src/features/learning/uiRequirements.test.tsx) for search and form validation, [route/ID tests](../../src/app/routes.test.ts) and [error normalization tests](../../src/features/learning/learning.integration.test.ts). |
| T2 | At least 1–2 frontend integration or E2E tests | Verified | [Live learner journeys](../../tests/e2e/learning.e2e.mjs), [navigation](../../tests/e2e/navigation.e2e.mjs) and [recovery](../../tests/e2e/recovery.e2e.mjs). |
| T3 | Tests for forms, state or client-side API | Verified | [Form component tests](../../src/features/learning/uiRequirements.test.tsx), [store/transport tests](../../src/features/learning/learning.integration.test.ts) and [browser journeys](../../tests/e2e/learning.e2e.mjs). |

| Advanced direction | Status | Related evidence |
| --- | --- | --- |
| Advanced Architecture | Verified | [Module and navigation diagrams](ARCHITECTURE.md) and [direct browser route verification](../../tests/e2e/navigation.e2e.mjs). |
| Advanced State Management | Verified | [Store and ownership](STATE_MANAGEMENT.md), [request reuse and late reads](../../tests/e2e/navigation.e2e.mjs), and [late writes and ambiguous outcomes](../../tests/e2e/recovery.e2e.mjs). |
| Performance | Partially verified | [Desktop before-and-after measurements, request and asset budgets](PERFORMANCE.md), and [live scoped cache invalidation](../../tests/e2e/navigation.e2e.mjs). Production field timings and component-level profiling remain open. |
| Advanced UI/UX | Partially verified | [Design tokens and themes](DESIGN_SYSTEM.md) and [keyboard, reflow, page zoom and automated accessibility checks](ACCESSIBILITY.md). Screen-reader output and full WCAG evaluation remain unverified. |

## FE-04 handoff record

Coverage uses two synthetic diagnostic seeds, desktop Chromium, and a Pixel 7 emulation profile. Physical devices, other browser engines, broader viewport coverage, and educational effectiveness remain unmeasured. The accessibility assertions cover specific labels, validation and focus behavior. FE-05 can reuse the semantic locators and viewport projects to add keyboard navigation, focus and announcement checks, light/dark theme interactions, zoom and reflow, and contrast evidence. Performance measurement stays with FE-06.

## FE-06 handoff

The desktop performance harness reports timings and enforces optional asset and request-order budgets against the production build. The regular browser suite covers live stale-exercise invalidation on both existing Chromium projects. [Measurements and reproduction](PERFORMANCE.md) · [Browser tests](../../tests/e2e/navigation.e2e.mjs)
