# REST API integration guide

The [OpenAPI 3.0.3 reference](openapi.json) defines all six operations for API version 0.1.0. The local educational MVP requires no login or token. Use only synthetic data on a trusted local network.

## Contents

- [Quick start](#getting-started)
- [Endpoint reference](#endpoints)
- [Python and Lithuanian integration walkthrough](#powershell-integration-walkthrough)
- [Error handling and recovery](#error-handling-and-recovery)
- [Swagger Editor](#swagger-editor)
- [Testing and troubleshooting](#testing-and-troubleshooting)
- [Current limitations and releases](#current-limitations-and-releases)
- [Maintaining the contract](#maintaining-the-contract)

## Documentation map

| Document | Use it for |
| --- | --- |
| [OpenAPI reference](openapi.json) | Operations, schemas, content types and examples |
| [API design](API_DESIGN.md) | Design, error taxonomy, retries, pagination and rate-limit proposals |
| [Architecture](ARCHITECTURE.md) | Context, dependencies, transactions and request sequences |
| [Security](SECURITY.md) | Current trust boundaries and future identity and ownership design |
| [Changelog](CHANGELOG.md) | API releases, compatibility and deprecation |
| [Testing](TESTING.md) | Local and CI contract verification |
| [Documentation strategy](DOCUMENTATION_STRATEGY.md) | Standards, maintenance and material for the written report |
| [Rubric traceability](RUBRIC_TRACEABILITY.md) | Repository evidence and assessment gaps |

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

See the [error taxonomy](API_DESIGN.md#error-taxonomy) for endpoint-specific status codes, response shapes and recovery. For an uncertain result, preserve the answer and invite the learner to revise it. For a decision conflict, stop submitting changes. Avoid automatically retrying a write when delivery is ambiguous. Inspect the response content type before interpreting an error because Express parser errors can return HTML.

## Swagger Editor

Import `docs/api/openapi.json` through **File → Import File** in [Swagger Editor](https://editor.swagger.io/) to inspect operations, response variants and request examples. The specification points to `http://localhost:3001`. Hosted Swagger Editor can inspect the file, but its browser origin is outside the current API's CORS configuration for live requests. Use PowerShell or curl for live calls with the standard local setup.

## Testing and troubleshooting

Use `npm run test` for unit checks. The [testing guide](TESTING.md#reproduce-locally) gives the isolated PostgreSQL setup for `npm run test:contract`, plus the scope of response and persistence verification.

- **API connection refused:** confirm the backend is running at the address and port used by your HTTP client.
- **Health returns 500:** check the database process, role, database name and `.env` values. Inspect backend logs before retrying.
- **Missing learner or exercise:** recheck the reference seed and use the IDs returned by the SQL query and exercise endpoint above.
- **Browser CORS error:** use the configured Vite origin `http://localhost:5173`. A direct HTTP client can inspect the live API independently of the browser origin.
- **Unexpected uncertainty:** verify the exact seeded exercise and use a documented answer variant.

## Current limitations and releases

The backend accepts caller-supplied learner IDs and lacks authentication and ownership checks. The frontend assumes the demo learner has ID 1. Assessment uses predefined variants for two exercise IDs and cannot classify arbitrary answers. Collections are unpaginated. Rate limiting and idempotency keys are future design proposals. See [API design](API_DESIGN.md) and [security](SECURITY.md) for details. The [changelog](CHANGELOG.md) tracks the current API contract version 0.1.0 and future versioning policy.

## Maintaining the contract

Treat [OpenAPI](openapi.json) as the API contract. Update the spec, affected examples and changelog in the same PR when the contract changes. Review wire types, error responses, consumer assumptions and seeded paths. Run the [validation commands](TESTING.md#what-each-check-establishes), including live contract checks for HTTP or database behavior changes. See the [documentation strategy](DOCUMENTATION_STRATEGY.md#change-management-and-versioning) for PR responsibilities.
