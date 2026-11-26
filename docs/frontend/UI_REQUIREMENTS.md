# FE-03 frontend UI requirements

FE-03 starts from `fd3d977a6e922363c8e5d8a07b318f1e518db823`, the merge of PR #13. The starting history includes PR #12 at `a9caa88` and PR #11 at `7825b53`. The audit records the original frontend evidence. [FE-00 audit](BASELINE_AUDIT.md) · [FE-01 architecture](ARCHITECTURE.md) · [FE-02 state management](STATE_MANAGEMENT.md)

## Catalog

The catalog renders the returned course titles and codes as a list of course links. Search trims outer whitespace and matches substrings in a title or course code case-insensitively. Clearing the input restores the full list and returns keyboard focus to the search field. The status announces the number of visible courses or suggests how to recover from no matches. A successful empty catalog has its own message. Initial fetches show loading, failed reads offer retry, and a failed refresh keeps cached courses visible with the error. Search text is local to the catalog, and typing or clearing it does not touch the RTK Query subscription. [Catalog page](../../src/pages/CoursesPage.tsx) · [Catalog component](../../src/features/learning/CourseCatalog.tsx) · [Search function](../../src/features/learning/courseSearch.ts)

## Diagnostic and recommendation

- The diagnostic form labels the required textarea and associates it with the exercise prompt and the length instruction. An invalid submit shows an inline alert, marks the field invalid, focuses it, and sends no request. Validation rejects empty or whitespace-only answers and enforces the existing 5,000 UTF-16 code-unit limit. Free-form answers, including code and Lithuanian text, use the same rules. The form owns its draft and validation state. The thunk and API boundary reuse the validation function. [Answer form](../../src/features/learning/AnswerForm.tsx) · [Validation](../../src/features/learning/answerValidation.ts)
- The attempt shows pending feedback while the scoped workflow guard prevents duplicate writes. A confirmed assessment opens the result route and focuses its outcome heading. A 422 classification uncertainty invites clarification, and a determinate failure displays its error with the draft available. An ambiguous attempt keeps the draft and pauses further submission for that exercise within the tab. [Answer form](../../src/features/learning/AnswerForm.tsx) · [Workflow guards](../../src/features/learning/workflowActions.ts)
- The result shows the correct outcome and the service message, or the incorrect outcome with the returned error category ID, recommended topic, and available explanation. The contract supplies a category ID without a display label. The recommendation buttons identify the actions, and both are disabled while a decision is pending. Save confirmation reports the returned decision. Determinate failures explain the error, with retry available when the scoped workflow permits it. Conflict closes the buttons without inferring the recorded decision. An ambiguous outcome also closes the buttons. No POST or PATCH automatically retries. [Result](../../src/features/learning/AssessmentResult.tsx) · [Recommendation](../../src/features/learning/RecommendationCard.tsx) · [OpenAPI](../api/openapi.json)

## Components and accessibility

| Area | Implementation |
| --- | --- |
| Shared controls | Typed native `Button` for form submit, clear, refresh/retry and decisions. Controlled `SearchInput` associates its label and restores focus on clear. |
| Shared feedback | `StatusMessage`, `Loading` and `ErrorMessage` provide status and alert semantics. `QueryFeedback` composes them for catalog and course reads. |
| Learning feature | `CourseCatalog` owns filtering and list presentation. `AnswerForm` owns the draft and field feedback. `AssessmentResult` renders the outcome and delegates the topic, explanation and decision UI to `RecommendationCard`. |
| Layout and keyboard | The existing semantic app shell and routed panels retain native links, buttons and lists. Explicit focus styles, a wrapping search/action layout, vertical textarea resizing, and text wrapping support narrow viewports. |

## Evidence against the FE-00 audit

