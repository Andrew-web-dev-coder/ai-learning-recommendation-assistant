# FE-07 — Final frontend audit

**Audit date:** 27 November 2026 (Europe/Kiev)

**Repository:** Andrew-web-dev-coder/ai-learning-recommendation-assistant

**Audited main:** [`2a8fa8c42a5d9f60606257cd064848d4c9b82c85`](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/tree/2a8fa8c42a5d9f60606257cd064848d4c9b82c85)

The attached *Frontend - Diploma Project Knowledge Base*, pp. 1–4, supplies the Stage 3 assessment criteria. The FE-07 request governs the audit scope and deliverables. The [evidence matrix](FRONTEND_FINAL_EVIDENCE_MATRIX.md) quotes the criteria, ties them to inspected code and tests, and records open items. FE-00 is a historical comparison point. The Linear search for FE-07 returned no accessible match.

## Audited history

The remote `refs/heads/main`, the clone's `origin/main`, and the audit starting commit agreed. GitHub reported **MERGED** with base `main` for all seven PRs. Their returned merge SHAs appear on the first-parent history of the audit commit. `2a8fa8c` is both the requested merge commit and the audited tip.

| PR | Merge commit on audited main |
| --- | --- |
| [#11](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/11) | `7825b53f14fe916b5f1e0992fc97c2afba2650c2` |
| [#12](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/12) | `a9caa886c465dae24685e67d757eaa0006cef62d` |
| [#13](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/13) | `fd3d977a6e922363c8e5d8a07b318f1e518db823` |
| [#14](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/14) | `1ef871307c79e33cda9d79a6b872107b0336f7b0` |
| [#15](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/15) | `1c43b92acfaa6e8c36e51d9e980b0f6daff6e98c` |
| [#16](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/16) | `cbeb32e1da77564ebc522d6e1e935ecdc9c4e346` |
| [#17](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/17) | `2a8fa8c42a5d9f60606257cd064848d4c9b82c85` |

## FE-00 comparison

| Topic | FE-00 mapping and official assessment reference |
| --- | --- |
| Modern SPA, separation and route count | A1–A5 capture the core requirements. Angular-only modules have no explicit row. The audited React app declares four functional route patterns, with the result behind session state. The redirect and catch-all are extra. |
| Documentation | D1–D5 broadly match the PDF. D5 covers stack rationale, which specifically includes the UI kit. Current docs explain React and state choices and describe the custom kit. The choice of a custom kit needs explicit rationale. |
| API interaction | A6–A9 capture the API criteria. The PDF recommends TypeScript for React/Vue and requires it for Angular. The current client is typed. Full runtime read validation would harden the client and goes beyond the PDF's data-interface wording. |
| Implementation | I1–I12 cover the implementation items. I6 grouped controlled forms and validation. I7 treated dropdown options as lists and I8 considered course scoping. The current semantic lists and explicit search allow direct verification independent of those interpretations. |
| Error handling | E2 omitted the parenthetical toast/snackbar/dialog examples. Current contextual alerts provide clear feedback. Ask whether presentation format affects acceptance. E4 inferred full loading coverage from the old screen's tested paths. The current rubric still requires coverage across user-visible async surfaces. The official statuses include 401 and 403 even though the current API has no login or authorization contract. |
| Testing | T1–T3 capture the units, integration/E2E and test subject. The PDF gives “1--2 tests” under minimum requirements. The evidence matrix uses that as a minimum target. |
| Restrictions | FE-00 had no systematic restriction mapping. Some entries discussed monolithic rendering, inline styling and handled errors. The six official restrictions now have dedicated evidence rows, including explicit `any`, credentials and the static-page prohibition. |
| Advanced Architecture | FE-00 proposed feature structure and lazy modules. The PDF also lists micro frontends, BFF and a named architecture approach. The current `TESTING.md` direction-level “Verified” overstates the documented feature and lazy-loading evidence under the full list. |
| Advanced State Management | The baseline proposed Redux Toolkit, RTK Query, selectors and stale-response handling. The audit also checks reactive updates, effects, memoization and complex async chains. React Redux subscriptions and RTK Query provide the reactive behavior. The PDF lists other reactive technologies as examples without specifying how an equivalent is accepted. |
| Performance | FE-00 suggested route splitting, profiling and repeatable timings. The official list explicitly includes component memoization, Web Workers, bundle reduction/analysis and Lighthouse ≥90 on desktop and mobile. FE-06 records a measured latency improvement, while JS bytes increase slightly against its chosen baseline. |
| Advanced UI/UX | FE-00 focused on reusable UI, themes and accessibility. The PDF also lists animations and visualizations, and names ARIA, keyboard navigation and contrast. FE-05 gives scoped evidence for those accessibility dimensions and documents limits. |
| Maximum rule | FE-00 left the number of directions open. The PDF requires all minimum items plus completing 2–3 of the four directions. It does not specify the completion threshold inside each direction. |

[FE-00 traceability](frontend/BASELINE_AUDIT.md#minimum-rubric-traceability) · [FE-00 advanced mapping](frontend/BASELINE_AUDIT.md#advanced-directions-and-feasibility) · [Existing Stage 3 mapping](frontend/TESTING.md#exact-stage-3-rubric-mapping)

## Reproducibility

Local environment was Linux, Node 24.22.3, npm 11.19.1, Playwright 1.65.1 with Chromium 159.0.8154.6, and Docker PostgreSQL 17.12 on loopback. The browser harness used Vite production preview, the local Express API and a fresh seeded PostgreSQL database per test. Browser mobile results use the Pixel 7 Chromium profile. Follow the repository’s disposable database setup, build with an empty `VITE_API_URL` for the same-origin preview, and run the two performance profiles serially. [Local test setup](frontend/TESTING.md#run-locally) · [Performance reproduction](frontend/PERFORMANCE.md#reproduce)

| Check | Local result at audited SHA |
| --- | --- |
| `npm ci` | Passed with a fresh workspace npm cache after tarball warnings with the default cache. npm reported its install-script policy. No lockfile or dependency changes were required. |
| `npm run test` | Passed. 77 tests across six files. The total includes current frontend tests, backend classifier tests and archived prototype tests. |
| `npm run test:contract` | Passed. 20 passed, zero failures or skips. Initial database setup used a nonexistent role. The rerun used the disposable PostgreSQL service's initialized role. |
| `npm run test:e2e` | Passed. 38 cases across desktop Chromium (19) and Pixel 7 Chromium emulation (19), including four axe cases covering eight states each, with zero violations in those scans. |
| `npm run lint` | Passed. No ESLint diagnostics. |
| `npm run format:check` | Passed for the repository's configured scope. |
| `npm run build` | Passed. TypeScript and Vite produced the app and separate course, catalog, diagnostic, result and Not Found chunks. Entry JS was 413.19 kB raw, 132.22 kB gzip as displayed by Vite. |
| `npx --yes @apidevtools/swagger-cli@4.0.4 validate docs/api/openapi.json` | Passed. The pinned CLI emitted its package deprecation warning. |
| `PERF_ENFORCE_BUDGETS=1 npx playwright test -c playwright.performance.config.mjs` | Passed. 11/11 optimized desktop repetitions with byte and request-count checks. |
| Same performance command with `PERF_LATENCY_MS=40` | Passed. 11/11 optimized desktop repetitions with byte, request-count and request-order checks. |

The [exact-SHA GitHub Actions push run](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/actions/runs/46002797989) independently passed `verify`, `http-contract`, and `frontend-e2e`. Its logs show 77 Vitest tests, 20 HTTP contract tests and 38 browser cases passed. The regular workflow has no FE-06 performance job. The run reported that Node.js 20-targeting actions `actions/checkout@v4`, `actions/setup-node@v4` and `actions/upload-artifact@v4` were forced onto Node.js 24. This concerns the runtime of the actions themselves. The workflow already installs Node 24 for application commands. Track upgrades in a maintenance PR. [Workflow](../.github/workflows/ci.yml) · [GitHub runtime notice](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/)

## FE-06 performance evidence

The FE-06 change starts the shared lazy result import after local validation while the attempt POST is in flight. It navigates after confirmed assessment if the submitting form still owns navigation. Audited code and browser assertions agree with the dependency change. Every tracked sample reports three GETs, one POST, one PATCH and zero requests on the warm catalog return. The test also asserts these counts. [Submission handler](../src/features/learning/AnswerForm.tsx#L35-L48) · [Performance assertions](../tests/e2e/frontend.perf.mjs#L82-L114)

Recalculation from the 44 committed JSONL rows confirmed four groups of 11 unique repetitions. FE-06 uses the pre-PR #17 baseline `cbeb32e` and the optimized revision merged in PR #17. Times below are median [minimum, maximum] in milliseconds.

| Metric | Loopback baseline → optimized | 40 ms latency baseline → optimized |
| --- | --- | --- |
| Submit to visible recommendation | 95.4 [45.1, 110.5] → 60.5 [45.1, 109.7] | 189.9 [110.5, 200.0] → 93.2 [86.9, 112.1] |
| Result chunk start relative to POST end | 3.1 [1.9, 5.4] → −30.4 [−46.3, −26.1] | 2.8 [2.0, 4.2] → −43.7 [−50.5, −42.6] |
| Cold catalog ready | 207.0 [155.3, 236.4] → 212.7 [164.4, 240.0] | 371.1 [283.4, 397.2] → 382.9 [275.4, 395.1] |
| Sampled LCP | 140.0 [120.0, 168.0] → 140.0 [124.0, 172.0] | 228.0 [204.0, 240.0] → 220.0 [204.0, 236.0] |

The chunk started during the POST in 22/22 optimized samples and 0/22 baseline samples. The timing ranges show overlap for loopback submission, and the data establish no cold catalog speedup. Total JS went from 425,181 B to 425,252 B raw and 136,099 B to 136,161 B gzip. Decoded cold JS went from 415,394 B to 415,427 B. CSS stayed at 7,330 B raw and 2,049 B gzip. The differential supports a request-order and submission-latency claim. [Raw samples](frontend/performance-samples.jsonl) · [FE-06 method and budgets](frontend/PERFORMANCE.md)

The local rerun passed 44/44 repetitions across the two revisions and profiles. The baseline used an isolated worktree with its own production build and the audited FE-06 harness copied in. Both revisions have identical dependency manifests and shared the locked dependency installation. Budget enforcement was enabled for the audited revision and disabled for the baseline. Request counts and byte totals matched the tracked samples.

| Local rerun metric | Loopback baseline → audited main | 40 ms latency baseline → audited main |
| --- | --- | --- |
| Submit to visible recommendation | 96.4 [45.3, 127.1] → 110.2 [44.0, 129.4] | 194.3 [110.7, 212.1] → 110.4 [88.8, 116.8] |
| Result chunk start relative to POST end | 3.3 [2.8, 4.6] → −35.2 [−49.6, −29.1] | 3.4 [2.2, 10.0] → −44.3 [−48.0, −42.9] |
| Cold catalog ready | 220.8 [188.3, 270.6] → 215.8 [174.6, 449.3] | 380.6 [317.8, 393.1] → 388.1 [305.8, 394.3] |
| Sampled LCP | 144.0 [128.0, 188.0] → 160.0 [132.0, 348.0] | 232.0 [216.0, 260.0] → 236.0 [216.0, 256.0] |

The local rerun reproduced request overlap in every optimized repetition and the lower shaped-network submission median. The loopback submission median increased on this rerun. Wall-clock timings vary by run, while resource ordering was consistent across both datasets.

The FE-06 timings are **desktop laboratory measurements** on a seeded dataset. Network shaping adds synthetic latency. LCP is sampled at the readiness checkpoint. Local decoded and gzipped asset bytes do not measure production transfer, CDN caching or compression. There are no Lighthouse scores, mobile performance runs, or production field Core Web Vitals in the evidence. The browser regression suite supplies separate mobile functionality and layout evidence. FE-05's separate browser page-zoom exercise is documented historical evidence. This audit reran the suite's viewport and enlarged-text checks. [FE-05 accessibility evidence](frontend/ACCESSIBILITY.md) · [Performance limits](frontend/PERFORMANCE.md)

## Preliminary readiness

**5-point path — close, with three open minimum rows.** The strongest evidence covers the SPA, navigation diagrams, typed API integration, reusable UI, form, lists, search, desktop/mobile layout, restrictions and testing. The matrix keeps the explicit custom kit rationale (M5), full HTTP-status evidence (M29) and exhaustive pending-state verification (M30) open. Inline alerts, guarded routes and scoped format checks are documented so the assessor can judge their fit.

| Advanced direction | Whole-direction status | Main basis and gap |
| --- | --- | --- |
| Advanced Architecture | PARTIALLY VERIFIED | Feature and lazy route boundaries. Micro frontends and BFF are absent, and named architecture conventions are only partially substantiated. |
| Advanced State Management | VERIFIED | Redux Toolkit slices, reactive subscriptions, memoized selectors and async orchestration with real and injected scenarios. This is an engineering judgment about equivalent reactive behavior. |
| Performance | PARTIALLY VERIFIED | Verified route splitting and lab request ordering. Desktop/mobile Lighthouse ≥90, workers and component memoization remain unverified, and the FE-06 comparison shows slightly higher JS bytes. |
| Advanced UI/UX | PARTIALLY VERIFIED | Custom kit, dark/light themes, keyboard and automated accessibility evidence. Dedicated animation, charts/dashboard and comprehensive accessibility verification remain open. |

**10-point path — completion remains unverified.** The minimum gaps remain open, and one complete direction has substantiated engineering evidence under the interpretation above. Obtain assessor guidance on how individual examples contribute to a completed direction before selecting a second or third direction to close. These judgments are for preparation and human review. The academic assessor determines approval and points.

## Prioritized corrective actions and defense evidence

| Priority | Recommended follow-up |
| --- | --- |
| P1 — minimum evidence | Document the custom kit decision. Exercise 401 and 403 with browser fixtures, and explicitly delay cold course reads and route chunk loads. Capture recovery and pending states. Ask whether inline alerts and synthetic access errors satisfy the assessment. |
| P1 — assessment interpretation | Confirm what completes a direction and whether React Redux reactivity meets the state direction's examples. Use the answers to select additional advanced evidence within the approved project scope. |
| P2 — advanced evidence | Capture repeatable deployment Lighthouse desktop/mobile reports, including settings, URL, revision and multiple runs. Record manual keyboard, screen-reader and contrast results in both themes. Measure bundle reduction against a justified comparison if claiming it. |
| P3 — maintenance | Review upgrades for the three Node.js 20-targeting actions and the deprecated OpenAPI validator separately, with CI parity checks. |

For the defense, present the audited SHA and merged PR history, then walk through the module and navigation diagrams. Demonstrate catalog search, a validated diagnostic, uncertainty and correction, and a saved decision on desktop and the mobile layout. Show the request/cache trace and the stale exercise, conflict and ambiguous-write recovery cases with seeded data.

Bring the exact-SHA CI link and browser report, including axe attachments and captures for both themes. The CI artifact has a seven-day retention window. [CI browser evidence](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/actions/runs/46002797989/artifacts/15199610439) Show the FE-06 raw timings, request-order comparison and byte totals with the lab conditions visible. Bring desktop/mobile Lighthouse or expanded manual accessibility evidence only if collected and label the measured scope. [Architecture diagrams](frontend/ARCHITECTURE.md) · [Browser test guide](frontend/TESTING.md) · [FE-06 evidence](frontend/PERFORMANCE.md)
