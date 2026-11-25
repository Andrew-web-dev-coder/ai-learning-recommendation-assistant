# Stage 3 rubric traceability

This repository self-audit maps the requirements supplied for Stage 3 to reviewable evidence. The IDs below are local cross-references. A satisfied documentation row can describe a future design. Feature implementation and external assessment are identified separately.

## Minimum requirements

| Requirement ID | Official requirement | Implementation or documentation evidence | Verification method | Status | Remaining limitations |
| --- | --- | --- | --- | --- | --- |
| MIN-01 | Written documentation strategy and objectives | [Documentation strategy](DOCUMENTATION_STRATEGY.md#objectives-and-audience) | Review objectives, roles, lifecycle and repository links. | SATISFIED | Incorporation into the external report is pending. |
| MIN-02 | Documentation tools and standards | [Standards and organization](DOCUMENTATION_STRATEGY.md#standards-and-organization), [testing tools](TESTING.md#what-each-check-establishes) | Run Swagger CLI validation and parse the Mermaid blocks. | SATISFIED | Mermaid validation is performed separately from CI. |
| MIN-03 | Naming and formatting conventions | [Standards and organization](DOCUMENTATION_STRATEGY.md#standards-and-organization) and [OpenAPI](openapi.json) | Inspect stable lower camel case operation IDs, wire field names, code fences and links. | SATISFIED | Naming conventions for future endpoints are maintained through PR review. |
| MIN-04 | Versioning and known limitations | [Changelog](CHANGELOG.md), [current limitations](README.md#current-limitations-and-releases) | Compare OpenAPI `info.version` with release history and implemented routes. | SATISFIED | API is pre-1.0 and route paths are unversioned. |

## Maximum-grade documentation requirements

| Requirement ID | Official requirement | Implementation or documentation evidence | Verification method | Status | Remaining limitations |
| --- | --- | --- | --- | --- | --- |
| MAX-01 | Comprehensive API reference | [OpenAPI](openapi.json) and [endpoint index](README.md#endpoints) | Run Swagger CLI and `npm run test:contract`. All six routes are exercised by the [live suite](../../tests/api.contract.mjs). | SATISFIED | Default HTML error text is environment-dependent. |
| MAX-02 | Conceptual guides and best practices | [API design](API_DESIGN.md#resource-and-representation-design), [integration practices](API_DESIGN.md#integration-best-practices) | Review method choice, BIGINT handling, state transitions and retry guidance against the handlers. | SATISFIED | Reconciliation has no read route. |
| MAX-03 | Integration tutorials and developer onboarding | [Quick start](README.md#getting-started) and [PowerShell guide](README.md#powershell-integration-walkthrough) | Follow schema and seed setup, then discovery, both diagnostics and learner decisions. The contract suite replays the OpenAPI write examples. | SATISFIED | The tutorial assumes fresh reference IDs for the two classifier exercises. |
| MAX-04 | Release notes and versioning documentation | [Changelog and version policy](CHANGELOG.md) | Check referenced commits and compare package and API versions. | SATISFIED | Version history tracks the only documented API version. |
| MAX-05 | Complex request flows | [Diagnostic sequence](ARCHITECTURE.md#diagnostic-answer-and-recommendation) and [decision sequence](ARCHITECTURE.md#recommendation-decision) | Inspect branch order and transaction boundaries. Run tests named `Missing active recommendation rule rolls back the inserted attempt` and `Competing decisions yield exactly one success and cannot overwrite the winner`. | SATISFIED | Network loss during commit remains outside the suite. |
| MAX-06 | Pagination strategies | [Pagination design](API_DESIGN.md#pagination) | Compare collection SQL ordering and full responses with offset and cursor proposals. | SATISFIED | Pagination parameters and metadata are proposals. |
| MAX-07 | Rate limiting | [Rate-limit design](API_DESIGN.md#rate-limiting) | Review registered middleware, 429 and Retry-After proposal, and separate read/write budgets. | SATISFIED | No rate limiter or 429 contract is implemented. |
| MAX-08 | Authentication and authorization deep dive | [Trust boundaries](SECURITY.md#trust-boundaries-and-ownership) and [proposed controls](SECURITY.md#proposed-authentication-and-authorization) | Compare route predicates with the documented identity and ownership gaps. Review token and enforcement proposals. | SATISFIED | The current API has no identity or access enforcement. |
| MAX-09 | Error taxonomy | [Error taxonomy](API_DESIGN.md#error-taxonomy) and [OpenAPI](openapi.json) | Run `npm run test:contract` for JSON and HTML errors, uncertainty, configuration failures and rollback. | SATISFIED | Stable error codes and correlation IDs are proposals. |
| MAX-10 | Idempotency | [Retry safety](API_DESIGN.md#idempotency-and-retry-safety) | Verify duplicate POST creates a distinct attempt and competing PATCH calls return 200 and 409 in the live suite. | SATISFIED | Idempotency keys, response replay and write lookup are proposals. |
| MAX-11 | Versioning strategy | [Future versions and deprecation](CHANGELOG.md#future-versions-and-deprecation), [consumer migration](API_DESIGN.md#versioning-and-compatibility) | Review compatibility, versioned prefixes, migration overlap and removal rules. | SATISFIED | No parallel production API versions exist. |
| MAX-12 | Detailed architecture and sequence diagrams | [Architecture](ARCHITECTURE.md#sequence-diagrams) | Parse Mermaid and trace validation, reads, writes and rollback against `server/index.ts`. | SATISFIED | Diagrams cover the local MVP topology. |
| MAX-13 | Component diagrams and dependency maps | [System context](ARCHITECTURE.md#system-context), [dependencies](ARCHITECTURE.md#components-and-dependencies) | Parse Mermaid and compare dependencies with `src/App.tsx`, `server/assessment.ts`, and `server/db.ts`. | SATISFIED | Future LLM work is described separately. |
| MAX-14 | Request-response lifecycles | [Diagnostic lifecycle](ARCHITECTURE.md#diagnostic-answer-and-recommendation), [decision lifecycle](ARCHITECTURE.md#recommendation-decision) | Review commit-before-response, nullable fields and the guarded decision update. Compare live HTTP and PostgreSQL state. | SATISFIED | The API exposes no history or reconciliation read. |
| MAX-15 | Advanced validation and contract testing methodologies | [Methodology and CI](TESTING.md) and [contract suite](../../tests/api.contract.mjs) | Run Swagger CLI, `npm run test` and `npm run test:contract`. Inspect schema validation, persisted fixtures, induced rollback and contention scenarios. | SATISFIED | No load, proxy or arbitrary network-failure suite. |
| MAX-OPT | Optional consumer-driven contracts and generated fuzzing | [Coverage boundaries](TESTING.md#troubleshooting-and-coverage-boundaries) | Review the methodology selection below. | NOT APPLICABLE — JUSTIFIED | The repository uses one frontend and a small deterministic fixture catalog. |

## Grading penalty checks

| Requirement ID | Official requirement | Implementation or documentation evidence | Verification method | Status | Remaining limitations |
| --- | --- | --- | --- | --- | --- |
| PEN-01 | Completeness | [Documentation map](README.md#documentation-map) and MAX-01 through MAX-15 | Walk every requirement and confirm linked evidence. | SATISFIED | Proposal-only scope is disclosed. |
| PEN-02 | Technical accuracy | [OpenAPI](openapi.json), [route handlers](../../server/index.ts), [suite](../../tests/api.contract.mjs) | Compare statuses, messages, IDs, enum values and responses over live HTTP. | SATISFIED | Induced infrastructure coverage is representative. |
| PEN-03 | Structure and navigation | [Contents](README.md#contents) and document map | Verify relative file links and heading anchors. | SATISFIED | Rendering depends on the Markdown viewer's Mermaid support. |
| PEN-04 | Specification quality | [OpenAPI](openapi.json) and `Published response examples match their OpenAPI response schemas` | Swagger CLI plus `npm run test:contract` validate structure and operational payloads. | SATISFIED | The UTF-16 length rule and upper BIGINT path boundary are explained in prose and tested at runtime. |
| PEN-05 | Developer experience | [Getting started](README.md#getting-started) and [testing troubleshooting](TESTING.md#troubleshooting-and-coverage-boundaries) | Start the disposable database, run both diagnostic examples and check service readiness. | SATISFIED | Local setup requires PostgreSQL and Node.js 24. |
| PEN-06 | Runnable and accurate examples | [PowerShell tutorial](README.md#powershell-integration-walkthrough), [reference seed](../../database/seeds/001_reference_data.sql), [suite](../../tests/api.contract.mjs) | Replay the four OpenAPI attempt examples, accept and reject, and compare persisted data. | SATISFIED | Windows PowerShell 5.1 is outside the current verification environment. |
| PEN-07 | Versioning and updates | [Version policy](CHANGELOG.md#future-versions-and-deprecation), [change management](DOCUMENTATION_STRATEGY.md#change-management-and-versioning) | Audit history links and PR maintenance steps. | SATISFIED | Published API version remains 0.1.0. |
| PEN-08 | Security documentation | [Security controls and limitations](SECURITY.md) | Compare the middleware, queries and DB environment inputs with the documented controls and gaps. | SATISFIED | No deployment security or compliance audit is implied. |
| PEN-09 | Error handling | [Error taxonomy](API_DESIGN.md#error-taxonomy), [testing scenarios](TESTING.md#scenario-coverage) | Run live negative scenarios and check rollback, 400/404/409/422/500, and parser responses. | SATISFIED | Ambiguous delivery and deployment-level failures are documented outside automated coverage. |

## Methodology and remaining external actions

Structural validation and real HTTP schema checks complement each other. The first verifies the document. The second verifies how Express and PostgreSQL behave together. The small deterministic reference seed supports exact assertions for educational outcomes and row consistency. Consumer-driven contracts would add value when independent API consumers publish expectations. Generated fuzzing could broaden coverage after those interfaces stabilize. Both are optional extensions to the current evidence.

Incorporate the [documentation strategy](DOCUMENTATION_STRATEGY.md) and selected verification evidence into the written diploma report. External incorporation and university assessment remain **NOT VERIFIED** here.
