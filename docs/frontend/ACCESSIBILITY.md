# FE-05 accessibility verification

WCAG 2.2 Level AA is the target. Evidence covers selected Chromium states and interactions. A conformance determination requires additional human evaluation.

## Implementation and checks

| Area | Evidence |
| --- | --- |
| Semantics and names | Banner, named navigation, main and footer landmarks, route headings, native buttons and links, and explicit search and answer labels. The answer field references its prompt and length instruction. |
| Keyboard and focus | The first Tab reveals the skip-to-content link. Route changes focus the main landmark, confirmed results focus their outcome heading, and invalid submission returns focus to the answer field. When a keyboard decision closes the controls and leaves focus on the body, the recommendation region takes focus. The browser test exercises that sequence and checks a visible outline. The shell uses no fixed toolbar or overlay over the focused learner controls. |
| Feedback | Invalid input has an inline alert and an associated description. Status regions expose loading, search results, clarification, and the decision outcome. Pending and terminal outcomes use explicit text. |
| Contrast | Axe checks text contrast in the scanned states. WCAG relative-luminance calculations on token pairs gave at least 6.17:1 for the focus ring against canvas, surface and subtle backgrounds, and 4.00:1 for the control border against canvas and surface. The foreground/background pairs for warning, error and success text measured at least 6.91:1. |
| Targets and motion | Shared buttons, fields and standalone navigation links use a minimum 2.75rem height at the normal font size. The browser test measures both decision targets against the 24 CSS px threshold with enlarged text. The UI uses no animated or smooth-scroll effects. |

## Automated coverage

Playwright uses the existing desktop Chromium and Pixel 7 Chromium emulation projects. Each theme and project runs one axe test with eight scans. The four tests cover **32 scans with zero violations**. Axe uses WCAG 2.0, 2.1 and 2.2 A/AA tags and scans the whole page without rule exclusions. Exact state labels and any findings are attached as `axe-results` in the HTML report. The states are catalog loading, catalog read failure, catalog ready, course details, diagnostic form, validation error, assessment with decision controls, and saved recommendation. Loading and read failure are exercised using a delayed injected HTTP 500, with the retry going to Express. Other learner operations in these scans use the live seeded service. [Browser tests](../../tests/e2e/frontend-quality.e2e.mjs) · [Browser configuration](../../playwright.config.mjs)

The theme tests cover OS changes before an override, keyboard toggling, reload persistence, and storage access throwing. The responsive tests measure document scroll width at **320, 375, 768, 1024 and 1440 CSS px**, at 900px height, on the catalog, course, diagnostic and recommendation screens. They also set the root font size to 200% at 320px and verify reflow, then scroll each enlarged decision control into view and check its size. Width changes and root font scaling are reflow and text resize checks.

## Browser page zoom

A separate headless Chromium run used an extension's `chrome.tabs.setZoom` API with a 1280px starting content width and device scale factor 1. The browser reported 100%, 200% and 400% tab zoom. Catalog layout and scroll widths matched at 1280, 640 and 320 CSS px in each theme. At 400% the run opened the Python course and diagnostic, submitted the synthetic misconception and saved a recommendation decision in both themes. It checked for horizontal overflow on the course, diagnostic and recommendation screens at that zoom.

To repeat manually, open the production preview against seeded Express/PostgreSQL, set the desktop content width to 1280 CSS px at default zoom, then use Chromium's menu to set 200% and 400%. Compare `document.documentElement.scrollWidth` with `innerWidth` and step through the same controls in both themes. [Local test setup](TESTING.md#run-locally)

## Reproduce

Use Node 24 and the disposable PostgreSQL setup in the testing guide. [Database and browser setup](TESTING.md#run-locally)

```bash
npm ci
npm run format:check
npm run lint
npm run test
npm run build
npx --yes @apidevtools/swagger-cli@4.0.4 validate docs/api/openapi.json
npm run test:contract
npx playwright install chromium
npm run test:e2e
npx playwright show-report
```

The two audit cases per browser project capture catalog and result screenshots in both themes, for eight screenshots overall. Local screenshots are under the ignored `test-results/` directory. CI uploads the screenshots and HTML report as `frontend-quality-evidence` on a successful browser suite. Both learner tracks run through the production frontend, Express, and separately migrated and seeded databases on PostgreSQL 17.12. [CI](../../.github/workflows/ci.yml) · [Live journey assertions](../../tests/e2e/learning.e2e.mjs)

## Limits

Screen-reader testing was unavailable in this environment. Announced wording, timing and order still need human verification with assistive technology. Verification uses Chromium and an emulated mobile profile. Other engines, physical devices, operating system high-contrast modes and a full manual WCAG 2.2 AA review remain unverified. Performance timing and budget work remain with FE-06.
