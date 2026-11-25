# API security and privacy

## Current behavior and controls

| Area | Implementation and limitations |
| --- | --- |
| Identity and authorization | The API has no authentication, sessions or authorization. The attempt handler checks whether the caller-supplied `learner_id` exists. A caller can submit under another learner's ID, and anyone with API access and a pending recommendation ID can decide it. The frontend's fixed demo learner ID is a convention. |
| Validation | The route handlers validate path IDs as positive decimal BIGINTs, attempt body IDs as positive safe integers, answer text as nonblank and at most 5,000 UTF-16 code units, and decisions as exactly `accepted` or `rejected`. They check the referenced learner and active exercise before saving the attempt. |
| SQL injection protection | [Route SQL](../../server/index.ts) binds request-controlled values as PostgreSQL query parameters (`$1`, `$2`, etc.). Query text and identifiers are fixed in the handlers. |
| CORS | Express configures `Access-Control-Allow-Origin` for `http://localhost:5173`. This controls which browser origin can read cross-origin responses. Direct HTTP clients can reach the API independently of CORS. |
| Configuration | [Database configuration](../../server/db.ts) reads `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME` from the process environment and loads a local `.env` via dotenv. The Express listener uses `PORT`. Keep actual credentials in the local ignored environment file or an environment-specific secret store. Keep them out of Vite variables, committed files and logs. |
| Data and logs | PostgreSQL stores the original answer text, learner linkage, timestamps and recommendation decisions. Use synthetic learner codes and answer text in demos. Free text can contain personal information. Restrict database and log access. The health route exposes the database name and backend errors can be written to server logs. |

The demo assumes a trusted local environment. Application-level TLS, request rate limiting, retention and deletion policies, and a security audit trail are absent. The server calls `app.listen(PORT)` without an explicit host, so restrict access at the network boundary when running it.

## Proposed safeguards

For shared deployment, authenticate callers through a trusted identity provider. Map the authenticated subject to a learner server-side and authorize each attempt and recommendation mutation against that learner's ownership. Decide whether health and catalog reads can remain public. Add deployment-side TLS, scoped database credentials, rate limits, operational audit events and retention/deletion procedures. Define and review how any future LLM feature would minimize learner data before sending context to an external service.
