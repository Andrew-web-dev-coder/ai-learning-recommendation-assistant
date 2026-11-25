# REST API integration guide

The [OpenAPI 3.0.3 contract](openapi.json) documents all six operations for API version 0.1.0. See the [architecture and request sequences](ARCHITECTURE.md), [security and privacy notes](SECURITY.md), and [API changelog and version policy](CHANGELOG.md).

## Getting started

Use Node.js 24, npm, a local PostgreSQL server and its `psql` client. Run commands from the repository root. The setup commands work in PowerShell and POSIX shells.

```sh
npm ci
```

Create a fresh, empty PostgreSQL database accessible to a local development role. Create a local `.env` using your database settings. The repository ignores `.env`.

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_local_db_user
DB_PASSWORD=your_local_db_password
DB_NAME=your_local_db_name
PORT=3001
```

Apply the [schema](../../database/migrations/001_initial_schema.sql), [indexes](../../database/migrations/002_indexes.sql), then [reference seed](../../database/seeds/001_reference_data.sql). Replace the database name and role placeholders and stop if any command fails. `psql` can prompt for the password. The reference seed is intended to run once on an empty database.

```sh
psql -h localhost -p 5432 -U your_local_db_user -d your_local_db_name -v ON_ERROR_STOP=1 -f database/migrations/001_initial_schema.sql
psql -h localhost -p 5432 -U your_local_db_user -d your_local_db_name -v ON_ERROR_STOP=1 -f database/migrations/002_indexes.sql
psql -h localhost -p 5432 -U your_local_db_user -d your_local_db_name -v ON_ERROR_STOP=1 -f database/seeds/001_reference_data.sql
psql -h localhost -p 5432 -U your_local_db_user -d your_local_db_name -c "SELECT learner_id FROM learners WHERE learner_code = 'DEMO_LEARNER_001';"
npm run server:dev
```

In a separate terminal, verify that the API returns HTTP 200 and a body with `status: "ok"`, the local database name and `message: "Backend connected to PostgreSQL"`.

```sh
curl -i http://localhost:3001/api/health
```

In Windows PowerShell, use `curl.exe` for the same command or `Invoke-RestMethod` as below. To run the React demo, run `npm run dev` in a separate terminal and open `http://localhost:5173`. The frontend targets port 3001 and uses demo learner ID 1.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check backend and database connectivity |
| GET | `/api/courses` | List courses ordered by title |
| GET | `/api/courses/{courseId}/topics` | List topics ordered by position and ID |
| GET | `/api/courses/{courseId}/exercises` | List active exercises ordered by topic position and exercise ID |
| POST | `/api/attempts` | Assess an answer and persist a recognized attempt with any resulting recommendation |
| PATCH | `/api/recommendations/{recommendationId}/decision` | Accept or reject a pending recommendation |

Send JSON writes with `Content-Type: application/json`. Keep returned PostgreSQL BIGINT IDs as decimal strings, including when interpolating a URL. Path IDs are positive, have no leading zeroes and are bounded by `9223372036854775807`. Only `learner_id` and `exercise_id` in attempt bodies must be JSON numbers in the range 1 through `9007199254740991`. Validate that range before converting a returned ID for use in a request body.

## PowerShell integration walkthrough

### Discover courses and exercises

```powershell
$api = 'http://localhost:3001'
Invoke-RestMethod -Uri "$api/api/health"

$courses = (Invoke-RestMethod -Uri "$api/api/courses").courses
$pythonCourse = $courses | Where-Object { $_.course_code -eq 'PYTHON' }
$lithuanianCourse = $courses | Where-Object { $_.course_code -eq 'LITHUANIAN' }

$pythonExercises = (Invoke-RestMethod -Uri "$api/api/courses/$($pythonCourse.course_id)/exercises").exercises
$lithuanianExercises = (Invoke-RestMethod -Uri "$api/api/courses/$($lithuanianCourse.course_id)/exercises").exercises
$pythonExercises | Format-Table exercise_id, prompt
$lithuanianExercises | Format-Table exercise_id, prompt
```

Use the ID returned by the learner query above. Match the exercise IDs to the displayed prompts. The Python string comparison and Lithuanian grammar prompts must have IDs 1 and 2 respectively for these patterns to work. The classifier keys on numeric IDs, so adding seed data to an existing database can change how a prompt is classified. Use a freshly initialized reference database for this walkthrough.

```powershell
$learnerId = [long](Read-Host 'Enter the demo learner ID')
$pythonExerciseId = [long](Read-Host 'Enter the Python exercise ID')
$lithuanianExerciseId = [long](Read-Host 'Enter the Lithuanian exercise ID')
```

### Python diagnostic and acceptance

Submit a recognized misconception. Expect HTTP 201 with `assessment_status: "incorrect"` and a pending **Type Conversion** recommendation.

```powershell
$pythonBody = @{
    learner_id = $learnerId
    exercise_id = $pythonExerciseId
    submitted_answer = 'python automatically converts strings to integers'
} | ConvertTo-Json

$pythonAttempt = Invoke-RestMethod -Method Post -Uri "$api/api/attempts" `
    -ContentType 'application/json; charset=utf-8' -Body $pythonBody
$pythonAttempt | ConvertTo-Json -Depth 5

$pythonRecommendationId = $pythonAttempt.recommendation.recommendation_id
Invoke-RestMethod -Method Patch -Uri "$api/api/recommendations/$pythonRecommendationId/decision" `
    -ContentType 'application/json' -Body '{"decision":"accepted"}'
```

