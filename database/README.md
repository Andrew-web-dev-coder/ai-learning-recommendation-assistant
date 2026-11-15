# Database — AI Learning Recommendation Assistant

PostgreSQL transactional (OLTP) database for the diploma MVP. It stores learners, courses, topics, exercises, assessment attempts, error categories, recommendation rules and learner decisions.

## Assessment materials

- [Data dictionary](docs/DATA_DICTIONARY.md) — tables, columns, types, keys, constraints, quality rules.
- [Logical ER diagram](docs/ER_DIAGRAM.md) — entities and relationships (Mermaid).
- [Initial DDL](migrations/001_initial_schema.sql) — reproducible schema creation.
- [Migrations](migrations/) — additional SQL files for indexes, views and functions; review the two files beginning with `002_` before applying to avoid duplicate objects.
- [Reference data](seeds/001_reference_data.sql) and [demo attempts](seeds/002_demo_attempts.sql).
- [SQL tests](tests/) — integrity and recommendation checks.

## Local setup (PostgreSQL + psql)

1. Install PostgreSQL and create an **empty** local database, e.g. `createdb ai_learning_mvp` (with a local account permitted to create databases).
2. From the repository root, apply the initial schema:

```bash
psql -X -v ON_ERROR_STOP=1 -d ai_learning_mvp -f database/migrations/001_initial_schema.sql
psql -X -v ON_ERROR_STOP=1 -d ai_learning_mvp -f database/seeds/001_reference_data.sql
```

3. Optional: run `database/seeds/002_demo_attempts.sql` after reference data. Review additional migration scripts and apply only the intended non-overlapping set in documented order.
4. Run the SQL tests from `database/tests/` against a disposable test database with the seed data loaded, for example:

```bash
psql -X -v ON_ERROR_STOP=1 -d ai_learning_mvp -f database/tests/001_database_integrity.sql
```

The examples assume local `psql` authentication is already configured; do not commit credentials. Check the repository root README and server configuration for application startup. This document does not claim that a fresh installation or all tests were executed successfully.

## Security and integrity

- Never commit `.env`, database passwords, tokens, or API keys. Provide only placeholder environment-variable names in an `.env.example` if needed.
- For production or examiner deployment, provision a separate least-privilege application account; **do not use a PostgreSQL superuser for the application**.
- Constraints and foreign keys are defined in the initial migration. Schema changes are versioned in Git. The initial schema and reference-data scripts use SQL transactions.
- Database roles and permissions are not established by the initial schema migration; configure and verify these separately before claiming full compliance with the grading rubric.
