# FE-06 frontend performance

FE-06 starts at `cbeb32e1da77564ebc522d6e1e935ecdc9c4e346`, the merge of PR #16. GitHub reported PRs #11–#16 merged to `main`, and each merge commit is in the starting history. Linear searches for FE-06 and Frontend Performance returned no matching issue. The FE-00 audit and current repository mapping supply the recorded frontend criteria. The official frontend scoring grid was inaccessible for independent verification. [FE-00 audit](BASELINE_AUDIT.md) · [Stage 3 mapping](TESTING.md#exact-stage-3-rubric-mapping)

## Measurement method

The runner used Debian 13 x86-64 on a managed development VM with an AMD EPYC 9V74 host CPU and a two-CPU cgroup quota. Node 24.22.3, npm 11.19.1, Playwright 1.65.1, headless Chromium 159.0.8154.6 and Docker PostgreSQL 17.12 were used for both revisions. Vite served the production build on loopback with a same-origin proxy to Express. Each repetition started a new browser context, Express process and seeded disposable database. Warm observations stayed within that repetition and reused the loaded modules and RTK Query store. Requests used real Express and PostgreSQL throughout the timed journey.

One worker ran 11 repetitions per revision and profile, with the unthrottled loopback profile first. The second profile adds 40 ms via Chromium DevTools Protocol network emulation with unlimited configured throughput. Both use Playwright's 1280 × 720 desktop profile with no CPU throttling. The samples are synthetic, co-located lab measurements. [Playwright configuration](../../playwright.performance.config.mjs) · [Measurement code](../../tests/e2e/frontend.perf.mjs) · [Browser fixtures](../../tests/e2e/fixtures.mjs)

- Cold catalog readiness measures from document navigation at `/` through the redirect to `/courses`, visible Python course link and two animation frames. Navigation Timing reports document response start, and the last LCP entry received by the readiness snapshot is reported as sampled LCP.
- Route timings measure a browser click event through visibility of the destination exercise link, answer input or catalog link, then one animation frame. Submission measures from the click through the visible recommendation and the same frame checkpoint. Playwright waiting and frame scheduling contribute to elapsed time.
- Resource Timing records decoded JS/CSS bytes and the start of the result module relative to the end of the assessment POST. Playwright counts same-origin request events. Whole-build totals sum the emitted asset file lengths and the gzip size of each asset independently.
- The journey submits the seeded Python misconception, checks the real 201 response, accepts the recommendation and revisits the catalog, course and diagnostic. The existing mobile and Lithuanian journeys run in the regression suite.

## Bottleneck and change

On the baseline, the result page's first chunk request started after the assessment POST completed in every repetition. This serialized the assessment and the first result-chunk load. A locally valid submission now starts the same lazy module import while Express assesses the answer. React Router still navigates only after a confirmed response while the form remains active. Direct result links retain the existing lazy route and recovery behavior. A locally valid answer that the API rejects can download the result chunk earlier than it is needed. The asset stays outside initial catalog loading. [Answer form](../../src/features/learning/AnswerForm.tsx) · [Shared import](../../src/features/learning/loadResultPage.ts) · [Routes](../../src/app/routes.tsx)

The catalog downloads roughly 415 KB of decoded JavaScript, mostly from the entry chunk. That is a size observation. The timing data support targeting the submission waterfall. React component-level re-renders were not quantified because the standard React production build does not expose the profiling callbacks. The scoped Redux selectors and existing cache coverage give a starting point for a separate profiling build if a render issue is observed. [Workflow selectors](../../src/features/learning/workflowSlice.ts)

## Before-and-after results

Timings are median [minimum, maximum] in milliseconds across 11 repetitions per cell. Negative chunk offsets indicate overlap with the POST. [All 44 samples](performance-samples.jsonl)

| Browser measurement | Loopback baseline | Loopback optimized | 40 ms baseline | 40 ms optimized |
| --- | ---: | ---: | ---: | ---: |
| Cold catalog ready | 207.0 [155.3, 236.4] | 212.7 [164.4, 240.0] | 371.1 [283.4, 397.2] | 382.9 [275.4, 395.1] |
| Sampled LCP | 140.0 [120.0, 168.0] | 140.0 [124.0, 172.0] | 228.0 [204.0, 240.0] | 220.0 [204.0, 236.0] |
| Document response start | 8.5 [7.6, 11.9] | 8.6 [7.7, 17.8] | 41.6 [41.4, 42.9] | 42.2 [41.2, 43.8] |
| Catalog → course | 93.4 [92.1, 102.8] | 93.1 [89.5, 123.3] | 189.4 [187.0, 212.5] | 189.4 [187.0, 193.4] |
| Course → diagnostic | 45.1 [44.1, 46.5] | 45.2 [40.0, 46.6] | 94.9 [85.7, 119.3] | 89.7 [84.0, 97.1] |
| Submit → recommendation | 95.4 [45.1, 110.5] | 60.5 [45.1, 109.7] | 189.9 [110.5, 200.0] | 93.2 [86.9, 112.1] |
| Result chunk start relative to POST end | 3.1 [1.9, 5.4] | -30.4 [-46.3, -26.1] | 2.8 [2.0, 4.2] | -43.7 [-50.5, -42.6] |
| Warm return to catalog | 44.9 [29.4, 45.9] | 44.8 [29.5, 46.9] | 45.0 [29.8, 46.4] | 43.3 [29.7, 46.6] |