The PATCH returns HTTP 200 with the saved decision in `recommendation.learner_decision`.

### Lithuanian diagnostic and rejection

Submit a recognized misconception. Expect HTTP 201 with a pending **Accusative Case** recommendation, then HTTP 200 with `learner_decision: "rejected"` for that recommendation.

```powershell
$lithuanianBody = @{
    learner_id = $learnerId
    exercise_id = $lithuanianExerciseId
    submitted_answer = 'mokykla is correct'
} | ConvertTo-Json

$lithuanianAttempt = Invoke-RestMethod -Method Post -Uri "$api/api/attempts" `
    -ContentType 'application/json; charset=utf-8' -Body $lithuanianBody
$lithuanianAttempt | ConvertTo-Json -Depth 5

$lithuanianRecommendationId = $lithuanianAttempt.recommendation.recommendation_id
Invoke-RestMethod -Method Patch -Uri "$api/api/recommendations/$lithuanianRecommendationId/decision" `
    -ContentType 'application/json' -Body '{"decision":"rejected"}'
```

To see the correct-answer path, submit `i need to convert the string into an integer` for Python or `aš einu į mokyklą` for Lithuanian. Keep the UTF-8 content type and save any script containing Lithuanian text as UTF-8 with BOM if running it in Windows PowerShell 5.1. A correct attempt returns HTTP 201 with `recommendation: null`.

### Inspect error responses

Re-run either decision request to get HTTP 409. PowerShell's `Invoke-RestMethod` throws on non-2xx responses by default. Use `curl.exe -i "$api/api/courses/0/topics"` on Windows to inspect a raw HTTP 400 response.

```json
{"status":"error","message":"Invalid course ID"}
```

A repeated decision returns:

```json
{"status":"error","message":"Recommendation has already been decided"}
```

An answer such as `Something unrelated` for either seeded exercise returns HTTP 422:

```json
{
  "status": "uncertain",
  "assessment_status": "uncertain",
  "message": "The submitted answer cannot be classified with sufficient confidence",
  "recommendation": null
}
```

## Error handling and recovery

| Operation | Current response | Client action |
| --- | --- | --- |
| Health | 500 `Database connection failed` | Check database availability and backend configuration before retrying. |
| Courses | 500 `Failed to fetch courses` | Retry the read with bounded backoff for transient failures. |
| Course topics or exercises | 400 invalid course ID, 404 course missing, or 500 fetch failure | Validate ID format, refresh the course list on 404, or retry a transient 500 with bounded backoff. A 200 with an empty list is valid. |
| Submit attempt | 400 invalid body fields, or 404 learner or active exercise missing | Correct the payload, verify the local learner, or refresh the active exercise list. |
| Submit attempt | 422 with `status: "uncertain"` | Give the learner a chance to revise the answer. The transaction rolls back. |
| Submit attempt | 422 with `status: "error"` for a missing answer rule, error category or active recommendation rule | Report a configuration problem to the maintainer. Wait for the configuration to be corrected before resubmitting. An attempt inserted before recommendation lookup is rolled back. |
| Submit attempt | 500 database connection or attempt processing failure | Investigate database health. The handler attempts rollback for processing exceptions and releases the connection. A timeout or connection loss leaves the client unsure whether a commit happened. |
| Save decision | 400 invalid ID or decision, 404 recommendation missing, or 409 already decided | Correct the request, verify the ID, or stop submitting changes on conflict. A 409 does not tell the client which decision won. |
| Save decision | 500 `Failed to save learner decision` | Investigate database health. The conditional update permits only one successful transition. A retry after an ambiguous failure may return 409. |

A POST has no idempotency key or duplicate detection. Disable repeated submissions while a request is in flight and avoid automatic POST retries after timeouts or uncertain delivery. The API has no attempt or recommendation lookup route for reconciling an ambiguous write. Handler errors generally return `status` and `message`, without a machine-readable error code or correlation ID. Express middleware can reject malformed JSON or an oversized body before the handler runs and return its default error format. Parse the response based on its content type.

Future recovery improvements could add idempotency keys, stable error codes, correlation IDs and an authorized lookup for reconciling writes.

## Swagger Editor

Import `docs/api/openapi.json` through **File → Import File** in [Swagger Editor](https://editor.swagger.io/) to inspect operations, response variants and request examples. The specification points to `http://localhost:3001`. Hosted Swagger Editor can inspect the file, but its browser origin is outside the current API's CORS configuration for live requests. Use PowerShell or curl for live calls with the standard local setup.

## Maintaining the contract

Treat [OpenAPI](openapi.json) as the API contract. When changing a route, database serialization or frontend integration, the PR author checks the corresponding request validation, response shape, status codes and client assumptions against the spec. Update the spec, affected examples and changelog in the same PR when the contract changes. Use the [version policy](CHANGELOG.md) to review compatibility.

Reviewers should compare the diff with the routes, schema, reference data and frontend call sites. Verify that example answers match the classifier and expected rules. Run the [CI workflow](../../.github/workflows/ci.yml) checks locally and require the PR checks to pass before merging.

```sh
npx --yes @apidevtools/swagger-cli@4.0.4 validate docs/api/openapi.json
npm run test
npm run lint
npm run build
```

CI validates OpenAPI structure and runs unit tests, lint and build. For contract verification, also run HTTP checks against a fresh local PostgreSQL database after route, schema or reference data changes. Compare actual JSON shapes, ID types and status codes against OpenAPI, including success, uncertainty, rule failure and repeated decisions. The existing CI job does not provision PostgreSQL or execute those HTTP checks.
