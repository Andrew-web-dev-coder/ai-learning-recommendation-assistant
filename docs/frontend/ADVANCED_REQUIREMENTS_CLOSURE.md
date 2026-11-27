# FE-09 — Advanced requirements closure

**Date** 27 November 2026 (Europe/Kiev)

**Starting main** [4594a5b474b73267c615f706a5537ffbfe3f104e](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/4594a5b474b73267c615f706a5537ffbfe3f104e). A fresh fetch matched the merge commit reported by GitHub for [PR #19](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/19), with base `main` and state MERGED. [Baseline CI](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/actions/runs/46050824127)

**Rubric** The user-supplied 21 November 2026 PDF export of *Frontend - Diploma Project Knowledge Base*, pp. 1–4, supplies the Stage 3 criteria. The live source redirected to GitHub sign-in, so the current online revision could not be independently confirmed. The attached wording and the [FE-07 transcription](../FRONTEND_FINAL_EVIDENCE_MATRIX.md#maximum-requirements-10-point-path) agree on the four directions and the 2–3 direction rule. The FE-09 request defines the implementation scope. Linear searches for FE-09 and “Advanced Requirements Closure” returned no accessible issue. [Live rubric link](https://fictional-parakeet-5v5zgoe.pages.github.io/04-technical-requirements/04d-frontend-and-ux/frontend/)

[FE-07 audit](../FRONTEND_FINAL_AUDIT.md) · [FE-07 evidence matrix](../FRONTEND_FINAL_EVIDENCE_MATRIX.md) · [FE-08 minimum closure](MINIMUM_REQUIREMENTS_CLOSURE.md)

## Advanced criteria

The “before” column carries forward FE-07's advanced status at the FE-08 starting baseline for this follow-up. FE-08 closed minimum criteria and added pending-state and production chunk checks. The whole-direction statuses reflect the scope of the evidence for each individual criterion.

| Direction and rubric criterion | Before | FE-09 | Evidence and remaining scope |
| --- | --- | --- | --- |
| Architecture · Micro frontends | Open | Open | Single SPA and deployment. Independent feature deployments have no current MVP use case. [Architecture](ARCHITECTURE.md) |
| Architecture · BFF | Open | Open | The SPA uses the typed Express API. The local test proxy provides same-origin transport. [API interaction](ARCHITECTURE.md#state-and-api-interaction) |
| Architecture · Feature modules | Verified | Verified | App composition, route modules, learning feature, and shared controls have documented boundaries. The current product has one learner domain. [Architecture](ARCHITECTURE.md#stack-and-module-boundaries) |
| Architecture · Lazy modules and routes | Verified | Verified | Separate production route chunks and cold route waits for direct and in-app navigation. [Routing](../../src/app/routes.tsx) · [Browser regression](../../tests/e2e/loading.e2e.mjs) |
| Architecture · Clean Architecture / FSD / DDD | Partial | Partial | Documented ownership and dependencies support modularity. Full conventions of a named approach remain unverified. [Architecture](ARCHITECTURE.md) |
| **Advanced Architecture** | **Partial** | **Partial** | Feature and route boundaries remain the demonstrated subset. |
| State · Redux Toolkit with modules/slices | Verified | Verified | Store includes the scoped workflow slice and learning API reducer and middleware. [Store](../../src/app/store.ts) · [State](STATE_MANAGEMENT.md) |
| State · Reactive state management | Verified | Verified for current stack | React Redux subscriptions and RTK Query hooks reflect selector and query changes. Assessor interpretation of the named technologies remains open. [Typed hooks](../../src/shared/storeHooks.ts) · [Learning API](../../src/features/learning/api.ts) |
| State · Selectors, effects and memoization | Verified | Verified | Stable memoized control eligibility and scoped orchestration via thunks. Focus effects remain in the UI. [Workflow slice](../../src/features/learning/workflowSlice.ts) · [Recommendation card](../../src/features/learning/RecommendationCard.tsx) |
| State · Complex async chains | Verified | Verified | Answer validation, scoped write claim, overlapping result import, POST, guarded navigation, PATCH and confirmation or recovery. Tests cover in-flight deduplication, invalidation, stale responses and writes. [Workflow](../../src/features/learning/workflowActions.ts) · [Regression evidence](#state-and-cache-verification) |
| **Advanced State Management** | **Verified** | **Verified** | The existing state architecture has automated evidence for current learner flows. |
| Performance · Code splitting and lazy loading | Verified | Verified | Production chunks and cold route checks plus result request overlap. [Bundle and harness](#production-bundle-and-fe-06-budgets) |
| Performance · Component memoization | Open | Open | React Profiler measures the cost of representative updates. [Profile](#react-profiler) |
| Performance · Web Workers | Open | Open | The server performs assessment, and the browser's seeded catalog filter has a small workload. |
| Performance · Lighthouse ≥90 desktop and mobile | Open | Measured in the local lab | Three cold runs for each profile, Performance category on the production catalog. [Lighthouse](#lighthouse) |
| Performance · Bundle reduction and analysis | Partial | Partial | Before/after asset comparison and budget verification. [Bundle and harness](#production-bundle-and-fe-06-budgets) |
| **Performance** | **Partial** | **Partial** | Lab measurements and profiling strengthen evidence. Worker, component memoization, and bundle reduction remain open. |
| UI/UX · Animation | Open | Verified for CSS pressed feedback | Shared enabled buttons ease the existing pressed inset shadow for 120 ms on hover-capable devices when the user permits motion. Focus outlines, color and disabled feedback remain immediate. Acceptance of a CSS transition as the rubric's animation example is an assessor question. [Styles](../../src/app/shell.css) · [Browser tests](../../tests/e2e/frontend-quality.e2e.mjs) |
| UI/UX · Custom component design kit | Verified | Verified | Shared native-backed controls and semantic tokens. [Design system](DESIGN_SYSTEM.md) |
| UI/UX · Data visualization | Open | Open | The response contains a single correct/incorrect outcome and, for incorrect answers, a category and recommendation. The existing outcome and suggested-topic text conveys that data directly. A chart of binary results or IDs has no additional learner use, and the contract supplies no progress series, scores or confidence values. [Result](../../src/features/learning/AssessmentResult.tsx) · [API types](../../src/features/learning/api.ts) |
| UI/UX · Dark/light theme | Verified | Verified | OS preference, explicit selection and persistence, storage failure, and both palettes at the tested widths and motion settings. [Browser evidence](../../tests/e2e/frontend-quality.e2e.mjs) |
| UI/UX · ARIA and accessible names | Verified | Verified for exercised surfaces | Native control roles, named landmarks, form descriptions, status and alert semantics. Axe and Playwright cover selected states. [Accessibility](ACCESSIBILITY.md) |
| UI/UX · Keyboard navigation | Verified | Verified for exercised surfaces | Skip link, course navigation, validation recovery, focus on result and after decision, plus named theme control and focus outline in both palettes under reduced motion. [Browser tests](../../tests/e2e/frontend-quality.e2e.mjs) |
| UI/UX · Contrast | Partial | Verified for sampled token pairs | Review of enabled, hover, focus, control border and disabled pairs in both palettes, with separate automated axe scans. [Contrast and device scope](#accessibility-and-responsive-evidence) |
| UI/UX · Accessibility (WCAG) overall | Partial | Partial | Scoped automated coverage and targeted contrast review. Full manual WCAG 2.2 AA evaluation, assistive technology and device coverage remain open. |
| **Advanced UI/UX** | **Partial** | **Partial** | Press feedback, two-theme reflow and contrast evidence expand the demonstrated subset. |

## State and cache verification

- RTK Query keys and tags scope reads. Store integration cases cover concurrent deduplication, fresh reuse, idle eviction, stable derived selectors, a failed background refresh followed by recovery, and selective tag invalidation. The live browser stale-exercise scenario observes exactly one refresh for the affected collection and reuse for the other course. [Store tests](../../src/features/learning/learning.integration.test.ts) · [Navigation tests](../../tests/e2e/navigation.e2e.mjs)
- Route and request scoping protect late reads and writes. Browser cases hold a read or an assessment POST during navigation, then verify results stay with the originating exercise or course. Pending claims guard repeat POST and PATCH, including an opposing decision click. Confirmed, conflicting and ambiguous outcomes produce distinct UI states. Lost confirmations block repeats in the active tab, and reload submits no new writes. [Recovery tests](../../tests/e2e/recovery.e2e.mjs) · [State policy](STATE_MANAGEMENT.md)
- The frontend verification uses both the real seeded API and controlled response failures. The backend remains the authority for concurrent decisions. Cross-tab write reconciliation and durable idempotency remain outside the current contract. [Contract tests](../../tests/api.contract.mjs)

## Accessibility and responsive evidence

The browser suite runs in desktop Chromium and its Pixel 7 emulation. Explicit light and dark cases exercise 320, 375, 768, 1024 and 1440 CSS px and enlarged text at 320 px on catalog, course, diagnostic and result screens. Existing checks for decision target sizes and keyboard focus remain. New cases check computed transition rules, named keyboard controls, outline style and width, and preference switching in both themes. Test cases under Pixel 7 are mobile emulation. Axe scans are automated checks. Historical FE-05 browser zoom is recorded separately. Screen-reader output, physical devices and a full manual WCAG 2.2 AA evaluation remain open. [FE-05 zoom and scope](ACCESSIBILITY.md#browser-page-zoom)

A targeted contrast review applied the WCAG sRGB linearization and `(Llighter + 0.05) / (Ldarker + 0.05)` to the CSS tokens used by the inspected states. The values describe solid theme colors. Focus outlines are offset by 3 CSS px, so the review includes the adjoining canvas, surface and subtle fills.

| Tested pairing | Light | Dark |
| --- | ---: | ---: |
| Focus ring against canvas / surface / subtle | 6.46 / 7.07 / 6.17 | 11.06 / 9.70 / 7.96 |
| Control border against canvas / surface / subtle | 4.00 / 4.38 / 3.82 | 6.17 / 5.42 / 4.44 |
| Primary text on default / hover button fill | 7.23 / 9.96 | 8.78 / 11.52 |
| Secondary text on default / hover button fill | 15.21 / 13.27 | 14.41 / 11.83 |
| Disabled button text on subtle fill | 6.40 | 7.16 |
| Default link on surface / hover link on subtle | 7.23 / 8.69 | 9.16 / 9.87 |

## Verification environment

Debian 13 x86-64 managed VM, AMD EPYC 9V45 host, two-CPU quota, Node 24.22.3, npm 11.19.1, Vite 8.3.3 and Docker PostgreSQL 17.12. The production builds used `VITE_API_URL=` and Vite preview on loopback with a same-origin proxy to the real Express service and a disposable seeded database. The browser regression, performance harness, Lighthouse and the React profiling runs used separate measurement phases. Results describe the seeded lab workload.

## Production bundle and FE-06 budgets

The uninstrumented baseline and FE-09 production builds were made with the same local toolchain. Sizes are bytes. Gzip uses Node `gzipSync` per asset, with sums rounded only as shown.

| Asset | Baseline raw / gzip | FE-09 raw / gzip |
| --- | ---: | ---: |
| Entry JS | 413,360 / 130,802 | 413,360 / 130,794 |
| Catalog JS | 1,930 / 903 | 1,930 / 902 |
| Course JS | 1,983 / 766 | 1,983 / 766 |
| Diagnostic JS | 3,263 / 1,451 | 3,263 / 1,448 |
| Result JS | 2,873 / 1,160 | 2,873 / 1,158 |
| Not Found JS | 274 / 215 | 274 / 215 |
| Shared query feedback and workflow JS | 1,760 / 905 | 1,760 / 905 |
| All emitted JS | 425,443 / 136,202 | 425,443 / 136,188 |
| All emitted CSS | 7,330 / 2,049 | 7,481 / 2,108 |

The entry accounts for 97% of emitted raw JS. The build still emits all five page chunks and two shared JS chunks. The pattern of unchanged raw JS size and small gzip variation is consistent with generated asset references changing when the CSS changes. The measured CSS change is +151 B raw and +59 B gzip. The comparison establishes current size and budget headroom.

The existing harness used Playwright 1.65.1 and headless Chromium 159.0.8154.6, desktop 1280 × 720, serial execution, fresh browser context and seeded stack per repetition, no CPU throttling, and loopback or 40 ms added CDP latency. Both 11-run profiles enabled `PERF_ENFORCE_BUDGETS=1`. Times are median [minimum, maximum] in ms. [Harness and measurement method](PERFORMANCE.md#measurement-method)

| Measurement | Loopback | +40 ms |
| --- | ---: | ---: |
| Cold catalog ready | 180.6 [135.2, 225.4] | 342.0 [276.0, 356.6] |
| Cold catalog sampled LCP | 104.0 [92.0, 148.0] | 196.0 [188.0, 204.0] |
| Navigation response start | 6.5 [5.9, 10.0] | 41.3 [41.1, 42.6] |
| Catalog → course | 94.8 [93.9, 95.6] | 186.4 [181.7, 195.0] |
| Course → diagnostic | 46.7 [39.0, 47.8] | 96.7 [79.9, 97.3] |
| Submit → recommendation | 46.5 [45.2, 95.7] | 85.7 [80.8, 95.6] |
| Result chunk start relative to POST end | −23.6 [−26.6, −20.0] | −43.3 [−46.5, −42.7] |
| Warm return to catalog | 30.9 [29.9, 45.4] | 31.1 [30.2, 46.2] |

All 22 repetitions fetched the result module before the POST ended, used three GETs, one POST and one PATCH, and recorded zero requests on warm catalog return. Cold catalog assets decoded to 415,618 B JS and 7,481 B CSS. Total gzip JS was 136,188 B and total gzip CSS was 2,108 B. All ceilings and shaped-profile ordering assertions passed. The shaped medians were also below the FE-06 investigation triggers of 450 ms for catalog readiness and 150 ms for submission. Cross-run host and timing variability preclude a speedup estimate. [Enforced assertions](../../tests/e2e/frontend.perf.mjs) · [Reproduce both profiles](PERFORMANCE.md#reproduce)

## Lighthouse

Lighthouse 13.6.0 with headless system Chromium 156.0.8078.79 audited a cold navigation directly to the production `/courses` route, with a new Chrome profile per run, default light scheme and the same seeded local service. It used navigation mode and only the Performance category. Three runs per preset alternated mobile and desktop. Desktop used 1350 × 940, device scale 1, simulated 40 ms RTT and 10,240 Kbps with 1× CPU. Mobile used 412 × 823, device scale 1.75, simulated 150 ms RTT and 1,638.4 Kbps with 4× CPU slowdown. Lighthouse's benchmark index ranged from 3440 to 4027.5. Times are in milliseconds.

| Preset / run | Performance /100 | FCP | LCP | TBT | CLS | Speed Index |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Desktop 1 | 100 | 204 | 204 | 0 | 0.0000 | 204 |
| Desktop 2 | 100 | 204 | 431 | 0 | 0.0000 | 204 |
| Desktop 3 | 100 | 202 | 426 | 0 | 0.0000 | 202 |
| Mobile 1 | 100 | 759 | 759 | 33 | 0.0058 | 759 |
| Mobile 2 | 99 | 754 | 2,038 | 13 | 0.0058 | 754 |
| Mobile 3 | 99 | 752 | 2,081 | 13 | 0.0058 | 925 |

Each run meets the ≥90 threshold for the audited local route. Median desktop/mobile LCP was 426/2,038 ms. LCP varied across runs, especially in mobile simulation. The results cover one local entry route with two seeded courses, simulated throttling, and a single engine. Deployment, CDN and field Core Web Vitals, other routes, and physical mobile performance remain unmeasured.

To reproduce, build with `VITE_API_URL=` and serve the normal production assets against the seeded API through the same-origin Vite preview proxy used by the [browser fixture](../../tests/e2e/fixtures.mjs). With `CHROME_PATH` set to Chromium, run the pinned audit below three times per preset, launching fresh headless Chrome instances. Add `--preset=desktop` for desktop and assign a different output path per sample.

```sh
npx --yes lighthouse@13.6.0 http://127.0.0.1:PORT/courses \
  --only-categories=performance --output=json --output-path=./lighthouse-mobile-1.json \
  --chrome-flags='--headless=new --no-sandbox --disable-dev-shm-usage'
```

## React Profiler

A disposable profiling build used React and React DOM 19.3.0. In a scratch copy of the source, Vite resolved the exact `react-dom/client` import to `react-dom/profiling` and the catalog, diagnostic and result pages wrapped `CourseCatalog`, `AnswerForm` and `AssessmentResult` in React `Profiler` boundaries. Each `onRender` callback recorded its boundary ID, phase, `actualDuration` and `baseDuration`. Playwright 1.65.1 and headless Chromium 159.0.8154.6 drove three fresh desktop contexts per track at 1280 × 720 with no added network latency or CPU throttling. Both tracks traversed search, refresh, diagnostic, a confirmed misconception and a saved decision. Samples were grouped by action after the expected UI state and two animation frames.

| Step | Commits observed in each of six workflows | Total actual duration per step, median [min, max] ms |
| --- | --- | ---: |
| Cold catalog | Catalog mount | 0.80 [0.70, 0.90] |
| Search by track code | One catalog update | 0.20 [0.20, 0.30] |
| Refresh unchanged catalog | Two catalog updates | 0.30 [0.00, 0.50] |
| Course → diagnostic | Departing catalog update and form mount | 0.60 [0.50, 2.40] |
| Fill answer | One form update | 0.15 [0.10, 0.20] |
| Submit misconception | Three form updates and result mount | 1.15 [0.60, 2.50] |
| Accept or reject recommendation | Two result updates | 0.20 [0.10, 0.30] |

Refreshing unchanged data renders the catalog twice as the parent enters and leaves the fetching state, although the filtered list stays the same. That is a candidate for skipping renders if catalog size grows. At the observed maximum of 0.50 ms combined in the sampled subtree, the measurements did not justify component memoization. The submission and decision updates correspond to pending, confirmed and route changes in the sampled flows. These are subtree render times in a profiling bundle. They exclude network wait, browser layout and paint, and components outside the boundaries. Timer resolution explains zero-duration samples. The profiling bundle is separate from the shipped build, the FE-06 harness and Lighthouse.

## Regression verification

| Check | FE-09 result |
| --- | --- |
| `npm ci` | Passed with a workspace npm cache after the default cache produced tarball warnings. npm reported the existing esbuild install-script policy warning. Lockfile unchanged. |
| `npm run test` | 77 passed across six Vitest files. |
| `npm run test:contract` | 20 passed with zero failures or skips. |
| `npm run test:e2e` | 54 passed, 27 desktop Chromium and 27 Pixel 7 emulation. FE-08 had 48. Two additional dark-theme reflow executions and four motion/focus executions account for the increase. |
| Scoped axe checks in the browser suite | 32 scans with zero violations, counted from the four axe attachments. |
| `npm run lint` | Passed. |
| `npm run format:check` | Passed. |
| `npm run build` | Passed, including the production build used for E2E. |
| `npx --yes @apidevtools/swagger-cli@4.0.4 validate docs/api/openapi.json` | Passed. The validator reported its package deprecation. |
| FE-06 harness with enforced budgets | 11/11 loopback and 11/11 shaped runs passed. |

Existing browser assertions and API contract tests were retained. The regular CI configuration runs dependency, format, lint, build, API contract and browser checks. The dedicated FE-06 and FE-09 lab measurements were local runs. [CI workflow](../../.github/workflows/ci.yml)

## Assessment and defense

- **5-point readiness.** Technically ready for assessor review under the observed rubric and current learner scope. FE-08 documented stack rationale, status handling, and pending-state coverage. Ask whether guarded result routes, contextual inline alerts and simulated 401/403 responses meet the expected evidence for the minimum. [Minimum closure](MINIMUM_REQUIREMENTS_CLOSURE.md)
- **10-point readiness.** State Management is technically verified for the implemented stack. Performance and UI/UX are candidates for a second direction if the assessor accepts the documented subset. Architecture remains partial. The rubric requires the minimum plus 2–3 completed directions, and the PDF leaves the within-direction threshold unspecified. Ask whether every listed item is required, whether Redux subscriptions are accepted for reactivity, whether the Lighthouse threshold applies to a deployed URL or more routes, and whether CSS animation and an accessibility sample are sufficient where the MVP has no chartable learner history. Academic acceptance and grading remain with the assessor.
- **Defense scenario 1.** Walk through the Python diagnostic, show clarification and draft retention, submit a recognized misconception, and accept the recommended topic. Then show the Lithuanian path and rejection. Explain scoped write locks and demonstrate a lost confirmation with the existing browser fixture. [Learner and recovery tests](../../tests/e2e/learning.e2e.mjs)
- **Defense scenario 2.** Use the production Network panel to show cold lazy chunks, cache reuse on warm revisit, selective invalidation and the result import overlapping the assessment POST. Present the Lighthouse conditions beside the scores and distinguish the profiler build from production measurements. [FE-06 methodology](PERFORMANCE.md)
- **Defense scenario 3.** Use Tab, the skip link, invalid form submission and the result/decision focus handoff. Show both themes at a narrow width, then enable reduced motion and repeat the control interaction. Explain the measured contrast scope, axe coverage and remaining manual work. [Accessibility tests](../../tests/e2e/frontend-quality.e2e.mjs)
