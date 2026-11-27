# FE-08 — Minimum requirements closure

**Date** 27 November 2026 (Europe/Kiev)

**Starting main** [`4b7a8c9b34ea1f3c9ed2532935d96bebe58d1a00`](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/4b7a8c9b34ea1f3c9ed2532935d96bebe58d1a00), the verified remote tip and merge commit for [PR #18](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/18).

**Rubric** The official *Frontend — Diploma Project Knowledge Base* document was unavailable for this run. This closure uses the wording transcribed from pp. 1–4 in the [FE-07 evidence matrix](../FRONTEND_FINAL_EVIDENCE_MATRIX.md). Linear returned no accessible FE-08 match.

FE-08 documents the existing native-backed UI kit, distinguishes 401 from 403 in centralized client error normalization, and exercises cold loading, refresh and retry with browser-controlled requests. The current catalog, diagnostic, result and recommendation decision workflow defines the scope. Production loading behavior and the FE-06 result import use their existing implementation. The [FE-07 audit](../FRONTEND_FINAL_AUDIT.md) and its matrix retain the results and advanced-direction evidence for their original audited commit.

## Requirement-to-evidence mapping

| Criterion | FE-07 status | FE-08 technical status | Evidence and scope |
| --- | --- | --- | --- |
| M5 — Justify the framework, state manager and UI kit | PARTIALLY VERIFIED | VERIFIED | Existing stack rationale plus the project-specific reasons for the native-backed kit, reusable controls, keyboard and theme behavior, and maintenance responsibilities. [Architecture](ARCHITECTURE.md#stack-and-module-boundaries) · [Design system](DESIGN_SYSTEM.md#native-backed-ui-kit) · [FE-05 checks](ACCESSIBILITY.md) |
| M29 — Handle HTTP 401, 403, 404 and 500 correctly | PARTIALLY VERIFIED | VERIFIED for client-side handling | Distinct safe 401 and 403 alerts with draft preservation, available submission and catalog navigation, no false result or recommendation, no persisted denied attempt, live recovery, and no synthetic answer or transport detail in the alert or browser console. Existing live 404 and browser-injected 500 cases remain, as does the live API 500 rollback check. [Error mapping](../../src/features/learning/apiErrors.ts) · [Workflow](../../src/features/learning/workflowActions.ts) · [Browser recovery](../../tests/e2e/recovery.e2e.mjs) · [Live 404](../../tests/e2e/navigation.e2e.mjs) · [Contract](../../tests/api.contract.mjs) |
| M30 — Use skeleton or loading states for all asynchronous operations | PARTIALLY VERIFIED | VERIFIED for the current learner UI | Each independent wait has a text status. The inventory below identifies the pending controls and what the browser tests observe before and after release. [Status semantics](../../src/shared/Status.tsx) · [Cold and refresh tests](../../tests/e2e/loading.e2e.mjs) · [Write recovery and duplicate guards](../../tests/e2e/recovery.e2e.mjs) |

## User-visible asynchronous operations

| Operation | Pending behavior and evidence |
| --- | --- |
| Initial catalog GET | `Loading courses…` in a status region. Search and course content appear after data arrives. The delayed 500 fixture checks pending UI and a subsequent successful retry. [Catalog view](../../src/pages/CoursesPage.tsx) · [Browser recovery](../../tests/e2e/recovery.e2e.mjs) |
| Cold course detail | `Loading course…` waits for required data. A direct URL starts with a fresh store, and the test holds both topics and exercises GETs. It checks that no details, errors or empty collections appear during the wait, then confirms both loaded sections and the removal of the status. [Course view](../../src/pages/CoursePage.tsx) · [Cold and refresh tests](../../tests/e2e/loading.e2e.mjs) |
| Diagnostic exercise | `Loading exercise…` announces a cold exercise-list read. A delayed-response case navigates away during the read and verifies the late response cannot overwrite a different diagnostic draft. [Diagnostic view](../../src/pages/DiagnosticPage.tsx) · [Navigation tests](../../tests/e2e/navigation.e2e.mjs) |
| Lazy route module | `Loading page…` appears in the initial fallback or alongside the current view during in-app navigation. Both tests hold the actual production course chunk, verify the pending status and absence of destination details, and release it to confirm destination content and removal of the status. [Route tree](../../src/app/routes.tsx) · [Shell](../../src/app/AppShell.tsx) · [Chunk tests](../../tests/e2e/loading.e2e.mjs) |
| Assessment POST | `Checking your answer…` and a disabled submit button and textarea. The existing delayed test verifies one POST even with a second submit event, and verifies a late response stays with its original exercise. Only a confirmed response can open the result. [Answer form](../../src/features/learning/AnswerForm.tsx) · [Browser recovery](../../tests/e2e/recovery.e2e.mjs) |
| Recommendation decision PATCH | `Saving your recommendation decision…` and disabled decision controls. The diagnostic shows a pending notice if the learner returns mid-write. The delayed test verifies one PATCH even with an opposing click and withholds saved-success feedback when the response is lost. [Recommendation card](../../src/features/learning/RecommendationCard.tsx) · [Answer form](../../src/features/learning/AnswerForm.tsx) · [Browser recovery](../../tests/e2e/recovery.e2e.mjs) |
| Refresh and retry | `Refreshing…` and a disabled trigger, with same-key confirmed data retained when available. The browser tests hold a course refresh and the catalog retry, then check that the status clears after the live response. A browser reload uses the route and cold-read statuses and never replays an attempt or decision. [Shared feedback](../../src/features/learning/QueryFeedback.tsx) · [Cold and refresh tests](../../tests/e2e/loading.e2e.mjs) · [Retry and navigation](../../tests/e2e/recovery.e2e.mjs) · [Reload recovery](../../tests/e2e/navigation.e2e.mjs) |

Subscribed remount or reconnect revalidation and stale-exercise invalidation use the same read pending UI. A warm cache hit resolves without an independent wait, and an in-flight read that completes for a departed route only updates its own cache entry. The FE-06 speculative result import overlaps the assessment POST, whose status already represents the learner's wait. If navigation still has to wait for the result module, the shell's route status covers it. The health endpoint has no learner-screen subscriber. These operations have no independent waiting state requiring another indicator. [Cache policy](STATE_MANAGEMENT.md#cache-and-query-lifecycle) · [FE-06 optimization](PERFORMANCE.md#bottleneck-and-change)

## Regression verification

Node 24.22.3, npm 11.19.1, Playwright 1.65.1 and headless Chromium 159.0.8154.6 ran on Linux. The suite used the documented loopback Docker PostgreSQL 17.12 service, Vite production preview and local Express, with a fresh seeded database for each browser case. [Local setup](TESTING.md#run-locally)

| Command | Result |
| --- | --- |
| `npm ci` | Passed with a workspace npm cache after the default cache location failed with ENOENT and tarball warnings. npm reported esbuild's install-script policy warning. The lockfile is unchanged. |
| `npm run test` | 77 passed across six files, matching FE-07. |
| `npm run test:contract` | 20 passed, zero failures or skips, matching FE-07. |
| `npm run test:e2e` | 48 passed (24 desktop Chromium and 24 Pixel 7 Chromium emulation), up from 38. Four axe cases checked eight states each, totaling 32 scans with zero violations. |
| `npm run lint` | Passed without ESLint diagnostics. |
| `npm run format:check` | Passed for the configured scope. |
| `npm run build` | Passed. Vite emitted separate lazy page modules. The entry JS was 413.36 kB raw and 132.24 kB gzip as reported by Vite. |
| `npx --yes @apidevtools/swagger-cli@4.0.4 validate docs/api/openapi.json` | Passed. The pinned CLI reported its package deprecation. |

Playwright workers emitted an environment warning about `NO_COLOR` being ignored when `FORCE_COLOR` is set.

The catalog retry also passed a focused rerun on both browser profiles after retaining the original explicit retry locator and tightening the pending-control locator.

### FE-06 performance regression

Both desktop profiles ran serially against the production build with `PERF_ENFORCE_BUDGETS=1`. Times are medians in milliseconds. [Harness and budgets](PERFORMANCE.md#performance-budgets)

| Command | Result | Cold catalog | Submit to result | Result chunk start relative to POST end |
| --- | --- | ---: | ---: | ---: |
| `PERF_ENFORCE_BUDGETS=1 npx playwright test -c playwright.performance.config.mjs` | 11/11 passed | 244.3 | 94.8 | −32.9 |
| `PERF_ENFORCE_BUDGETS=1 PERF_LATENCY_MS=40 npx playwright test -c playwright.performance.config.mjs` | 11/11 passed | 396.3 | 109.8 | −44.3 |

The result chunk started before the POST ended in all 22 repetitions. Each journey used three GETs, one POST, one PATCH and zero requests on warm catalog return. Cold decoded assets measured 415,618 B JS and 7,330 B CSS. Total gzip assets measured 136,202 B JS and 2,049 B CSS. These results are desktop lab measurements with seeded data and test-controlled latency. [FE-06 measurement scope](PERFORMANCE.md#measurement-method)

## Evidence limits and assessment questions

- The 401 and 403 fixtures intercept one browser POST each before it reaches Express. The current API has no authentication or authorization contract. The tests verify production frontend handling of those responses and then recover through a live successful POST. The browser console check covers the exercised production flow. The separate development-logger test asserts that the logged payload contains only the event, operation and HTTP status. [Browser recovery](../../tests/e2e/recovery.e2e.mjs) · [Logging test](../../src/app/frontendLogging.test.ts)
- Test-held GETs and route chunks eventually complete against the real local stack and production assets. The waits establish what is visible while requests are pending. Mobile evidence uses Chromium emulation. Axe coverage is limited to its scanned states and rules. [Browser profiles](../../playwright.config.mjs) · [Accessibility limits](ACCESSIBILITY.md#limits)
- Confirm whether synthetic 401/403 responses are sufficient in the absence of a backend access contract, and whether contextual inline alerts meet the rubric's feedback presentation examples. Confirm how guarded result URLs count toward the route minimum.
- The preliminary 5-point path is technically ready for review under the FE-07 transcription and the frontend scope above. The assessor determines acceptance and marks. The advanced-direction assessment remains recorded at the FE-07 revision. [FE-07 readiness](../FRONTEND_FINAL_AUDIT.md#preliminary-readiness)

**FE-09 follow-up, 27 November 2026.** See the [advanced requirements closure](ADVANCED_REQUIREMENTS_CLOSURE.md) for the current advanced evidence and regression results. This document retains the FE-08 findings.