The result chunk began before the POST finished in all 22 optimized runs. Median click-to-recommendation time fell by 34.9 ms on loopback and 96.7 ms in the 40 ms profile (37% and 51%). Loopback timing ranges overlap and the browser visibility wait adds variation in both profiles. The request ordering directly verifies the removal of the waterfall. The other navigation metrics vary across runs and do not establish a speedup.

| Asset or request measurement | Baseline | Optimized |
| --- | ---: | ---: |
| Cold catalog decoded JS | 415,394 B | 415,427 B |
| Cold catalog decoded CSS | 7,330 B | 7,330 B |
| All emitted JS, raw / gzip | 425,181 / 136,099 B | 425,252 / 136,161 B |
| All emitted CSS, raw / gzip | 7,330 / 2,049 B | 7,330 / 2,049 B |
| Cold catalog requests | 6 | 6 |
| First course navigation requests | 3 | 3 |
| First diagnostic navigation requests | 2 | 2 |
| Submission through recommendation requests | 2 | 2 |
| Warm catalog return requests | 0 | 0 |
| Journey API requests, including decision and warm revisit | 3 GET, 1 POST, 1 PATCH | 3 GET, 1 POST, 1 PATCH |

A successful assessment and a decision leave fresh reads reusable. RTK Query still revalidates subscribed query keys on remount after 60 seconds and retains unused course data for 120 seconds. The live stale-exercise regression deactivates the seeded Python exercise in its disposable database after both courses' exercise data have been read. A real 404 triggers exactly one refresh of the Python exercise collection, no attempt row is created, and the Lithuanian exercise collection is reused when revisited. The store integration test independently checks the affected tag and unchanged request counts for the other course and topics. [Cache policy](STATE_MANAGEMENT.md#cache-and-query-lifecycle) · [Live cache regression](../../tests/e2e/navigation.e2e.mjs) · [Store integration tests](../../src/features/learning/learning.integration.test.ts)

## Performance budgets

| Budget | Limit and rationale |
| --- | --- |
| Cold catalog JS and CSS | ≤425,000 B JS and ≤8,000 B CSS decoded. These allow roughly 2% and 9% growth over the measured baseline. |
| Entire emitted asset set | ≤140,000 B JS and ≤2,300 B CSS summed gzip. These allow roughly 3% and 12% growth over the measured baseline, including currently deferred routes. |
| Request reuse | Exactly three GETs, one POST and one PATCH in the measured journey, with zero requests on the warm catalog return. The three GETs cover catalog, topics and exercises. |
| Result request order | The result chunk starts before the POST ends in the 40 ms profile. This catches a return of the measured waterfall without pinning a wall-clock assertion to host load. |
| Lab timing review | Review an 11-run median above 450 ms for cold catalog readiness or 150 ms for submission under the 40 ms profile. These thresholds allow headroom above the optimized run ranges and are manual investigation triggers. |

The harness always checks request reuse. Set `PERF_ENFORCE_BUDGETS=1` for byte ceilings and the shaped-profile request-order check. The regular CI browser suite covers the behavioral regressions, including stale invalidation. Byte and order budgets run through the dedicated desktop harness.

## Reproduce

Use Node 24, the locked npm dependencies, Playwright Chromium and a disposable PostgreSQL 17 service. Follow [the existing Docker setup](TESTING.md#run-locally) through exporting `CONTRACT_DB_URL`, then run these commands in the same shell before the container exits.

```bash
VITE_API_URL= npm run build
PERF_ENFORCE_BUDGETS=1 npx playwright test -c playwright.performance.config.mjs
PERF_ENFORCE_BUDGETS=1 PERF_LATENCY_MS=40 npx playwright test -c playwright.performance.config.mjs
```

To reproduce the baseline, create a separate worktree at `cbeb32e`, copy `playwright.performance.config.mjs` and `tests/e2e/frontend.perf.mjs` from the FE-06 branch into the same paths, and run `npm ci` and the same commands with `PERF_ENFORCE_BUDGETS=0`. The baseline must run against its own compiled `dist`. Both runs print one `PERF` JSON line per repetition. Keep browser and database versions constant, run profiles serially, and compare medians and ranges. For the regression suite, run `npm test`, `npm run test:contract` and `npm run test:e2e`.

## Rubric traceability and handoff

The Advanced Performance direction has evidence for route chunking, repeatable browser measurements, an identified and removed request dependency, bounded asset growth, and fresh-cache reuse and scoped invalidation. The Stage 3 mapping lists it as partially verified on the strength of the recorded evidence. No official grading decision or diploma KPI attainment is established. [Rubric mapping](TESTING.md#exact-stage-3-rubric-mapping)

The results cover desktop Chromium on loopback with two synthetic network conditions and a small seeded course catalog. They do not measure CDN compression or caching, cross-origin networking, geographically distributed users, field Core Web Vitals, or other browser engines. LCP is sampled during the cold checkpoint. The byte budgets describe decoded and locally gzipped assets. The next stage can retain this harness as a regression reference and repeat the measurements against the intended hosting configuration when available. If component rendering becomes a suspect, collect React DevTools profiles using a dedicated profiling build and isolate that run from production timings. Existing mobile regression execution covers functionality and layout.

## FE-09 follow-up, 27 November 2026

The [advanced requirements closure](ADVANCED_REQUIREMENTS_CLOSURE.md#production-bundle-and-fe-06-budgets) records the same enforced budgets, a baseline comparison for the production bundle, desktop and mobile Lighthouse catalog measurements, and a separate React profiling build. The FE-06 comparison above describes its original revisions.
