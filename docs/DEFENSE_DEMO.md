# Reproducible defense demo — AND-10

Prepared 2026-10-25 against main `147a42a`. Allow 5–7 minutes. This is a script with source-derived expectations, not evidence that browser actions were executed. Automated engine checks passed; the browser run/recording below is pending.

## Preparation

Use Node.js 24, bundled npm, Git and a modern browser. Use the existing isolated checkout and a separate branch when editing; no additional worktree is needed. From the repository root:

```bash
node --version
npm --version
git rev-parse HEAD
git status --short
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm test
npm run lint
npm run build
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

The writable cache path is for this cloud environment; another machine can use its writable npm cache. Preserve lockfiles and existing work. Keep the server terminal running; stop only this server with Ctrl+C afterwards. A port conflict requires inspecting the existing process or choosing and recording another port. No backend, keys or database are required. In onboarding use local HTTP requests internally; no user-facing cloud localhost preview is supplied. For a live defense, run locally on the presenter's machine and open the address printed by Vite in its browser. Prepare external javascript.info access separately; remote link availability is optional for local recommendation generation.

Record date, exact commit, Node/npm/browser versions, presenter, observer, command outcomes and recording location. Rehearse before the defense; if a step fails, record actual behavior and stop claiming that step passed.

## Browser sequence

| Step | Action | Expected observable result |
| --- | --- | --- |
| 1 | Reload; show heading and goal | Learning Path Assistant; DOM Manipulation selected; no recommendation yet |
| 2 | Show initial levels | Variables and Data Types = Understood; Functions = Need practice; Arrays = Understood; Objects and DOM Manipulation = Not started |
| 3 | Click Get my recommendation | Functions; explanation: “You reported difficulties with Functions. Strengthening this topic will help you progress toward your goal.” |
| 4 | Click Accept | “Recommendation accepted.” appears |
| 5 | Click Reject | “Recommendation rejected. Update your knowledge levels and try again.” replaces feedback |
| 6 | Request again without changing inputs | Functions remains; feedback clears. Explain that feedback does not train the engine |
| 7 | Set Functions to Understood | Previous recommendation and feedback disappear |
| 8 | Request again | Objects; explanation recommends studying Objects as next step before the goal |
| 9 | Inspect Open learning material ↗; optionally open | Target is `https://javascript.info/object`, opens a new tab. Record external/network failures separately; return to app |
| 10 | Set Objects to Understood; request again | DOM Manipulation |
| 11 | Set DOM Manipulation to Understood; request again | DOM Manipulation with “You have completed the prerequisites for this learning goal. Review the material and practice your skills.” |
| 12 | Change goal to Functions | Existing recommendation and feedback clear |
| 13 | Set Variables and Data Types to Need practice; request again | Variables and Data Types, despite later topics being understood |
| 14 | Reload | Initial DOM goal and initial knowledge levels return; recommendation/feedback disappear. Explain absence of persistence |

## Explain and close

Show `src/data/learning.ts`: ordered prefix, first non-understood topic, goal-review fallback. Show `src/data/learning.test.ts`: ten explicit cases and three catalog checks. Show test/lint/build output without presenting it as end-to-end browser evidence.

State boundaries: deterministic prototype, no runtime LLM, one five-topic catalog, self-reported knowledge, in-memory state, no baseline/user study or proven learning benefit. Agent assistance belongs to development; student reviews and explains the work.

## Execution evidence to attach

Pending: no browser run is recorded by AND-10. After a real run, attach a sanitized recording or screenshots for steps 1–14 with actual pass/fail/blocked outcomes, exact commit/date/browser, console errors if any, and observer identity/feedback. Do not fill expected outcomes into the actual-result record without execution. Record external-link and accessibility checks separately. If offline, show the configured URL and mark navigation unverified; that is not a successful external-link check.
