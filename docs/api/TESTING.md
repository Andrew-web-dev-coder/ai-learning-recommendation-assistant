# API testing and contract verification

## What each check establishes

| Layer | Tool and command | Evidence |
| --- | --- | --- |
| Specification | `npx --yes @apidevtools/swagger-cli@4.0.4 validate docs/api/openapi.json` | OpenAPI structure and resolvable references. Swagger Editor can inspect the same document interactively. |
| Unit | `npm run test` | Vitest checks normalized Python and Lithuanian classifications and the legacy learning module. |
| HTTP contract | `npm run test:contract` | Node's test runner sends real requests to Express and checks actual status, media type and body against the corresponding OpenAPI operation. |
| Persistence | Same HTTP contract command | PostgreSQL assertions verify committed rows, exact decision state, and rollback. A separate fixture database is created per invocation. |
| Build and static analysis | `npm run lint` and `npm run build` | Existing project checks and Vite build. |

The [contract suite](../../tests/api.contract.mjs) selects the declared response for the observed HTTP method, path, status and media type, then uses the OpenAPI-aware `openapi-response-validator` to resolve component schemas and validate the body. Required fields, identifier types, enums, `oneOf` branches and nullability are checked. Scenario assertions check precise messages, recommendation contents, seeded values and side effects. Published response examples are also passed through the same schema validator. Published write examples are replayed against Express with IDs resolved from the isolated database. Invalid requests exercise the actual implementation's validation.

## Reproduce locally

Prerequisites are Node.js 24, npm and Docker. The commands below use only a disposable PostgreSQL service on loopback. If port 55432 is occupied, choose a different loopback port and update the URL. The example login is a synthetic fixture credential.

```bash
npm ci
docker run --rm -d --name api-contract-postgres -p 127.0.0.1:55432:5432 -e POSTGRES_USER=contract -e POSTGRES_PASSWORD=local_contract_only postgres:17
docker exec api-contract-postgres pg_isready -h 127.0.0.1 -U contract -d postgres
CONTRACT_DB_URL=postgresql://contract:local_contract_only@127.0.0.1:55432/postgres npm run test:contract
docker stop api-contract-postgres
```

Repeat the readiness command until it reports `accepting connections`. In PowerShell, set `$env:CONTRACT_DB_URL = 'postgresql://contract:local_contract_only@127.0.0.1:55432/postgres'` before `npm run test:contract`, then remove it with `Remove-Item Env:CONTRACT_DB_URL`. Use a dedicated local or CI service with permission to create and drop its own databases. The [test harness](../../tests/contract-environment.mjs) requires an explicit loopback URL to the service maintenance database. It creates a uniquely named database from `template0`, loads the initial schema, indexes and reference seed, starts the existing API with that database, and verifies readiness and database identity. Only the database created by the current invocation receives fixture mutations or cleanup. Run the full suite because later scenarios use fixture IDs discovered earlier. The test process terminates its backend and drops its database on normal exit, including test assertion failures. The disposable container removes any leftover databases if execution is interrupted.

## Scenario coverage

- Health and all three catalog reads validate JSON, collection contents and BIGINT strings.
- Correct and incorrect outcomes for both diagnostics validate schema variants, null values, rule explanations and committed rows.
- Acceptance, rejection, repeats and competing decisions validate 200/409, matching database state and the pending-only update.
- Input and reference checks exercise ID boundaries, unsafe numeric input, empty and whitespace text, UTF-16 size limits, missing course, learner, exercise or recommendation, inactive exercises and invalid decisions.
- Uncertainty and absent assessment, category or recommendation rules validate distinct 422 payloads and unchanged row counts. A fixture constraint forces a recommendation insert failure to verify the 500 rollback path.
- Middleware checks validate HTML 400, 413 and 415 responses. Body text is environment-dependent.

## CI and interpreting output

The [workflow](../../.github/workflows/ci.yml) retains its independent OpenAPI, unit, lint and build job. The HTTP job waits for PostgreSQL health, installs the lockfile, then invokes the fixture runner. Node reports named tests with pass, fail, skipped and cancelled totals. A failed status or schema includes the operation and validation details. A successful run ends with zero failures, skips or cancellations. CI retires its service on job exit. Use the PR's check run for the result of a specific commit.

## Troubleshooting and coverage boundaries

- **Connection refused:** wait for `pg_isready`, check the mapped port and confirm that the synthetic URL uses the explicit loopback address. A database permission error requires a dedicated service with database creation privileges.
- **API readiness failure:** inspect the emitted child process output and confirm Node.js 24, dependencies and seed SQL. Retry the whole suite if an unrelated process claimed the temporary API port.
- **Wrong HTTP status or media:** check the request, parser behavior and applicable handler. Compare the returned response with OpenAPI before modifying assertions.
- **Unexpected uncertain result:** use a fresh reference seed. The classifier's Python and Lithuanian exercise IDs are 1 and 2, and matching is deterministic.

The automated suite covers one induced database exception, plus normal database-backed behavior. It does not induce every route's connection failure, deployment-level proxy errors, load, browser rendering or arbitrary network disconnection at commit time. For a manual connection-failure check, start a separate backend process on an unused API port with `DB_HOST=127.0.0.1` and a confirmed unused `DB_PORT`. Check `GET /api/health` and a structurally valid `POST /api/attempts`. Both should return JSON 500 with `Database connection failed`. Stop that process afterward. Pagination, rate limiting, authentication and idempotency-key proposals are outside the runtime contract.
