# Codex and agent workflow — AND-8

Verified on 2026-10-22 against `main` at
[`2c624bd6786c71b27e68eff56a5b90c7446b3a15`](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/2c624bd6786c71b27e68eff56a5b90c7446b3a15).
This records engineering evidence, not official G0–G4 approval.

## Instructions and responsibilities

[AGENTS.md](../AGENTS.md) was reviewed. It already defines the React/TypeScript
scope, dependency and credential constraints, required lint/build checks, issue →
change → verification → PR workflow, and student oversight. No instruction change
is needed for AND-8. The application uses deterministic recommendations; Codex
assists development and is not an LLM integrated into the application.

Use this workflow for subsequent tasks:

1. Read the Linear issue and acceptance criteria. Record its actual URL when
   available; an issue identifier alone does not establish a Linear backlink.
2. Read AGENTS.md, inspect the implementation and `git status`, and preserve
   existing work. Use the existing isolated checkout and a separate branch; no
   additional worktree is required.
3. Make the smallest scoped change. For an audit/configuration task, change only
   necessary documentation. Do not add dependencies or application features.
4. With Node 24 and npm, install from the lockfile using
   `npm ci --cache /workspace/.npm-cache --no-audit --no-fund` if needed. Keep TLS
   and package integrity verification enabled. Run `npm run lint`,
   `npm run build`, and `npm test`; report actual outcomes and limitations.
5. Commit and push the branch. Open a PR against `main` with the issue ID,
   scope, validation, and unverified items. Link the branch, exact commits, PR,
   and CI run/job. Local success does not establish remote CI success.
6. The student reviews the diff, checks, and agent output and decides acceptance.
   Record review and merge evidence separately. Do not automatically merge or
   infer formal review from the fact that a merge exists.
7. Link the PR back to Linear and update the issue only when access and verified
   acceptance criteria permit. Record official practice decisions only with the
   responsible authority, date, and evidence.

## AND-7: verified branch-to-merge evidence

