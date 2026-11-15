
-- Migration 002: Performance indexes
-- AI Learning Recommendation Assistant
-- PostgreSQL 18

BEGIN;

-- Find exercises belonging to a topic.
CREATE INDEX IF NOT EXISTS idx_exercises_topic_id
ON exercises (topic_id);

-- Find attempts made by a learner.
CREATE INDEX IF NOT EXISTS idx_attempts_learner_id
ON attempts (learner_id);

-- Find attempts for a specific exercise.
CREATE INDEX IF NOT EXISTS idx_attempts_exercise_id
ON attempts (exercise_id);

-- Find attempts by error category.
CREATE INDEX IF NOT EXISTS idx_attempts_error_category_id
ON attempts (error_category_id);

-- Find recommendation rules for an error.
CREATE INDEX IF NOT EXISTS idx_recommendation_rules_error_category_id
ON recommendation_rules (error_category_id);

-- Find recommendations associated with an attempt.
CREATE INDEX IF NOT EXISTS idx_recommendations_attempt_id
ON recommendations (attempt_id);

-- Find content snippets for a learning topic.
CREATE INDEX IF NOT EXISTS idx_content_snippets_topic_id
ON content_snippets (topic_id);

COMMIT;
