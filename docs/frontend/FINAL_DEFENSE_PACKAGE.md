# FE-10 — Final frontend verification and defense package

27 November 2026 · Stage 3, Frontend and UX

## 1. Executive summary

Learning Path Assistant guides a learner through one seeded diagnostic in introductory Python or selected Lithuanian grammar. The learner can revise an uncertain answer, read a rule-based assessment and explanation, and accept or reject a suggested topic. FE-10 verifies the merged implementation and consolidates the evidence for human review. The 5-point path is technically ready within the documented frontend scope. The 10-point path remains conditional on the assessor's interpretation of how a direction is completed. [Evidence matrix](../FRONTEND_FINAL_EVIDENCE_MATRIX.md#fe-10-consolidated-readiness)

## 2. Verified repository baseline

| Item | Evidence |
| --- | --- |
| Starting `origin/main` | `9fa3e38e9256cd8adabe47c03a312df929010f87`, matched by a fresh fetch and the GitHub PR merge SHA. [Commit](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/9fa3e38e9256cd8adabe47c03a312df929010f87) |
| FE-09 | PR #20 is merged to `main` with implementation head `fb8285dd5959957e296b3eb7afcd7618286d5cbd`. PR #19's merge precedes it in history. [PR #20](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/20) · [FE-09 commit](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/fb8285dd5959957e296b3eb7afcd7618286d5cbd) · [PR #19](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/19) |
| Exact-SHA post-merge CI | Run 46063281810 completed successfully. `verify`, `http-contract` and `frontend-e2e` each passed. [Run](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/actions/runs/46063281810) |
| FE-10 branch | `feature/frontend-final-defense-package-stage3-2026` |
| Linear | The direct FE-10 lookup returned no accessible issue. |
| Rubric | FE-07 records the wording of pp. 1–4 of *Frontend — Diploma Project Knowledge Base*. FE-09 checked the November 21 PDF export against its advanced criteria and the 2–3 direction rule. FE-10 used those records because the PDF was unavailable in this session and the live page redirected to sign-in. [Transcription](../FRONTEND_FINAL_EVIDENCE_MATRIX.md) · [FE-09 comparison](ADVANCED_REQUIREMENTS_CLOSURE.md) · [Rubric site](https://fictional-parakeet-5v5zgoe.pages.github.io/04-technical-requirements/04d-frontend-and-ux/frontend/) |

## 3. Final implementation overview

The catalog offers text search and links into course details, topic and exercise lists, and the diagnostic form. A valid answer reaches Express. A recognized misconception yields a persisted incorrect attempt and a recommendation with a category, topic and explanation. A correct answer yields a persisted attempt without a recommendation. An uncertain response offers clarification while retaining the answer. The decision control displays confirmation after a validated save. [Learner journeys](../../tests/e2e/learning.e2e.mjs) · [Contract tests](../../tests/api.contract.mjs) · [Assessment rules](../../server/assessment.ts)

## 4. Stack and architecture

React and TypeScript compose the learner UI. React Router defines the catalog, course, diagnostic and guarded result routes, plus redirect and fallback. Vite emits the production entry and separate lazy page chunks. Shared native-backed controls supply consistent semantics, focus and theme styling. Express owns classification, recommendation selection and PostgreSQL persistence. The local same-origin preview proxy forwards API transport during verification. [Architecture and diagrams](ARCHITECTURE.md) · [Route configuration](../../src/app/routes.tsx) · [Design system](DESIGN_SYSTEM.md) · [Browser fixture](../../tests/e2e/fixtures.mjs)

Drafts and catalog search are local component state. The Redux Toolkit workflow slice tracks the attempt and decision by course/exercise. RTK Query owns typed server reads, keyed caching and invalidation. Cache entries are fresh for remounts within 60 seconds and retained for 120 seconds after unsubscribe for learner data. Same-scope concurrent reads deduplicate. A stale diagnostic 404 refreshes only the affected exercise collection. [Store](../../src/app/store.ts) · [API](../../src/features/learning/api.ts) · [Workflow](../../src/features/learning/workflowActions.ts) · [Cache policy](STATE_MANAGEMENT.md#cache-and-query-lifecycle)

## 5. Minimum requirements readiness

The implemented learner scope has evidence for the SPA, documentation, architecture, typed API integration, UI, loading and errors, tests and listed restrictions. Angular-only modules are **Not applicable**. Client handling of 401/403 is **Verified** through controlled responses. Live enforcement remains **Open** because the API has no access-control contract. Confirm whether the assessor accepts inline alerts, the guarded result URL and synthetic 401/403 for the minimum. [Current minimum matrix](../FRONTEND_FINAL_EVIDENCE_MATRIX.md#minimum-requirements-at-fe-10) · [FE-08 closure](MINIMUM_REQUIREMENTS_CLOSURE.md)

## 6. Advanced requirements readiness

| Direction | Status | Basis |
| --- | --- | --- |
| Advanced Architecture | Partial | Feature separation and lazy routes are demonstrated. Micro frontends and BFF are open, and named architecture conventions are partial. |
| Advanced State Management | Verified | Slices, reactive subscriptions, memoized selectors, async orchestration, late-response isolation and write/cache behavior are evidenced. Equivalent reactive tooling remains an assessor interpretation. |
| Performance | Partial | Route splitting, harness budgets, historical local Lighthouse and bundle analysis are evidenced. Component memoization, Workers and bundle reduction remain open or partial. |
| Advanced UI/UX | Partial | CSS press feedback, design kit, two themes and scoped accessibility evidence are available. Visualization and full WCAG evaluation remain open. |

The recorded 10-point rule calls for the minimum plus 2–3 completed directions. One direction has technical evidence across its criteria. Performance and UI/UX are candidates for a second direction, subject to assessor interpretation of the listed criteria. No academic decision has been made here. [Criterion-by-criterion matrix](../FRONTEND_FINAL_EVIDENCE_MATRIX.md#advanced-requirements-at-fe-10)

## 7. Final regression results

Verification ran on Debian 13.7 x86-64, AMD EPYC 9V74 with a two-CPU quota, Node 24.22.3, npm 11.19.1, Vite 8.3.3, Playwright 1.65.1 with headless Chromium 159.0.8154.6, and Docker PostgreSQL 17.12 on loopback. Browser tests served the same-origin production build through Vite preview and used local Express and a fresh seeded database per test. Playwright ran two workers for regression and one for performance.

| Check | FE-10 result | FE-09 baseline |
| --- | --- | --- |
| `npm ci` | Passed with a workspace cache. The first attempt failed with ENOENT at the default cache. The retry installed 297 packages and reported the existing esbuild install-script policy warning. | Passed with workspace cache |
| `npm run lint` | Passed | Passed |
| `npm run format:check` | Passed for configured paths | Passed |
| `npm run test` | 77 passed across six files, 0 failed or skipped. Includes frontend, classifier and archived prototype tests. | 77 |
| `npm run test:contract` | Final run 20 passed, 0 failed or skipped. The first run failed harness setup because the disposable database URL lacked its required explicit password field. | 20 |
| `npm run test:e2e` | 54 passed, 27 desktop and 27 Pixel 7 emulation, 0 failed, skipped or flaky. | 54 |
| Scoped axe scans | 32, zero violations, counted from four fresh report attachments with eight states each. | 32, zero violations |
| `npm run build` | Passed. Production browser build also passed and emitted separate page chunks. | Passed |
| Pinned OpenAPI validation | Passed with `@apidevtools/swagger-cli@4.0.4`, which emitted a package deprecation warning. | Passed |
| FE-06 performance harness | 11 loopback and 11 shaped runs passed, 0 failed or skipped, with budget enforcement enabled. | 22 |

The final suite counts match FE-09. The setup fixes used local environment settings and required no changes to source, lockfile or test assertions. [Scripts](../../package.json) · [Regression setup](#10-reproducible-local-startup) · [Historical FE-09 results](ADVANCED_REQUIREMENTS_CLOSURE.md#regression-verification)

### Learner workflow verification

| Scope | Verified behavior and fixture boundary |
| --- | --- |
| Both tracks, real API and database | Desktop and Pixel 7 emulation traverse catalog, course and diagnostic. Whitespace triggers local validation without a POST. Express returns 422 on the uncertain text and the draft stays visible with no attempt row. Recognized misconceptions return the category, explanation and topic. Python accepts Type Conversion and Lithuanian rejects Accusative Case. SQL confirms each decision. Separate correct attempts persist without recommendations. [Journey assertions](../../tests/e2e/learning.e2e.mjs) |
| Reads, lazy routes and cache | Tests hold production chunks and live response delivery to observe cold loading and refresh. Back/forward reuses fresh reads. A stale exercise receives a real 404 after deactivation and refreshes only the affected collection. Deep-link and reload recovery issue no writes. [Loading](../../tests/e2e/loading.e2e.mjs) · [Navigation](../../tests/e2e/navigation.e2e.mjs) |
| Error and write recovery | Browser fixtures inject 400, 401, 403 and catalog 500 responses. Explicit retry/correction goes to live Express. Duplicate POST/PATCH actions are blocked. Competing PATCH receives a real 409. Lost-response cases forward the real write and drop its response after commit, then verify persisted state and zero replay. Contract tests separately check real 500 rollback. [Recovery](../../tests/e2e/recovery.e2e.mjs) · [Contract](../../tests/api.contract.mjs) |
| Responsive and accessible interaction | Chromium projects cover reflow, light/dark, system preference and persistence, keyboard focus and reduced-motion behavior. [Quality assertions](../../tests/e2e/frontend-quality.e2e.mjs) |

## 8. Performance evidence and measurement conditions

The FE-06 harness used 11 fresh desktop Chromium contexts per profile at 1280 × 720. Each run started its own seeded Express/PostgreSQL stack. The second profile adds 40 ms with Chromium CDP, unlimited configured throughput and no CPU throttling. Profiles ran serially after the browser suite. Timings below are median [minimum, maximum] in ms. A negative chunk offset means the result module started loading before the POST ended. [Method and budget details](PERFORMANCE.md) · [Harness](../../tests/e2e/frontend.perf.mjs)

| Measurement | Loopback | +40 ms |
| --- | ---: | ---: |
| Cold catalog ready | 212.6 [200.6, 290.5] | 379.2 [300.6, 401.3] |
| Sampled LCP | 132.0 [116.0, 208.0] | 224.0 [212.0, 256.0] |
| Document response start | 8.3 [7.4, 20.4] | 42.1 [41.5, 43.6] |
| Catalog → course | 94.1 [92.4, 157.5] | 192.1 [188.9, 250.2] |
| Course → diagnostic | 45.3 [26.5, 61.1] | 94.2 [69.1, 96.3] |
| Submit → recommendation | 95.3 [43.1, 127.7] | 93.6 [87.8, 113.2] |
| Result chunk start relative to POST end | −31.2 [−39.2, −24.5] | −44.3 [−45.2, −42.6] |
| Warm catalog return | 44.2 [29.2, 62.0] | 30.1 [29.2, 46.3] |

Both profiles passed enforced budgets. Cold assets measured 415,618 B decoded JS and 7,481 B decoded CSS against limits of 425,000 B and 8,000 B. All emitted JS and CSS were 425,443 B and 7,481 B raw, and 136,188 B and 2,108 B summed gzip against gzip ceilings of 140,000 B and 2,300 B. Each journey used three GETs, one POST and one PATCH, with zero requests on warm catalog return. All 22 result loads overlapped the POST. The shaped medians stayed below the manual investigation triggers of 450 ms cold and 150 ms submit. FE-09's shaped medians were 342.0 ms cold and 85.7 ms submit on a different host. Bundle totals and request counts matched FE-09. Timing variation across hosts and runs limits direct speed comparisons. [FE-09 comparison](ADVANCED_REQUIREMENTS_CLOSURE.md#production-bundle-and-fe-06-budgets)

FE-09 separately reported Lighthouse 13.6.0 Performance scores of 100/100/100 desktop and 100/99/99 mobile on a cold local production catalog. Those historical single-route lab measurements used simulated throttling and system Chromium 156. FE-09's scratch React profiling build measured selected subtree render durations and found little measured cost in redundant catalog updates. FE-10 reran the production FE-06 harness. Field Core Web Vitals, production hosting/CDN, other engines and physical mobile performance remain unmeasured. [Lighthouse conditions](ADVANCED_REQUIREMENTS_CLOSURE.md#lighthouse) · [React profiling conditions](ADVANCED_REQUIREMENTS_CLOSURE.md#react-profiler)

## 9. Accessibility evidence and limitations

The axe cases scan eight learner states per palette and browser project, including a controlled loading/500 pair. Scanned states include catalog, course, diagnostic, invalid form, decision controls and saved outcome. Keyboard cases verify skip link, validation focus and focus handoff after result and decision. Reflow tests use 320, 375, 768, 1024 and 1440 CSS px, plus enlarged text at 320 px. Motion tests check when pressed feedback transitions are permitted and disabled. The FE-09 contrast ratios and FE-05 Chromium page zoom are historical supporting evidence. Screen-reader output, physical mobile devices, other engines and full manual WCAG 2.2 AA conformance remain open. [Accessibility method](ACCESSIBILITY.md) · [FE-09 contrast](ADVANCED_REQUIREMENTS_CLOSURE.md#accessibility-and-responsive-evidence) · [Quality spec](../../tests/e2e/frontend-quality.e2e.mjs)

## 10. Reproducible local startup

1. From the repository root, use Node 24 and run `npm ci`. Use a writable npm cache if the default is restricted, for example `npm_config_cache=/tmp/fe10-npm-cache npm ci`.
2. Start a disposable PostgreSQL 17 database. Configure the backend `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME` locally as described in the API guide. On the empty database, apply schema, indexes and reference seed in that order. Use only the seeded synthetic learner. [Exact database commands](../api/README.md#getting-started)
3. Run `npm run server:dev` and `npm run dev` in separate terminals. Use the documented defaults `localhost:3001` for Express and `http://localhost:5173` for Vite. Open `/courses`. [API setup](../api/README.md) · [App startup](../../README.md)
4. For the production Network walkthrough, keep Express running and run `npm run build && npm run preview -- --host localhost --port 5173 --strictPort` after stopping the dev server. This uses the default local API URL with the permitted frontend origin. For automated runs use the same-origin production build and isolated database harness in the next commands. [API origin](../../server/index.ts) · [Test proxy](../../tests/e2e/fixtures.mjs)

With the [disposable test database setup](TESTING.md#run-locally) exporting `CONTRACT_DB_URL`, run from the root:

```bash
npm ci
npx playwright install chromium
npm run lint
npm run format:check
npm run test
npm run test:contract
npm run test:e2e
npm run build
npx --yes @apidevtools/swagger-cli@4.0.4 validate docs/api/openapi.json
VITE_API_URL= npm run build
PERF_ENFORCE_BUDGETS=1 npx playwright test -c playwright.performance.config.mjs
PERF_ENFORCE_BUDGETS=1 PERF_LATENCY_MS=40 npx playwright test -c playwright.performance.config.mjs
```

Run performance profiles serially. For a machine-readable browser result alongside the HTML report, run `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/fe10-e2e.json npm run test:e2e -- --reporter=list,html,json`. Inspect `axe-results` attachments with `npx playwright show-report`. For the performance sample payloads capture stdout and inspect the `PERF` JSON lines. [Harness](../../tests/e2e/frontend.perf.mjs) · [Test configuration](../../playwright.config.mjs)

## 11. Live demonstration scenarios

1. **Python.** Open the catalog and select **Introduction to Python**, then its diagnostic exercise. Submit spaces to show validation and focus. Enter `I am unsure what this means.` to show live clarification and retained input. Replace it with `python automatically converts strings to integers`. Inspect the incorrect outcome, category, Type Conversion recommendation and explanation. Accept and wait for the saved status. Return to the diagnostic and enter `i need to convert the string into an integer` for the correct result. [Examples](../api/openapi.json) · [Python journey](../../tests/e2e/learning.e2e.mjs)
2. **Lithuanian.** Return to the catalog, select **Lithuanian Grammar** and open its diagnostic. Enter `mokykla is correct`. Show the category and Accusative Case explanation, then reject and wait for the saved status. Revisit the exercise and enter `aš einu į mokyklą` for the correct result. [Examples](../api/openapi.json) · [Lithuanian journey](../../tests/e2e/learning.e2e.mjs)
3. **Redux, lazy loading and cache.** In a fresh production browser context open DevTools Network, load the catalog and navigate to a fresh course and diagnostic. Identify page chunk requests and API GETs. Submit a valid misconception and compare the result chunk start against the POST end. On a fresh in-tab revisit inside 60 seconds, look for reuse of the catalog and exercise GETs. Show the store integration test for the workflow reducer and RTK Query cache. The app disables Redux DevTools because in-flight mutation actions contain answer text. Reload a result URL to show the recovery link and zero new writes. For deterministic scoped invalidation and duplicate-write evidence, use the automated cases below. [Store](../../src/app/store.ts) · [Harness](../../tests/e2e/frontend.perf.mjs) · [Navigation cases](../../tests/e2e/navigation.e2e.mjs)
4. **Controlled failure and duplicate writes.** With the test database configured, run `npm run test:e2e -- --project=desktop-chromium --grep 'injected catalog failure|delayed POST|committed PATCH|stale diagnostic'`. Show the report or add `--headed` for a live replay. Explain which responses are injected, which responses are delayed and where SQL verifies real writes. [Recovery tests](../../tests/e2e/recovery.e2e.mjs) · [Stale diagnostic](../../tests/e2e/navigation.e2e.mjs)
5. **Responsive layout and accessibility.** Use a narrow CSS viewport, select each theme and inspect wrapping without horizontal scrolling. Start from a fresh page and press Tab to expose the skip link. Activate it, navigate to the diagnostic and submit an empty answer. Observe input focus and visible error, then complete a misconception and observe result and decision focus. In a hover-capable browser, emulate `prefers-reduced-motion: reduce` and repeat button interaction. Show the axe attachments and name the manual checks still open. [Quality spec](../../tests/e2e/frontend-quality.e2e.mjs) · [Styles](../../src/app/shell.css)

## 12. Suggested six-minute defense

| Time | Demonstration |
| --- | --- |
| 0:00–0:40 | Explain the learner problem, two tracks and deterministic recommendation. Show the app and module diagram. |
| 0:40–2:15 | Run Python validation, clarification, assessment and acceptance. |
| 2:15–3:10 | Run Lithuanian misconception and rejection. Show the saved result. |
| 3:10–4:20 | Show lazy chunks, request reuse, state ownership and the controlled duplicate-write evidence. |
| 4:20–5:20 | Show narrow layout, themes, keyboard focus and reduced-motion behavior. |
| 5:20–6:00 | Present exact-SHA CI and local measurements, then state the grading-path and accessibility limitations. |

## 13. Likely assessor questions

| Question | Answer |
| --- | --- |
| Where does the recommendation come from? | Express runs a deterministic assessment against seeded exercise patterns, persists the outcome and returns the explanation if a misconception maps to a recommendation. [Classifier](../../server/assessment.ts) · [Server](../../server/index.ts) |
| Why Redux Toolkit and RTK Query? | The workflow slice coordinates scoped writes and result state across routes. RTK Query handles server data lifecycles and key/tag cache rules. Input drafts stay local. [State ownership](STATE_MANAGEMENT.md#store-and-ownership) |
| What if the learner double-clicks or leaves mid-request? | A synchronous in-tab claim blocks concurrent duplicate writes for the exercise. Late completions remain tied to their origin. Express guards concurrent decisions and a lost confirmation becomes an ambiguous state. Durable idempotency and reconciliation are outside the current API. [Write lifecycle](STATE_MANAGEMENT.md#writes-errors-and-recovery) |
| What proves lazy loading helps here? | Cold route chunks and controlled waits establish code splitting. The performance harness checks that the result chunk starts before the assessment POST ends under the shaped profile. It also checks warm request reuse. [Harness assertions](../../tests/e2e/frontend.perf.mjs) |
| Does zero axe violations establish accessibility conformance? | The result applies to the scanned states and rules. The remaining evaluation includes manual WCAG 2.2 AA review, physical devices and screen readers. [Limits](ACCESSIBILITY.md#limits) |
| How are authentication errors verified? | Controlled browser responses exercise 401/403 mapping, safe feedback, draft retention and recovery. The API has no live authentication or authorization flow. [Minimum closure](MINIMUM_REQUIREMENTS_CLOSURE.md) |
| Does FE-10 establish the maximum grade? | The evidence supports State Management across its criteria. The assessor decides the threshold for completing the other directions and the applicability of rubric examples. [Advanced matrix](../FRONTEND_FINAL_EVIDENCE_MATRIX.md#advanced-requirements-at-fe-10) |

## 14. Known limitations and remaining work

- Obtain the official PDF for independent comparison and ask the assessor about the guarded route, inline alerts, synthetic 401/403, reactive-tool equivalence, CSS motion and the advanced direction threshold.
- Manual screen-reader, physical-device and full WCAG 2.2 AA evaluation remain open. Historical Lighthouse and browser profiling use a local seeded lab. Confirm the assessor's expected Lighthouse route and deployment conditions.
- The browser's write protection and result session are in-memory. The API supports no durable idempotency or reconciliation endpoint. The frontend uses typed read envelopes and runtime confirmation checks on writes. [State management](STATE_MANAGEMENT.md) · [API design](../api/API_DESIGN.md#idempotency-and-retry-safety)
- Micro frontends, BFF, component memoization, Workers and charts remain open under the advanced list. The documented named-architecture, bundle reduction and overall accessibility claims remain partial. [Matrix](../FRONTEND_FINAL_EVIDENCE_MATRIX.md#advanced-requirements-at-fe-10)

## 15. Evidence reconciliation and index

- The FE-07 audit and its original evidence matrix record an earlier SHA, 38 browser runs and open M5/M29/M30 findings. FE-08 added evidence for those minimum gaps. FE-09 advanced the UI/UX and local Performance evidence and recorded 54 browser runs. The FE-10 consolidated matrix and this report carry the current assessment. [FE-07 audit](../FRONTEND_FINAL_AUDIT.md) · [FE-08 minimum](MINIMUM_REQUIREMENTS_CLOSURE.md) · [FE-09 advanced](ADVANCED_REQUIREMENTS_CLOSURE.md) · [Consolidated matrix](../FRONTEND_FINAL_EVIDENCE_MATRIX.md#fe-10-consolidated-readiness)
- The early testing table marked Architecture verified from its module and routing evidence. FE-09's follow-up and the current matrix assess it as partial against the full list. Old lab counts and bundle totals in the design, testing, state and performance notes belong to their named revisions. FE-09 profiling addresses the earlier lack of render measurements with a separate scratch build. [Testing](TESTING.md) · [Performance](PERFORMANCE.md) · [State](STATE_MANAGEMENT.md) · [Design](DESIGN_SYSTEM.md)
- Trace startup and navigation through the [entry point](../../src/main.tsx), [routes](../../src/app/routes.tsx) and [architecture diagrams](ARCHITECTURE.md). Trace workflow behavior through the [learner feature](../../src/features/learning), [server](../../server/index.ts), [OpenAPI](../api/openapi.json), [contract](../../tests/api.contract.mjs) and [browser specs](../../tests/e2e).
- The regular GitHub workflow runs dependency, format, lint, build, unit, HTTP contract and browser checks. Dedicated local FE-06 budgets and historical Lighthouse measurements have separate evidence. The FE-10 pull request Checks tab records its own CI result. [Workflow](../../.github/workflows/ci.yml) · [Baseline CI](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/actions/runs/46063281810) · [FE-10 branch CI](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/actions?query=branch%3Afeature%2Ffrontend-final-defense-package-stage3-2026)

## 16. Final submission checklist

- [x] Record starting SHA, merge and exact-SHA baseline CI.
- [x] Preserve earlier verification and link the consolidated rubric matrix.
- [x] Record regression results, measurement conditions and reproduction steps.
- [x] Provide both live learning paths and fixture-based recovery demos.
- [ ] Human reviewer confirms the FE-10 pull request checks and reviews the defense package.
- [ ] Compare with the official rubric PDF and confirm grading-path interpretations with the assessor.
- [ ] Rehearse the six-minute demo against a fresh synthetic seed.
