# Data Dictionary — PostgreSQL OLTP

Source of truth: `database/migrations/001_initial_schema.sql` (reviewed 15 November 2026). All identity PK columns use `BIGINT GENERATED ALWAYS AS IDENTITY`. This dictionary describes the schema as defined by that migration, not an independently verified live deployment.

## Tables and fields

### `learners`

**Purpose:** Anonymous demo learner identifier.

**Columns and constraints:** learner_id BIGINT identity PK; learner_code VARCHAR(64) NOT NULL UNIQUE; created_at TIMESTAMPTZ NOT NULL DEFAULT NOW().

### `courses`

**Purpose:** Course catalogue.

**Columns and constraints:** course_id BIGINT identity PK; course_code VARCHAR(32) NOT NULL UNIQUE; title VARCHAR(150) NOT NULL; description TEXT nullable; is_active BOOLEAN NOT NULL DEFAULT TRUE.

### `topics`

**Purpose:** Ordered topics per course.

**Columns and constraints:** topic_id BIGINT identity PK; course_id BIGINT NOT NULL FK courses; topic_code VARCHAR(64) NOT NULL; title VARCHAR(150) NOT NULL; position INTEGER NOT NULL CHECK >0; UNIQUE(course_id,topic_code); UNIQUE(course_id,position); UNIQUE(topic_id,course_id).

### `topic_prerequisites`

**Purpose:** Topic prerequisite graph; self-links prohibited.

**Columns and constraints:** topic_id BIGINT NOT NULL FK topics; prerequisite_topic_id BIGINT NOT NULL FK topics; composite PK(topic_id,prerequisite_topic_id); CHECK distinct.

### `content_snippets`

**Purpose:** Curated learning content.

**Columns and constraints:** snippet_id BIGINT identity PK; topic_id BIGINT NOT NULL FK topics; content TEXT NOT NULL nonblank; is_approved BOOLEAN NOT NULL DEFAULT FALSE.

### `exercises`

**Purpose:** Diagnostic exercises.

**Columns and constraints:** exercise_id BIGINT identity PK; topic_id BIGINT NOT NULL FK topics; prompt TEXT NOT NULL nonblank; exercise_type VARCHAR(30) NOT NULL CHECK IN(code,text,multiple_choice); is_active BOOLEAN NOT NULL DEFAULT TRUE.

### `error_categories`

**Purpose:** Misconception taxonomy.

**Columns and constraints:** error_category_id BIGINT identity PK; course_id BIGINT NOT NULL FK courses; error_code VARCHAR(64) NOT NULL; description TEXT NOT NULL; UNIQUE(course_id,error_code); UNIQUE(error_category_id,course_id).

### `exercise_answer_rules`

**Purpose:** Versioned deterministic answer patterns.

**Columns and constraints:** answer_rule_id BIGINT identity PK; exercise_id BIGINT NOT NULL FK exercises; rule_version INTEGER NOT NULL CHECK >0; expected_answer TEXT NOT NULL; error_category_id BIGINT nullable FK error_categories; UNIQUE(exercise_id,rule_version); UNIQUE(answer_rule_id,exercise_id).

### `attempts`

**Purpose:** Persisted diagnostic results.

**Columns and constraints:** attempt_id BIGINT identity PK; learner_id BIGINT NOT NULL FK learners; exercise_id BIGINT NOT NULL FK exercises; answer_rule_id BIGINT NOT NULL; submitted_answer TEXT NOT NULL; is_correct BOOLEAN NOT NULL; error_category_id BIGINT nullable FK error_categories; submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(); composite FK(answer_rule_id,exercise_id) to exercise_answer_rules; CHECK correct implies no error_category.

### `recommendation_rules`

**Purpose:** Deterministic error-to-topic mapping.

**Columns and constraints:** recommendation_rule_id BIGINT identity PK; error_category_id BIGINT NOT NULL FK error_categories; recommended_topic_id BIGINT NOT NULL FK topics; priority INTEGER NOT NULL DEFAULT 1 CHECK >0; is_active BOOLEAN NOT NULL DEFAULT TRUE; UNIQUE(error_category_id,recommended_topic_id).

### `recommendations`

**Purpose:** Recommendations and learner decisions.

**Columns and constraints:** recommendation_id BIGINT identity PK; attempt_id BIGINT NOT NULL FK attempts; recommendation_rule_id BIGINT NOT NULL FK recommendation_rules; explanation TEXT nullable; learner_decision VARCHAR(20) NOT NULL DEFAULT pending CHECK IN(pending,accepted,rejected); created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(); UNIQUE(attempt_id,recommendation_rule_id).

## Relationships and data quality

- Foreign keys enforce existence of referenced entities; composite FK on attempts ensures an answer rule belongs to the attempted exercise.
- NOT NULL, UNIQUE, CHECK, and default values enforce required values, uniqueness, domain constraints, and timestamps.
- Reference data is supplied by `database/seeds/001_reference_data.sql`; sample attempts by `database/seeds/002_demo_attempts.sql`.
- Migration and seed scripts use PostgreSQL transactions (`BEGIN`/`COMMIT`); application transaction handling and DB roles should be checked separately.
- Schema is organized around separate learner, course, topic, exercise, assessment, error, and recommendation entities to avoid unnecessary duplication; formal 3NF validation is a separate review step.

## Limitations / validation notes

- The migration does not enforce that prerequisite topics share a course, or that an error category and recommended topic belong to the same course. These rules should be checked in application logic or strengthened with additional constraints.
- No passwords or external LLM API keys belong in this schema or repository.