| Exact baseline criterion | FE-03 evidence |
| --- | --- |
| A9 — Loading and error states | Separate initial loading, refresh, read error/retry, empty catalog and no matches states. |
| I2 — Component-based UI | Catalog, form, outcome and recommendation each have a focused component. |
| I3 — Reusable components | Shared button, search field and status components have typed props. |
| I4 — Layout components | The existing shell hosts the routed catalog, form and result, and wrapping layouts support narrow screens. |
| I5 — UI library or custom UI components | Custom components built on native HTML controls. |
| I6 — Controlled forms and validation | Local controlled answer, associated instructions, visible validation and contract-matched guards. |
| I7 — Data tables or lists | Linked catalog list with course codes. The existing route presents topic and exercise lists. |
| I8 — Filtering, searching or sorting | Explicit title/code search, clear and no-match recovery. |
| I9 — Desktop and mobile responsiveness | Chromium smoke at 1440 × 900 and 375 × 812. |
| I10 — Clean/readable code | Typed components, shared contract validation and separated recommendation presentation. |
| E2 — Clear user-facing errors | Field error, catalog retry, clarification, and distinct decision failure, conflict and uncertain outcomes. |
| E4 — Loading for all async operations | Status feedback for catalog reads, attempt writes and decision writes. |
| T1 — Unit tests for at least three key current frontend units | New focused tests for catalog search, answer validation and result/recommendation presentation. |
| T2 — At least 1–2 frontend integration or E2E tests | Existing RTK Query/workflow integration tests and the Chromium workflow smoke below. The smoke harness was temporary. |
| T3 — Tests for forms, state or client-side API | New validation and state presentation tests, plus existing cache, write and workflow guards. |

## Verification

Node 24.22.3 and npm 11.19.1 completed `npm ci` with a writable npm cache. `npm run lint`, `npm run test`, and `npm run build` passed. Vitest passed **76 tests across five files**, including 21 new FE-03 cases and all 55 existing cases. The OpenAPI validator passed with `npx --yes @apidevtools/swagger-cli@4.0.4 validate docs/api/openapi.json`. `npm run test:contract` passed **20 checks** with the repo harness against disposable PostgreSQL 17.12.

Headless Chromium 156 ran against the production preview, live Express and a separate seeded database on the disposable PostgreSQL service. Browser interception supplied delayed, empty and failed responses as indicated.

| Browser scenario | Observed result |
| --- | --- |
| Desktop catalog at 1440 × 900 | Delayed initial load, injected 500 and retry, case-insensitive search, no matches, keyboard clear and focus restoration passed. Two catalog GETs covered the initial failed load and explicit retry. Searching, clearing, going from catalog to Python diagnostic, and saving the decision added zero catalog GETs. An isolated empty response displayed the empty-catalog message. |
| Desktop Python | Blank and whitespace input sent no POST. An unclassified answer retained the draft. The incorrect answer showed the category ID and Type Conversion. Two rapid submissions sent a single POST, and two rapid accept actions sent a single PATCH. Delayed responses exposed disabled controls and pending feedback. Acceptance was confirmed. |
| Mobile Lithuanian at 375 × 812 | Catalog, course navigation, diagnostic and result fit without horizontal page overflow. The incorrect answer showed Accusative Case and rejection was confirmed. Correct Python and Lithuanian answers both showed the correct result without a recommendation. |
| Failure, conflict and ambiguous outcomes | Injected 400 POST and PATCH failures showed errors and allowed the applicable retry. A competing real PATCH produced 409. For POST and PATCH separately, the server committed before Chromium lost the response. The form retained the draft, the affected controls stayed closed, and reload created no new write. |

## Production bundle

Vite 8.3.3 output in kB, raw / gzip. Both builds ran under the same Node/npm versions.

| Asset | FE-02 | FE-03 |
| --- | ---: | ---: |
| Entry JS | 411.15 / 131.57 | 411.44 / 131.70 |
| Catalog route | 0.66 / 0.40 | 1.76 / 0.84 |
| Course route | 1.69 / 0.72 | 1.70 / 0.72 |
| Diagnostic route | 2.48 / 1.18 | 3.01 / 1.40 |
| Result route | 2.09 / 0.86 | 2.59 / 1.04 |
| Not Found route | 0.25 / 0.20 | 0.25 / 0.20 |
| Shared query feedback | 0.35 / 0.26 | 0.36 / 0.27 |
| Shared workflow actions | 1.44 / 0.67 | 1.43 / 0.65 |
| Shared button | — | 0.18 / 0.16 |
| CSS | 1.28 / 0.65 | 2.08 / 0.93 |

## Limitations and handoff

Search is a local substring match. Results and write locks are in-memory for the current tab, and the API has no read to reconcile a lost write confirmation. Browser smoke ran in Chromium only, at the two listed widths. Screen-reader output, systematic keyboard and zoom coverage, contrast measurement, and WCAG conformance were outside this verification. No runtime timings or Lighthouse measurements were collected.

- **FE-04** should add a persistent browser suite with a saved decision and a failure/revision flow, and extend tests for cross-route navigation, conflict and post-commit confirmation loss.
- **FE-05** should cover the visual system, themes and systematic accessibility evaluation. Formatter and basic frontend logging remain open tooling criteria for future scope.
- **FE-06** should establish reproducible browser timing and performance budgets, then prioritize changes from measured evidence.
