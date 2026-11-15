
-- Verify deterministic recommendation rules

BEGIN;

DO $$
DECLARE
    actual_count INTEGER;
BEGIN
    -- Python: type mismatch -> type conversion
    SELECT COUNT(*)
    INTO actual_count
    FROM recommendation_rules rr
    JOIN error_categories ec
      ON ec.error_category_id = rr.error_category_id
    JOIN topics t
      ON t.topic_id = rr.recommended_topic_id
    JOIN courses c
      ON c.course_id = t.course_id
    WHERE c.course_code = 'PYTHON'
      AND ec.error_code = 'TYPE_MISMATCH'
      AND t.title = 'Type Conversion';

    IF actual_count <> 1 THEN
        RAISE EXCEPTION
            'FAIL: Python recommendation, matches: %',
            actual_count;
    END IF;

    RAISE NOTICE 'PASS: Python recommendation';

    -- Lithuanian: wrong case -> accusative case
    SELECT COUNT(*)
    INTO actual_count
    FROM recommendation_rules rr
    JOIN error_categories ec
      ON ec.error_category_id = rr.error_category_id
    JOIN topics t
      ON t.topic_id = rr.recommended_topic_id
    JOIN courses c
      ON c.course_id = t.course_id
    WHERE c.course_code = 'LITHUANIAN'
      AND ec.error_code = 'WRONG_CASE'
      AND t.title = 'Accusative Case';

    IF actual_count <> 1 THEN
        RAISE EXCEPTION
            'FAIL: Lithuanian recommendation, matches: %',
            actual_count;
    END IF;

    RAISE NOTICE 'PASS: Lithuanian recommendation';
    RAISE NOTICE 'ALL RECOMMENDATION TESTS PASSED';
END $$;

ROLLBACK;
