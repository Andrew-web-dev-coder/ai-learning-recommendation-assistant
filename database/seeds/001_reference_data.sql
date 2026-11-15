
BEGIN;

-- 1. Courses
INSERT INTO courses (course_code, title, description)
VALUES
('PYTHON', 'Introduction to Python', 'Python fundamentals for beginners'),
('LITHUANIAN', 'Lithuanian Grammar', 'Selected Lithuanian grammar topics');

-- 2. Topics
INSERT INTO topics (course_id, topic_code, title, position)
SELECT course_id, 'DATA_TYPES', 'Data Types', 1
FROM courses WHERE course_code = 'PYTHON';

INSERT INTO topics (course_id, topic_code, title, position)
SELECT course_id, 'TYPE_CONVERSION', 'Type Conversion', 2
FROM courses WHERE course_code = 'PYTHON';

INSERT INTO topics (course_id, topic_code, title, position)
SELECT course_id, 'NOUN_CASES', 'Lithuanian Noun Cases', 1
FROM courses WHERE course_code = 'LITHUANIAN';

INSERT INTO topics (course_id, topic_code, title, position)
SELECT course_id, 'ACCUSATIVE', 'Accusative Case', 2
FROM courses WHERE course_code = 'LITHUANIAN';

-- 3. Topic prerequisites
INSERT INTO topic_prerequisites (topic_id, prerequisite_topic_id)
SELECT target.topic_id, prerequisite.topic_id
FROM topics target
JOIN topics prerequisite ON target.course_id = prerequisite.course_id
WHERE target.topic_code = 'TYPE_CONVERSION'
  AND prerequisite.topic_code = 'DATA_TYPES';

INSERT INTO topic_prerequisites (topic_id, prerequisite_topic_id)
SELECT target.topic_id, prerequisite.topic_id
FROM topics target
JOIN topics prerequisite ON target.course_id = prerequisite.course_id
WHERE target.topic_code = 'ACCUSATIVE'
  AND prerequisite.topic_code = 'NOUN_CASES';

-- 4. Approved learning content
INSERT INTO content_snippets (topic_id, content, is_approved)
SELECT topic_id,
       'Python strings and integers are different types. Convert values explicitly when appropriate.',
       TRUE
FROM topics WHERE topic_code = 'TYPE_CONVERSION';

INSERT INTO content_snippets (topic_id, content, is_approved)
SELECT topic_id,
       'The Lithuanian preposition į indicating direction requires the accusative case: į mokyklą.',
       TRUE
FROM topics WHERE topic_code = 'ACCUSATIVE';

-- 5. Diagnostic exercises
INSERT INTO exercises (topic_id, prompt, exercise_type)
SELECT topic_id,
       'Explain why age = "18" followed by age >= 18 causes an error.',
       'code'
FROM topics WHERE topic_code = 'DATA_TYPES';

INSERT INTO exercises (topic_id, prompt, exercise_type)
SELECT topic_id,
       'Identify the grammatical error in: Aš einu į mokykla.',
       'text'
FROM topics WHERE topic_code = 'NOUN_CASES';

-- 6. Error categories
INSERT INTO error_categories (course_id, error_code, description)
SELECT course_id, 'TYPE_MISMATCH',
       'Comparison between incompatible Python types'
FROM courses WHERE course_code = 'PYTHON';

INSERT INTO error_categories (course_id, error_code, description)
SELECT course_id, 'WRONG_CASE',
       'Incorrect Lithuanian noun case after a preposition'
FROM courses WHERE course_code = 'LITHUANIAN';

-- 7. Answer rules
INSERT INTO exercise_answer_rules
    (exercise_id, rule_version, expected_answer, error_category_id)
SELECT e.exercise_id, 1,
       'A string cannot be directly compared with an integer using >= in Python 3.',
       ec.error_category_id
FROM exercises e
JOIN topics t ON e.topic_id = t.topic_id
JOIN error_categories ec ON ec.error_code = 'TYPE_MISMATCH'
WHERE t.topic_code = 'DATA_TYPES';

INSERT INTO exercise_answer_rules
    (exercise_id, rule_version, expected_answer, error_category_id)
SELECT e.exercise_id, 1,
       'The correct form is mokyklą because į requires the accusative case for direction.',
       ec.error_category_id
FROM exercises e
JOIN topics t ON e.topic_id = t.topic_id
JOIN error_categories ec ON ec.error_code = 'WRONG_CASE'
WHERE t.topic_code = 'NOUN_CASES';

-- 8. Recommendation rules
INSERT INTO recommendation_rules
    (error_category_id, recommended_topic_id, priority)
SELECT ec.error_category_id, t.topic_id, 1
FROM error_categories ec
JOIN courses c ON ec.course_id = c.course_id
JOIN topics t ON t.course_id = c.course_id
WHERE ec.error_code = 'TYPE_MISMATCH'
  AND t.topic_code = 'TYPE_CONVERSION';

INSERT INTO recommendation_rules
    (error_category_id, recommended_topic_id, priority)
SELECT ec.error_category_id, t.topic_id, 1
FROM error_categories ec
JOIN courses c ON ec.course_id = c.course_id
JOIN topics t ON t.course_id = c.course_id
WHERE ec.error_code = 'WRONG_CASE'
  AND t.topic_code = 'ACCUSATIVE';

-- 9. Demo learner
INSERT INTO learners (learner_code)
VALUES ('DEMO_LEARNER_001');

COMMIT;
