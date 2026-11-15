# Logical Database Schema — PostgreSQL OLTP

Based on `database/migrations/001_initial_schema.sql`. The Mermaid diagram is a logical view; consult the DDL and [data dictionary](DATA_DICTIONARY.md) for exact types and constraints.

```mermaid
erDiagram
    learners ||--o{ attempts : submits
    courses ||--o{ topics : contains
    courses ||--o{ error_categories : defines
    topics ||--o{ exercises : has
    topics ||--o{ content_snippets : provides
    topics ||--o{ topic_prerequisites : requires
    topics ||--o{ topic_prerequisites : prerequisite_of
    exercises ||--o{ exercise_answer_rules : validates_with
    exercises ||--o{ attempts : assessed_in
    exercise_answer_rules ||--o{ attempts : applied_to
    error_categories o|--o{ exercise_answer_rules : categorizes
    error_categories o|--o{ attempts : classified_as
    error_categories ||--o{ recommendation_rules : triggers
    topics ||--o{ recommendation_rules : recommended_by
    attempts ||--o{ recommendations : yields
    recommendation_rules ||--o{ recommendations : selected_by

    learners {
        bigint learner_id PK
    }
    courses {
        bigint course_id PK
    }
    topics {
        bigint topic_id PK
    }
    topic_prerequisites {
        bigint composite PK
    }
    content_snippets {
        bigint snippet_id PK
    }
    exercises {
        bigint exercise_id PK
    }
    error_categories {
        bigint error_category_id PK
    }
    exercise_answer_rules {
        bigint answer_rule_id PK
    }
    attempts {
        bigint attempt_id PK
    }
    recommendation_rules {
        bigint recommendation_rule_id PK
    }
    recommendations {
        bigint recommendation_id PK
    }
```

## Main functional blocks

1. **Curriculum:** courses, topics, topic_prerequisites, content_snippets.
2. **Assessment:** exercises, exercise_answer_rules, error_categories, attempts.
3. **Recommendations:** recommendation_rules, recommendations.
4. **Learners:** learners, linked to their attempts.

The logical flow is: learner submits an exercise attempt; an answer rule classifies it; a recommendation rule maps an error category to a topic; the learner may accept or reject the resulting recommendation.
