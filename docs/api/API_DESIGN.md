# API design and integration practices

## Resource and representation design

The [API reference](openapi.json) defines the six REST operations. `GET` reads health and catalog representations. Courses own topic and exercise collections addressed by path ID. `POST /api/attempts` creates an attempt after deterministic assessment and returns 201 after commit. `PATCH /api/recommendations/{recommendationId}/decision` changes one field on an existing recommendation and returns 200 with the saved decision. The API has no history or write-reconciliation read operation.

Send write bodies as `application/json` using UTF-8. Handler responses are JSON and typically carry a top-level `status`. Branch on the HTTP status and the documented discriminator fields. Express can also return an HTML error before a handler runs. Clients should inspect the media type before parsing.

PostgreSQL BIGINT identifiers returned by the driver are decimal JSON strings. Pass path IDs as strings using digits without signs or leading zeroes, up to `9223372036854775807`. The write contract accepts `learner_id` and `exercise_id` as positive JSON integers up to `9007199254740991`. Validate the number before converting IDs for those two body fields. Keep larger IDs as strings throughout UI state and URL construction. Answer text must contain non-whitespace and have at most 5,000 JavaScript UTF-16 code units. Count the original value, including whitespace. Decision values are exactly `accepted` or `rejected`.

The [assessment lifecycle](ARCHITECTURE.md#diagnostic-answer-and-recommendation) checks learner, active exercise and answer-rule configuration before classification. The deterministic classifier matches normalized answer variants for two known exercise IDs. Correct outcomes commit one attempt. Incorrect outcomes commit the attempt and a pending recommendation together. The selected active rule has the smallest priority number, with the rule ID as a deterministic tie-breaker. This design makes outcomes explainable and the fixture repeatable. Its trade-offs are narrow language coverage, coupling to seeded exercise IDs, and operator-maintained rules.

## Pagination

`GET /api/courses`, `GET /api/courses/{courseId}/topics` and `GET /api/courses/{courseId}/exercises` return full arrays. The seed contains two courses, two topics per course, and one exercise per course. One small request per collection is practical at this scale. When the catalog grows, full responses increase database work, memory, bandwidth and UI latency. An existing course can return an empty collection with 200.

### Proposed pagination

| Approach | Proposed request and metadata | Advantages and trade-offs |
| --- | --- | --- |
| Offset | `?limit=25&offset=50`. Return `limit`, `offset` and `has_more`. Include `total` only if the UI needs a count and its cost is acceptable. | Direct page jumps and simple clients. Large offsets scan or skip rows. Inserts and deletions between pages can cause duplicates or gaps. |
| Cursor | `?limit=25&cursor=<opaque-token>`. Return `limit` and `next_cursor` (null at the end). | Efficient indexed scans and predictable continuation on a stable sort key. Arbitrary page jumps and totals are harder. Updates to ordering fields can still shift rows across a cursor. |

Use a bounded limit and a total order. For courses, order by `title, course_id` with a consistent collation. For topics, retain `position, topic_id`. For exercises, retain topic position and exercise ID. Bind cursors to course, filters and ordering so clients cannot reuse them in a different collection. Prefer cursor pagination for sequential browsing when measured usage warrants it. Introduce it through an opt-in or versioned contract so existing consumers that expect complete arrays keep their behavior. These parameters and metadata are proposals. Current routes return complete collections.

## Rate limiting

The API has no application-level or documented gateway rate limiting. Repeated reads can consume pool and response capacity. Repeated attempt writes can consume database connections, storage and assessment resources.

For future shared use, enforce coarse IP limits at the gateway and per-identity quotas at the application boundary after authentication. Give catalog reads and diagnostic writes separate budgets. Use a lower write budget to limit persisted workload, and choose burst and sustained limits from load tests. A rate-limited response should return `429 Too Many Requests` and may state the delay in `Retry-After` as delta seconds or an HTTP date. Respect that delay. On retryable reads, use bounded exponential backoff with jitter and a retry budget. For writes, retry only with a documented idempotency guarantee or evidence of non-delivery. The current contract has no 429 response or retry headers.

## Error taxonomy

The [OpenAPI reference](openapi.json) has the complete endpoint/status/message examples. JSON handler errors normally have `{ "status": "error", "message": "..." }`. The uncertain response has its own shape.

| Category | Status and response | Applicable operations and examples | Recovery and retry safety |
| --- | --- | --- | --- |
| Input validation | 400 JSON error | Course topics/exercises: `Invalid course ID`. Attempts: `Invalid learner_id, exercise_id or submitted_answer`. Decision: `Invalid recommendation ID` or `Decision must be accepted or rejected`. | Fix the input before sending again. A handler validation failure occurs before writes. |
| Resource missing | 404 JSON error | Catalog children: `Course not found`. Attempts: `Learner not found` or `Active exercise not found`. Decision: `Recommendation not found`. | Refresh catalog data, verify demo learner setup, or discard a stale recommendation ID. Avoid retrying unchanged requests. |
| State conflict | 409 JSON error | Decision: `Recommendation has already been decided`. | Stop submitting changes. The response does not identify which decision was saved. |
| Assessment uncertainty | 422 JSON with `status: "uncertain"`, `assessment_status: "uncertain"`, `recommendation: null` and a message | Attempts: `The submitted answer cannot be classified with sufficient confidence`. | Invite a revised answer and preserve the draft. No attempt is committed. An unchanged answer with unchanged rules will remain uncertain. |
| Missing configuration | 422 JSON error | Attempts: `No assessment rule for this exercise`, `No error category configured for this rule`, `No active recommendation rule found`. | Report a configuration issue to the maintainer. The transaction rolls back, including any attempt insert before the recommendation lookup. Retry after repair. |
| Infrastructure or database | 500 JSON error | Health/attempt connect: `Database connection failed`. Catalog reads: `Failed to fetch courses`, `Failed to fetch topics`, `Failed to fetch exercises`. Attempt processing: `Failed to process attempt`. Decision: `Failed to save learner decision`. | Check health, service configuration and logs. Retry transient reads with a bounded policy. Preserve ambiguous write state until reconciled. |
| Parser or router | 400, 413 or 415, typically Express HTML | Malformed JSON (400), default parser size limit of 100 KiB (413), unsupported JSON charset or content encoding (415). Malformed encoding in a route parameter can return HTML 400. Production HTML can contain `Bad Request`, `Payload Too Large` or `Unsupported Media Type`. Framework details vary with environment. | Inspect status and content type. Fix JSON, media parameters, body size or path encoding before retrying. These failures precede the route handler. |

An uncertain answer means the classifier lacked a matching variant. Missing configuration means server data failed to support a classification or recommendation. The shared 422 status is insufficient to distinguish them. Use the `status` discriminator instead of matching messages. Stable machine-readable error codes and correlation IDs are future improvements.

## Idempotency and retry safety

HTTP safe methods request no state change. An idempotent operation aims for the same intended server effect when repeated. The four GET operations are safe and idempotent. Their returned data can change. `POST /api/attempts` is neither safe nor idempotent. Repeating an identical valid POST creates another attempt and can create another recommendation.

The decision PATCH uses an atomic SQL update restricted to a pending row. Once a decision exists, repeating the same or a different decision returns 409. The database state remains stable. A conflicting response from a retry does not prove which caller won. If a network failure hides a POST or PATCH result, the original write may already have committed. Avoid automatic retries of ambiguous writes.

A future idempotency design can scope `Idempotency-Key` to authenticated learner and operation, store a canonical request fingerprint and committed response with the mutation, and enforce uniqueness in the database. Replay the stored response for the same key and fingerprint. Reject key reuse for different payloads. Define retention, in-flight conflict behavior and a recovery path after expiry. Treat content similarity only as a duplicate warning because learners may deliberately submit an answer again. A future authorized lookup by attempt ID or request key could reconcile ambiguous writes. There is currently no key handling, deduplication or lookup route.

## Versioning and compatibility

[Release history and version policy](CHANGELOG.md#future-versions-and-deprecation) describes the OpenAPI `info.version` (`0.1.0`), the separate npm package version, compatible additions and breaking changes. Deprecation should include a replacement, examples, an overlap period and a published removal date. Consumers should test against both supported versions during overlap before switching. A future prefix such as `/api/v1` is a proposal for parallel incompatible contracts.

## Integration best practices

- Validate payloads before sending and use the API's response as the final result. Retain the draft after validation errors and show actionable feedback.
- Disable answer and decision buttons while the respective request is pending. On success, update the UI from the returned response and keep identifiers as strings when constructing URLs.
- Display correct results without a recommendation panel. For uncertainty, preserve the answer and invite a revision. For missing configuration, surface a service issue.
- Treat 409 as a resolved recommendation state with an unknown winner unless the client already has a confirmed decision. Use a distinct network error state when delivery is ambiguous.
- Use only synthetic data on the unauthenticated local MVP. Keep database credentials, full connection strings and learner text out of client bundles, screenshots and diagnostics. See [security guidance](SECURITY.md).
