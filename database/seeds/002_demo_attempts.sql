
BEGIN;

-- Python: learner submits an incorrect answer.
INSERT INTO attempts (
    learner_id,
    exercise_id,
    answer_rule_id,
    submitted_answer,
    is_correct,
    error_category_id
)
SELECT
    l.learner_id,
    e.exercise_id,
    ar.answer_rule_id,
    'Python compares "18" and 18 automatically.',
    FALSE,
    ec.error_category_id
FROM learners l
CROSS JOIN exercises e
JOIN topics t ON t.topic_id = e.topic_id
JOIN courses c ON c.course_id = t.course_id
JOIN exercise_answer_rules ar ON ar.exercise_id = e.exercise_id
JOIN error_categories ec
    ON ec.course_id = c.course_id
   AND ec.error_code = 'TYPE_MISMATCH'
WHERE l.learner_code = 'DEMO_LEARNER_001'
  AND c.course_code = 'PYTHON'
  AND t.topic_code = 'DATA_TYPES'
  AND ar.rule_version = 1;

-- Lithuanian: learner submits an incorrect answer.
INSERT INTO attempts (
    learner_id,
    exercise_id,
    answer_rule_id,
    submitted_answer,
    is_correct,
    error_category_id
)
SELECT
    l.learner_id,
    e.exercise_id,
    ar.answer_rule_id,
    'Aš einu į mokykla.',
    FALSE,
    ec.error_category_id
FROM learners l
CROSS JOIN exercises e
JOIN topics t ON t.topic_id = e.topic_id
JOIN courses c ON c.course_id = t.course_id
JOIN exercise_answer_rules ar ON ar.exercise_id = e.exercise_id
JOIN error_categories ec
    ON ec.course_id = c.course_id
   AND ec.error_code = 'WRONG_CASE'
WHERE l.learner_code = 'DEMO_LEARNER_001'
  AND c.course_code = 'LITHUANIAN'
  AND t.topic_code = 'NOUN_CASES'
  AND ar.rule_version = 1;

-- Generate recommendations from the stored classification.
INSERT INTO recommendations (
    attempt_id,
    recommendation_rule_id,
    explanation
)
SELECT
    a.attempt_id,
    rr.recommendation_rule_id,
    cs.content
FROM attempts a
JOIN recommendation_rules rr
    ON rr.error_category_id = a.error_category_id
JOIN content_snippets cs
    ON cs.topic_id = rr.recommended_topic_id
   AND cs.is_approved = TRUE
WHERE a.is_correct = FALSE
  AND NOT EXISTS (
      SELECT 1
      FROM recommendations r
      WHERE r.attempt_id = a.attempt_id
        AND r.recommendation_rule_id = rr.recommendation_rule_id
  );

COMMIT;
