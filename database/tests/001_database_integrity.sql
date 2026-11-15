
-- Database integrity smoke tests
-- AI Learning Recommendation Assistant

BEGIN;

DO $$
DECLARE
    actual_count INTEGER;
    invalid_fk_count INTEGER;
BEGIN
    -- Test 1: Two learning courses
    SELECT COUNT(*) INTO actual_count FROM courses;

    IF actual_count <> 2 THEN
        RAISE EXCEPTION
            'FAIL: Expected 2 courses, found %',
            actual_count;
    END IF;

    RAISE NOTICE 'PASS: Courses';

    -- Test 2: Four learning topics
    SELECT COUNT(*) INTO actual_count FROM topics;

    IF actual_count <> 4 THEN
        RAISE EXCEPTION
            'FAIL: Expected 4 topics, found %',
            actual_count;
    END IF;

    RAISE NOTICE 'PASS: Topics';

    -- Test 3: Two demo attempts
    SELECT COUNT(*) INTO actual_count FROM attempts;

    IF actual_count <> 2 THEN
        RAISE EXCEPTION
            'FAIL: Expected 2 attempts, found %',
            actual_count;
    END IF;

    RAISE NOTICE 'PASS: Attempts';

    -- Test 4: Two recommendations
    SELECT COUNT(*) INTO actual_count
    FROM recommendations;

    IF actual_count <> 2 THEN
        RAISE EXCEPTION
            'FAIL: Expected 2 recommendations, found %',
            actual_count;
    END IF;

    RAISE NOTICE 'PASS: Recommendations';

    -- Test 5: Foreign key validation
    SELECT COUNT(*) INTO invalid_fk_count
    FROM pg_constraint
    WHERE contype = 'f'
      AND connamespace = 'public'::regnamespace
      AND NOT convalidated;

    IF invalid_fk_count > 0 THEN
        RAISE EXCEPTION
            'FAIL: % foreign keys are not validated',
            invalid_fk_count;
    END IF;

    RAISE NOTICE 'PASS: Foreign keys validated';

    RAISE NOTICE 'ALL DATABASE TESTS PASSED';
END $$;

ROLLBACK;
