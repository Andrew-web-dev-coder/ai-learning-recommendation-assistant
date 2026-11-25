# API changelog and version policy

## 0.1.0

The `info.version` in the [OpenAPI contract](openapi.json) identifies the first documented MVP API. Existing paths under `/api` are unversioned. The package version in `package.json` is separate.

- [Database-backed MVP](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/ac42291) implemented health, catalog reads, diagnostic assessment and recommendation decisions.
- [Stage 3 contract](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/6cc6613) documented the six routes. Subsequent commits added [local integration guidance](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/dbe0c8f) and [OpenAPI validation in CI](https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant/commit/18b76a6).
- Stage 3 follow-up documents the operation names, ID boundaries, seeded workflows and error recovery for the same HTTP behavior.
- Final Stage 3 hardening documents existing Express parser responses and both decision examples. Adds PostgreSQL-backed HTTP contract verification, design guidance and rubric traceability.

These entries track repository milestones for contract version 0.1.0.

## Future versions and deprecation

- Use a patch increment for backward-compatible fixes to the API contract. Clarifications of unchanged behavior can remain under the existing version. Treat operation IDs as stable once published because generated client method names may depend on them.
- Use a minor increment for backward-compatible additions such as optional input or new endpoints. Check consumer assumptions before adding response properties or enum values.
- While on `0.x`, a breaking change requires a clearly identified minor release, with affected consumers and migration steps recorded. After `1.0.0`, use a new major version for breaking changes. Examples include removing or renaming fields, changing ID types or required inputs, and changing status codes clients depend on.
- Introduce a versioned route prefix such as `/api/v1` through a separate compatibility decision when parallel contracts are needed. For a deprecation, mark affected operations or fields in OpenAPI where supported, document the replacement and migration procedure in the changelog, and communicate an agreed removal schedule before retirement.
