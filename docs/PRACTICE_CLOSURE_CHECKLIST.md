# AI-Native Practice closure checklist — AND-7

> AND-8 follow-up, verified 2026-10-22: [PR #4](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/4)
> merged this audit into `main` on 2026-10-20 as
> [`2c624bd`](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/2c624bd6786c71b27e68eff56a5b90c7446b3a15).
> Its [CI verify job](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/actions/runs/39142283724/job/117718975625)
> succeeded. GitHub displays “No reviews.” The original audit and blocked handoff
> below are historical observations; see the [AND-8 workflow record](AGENT_WORKFLOW.md)
> for current branch/commit/PR/CI/merge evidence and remaining gaps. Linear status
> and official G0–G4 approvals remain unverified.

Audit date: 2026-10-18. Source baseline: `a24ef5ec70be40382a03705b68d104569adc2e71`.
Scope: existing React + TypeScript prototype and repository evidence. This is a
documentation audit, not an official gate approval or a claim of practice completion.

## Authority and status definitions

The authoritative rubric is the EHU AI-Native Practice portal G0–G4 requirements
provided by the user for AND-7 on 2026-10-18. The tables below map every supplied
evidence item, including all G3 project-type variants. The portal itself and the
Linear issue were not independently accessible; any additional AND-7 criteria
remain unverified. This supersedes the initial audit's unavailable-rubric limitation.

**Completed**: the stated evidence exists and was inspected or the check ran.
**Partially completed**: evidence covers only part of the requirement.
**Missing**: the required artifact was not found in tracked repository files.
**Unverified**: external or runtime evidence is insufficient to establish the claim.
Missing repository evidence does not prove an external artifact does not exist.
No status below constitutes official gate approval; approval is **unverified for
all five gates** until confirmed by the responsible human authority.

## G0 — Environment Ready

Expected outcome: the student can create a task, delegate it to a coding agent,
verify a change, prepare a PR, and show evidence. **Evidence readiness: partial**;
repository and engineering checks exist, but administrative and cloud evidence
are not established.

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| GitHub login and linked invitation | Unverified | Native Git read and branch push succeeded during this audit, but do not establish student login or an invitation record. |
| Current Charter accepted | Unverified | No acceptance/version record in the repository; portal confirmation needed. |
| Project repository created | Completed | [Repository](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant), [manifest](../package.json), and source checkout exist. |
| Codex or Claude Code configured | Completed | This Codex audit executed repository checks and committed/pushed documentation; [AGENTS.md](../AGENTS.md) supplies agent instructions. This does not prove independent student proficiency. |
| Linear project and test issue | Unverified | [Passport §7](PROJECT_PASSPORT.md#7-system-architecture) names Linear; local commits reference AND-5/AND-6, but the actual project/test issue cannot be inspected. |
| Issue linked to branch/commit/PR | Partially completed | Local history includes AND-5 commit `fc5b367`, AND-6 commit `984f639`, and merged [PR #2](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/2). Audit branch `docs/and-7-practice-closure-audit` and audit commits reference AND-7; a Linear backlink is unverified. |
| Test or other check executed | Completed | [Existing tests](../src/data/learning.test.ts) passed 13/13; lint/build passed (fresh verification below). |
| Google Cloud project, budget alert, minimal deployment check or permitted alternative | Unverified | No cloud project/budget/deployment evidence or explicitly permitted alternative found. Local startup alone does not establish this requirement. |
| Introductory material studied | Unverified | Requires student/portal confirmation; no completion record found. |
| First topic hypothesis published | Partially completed | [Passport §4](PROJECT_PASSPORT.md#4-project-hypothesis) publishes a hypothesis in the repository; required portal publication or acceptance is unverified. |

## G1 — Topic Approved

Expected outcome: concrete user/question, observable problem, realistic four-week
scope and verification method. **Evidence readiness: partial**; the passport is
substantial, but no four-week plan, individual assignment, or approval is established.

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Completed project passport | Completed | [Project passport](PROJECT_PASSPORT.md), sections 1–12. |
| Laboratory selected | Completed | [Passport §1](PROJECT_PASSPORT.md#1-general-information): Lab 04 — Applied Intelligent Systems. |
| Working title RU/EN | Completed | [Passport §1](PROJECT_PASSPORT.md#1-general-information) contains both titles. |
| Project type defined | Completed | [Passport §1](PROJECT_PASSPORT.md#1-general-information): hybrid (MVP plus experiment). |
| User or context specified | Completed | [Passport §§2–3](PROJECT_PASSPORT.md#2-problem-statement): programming students, JavaScript next-step JTBD. Problem is described, not validated through a user study. |
| Data availability confirmed | Completed | [Passport §5](PROJECT_PASSPORT.md#5-available-data), [catalog](../src/data/learning.ts), and passing catalog tests establish the five-topic local dataset without personal records. |
| Vertical slice described | Completed | [Passport §6](PROJECT_PASSPORT.md#6-vertical-slice) specifies the six-step workflow. |
| Acceptance criteria set | Completed | [Passport §9](PROJECT_PASSPORT.md#9-acceptance-criteria). |
| Initial plan in Linear | Unverified | No accessible Linear plan or exported schedule. [Passport scope](PROJECT_PASSPORT.md#11-scope-and-limitations) is bounded, but a four-week schedule is not evidenced. |
| EHU individual assignment prepared | Missing | No individual-assignment document found in tracked files; external submission remains unverified. |

## G2 — Vertical Slice

Expected outcome: one important scenario works from input to result.
**Evidence readiness: partial**; implementation and engine evaluation exist, but
an end-to-end demo and task briefs are not established.

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Architecture document | Completed | [Architecture](ARCHITECTURE.md) describes browser state, data flow and deterministic recommendation boundary; consistent with inspected source. |
| AGENTS.md or equivalent | Completed | [AGENTS.md](../AGENTS.md) defines workflow, verification and human oversight. |
| Tasks and task briefs | Partially completed | AND-5/AND-6 commit references and [AGENTS workflow](../AGENTS.md#task-workflow) exist; full issue bodies/task briefs were unavailable. |
| Separate branch and PR | Completed | Local history records merged feature [PR #1](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/1), [PR #2](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/2), and documentation [PR #3](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/3). The current audit uses its own branch; its PR creation is separately tracked below. |
| End-to-end demo | Missing | No demo recording or equivalent reproducible demo evidence found. [UI source](../src/App.tsx) implements the flow; local HTTP checks and engine tests do not demonstrate browser interaction. |
| Basic CI | Completed | [CI workflow](../.github/workflows/ci.yml) installs with `npm ci`, runs tests/lint/build on main pushes and PRs. Remote run status is unverified. |
| Initial test or eval | Completed | [Tests](../src/data/learning.test.ts): three catalog tests plus ten recommendation scenarios; fresh 13/13 passed. |
| Known limitations | Completed | [Architecture §8](ARCHITECTURE.md#8-current-limitations), [evaluation §6](EVALUATION_REPORT.md#6-limitations). |
| Agent and human roles explained | Completed | [AGENTS oversight](../AGENTS.md#ai-usage-and-human-oversight), [passport §8](PROJECT_PASSPORT.md#8-ai-and-human-responsibilities). Agent assists development; student reviews and controls acceptance. Runtime recommendations are deterministic, not an LLM agent. |

## G3 — Validated MVP/Experiment

Expected outcome: reproducible operation and a preselected evaluation procedure.
The declared type is **hybrid**, so its three requirements below govern the
assessment. Product/research evidence is also audited to expose supporting gaps;
these variants are not silently treated as additional mandatory hybrid gates.
**Evidence readiness: partial**; rule agreement is verified, educational utility is not.

### Hybrid requirements (applicable)

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Minimal product scenario | Partially completed | [UI](../src/App.tsx), [passport slice](PROJECT_PASSPORT.md#6-vertical-slice), and startup checks support the implementation. [Evaluation limitations](EVALUATION_REPORT.md#6-limitations) report historical manual feedback checking; no fresh interactive evidence or demo artifact. |
| Separate experiment of the key method | Completed | [Test cases](../src/data/learning.test.ts) exercise the recommendation function separately from the UI; [evaluation report](EVALUATION_REPORT.md) documents ten predefined scenarios, procedure and results. Limited to deterministic rule agreement. |
| Explain experiment result's connection to workflow usefulness | Partially completed | [Evaluation interpretation](EVALUATION_REPORT.md#5-interpretation) supports selecting expected topics; [passport hypothesis](PROJECT_PASSPORT.md#4-project-hypothesis) proposes relevance versus a fixed sequence. No baseline/user study establishes that usefulness or comparative advantage. |

### Product-project evidence (supporting comparison)

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Deployment or reproducible startup | Completed | [Architecture startup](ARCHITECTURE.md#7-deployment), [scripts](../package.json), [lockfile](../package-lock.json), CI Node 24, and successful local startup/HTTP checks. Public deployment is not claimed. |
| Key user scenario checked | Partially completed | Engine assertions cover recommendation generation. Historical manual accept/reject claim appears in [evaluation limitations](EVALUATION_REPORT.md#6-limitations), but full browser scenario was not independently checked. |
| Tests | Completed | [Existing suite](../src/data/learning.test.ts), 13/13 passing. No automated UI suite. |
| User feedback or meaningful product metric | Missing | No recorded user feedback, adoption or usefulness metric. 100% agreement with expected rule outputs is an engine metric, not evidence of product value. |
| Error analysis | Partially completed | [Evaluation limitations](EVALUATION_REPORT.md#6-limitations) identify bias and absent baseline; no structured failure/error-case analysis or observed-user-error analysis. |

### Research-project evidence (supporting comparison)

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Test set | Completed | Ten explicit goal/progress/expected-topic cases in [learning.test.ts](../src/data/learning.test.ts). |
| Baseline | Missing | [Evaluation §6](EVALUATION_REPORT.md#6-limitations) explicitly states no fixed-sequence baseline comparison. |
| Protocol | Completed | [Evaluation method](EVALUATION_REPORT.md#2-evaluation-method), [passport plan](PROJECT_PASSPORT.md#10-evaluation-plan), and executable assertions define procedure. A timestamped preregistration is unverified. |
| Metrics | Completed | [Evaluation metrics](EVALUATION_REPORT.md#4-metrics): scenario agreement 10/10 and catalog checks 3/3, limited to predefined expectations. |
| Results | Completed | [Scenario table](EVALUATION_REPORT.md#3-evaluation-results), independently repeated with all 13 tests passing. |
| Error analysis | Partially completed | [Limitations](EVALUATION_REPORT.md#6-limitations) discuss assumptions, but no systematic negative cases or baseline error comparison. |
| Reproduction code | Completed | [Tests](../src/data/learning.test.ts), [engine](../src/data/learning.ts), [scripts](../package.json), and [reproduction instructions](EVALUATION_REPORT.md#7-reproduction). |

## G4 — Defense Ready

Expected outcome: frozen scope, critical errors resolved, report/demo ready and
individual contribution verifiable. **Evidence readiness: partial**; technical
documents and passing local checks exist, but the defense package is incomplete.
No claim that all critical errors have been ruled out is supported by unit tests alone.

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Final repository state | Partially completed | Audited baseline is pinned above and [scope](PROJECT_PASSPORT.md#11-scope-and-limitations) is documented; no final-release/frozen-scope sign-off or critical-issue disposition found. Audit commits are not final project approval. |
| Green applicable checks | Partially completed | Fresh local test/lint/build all passed; [remote CI configuration](../.github/workflows/ci.yml) exists, but remote run status and UI checks remain unverified. |
| README and startup instructions | Partially completed | [README](../README.md) is Vite template text; project commands exist in [architecture](ARCHITECTURE.md#7-deployment) and [evaluation](EVALUATION_REPORT.md#7-reproduction). Project-specific README handoff is incomplete. |
| Architecture | Completed | [Architecture document](ARCHITECTURE.md). |
| Evaluation report | Completed | [Evaluation report](EVALUATION_REPORT.md) includes method, scenarios, metrics and limitations; this does not establish educational effectiveness. |
| Deployment/reproduction guide | Completed | [Architecture §7](ARCHITECTURE.md#7-deployment), [evaluation §7](EVALUATION_REPORT.md#7-reproduction); fresh local reproduction succeeded using the writable cache described below. |
| Agent worklog | Missing | No dedicated agent worklog/session trace in tracked files. [AGENTS.md](../AGENTS.md) defines policy, not an execution log; this audit is not a retrospective development worklog. |
| Limitations list | Completed | [Evaluation §6](EVALUATION_REPORT.md#6-limitations), [architecture §8](ARCHITECTURE.md#8-current-limitations). |
| Final report | Missing | Passport, architecture and evaluation exist, but no final practice report integrating outcomes and individual contribution was found. |
| Presentation | Missing | No presentation artifact found in tracked files. |
| Demo script | Missing | No dedicated stepwise defense demo script found; the passport workflow alone does not establish a prepared script. |
| Individual-contribution evidence | Partially completed | Git commit/PR history provides attribution leads ([PR #2](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/2), [PR #3](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/3)); no contribution statement separating student and agent work or human review record found. Commit authorship alone does not prove individual engineering contribution. |
| Paid cloud resource deletion/continuation plan | Missing | No resource inventory, cost ownership, or delete/continue plan found. No paid-resource absence is assumed; confirm resources and document either the plan or evidenced non-applicability. |

## Current application boundaries

The catalog contains only Variables, Functions, Arrays, Objects, and DOM topics
for JavaScript. The engine scans an ordered prefix through the selected goal and
returns the first topic not marked understood; a completed path recommends goal
review. Accept/reject only changes in-memory feedback. There is no backend,
database, persistence, authentication, Python/Lithuanian course, or LLM integration.
These are documented scope boundaries, not automatically gate failures or tasks
to implement during this audit. No application functionality or dependencies were changed.

## Fresh verification

Executed on 2026-10-18 from the repository root using Node `v24.19.0`, npm `11.9.0`,
and the committed lockfile, matching the CI Node major version.

| Command / check | Result | Evidence / limitation |
| --- | --- | --- |
| `npm ci` | Initial setup failed | Default cache `/home/agent/.npm/_cacache` could not be created; npm emitted tarball retry warnings and exited 254 with ENOENT. |
| `npm ci --cache /tmp/and-7-npm-cache` | Passed, exit 0 | Installed 178 packages using a writable cache; checksum and TLS verification retained. No lockfile edits. |
| `npm run test` | Passed, exit 0 | Vitest 5.0.3: one test file, 13 tests passed; no failed or skipped tests reported. |
| `npm run lint` | Passed, exit 0 | ESLint completed without diagnostics. |
| `npm run build` | Passed, exit 0 | `tsc -b` and Vite 8.3.3 production build completed; 18 modules transformed. |
| `npm run dev -- --host 127.0.0.1` | Startup passed | Vite reported ready. Internal `curl --fail` requests to `/` and `/src/App.tsx` succeeded, confirming HTML serving and module transformation. |
| Interactive UI / learning links / accessibility | Unverified | No browser automation suite exists in the repository; no browser interaction or external learning-material availability check was performed. HTTP checks do not establish UI behavior. |
| Remote CI / PR API | Unverified / blocked | Native Git read succeeded. GitHub API request returned `Forbidden`; local passing checks do not establish remote CI status or permission to create a PR. |

The [existing evaluation report](EVALUATION_REPORT.md#4-metrics) records historical
results dated October 8, 2026. The fresh results above are separate observations;
neither run measures student outcomes or constitutes gate approval.

## Closure actions for review

- [x] Map all supplied G0–G4 evidence requirements, including hybrid/product/research G3 variants.
- [x] Inspect implementation, documentation, existing tests, CI and local history.
- [x] Run existing tests, lint, build and limited local server smoke checks.
- [ ] Attach any additional AND-7-specific acceptance criteria and confirm external Linear task links.
- [ ] Supply G0 administrative/cloud records and G1 Linear plan/individual assignment evidence.
- [ ] Record a browser end-to-end demo and key-scenario validation (G2/G3).
- [ ] Add product-value evidence and structured error analysis; assess the hybrid hypothesis against a baseline or other justified evaluation.
- [ ] Complete the G4 handoff: project README, agent worklog, final report, presentation, demo script, individual contribution evidence, scope sign-off and cloud-cost plan.
- [ ] Confirm remote CI, obtain human PR review, and record official decisions for each gate with authority, date and link. Do not merge automatically.

## Audit branch and PR handoff

Changes are documentation-only on `docs/and-7-practice-closure-audit`. The branch
was pushed to origin. GitHub API requests, including PR creation, returned
`Forbidden` in the initial attempt; no created PR or remote CI result was confirmed.
[Create/review the audit PR](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/new/docs/and-7-practice-closure-audit)
against `main` when API/browser access permits. This link is a PR creation page,
not evidence that a PR exists. No automatic merge is authorized or performed.

All gate approvals remain unverified. Completed evidence items and passing local
checks do not establish official gate acceptance or practice completion.
