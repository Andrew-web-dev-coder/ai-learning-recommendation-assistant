# REST API Documentation — Stage 3

This documentation describes the **currently implemented** Express/PostgreSQL MVP, based on `server/index.ts` and `server/assessment.ts`. It is not a claim of production deployment or a live integration-test result.

## Contents

- [OpenAPI 3.0.3 specification](openapi.json) — six implemented endpoints, JSON request/response schemas, HTTP status codes and error cases.
- This README — local setup, request examples, integration walkthrough, limitations.

## Getting Started

### Requirements

- Node.js 24 and npm (matching the repository CI guidance).
- A running PostgreSQL instance.
- A local PostgreSQL database with the schema from `database/migrations/001_initial_schema.sql` and reference data from `database/seeds/001_reference_data.sql`. The seed script inserts `DEMO_LEARNER_001`. In a freshly initialized empty database, the frontend assumes its generated ID is 1; verify actual IDs before making requests.
- Do not commit credentials, passwords or API keys.

### Start the server

```bash
git clone https://github.com/Andrew-web-dev-coder/ai-learning-recommendation-assistant.git
cd ai-learning-recommendation-assistant
npm ci
```

Configure the PostgreSQL connection through environment variables (for example, in a local untracked `.env` file):

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_local_db_user
DB_PASSWORD=your_local_db_password
DB_NAME=your_local_db_name
PORT=3001
```

Initialize the schema and reference data using your PostgreSQL client, with the correct database selected. The SQL files live under `database/migrations/` and `database/seeds/`; run schema creation before seeding. **The seed script creates a demo learner**; verify its actual ID before trying the example POST request.

```bash
npm run server:dev
```

The backend listens at `http://localhost:3001` by default. In another terminal, optionally start the frontend with `npm run dev` (Vite typically uses `http://localhost:5173`). The current backend CORS configuration allows that origin only.

### Verify connectivity

```bash
curl -i http://localhost:3001/api/health
```

Expected shape when PostgreSQL is reachable:

```json
{"status":"ok","database":"your_local_db_name","message":"Backend connected to PostgreSQL"}
```

A failed database connection returns HTTP 500.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check backend and database |
| GET | `/api/courses` | List courses |
| GET | `/api/courses/{courseId}/topics` | List topics in a course |
| GET | `/api/courses/{courseId}/exercises` | List active diagnostic exercises |
| POST | `/api/attempts` | Assess an answer; persist a recognized attempt and recommendation |
| PATCH | `/api/recommendations/{recommendationId}/decision` | Accept or reject a pending recommendation |

All request and response bodies are JSON. `POST` and `PATCH` require `Content-Type: application/json`. PostgreSQL `BIGINT` IDs in responses are **decimal strings**, while `learner_id` and `exercise_id` in the POST body are positive **JSON safe integers**.

## Step-by-step integration tutorial

This scenario uses the current deterministic Python assessment patterns. The IDs in these examples assume a **fresh, empty database** initialized with the supplied migration and seed. In an existing database, discover actual IDs first.

**1. Find courses.**

```bash
curl -i http://localhost:3001/api/courses
```

Example response structure:

```json
{"status":"ok","courses":[{"course_id":"1","course_code":"PYTHON","title":"Introduction to Python"}]}
```

**2. Find exercises in the selected course.**

```bash
curl -i http://localhost:3001/api/courses/1/exercises
```

Also available: `GET /api/courses/1/topics`. Use the IDs actually returned. The deterministic classifier currently recognizes predefined variants for exercise IDs 1 (Python) and 2 (Lithuanian).

**3. Submit a recognized misconception.**

```bash
curl -i -X POST http://localhost:3001/api/attempts \
  -H "Content-Type: application/json" \
  -d '{"learner_id":1,"exercise_id":1,"submitted_answer":"python automatically converts strings to integers"}'
```

If learner 1, exercise 1, its answer rule and an active recommendation rule exist, the server returns **201**. The response includes `assessment_status: "incorrect"`, `attempt_id`, and a `recommendation` with `recommendation_id`, `topic_title`, `explanation` and `learner_decision: "pending"`. Save the returned recommendation ID.

**4. Accept the recommendation.** Replace `8` with the ID returned in step 3.

```bash
curl -i -X PATCH http://localhost:3001/api/recommendations/8/decision \
  -H "Content-Type: application/json" \
  -d '{"decision":"accepted"}'
```

Expected successful response shape:

```json
{
  "status":"ok",
  "message":"Learner decision saved successfully",
  "recommendation":{"recommendation_id":"8","attempt_id":"13","learner_decision":"accepted"}
}
```

A second decision attempt for the same recommendation returns **409** with `{"status":"error","message":"Recommendation has already been decided"}`.

**5. Check an uncertain answer.**

```bash
curl -i -X POST http://localhost:3001/api/attempts \
  -H "Content-Type: application/json" \
  -d '{"learner_id":1,"exercise_id":1,"submitted_answer":"Something unrelated"}'
```

The current classifier returns **422** with `status: "uncertain"` and `recommendation: null`; no attempt is committed.

## Error handling

- **400** — invalid path ID, request IDs, decision or answer text.
- **404** — missing course, learner, active exercise or recommendation.
- **409** — a recommendation already has a recorded decision.
- **422** — unclassifiable answer or missing configured assessment/recommendation rule.
- **500** — database or internal processing failure.

See `openapi.json` for endpoint-specific response messages and schemas. There is no universal error-code field or request correlation ID in the current implementation.

## API documentation validation

The specification is OpenAPI **3.0.3 JSON** and can be imported into Swagger Editor or another OpenAPI validator. CI runs a dedicated OpenAPI validator against the JSON file. A useful local structural check is:

```bash
node -e "const s=require('./docs/api/openapi.json'); if(s.openapi!=='3.0.3'||Object.keys(s.paths).length!==6)process.exit(1); console.log('OpenAPI JSON parsed; six paths present')"
```

This only checks JSON parsing and path count. **It is not full OpenAPI schema validation.** Run `npx --yes @apidevtools/swagger-cli@4.0.4 validate docs/api/openapi.json` locally to perform dedicated OpenAPI validation. Runtime HTTP checks still require a running PostgreSQL database.

## Current implementation limitations

- The backend has **no authentication or authorization**; `learner_id` is caller-supplied. This is a demo contract, not a secure multi-user API.
- Assessment is deterministic and limited to hard-coded approved patterns for two exercise IDs; arbitrary natural-language answers may return 422 uncertain.
- Recommendation explanations currently use the stored expected answer, **not an external LLM**.
- The frontend currently uses learner ID 1.
- CORS currently allows `http://localhost:5173`.
- A successful local smoke test, deployed service and OpenAPI validation are **not claimed** by this documentation alone.
