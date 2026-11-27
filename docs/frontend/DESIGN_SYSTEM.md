# FE-05 design system

FE-05 starts from `1c43b92acfaa6e8c36e51d9e980b0f6daff6e98c`, the merge of PR #15. The starting history also includes PRs #11–#14. The FE-00 audit left I11 (formatter), I12 (basic frontend logging), and the theme and systematic accessibility work in Advanced UI/UX open. FE-05 adds evidence for responsive layout (I9) and feedback (A9, E2, E4). [Baseline audit](BASELINE_AUDIT.md#minimum-rubric-traceability) · [Current rubric mapping](TESTING.md#exact-stage-3-rubric-mapping)

## Tokens and components

| Area | Convention |
| --- | --- |
| Color | Canvas, surface and subtle backgrounds share semantic text, muted text, accent, and border tokens. Error, warning, and success each have a text and surface pair. |
| Type | System font stack with a fluid page heading, rem-based sizes, and unitless line height. Each learner page has a primary heading. |
| Layout | A 65rem content width and fluid gutters constrain the shell. Header controls wrap, catalog cards use an auto-fitting grid, and decision actions stack below 36rem. Text can wrap inside prompts, cards and feedback. |
| Spacing and finish | A rem-based spacing scale, two radii, a panel shadow, and separate decorative and control borders apply across screens. |
| Controls | The shared native Button and search input use 2.75rem minimum control height. Hover, pressed and disabled states share semantic tokens. Focus uses a 3px outline with 3px offset. |
| Feedback | Shared status and alert components present text for pending, empty, successful and failed states. The diagnostic uses the warning treatment for clarification. |

The tokens live in the global stylesheet. Shell and learner component styles consume the same values. Course cards use the course title as the link name and show the course code in the card. [Tokens](../../src/index.css) · [Component styles](../../src/app/shell.css) · [Shared controls](../../src/shared)

## Native-backed UI kit

The catalog-to-diagnostic workflow uses native buttons, links, a search input and a textarea. The shared Button keeps variants, default button type and native disabled behavior consistent. SearchInput associates a visible label with the field and returns focus to it after clearing. Shared feedback uses status roles for pending updates and alert roles for errors, so pages apply a consistent announcement pattern. The browser supplies native focus and keyboard activation for interactive elements. The application adds visible focus styles and handles focus when navigation or validation changes the learner's context. [Button](../../src/shared/Button.tsx) · [Search input](../../src/shared/SearchInput.tsx) · [Feedback](../../src/shared/Status.tsx) · [Accessibility evidence](ACCESSIBILITY.md)

The MVP's screens need a small set of primitives, so the project shares styles through semantic CSS tokens in `index.css` and component rules in `shell.css`. Both palettes use the same rules and components, including the feedback colors and focus indicator. This keeps styling changes centralized while letting each view compose the markup it needs. Adopting a broad third-party kit for the current workflow would require integrating its theme and component conventions with these same controls.

The project maintains labels, focus transitions, visual contrast, responsive layout and feedback semantics. Changes to shared primitives need keyboard and responsive regression checks in both themes. Native controls still vary across browsers, and complex widgets would require additional interaction design and assistive-technology testing. Existing browser and axe evidence covers the states and profiles recorded in the accessibility guide. [Tokens](../../src/index.css) · [Styles](../../src/app/shell.css) · [Verification scope](ACCESSIBILITY.md#limits)

## Theme

The native **Dark theme** toggle exposes its state through `aria-pressed`. CSS uses the operating system color preference through `color-scheme` and `light-dark()` until an explicit choice sets `data-theme` on the root. The toggle reflects changes to the system preference while the document has no override. The app reads the stored preference on startup before React renders.

The sole storage entry added by FE-05 is `learning-assistant-theme`, with value `light` or `dark`. Reads ignore unrecognized values and tolerate exceptions. If writing fails, the current document still shows the chosen theme and a reload falls back to the available preference. Answers and unresolved writes retain their existing session and Redux ownership. [Theme storage](../../src/app/theme.ts) · [Toggle](../../src/app/ThemeToggle.tsx) · [Workflow ownership](STATE_MANAGEMENT.md#store-and-ownership)

## Formatting and logging

Prettier 3.8.1 uses single quotes, no semicolons, a 110-column print width and LF line endings. The scripts cover the shell, pages, shared controls, learning presentation components, global styles, HTML entry and the new browser test. Legacy learning logic, its existing test fixtures, backend files and historical documentation are outside that formatting scope. Run `npm run format` to apply it and `npm run format:check` to reproduce the CI check. [Prettier configuration](../../.prettierrc.json) · [Scripts](../../package.json) · [CI](../../.github/workflows/ci.yml)

A development-only Redux middleware emits one `request_failed` warning per rejected RTK Query execution. It writes a fixed event name, the matching endpoint name, and a numeric HTTP status when available. It skips aborts and RTK Query condition rejections, which include deduplicated requests. It sends no telemetry and has no production console sink. It reads neither learner answers nor response or request bodies, identifiers, credentials, headers, URLs, or error messages for logging. [Middleware](../../src/app/frontendLogging.ts) · [Focused logging test](../../src/app/frontendLogging.test.ts)

## Production bundle

Vite 8.3.3 production browser builds with `VITE_API_URL=` on Node 24.22.3. Sizes are in kB as reported by Vite, raw / gzip.

| Asset | Before FE-05 | After FE-05 |
| --- | ---: | ---: |
| Entry JS | 411.42 / 131.68 | 413.14 / 132.19 |
| CSS | 2.08 / 0.93 | 7.33 / 2.05 |
| Catalog route | 1.76 / 0.84 | 1.92 / 0.90 |
| Course route | 1.70 / 0.72 | 1.98 / 0.76 |
| Diagnostic route | 3.01 / 1.40 | 3.22 / 1.42 |
| Result route | 2.59 / 1.05 | 2.87 / 1.15 |
| Not found route | 0.25 / 0.20 | 0.27 / 0.21 |

FE-06 owns systematic browser timing, runtime profiling and performance budgets. This comparison measures emitted asset sizes. [Accessibility evidence and limitations](ACCESSIBILITY.md)
