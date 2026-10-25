# Learning Path Assistant

A browser-based educational recommendation prototype for EHU AI-Native Practice
2026. It helps a student choose the next JavaScript topic from a learning goal
and self-assessed knowledge, then explains the suggestion and links to material.

## Current MVP and architecture

The MVP contains one JavaScript catalog with five topics: Variables and Data
Types, Functions, Arrays, Objects, and DOM Manipulation. Students select a goal,
mark each topic as **Not started**, **Need practice**, or **Understood**, request
a recommendation, and accept or reject it.

Recommendations are deterministic and rule-based. The engine scans the fixed
sequence through the selected goal and chooses the first topic not understood.
If that entire path is understood, it recommends reviewing the goal topic.
Accept/reject displays feedback; it does not train or change the algorithm.

The stack is React 19, TypeScript 6, Vite 8, CSS, Vitest 5, and ESLint 10.
All application state and computation stay in the browser:

```text
Goal + knowledge levels → recommendation function → topic + explanation + link
                                                        ↓
                                                 accept/reject feedback
```

| Location | Responsibility |
| --- | --- |
| `src/main.tsx` | React entry point |
| `src/App.tsx` | Goal/knowledge inputs, recommendation display, feedback state |
| `src/data/learning.ts` | Topic catalog, initial progress, recommendation rules |
| `src/data/learning.test.ts` | Catalog tests and recommendation scenarios |
| `src/App.css`, `src/index.css` | Styling |
| `.github/workflows/ci.yml` | Node 24 installation, tests, lint, and build |
| `docs/` | Architecture, evaluation, and practice evidence |

## Prerequisites and installation

Use **Node.js 24** (matching CI), its bundled npm, Git, and a modern browser.
No API keys, environment variables, backend services, or database are required.
Internet access is needed to clone and install packages; opening learning
material requires access to `javascript.info`.

```bash
git clone https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant.git
cd ai-learning-recommendation-assistant
node --version
npm --version
npm ci
```

Run all commands below from the repository root. `npm ci` installs the committed
lockfile without updating it. If the default npm cache is unwritable in a cloud
workspace, use the verified alternative:

```bash
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
```

In an existing Codex task, use its isolated checkout; an additional worktree is
unnecessary. Inspect `git status` and preserve any existing changes.

## Local development and verification

```bash
npm run dev
```

Open the local address printed by Vite in your browser. Stop the server with
Ctrl+C. For a fixed-port cloud/internal smoke check, the tested startup command is:

```bash
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

| Command | Purpose |
| --- | --- |
| `npm test` | Run the existing Vitest suite once |
| `npm run lint` | Run ESLint |
| `npm run build` | Run TypeScript project checks and produce Vite output in `dist/` |
| `npm run preview` | Serve an existing production build locally for inspection |

Build before using preview. Preview is a local inspection tool, not a production
hosting service. CI runs installation, tests, lint, and build on pushes to `main`
and pull requests targeting `main`.

## Step-by-step demonstration

These steps describe expected behavior from the current implementation; they
are a manual demo script, not a recorded end-to-end browser test.

1. Start the development server and open the application. Confirm the heading
   **Learning Path Assistant** and goal **DOM Manipulation**.
2. Use the initial knowledge levels: Variables and Data Types = **Understood**,
   Functions = **Need practice**, Arrays = **Understood**, Objects and DOM
   Manipulation = **Not started**.
3. Click **Get my recommendation**. Expect **Functions** and an explanation that
   strengthening this topic will help with the selected goal.
4. Click **Accept**. Expect **Recommendation accepted.** Click **Reject** to see
   **Recommendation rejected. Update your knowledge levels and try again.**
5. Change Functions to **Understood**. The previous recommendation and feedback
   clear. Request another recommendation; expect **Objects**.
6. Click **Open learning material ↗**. It opens the Objects material at
   `https://javascript.info/object` in a new tab; external availability is separate
   from the local application.
7. Mark Objects as **Understood** and request again; expect **DOM Manipulation**.
   Mark DOM Manipulation as **Understood** too and request again; expect the same
   topic with the completed-prerequisites/review explanation.
8. Change the goal to **Functions**, set Variables and Data Types to
   **Need practice**, and request again; expect **Variables and Data Types**.
9. Reload the page. Goal, knowledge levels, and feedback return to their initial
   state; progress is not persisted.

## AND-9 verification record

Executed on 2026-10-24 using Node `v24.19.0` and npm `11.9.0`, against the AND-9
documentation change based on `main` commit
`a8dc21a56c9a5f1189a1be80db163d19ac1a1207`.

| Check | Actual result |
| --- | --- |
| Lockfile installation | `npm ci --cache /workspace/.npm-cache --no-audit --no-fund` passed during this session's environment setup; 178 packages installed |
| `npm test` | Passed: 1 test file, 13 tests (3 catalog checks and 10 recommendation scenarios) |
| `npm run lint` | Passed, no diagnostics |
| `npm run build` | Passed: TypeScript checks and Vite production build |

The test, lint, and build commands were rerun for AND-9. Earlier in this session,
the development server also returned HTTP 200 and expected content for the HTML,
App module, and recommendation module. Those HTTP checks do not establish browser
interaction. The manual demo above, preview command, external material links,
accessibility, and AND-9 remote CI were not independently validated in this run.
The tests establish agreement with predefined rules, not educational effectiveness.

## Final defense package — AND-10

Start with the [package index](docs/AND_10_HANDOFF.md), then review the
[current G0–G4 matrix](docs/FINAL_EVIDENCE_MATRIX.md),
[final report](docs/FINAL_PRACTICE_REPORT.md),
[defense demo](docs/DEFENSE_DEMO.md), and
[presentation source](docs/DEFENSE_PRESENTATION.md). These prepared artifacts
do not establish browser-demo execution, student attestation, university
submission, or official gate approval.

## Project documentation

- [Architecture and data flow](docs/ARCHITECTURE.md)
- [Evaluation method, scenarios, and historical results](docs/EVALUATION_REPORT.md)
- [Practice evidence audit and remaining G0–G4 gaps](docs/PRACTICE_CLOSURE_CHECKLIST.md)
- [Codex/agent workflow and PR evidence](docs/AGENT_WORKFLOW.md)
- [Project passport and hypothesis](docs/PROJECT_PASSPORT.md)
- [Development instructions and human oversight](AGENTS.md)

The practice audit and agent workflow are dated evidence records; their earlier
README/demo gaps describe the state at those dates. This README supplies the
project-specific reproduction guide and demo script, but does not establish a
recorded demo, official practice completion, or supervisor approval of G0–G4.

## Known limitations and missing functionality

- One fixed five-topic JavaScript catalog; no additional courses.
- No LLM or runtime AI agent, backend, database, authentication, or persistent
  learning history. React state resets on reload.
- Knowledge is self-reported; the fixed sequence does not assess actual mastery
  or adapt from accept/reject feedback.
- No automated UI/end-to-end suite, recorded browser demo, or verified public
  deployment is provided by this task.
- No real-student study, comparative baseline, measured educational benefit, or
  structured user-error analysis. The 10/10 scenario result is rule agreement.
- The final report, presentation, historical agent worklog, individual-contribution
  evidence, cloud-resource cost plan, and administrative approvals remain subject
  to the practice audit and human confirmation.

AND-9 changes documentation only. New functionality and official gate decisions
require separate work and responsible human review.
