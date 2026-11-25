# Documentation strategy for the REST API

## Objectives and audience

The documentation supports repeatable integration with the learning recommendation MVP, makes the HTTP contract reviewable, and records the limits of the implemented service. Frontend and API developers need request and response details, setup instructions and recovery guidance. Maintainers need architecture, release history and verification procedures. Reviewers need evidence that examples and diagrams describe behavior exercised against the implementation.

## Standards and organization

OpenAPI 3.0.3 is the machine-readable contract. It records operations, path and body inputs, media types, responses and reusable schemas. Operation IDs use descriptive lower camel case and remain stable for generated clients. Route paths are resource-oriented and use HTTP methods to distinguish reads, resource creation and partial updates. The documentation retains the current wire conventions, including camel-case path parameters, snake_case JSON fields and decimal strings for PostgreSQL BIGINT outputs.

The [integration guide](README.md) is the entry point and provides seeded onboarding workflows. The [API design guide](API_DESIGN.md) explains trade-offs, error behavior and client practices. [Architecture](ARCHITECTURE.md) uses Mermaid to describe context, dependencies and interactions. [Security](SECURITY.md) documents trust boundaries and proposed controls. [Testing](TESTING.md), the [changelog](CHANGELOG.md) and [rubric traceability](RUBRIC_TRACEABILITY.md) provide verification, change history and assessment evidence.

Use English Markdown, descriptive headings and relative links for repository material. Write methods, paths, field names, commands and enum values as code. Use fenced blocks with language identifiers for JSON, shell, PowerShell and Mermaid. Use tables for status and field comparisons. For examples, use synthetic answers and local fixtures. Discover database IDs and reuse response IDs where possible. Describe current behavior before proposals, and link to the contract for detailed representations.

## Change management and versioning

Implementation changes start with an impact review of request validation, serialization, database rules and frontend calls. The PR author updates affected OpenAPI operations, examples, diagrams, test scenarios and the changelog in the same pull request. Reviewers compare the contract with the handlers and sample flows, review compatibility and visibility of security changes, and verify CI and relevant local evidence. Documentation-only clarifications keep version `0.1.0`. Follow the [version policy](CHANGELOG.md#future-versions-and-deprecation) for compatible additions, breaking changes and consumer migration. Contract and application package versions serve separate release concerns.

## Verification and developer experience

Swagger CLI validates OpenAPI structure. The unit tests cover deterministic classification separately from HTTP. The contract suite starts Express against a freshly seeded test database, selects response schemas by actual operation, status and media type, and validates the returned body with an OpenAPI-aware validator. It also checks state transitions and transaction rollback through PostgreSQL. This approach detects changes that pass structural validation while violating HTTP behavior. Review links and Mermaid syntax when editing prose and diagrams. The test instructions provide isolation, commands, failure interpretation and scope boundaries. The rubric matrix links each claim to repository material and an observable check.

## Security and known limitations

The service is an unauthenticated local MVP. Documentation identifies the demo learner convention, ownership gaps, CORS boundary and credential handling. Only synthetic data should be used for demos and tests. Proposed identity, rate limiting, pagination, error identifiers and idempotency policies are future work. Deterministic assessment supports the two seeded exercise IDs. Contract tests cover representative live flows with fresh fixtures and leave deployment security, load, browser behavior and network loss at commit time for separate verification.

Future improvements may include automated compatibility diffs against released contracts, generated client conformance suites for independent consumers and deployment smoke checks after the service has a shared environment. This section is maintained in the repository for later incorporation into the written diploma report.
