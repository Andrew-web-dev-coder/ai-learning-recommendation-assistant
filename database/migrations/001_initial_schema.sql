
BEGIN;

CREATE TABLE learners (
    learner_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    learner_code VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE courses (
    course_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_code VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE topics (
    topic_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(course_id),
    topic_code VARCHAR(64) NOT NULL,
    title VARCHAR(150) NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    UNIQUE (course_id, topic_code),
    UNIQUE (course_id, position),
    UNIQUE (topic_id, course_id)
);

CREATE TABLE topic_prerequisites (
    topic_id BIGINT NOT NULL REFERENCES topics(topic_id),
    prerequisite_topic_id BIGINT NOT NULL REFERENCES topics(topic_id),
    PRIMARY KEY (topic_id, prerequisite_topic_id),
    CHECK (topic_id <> prerequisite_topic_id)
);

CREATE TABLE content_snippets (
    snippet_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    topic_id BIGINT NOT NULL REFERENCES topics(topic_id),
    content TEXT NOT NULL CHECK (LENGTH(TRIM(content)) > 0),
    is_approved BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE exercises (
    exercise_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    topic_id BIGINT NOT NULL REFERENCES topics(topic_id),
    prompt TEXT NOT NULL CHECK (LENGTH(TRIM(prompt)) > 0),
    exercise_type VARCHAR(30) NOT NULL
        CHECK (exercise_type IN ('code', 'text', 'multiple_choice')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE error_categories (
    error_category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(course_id),
    error_code VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    UNIQUE (course_id, error_code),
    UNIQUE (error_category_id, course_id)
);

CREATE TABLE exercise_answer_rules (
    answer_rule_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exercise_id BIGINT NOT NULL REFERENCES exercises(exercise_id),
    rule_version INTEGER NOT NULL CHECK (rule_version > 0),
    expected_answer TEXT NOT NULL,
    error_category_id BIGINT REFERENCES error_categories(error_category_id),
    UNIQUE (exercise_id, rule_version),
    UNIQUE (answer_rule_id, exercise_id)
);

CREATE TABLE attempts (
    attempt_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    learner_id BIGINT NOT NULL REFERENCES learners(learner_id),
    exercise_id BIGINT NOT NULL REFERENCES exercises(exercise_id),
    answer_rule_id BIGINT NOT NULL,
    submitted_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    error_category_id BIGINT REFERENCES error_categories(error_category_id),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (answer_rule_id, exercise_id)
        REFERENCES exercise_answer_rules(answer_rule_id, exercise_id),
    CHECK (NOT is_correct OR error_category_id IS NULL)
);

CREATE TABLE recommendation_rules (
    recommendation_rule_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    error_category_id BIGINT NOT NULL
        REFERENCES error_categories(error_category_id),
    recommended_topic_id BIGINT NOT NULL
        REFERENCES topics(topic_id),
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (error_category_id, recommended_topic_id)
);

CREATE TABLE recommendations (
    recommendation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES attempts(attempt_id),
    recommendation_rule_id BIGINT NOT NULL
        REFERENCES recommendation_rules(recommendation_rule_id),
    explanation TEXT,
    learner_decision VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (learner_decision IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (attempt_id, recommendation_rule_id)
);

COMMIT;
