# G0–G4 final evidence matrix — AND-10

Audited 2026-10-25 against `main` at `147a42adb007dcc21e865f2192f80752caf861c6` and this documentation-only package.
This is the current delta to the detailed [AND-7 rubric inventory](PRACTICE_CLOSURE_CHECKLIST.md), not an official university decision. The rubric source is the user-supplied portal requirements recorded in AND-7; the current portal and full AND-10 Linear issue were not accessible. Confirm the current rubric with the supervisor.

**Verified** means an artifact was inspected or a check executed, within the stated limits. **Partial** means incomplete evidence or an external claim still needing verification. **Missing** means no supporting artifact was found in tracked files; it does not establish absence outside the repository. Official approval of **every gate remains unverified**. Product/research G3 variants below are supporting comparisons; the passport declares a hybrid project.

## G0 — Environment Ready: partial

| Requirement | Status | Evidence and outstanding action |
| --- | --- | --- |
| GitHub login / invitation | Partial | Native Git read works; student login and invitation need portal/account evidence. |
| Current Charter acceptance | Missing | Student must supply accepted version, date and portal record. |
| Repository created | Verified | [Repository](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant), source and lockfile inspected. |
| Coding agent configured | Verified | This Codex session runs checks; [AGENTS.md](../AGENTS.md). Student proficiency requires live demonstration. |
| Linear project and test issue | Partial | AND-5–AND-10 identifiers occur in Git/docs/request; issue bodies, project and status were inaccessible. |
| Issue → branch → commit → PR | Partial | [Workflow](AGENT_WORKFLOW.md) and merged PRs #1–#6 establish Git chains; actual Linear backlinks remain unverified. |
| Test/check execution | Verified | [Current verification](FINAL_PRACTICE_REPORT.md#verification-record): 13 tests, lint, build pass. |
| Cloud project, budget alert, deployment check or permitted alternative | Missing | Local reproduction does not satisfy administrative cloud evidence; obtain records or approved alternative. |
| Introductory study | Missing | Student/portal completion record required. |
| First hypothesis published | Partial | [Passport §4](PROJECT_PASSPORT.md#4-project-hypothesis) exists; portal publication/acceptance unverified. |

## G1 — Topic Approved: partial

| Requirement | Status | Evidence and outstanding action |
| --- | --- | --- |
| Completed passport; lab; RU/EN titles; project type | Verified | [Passport §§1–12](PROJECT_PASSPORT.md): Lab 04, hybrid. The diploma topic was separately approved by the university commission in October 2026. |
| User/context and observable problem | Verified | Passport §§2–3 describes programming students and next-topic uncertainty; no user research validates prevalence. |
| Available data | Verified | Five local topics in [learning.ts](../src/data/learning.ts), catalog checks pass. |
| Vertical slice and acceptance criteria | Verified | Passport §§6,9 and [demo](DEFENSE_DEMO.md). |
| Initial Linear / four-week plan | Missing | No inspected schedule or Linear plan; obtain actual dated plan, do not backdate one. |
| EHU individual assignment | Missing | Student/supervisor must provide assignment and approval record. |
| Topic approval | Verified | The diploma topic was approved by the university commission during its meetings on 14–15 October 2026. Official confirmation was communicated by Dr Kateryna Nasuro in an email dated 20 October 2026. The original email is retained by the student as evidence. |

## G2 — Vertical Slice: partial

| Requirement | Status | Evidence and outstanding action |
| --- | --- | --- |
| Architecture and agent instructions | Verified | [Architecture](ARCHITECTURE.md), [AGENTS.md](../AGENTS.md), source inspected. |
| Tasks and briefs | Partial | Commit references and user-supplied AND-10 scope exist; complete Linear briefs unavailable. |
| Separate branch and PR workflow | Verified | Merge commits for PRs #1–#6 in fetched main history; [report links](FINAL_PRACTICE_REPORT.md#development-evidence-and-individual-contribution). AND-10 handoff is separate. |
| End-to-end demo | Partial | [Reproducible script](DEFENSE_DEMO.md) prepared; no recorded browser execution or recording. |
| Basic CI | Verified | [CI definition](../.github/workflows/ci.yml); AND-8 records successful PR #4 job. Current AND-10 remote CI is not established by local checks. |
| Initial test/evaluation | Verified | Existing 13 tests pass; ten recommendation cases plus three catalog checks. |
| Limitations and agent/human roles | Verified | [Final report](FINAL_PRACTICE_REPORT.md): deterministic engine, agent assists development, human controls acceptance. |

## G3 — Validated MVP/Experiment: partial

| Variant / requirement | Status | Evidence and outstanding action |
| --- | --- | --- |
| Hybrid: minimal product scenario | Partial | UI/source and HTTP checks support implementation; execute and record full [demo](DEFENSE_DEMO.md). |
| Hybrid: separate key-method experiment | Verified | [Evaluation](EVALUATION_REPORT.md), [executable scenarios](../src/data/learning.test.ts), current 10/10 scenario agreement. |
| Hybrid: connection to workflow usefulness | Partial | Selecting the expected next topic supports rule consistency; no baseline or real-user evidence proves usefulness or comparative hypothesis. |
| Product comparison: deployment or reproducible startup | Verified | [README](../README.md), frozen installation, Node 24, local startup/HTTP validation. No public deployment claimed. |
| Product comparison: key scenario and tests | Partial | Engine tests pass; browser accept/reject and reset flow still need witnessed execution. |
| Product comparison: feedback or meaningful product metric | Missing | Obtain consented user feedback or an agreed usefulness metric; 100% rule agreement is not product value. |
| Product/research comparison: error analysis | Partial | [Report](FINAL_PRACTICE_REPORT.md#evaluation-and-error-analysis) analyzes design risks; no empirical user-error or comparative failure dataset. |
| Research comparison: test set, protocol, metrics, results, reproduction | Verified | Evaluation report and tests define ten fixed cases; 13/13 total checks pass. Preregistration is unverified. |
| Research comparison: baseline | Missing | No fixed-sequence comparison; do not claim superiority. |

## G4 — Defense Ready: partial

| Requirement | Status | Evidence and outstanding action |
| --- | --- | --- |
| Final state / frozen scope / critical errors | Partial | Baseline pinned above; scope documented. Student must choose final commit and review outstanding issues; unit tests cannot rule out all critical errors. |
| Applicable green checks | Partial | Fresh local tests/lint/build pass. Current remote CI and browser validation require evidence. |
| README and reproduction guide | Verified | AND-9 [README](../README.md) replaces template; Node 24, frozen install, commands and expected demo behavior. Old AND-7 README gap is resolved. |
| Architecture, evaluation, limitations | Verified | Existing linked documents and [final report](FINAL_PRACTICE_REPORT.md). |
| Agent worklog | Partial | [AND-8 log](AGENT_WORKFLOW.md) plus AND-10 execution record in report; complete historical sessions are not reconstructed. |
| Final report | Verified | [Final practice report](FINAL_PRACTICE_REPORT.md), prepared for human review; contribution attestation pending. |
| Presentation | Verified | [Markdown defense slides and speaker notes](DEFENSE_PRESENTATION.md); delivery and required university format unverified. |
| Demo script | Verified | [Dedicated script](DEFENSE_DEMO.md); execution/recording remains pending. |
| Individual contribution | Partial | Git attribution and student attestation checklist in report; authorship/merge alone cannot establish independent work. |
| Paid resource deletion / continuation | Partial | Action checklist below exists; actual inventory, ownership and decisions are unverified. |
| Official gate decisions | Missing | No authority/date/approval evidence for G0–G4 inspected. |

## Manual closure register

The student owns collection; the responsible supervisor/university authority owns gate decisions. For each item record the real URL/artifact, date, verifier and outcome. Keep private account/billing records in the permitted university system and link sanitized evidence only.

- G0: invitation/login, Charter version/acceptance, introductory study, Linear project/test issue/backlinks, hypothesis portal publication, cloud budget/deployment or approved alternative.
- G1: actual four-week plan, individual assignment, topic approval.
- G2/G3: execute the demo, attach recording/screenshots and actual results; obtain task briefs; agree usefulness evaluation and baseline or justified alternative with supervisor; collect real evidence before claiming utility.
- G4: student confirms personal contribution, supplies available historical agent logs, reviews final diff and critical issues, pins final commit, records remote CI and human PR review, exports presentation if required, and submits report/demo.
- Resource owner: inventory cloud projects, deployments, instances, storage, domains and subscriptions; record provider, resource identifier, cost/budget, owner and delete/continue decision with date. Verify deletion or continuing budget/expiry. If none exist, supply an evidenced, dated non-applicability statement; this repository cannot prove absence of paid resources.
- University authority: record a separate G0, G1, G2, G3 and G4 decision with authority, date and evidence; no checklist status substitutes for approval.
