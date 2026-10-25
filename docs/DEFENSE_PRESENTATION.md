# Defense presentation — Learning Path Assistant

AND-10 · prepared 2026-10-25 · Markdown slide source / speaker notes.
Suggested duration: 8–10 minutes plus questions. Export to the university's required format after student review. No delivery, submission or approval is claimed.

## Slide 1 — Problem and scope (1 minute)

- Programming students need to choose a next JavaScript topic.
- Inputs: learning goal and self-assessed knowledge.
- Output: topic, explanation, material link and accept/reject interaction.
- Lab 04; hybrid MVP and experiment; one five-topic catalog.

Speaker note: distinguish the proposed usefulness hypothesis from evidence. The project title uses “AI assistant,” but the running app uses deterministic rules.

## Slide 2 — Architecture (1 minute)

```text
Goal + progress → React state → pure recommendation function
                                      ↓
                             topic + explanation + link
                                      ↓
                            feedback text in React state
```

- React/TypeScript/Vite frontend; local TypeScript catalog.
- Fixed prefix order; first topic not understood; goal-review fallback.
- No LLM, backend, database, persistence or external API dependency.

Speaker note: show [architecture](ARCHITECTURE.md) and `src/data/learning.ts`; explain why this small scope is reproducible.

## Slide 3 — Live demonstration (3 minutes)

Follow [the complete script](DEFENSE_DEMO.md): initial DOM goal → Functions → accept/reject → mark Functions understood → Objects → DOM → completed-path review → change goal → reload/reset.

Speaker note: rehearse and record actual outcomes. A script is an artifact, not completed end-to-end evidence. If the demo fails, report the failed step accurately.

## Slide 4 — Evaluation (1 minute)

- Ten predefined engine scenarios: 10/10 agreement.
- Three catalog checks: 3/3 passed.
- AND-10 fresh run: 13 tests passed; ESLint and TypeScript/Vite build passed.
- No baseline comparison, real-student study or measured educational improvement.

Speaker note: expected topics share the algorithm's sequence assumption. 100% agreement is rule consistency, not 100% recommendation usefulness. See [report](FINAL_PRACTICE_REPORT.md#verification-record).

## Slide 5 — Development and contribution (1 minute)

- AND-5 / PR #1: scaffold; AND-6 / PR #2: MVP.
- PR #3: evaluation/docs; AND-7 / PR #4: audit.
- AND-8 / PR #5: workflow; AND-9 / PR #6: reproducibility.
- AND-10: final evidence package, agent-assisted; human review pending.

Speaker note: use [verified history and contribution limits](FINAL_PRACTICE_REPORT.md#development-evidence-and-individual-contribution). Student must replace assumptions with their own attested account and explain concrete decisions/corrections. Commit authorship alone is insufficient evidence of independent contribution.

## Slide 6 — Gate readiness and next steps (1 minute)

- G0/G1: technical artifacts exist; administrative, planning and approval records remain incomplete.
- G2/G3: engine checks pass; browser demo and usefulness evidence remain incomplete.
- G4: report, presentation source and demo script prepared; final review, contribution attestation and resource decisions remain.
- Official approval is unverified for all G0–G4 gates.

Speaker note: display [matrix and manual closure register](FINAL_EVIDENCE_MATRIX.md). Obtain supervisor decisions with authority, date and evidence; no automatic gate acceptance.

## Questions to prepare

1. Why use a deterministic method? It keeps the small prototype explainable and reproducible; it does not validate a future LLM design.
2. What does personalization mean here? Selection depends on a goal and self-reported progress within a fixed sequence, without learned adaptation.
3. Does accept/reject improve future suggestions? No, it changes feedback text only.
4. What has the experiment proved? Agreement with ten predefined expectations, not educational benefit or superiority.
5. What did you personally do? Student supplies the attested account with specific commits and review decisions before defense.
6. What remains for practice approval? External records, witnessed evidence and authorized gate decisions listed in the matrix.
