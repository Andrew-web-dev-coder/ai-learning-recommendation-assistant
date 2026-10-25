# Final practice report — Learning Path Assistant (AND-10)

Prepared 2026-10-25 for student review and defense. Practice: EHU AI-Native Practice 2026; Lab 04 — Applied Intelligent Systems; declared type: hybrid MVP plus experiment. Audited implementation baseline: `147a42adb007dcc21e865f2192f80752caf861c6` (main / PR #6). This package adds documentation only. It is not an official completion certificate or a student-signed contribution statement.

## Scope and outcome

The intended user is a student learning JavaScript who needs help selecting a next topic from a goal and self-assessed knowledge. The [passport](PROJECT_PASSPORT.md) proposes more relevant recommendations than a fixed learning sequence. The delivered prototype implements a bounded next-topic workflow; comparative relevance and educational benefit remain unproven.

Delivered scope: one catalog of Variables and Data Types, Functions, Arrays, Objects and DOM Manipulation; three knowledge levels; goal selection; topic recommendation with explanation/material link; accept/reject feedback. No additional courses, LLM, backend, database, authentication or persistent history are implemented. AND-10 adds no dependencies or functionality.

## Architecture and implementation

The React 19 UI in [App.tsx](../src/App.tsx) holds goal, progress, recommendation and feedback in memory. [learning.ts](../src/data/learning.ts) contains the local catalog, initial progress and pure recommendation function. TypeScript 6 supplies static checks, Vite 8 transforms/serves/builds, Vitest 5 evaluates the engine, ESLint 10 checks source. See [architecture](ARCHITECTURE.md) and [manifest](../package.json).

Data flows from goal and progress to `recommendNextStep`, then to topic, explanation and link. The function scans the fixed ordered prefix ending at the goal, selecting its first topic not marked understood. It treats both Not started and Need practice as candidates in sequence order; it does not globally prioritize all struggling topics. If the prefix is understood, it recommends reviewing the goal topic. This is a fixed sequence assumption, not an independently modeled prerequisite graph or learned personalization.

The initial DOM goal recommends Functions because Variables is understood and Functions needs practice. Updating a knowledge level or goal clears the previous recommendation and feedback. Accept/reject changes feedback text only; it does not train the method. Reload resets all React state. Learning links point to javascript.info and leave the app. No external API is required for recommendation generation.

## Evaluation and error analysis

The existing [evaluation report](EVALUATION_REPORT.md) records a historical 2026-10-08 run. This report records an independent fresh run below. The [test suite](../src/data/learning.test.ts) defines ten explicit goal/progress/expected-topic cases and three catalog checks. Each scenario checks expected topic identity, a nonempty explanation, and catalog membership. Catalog tests check count, unique IDs and titles.

Fresh scenario agreement is 10/10 (100%); catalog checks are 3/3. Expected results encode the same ordered-path assumption as the engine. These tests establish agreement with selected rules, not mastery assessment, causal learning improvement, recommendation quality in general, or superiority over a baseline. There is no real-student study, baseline comparison, automated UI suite or measured accept/reject usefulness.

| Risk / uncovered behavior | Evidence and implication | Needed verification |
| --- | --- | --- |
| Self-assessment is inaccurate | Inputs are entirely self-reported; no observed failure data collected | Consented user evaluation or an agreed external assessment |
| Fixed order mismatches a learner's needs | Prefix scan is visible in source; ten expected cases reuse this assumption | Compare against an agreed baseline and independent judgments |
| Feedback appears adaptive | Source only changes feedback text | Demonstrate repeated recommendation is unchanged unless inputs change |
| UI behavior regresses despite unit success | Tests import engine only; no UI assertions | Run and record full demo, keyboard/accessibility checks separately |
| External material unavailable | Links exist; remote availability not checked here | Verify links before defense; label network failures separately |
| Progress disappears | State is in-memory by design | Demonstrate reset and explain limitation |

These are source-based risk analyses, not invented empirical failures. No repository defect was established by the passing required checks; untested behavior remains unverified.

## Verification record

Executed on 2026-10-25 in the repository root using Node `v24.19.0`, npm `11.9.0`. Installation and HTTP checks occurred during the same session's environment setup; tests/lint/build were freshly rerun for AND-10. Commands preserve the committed lockfile and TLS/integrity verification.

| Command/check | Actual outcome | Limit |
| --- | --- | --- |
| `npm ci --cache /workspace/.npm-cache --no-audit --no-fund` | Passed; 178 packages installed during setup | No vulnerability audit claimed |
| `npm test` | Exit 0; Vitest 5.0.3, 1 file, 13 passed; no failures or skipped tests reported | Ten rule scenarios plus three catalog checks; no browser suite |
| `npm run lint` | Exit 0; no diagnostics | Static code quality check |
| `npm run build` | Exit 0; TypeScript and Vite 8.3.3, 18 modules; production artifacts in dist | No production deployment |
| `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` | Startup succeeded during setup | Running process alone is insufficient evidence |
| Local GET `/`, `/src/App.tsx`, `/src/data/learning.ts` | HTTP 200 and expected entry/title/topic content during setup | Serving/transformation only; no browser interaction |
| AND-10 remote CI, browser demo, accessibility, external links | Not verified | Must not be described as passed |

For reproduction use [README](../README.md) and [defense demo](DEFENSE_DEMO.md). No secret, environment variable, backend or database is needed. Node 24 matches CI. Existing isolated checkout is sufficient; no extra worktree is required.

## Development evidence and individual contribution

Fetched main history confirms these merge commits and issue references. Linear is unavailable in this session; issue identifiers below are references, not verified issue URLs/statuses. No Linear URL is fabricated. [AND-8 workflow](AGENT_WORKFLOW.md) contains historical branch, PR #4 CI and review observations; those are dated records, not current AND-10 results.

| Work reference | Repository evidence | What it supports |
| --- | --- | --- |
| AND-5 scaffold | [PR #1](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/1), commit `fc5b367`, merge `7abe48a` | React/TypeScript/Vite scaffold history |
| AND-6 MVP | [PR #2](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/2), commit `984f639`, merge `139db5d` | Recommendation UI and engine implementation history |
| Evaluation/docs | [PR #3](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/3), commit `6c5bb74`, merge `a24ef5e` | Automated evaluation and project documents |
| AND-7 audit | [PR #4](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/4), merge `2c624bd` | Detailed user-supplied rubric audit |
| AND-8 workflow | [PR #5](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/5), commit `ee3a94c`, merge `a8dc21a` | Agent workflow and dated evidence chain |
| AND-9 reproduction | [PR #6](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/6), commit `ab6790a`, merge `147a42a` | Project README and demo instructions; resolves old template README gap |
| AND-10 defense package | Branch `docs/and-10-final-defense-package`; [handoff](AND_10_HANDOFF.md) | Current agent-assisted documentation work; no merge/approval implied |

Git records name Andrei Yeudakimau on scaffold, MVP and evaluation commits, Martin on AND-7–AND-9 documentation commits, and Andrew-web-dev-coder on merge commits. These are repository attribution leads, not verified identity mappings or proof of unaided engineering work. PR #6 HTML inspected in this session contains its merge and “No reviews”; merging does not establish a formal approval review. Complete historical agent traces were not available.

**Student contribution statement: pending student attestation.** Before submission, the student should identify their actual design, implementation, testing and documentation work with commit/PR evidence; identify agent-generated portions and their own corrections; explain the algorithm and tests live; describe review/acceptance decisions; and date/sign the statement in the university-approved format. Do not submit an agent-written first-person claim as a verified student declaration.

For AND-10, Codex inspected instructions, source, tests, docs, CI and fetched Git history; audited the inherited rubric; prepared this report, matrix, demo, presentation and handoff; ran tests/lint/build; and prepared the branch/PR handoff. The student remains responsible for reviewing accuracy, confirming contribution and external evidence, performing the defense and obtaining university decisions. This records the current task only, without reconstructing earlier sessions.

## Defense package and remaining decisions

Use [evidence matrix](FINAL_EVIDENCE_MATRIX.md) for requirement status and manual closure actions; [demo](DEFENSE_DEMO.md) for execution and recording; [presentation](DEFENSE_PRESENTATION.md) for a short defense. The old AND-7/AND-8 documents remain historical records; current report/presentation/script artifacts resolve their artifact-absence gaps, not the underlying execution or approval gaps.

All gates remain partially evidenced and officially unverified. Required external actions include administrative/portal records, four-week plan and individual assignment, browser demo evidence, usefulness assessment, contribution attestation, resource inventory/cost decisions, final scope and critical-issue review, remote CI/human review and formal G0–G4 decisions. A local working app and green unit checks do not establish practice completion. No public deployment, presentation delivery, university submission or approval is claimed.