| Artifact | Evidence and verified result |
| --- | --- |
| Audit | [Closure checklist](PRACTICE_CLOSURE_CHECKLIST.md) maps the supplied G0–G4 rubric and explicitly separates evidence from approval. The original Linear issue and portal were not independently accessible. |
| Branch | [`docs/and-7-practice-closure-audit`](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/tree/docs/and-7-practice-closure-audit), confirmed as PR #4's source branch in GitHub's merged PR page. |
| Initial audit commit | [`9420ea65fed2fcd9df0273a70040e104fa8dc058`](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/9420ea65fed2fcd9df0273a70040e104fa8dc058). |
| Rubric mapping commit | [`beedaeb18dcbbbc83730be413aa25cc0a54d5a3f`](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/beedaeb18dcbbbc83730be413aa25cc0a54d5a3f). |
| Pull request | [PR #4](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/4), “docs: audit AI-Native Practice G0–G4 evidence (AND-7)”; body references AND-7. Two commits merged into `main` on 2026-10-20. |
| Remote CI | [PR checks](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/pull/4/checks), [run 39142283724](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/actions/runs/39142283724), [verify job 117718975625](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/actions/runs/39142283724/job/117718975625): GitHub shows `verify` succeeded on 2026-10-18 for head `beedaeb`; the merge timeline shows one check passed. Full individual step logs were not inspected. |
| CI definition | [ci.yml](../.github/workflows/ci.yml) runs `npm ci`, tests, lint, and build with Node 24 on PRs to `main` and pushes to `main`. Configuration is verified separately from the observed successful job. |
| Merge | [`2c624bd6786c71b27e68eff56a5b90c7446b3a15`](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/2c624bd6786c71b27e68eff56a5b90c7446b3a15), confirmed in fetched Git history and GitHub's PR timeline. Diff from the previous main commit changes only the closure checklist. |
| Human review | GitHub's PR #4 page displays “No reviews.” The owner merged the PR; that does not establish a submitted approval review or independent student verification. |

The old audit's API/PR handoff describes its original execution, not the current
PR state. GitHub HTML pages now provide the evidence above, although GitHub API
requests in this session return `Forbidden`. The checks page also reports an
action-runtime deprecation warning and a runner migration notice; neither is a
failed job. No CI configuration change is included here.

## Remaining G0–G4 evidence

The [AND-7 requirement-by-requirement audit](PRACTICE_CLOSURE_CHECKLIST.md) remains
the detailed inventory. The following is an AND-8 delta and follow-up summary;
missing tracked evidence does not prove that an external artifact does not exist.

| Gate | Confirmed evidence / remaining gaps |
| --- | --- |
| G0 — Environment Ready | Codex can inspect the checkout, run checks and use native Git; AND-7 now has a verified PR/CI/merge chain. Still unverified: student login/invitation, current Charter acceptance, actual Linear project/test issue and backlinks, introductory study, required cloud project/budget/deployment or accepted alternative, portal hypothesis publication, and independent student proficiency. |
| G1 — Topic Approved | Passport, lab, bilingual title, hybrid type, user/problem, local catalog and acceptance criteria exist. Missing/unverified: Linear four-week plan, individual assignment and authorized topic approval. |
| G2 — Vertical Slice | Architecture, AGENTS.md, engine tests, separate branches/PRs and successful remote CI exist. Still missing/unverified: complete Linear task briefs and end-to-end browser demo. Engine tests and HTTP responses alone do not establish the full UI scenario. |
| G3 — Validated MVP/Experiment | Rule-based engine evaluation covers ten scenarios plus three catalog tests. Hybrid usefulness remains partial: no comparative baseline, recorded user-value evidence or structured error analysis; no fresh full browser interaction evidence. Supporting product/research variants are distinguished in AND-7 rather than silently made additional hybrid requirements. |
| G4 — Handoff | AND-7 remote CI is now verified; architecture/evaluation/reproduction documents exist. Still missing/partial: project-specific README handoff, complete historical agent worklog, final report, presentation, demo script, individual-contribution statement, explicit human review, final scope/critical-issue sign-off, and paid-resource inventory/delete-or-continue plan. This AND-8 record covers this task only and does not reconstruct earlier sessions. |

Official approval remains unverified for **all five gates**. A merged PR and green
CI do not confer practice approval or demonstrate educational effectiveness.

## AND-8 execution record and handoff

- Request: verify Codex/GitHub workflow, review instructions and AND-7/PR #4,
  document evidence and gaps, and prepare a documentation-only review PR.
- Branch: [`docs/and-8-codex-agent-workflow`](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/tree/docs/and-8-codex-agent-workflow).
  [Branch commits](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commits/docs/and-8-codex-agent-workflow)
  identify the resulting exact commit(s).
- Codex inspected repository instructions, documents, tests, CI configuration,
  fetched Git history, and public PR/checks pages. No application changes or new
  dependencies are required. AGENTS.md remains unchanged because it is sufficient.
- Local checks on 2026-10-22: lint passed; TypeScript/Vite production build passed;
  Vitest passed 13/13 tests in one file. Local startup/HTTP module checks passed
  during this session's environment setup; no browser interaction was tested.
- Linear is not connected in this session. AND-7's claimed completion comes from
  the request and merged audit, not an independently read Linear status. AND-8's
  issue body, extra acceptance criteria, status and backlink remain unverified;
  the user's supplied task list defines this implementation's scope.
- Review target: `main`. PR creation uses GitHub API access, which currently
  returns `Forbidden`; a prepared branch/compare link is not a created PR.
  [Open the review form](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/compare/main...docs/and-8-codex-agent-workflow?expand=1).
  AND-8's remote CI, human review, merge and Linear closure must be recorded after
  they actually occur. No automatic merge is intended.
