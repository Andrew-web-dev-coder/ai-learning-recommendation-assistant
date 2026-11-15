# Logical ER Diagram — PostgreSQL OLTP

This diagram documents the **actual tables and foreign-key relationships** declared in [001_initial_schema.sql](../migrations/001_initial_schema.sql). It is not a report of executed database tests. Nullable foreign keys are noted below; exact types, defaults and constraints are in the [data dictionary](DATA_DICTIONARY.md) and SQL migration.

```mermaid
erDiagram
    learners ||--o{ attempts : submits
    courses ||--o{ topics : contains
    courses ||--o{ error_categories : defines
    topics ||--o{ exercises : has
    topics ||--o{ content_snippets : has
    topics ||--o{ topic_prerequisites : dependent_topic
    topics ||--o{ topic_prerequisites : prerequisite_topic
    exercises ||--o{ exercise_answer_rules : has
    exercises ||--o{ attempts : attempted
    exercise_answer_rules ||--o{ attempts : evaluated_by
    error_categories o|--o{ exercise_answer_rules : may_classify
    error_categories o|--o{ attempts : may_classify
    error_categories ||--o{ recommendation_rules : maps
    topics ||--o{ recommendation_rules : suggested_by
    attempts ||--o{ recommendations : produces
    recommendation_rules ||--o{ recommendations : uses

    learners {
        bigint learner_id PK
        varchar learner_code UK
        timestamptz created_at
    }
    courses {
        bigint course_id PK
        varchar course_code UK
        varchar title
        text description
        boolean is_active
    }
    topics {
        bigint topic_id PK
        bigint course_id FK
        varchar topic_code
        varchar title
        integer position
    }
    topic_prerequisites {
        bigint topic_id PK, FK
        bigint prerequisite_topic_id PK, FK
    }
    content_snippets {
        bigint snippet_id PK
        bigint topic_id FK
        text content
        boolean is_approved
    }
    exercises {
        bigint exercise_id PK
        bigint topic_id FK
        text prompt
        varchar exercise_type
        boolean is_active
    }
    error_categories {
        bigint error_category_id PK
        bigint course_id FK
        varchar error_code
        text description
    }
    exercise_answer_rules {
        bigint answer_rule_id PK
        bigint exercise_id FK
        integer rule_version
        text expected_answer
        bigint error_category_id FK
    }
    attempts {
        bigint attempt_id PK
        bigint learner_id FK
        bigint exercise_id FK
        bigint answer_rule_id FK
        text submitted_answer
        boolean is_correct
        bigint error_category_id FK
        timestamptz submitted_at
    }
    recommendation_rules {
        bigint recommendation_rule_id PK
        bigint error_category_id FK
        bigint recommended_topic_id FK
        integer priority
        boolean is_active
    }
    recommendations {
        bigint recommendation_id PK
        bigint attempt_id FK
        bigint recommendation_rule_id FK
        text explanation
        varchar learner_decision
        timestamptz created_at
    }
```

## Interpretation

- **Curriculum:** `courses` contains `topics`; `topic_prerequisites` is a junction table with the composite primary key **(`topic_id`, `prerequisite_topic_id`)**, both referencing `topics`.
- **Exercises and assessment:** each exercise belongs to one topic. `exercise_answer_rules` stores versioned answer rules; each `attempts` record references one learner, exercise, and answer rule. The composite foreign key (`answer_rule_id`, `exercise_id`) ensures the answer rule belongs to the same exercise.
- **Error classification:** `exercise_answer_rules.error_category_id` and `attempts.error_category_id` are **nullable** foreign keys.
- **Recommendations:** `recommendation_rules` maps error categories to recommended topics; `recommendations` records the applied rule and the learner's `pending`, `accepted`, or `rejected` decision.
- **Cardinality:** a parent may have zero or more children. A nullable FK permits a missing referenced category; a NOT NULL FK requires a referenced row.
- **Scope note:** the SQL migration prevents self-prerequisites, but does not itself prevent prerequisite cycles or enforce same-course topic relationships for recommendation rules. These are known integrity considerations, not features claimed as implemented.

**Reference:** [Data Dictionary](DATA_DICTIONARY.md) · [Initial DDL](../migrations/001_initial_schema.sql) · [Database README](../README.md).
